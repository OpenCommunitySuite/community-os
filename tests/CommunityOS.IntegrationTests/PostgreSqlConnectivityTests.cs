using CommunityOS.Modules.Platform.Application;
using CommunityOS.Modules.Platform.Infrastructure;
using CommunityOS.Modules.Community.Application.Register;
using CommunityOS.Modules.Community.Application.Electricity;
using CommunityOS.Modules.Community.Infrastructure;
using Npgsql;
using Testcontainers.PostgreSql;
using Xunit;

namespace CommunityOS.IntegrationTests;

public class PostgreSqlConnectivityTests : IAsyncLifetime
{
    private const string PostgreSqlImage =
        "postgres:18.6@sha256:7341002d2b8c7c5bdd7542a671a95b36196c0b5b888daf454ae4fc33ba5346d7";

    private readonly PostgreSqlContainer _postgres = new PostgreSqlBuilder(PostgreSqlImage).Build();

    public ValueTask InitializeAsync() => new(_postgres.StartAsync());

    public ValueTask DisposeAsync() => new(_postgres.DisposeAsync().AsTask());

    [Fact]
    public async Task Electricity_recognition_serializes_same_day_and_keeps_installations_scoped()
    {
        var token = TestContext.Current.CancellationToken;
        await using var source = NpgsqlDataSource.Create(_postgres.GetConnectionString());
        foreach (var file in new[] { "001_manual_register.sql", "002_ownership_correction.sql",
                     "009_electricity_readings.sql", "010_electricity_replacement.sql", "011_electricity_register_channels.sql",
                     "012_common_electricity_points.sql" })
        {
            var sql = await File.ReadAllTextAsync(Path.Combine(AppContext.BaseDirectory, file), token);
            await using var migration = source.CreateCommand(sql);
            await migration.ExecuteNonQueryAsync(token);
        }

        var community = Guid.NewGuid();
        var foreign = Guid.NewGuid();
        var register = new ManualRegister(new PostgresRegisterStore(source));
        await register.CreateAsync(community, null, "Synthetic owner", "01", "001", token);
        var plot = Assert.Single(await register.ListAsync(community, token));
        var store = new PostgresElectricityStore(source);
        var starts = new DateOnly(2026, 1, 1);
        var today = starts.AddDays(30);
        var account = Guid.NewGuid();
        var subject = Guid.NewGuid();
        ElectricityActor Actor() => new(account, subject, Guid.NewGuid(), "synthetic");
        Assert.Equal(ElectricitySetupOutcome.MissingPlot, await store.SetupAsync(foreign, plot.PlotId, "M1", starts, Actor(), token));
        Assert.Equal(ElectricitySetupOutcome.Created, await store.SetupAsync(community, plot.PlotId, "M1", starts, Actor(), token));
        Assert.Equal(ElectricitySetupOutcome.Conflict, await store.SetupAsync(community, plot.PlotId, "M2", starts, Actor(), token));
        var installation = Assert.IsType<ElectricityInstallation>(Assert.Single(await store.ListPlotsAsync(community, token)).Installation);
        Assert.Null(await store.SeriesAsync(foreign, installation.Id, token));
        Assert.Equal(ReadingOutcome.NotFound, (await store.RecognizeAsync(foreign, installation.Id,
            starts, 1m, today, Actor(), token)).Outcome);
        var replies = await Task.WhenAll(Enumerable.Range(0, 2).Select(_ =>
            store.RecognizeAsync(community, installation.Id, starts, 10m, today, Actor(), token)));
        Assert.Contains(replies, reply => reply.Outcome == ReadingOutcome.Recognized);
        Assert.Contains(replies, reply => reply.Outcome == ReadingOutcome.AlreadyRecorded);
        Assert.Equal(replies[0].ReadingId, replies[1].ReadingId);
        Assert.Empty(Assert.IsType<ElectricitySeries>(await store.SeriesAsync(community, installation.Id, token)).Intervals);

        Assert.Equal(ReadingOutcome.Recognized, (await store.RecognizeAsync(community, installation.Id,
            starts.AddDays(2), 12.345m, today, Actor(), token)).Outcome);
        Assert.Equal(ReadingOutcome.Decreasing, (await store.RecognizeAsync(community, installation.Id,
            starts.AddDays(1), 13m, today, Actor(), token)).Outcome);
        Assert.Equal(ReadingOutcome.Recognized, (await store.RecognizeAsync(community, installation.Id,
            starts.AddDays(1), 10m, today, Actor(), token)).Outcome);
        var series = Assert.IsType<ElectricitySeries>(await store.SeriesAsync(community, installation.Id, token));
        Assert.Equal(3, series.Readings.Count);
        Assert.Equal(new[] { 0m, 2.345m }, series.Intervals.Select(interval => interval.Value));
        Assert.All(series.Readings, reading => Assert.Equal((account, subject), (reading.AccountId, reading.SubjectId)));

        var replacement = new ElectricityReplacement(Guid.NewGuid(), installation.Id, starts.AddDays(4), "M2", "Synthetic replacement");
        Assert.Equal(ElectricityReplacementOutcome.Missing,
            (await store.ReplaceAsync(foreign, replacement, today, Actor(), token)).Outcome);
        Assert.Equal(ElectricityReplacementOutcome.ExistingReading,
            (await store.ReplaceAsync(community, replacement with { EffectiveOn = starts.AddDays(2) }, today, Actor(), token)).Outcome);
        Assert.Equal(ElectricityReplacementOutcome.Conflict,
            (await store.ReplaceAsync(community, replacement with { Designation = "M1" }, today, Actor(), token)).Outcome);
        var unchanged = Assert.Single(await store.InstallationsAsync(community, plot.PlotId, token));
        Assert.Equal(installation.Id, unchanged.Id);
        Assert.Null(unchanged.EndsBefore);

        var replacements = await Task.WhenAll(
            store.ReplaceAsync(community, replacement, today, Actor(), token),
            store.ReplaceAsync(community, replacement, today, Actor(), token));
        Assert.Contains(replacements, result => result.Outcome == ElectricityReplacementOutcome.Replaced);
        Assert.Contains(replacements, result => result.Outcome == ElectricityReplacementOutcome.Replayed);
        Assert.Equal(replacements[0].InstallationId, replacements[1].InstallationId);
        var nextId = Assert.IsType<Guid>(replacements[0].InstallationId);
        Assert.Equal(ElectricityReplacementOutcome.Conflict,
            (await store.ReplaceAsync(community, replacement with { Reason = "Different" }, today, Actor(), token)).Outcome);
        Assert.Equal(ReadingOutcome.OutsideInstallation, (await store.RecognizeAsync(community, installation.Id,
            replacement.EffectiveOn, 20m, today, Actor(), token)).Outcome);
        Assert.Equal(ReadingOutcome.Recognized, (await store.RecognizeAsync(community, nextId,
            replacement.EffectiveOn, 1m, today, Actor(), token)).Outcome);
        var history = await store.InstallationsAsync(community, plot.PlotId, token);
        Assert.Equal(new[] { nextId, installation.Id }, history.Select(entry => entry.Id));
        Assert.All(history, entry => Assert.Equal(installation.PointId, entry.PointId));
        Assert.Equal(replacement.EffectiveOn, history[1].EndsBefore);
        Assert.Equal(replacement.Reason, history[0].Replacement?.Reason);
        Assert.Empty(Assert.IsType<ElectricitySeries>(await store.SeriesAsync(community, nextId, token)).Intervals);
        Assert.Equal(3, Assert.IsType<ElectricitySeries>(await store.SeriesAsync(community, installation.Id, token)).Readings.Count);
        Assert.Equal(ReadingOutcome.Recognized, (await store.RecognizeAsync(community, installation.Id,
            starts.AddDays(3), 13m, today, Actor(), token)).Outcome);

        var boundary = starts.AddDays(5);
        var nextReplacement = new ElectricityReplacement(Guid.NewGuid(), nextId, boundary, "M3", "Concurrent replacement");
        var replaceTask = store.ReplaceAsync(community, nextReplacement, today, Actor(), token);
        var recognizeTask = store.RecognizeAsync(community, nextId, boundary, 2m, today, Actor(), token);
        Assert.Contains(((await replaceTask).Outcome, (await recognizeTask).Outcome), new[]
        {
            (ElectricityReplacementOutcome.Replaced, ReadingOutcome.OutsideInstallation),
            (ElectricityReplacementOutcome.ExistingReading, ReadingOutcome.Recognized),
        });

        await register.CreateAsync(community, null, "Synthetic dual owner", "02", "002", token);
        var dualPlot = Assert.Single(await store.ListPlotsAsync(community, token), item => item.Number == "02");
        Assert.Equal(ElectricitySetupOutcome.Created,
            await store.SetupAsync(community, dualPlot.Id, "D1", starts, Actor(), token, ManualElectricity.Dual));
        var dualId = Assert.IsType<ElectricityInstallation>(
            Assert.Single(await store.InstallationsAsync(community, dualPlot.Id, token))).Id;
        Task<ElectricityRecognition> Recognize(DateOnly date, decimal value, string channel) =>
            store.RecognizeAsync(community, dualId, date, value, today, Actor(), token, channel);
        var sameDay = await Task.WhenAll(Recognize(starts, 100, ManualElectricity.Day),
            Recognize(starts, 20, ManualElectricity.Night));
        Assert.All(sameDay, result => Assert.Equal(ReadingOutcome.Recognized, result.Outcome));
        Assert.Equal(ReadingOutcome.UnsupportedChannel, (await Recognize(starts, 120, ManualElectricity.Total)).Outcome);
        Assert.Equal(sameDay[0].ReadingId, (await Recognize(starts, 100, ManualElectricity.Day)).ReadingId);
        Assert.Equal(ReadingOutcome.DateConflict, (await Recognize(starts, 101, ManualElectricity.Day)).Outcome);
        await Recognize(starts.AddDays(2), 106, ManualElectricity.Day);
        await Recognize(starts.AddDays(2), 23, ManualElectricity.Night);
        var combined = Assert.Single((await store.SeriesAsync(community, dualId, token))!.CombinedIntervals);
        Assert.Equal(9, combined.Value);
        Assert.Equal(ReadingOutcome.Decreasing, (await Recognize(starts.AddDays(1), 107, ManualElectricity.Day)).Outcome);
        await Recognize(starts.AddDays(1), 103, ManualElectricity.Day);
        Assert.Empty((await store.SeriesAsync(community, dualId, token))!.CombinedIntervals);
        var replacementDual = await store.ReplaceAsync(community,
            new(Guid.NewGuid(), dualId, starts.AddDays(3), "D2", "Synthetic dual replacement"), today, Actor(), token);
        Assert.Equal(ElectricityReplacementOutcome.Replaced, replacementDual.Outcome);
        var newDual = (await store.InstallationsAsync(community, dualPlot.Id, token))[0];
        Assert.Equal(ManualElectricity.Dual, newDual.RegisterMode);
        Assert.Empty((await store.SeriesAsync(community, newDual.Id, token))!.Intervals);

        var common = new CommonElectricityPoint(Guid.NewGuid(), "Feeder A", "Input of branch A");
        var secondCommon = new CommonElectricityPoint(Guid.NewGuid(), "Feeder B", "Input of branch B");
        var attempts = await Task.WhenAll(
            store.SetupCommonAsync(community, common, "Common A", starts, Actor(), token, ManualElectricity.Total),
            store.SetupCommonAsync(community, common with { Id = Guid.NewGuid(), Designation = "feeder a" },
                "Other meter", starts, Actor(), token, ManualElectricity.Total));
        Assert.Contains(ElectricitySetupOutcome.Created, attempts);
        Assert.Contains(ElectricitySetupOutcome.Conflict, attempts);
        Assert.Equal(ElectricitySetupOutcome.Created,
            await store.SetupCommonAsync(community, secondCommon, "Common B", starts, Actor(), token, ManualElectricity.Total));
        var points = await store.ListCommonPointsAsync(community, token);
        Assert.Equal(2, points.Count);
        Assert.Equal(2, (await register.ListAsync(community, token)).Count);
        Assert.Empty(await store.ListCommonPointsAsync(foreign, token));
        Assert.Empty(await store.CommonInstallationsAsync(foreign, secondCommon.Id, token));
        var shared = Assert.Single(await store.CommonInstallationsAsync(community, secondCommon.Id, token));
        Assert.Empty(await store.InstallationsAsync(community, secondCommon.Id, token));
        await store.RecognizeAsync(community, shared.Id, starts, 50, today, Actor(), token);
        await store.RecognizeAsync(community, shared.Id, starts.AddDays(1), 55, today, Actor(), token);
        Assert.Equal(5m, Assert.Single((await store.SeriesAsync(community, shared.Id, token))!.Intervals).Value);
        Assert.Empty((await store.SeriesAsync(community, newDual.Id, token))!.Intervals);
    }

