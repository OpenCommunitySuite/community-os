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
        foreach (var file in new[] { "001_manual_register.sql", "002_ownership_correction.sql", "003_register_import.sql" })
        {
            var sql = await File.ReadAllTextAsync(Path.Combine(AppContext.BaseDirectory, file), token);
            await using var migration = source.CreateCommand(sql);
            await migration.ExecuteNonQueryAsync(token);
        }

        var store = new PostgresRegisterStore(source);
        var community = Guid.CreateVersion7();
        var plan = RegisterImportPlan.Create(community,
            [new(2, "1", "S-1", "Pilot owner", "0001"), new(3, "2", "S-1", "Pilot owner", "0002")]);
        Assert.True(plan.Preview([]).CanProceed);
        var results = await Task.WhenAll(store.ApplyImportAsync(plan, "operator", token),
            store.ApplyImportAsync(plan, "operator", token));
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
    }
}
