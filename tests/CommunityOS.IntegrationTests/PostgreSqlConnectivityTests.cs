using CommunityOS.Modules.Platform.Application;
using CommunityOS.Modules.Platform.Infrastructure;
using CommunityOS.Modules.Community.Application.Register;
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
}