    [Fact]
    public async Task Can_Open_Connection_And_Execute_Trivial_Query()
    {
        var cancellationToken = TestContext.Current.CancellationToken;

        await using var connection = new NpgsqlConnection(_postgres.GetConnectionString());
        await connection.OpenAsync(cancellationToken);

        await using var command = connection.CreateCommand();
        command.CommandText = "SELECT 1";
        var result = await command.ExecuteScalarAsync(cancellationToken);

        Assert.Equal(1, result);
    }

    [Fact]
    public async Task Manual_Register_Reuses_Owner_And_Rolls_Back_Conflicting_Account()
    {
        var cancellationToken = TestContext.Current.CancellationToken;
        await using var source = NpgsqlDataSource.Create(_postgres.GetConnectionString());
        var migration = await File.ReadAllTextAsync(
            Path.Combine(AppContext.BaseDirectory, "001_manual_register.sql"), cancellationToken);
        await using var setup = source.CreateCommand(migration);
        await setup.ExecuteNonQueryAsync(cancellationToken);

        var register = new ManualRegister(new PostgresRegisterStore(source));
        var community = Guid.CreateVersion7();
        var otherCommunity = Guid.CreateVersion7();
        var owner = await register.CreateAsync(community, null, "Pilot owner", "1", "A-1", cancellationToken);
        Assert.Equal(owner, await register.CreateAsync(community, owner, null, "2", "A-2", cancellationToken));

        var conflict = await Assert.ThrowsAsync<PostgresException>(
            () => register.CreateAsync(community, null, "Rolled back", "3", "A-2", cancellationToken));
        Assert.Equal(PostgresErrorCodes.UniqueViolation, conflict.SqlState);
        var foreignOwner = await Assert.ThrowsAsync<PostgresException>(
            () => register.CreateAsync(otherCommunity, owner, null, "1", "A-1", cancellationToken));
        Assert.Equal(PostgresErrorCodes.ForeignKeyViolation, foreignOwner.SqlState);

        var correctionMigration = await File.ReadAllTextAsync(
            Path.Combine(AppContext.BaseDirectory, "002_ownership_correction.sql"), cancellationToken);
        await using var upgrade = source.CreateCommand(correctionMigration);
        await upgrade.ExecuteNonQueryAsync(cancellationToken);

        var entries = await register.ListAsync(community, cancellationToken);
        Assert.Collection(entries,
            first => Assert.Equal((owner, "1", "A-1"), (first.OwnerId, first.PlotNumber, first.AccountNumber)),
            second => Assert.Equal((owner, "2", "A-2"), (second.OwnerId, second.PlotNumber, second.AccountNumber)));
        Assert.Empty(await register.ListAsync(otherCommunity, cancellationToken));
        await using var count = source.CreateCommand("SELECT count(*) FROM community_register.subject");
        Assert.Equal(1L, await count.ExecuteScalarAsync(cancellationToken));

        var plot = entries[0];
        var correctOwner = await register.CreateAsync(community, null, "Correct owner", "3", "A-3", cancellationToken);
        var foreignSubject = await register.CreateAsync(otherCommunity, null, "Foreign owner", "1", "A-1", cancellationToken);
        var wrongCommunity = await Assert.ThrowsAsync<PostgresException>(() => register.CorrectOwnerAsync(
            community, plot.PlotId, plot.OwnershipRevision, foreignSubject, "Test", cancellationToken));
        Assert.Equal(PostgresErrorCodes.ForeignKeyViolation, wrongCommunity.SqlState);

        Assert.True(await register.CorrectOwnerAsync(community, plot.PlotId, plot.OwnershipRevision,
            correctOwner, "Incorrect initial entry", cancellationToken));
        Assert.False(await register.CorrectOwnerAsync(community, plot.PlotId, plot.OwnershipRevision,
            owner, "Stale command", cancellationToken));

        var corrected = (await register.ListAsync(community, cancellationToken))[0];
        Assert.Equal(correctOwner, corrected.OwnerId);
        Assert.Equal(plot.AccountNumber, corrected.AccountNumber);
        Assert.NotEqual(plot.OwnershipRevision, corrected.OwnershipRevision);
        await using var history = source.CreateCommand("""
            SELECT previous_subject_id, corrected_subject_id, reason
            FROM community_register.ownership_correction
            """);
        await using var reader = await history.ExecuteReaderAsync(cancellationToken);
        Assert.True(await reader.ReadAsync(cancellationToken));
        Assert.Equal((owner, correctOwner, "Incorrect initial entry"),
            (reader.GetGuid(0), reader.GetGuid(1), reader.GetString(2)));
        Assert.False(await reader.ReadAsync(cancellationToken));
    }


