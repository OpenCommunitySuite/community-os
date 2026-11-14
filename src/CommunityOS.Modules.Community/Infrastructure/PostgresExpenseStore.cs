using System.Security.Cryptography;
using System.Text.Json;

namespace CommunityOS.Modules.Community.Infrastructure;

public sealed record ExpenseInput(Guid RequestId, DateOnly IncurredOn, string Purpose, decimal Amount, string Evidence);

public sealed partial class PostgresBillingStore
{
    public static string ExpenseDigest(ExpenseInput input) =>
        Convert.ToHexString(SHA256.HashData(JsonSerializer.SerializeToUtf8Bytes(input, Json)));

    public Task<JsonElement> ExpensesAsync(Guid community, CancellationToken token) =>
        RunAsync(community, async (connection, transaction) =>
        {
            await using var query = Command(connection, transaction, community, null, """
                SELECT coalesce(jsonb_agg(jsonb_build_object('id', id, 'incurredOn', incurred_on,
                    'purpose', purpose, 'amount', amount, 'evidence', evidence, 'recordedAt', recorded_at)
                    ORDER BY incurred_on DESC, recorded_at DESC, id), '[]')::text
                FROM community_billing.expense WHERE community_id=@community;
                """);
            return JsonSerializer.Deserialize<JsonElement>((string)(await query.ExecuteScalarAsync(token))!);
        }, token);

    public async Task<string> RecognizeExpenseAsync(Guid community, ExpenseInput input, string digest,
        ElectricityActor actor, CancellationToken token)
    {
        try
        {
            var inserted = await RunAsync(community, async (connection, transaction) =>
            {
                await using var insert = Command(connection, transaction, community, null, """
                    INSERT INTO community_billing.expense
                        (community_id,id,incurred_on,purpose,amount,evidence,digest,admission_id,account_id,subject_id,basis)
                    VALUES (@community,@id,@date,@purpose,@amount,@evidence,@digest,@admission,@account,@subject,@basis)
                    ON CONFLICT (community_id,id) DO NOTHING;
                    """);
                insert.Parameters.AddWithValue("id", input.RequestId);
                insert.Parameters.AddWithValue("date", input.IncurredOn);
                insert.Parameters.AddWithValue("purpose", input.Purpose);
                insert.Parameters.AddWithValue("amount", input.Amount);
                insert.Parameters.AddWithValue("evidence", input.Evidence);
                insert.Parameters.AddWithValue("digest", digest);
                insert.Parameters.AddWithValue("admission", actor.AdmissionId);
                insert.Parameters.AddWithValue("account", actor.AccountId);
                insert.Parameters.AddWithValue("subject", actor.SubjectId);
                insert.Parameters.AddWithValue("basis", actor.Basis);
                return await insert.ExecuteNonQueryAsync(token) == 1;
            }, token);
            if (inserted)
                return "Recognized";
        }
        catch (Npgsql.PostgresException error) when (error.SqlState == Npgsql.PostgresErrorCodes.SerializationFailure)
        {
            // A concurrent request may have registered the expense. Read it in a fresh transaction.
        }

        return await RunAsync(community, async (connection, transaction) =>
        {
            await using var query = Command(connection, transaction, community, null, """
                SELECT digest FROM community_billing.expense WHERE community_id=@community AND id=@id;
                """);
            query.Parameters.AddWithValue("id", input.RequestId);
            return await query.ExecuteScalarAsync(token) switch
            {
                string recorded when recorded == digest => "Replayed",
                string => "Conflict",
                _ => "Retry"
            };
        }, token);
    }
}
