using Npgsql;

namespace CommunityOS.Modules.Community.Infrastructure;

public sealed record OverpaymentInput(Guid RequestId, Guid ObligationId, decimal Amount, string Reason);
public sealed record OverpaymentPreview(string Outcome, string? Digest = null, Guid? RecalculationId = null,
    decimal Excess = 0, decimal Recognized = 0, decimal Available = 0);

public sealed partial class PostgresBillingStore
{
    public Task<OverpaymentPreview> PreviewOverpaymentAsync(Guid community, OverpaymentInput input, CancellationToken token) =>
        RunAsync(community, (connection, transaction) => InspectOverpaymentAsync(connection, transaction, community, input, token), token);

    public Task<PaymentResult> RecognizeOverpaymentAsync(Guid community, OverpaymentInput input, string previewDigest,
        ElectricityActor actor, CancellationToken token)
    {
        var digest = Digest(new { Preview = previewDigest, Input = OverpaymentIdentity(input) });
        return WritePaymentAsync(community, input.RequestId, digest, "overpayment_recognition", async (connection, transaction) =>
        {
            var preview = await InspectOverpaymentAsync(connection, transaction, community, input, token);
            if (preview.Outcome != "Ready" || preview.Digest != previewDigest) return new("StalePreview");
            await using var command = Command(connection, transaction, community, null, """
                INSERT INTO community_billing.overpayment_recognition
                    (community_id,id,obligation_id,recalculation_id,amount_uah,reason,digest,admission_id,account_id,subject_id,basis)
                VALUES (@community,@id,@obligation,@recalculation,@amount,@reason,@digest,@admission,@account,@subject,@basis);
                """);
            BindPayment(command, input.RequestId, digest, input.Reason, actor);
            command.Parameters.AddWithValue("obligation", input.ObligationId);
            command.Parameters.AddWithValue("recalculation", preview.RecalculationId!.Value);
            command.Parameters.AddWithValue("amount", input.Amount);
            await command.ExecuteNonQueryAsync(token);
            return new("Recognized", input.RequestId);
        }, token);
    }

    private static async Task<OverpaymentPreview> InspectOverpaymentAsync(NpgsqlConnection connection,
        NpgsqlTransaction transaction, Guid community, OverpaymentInput input, CancellationToken token)
    {
        await using var command = Command(connection, transaction, community, null, """
            SELECT greatest(0,-o.outstanding_uah),r.id,
                (SELECT coalesce(sum(p.amount_uah),0) FROM community_billing.overpayment_recognition p
                 WHERE (p.community_id,p.obligation_id)=(o.community_id,o.id))
            FROM community_billing.obligation_remainder o
            LEFT JOIN LATERAL (
                SELECT id FROM community_billing.recalculation
                WHERE community_id=o.community_id AND accrual_id=o.accrual_id AND prior_amount<>new_amount
                ORDER BY revision DESC LIMIT 1
            ) r ON true
            WHERE o.community_id=@community AND o.id=@obligation;
            """);
        command.Parameters.AddWithValue("obligation", input.ObligationId);
        await using var reader = await command.ExecuteReaderAsync(token);
        if (!await reader.ReadAsync(token)) return new("NotFound");
        var excess = reader.GetDecimal(0);
        var recognized = reader.GetDecimal(2);
        var available = Math.Max(0, excess - recognized);
        if (reader.IsDBNull(1) || input.Amount > available) return new("ExcessExceeded", Excess: excess,
            Recognized: recognized, Available: available);
        var recalculation = reader.GetGuid(1);
        var digest = Digest(new { community, Input = OverpaymentIdentity(input), recalculation, Excess = Cents(excess),
            Recognized = Cents(recognized) });
        return new("Ready", digest, recalculation, excess, recognized, available);
    }

    private static object OverpaymentIdentity(OverpaymentInput input) =>
        new { input.RequestId, input.ObligationId, Amount = Cents(input.Amount), input.Reason };
}