    [Fact]
    public async Task Confirmed_Import_Is_Atomic_And_Replay_Safe()
    {
        var token = TestContext.Current.CancellationToken;
        await using var source = NpgsqlDataSource.Create(_postgres.GetConnectionString());
        foreach (var file in new[] { "001_manual_register.sql", "002_ownership_correction.sql", "003_register_import.sql", "004_register_community_scope.sql" })
        {
            var sql = await File.ReadAllTextAsync(Path.Combine(AppContext.BaseDirectory, file), token);
            await using var migration = source.CreateCommand(sql);
            await migration.ExecuteNonQueryAsync(token);
        }

        await using var permissions = source.CreateCommand("""
            CREATE ROLE register_test_runtime NOSUPERUSER NOBYPASSRLS;
            GRANT USAGE ON SCHEMA community_register TO register_test_runtime;
            GRANT SELECT, INSERT ON ALL TABLES IN SCHEMA community_register TO register_test_runtime;
            GRANT UPDATE (subject_id, revision) ON community_register.ownership TO register_test_runtime;
            """);
        await permissions.ExecuteNonQueryAsync(token);

        var runtimeConnection = new NpgsqlConnectionStringBuilder(_postgres.GetConnectionString())
        {
            Options = "-c role=register_test_runtime",
            MaxPoolSize = 1,
            NoResetOnClose = true,
        };
        await using var runtime = NpgsqlDataSource.Create(runtimeConnection.ConnectionString);
        await using var concurrentRuntime = NpgsqlDataSource.Create(runtimeConnection.ConnectionString);
        var store = new PostgresRegisterStore(runtime);
        var concurrentStore = new PostgresRegisterStore(concurrentRuntime);
        var community = Guid.CreateVersion7();
        var plan = RegisterImportPlan.Create(community,
            [new(2, "1", "S-1", "Pilot owner", "0001"), new(3, "2", "S-1", "Pilot owner", "0002")]);
        Assert.True(plan.Preview([]).CanProceed);
        var results = await Task.WhenAll(store.ApplyImportAsync(plan, "operator", token),
            concurrentStore.ApplyImportAsync(plan, "operator", token));
        Assert.Contains(RegisterImportResult.Applied, results);
        Assert.Contains(RegisterImportResult.AlreadyApplied, results);
        var entries = await store.ListAsync(community, token);
        Assert.Equal(2, entries.Count);
        Assert.Equal(entries[0].OwnerId, entries[1].OwnerId);
        Assert.Equal("0001", entries[0].AccountNumber);

        var receipt = Assert.IsType<RegisterImportReceipt>(
            await store.FindImportReceiptAsync(community, plan.Id, token));
        Assert.Equal("operator", receipt.ConfirmedBy);
        Assert.Equal(DateTimeKind.Utc, receipt.RecordedAtUtc.Kind);
        Assert.Collection(receipt.Items,
            item => Assert.Equal((2, entries[0].PlotId, entries[0].OwnerId, "0001"),
                (item.SourceRow, item.PlotId, item.ImportedSubjectId, item.AccountNumber)),
            item => Assert.Equal((3, entries[1].PlotId, entries[1].OwnerId, "0002"),
                (item.SourceRow, item.PlotId, item.ImportedSubjectId, item.AccountNumber)));
        Assert.NotEqual(receipt.Items[0].AccountId, receipt.Items[1].AccountId);
        Assert.Null(await store.FindImportReceiptAsync(Guid.CreateVersion7(), plan.Id, token));

        var conflicting = RegisterImportPlan.Create(community,
            [new(2, "3", "S-2", "Other", "0003"), new(3, "4", "S-2", "Other", "0002")]);
        Assert.True(conflicting.Preview([]).CanProceed);
        Assert.Equal(RegisterImportResult.Conflicts, await store.ApplyImportAsync(conflicting, "operator", token));
        Assert.Equal(2, (await store.ListAsync(community, token)).Count);
        Assert.Null(await store.FindImportReceiptAsync(community, conflicting.Id, token));
        await using var count = source.CreateCommand("SELECT count(*) FROM community_register.register_import_item");
        Assert.Equal(2L, await count.ExecuteScalarAsync(token));

        await using var connection = await runtime.OpenConnectionAsync(token);
        await using var role = new NpgsqlCommand("SELECT current_user", connection);
        Assert.Equal("register_test_runtime", await role.ExecuteScalarAsync(token));
        await using var unscoped = new NpgsqlCommand("SELECT count(*) FROM community_register.register_import_item", connection);
        Assert.Equal(0L, await unscoped.ExecuteScalarAsync(token));
        await using var transaction = await connection.BeginTransactionAsync(token);
        await using var scope = new NpgsqlCommand(
            "SELECT set_config('community_os.community_id', @scope, true);", connection, transaction);
        scope.Parameters.AddWithValue("scope", Guid.CreateVersion7().ToString("D"));
        await scope.ExecuteNonQueryAsync(token);
        Assert.Equal(0L, await unscoped.ExecuteScalarAsync(token));

        await using var wrongCommunity = new NpgsqlCommand("""
            INSERT INTO community_register.subject (community_id, id, display_name)
            VALUES (@community, uuidv7(), 'Cross-scope attempt');
            """, connection, transaction);
        wrongCommunity.Parameters.AddWithValue("community", community);
        var rejected = await Assert.ThrowsAsync<PostgresException>(() => wrongCommunity.ExecuteNonQueryAsync(token));
        Assert.Equal(PostgresErrorCodes.InsufficientPrivilege, rejected.SqlState);
        await transaction.RollbackAsync(token);
        Assert.Equal(0L, await unscoped.ExecuteScalarAsync(token));
    }

