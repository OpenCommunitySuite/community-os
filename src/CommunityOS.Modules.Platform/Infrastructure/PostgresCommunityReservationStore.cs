using CommunityOS.Modules.Platform.Application;
using Npgsql;

namespace CommunityOS.Modules.Platform.Infrastructure;

public sealed class PostgresCommunityReservationStore(NpgsqlDataSource dataSource, NpgsqlTransaction? sharedTransaction = null) : ICommunityReservationStore
{
    public async Task<CommunityReservation?> ReserveAsync(CommunityReservation reservation, Guid requestId,
        CancellationToken cancellationToken)
    {
        await using var ownedConnection = sharedTransaction is null ? await dataSource.OpenConnectionAsync(cancellationToken) : null;
        var connection = ownedConnection ?? sharedTransaction!.Connection!;
        await using var ownedTransaction = sharedTransaction is null ? await connection.BeginTransactionAsync(cancellationToken) : null;
        var transaction = ownedTransaction ?? sharedTransaction!;
        await using var insert = new NpgsqlCommand("""
            INSERT INTO platform_provisioning.community_reservation
                (operation_id, community_id, creator_account_id, request_id, initial_administrator_account_id, display_name)
            VALUES (@operation, @community, @creator, @request, @administrator, @name)
            ON CONFLICT (creator_account_id, request_id) DO NOTHING;
            """, connection, transaction);
        insert.Parameters.AddWithValue("operation", reservation.OperationId);
        insert.Parameters.AddWithValue("community", reservation.CommunityId);
        insert.Parameters.AddWithValue("creator", reservation.CreatorAccountId);
        insert.Parameters.AddWithValue("request", requestId);
        insert.Parameters.AddWithValue("administrator", reservation.InitialAdministratorAccountId);
        insert.Parameters.AddWithValue("name", reservation.DisplayName);
        if (await insert.ExecuteNonQueryAsync(cancellationToken) == 1)
        {
            if (ownedTransaction is not null)
            {
                await ownedTransaction.CommitAsync(cancellationToken);
            }

            return reservation;
        }

        await using var replay = new NpgsqlCommand("""
            SELECT operation_id, community_id
            FROM platform_provisioning.community_reservation
            WHERE creator_account_id = @creator AND request_id = @request
                AND initial_administrator_account_id = @administrator AND display_name = @name;
            """, connection, transaction);
        replay.Parameters.AddWithValue("creator", reservation.CreatorAccountId);
        replay.Parameters.AddWithValue("request", requestId);
        replay.Parameters.AddWithValue("administrator", reservation.InitialAdministratorAccountId);
        replay.Parameters.AddWithValue("name", reservation.DisplayName);
        await using var reader = await replay.ExecuteReaderAsync(cancellationToken);
        return await reader.ReadAsync(cancellationToken)
            ? reservation with { OperationId = reader.GetGuid(0), CommunityId = reader.GetGuid(1) }
            : null;
    }
}
