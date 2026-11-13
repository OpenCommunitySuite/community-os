using System.Text.Json;
using Npgsql;

namespace CommunityOS.Modules.Community.Infrastructure;

public sealed record BankAccount(Guid Id, string Name, string Source);
public sealed record BankImportRow(BankStatementRow Row, string Status);
public sealed record BankImportPreview(string Outcome, string? Digest, IReadOnlyList<BankImportRow> Rows);
public sealed record BankRecognition(Guid TransactionId, Guid PayerId, string Reason);

public sealed partial class PostgresBillingStore
{
    public Task<JsonElement> BankDeskAsync(Guid community, CancellationToken token) =>
        RunAsync(community, async (connection, transaction) =>
        {
            await using var command = Command(connection, transaction, community, null, """
                SELECT jsonb_build_object(
                    'accounts', coalesce((SELECT jsonb_agg(jsonb_build_object('id',id,'name',name,'source',source) ORDER BY name,id)
                        FROM community_billing.bank_account WHERE community_id=@community),'[]'),
                    'payers', coalesce((SELECT jsonb_agg(jsonb_build_object('id',id,'name',display_name) ORDER BY display_name,id)
                        FROM community_register.subject WHERE community_id=@community),'[]'),
                    'transactions', coalesce((SELECT jsonb_agg(jsonb_build_object(
                        'id',t.id,'bankAccountId',t.bank_account_id,'externalId',t.external_id,'date',t.booked_on,
                        'direction',t.direction,'amount',t.amount_uah,'currency',t.currency,'raw',t.raw_line,
                        'line',t.line_number,'fileDigest',t.file_digest,'source',t.source,
                        'author',t.account_id,'recordedAt',t.recorded_at,'basis',t.basis,'paymentId',p.payment_id)
                        ORDER BY t.booked_on DESC,t.id)
                        FROM community_billing.bank_transaction t LEFT JOIN community_billing.bank_payment p
                          ON (p.community_id,p.bank_transaction_id)=(t.community_id,t.id)
                        WHERE t.community_id=@community),'[]'))::text;
                """);
            return JsonSerializer.Deserialize<JsonElement>((string)(await command.ExecuteScalarAsync(token))!);
        }, token);

    public static string BankRecognitionDigest(Guid community, BankRecognition input) =>
        Digest(new { Channel = "bank", Community = community, Input = input });

    public Task<PaymentResult> RecognizeBankPaymentAsync(Guid community, BankRecognition input, ElectricityActor actor,
        CancellationToken token)
    {
        var digest = BankRecognitionDigest(community, input);
        return WritePaymentAsync(community, input.TransactionId, digest, "payment", async (connection, transaction) =>
        {
            await using var command = Command(connection, transaction, community, null, """
                WITH recognized AS (
                    INSERT INTO community_billing.payment
                        (community_id,id,payer_id,received_on,amount_uah,reason,digest,admission_id,account_id,subject_id,basis)
                    SELECT t.community_id,@id,s.id,t.booked_on,t.amount_uah,@reason,@digest,@admission,@account,@subject,@basis
                    FROM community_billing.bank_transaction t
                    JOIN community_register.subject s ON s.community_id=t.community_id AND s.id=@payer
                    WHERE t.community_id=@community AND t.id=@id AND t.direction='incoming'
                    RETURNING community_id,id
                )
                INSERT INTO community_billing.bank_payment (community_id,bank_transaction_id,payment_id)
                SELECT community_id,@id,id FROM recognized;
                """);
            BindPayment(command, input.TransactionId, digest, input.Reason, actor);
            command.Parameters.AddWithValue("payer", input.PayerId);
            return await command.ExecuteNonQueryAsync(token) == 1
                ? new("Recognized", input.TransactionId) : new("Unavailable");
        }, token);
    }

    public static string BankImportDigest(Guid community, Guid account, string fileDigest) =>
        Digest(new { community, account, fileDigest });

    public Task<BankImportPreview> PreviewBankAsync(Guid community, Guid account, BankStatementCsv csv, CancellationToken token) =>
        RunAsync(community, (connection, transaction) => InspectBankAsync(connection, transaction, community, account, csv, token), token);

