using System.Security.Cryptography;
using System.Text.Json;
using Npgsql;

namespace CommunityOS.Modules.Community.Infrastructure;

public sealed record PaymentInput(Guid RequestId, Guid PayerId, DateOnly ReceivedOn, decimal Amount, string Reason);
public sealed record AllocationLine(Guid ObligationId, decimal Amount);
public sealed record AllocationInput(Guid RequestId, Guid PaymentId, string Reason, AllocationLine[] Lines);
public sealed record AllocationBalance(Guid ObligationId, decimal Amount, decimal Before, decimal After, string Account);
public sealed record AllocationPreview(string Outcome, string? Digest = null, decimal Before = 0, decimal After = 0,
    IReadOnlyList<AllocationBalance>? Lines = null);
public sealed record PaymentResult(string Outcome, Guid? Id = null);

public sealed partial class PostgresBillingStore
{
    public static string PaymentDigest(Guid community, PaymentInput input) =>
        Digest(new { community, input.RequestId, input.PayerId, input.ReceivedOn, Amount = Cents(input.Amount), input.Reason });

    public static string CashDigest(Guid community, PaymentInput input) =>
        Digest(new { Channel = "cash", Payment = PaymentDigest(community, input) });

    public Task<PaymentResult> RecordPaymentAsync(Guid community, PaymentInput input, ElectricityActor actor, CancellationToken token) =>
        RecordReceiptAsync(community, input, actor, false, token);

    public Task<PaymentResult> AcceptCashAsync(Guid community, PaymentInput input, ElectricityActor actor, CancellationToken token) =>
        RecordReceiptAsync(community, input, actor, true, token);

    private Task<PaymentResult> RecordReceiptAsync(Guid community, PaymentInput input, ElectricityActor actor, bool cash,
        CancellationToken token)
    {
        var digest = cash ? CashDigest(community, input) : PaymentDigest(community, input);
        return WritePaymentAsync(community, input.RequestId, digest, "payment", async (connection, transaction) =>
        {
            await using var command = Command(connection, transaction, community, null, """
                INSERT INTO community_billing.payment
                    (community_id,id,payer_id,received_on,amount_uah,reason,digest,admission_id,account_id,subject_id,basis)
                SELECT @community,@id,s.id,@date,@amount,@reason,@digest,@admission,@account,@subject,@basis
                FROM community_register.subject s WHERE s.community_id=@community AND s.id=@payer;
                """);
            BindPayment(command, input.RequestId, digest, input.Reason, actor);
            command.Parameters.AddWithValue("payer", input.PayerId);
            command.Parameters.AddWithValue("date", input.ReceivedOn);
            command.Parameters.AddWithValue("amount", input.Amount);
            if (await command.ExecuteNonQueryAsync(token) != 1) return new("NotFound");
            if (cash)
            {
                await using var acceptance = Command(connection, transaction, community, null, """
                    INSERT INTO community_billing.cash_acceptance
                        (community_id,id,payment_id,payer_id,accepted_on,amount_uah,reason,cashier_account_id,cashier_subject_id)
                    SELECT community_id,@acceptance,id,payer_id,received_on,amount_uah,reason,account_id,subject_id
                    FROM community_billing.payment WHERE community_id=@community AND id=@id;
                    """);
                acceptance.Parameters.AddWithValue("acceptance", Guid.CreateVersion7());
                acceptance.Parameters.AddWithValue("id", input.RequestId);
                await acceptance.ExecuteNonQueryAsync(token);
            }
            return new(cash ? "Accepted" : "Recorded", input.RequestId);
        }, token);
    }

    public Task<AllocationPreview> PreviewAllocationAsync(Guid community, AllocationInput input, CancellationToken token) =>
        RunAsync(community, (connection, transaction) => PreviewAllocationAsync(connection, transaction, community, input, token), token);

    public Task<PaymentResult> AllocateAsync(Guid community, AllocationInput input, string digest, ElectricityActor actor,
        CancellationToken token)
    {
        var requestDigest = Digest(new { digest, input.PaymentId, input.Reason,
            Lines = input.Lines.OrderBy(line => line.ObligationId).Select(line => new { line.ObligationId, Amount = Cents(line.Amount) }) });
        return WritePaymentAsync(community, input.RequestId, requestDigest, "allocation_batch", async (connection, transaction) =>
        {
            var preview = await PreviewAllocationAsync(connection, transaction, community, input, token);
            if (preview.Digest != digest) return new("StalePreview");
            await using var command = Command(connection, transaction, community, null, """
                WITH batch AS (
                    INSERT INTO community_billing.allocation_batch
                        (community_id,id,payment_id,reason,digest,admission_id,account_id,subject_id,basis)
                    VALUES (@community,@id,@payment,@reason,@digest,@admission,@account,@subject,@basis) RETURNING id
                )
                INSERT INTO community_billing.allocation (community_id,batch_id,obligation_id,amount_uah)
                SELECT @community,batch.id,line.obligation,line.amount FROM batch
                CROSS JOIN unnest(@obligations,@amounts) line(obligation,amount);
                """);
            BindPayment(command, input.RequestId, requestDigest, input.Reason, actor);
            command.Parameters.AddWithValue("payment", input.PaymentId);
            command.Parameters.AddWithValue("obligations", input.Lines.Select(line => line.ObligationId).ToArray());
            command.Parameters.AddWithValue("amounts", input.Lines.Select(line => line.Amount).ToArray());
            await command.ExecuteNonQueryAsync(token);
            return new("Allocated", input.RequestId);
        }, token);
    }

