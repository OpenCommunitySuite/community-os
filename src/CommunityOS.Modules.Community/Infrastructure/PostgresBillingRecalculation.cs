using System.Security.Cryptography;
using System.Text.Json;
using CommunityOS.Modules.Community.Application.Finance;
using Npgsql;

namespace CommunityOS.Modules.Community.Infrastructure;

public sealed record AccrualChange(Guid Id, string Digest, decimal PriorAmount, decimal NewAmount, string Reason,
    Guid AccountId, DateTime RecordedAt, JsonElement Snapshot);
public sealed record RecalculationPlan(Guid AccrualId, Guid ObligationId, decimal OriginalAmount, decimal CurrentAmount,
    Guid? PreviousChange, string Reason, ChargePreview Calculation, decimal Difference);
public sealed record RecalculationResult(string Outcome, RecalculationPlan? Plan = null, string? Digest = null,
    AccrualChange? Change = null);
public sealed record PeriodAccrual(Guid Id, string AccountNumber, decimal OriginalAmount, decimal EffectiveAmount,
    IReadOnlyList<AccrualChange> Changes);

public sealed partial class PostgresBillingStore
{
    public Task<IReadOnlyList<PeriodAccrual>> AccrualsAsync(Guid community, Guid period, CancellationToken token) =>
        RunAsync<IReadOnlyList<PeriodAccrual>>(community, async (connection, transaction) =>
        {
            await using var command = Command(connection, transaction, community, null, """
                SELECT a.id, a.amount_uah, row->>'accountNumber', o.amount_uah
                FROM community_billing.accrual a
                JOIN community_billing.posted_period p ON (p.community_id,p.id)=(a.community_id,a.period_id)
                JOIN community_billing.effective_obligation o ON (o.community_id,o.accrual_id)=(a.community_id,a.id)
                CROSS JOIN LATERAL jsonb_array_elements(p.snapshot->'lines') row
                WHERE a.community_id=@community AND a.period_id=@period AND a.kind='electricity'
                  AND row->>'accountId'=a.personal_account_id::text ORDER BY a.id;
                """);
            command.Parameters.AddWithValue("period", period);
            var entries = new List<(Guid Id, decimal Amount, string Number, decimal EffectiveAmount)>();
            await using (var reader = await command.ExecuteReaderAsync(token))
                while (await reader.ReadAsync(token))
                    entries.Add((reader.GetGuid(0), reader.GetDecimal(1), reader.GetString(2), reader.GetDecimal(3)));
            var result = new List<PeriodAccrual>();
            foreach (var entry in entries)
            {
                var changes = await ChangesAsync(connection, transaction, community, entry.Id, token);
                result.Add(new(entry.Id, entry.Number, entry.Amount, entry.EffectiveAmount, changes));
            }
            return result;
        }, token);

    public Task<RecalculationResult> PreviewRecalculationAsync(Guid community, Guid accrual, string reason, CancellationToken token) =>
        RunAsync(community, (connection, transaction) => BuildRecalculationAsync(connection, transaction, community, accrual, reason, token), token);

    public async Task<RecalculationResult> ConfirmRecalculationAsync(Guid community, Guid accrual, string reason, string digest,
        ElectricityActor actor, CancellationToken token)
    {
        try
        {
            return await RunAsync<RecalculationResult>(community, async (connection, transaction) =>
            {
                var previous = (await ChangesAsync(connection, transaction, community, accrual, token)).FirstOrDefault(item => item.Digest == digest);
                if (previous is not null) return previous.Reason == reason ? new("Replayed", Change: previous) : new("StalePreview");
                var preview = await BuildRecalculationAsync(connection, transaction, community, accrual, reason, token);
                if (preview.Plan is not { } plan || preview.Digest != digest)
                    return new(preview.Outcome == "NotFound" ? "NotFound" : "StalePreview");
                await using var command = Command(connection, transaction, community, null, """
                    INSERT INTO community_billing.recalculation
                        (community_id,id,accrual_id,digest,prior_amount,new_amount,snapshot,reason,admission_id,account_id,subject_id,basis)
                    VALUES (@community,@id,@accrual,@digest,@prior,@amount,@snapshot::jsonb,@reason,@admission,@account,@subject,@basis)
                    RETURNING recorded_at;
                    """);
                var id = Guid.CreateVersion7();
                var snapshot = JsonSerializer.SerializeToElement(plan, Json);
                command.Parameters.AddWithValue("id", id);
                command.Parameters.AddWithValue("accrual", accrual);
                command.Parameters.AddWithValue("digest", digest);
                command.Parameters.AddWithValue("prior", plan.CurrentAmount);
                command.Parameters.AddWithValue("amount", plan.Calculation.AmountUah!.Value);
                command.Parameters.AddWithValue("snapshot", snapshot.GetRawText());
                command.Parameters.AddWithValue("reason", reason);
                command.Parameters.AddWithValue("admission", actor.AdmissionId);
                command.Parameters.AddWithValue("account", actor.AccountId);
                command.Parameters.AddWithValue("subject", actor.SubjectId);
                command.Parameters.AddWithValue("basis", actor.Basis);
                var recordedAt = (DateTime)(await command.ExecuteScalarAsync(token))!;
                return new(plan.Difference == 0 ? "Unchanged" : "Applied", Change:
                    new(id, digest, plan.CurrentAmount, plan.Calculation.AmountUah.Value, reason, actor.AccountId, recordedAt, snapshot));
            }, token);
        }
        catch (PostgresException error) when (error.SqlState == PostgresErrorCodes.SerializationFailure ||
            (error.SqlState == PostgresErrorCodes.UniqueViolation &&
             error.ConstraintName == "recalculation_community_id_accrual_id_digest_key"))
        {
            return await RunAsync<RecalculationResult>(community, async (connection, transaction) =>
            {
                var previous = (await ChangesAsync(connection, transaction, community, accrual, token))
                    .FirstOrDefault(item => item.Digest == digest && item.Reason == reason);
                return previous is null ? new("StalePreview") : new("Replayed", Change: previous);
            }, token);
        }
    }

