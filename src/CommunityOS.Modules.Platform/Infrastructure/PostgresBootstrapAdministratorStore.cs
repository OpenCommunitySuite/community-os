using CommunityOS.Modules.Platform.Application;
using Npgsql;

namespace CommunityOS.Modules.Platform.Infrastructure;

public sealed class PostgresBootstrapAdministratorStore(NpgsqlDataSource dataSource) : IBootstrapAdministratorStore
{
    public async Task<BootstrapAdministratorAssignment?> AssignAsync(Guid operationId, CancellationToken cancellationToken)
    {
        await using var connection = await dataSource.OpenConnectionAsync(cancellationToken);
        await using var transaction = await connection.BeginTransactionAsync(cancellationToken);
        await using var insert = new NpgsqlCommand("""
            INSERT INTO platform_provisioning.bootstrap_administrator (operation_id)
            SELECT operation_id
            FROM platform_provisioning.community_reservation
            WHERE operation_id = @operation
            ON CONFLICT (operation_id) DO NOTHING;
            """, connection, transaction);
        insert.Parameters.AddWithValue("operation", operationId);
        await insert.ExecuteNonQueryAsync(cancellationToken);

        await using var lookup = new NpgsqlCommand("""
            SELECT r.community_id, r.initial_administrator_account_id, a.granted_at, a.revoked_at
            FROM platform_provisioning.bootstrap_administrator a
            JOIN platform_provisioning.community_reservation r USING (operation_id)
            WHERE a.operation_id = @operation;
            """, connection, transaction);
        lookup.Parameters.AddWithValue("operation", operationId);
        BootstrapAdministratorAssignment? assignment;
        await using (var reader = await lookup.ExecuteReaderAsync(cancellationToken))
        {
            assignment = await reader.ReadAsync(cancellationToken)
                ? new(operationId, reader.GetGuid(0), reader.GetGuid(1), reader.GetDateTime(2),
                    reader.IsDBNull(3) ? null : reader.GetDateTime(3))
                : null;
        }

        await transaction.CommitAsync(cancellationToken);
        return assignment;
    }

    public async Task<bool> RevokeAsync(Guid communityId, Guid operationId, Guid revokerAccountId,
        CancellationToken cancellationToken)
    {
        await using var command = dataSource.CreateCommand("""
            UPDATE platform_provisioning.bootstrap_administrator a
            SET revoked_at = clock_timestamp(), revoked_by_account_id = @revoker
            FROM platform_provisioning.community_reservation r
            WHERE a.operation_id = r.operation_id AND a.operation_id = @operation
                AND r.community_id = @community AND a.revoked_at IS NULL;
            """);
        command.Parameters.AddWithValue("community", communityId);
        command.Parameters.AddWithValue("operation", operationId);
        command.Parameters.AddWithValue("revoker", revokerAccountId);
        return await command.ExecuteNonQueryAsync(cancellationToken) == 1;
    }
}