    public Task<JsonElement> PaymentDeskAsync(Guid community, CancellationToken token) =>
        RunAsync(community, async (connection, transaction) =>
        {
            await using var command = Command(connection, transaction, community, null, """
                SELECT jsonb_build_object(
                    'payers', coalesce((SELECT jsonb_agg(jsonb_build_object('id',id,'name',display_name) ORDER BY display_name,id)
                        FROM community_register.subject WHERE community_id=@community), '[]'),
                    'payments', coalesce((SELECT jsonb_agg(jsonb_build_object('id',p.id,'payerId',p.payer_id,
                        'receivedOn',p.received_on,'amount',r.amount_uah,'originalAmount',p.amount_uah,'available',r.available_uah,'reason',p.reason,
                        'corrections',coalesce((SELECT jsonb_agg(jsonb_build_object('id',c.id,'reason',c.reason,
                            'prior',c.prior_amount,'amount',c.new_amount,'author',c.account_id,'recordedAt',c.recorded_at)
                            ORDER BY c.revision) FROM community_billing.payment_correction c
                            WHERE (c.community_id,c.payment_id)=(p.community_id,p.id)),'[]'),
                        'author',p.account_id,'recordedAt',p.recorded_at,
                        'effectiveLines',coalesce((SELECT jsonb_agg(jsonb_build_object('batchId',e.batch_id,
                            'obligationId',e.obligation_id,'amount',e.amount_uah,'isTransfer',e.is_transfer)
                            ORDER BY e.batch_id,e.obligation_id,e.is_transfer)
                            FROM community_billing.effective_allocation e
                            WHERE (e.community_id,e.payment_id)=(p.community_id,p.id) AND e.amount_uah>0),'[]'),
                        'reallocations',coalesce((SELECT jsonb_agg(jsonb_build_object('id',t.id,'sourceBatchId',t.source_batch_id,
                            'sourceIsTransfer',t.source_is_transfer,'sourceObligationId',t.source_obligation_id,
                            'targetObligationId',t.target_obligation_id,'amount',t.amount_uah,'reason',t.reason,
                            'author',t.account_id,'recordedAt',t.recorded_at) ORDER BY t.recorded_at,t.id)
                            FROM community_billing.reallocation t WHERE (t.community_id,t.payment_id)=(p.community_id,p.id)),'[]'),
                        'bankTransactionId',(SELECT b.bank_transaction_id FROM community_billing.bank_payment b
                            WHERE (b.community_id,b.payment_id)=(p.community_id,p.id)),
                        'cashAcceptance',(SELECT jsonb_build_object('id',c.id,'paymentId',c.payment_id,'payerId',c.payer_id,
                            'acceptedOn',c.accepted_on,'amount',c.amount_uah,'reason',c.reason,
                            'cashier',c.cashier_account_id,'recordedAt',c.recorded_at)
                            FROM community_billing.cash_acceptance c
                            WHERE (c.community_id,c.payment_id)=(p.community_id,p.id)),
                        'allocations',coalesce((SELECT jsonb_agg(jsonb_build_object('id',b.id,'reason',b.reason,
                            'author',b.account_id,'recordedAt',b.recorded_at,'lines',
                            (SELECT jsonb_agg(jsonb_build_object('obligationId',l.obligation_id,'amount',l.amount_uah)
                             ORDER BY l.obligation_id) FROM community_billing.allocation l
                             WHERE (l.community_id,l.batch_id)=(b.community_id,b.id))) ORDER BY b.recorded_at,b.id)
                            FROM community_billing.allocation_batch b
                            WHERE (b.community_id,b.payment_id)=(p.community_id,p.id)), '[]'))
                        ORDER BY p.received_on DESC,p.id)
                        FROM community_billing.payment p JOIN community_billing.payment_remainder r USING (community_id,id)
                        WHERE p.community_id=@community), '[]'),
                    'obligations', coalesce((SELECT jsonb_agg(jsonb_build_object('id',o.id,'payerId',a.debtor_id,
                        'account',pa.number,'kind',a.kind,'outstanding',o.outstanding_uah) ORDER BY pa.number,o.id)
                        FROM community_billing.obligation_remainder o
                        JOIN community_billing.accrual a ON (a.community_id,a.id)=(o.community_id,o.accrual_id)
                        JOIN community_register.personal_account pa ON (pa.community_id,pa.id)=(a.community_id,a.personal_account_id)
                        WHERE o.community_id=@community), '[]'))::text;
                """);
            return JsonSerializer.Deserialize<JsonElement>((string)(await command.ExecuteScalarAsync(token))!);
        }, token);

