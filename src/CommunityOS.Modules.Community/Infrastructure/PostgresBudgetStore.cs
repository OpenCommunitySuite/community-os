using System.Security.Cryptography;
using System.Text.Json;

namespace CommunityOS.Modules.Community.Infrastructure;

public sealed record BudgetItemInput(string Designation, decimal Amount);
public sealed record BudgetInput(Guid RequestId, DateOnly StartsOn, DateOnly EndsOn, string Title,
    string Evidence, BudgetItemInput[] Items);

public sealed partial class PostgresBillingStore
{
    public static string BudgetDigest(BudgetInput input) =>
        Convert.ToHexString(SHA256.HashData(JsonSerializer.SerializeToUtf8Bytes(input, Json)));

    public Task<JsonElement> BudgetsAsync(Guid community, CancellationToken token) =>
        RunAsync(community, async (connection, transaction) =>
        {
            await using var query = Command(connection, transaction, community, null, """
                WITH current_parts AS (
                    SELECT d.expense_id, p.budget_item_id, p.amount
                    FROM community_billing.expense_distribution d
                    JOIN community_billing.expense_distribution_part p
                        ON (p.community_id, p.distribution_id) = (d.community_id, d.id)
                    WHERE d.community_id = @community AND NOT EXISTS (
                        SELECT 1 FROM community_billing.expense_distribution successor
                        WHERE (successor.community_id, successor.expense_id, successor.previous_id)
                            = (d.community_id, d.expense_id, d.id)
                    )
                ), actual_by_item AS (
                    SELECT budget_item_id, sum(amount) AS amount FROM current_parts GROUP BY budget_item_id
                ), allocated_by_expense AS (
                    SELECT expense_id, sum(amount) AS amount FROM current_parts GROUP BY expense_id
                ), expense_remainders AS (
                    SELECT e.incurred_on, e.amount - coalesce(a.amount, 0) AS amount
                    FROM community_billing.expense e
                    LEFT JOIN allocated_by_expense a ON a.expense_id = e.id
                    WHERE e.community_id = @community
                )
                SELECT coalesce(jsonb_agg(jsonb_build_object('id', b.id, 'title', b.title,
                    'startsOn', b.starts_on, 'endsOn', b.ends_on, 'evidence', b.evidence,
                    'plannedTotal', items.planned, 'actualTotal', items.actual,
                    'variance', items.planned - items.actual,
                    'periodUnallocated', (SELECT coalesce(sum(r.amount), 0) FROM expense_remainders r
                        WHERE r.incurred_on BETWEEN b.starts_on AND b.ends_on),
                    'items', items.rows)
                    ORDER BY b.starts_on DESC, b.id), '[]')::text
                FROM community_billing.budget b
                CROSS JOIN LATERAL (
                    SELECT coalesce(sum(i.amount), 0) AS planned,
                        coalesce(sum(a.amount), 0) AS actual,
                        coalesce(jsonb_agg(jsonb_build_object('id', i.id, 'designation', i.designation,
                            'amount', i.amount, 'actual', coalesce(a.amount, 0),
                            'variance', i.amount - coalesce(a.amount, 0)) ORDER BY i.designation, i.id), '[]') AS rows
                    FROM community_billing.budget_item i
                    LEFT JOIN actual_by_item a ON a.budget_item_id = i.id
                    WHERE (i.community_id, i.budget_id) = (b.community_id, b.id)
                ) items
                WHERE b.community_id = @community;
                """);
            return JsonSerializer.Deserialize<JsonElement>((string)(await query.ExecuteScalarAsync(token))!);
        }, token);

    public async Task<string> RegisterBudgetAsync(Guid community, BudgetInput input, string digest,
        ElectricityActor actor, CancellationToken token)
    {
        try
        {
            return await RunAsync(community, async (connection, transaction) =>
            {
                await using var existing = Command(connection, transaction, community, null, """
                    SELECT digest FROM community_billing.budget WHERE community_id=@community AND id=@id;
                    """);
                existing.Parameters.AddWithValue("id", input.RequestId);
                if (await existing.ExecuteScalarAsync(token) is string registered)
                    return registered == digest ? "Replayed" : "Conflict";
                await using var insert = Command(connection, transaction, community, null, """
                    INSERT INTO community_billing.budget
                        (community_id,id,starts_on,ends_on,title,evidence,digest,admission_id,account_id,subject_id,basis)
                    VALUES (@community,@id,@from,@until,@title,@evidence,@digest,@admission,@account,@subject,@basis);
                    INSERT INTO community_billing.budget_item (community_id,id,budget_id,designation,amount)
                    SELECT @community,gen_random_uuid(),@id,name,amount
                    FROM unnest(@names,@amounts) AS items(name,amount);
                    """);
                insert.Parameters.AddWithValue("id", input.RequestId);
                insert.Parameters.AddWithValue("from", input.StartsOn);
                insert.Parameters.AddWithValue("until", input.EndsOn);
                insert.Parameters.AddWithValue("title", input.Title);
                insert.Parameters.AddWithValue("evidence", input.Evidence);
                insert.Parameters.AddWithValue("digest", digest);
                insert.Parameters.AddWithValue("admission", actor.AdmissionId);
                insert.Parameters.AddWithValue("account", actor.AccountId);
                insert.Parameters.AddWithValue("subject", actor.SubjectId);
                insert.Parameters.AddWithValue("basis", actor.Basis);
                insert.Parameters.AddWithValue("names", input.Items.Select(item => item.Designation).ToArray());
                insert.Parameters.AddWithValue("amounts", input.Items.Select(item => item.Amount).ToArray());
                await insert.ExecuteNonQueryAsync(token);
                return "Registered";
            }, token);
        }
        catch (Npgsql.PostgresException error) when (error.SqlState == Npgsql.PostgresErrorCodes.SerializationFailure ||
            error.ConstraintName == "budget_pkey")
        {
            return await RunAsync(community, async (connection, transaction) =>
            {
                await using var query = Command(connection, transaction, community, null, """
                    SELECT digest FROM community_billing.budget WHERE community_id=@community AND id=@id;
                    """);
                query.Parameters.AddWithValue("id", input.RequestId);
                return await query.ExecuteScalarAsync(token) switch
                {
                    string registered when registered == digest => "Replayed",
                    string => "Conflict",
                    _ => "Retry"
                };
            }, token);
        }
    }
}