    [Fact]
    public async Task Community_Reservation_Replays_Only_The_Same_Creator_And_Request()
    {
        var token = TestContext.Current.CancellationToken;
        await using var source = NpgsqlDataSource.Create(_postgres.GetConnectionString());
        var sql = await File.ReadAllTextAsync(Path.Combine(AppContext.BaseDirectory, "001_community_reservation.sql"), token);
        await using var migration = source.CreateCommand(sql);
        await migration.ExecuteNonQueryAsync(token);
        var provisioning = new CommunityProvisioning(new PostgresCommunityReservationStore(source));
        var creator = Guid.CreateVersion7();
        var administrator = Guid.CreateVersion7();
        var request = Guid.CreateVersion7();

        var results = await Task.WhenAll(
            provisioning.ReserveAsync(creator, request, administrator, "Test community", token),
            provisioning.ReserveAsync(creator, request, administrator, "Test community", token));
        var first = Assert.IsType<CommunityReservation>(results[0]);
        Assert.Equal(first, results[1]);
        Assert.NotEqual(Guid.Empty, first.CommunityId);
        Assert.NotEqual(Guid.Empty, first.OperationId);

        Assert.Null(await provisioning.ReserveAsync(creator, request, Guid.CreateVersion7(), "Test community", token));
        Assert.Null(await provisioning.ReserveAsync(creator, request, administrator, "Different community", token));
        var separate = Assert.IsType<CommunityReservation>(
            await provisioning.ReserveAsync(Guid.CreateVersion7(), request, administrator, "Test community", token));
        Assert.NotEqual(first.CommunityId, separate.CommunityId);

        await using var count = source.CreateCommand("SELECT count(*) FROM platform_provisioning.community_reservation");
        Assert.Equal(2L, await count.ExecuteScalarAsync(token));
    }

    [Fact]
    public async Task Bootstrap_Administrator_Resumes_Without_Reinstating_A_Revoked_Assignment()
    {
        var token = TestContext.Current.CancellationToken;
        await using var source = NpgsqlDataSource.Create(_postgres.GetConnectionString());
        foreach (var file in new[] { "001_community_reservation.sql", "002_bootstrap_administrator.sql", "003_bootstrap_security_event.sql" })
        {
            var sql = await File.ReadAllTextAsync(Path.Combine(AppContext.BaseDirectory, file), token);
            await using var migration = source.CreateCommand(sql);
            await migration.ExecuteNonQueryAsync(token);
        }

        var provisioning = new CommunityProvisioning(new PostgresCommunityReservationStore(source));
        var administrator = Guid.CreateVersion7();
        var reservation = Assert.IsType<CommunityReservation>(await provisioning.ReserveAsync(
            Guid.CreateVersion7(), Guid.CreateVersion7(), administrator, "Test community", token));
        var bootstrap = new BootstrapAdministrator(new PostgresBootstrapAdministratorStore(source));
        Assert.Null(await bootstrap.AssignAsync(Guid.CreateVersion7(), token));
        var attempts = await Task.WhenAll(bootstrap.AssignAsync(reservation.OperationId, token),
            bootstrap.AssignAsync(reservation.OperationId, token));
        var granted = Assert.IsType<BootstrapAdministratorAssignment>(attempts[0]);
        Assert.Equal(granted, attempts[1]);
        Assert.Equal(reservation.CommunityId, granted.CommunityId);
        Assert.Equal(administrator, granted.AdministratorAccountId);
        Assert.Null(granted.RevokedAtUtc);

        var revoker = Guid.CreateVersion7();
        Assert.False(await bootstrap.RevokeAsync(Guid.CreateVersion7(), reservation.OperationId, revoker, token));
        Assert.True(await bootstrap.RevokeAsync(reservation.CommunityId, reservation.OperationId, revoker, token));
        Assert.False(await bootstrap.RevokeAsync(reservation.CommunityId, reservation.OperationId, Guid.CreateVersion7(), token));
        var replay = Assert.IsType<BootstrapAdministratorAssignment>(
            await bootstrap.AssignAsync(reservation.OperationId, token));
        Assert.Equal(granted.GrantedAtUtc, replay.GrantedAtUtc);
        Assert.NotNull(replay.RevokedAtUtc);
        await using var revokedBy = source.CreateCommand(
            "SELECT revoked_by_account_id FROM platform_provisioning.bootstrap_administrator");
        Assert.Equal(revoker, await revokedBy.ExecuteScalarAsync(token));
        await using var audit = source.CreateCommand("""
            SELECT event_kind, operation_id, community_id, administrator_account_id, initiating_account_id, recorded_at
            FROM platform_provisioning.bootstrap_security_event
            ORDER BY event_kind;
            """);
        await using var reader = await audit.ExecuteReaderAsync(token);
        Assert.True(await reader.ReadAsync(token));
        Assert.Equal("granted", reader.GetString(0));
        Assert.Equal(reservation.OperationId, reader.GetGuid(1));
        Assert.Equal(reservation.CommunityId, reader.GetGuid(2));
        Assert.Equal(administrator, reader.GetGuid(3));
        Assert.Equal(reservation.CreatorAccountId, reader.GetGuid(4));
        Assert.Equal(granted.GrantedAtUtc, reader.GetDateTime(5));
        Assert.True(await reader.ReadAsync(token));
        Assert.Equal("revoked", reader.GetString(0));
        Assert.Equal(reservation.OperationId, reader.GetGuid(1));
        Assert.Equal(reservation.CommunityId, reader.GetGuid(2));
        Assert.Equal(administrator, reader.GetGuid(3));
        Assert.Equal(revoker, reader.GetGuid(4));
        Assert.Equal(replay.RevokedAtUtc, reader.GetDateTime(5));
        Assert.False(await reader.ReadAsync(token));
    }