    private static async Task<AllocationPreview> PreviewAllocationAsync(NpgsqlConnection connection, NpgsqlTransaction transaction,
        Guid community, AllocationInput input, CancellationToken token)
    {
        await using var payment = Command(connection, transaction, community, null, """
            SELECT payer_id,available_uah FROM community_billing.payment_remainder WHERE community_id=@community AND id=@payment;
            """);
        payment.Parameters.AddWithValue("payment", input.PaymentId);
        await using var reader = await payment.ExecuteReaderAsync(token);
        if (!await reader.ReadAsync(token)) return new("NotFound");
        var payer = reader.GetGuid(0);
        var available = reader.GetDecimal(1);
        await reader.DisposeAsync();
        var remaining = available - input.Lines.Sum(line => line.Amount);
        if (remaining < 0) return new("PaymentExceeded");
        await using var command = Command(connection, transaction, community, null, """
            SELECT o.id,o.outstanding_uah,p.number FROM community_billing.obligation_remainder o
            JOIN community_billing.accrual a ON (a.community_id,a.id)=(o.community_id,o.accrual_id)
            JOIN community_register.personal_account p ON (p.community_id,p.id)=(a.community_id,a.personal_account_id)
            WHERE o.community_id=@community AND a.debtor_id=@payer AND o.id=ANY(@ids) ORDER BY o.id;
            """);
        var amounts = input.Lines.ToDictionary(line => line.ObligationId, line => line.Amount);
        command.Parameters.AddWithValue("ids", amounts.Keys.ToArray());
        command.Parameters.AddWithValue("payer", payer);
        var lines = new List<AllocationBalance>();
        await using var obligations = await command.ExecuteReaderAsync(token);
        while (await obligations.ReadAsync(token))
        {
            var id = obligations.GetGuid(0);
            var before = obligations.GetDecimal(1);
            var amount = amounts[id];
            if (amount > before) return new("ObligationExceeded");
            lines.Add(new(id, amount, before, before - amount, obligations.GetString(2)));
        }
        if (lines.Count != amounts.Count) return new("NotFound");
        var digest = Digest(new { community, input.RequestId, input.PaymentId, input.Reason, Available = Cents(available),
            Lines = lines.Select(line => new { line.ObligationId, Amount = Cents(line.Amount), Before = Cents(line.Before), line.Account }) });
        return new("Ready", digest, available, remaining, lines);
    }

    private async Task<PaymentResult> WritePaymentAsync(Guid community, Guid id, string digest, string table,
        Func<NpgsqlConnection, NpgsqlTransaction, Task<PaymentResult>> write, CancellationToken token)
    {
        try
        {
            return await RunAsync(community, async (connection, transaction) =>
                await ReplayPaymentAsync(connection, transaction, community, id, digest, table, token) ??
                await write(connection, transaction), token);
        }
        catch (PostgresException error) when (error.SqlState == PostgresErrorCodes.SerializationFailure ||
            (error.SqlState == PostgresErrorCodes.UniqueViolation && error.ConstraintName == table + "_pkey"))
        {
            return await RunAsync(community, async (connection, transaction) =>
                await ReplayPaymentAsync(connection, transaction, community, id, digest, table, token) ?? new("StalePreview"), token);
        }
    }

    private static async Task<PaymentResult?> ReplayPaymentAsync(NpgsqlConnection connection, NpgsqlTransaction transaction,
        Guid community, Guid id, string digest, string table, CancellationToken token)
    {
        await using var command = Command(connection, transaction, community, null,
            $"SELECT digest FROM community_billing.{table} WHERE community_id=@community AND id=@id;");
        command.Parameters.AddWithValue("id", id);
        return await command.ExecuteScalarAsync(token) is string stored
            ? stored == digest ? new("Replayed", id) : new("RequestConflict") : null;
    }

    private static void BindPayment(NpgsqlCommand command, Guid id, string digest, string reason, ElectricityActor actor)
    {
        command.Parameters.AddWithValue("id", id);
        command.Parameters.AddWithValue("digest", digest);
        command.Parameters.AddWithValue("reason", reason);
        command.Parameters.AddWithValue("admission", actor.AdmissionId);
        command.Parameters.AddWithValue("account", actor.AccountId);
        command.Parameters.AddWithValue("subject", actor.SubjectId);
        command.Parameters.AddWithValue("basis", actor.Basis);
    }

    private static long Cents(decimal amount) => decimal.ToInt64(amount * 100);
    private static string Digest<T>(T value) => Convert.ToHexString(SHA256.HashData(JsonSerializer.SerializeToUtf8Bytes(value, Json)));
}
