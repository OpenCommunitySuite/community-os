using System.Security.Cryptography;
using System.Text.Json;
using Npgsql;
using NpgsqlTypes;

namespace CommunityOS.Modules.Community.Infrastructure;

public sealed record ExpenseDistributionPart(Guid BudgetItemId, decimal Amount);
public sealed record ExpenseDistributionInput(Guid RequestId, Guid? PreviousId, ExpenseDistributionPart[] Parts);

public sealed partial class PostgresBillingStore
{
    public static string ExpenseDistributionDigest(Guid expense, ExpenseDistributionInput input) =>
        Convert.ToHexString(SHA256.HashData(JsonSerializer.SerializeToUtf8Bytes(new { expense, input }, Json)));

    public Task<JsonElement?> ExpenseDistributionAsync(Guid community, Guid expense, CancellationToken token) =>
        RunAsync<JsonElement?>(community, async (connection, transaction) =>
        {
            await using var query = Command(connection, transaction, community, null, """
                SELECT jsonb_build_object(
                    'amount', e.amount,
                    'items', coalesce((
                        SELECT jsonb_agg(jsonb_build_object('id', i.id, 'budget', b.title,
                            'designation', i.designation) ORDER BY b.title, i.designation, i.id)
                        FROM community_billing.budget b
                        JOIN community_billing.budget_item i ON (i.community_id,i.budget_id)=(b.community_id,b.id)
                        WHERE b.community_id=e.community_id AND e.incurred_on BETWEEN b.starts_on AND b.ends_on
                    ), '[]'),
                    'history', coalesce((
                        SELECT jsonb_agg(jsonb_build_object('id', d.id, 'previousId', d.previous_id,
                            'recordedAt', d.recorded_at,
                            'parts', coalesce((
                                SELECT jsonb_agg(jsonb_build_object('budgetItemId', p.budget_item_id, 'amount', p.amount)
                                    ORDER BY p.budget_item_id)
                                FROM community_billing.expense_distribution_part p
                                WHERE (p.community_id,p.distribution_id)=(d.community_id,d.id)
                            ), '[]')) ORDER BY NOT EXISTS (
                                SELECT 1 FROM community_billing.expense_distribution next
                                WHERE next.community_id=d.community_id AND next.expense_id=d.expense_id
                                    AND next.previous_id=d.id
                            ) DESC, d.recorded_at DESC, d.id)
                        FROM community_billing.expense_distribution d
                        WHERE (d.community_id,d.expense_id)=(e.community_id,e.id)
                    ), '[]')
                )::text
                FROM community_billing.expense e WHERE e.community_id=@community AND e.id=@expense;
                """);
            query.Parameters.AddWithValue("expense", expense);
            return await query.ExecuteScalarAsync(token) is string result
                ? JsonSerializer.Deserialize<JsonElement>(result) : null;
        }, token);

    public async Task<string> AllocateExpenseAsync(Guid community, Guid expense, ExpenseDistributionInput input,
        string digest, ElectricityActor actor, CancellationToken token)
    {
        try
        {
            return await RunAsync(community, async (connection, transaction) =>
            {
                var replay = await ReadExpenseDistributionReplayAsync(connection, transaction, community, input.RequestId, digest, token);
                if (replay is not null)
                    return replay;

                await using var validate = Command(connection, transaction, community, null, """
                    SELECT e.amount,
                        (SELECT d.id FROM community_billing.expense_distribution d
                         WHERE d.community_id=e.community_id AND d.expense_id=e.id AND NOT EXISTS (
                             SELECT 1 FROM community_billing.expense_distribution next
                             WHERE next.community_id=d.community_id AND next.expense_id=d.expense_id AND next.previous_id=d.id)),
                        (SELECT count(*) FROM community_billing.budget_item i
                         JOIN community_billing.budget b ON (b.community_id,b.id)=(i.community_id,i.budget_id)
                         WHERE i.community_id=e.community_id AND i.id=ANY(@items)
                             AND e.incurred_on BETWEEN b.starts_on AND b.ends_on)
                    FROM community_billing.expense e WHERE e.community_id=@community AND e.id=@expense;
                    """);
                var items = input.Parts.Select(part => part.BudgetItemId).ToArray();
                validate.Parameters.AddWithValue("expense", expense);
                validate.Parameters.AddWithValue("items", items);
                await using (var reader = await validate.ExecuteReaderAsync(token))
                {
                    if (!await reader.ReadAsync(token))
                        return "Missing";
                    Guid? latest = reader.IsDBNull(1) ? null : reader.GetGuid(1);
                    if (latest != input.PreviousId)
                        return "Stale";
                    if (reader.GetDecimal(0) < input.Parts.Sum(part => part.Amount) || reader.GetInt64(2) != items.Length)
                        return "InvalidParts";
                }

                await using var insert = Command(connection, transaction, community, null, """
                    INSERT INTO community_billing.expense_distribution
                        (community_id,expense_id,id,previous_id,digest,admission_id,account_id,subject_id,basis)
                    VALUES (@community,@expense,@id,@previous,@digest,@admission,@account,@subject,@basis);
                    INSERT INTO community_billing.expense_distribution_part
                        (community_id,distribution_id,budget_item_id,amount)
                    SELECT @community,@id,item,amount FROM unnest(@items,@amounts) AS parts(item,amount);
                    """);
                insert.Parameters.AddWithValue("expense", expense);
                insert.Parameters.AddWithValue("id", input.RequestId);
                insert.Parameters.AddWithValue("previous", NpgsqlDbType.Uuid, (object?)input.PreviousId ?? DBNull.Value);
                insert.Parameters.AddWithValue("digest", digest);
                insert.Parameters.AddWithValue("admission", actor.AdmissionId);
                insert.Parameters.AddWithValue("account", actor.AccountId);
                insert.Parameters.AddWithValue("subject", actor.SubjectId);
                insert.Parameters.AddWithValue("basis", actor.Basis);
                insert.Parameters.AddWithValue("items", items);
                insert.Parameters.AddWithValue("amounts", input.Parts.Select(part => part.Amount).ToArray());
                await insert.ExecuteNonQueryAsync(token);
                return "Allocated";
            }, token);
        }
        catch (PostgresException error) when (error.SqlState == PostgresErrorCodes.SerializationFailure ||
            error.ConstraintName is "expense_distribution_pkey" or "expense_distribution_revision" or "expense_distribution_community_id_expense_id_id_key")
        {
            return await RunAsync(community, async (connection, transaction) =>
                await ReadExpenseDistributionReplayAsync(connection, transaction, community, input.RequestId, digest, token)
                    ?? "Stale", token);
        }
    }

    private static async Task<string?> ReadExpenseDistributionReplayAsync(NpgsqlConnection connection,
        NpgsqlTransaction transaction, Guid community, Guid request, string digest, CancellationToken token)
    {
        await using var query = Command(connection, transaction, community, null, """
            SELECT digest FROM community_billing.expense_distribution WHERE community_id=@community AND id=@id;
            """);
        query.Parameters.AddWithValue("id", request);
        return await query.ExecuteScalarAsync(token) switch
        {
            string recorded when recorded == digest => "Replayed",
            string => "Conflict",
            _ => null
        };
    }
}
