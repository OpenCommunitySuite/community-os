using Npgsql;

namespace CommunityOS.Modules.Community.Infrastructure;

public sealed record PaymentCorrectionInput(Guid RequestId, Guid PaymentId, decimal Amount, string Reason);
public sealed record PaymentCorrectionPreview(string Outcome, string? Digest = null, decimal Original = 0,
    decimal Current = 0, decimal Corrected = 0, decimal Difference = 0, decimal Available = 0);

public sealed partial class PostgresBillingStore
{
    public Task<PaymentCorrectionPreview> PreviewPaymentCorrectionAsync(Guid community, PaymentCorrectionInput input,
        CancellationToken token) =>
        RunAsync(community, (connection, transaction) => InspectCorrectionAsync(connection, transaction, community, input, token), token);

    public Task<PaymentResult> CorrectPaymentAsync(Guid community, PaymentCorrectionInput input, string previewDigest,
        ElectricityActor actor, CancellationToken token)
    {
        var digest = Digest(new { Preview = previewDigest, Input = CorrectionIdentity(input) });
        return WritePaymentAsync(community, input.RequestId, digest, "payment_correction", async (connection, transaction) =>
        {
            var preview = await InspectCorrectionAsync(connection, transaction, community, input, token);
            if (preview.Digest != previewDigest || preview.Outcome != "Ready") return new("StalePreview");
            await using var insert = Command(connection, transaction, community, null, """
                INSERT INTO community_billing.payment_correction
                    (community_id,id,payment_id,prior_amount,new_amount,reason,digest,admission_id,account_id,subject_id,basis)
                VALUES (@community,@id,@payment,@prior,@amount,@reason,@digest,@admission,@account,@subject,@basis);
                """);
            BindPayment(insert, input.RequestId, digest, input.Reason, actor);
            insert.Parameters.AddWithValue("payment", input.PaymentId);
            insert.Parameters.AddWithValue("prior", preview.Current);
            insert.Parameters.AddWithValue("amount", input.Amount);
            await insert.ExecuteNonQueryAsync(token);
            return new("Corrected", input.RequestId);
        }, token);
    }

    private static async Task<PaymentCorrectionPreview> InspectCorrectionAsync(NpgsqlConnection connection,
        NpgsqlTransaction transaction, Guid community, PaymentCorrectionInput input, CancellationToken token)
    {
        await using var command = Command(connection, transaction, community, null, """
            SELECT p.amount_uah,r.amount_uah,
                (SELECT c.id FROM community_billing.payment_correction c
                 WHERE (c.community_id,c.payment_id)=(p.community_id,p.id) ORDER BY c.revision DESC LIMIT 1),
                EXISTS (SELECT 1 FROM community_billing.cash_acceptance c WHERE (c.community_id,c.payment_id)=(p.community_id,p.id))
                    OR EXISTS (SELECT 1 FROM community_billing.bank_payment b WHERE (b.community_id,b.payment_id)=(p.community_id,p.id)),
                EXISTS (SELECT 1 FROM community_billing.allocation_batch a WHERE (a.community_id,a.payment_id)=(p.community_id,p.id))
            FROM community_billing.payment p JOIN community_billing.payment_remainder r USING (community_id,id)
            WHERE p.community_id=@community AND p.id=@payment;
            """);
        command.Parameters.AddWithValue("payment", input.PaymentId);
        await using var reader = await command.ExecuteReaderAsync(token);
        if (!await reader.ReadAsync(token)) return new("NotFound");
        if (reader.GetBoolean(3)) return new("UnsupportedChannel");
        if (reader.GetBoolean(4)) return new("AllocatedPayment");
        var original = reader.GetDecimal(0);
        var current = reader.GetDecimal(1);
        var difference = input.Amount - current;
        if (difference == 0) return new("Unchanged", null, original, current, current, 0, current);
        Guid? revision = reader.IsDBNull(2) ? null : reader.GetGuid(2);
        return new("Ready", Digest(new { community, Input = CorrectionIdentity(input), revision, Current = Cents(current) }),
            original, current, input.Amount, difference, input.Amount);
    }

    private static object CorrectionIdentity(PaymentCorrectionInput input) =>
        new { input.RequestId, input.PaymentId, Amount = Cents(input.Amount), input.Reason };
}