    [Fact]
    public async Task Approved_Import_Rejects_Stale_Revision_And_Applies_Once()
    {
        var token = TestContext.Current.CancellationToken;
        await using var source = NpgsqlDataSource.Create(_postgres.GetConnectionString());
        foreach (var file in new[] { "001_manual_register.sql", "002_ownership_correction.sql",
                     "003_register_import.sql", "004_register_community_scope.sql",
                     "006_register_import_draft.sql", "007_register_import_approval.sql",
                     "008_ownership_correction_attribution.sql" })
        {
            var sql = await File.ReadAllTextAsync(Path.Combine(AppContext.BaseDirectory, file), token);
            await using var migration = source.CreateCommand(sql);
            await migration.ExecuteNonQueryAsync(token);
        }

        var drafts = new PostgresImportDraftStore(source);
        var approvals = new PostgresImportApprovalStore(source);
        var owner = new ImportDraftOwner(Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid());
        RegisterImportRow[] rows = [new(2, "01", "", "Source owner", "001", true),
            new(3, "02", "", "Source owner", "002", true)];
        RegisterOwnerDecision[] decisions = [new(2, "explicit", "Verified"), new(3, "explicit", "Verified")];
        var plan = RegisterImportPlan.Create(owner.Community, RegisterImportDraft.Resolve(rows, decisions), rows);
        var draftId = await drafts.CreateAsync(owner, new byte[32], rows, token);
        Assert.True(await drafts.SaveAsync(owner, draftId, 1, decisions, token));
        var key = new ImportSubmissionKey(draftId, 2, plan.Id);
        var preparer = new ImportApprovalActor(owner.Account, owner.Subject, Guid.NewGuid(), null);
        var approver = new ImportApprovalActor(Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid(), "synthetic-test");
        Assert.True(await approvals.SubmitAsync(owner.Community, key, preparer, token));
        Assert.True(await drafts.SaveAsync(owner, draftId, 2, decisions, token));
        Assert.Equal(ImportApprovalResult.Stale, await approvals.ApplyAsync(owner.Community, key, approver, token));
        Assert.Null(await approvals.ReceiptAsync(owner.Community, key, token));

        key = key with { Revision = 3 };
        Assert.True(await approvals.SubmitAsync(owner.Community, key, preparer with { AdmissionId = Guid.NewGuid() }, token));
        var results = await Task.WhenAll(
            approvals.ApplyAsync(owner.Community, key, approver with { AdmissionId = Guid.NewGuid() }, token),
            approvals.ApplyAsync(owner.Community, key, approver with { AdmissionId = Guid.NewGuid() }, token));
        Assert.Contains(ImportApprovalResult.Applied, results);
        Assert.Contains(ImportApprovalResult.Replayed, results);
        var receipt = Assert.IsType<RegisterImportReceipt>(await approvals.ReceiptAsync(owner.Community, key, token));
        Assert.Equal(approver.AccountId.ToString(), receipt.ConfirmedBy);
        Assert.Equal(new[] { "001", "002" }, receipt.Items.Select(item => item.AccountNumber));
        Assert.Single(receipt.Items.Select(item => item.ImportedSubjectId).Distinct());
        Assert.Null(await approvals.ReceiptAsync(Guid.NewGuid(), key, token));

        var register = new ManualRegister(new PostgresRegisterStore(source));
        var correctionStore = new PostgresOwnershipCorrectionStore(source);
        var correctedPlot = receipt.Items[0].PlotId;
        var imported = Assert.Single(await register.ListAsync(owner.Community, token), entry => entry.PlotId == correctedPlot);
        var newOwner = await register.CreateAsync(owner.Community, null, "Other owner", "03", "003", token);
        var foreignOwner = await register.CreateAsync(Guid.NewGuid(), null, "Foreign owner", "01", "001", token);
        var correction = new OwnershipCorrection(correctedPlot, imported.OwnershipRevision, newOwner, "Wrong initial link");
        var corrector = new OwnershipCorrectionActor(Guid.NewGuid(), owner.Account, owner.Subject, "synthetic-correction");
        Assert.Equal(OwnershipCorrectionResult.InvalidOwner, await correctionStore.CorrectAsync(owner.Community,
            correction with { OwnerId = foreignOwner }, corrector, token));
        Assert.Equal(OwnershipCorrectionResult.Unchanged, await correctionStore.CorrectAsync(owner.Community,
            correction with { OwnerId = imported.OwnerId }, corrector with { AdmissionId = Guid.NewGuid() }, token));
        var corrections = await Task.WhenAll(
            correctionStore.CorrectAsync(owner.Community, correction, corrector with { AdmissionId = Guid.NewGuid() }, token),
            correctionStore.CorrectAsync(owner.Community, correction, corrector with { AdmissionId = Guid.NewGuid() }, token));
        Assert.Contains(OwnershipCorrectionResult.Corrected, corrections);
        Assert.Contains(OwnershipCorrectionResult.Stale, corrections);
        var history = Assert.Single(await correctionStore.HistoryAsync(owner.Community, correctedPlot, token));
        Assert.Equal((imported.OwnerId, newOwner, correction.Reason), (history.PreviousOwnerId, history.CorrectedOwnerId, history.Reason));
        Assert.Equal(corrector.AccountId, history.AccountId);
        Assert.Equal(corrector.SubjectId, history.SubjectId);
        Assert.Empty(await correctionStore.HistoryAsync(Guid.NewGuid(), correctedPlot, token));
        var corrected = Assert.Single(await register.ListAsync(owner.Community, token), entry => entry.PlotId == correctedPlot);
        Assert.Equal(newOwner, corrected.OwnerId);
        Assert.Equal(imported.AccountNumber, corrected.AccountNumber);
        var after = Assert.IsType<RegisterImportReceipt>(await approvals.ReceiptAsync(owner.Community, key, token));
        Assert.Equal(receipt.Items, after.Items);
    }

    [Fact]
    public async Task Import_Draft_Is_Private_To_Community_Account_And_Subject_And_Requires_Current_Revision()
    {
        var token = TestContext.Current.CancellationToken;
        await using var source = NpgsqlDataSource.Create(_postgres.GetConnectionString());
        await using var schema = source.CreateCommand("CREATE SCHEMA community_register;");
        await schema.ExecuteNonQueryAsync(token);
        await using var migration = source.CreateCommand(await File.ReadAllTextAsync(
            Path.Combine(AppContext.BaseDirectory, "006_register_import_draft.sql"), token));
        await migration.ExecuteNonQueryAsync(token);

        var store = new PostgresImportDraftStore(source);
        var owner = new ImportDraftOwner(Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid());
        var id = await store.CreateAsync(owner, new byte[32],
            [new(7, "0001", "", "Source owner", "00009", true)], token);
        RegisterOwnerDecision[] decisions = [new(7, "explicit-owner", "Confirmed owner")];
        Assert.True(await store.SaveAsync(owner, id, 1, decisions, token));
        Assert.False(await store.SaveAsync(owner, id, 1, [], token));
        var draft = Assert.IsType<ImportDraft>(await store.ReadAsync(owner, id, token));
        Assert.Equal(2, draft.Revision);
        Assert.Equal("00009", Assert.Single(draft.Source).AccountNumber);
        Assert.Equal(decisions[0], Assert.Single(draft.Decisions));
        Assert.Equal(id, Assert.Single(await store.ListAsync(owner, token)).Id);

        foreach (var outsider in new[] { owner with { Community = Guid.NewGuid() },
                     owner with { Account = Guid.NewGuid() }, owner with { Subject = Guid.NewGuid() } })
        {
            Assert.Empty(await store.ListAsync(outsider, token));
            Assert.Null(await store.ReadAsync(outsider, id, token));
            Assert.False(await store.SaveAsync(outsider, id, 2, [], token));
        }
    }

