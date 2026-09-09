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
}