    public async Task<BankImportPreview> ImportBankAsync(Guid community, Guid account, BankStatementCsv csv, string digest,
        ElectricityActor actor, CancellationToken token)
    {
        try
        {
            return await RunAsync(community, async (connection, transaction) =>
            {
                var plan = await InspectBankAsync(connection, transaction, community, account, csv, token);
                if (plan.Outcome != "Ready") return plan;
                if (plan.Digest != digest) return plan with { Outcome = "StalePreview" };
                foreach (var item in plan.Rows.Where(item => item.Status == "New"))
                {
                    var row = item.Row;
                    await using var insert = Command(connection, transaction, community, null, """
                        INSERT INTO community_billing.bank_transaction
                            (community_id,id,bank_account_id,source,external_id,booked_on,direction,amount_uah,currency,
                             raw_line,line_number,file_digest,admission_id,account_id,subject_id,basis)
                        SELECT @community,@id,id,source,@external,@date,@direction,@amount,@currency,
                               @raw,@line,@file,@admission,@account,@subject,@basis
                        FROM community_billing.bank_account WHERE community_id=@community AND id=@bank;
                        """);
                    BindPayment(insert, Guid.CreateVersion7(), digest, row.Raw, actor);
                    insert.Parameters.AddWithValue("bank", account);
                    insert.Parameters.AddWithValue("external", row.ExternalId);
                    insert.Parameters.AddWithValue("date", row.Date!.Value);
                    insert.Parameters.AddWithValue("direction", row.Direction);
                    insert.Parameters.AddWithValue("amount", row.Amount!.Value);
                    insert.Parameters.AddWithValue("currency", row.Currency);
                    insert.Parameters.AddWithValue("raw", row.Raw);
                    insert.Parameters.AddWithValue("line", row.Line);
                    insert.Parameters.AddWithValue("file", csv.Digest);
                    await insert.ExecuteNonQueryAsync(token);
                }
                return plan with { Outcome = "Imported" };
            }, token);
        }
        catch (PostgresException error) when (error.SqlState == PostgresErrorCodes.SerializationFailure ||
            (error.SqlState == PostgresErrorCodes.UniqueViolation && error.ConstraintName == "bank_transaction_identity"))
        {
            var updated = await PreviewBankAsync(community, account, csv, token);
            return updated.Outcome == "Ready"
                ? updated with { Outcome = updated.Digest == digest && updated.Rows.All(row => row.Status == "Duplicate")
                    ? "Imported" : "StalePreview" }
                : updated;
        }
    }

    private static async Task<BankImportPreview> InspectBankAsync(NpgsqlConnection connection, NpgsqlTransaction transaction,
        Guid community, Guid account, BankStatementCsv csv, CancellationToken token)
    {
        await using var source = Command(connection, transaction, community, null, """
            SELECT source FROM community_billing.bank_account WHERE community_id=@community AND id=@bank;
            """);
        source.Parameters.AddWithValue("bank", account);
        if (await source.ExecuteScalarAsync(token) is not string bankSource)
            return new("NotFound", null, []);

        await using var existing = Command(connection, transaction, community, null, """
            SELECT external_id,booked_on,direction,amount_uah,currency
            FROM community_billing.bank_transaction
            WHERE community_id=@community AND bank_account_id=@bank AND source=@source AND external_id=ANY(@ids);
            """);
        existing.Parameters.AddWithValue("bank", account);
        existing.Parameters.AddWithValue("source", bankSource);
        existing.Parameters.AddWithValue("ids", csv.Rows.Select(row => row.ExternalId).Distinct().ToArray());
        var known = new Dictionary<string, (DateOnly? Date, string Direction, decimal? Amount, string Currency)>(StringComparer.Ordinal);
        await using (var reader = await existing.ExecuteReaderAsync(token))
            while (await reader.ReadAsync(token))
                known.Add(reader.GetString(0), (reader.GetFieldValue<DateOnly>(1), reader.GetString(2), reader.GetDecimal(3), reader.GetString(4)));
        var rows = new List<BankImportRow>();
        foreach (var row in csv.Rows)
        {
            var identity = (row.Date, row.Direction, row.Amount, row.Currency);
            var status = row.Error ?? (known.TryGetValue(row.ExternalId, out var prior)
                ? prior == identity ? "Duplicate" : "Conflict" : "New");
            if (status == "New") known.Add(row.ExternalId, identity);
            rows.Add(new(row, status));
        }
        var digest = Digest(new { Import = BankImportDigest(community, account, csv.Digest), Source = bankSource });
        return new(rows.All(row => row.Status is "New" or "Duplicate") ? "Ready" : "InvalidRows", digest, rows);
    }
}