    [Fact]
    public async Task Register_Admission_Is_Durable_Before_Execution_And_Revocation_Blocks_New_Writes()
    {
        var token = TestContext.Current.CancellationToken;
        await using var source = NpgsqlDataSource.Create(_postgres.GetConnectionString());
        foreach (var file in new[] { "001_community_reservation.sql", "005_platform_authentication.sql",
                     "009_register_access.sql", "010_register_import_preparation.sql", "011_register_import_approval.sql",
                     "012_ownership_correction_access.sql", "013_electricity_access.sql", "014_electricity_replacement_access.sql",
                     "015_electricity_register_admission.sql", "016_common_electricity_access.sql" })
        {
            var sql = await File.ReadAllTextAsync(Path.Combine(AppContext.BaseDirectory, file), token);
            await using var migration = source.CreateCommand(sql);
            await migration.ExecuteNonQueryAsync(token);
        }

        var accounts = new PlatformAuthenticationStore(source);
        var actor = await accounts.AddAccountAsync("register-operator", Guid.NewGuid().ToString("N"), false, token);
        var credential = Assert.IsType<PlatformCredential>(await accounts.FindCredentialAsync("register-operator", token));
        var session = Assert.IsType<string>(await accounts.StartSessionAsync(credential, token));
        var community = Guid.NewGuid();
        var subject = Guid.NewGuid();
        await using var seed = source.CreateCommand("""
            INSERT INTO platform_provisioning.community_reservation
                (operation_id, community_id, creator_account_id, request_id, initial_administrator_account_id, display_name)
                VALUES (gen_random_uuid(), @community, @actor, gen_random_uuid(), @actor, 'Test');
            INSERT INTO platform_provisioning.register_availability (community_id, community_active, register_enabled)
                VALUES (@community, true, true);
            INSERT INTO platform_provisioning.register_operator
                (community_id, account_id, subject_id, linked, can_read, can_add, addition_basis)
                VALUES (@community, @actor, @subject, true, true, true, 'synthetic');
            """);
        seed.Parameters.AddWithValue("community", community);
        seed.Parameters.AddWithValue("actor", actor);
        seed.Parameters.AddWithValue("subject", subject);
        await seed.ExecuteNonQueryAsync(token);
        var access = new RegisterAccessStore(source);

        Assert.True(await access.WithAccessAsync(session, community, true, async admitted =>
        {
            Assert.Equal((actor, subject, "synthetic"), (admitted.AccountId, admitted.SubjectId, admitted.AdditionBasis));
            await using var committed = source.CreateCommand("""
                SELECT count(*) FROM platform_provisioning.register_addition_admission WHERE id = @id;
                """);
            committed.Parameters.AddWithValue("id", admitted.AdmissionId);
            Assert.Equal(1L, await committed.ExecuteScalarAsync(token));
            await using var revoke = source.CreateCommand("""
                UPDATE platform_provisioning.register_operator SET can_add = false;
                """);
            Assert.Equal(1, await revoke.ExecuteNonQueryAsync(token));
            return true;
        }, false, token));

        Assert.False(await access.WithAccessAsync(session, community, true, _ => Task.FromResult(true), false, token));
        Assert.True(await access.WithAccessAsync(session, community, false, _ => Task.FromResult(true), false, token));
        Assert.False(await access.WithAccessAsync(session, Guid.NewGuid(), false, _ => Task.FromResult(true), false, token));

        Task<bool> TryPrepare() => access.WithAccessAsync(session, community, RegisterPermission.WriteImportDraft,
            _ => Task.FromResult(true), false, token);
        Assert.False(await TryPrepare());
        await using var grantPreparation = source.CreateCommand("""
            UPDATE platform_provisioning.register_operator SET can_prepare_import = true;
            """);
        await grantPreparation.ExecuteNonQueryAsync(token);
        Assert.True(await TryPrepare());
        await using var revokePreparation = source.CreateCommand("""
            UPDATE platform_provisioning.register_operator SET can_prepare_import = false;
            """);
        await revokePreparation.ExecuteNonQueryAsync(token);
        Assert.False(await TryPrepare());

        await using var grantApproval = source.CreateCommand("""
            UPDATE platform_provisioning.register_operator
            SET can_approve_import = true, import_approval_basis = 'synthetic';
            """);
        await grantApproval.ExecuteNonQueryAsync(token);
        await using var revoker = await source.OpenConnectionAsync(token);
        await using var revocation = await revoker.BeginTransactionAsync(token);
        await using var revokeApproval = new NpgsqlCommand("""
            UPDATE platform_provisioning.register_operator SET can_approve_import = false;
            """, revoker, revocation);
        Assert.Equal(1, await revokeApproval.ExecuteNonQueryAsync(token));

        var settings = new NpgsqlConnectionStringBuilder(_postgres.GetConnectionString())
            { ApplicationName = "i1-concurrent-approval" };
        await using var approvalSource = NpgsqlDataSource.Create(settings.ConnectionString);
        var approval = new RegisterAccessStore(approvalSource).WithAccessAsync(session, community,
            RegisterPermission.ApproveImport, _ => Task.FromResult(true), false, token,
            new(Guid.NewGuid(), 1, new string('A', 64)));
        await using var waiting = source.CreateCommand("""
            SELECT EXISTS (SELECT 1 FROM pg_stat_activity
                WHERE application_name = 'i1-concurrent-approval' AND wait_event_type = 'Lock');
            """);
        using var deadline = CancellationTokenSource.CreateLinkedTokenSource(token);
        deadline.CancelAfter(TimeSpan.FromSeconds(10));
        while (await waiting.ExecuteScalarAsync(deadline.Token) is not true)
        {
            await Task.Delay(25, deadline.Token);
        }
        await revocation.CommitAsync(token);
        Assert.False(await approval);
        await using var admissions = source.CreateCommand("SELECT count(*) FROM platform_provisioning.register_import_admission;");
        Assert.Equal(0L, await admissions.ExecuteScalarAsync(token));
    }

