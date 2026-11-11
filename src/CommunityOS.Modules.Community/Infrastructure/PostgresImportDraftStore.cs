using System.Text.Json;
using CommunityOS.Modules.Community.Application.Register;
using Npgsql;
using NpgsqlTypes;

namespace CommunityOS.Modules.Community.Infrastructure;

public sealed record ImportDraftOwner(Guid Community, Guid Account, Guid Subject);
public sealed record ImportDraftSummary(Guid Id, DateTime UpdatedAt);
public sealed record ImportDraft(Guid Id, int Revision, RegisterImportRow[] Source, RegisterOwnerDecision[] Decisions);

public sealed class PostgresImportDraftStore(NpgsqlDataSource source)
{
    public Task<IReadOnlyList<ImportDraftSummary>> ListAsync(ImportDraftOwner owner, CancellationToken token) =>
        RunAsync<IReadOnlyList<ImportDraftSummary>>(owner, """
            SELECT id, updated_at FROM community_register.import_draft
            WHERE community_id = @community AND operator_account_id = @account AND operator_subject_id = @subject
            ORDER BY updated_at DESC, id LIMIT 100;
            """, async command =>
        {
            var drafts = new List<ImportDraftSummary>();
            await using var reader = await command.ExecuteReaderAsync(token);
            while (await reader.ReadAsync(token))
            {
                drafts.Add(new(reader.GetGuid(0), reader.GetDateTime(1)));
            }

            return drafts;
        }, token);

    public Task<Guid> CreateAsync(ImportDraftOwner owner, byte[] hash, IReadOnlyList<RegisterImportRow> rows,
        CancellationToken token) => RunAsync(owner, """
            INSERT INTO community_register.import_draft
                (community_id, id, operator_account_id, operator_subject_id, source_sha256, source_rows)
            VALUES (@community, @id, @account, @subject, @hash, @rows);
            """, async command =>
        {
            var id = Guid.CreateVersion7();
            command.Parameters.AddWithValue("id", id);
            command.Parameters.AddWithValue("hash", hash);
            command.Parameters.AddWithValue("rows", NpgsqlDbType.Jsonb, JsonSerializer.Serialize(rows));
            await command.ExecuteNonQueryAsync(token);
            return id;
        }, token);

    public Task<ImportDraft?> ReadAsync(ImportDraftOwner owner, Guid id, CancellationToken token) =>
        RunAsync<ImportDraft?>(owner, """
            SELECT revision, source_rows, decisions FROM community_register.import_draft
            WHERE community_id = @community AND id = @id
                AND operator_account_id = @account AND operator_subject_id = @subject;
            """, async command =>
        {
            command.Parameters.AddWithValue("id", id);
            await using var reader = await command.ExecuteReaderAsync(token);
            return await reader.ReadAsync(token)
                ? new(id, reader.GetInt32(0), JsonSerializer.Deserialize<RegisterImportRow[]>(reader.GetString(1))!,
                    JsonSerializer.Deserialize<RegisterOwnerDecision[]>(reader.GetString(2))!)
                : null;
        }, token);

    public Task<bool> SaveAsync(ImportDraftOwner owner, Guid id, int revision,
        IReadOnlyList<RegisterOwnerDecision> decisions, CancellationToken token) => RunAsync(owner, """
            UPDATE community_register.import_draft
            SET decisions = @decisions, revision = revision + 1, updated_at = clock_timestamp()
            WHERE community_id = @community AND id = @id AND revision = @revision
                AND operator_account_id = @account AND operator_subject_id = @subject;
            """, async command =>
        {
            command.Parameters.AddWithValue("id", id);
            command.Parameters.AddWithValue("revision", revision);
            command.Parameters.AddWithValue("decisions", NpgsqlDbType.Jsonb, JsonSerializer.Serialize(decisions));
            return await command.ExecuteNonQueryAsync(token) == 1;
        }, token);

    private async Task<T> RunAsync<T>(ImportDraftOwner owner, string sql, Func<NpgsqlCommand, Task<T>> run,
        CancellationToken token)
    {
        await using var connection = await source.OpenConnectionAsync(token);
        await using var transaction = await connection.BeginTransactionAsync(token);
        await PostgresRegisterStore.SetCommunityScopeAsync(connection, transaction, owner.Community, token);
        await using var command = new NpgsqlCommand(sql, connection, transaction);
        command.Parameters.AddWithValue("community", owner.Community);
        command.Parameters.AddWithValue("account", owner.Account);
        command.Parameters.AddWithValue("subject", owner.Subject);
        var result = await run(command);
        await transaction.CommitAsync(token);
        return result;
    }
}
