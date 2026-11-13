using Npgsql;

namespace CommunityOS.Modules.Community.Infrastructure;

public sealed record AdvanceInput(Guid RequestId, Guid SourceId, Guid? ObligationId, decimal Amount, string Reason, bool Release = false);
public sealed record AdvancePreview(string Outcome, string? Digest = null, decimal Available = 0, decimal? Outstanding = null);

public sealed partial class PostgresBillingStore
{
    public Task<AdvancePreview> PreviewAdvanceAsync(Guid community, AdvanceInput input, CancellationToken token) =>
        RunAsync(community, (connection, transaction) => InspectAdvanceAsync(connection, transaction, community, input, token), token);

    public Task<PaymentResult> ConfirmAdvanceAsync(Guid community, AdvanceInput input, string previewDigest,
        ElectricityActor actor, CancellationToken token)
    {
        var digest = Digest(new { Preview = previewDigest, Input = AdvanceIdentity(input) });
        var table = input.Release ? "member_fee_advance_release"
            : input.ObligationId is null ? "member_fee_advance" : "member_fee_advance_application";
        return WritePaymentAsync(community, input.RequestId, digest, table, async (connection, transaction) =>
        {
            var preview = await InspectAdvanceAsync(connection, transaction, community, input, token);
            if (preview.Outcome != "Ready" || preview.Digest != previewDigest) return new("StalePreview");
            await using var command = Command(connection, transaction, community, null, input.Release ? """
                INSERT INTO community_billing.member_fee_advance_release
                    (community_id,id,advance_id,amount_uah,reason,digest,admission_id,account_id,subject_id,basis)
                VALUES (@community,@id,@source,@amount,@reason,@digest,@admission,@account,@subject,@basis);
                """ : input.ObligationId is null ? """
                INSERT INTO community_billing.member_fee_advance
                    (community_id,id,payment_id,amount_uah,reason,digest,admission_id,account_id,subject_id,basis)
                VALUES (@community,@id,@source,@amount,@reason,@digest,@admission,@account,@subject,@basis);
                """ : """
                INSERT INTO community_billing.member_fee_advance_application
                    (community_id,id,advance_id,obligation_id,amount_uah,reason,digest,admission_id,account_id,subject_id,basis)
                VALUES (@community,@id,@source,@obligation,@amount,@reason,@digest,@admission,@account,@subject,@basis);
                """);
            BindPayment(command, input.RequestId, digest, input.Reason, actor);
            command.Parameters.AddWithValue("source", input.SourceId);
            command.Parameters.AddWithValue("amount", input.Amount);
            if (input.ObligationId is Guid obligation) command.Parameters.AddWithValue("obligation", obligation);
            await command.ExecuteNonQueryAsync(token);
            return new(input.Release ? "Released" : input.ObligationId is null ? "Reserved" : "Applied", input.RequestId);
        }, token);
    }

    private static async Task<AdvancePreview> InspectAdvanceAsync(NpgsqlConnection connection, NpgsqlTransaction transaction,
        Guid community, AdvanceInput input, CancellationToken token)
    {
        await using var command = Command(connection, transaction, community, null, input.Release ? """
            SELECT available_uah, NULL::numeric FROM community_billing.member_fee_advance_remainder
            WHERE community_id=@community AND id=@source;
            """ : input.ObligationId is null ? """
            SELECT available_uah, NULL::numeric FROM community_billing.payment_remainder
            WHERE community_id=@community AND id=@source;
            """ : """
            SELECT remaining.available_uah, o.outstanding_uah
            FROM community_billing.member_fee_advance a
            JOIN community_billing.member_fee_advance_remainder remaining USING (community_id,id)
            JOIN community_billing.payment p ON (p.community_id,p.id)=(a.community_id,a.payment_id)
            JOIN community_billing.obligation_remainder o ON o.community_id=a.community_id AND o.id=@obligation
            JOIN community_billing.accrual c ON (c.community_id,c.id)=(o.community_id,o.accrual_id)
            JOIN community_billing.posted_period period ON (period.community_id,period.id)=(c.community_id,c.period_id)
            WHERE a.community_id=@community AND a.id=@source AND c.kind='member-fee' AND c.debtor_id=p.payer_id
                AND period.posted_at >= a.recorded_at;
            """);
        command.Parameters.AddWithValue("source", input.SourceId);
        if (input.ObligationId is Guid obligation) command.Parameters.AddWithValue("obligation", obligation);
        await using var reader = await command.ExecuteReaderAsync(token);
        if (!await reader.ReadAsync(token)) return new("NotFound");
        var available = reader.GetDecimal(0);
        decimal? outstanding = reader.IsDBNull(1) ? null : reader.GetDecimal(1);
        if (input.Amount <= 0 || input.Amount > available || input.Amount > outstanding)
            return new("AmountExceeded", Available: available, Outstanding: outstanding);
        return new("Ready", Digest(new { community, Input = AdvanceIdentity(input), Available = Cents(available),
            Outstanding = outstanding is decimal debt ? Cents(debt) : (long?)null }), available, outstanding);
    }

    private static object AdvanceIdentity(AdvanceInput input) =>
        input.Release
            ? new { Operation = "release", input.RequestId, input.SourceId, Amount = Cents(input.Amount), input.Reason }
            : new { input.RequestId, input.SourceId, input.ObligationId, Amount = Cents(input.Amount), input.Reason };
}