    [Fact]
    public async Task Platform_Session_Guards_One_Atomic_Bootstrap_With_A_Single_Connection()
    {
        var token = TestContext.Current.CancellationToken;
        var settings = new NpgsqlConnectionStringBuilder(_postgres.GetConnectionString()) { MaxPoolSize = 1 };
        await using var source = NpgsqlDataSource.Create(settings.ConnectionString);
        foreach (var file in new[] { "001_community_reservation.sql", "002_bootstrap_administrator.sql",
                     "003_bootstrap_security_event.sql", "005_platform_authentication.sql" })
        {
            var sql = await File.ReadAllTextAsync(Path.Combine(AppContext.BaseDirectory, file), token);
            await using var migration = source.CreateCommand(sql);
            await migration.ExecuteNonQueryAsync(token);
        }

        var accounts = new PlatformAuthenticationStore(source);
        var password = Convert.ToHexString(System.Security.Cryptography.RandomNumberGenerator.GetBytes(20));
        var creator = await accounts.AddAccountAsync("creator", password, true, token);
        var administrator = await accounts.AddAccountAsync("administrator", password, false, token);
        var credential = Assert.IsType<PlatformCredential>(await accounts.FindCredentialAsync("CREATOR", token));
        var ordinary = Assert.IsType<PlatformCredential>(await accounts.FindCredentialAsync("administrator", token));
        Assert.StartsWith("argon2id-v19-", credential.PasswordHash);
        Assert.NotEqual(ordinary.PasswordHash, credential.PasswordHash);
        Assert.True(await PlatformPassword.VerifyAsync(password, credential.PasswordHash));
        Assert.False(await PlatformPassword.VerifyAsync(password + "x", credential.PasswordHash));
        var session = Assert.IsType<string>(await accounts.StartSessionAsync(credential, token));
        var ordinarySession = Assert.IsType<string>(await accounts.StartSessionAsync(ordinary, token));
        var request = Guid.CreateVersion7();
        Task<CommunityReservation?> Run(string sessionToken, bool abort = false) =>
            accounts.WithCreatorAsync<CommunityReservation?>(sessionToken, administrator, async (actor, active, tx) =>
            {
                Assert.True(active);
                var provisioning = new CommunityProvisioning(new PostgresCommunityReservationStore(source, tx));
                var reservation = Assert.IsType<CommunityReservation>(
                    await provisioning.ReserveAsync(actor, request, administrator, "Test community", token));
                var bootstrap = new BootstrapAdministrator(new PostgresBootstrapAdministratorStore(source, tx));
                Assert.NotNull(await bootstrap.AssignAsync(reservation.OperationId, token));
                if (abort) throw new InvalidOperationException("Test rollback");
                return reservation;
            }, null, token);

        Assert.Null(await Run(ordinarySession));
        await Assert.ThrowsAsync<InvalidOperationException>(() => Run(session, abort: true));
        await using var count = source.CreateCommand("SELECT count(*) FROM platform_provisioning.community_reservation");
        Assert.Equal(0L, await count.ExecuteScalarAsync(token));

        var applied = Assert.IsType<CommunityReservation>(await Run(session));
        Assert.Equal(creator, applied.CreatorAccountId);
        Assert.Equal(administrator, await accounts.ResolveAssignedAccountAsync(ordinarySession, applied.CommunityId, token));
        Assert.Null(await accounts.ResolveAssignedAccountAsync(ordinarySession, Guid.CreateVersion7(), token));
        await accounts.RevokeSessionAsync(session, token);
        Assert.Null(await Run(session));

        await using var expire = source.CreateCommand("""
            UPDATE platform_provisioning.platform_session SET expires_at = clock_timestamp()
            WHERE account_id = @account;
            """);
        expire.Parameters.AddWithValue("account", administrator);
        await expire.ExecuteNonQueryAsync(token);
        Assert.Null(await accounts.ResolveAssignedAccountAsync(ordinarySession, applied.CommunityId, token));
    }

    [Fact]
    public async Task Password_Recovery_Consumes_One_Code_And_Revokes_All_Sessions_Atomically()
    {
        var token = TestContext.Current.CancellationToken;
        await using var source = NpgsqlDataSource.Create(_postgres.GetConnectionString());
        foreach (var file in new[] { "001_community_reservation.sql", "005_platform_authentication.sql",
                     "006_password_recovery.sql" })
        {
            var sql = await File.ReadAllTextAsync(Path.Combine(AppContext.BaseDirectory, file), token);
            await using var migration = source.CreateCommand(sql);
            await migration.ExecuteNonQueryAsync(token);
        }

        var accounts = new PlatformAuthenticationStore(source);
        var recovery = new PlatformPasswordRecovery(source);
        static string RandomPassword() => Convert.ToHexString(System.Security.Cryptography.RandomNumberGenerator.GetBytes(20));
        var oldPassword = RandomPassword();
        var newPassword = RandomPassword();
        var id = await accounts.AddAccountAsync("creator", oldPassword, true, token);
        await accounts.AddAccountAsync("other", RandomPassword(), false, token);
        var old = Assert.IsType<PlatformCredential>(await accounts.FindCredentialAsync("creator", token));
        var firstSession = Assert.IsType<string>(await accounts.StartSessionAsync(old, token));
        var secondSession = Assert.IsType<string>(await accounts.StartSessionAsync(old, token));
        var firstCode = Assert.IsType<string>(await recovery.IssueAsync(id, token));
        var code = Assert.IsType<string>(await recovery.IssueAsync(id, token));
        Assert.False(await recovery.ConsumeAsync("creator", firstCode, newPassword, token));
        Assert.False(await recovery.ConsumeAsync("other", code, newPassword, token));
        Assert.False(await recovery.ConsumeAsync("creator", code, oldPassword, token));

        await using var rejectAudit = source.CreateCommand("""
            ALTER TABLE platform_provisioning.platform_auth_security_event
            ADD CONSTRAINT test_reject_recovery CHECK (event_kind <> 'recovery-used');
            """);
        await rejectAudit.ExecuteNonQueryAsync(token);
        await Assert.ThrowsAsync<PostgresException>(() => recovery.ConsumeAsync("creator", code, newPassword, token));
        Assert.Equal(old, await accounts.FindCredentialAsync("creator", token));
        Assert.True(await accounts.WithCreatorAsync(firstSession, null, (_, _, _) => Task.FromResult(true), false, token));
        await using var restoreAudit = source.CreateCommand("""
            ALTER TABLE platform_provisioning.platform_auth_security_event DROP CONSTRAINT test_reject_recovery;
            """);
        await restoreAudit.ExecuteNonQueryAsync(token);

        var attempts = await Task.WhenAll(recovery.ConsumeAsync("creator", code, newPassword, token),
            recovery.ConsumeAsync("creator", code, newPassword, token));
        Assert.Single(attempts, result => result);
        Assert.Null(await accounts.StartSessionAsync(old, token));
        foreach (var previous in new[] { firstSession, secondSession })
        {
            Assert.False(await accounts.WithCreatorAsync(previous, null, (_, _, _) => Task.FromResult(true), false, token));
        }

        var current = Assert.IsType<PlatformCredential>(await accounts.FindCredentialAsync("creator", token));
        Assert.False(await PlatformPassword.VerifyAsync(oldPassword, current.PasswordHash));
        Assert.True(await PlatformPassword.VerifyAsync(newPassword, current.PasswordHash));
        var fresh = Assert.IsType<string>(await accounts.StartSessionAsync(current, token));
        Assert.True(await accounts.WithCreatorAsync(fresh, null, (_, _, _) => Task.FromResult(true), false, token));
        await using var audit = source.CreateCommand("""
            SELECT count(*) FROM platform_provisioning.platform_auth_security_event
            WHERE event_kind IN ('recovery-issued', 'recovery-used', 'session-revoked');
            """);
        Assert.Equal(5L, await audit.ExecuteScalarAsync(token));
    }