    private static async Task<RecalculationResult> BuildRecalculationAsync(NpgsqlConnection connection,
        NpgsqlTransaction transaction, Guid community, Guid accrual, string reason, CancellationToken token)
    {
        await using var command = Command(connection, transaction, community, null, """
            SELECT a.personal_account_id,a.debtor_id,a.amount_uah,p.starts_on,p.ends_on,p.calculated_on,p.due_on,o.id
            FROM community_billing.accrual a
            JOIN community_billing.posted_period p ON (p.community_id,p.id)=(a.community_id,a.period_id)
            JOIN community_billing.obligation o ON (o.community_id,o.accrual_id)=(a.community_id,a.id)
            WHERE a.community_id=@community AND a.id=@accrual AND a.kind='electricity';
            """);
        command.Parameters.AddWithValue("accrual", accrual);
        await using var reader = await command.ExecuteReaderAsync(token);
        if (!await reader.ReadAsync(token)) return new("NotFound");
        var account = reader.GetGuid(0);
        var debtor = reader.GetGuid(1);
        var original = reader.GetDecimal(2);
        var period = new BillingPeriod(reader.GetFieldValue<DateOnly>(3), reader.GetFieldValue<DateOnly>(4),
            reader.GetFieldValue<DateOnly>(5), reader.GetFieldValue<DateOnly>(6));
        var obligation = reader.GetGuid(7);
        await reader.DisposeAsync();
        var fresh = (await CalculateAsync(connection, transaction, community, period, token, account)).Plan.Lines.SingleOrDefault();
        if (fresh?.DebtorId != debtor) return new("AmbiguousDebtor");
        if (fresh.Electricity is not { } electricity) return new("MissingInstallation");
        if (electricity.AmountUah is not decimal amount) return new(electricity.Status.ToString());
        var changes = await ChangesAsync(connection, transaction, community, accrual, token);
        var current = Effective(changes)?.NewAmount ?? original;
        var plan = new RecalculationPlan(accrual, obligation, original, current, changes.FirstOrDefault()?.Id, reason,
            electricity, amount - current);
        return new("Ready", plan, Convert.ToHexString(SHA256.HashData(JsonSerializer.SerializeToUtf8Bytes(plan, Json))));
    }

    private static AccrualChange? Effective(IEnumerable<AccrualChange> changes) =>
        changes.FirstOrDefault(change => change.PriorAmount != change.NewAmount);

    private static async Task<List<AccrualChange>> ChangesAsync(NpgsqlConnection connection, NpgsqlTransaction transaction,
        Guid community, Guid accrual, CancellationToken token)
    {
        await using var command = Command(connection, transaction, community, null, """
            SELECT id,digest,prior_amount,new_amount,reason,account_id,recorded_at,snapshot::text
            FROM community_billing.recalculation WHERE community_id=@community AND accrual_id=@accrual
            ORDER BY revision DESC;
            """);
        command.Parameters.AddWithValue("accrual", accrual);
        await using var reader = await command.ExecuteReaderAsync(token);
        var changes = new List<AccrualChange>();
        while (await reader.ReadAsync(token))
            changes.Add(new(reader.GetGuid(0), reader.GetString(1), reader.GetDecimal(2), reader.GetDecimal(3),
                reader.GetString(4), reader.GetGuid(5), reader.GetDateTime(6), JsonSerializer.Deserialize<JsonElement>(reader.GetString(7))));
        return changes;
    }
}
