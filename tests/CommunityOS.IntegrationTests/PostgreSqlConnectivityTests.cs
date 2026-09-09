using System.Data;
using Npgsql;
using Testcontainers.PostgreSql;
using Xunit;

namespace CommunityOS.IntegrationTests;

public sealed class PostgreSqlConnectivityTests : IAsyncLifetime
{
    private const string PostgreSqlImage =
        "postgres:18.6@sha256:4ef4dbc939d61acea57712655ddb4b4ab27419c913f94cca0cd57cb3ea3c2280";

    private readonly PostgreSqlContainer _database = new PostgreSqlBuilder(PostgreSqlImage).Build();

    public ValueTask InitializeAsync() => new(_database.StartAsync());

    public ValueTask DisposeAsync() => _database.DisposeAsync();

    [Fact]
    public async Task Opens_real_Npgsql_connection()
    {
        await using var connection = new NpgsqlConnection(_database.GetConnectionString());
        await connection.OpenAsync(TestContext.Current.CancellationToken);

        Assert.Equal(ConnectionState.Open, connection.State);
    }
}
