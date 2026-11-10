using CommunityOS.Modules.Community.Application.Register;
using Npgsql;

namespace CommunityOS.Modules.Community.Infrastructure;

public sealed class PostgresRegisterStore(NpgsqlDataSource dataSource) : IRegisterStore
{
    public async Task CreateAsync(RegisterEntry entry, CancellationToken cancellationToken)
    {
        await using var connection = await dataSource.OpenConnectionAsync(cancellationToken);
        await using var transaction = await connection.BeginTransactionAsync(cancellationToken);
        await using var command = new NpgsqlCommand("""
            INSERT INTO community_register.subject (community_id, id, display_name)
            SELECT @community, @owner, @name WHERE @name <> '';

            INSERT INTO community_register.plot (community_id, id, number)
            VALUES (@community, @plot, @number);

            INSERT INTO community_register.ownership (community_id, plot_id, subject_id)
            VALUES (@community, @plot, @owner);

            INSERT INTO community_register.personal_account (community_id, plot_id, id, number)
            VALUES (@community, @plot, @account, @account_number);
            """, connection, transaction);
        command.Parameters.AddWithValue("community", entry.CommunityId);
        command.Parameters.AddWithValue("owner", entry.OwnerId);
        command.Parameters.AddWithValue("name", entry.OwnerName);
        command.Parameters.AddWithValue("plot", entry.PlotId);
        command.Parameters.AddWithValue("number", entry.PlotNumber);
        command.Parameters.AddWithValue("account", Guid.CreateVersion7());
        command.Parameters.AddWithValue("account_number", entry.AccountNumber);
        await command.ExecuteNonQueryAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
    }

    public async Task<bool> CorrectOwnerAsync(Guid communityId, Guid plotId, Guid revision, Guid ownerId,
        string reason, CancellationToken cancellationToken)
    {
        await using var command = dataSource.CreateCommand("""
            WITH corrected AS (
                UPDATE community_register.ownership
                SET subject_id = @owner, revision = uuidv7()
                WHERE community_id = @community AND plot_id = @plot
                    AND revision = @revision AND subject_id <> @owner
                RETURNING OLD.subject_id AS previous_subject_id
            )
            INSERT INTO community_register.ownership_correction
                (community_id, plot_id, previous_revision, previous_subject_id, corrected_subject_id, reason)
            SELECT @community, @plot, @revision, previous_subject_id, @owner, @reason
            FROM corrected;
            """);
        command.Parameters.AddWithValue("community", communityId);
        command.Parameters.AddWithValue("plot", plotId);
        command.Parameters.AddWithValue("revision", revision);
        command.Parameters.AddWithValue("owner", ownerId);
        command.Parameters.AddWithValue("reason", reason);
        return await command.ExecuteNonQueryAsync(cancellationToken) == 1;
    }

    public async Task<IReadOnlyList<RegisterEntry>> ListAsync(Guid communityId, CancellationToken cancellationToken)
    {
        await using var command = dataSource.CreateCommand("""
            SELECT s.id, p.id, s.display_name, p.number, a.number, o.revision
            FROM community_register.plot p
            JOIN community_register.ownership o ON (o.community_id, o.plot_id) = (p.community_id, p.id)
            JOIN community_register.subject s ON (s.community_id, s.id) = (o.community_id, o.subject_id)
            JOIN community_register.personal_account a ON (a.community_id, a.plot_id) = (p.community_id, p.id)
            WHERE p.community_id = @community
            ORDER BY p.number, s.id;
            """);
        command.Parameters.AddWithValue("community", communityId);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var entries = new List<RegisterEntry>();
        while (await reader.ReadAsync(cancellationToken))
        {
            entries.Add(new RegisterEntry(communityId, reader.GetGuid(0), reader.GetGuid(1),
                reader.GetString(2), reader.GetString(3), reader.GetString(4), reader.GetGuid(5)));
        }

        return entries;
    }
}
