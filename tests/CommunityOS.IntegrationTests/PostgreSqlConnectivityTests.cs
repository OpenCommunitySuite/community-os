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

        var entries = await register.ListAsync(community, cancellationToken);
        Assert.Collection(entries,
            first => Assert.Equal((owner, "1", "A-1"), (first.OwnerId, first.PlotNumber, first.AccountNumber)),
            second => Assert.Equal((owner, "2", "A-2"), (second.OwnerId, second.PlotNumber, second.AccountNumber)));
        Assert.Empty(await register.ListAsync(otherCommunity, cancellationToken));
        await using var count = source.CreateCommand("SELECT count(*) FROM community_register.subject");
        Assert.Equal(1L, await count.ExecuteScalarAsync(cancellationToken));
    }

}