    [Fact]
    public async Task Recovery_Delivery_Retries_The_Same_Code_And_Revocation_Invalidates_It()
    {
        var token = TestContext.Current.CancellationToken;
        await using var source = NpgsqlDataSource.Create(_postgres.GetConnectionString());
        foreach (var file in new[] { "001_community_reservation.sql", "005_platform_authentication.sql",
                     "006_password_recovery.sql", "007_recovery_delivery.sql", "008_short_recovery_code.sql" })
        {
            var sql = await File.ReadAllTextAsync(Path.Combine(AppContext.BaseDirectory, file), token);
            await using var migration = source.CreateCommand(sql);
            await migration.ExecuteNonQueryAsync(token);
        }

        var accounts = new PlatformAuthenticationStore(source);
        var password = Convert.ToHexString(System.Security.Cryptography.RandomNumberGenerator.GetBytes(24));
        var account = await accounts.AddAccountAsync("mail-user", password, false, token);
        var telegramAccount = await accounts.AddAccountAsync("telegram-user", password, false, token);
        await accounts.AddAccountAsync("no-channel", password, false, token);
        var bindings = new RecoveryChannelOperator(source);
        Assert.True(await bindings.SetAsync(account, "email", "synthetic@example.invalid", token));
        Assert.True(await bindings.SetAsync(telegramAccount, "telegram", "123456", token));
        var store = new RecoveryDeliveryStore(source, System.Security.Cryptography.RandomNumberGenerator.GetBytes(32));
        var email = new RecordingRecoveryTransport(RecoveryDeliveryOutcome.Retry);
        var telegram = new RecordingRecoveryTransport(RecoveryDeliveryOutcome.Sent);
        var processor = new RecoveryDeliveryProcessor(store, new Dictionary<string, IRecoveryTransport>
        {
            ["email"] = email,
            ["telegram"] = telegram,
        });

        await store.RequestAsync("unknown", token);
        await store.RequestAsync("no-channel", token);
        Assert.False(await processor.ProcessOneAsync(token));
        await Task.WhenAll(store.RequestAsync("mail-user", token), store.RequestAsync("mail-user", token));
        Assert.True(await processor.ProcessOneAsync(token));
        Assert.False(await processor.ProcessOneAsync(token));
        await using var ready = source.CreateCommand("""
            UPDATE platform_provisioning.recovery_delivery SET available_at = clock_timestamp();
            """);
        await ready.ExecuteNonQueryAsync(token);
        Assert.True(await processor.ProcessOneAsync(token));
        Assert.Equal(2, email.Messages.Count);
        Assert.Equal(email.Messages[0], email.Messages[1]);
        Assert.Equal("synthetic@example.invalid", email.Messages[0].Destination);

        await store.RequestAsync("telegram-user", token);
        Assert.True(await processor.ProcessOneAsync(token));
        Assert.Equal("123456", Assert.Single(telegram.Messages).Destination);
        Assert.Matches("^[0-9]{6}$", telegram.Messages[0].Code);
        Assert.Matches("^[0-9]{6}$", email.Messages[0].Code);

        var recovery = new PlatformPasswordRecovery(source, store);
        var newPassword = Convert.ToHexString(System.Security.Cryptography.RandomNumberGenerator.GetBytes(24));
        Assert.True(await bindings.SetAsync(account, null, null, token));
        Assert.False(await recovery.ConsumeAsync("mail-user", email.Messages[0].Code, newPassword, token));
        var code = telegram.Messages[0].Code;
        var competing = await Task.WhenAll(recovery.ConsumeAsync("telegram-user", code, newPassword, token),
            recovery.ConsumeAsync("telegram-user", code, newPassword, token));
        Assert.Single(competing, accepted => accepted);
        await store.RequestAsync("telegram-user", token);
        Assert.False(await processor.ProcessOneAsync(token));

        // Exercise the persisted limit without running ten additional Argon2 computations.
        await using var credentials = source.CreateCommand("""
            SELECT password_hash FROM platform_provisioning.platform_account WHERE login = 'mail-user';
            """);
        var hash = Assert.IsType<string>(await credentials.ExecuteScalarAsync(token));
        await using var rebind = source.CreateCommand("""
            UPDATE platform_provisioning.platform_auth_security_event
            SET recorded_at = clock_timestamp() - interval '61 seconds' WHERE event_kind = 'recovery-issued';
            """);
        await rebind.ExecuteNonQueryAsync(token);
        Assert.True(await bindings.SetAsync(account, "email", "synthetic@example.invalid", token));
        await store.RequestAsync("mail-user", token);
        var job = Assert.IsType<RecoveryDeliveryJob>(await store.ClaimAsync(token));
        async Task<bool> TryDigest(byte[] digest, string login = "mail-user")
        {
            await using var command = source.CreateCommand("""
                SELECT platform_provisioning.consume_short_recovery(@login, @issuance, @digest, @hash, @hash);
                """);
            command.Parameters.AddWithValue("login", login);
            command.Parameters.AddWithValue("issuance", job.Id);
            command.Parameters.AddWithValue("digest", digest);
            command.Parameters.AddWithValue("hash", hash);
            return await command.ExecuteScalarAsync(token) is true;
        }

        Assert.False(await TryDigest(job.Digest, "telegram-user"));
        var guesses = await Task.WhenAll(Enumerable.Range(0, 8).Select(_ => TryDigest(new byte[32])));
        Assert.All(guesses, accepted => Assert.False(accepted));
        await using var failures = source.CreateCommand("SELECT count(*) FROM platform_provisioning.recovery_short_failure");
        Assert.Equal(5L, await failures.ExecuteScalarAsync(token));
        var restarted = new PlatformPasswordRecovery(source, store);
        Assert.False(await restarted.ConsumeAsync("mail-user", store.DeriveShortCode(job.Id), newPassword, token));

        var manual = Assert.IsType<string>(await restarted.IssueAsync(account, token));
        Assert.Equal(64, manual.Length);
        Assert.True(await restarted.ConsumeAsync("mail-user", manual, newPassword, token));
        await rebind.ExecuteNonQueryAsync(token);
        await store.RequestAsync("mail-user", token);
        var nextJob = Assert.IsType<RecoveryDeliveryJob>(await store.ClaimAsync(token));
        Assert.NotEqual(job.Id, nextJob.Id);
        Assert.False(await restarted.ConsumeAsync("mail-user", store.DeriveShortCode(nextJob.Id), password, token));

        await using var expire = source.CreateCommand("""
            UPDATE platform_provisioning.platform_password_recovery SET expires_at = clock_timestamp()
            WHERE account_id = @account;
            UPDATE platform_provisioning.recovery_short_failure SET attempted_at = clock_timestamp() - interval '16 minutes'
            WHERE account_id = @account;
            """);
        expire.Parameters.AddWithValue("account", account);
        await expire.ExecuteNonQueryAsync(token);
        Assert.False(await restarted.ConsumeAsync("mail-user", store.DeriveShortCode(nextJob.Id), password, token));

        var legacyJob = Guid.CreateVersion7();
        var legacyBytes = store.DeriveCode(legacyJob);
        Assert.Equal(Convert.ToHexString(legacyBytes), store.ResolveDeliveryCode(new RecoveryDeliveryJob(
            legacyJob, 1, "email", "synthetic@example.invalid",
            System.Security.Cryptography.SHA256.HashData(legacyBytes))));

        await using var audit = source.CreateCommand("""
            SELECT count(*) FROM platform_provisioning.platform_auth_security_event
            WHERE delivery_channel IN ('email', 'telegram') AND event_kind IN
                ('recovery-delivery-sent', 'recovery-delivery-retry');
            """);
        Assert.Equal(3L, await audit.ExecuteScalarAsync(token));
    }

    private sealed class RecordingRecoveryTransport(RecoveryDeliveryOutcome firstOutcome) : IRecoveryTransport
    {
        public List<(string Destination, string Code)> Messages { get; } = [];

        public Task<RecoveryDeliveryOutcome> SendAsync(string destination, string code, CancellationToken token)
        {
            Messages.Add((destination, code));
            return Task.FromResult(Messages.Count == 1 ? firstOutcome : RecoveryDeliveryOutcome.Sent);
        }
    }
}
