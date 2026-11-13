using Npgsql;

namespace CommunityOS.Modules.Community.Infrastructure;

public sealed record ReallocationInput(Guid RequestId, Guid PaymentId, Guid SourceBatchId, bool SourceIsTransfer,
    Guid SourceObligationId, Guid TargetObligationId, decimal Amount, string Reason);
public sealed record ReallocationPreview(string Outcome, string? Digest = null, decimal Available = 0,
    AllocationBalance? Source = null, AllocationBalance? Target = null, string? Reason = null,
    decimal SourceExcessBefore = 0, decimal SourceExcessAfter = 0);

public sealed partial class PostgresBillingStore
{
    public Task<ReallocationPreview> PreviewReallocationAsync(Guid community, ReallocationInput input, CancellationToken token) =>
        RunAsync(community, (connection, transaction) => InspectTransferAsync(connection, transaction, community, input, token), token);

    public Task<PaymentResult> ReallocateAsync(Guid community, ReallocationInput input, string previewDigest,
        ElectricityActor actor, CancellationToken token)
    {
        var digest = Digest(new { Preview = previewDigest, Input = TransferIdentity(input) });
        return WritePaymentAsync(community, input.RequestId, digest, "reallocation", async (connection, transaction) =>
        {
            var preview = await InspectTransferAsync(connection, transaction, community, input, token);
            if (preview.Digest != previewDigest || preview.Outcome != "Ready") return new("StalePreview");
            await using var insert = Command(connection, transaction, community, null, """
                INSERT INTO community_billing.reallocation
                    (community_id,id,payment_id,source_batch_id,source_is_transfer,source_obligation_id,target_obligation_id,
                     amount_uah,reason,digest,admission_id,account_id,subject_id,basis)
                VALUES (@community,@id,@payment,@batch,@transfer,@source,@target,@amount,@reason,@digest,@admission,@account,@subject,@basis);
                """);
            BindPayment(insert, input.RequestId, digest, input.Reason, actor);
            BindTransfer(insert, input);
            insert.Parameters.AddWithValue("amount", input.Amount);
            await insert.ExecuteNonQueryAsync(token);
            return new("Reallocated", input.RequestId);
        }, token);
    }

    private static async Task<ReallocationPreview> InspectTransferAsync(NpgsqlConnection connection, NpgsqlTransaction transaction,
        Guid community, ReallocationInput input, CancellationToken token)
    {
        await using var command = Command(connection, transaction, community, null, """
            SELECT e.amount_uah,src.outstanding_uah,dst.outstanding_uah,sp.number,dp.number,p.available_uah,
                (SELECT coalesce(sum(o.amount_uah),0) FROM community_billing.overpayment_recognition o
                 WHERE (o.community_id,o.obligation_id)=(src.community_id,src.id))
            FROM community_billing.effective_allocation e
            JOIN community_billing.payment_remainder p ON (p.community_id,p.id)=(e.community_id,e.payment_id)
            JOIN community_billing.obligation_remainder src ON (src.community_id,src.id)=(e.community_id,e.obligation_id)
            JOIN community_billing.obligation_remainder dst ON dst.community_id=e.community_id AND dst.id=@target
            JOIN community_billing.accrual sa ON (sa.community_id,sa.id)=(src.community_id,src.accrual_id)
            JOIN community_billing.accrual da ON (da.community_id,da.id)=(dst.community_id,dst.accrual_id)
            JOIN community_register.personal_account sp ON (sp.community_id,sp.id)=(sa.community_id,sa.personal_account_id)
            JOIN community_register.personal_account dp ON (dp.community_id,dp.id)=(da.community_id,da.personal_account_id)
            WHERE e.community_id=@community AND e.payment_id=@payment AND e.batch_id=@batch
              AND e.is_transfer=@transfer AND e.obligation_id=@source AND src.id<>dst.id
              AND sa.debtor_id=p.payer_id AND da.debtor_id=p.payer_id;
            """);
        BindTransfer(command, input);
        await using var reader = await command.ExecuteReaderAsync(token);
        if (!await reader.ReadAsync(token)) return new("NotFound");
        var available = reader.GetDecimal(0);
        var source = reader.GetDecimal(1);
        var target = reader.GetDecimal(2);
        if (input.Amount > available) return new("SourceExceeded");
        if (input.Amount > target) return new("ObligationExceeded");
        var sourceAfter = source + input.Amount;
        var recognized = reader.GetDecimal(6);
        if (recognized > 0 && sourceAfter > -recognized) return new("RecognizedOverpayment");
        var sourceLine = new AllocationBalance(input.SourceObligationId, input.Amount,
            Math.Max(0, source), Math.Max(0, sourceAfter), reader.GetString(3));
        var targetLine = new AllocationBalance(input.TargetObligationId, input.Amount, target, target - input.Amount, reader.GetString(4));
        return new("Ready", Digest(new { community, Input = TransferIdentity(input), Available = Cents(available),
            Source = Cents(source), Target = Cents(target), Unallocated = Cents(reader.GetDecimal(5)), Recognized = Cents(recognized) }),
            available, sourceLine, targetLine, input.Reason, Math.Max(0, -source), Math.Max(0, -sourceAfter));
    }

    private static object TransferIdentity(ReallocationInput input) => new
    {
        input.RequestId, input.PaymentId, input.SourceBatchId, input.SourceIsTransfer,
        input.SourceObligationId, input.TargetObligationId, Amount = Cents(input.Amount), input.Reason,
    };

    private static void BindTransfer(NpgsqlCommand command, ReallocationInput input)
    {
        command.Parameters.AddWithValue("payment", input.PaymentId);
        command.Parameters.AddWithValue("batch", input.SourceBatchId);
        command.Parameters.AddWithValue("transfer", input.SourceIsTransfer);
        command.Parameters.AddWithValue("source", input.SourceObligationId);
        command.Parameters.AddWithValue("target", input.TargetObligationId);
    }
}
