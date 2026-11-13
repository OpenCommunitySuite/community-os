namespace CommunityOS.Modules.Community.Infrastructure;

public sealed record PeriodReconciliationLine(string Kind, decimal Charged, decimal Settled, decimal Outstanding, decimal Excess);
public sealed record PeriodReconciliationDetail(Guid ObligationId, string Account, string Kind,
    decimal Charged, decimal Settled, decimal Outstanding, decimal Excess);
public sealed record PeriodReconciliation(IReadOnlyList<PeriodReconciliationLine> Totals,
    IReadOnlyList<PeriodReconciliationDetail> Details);

public sealed partial class PostgresBillingStore
{
    public Task<PeriodReconciliation?> ReconcilePeriodAsync(Guid community, Guid period, CancellationToken token) =>
        RunAsync<PeriodReconciliation?>(community, async (connection, transaction) =>
        {
            await using var command = Command(connection, transaction, community, null, """
                SELECT o.id, coalesce(line->>'accountNumber', pa.number) AS account, a.kind, o.amount_uah,
                    o.amount_uah - greatest(o.outstanding_uah,0),
                    greatest(o.outstanding_uah,0), greatest(-o.outstanding_uah,0)
                FROM community_billing.posted_period p
                LEFT JOIN community_billing.accrual a
                    ON (a.community_id,a.period_id)=(p.community_id,p.id)
                LEFT JOIN community_billing.obligation_remainder o
                    ON (o.community_id,o.accrual_id)=(a.community_id,a.id)
                LEFT JOIN community_register.personal_account pa
                    ON (pa.community_id,pa.id)=(a.community_id,a.personal_account_id)
                LEFT JOIN LATERAL jsonb_array_elements(p.snapshot->'lines') line
                    ON line->>'accountId'=a.personal_account_id::text
                WHERE p.community_id=@community AND p.id=@period
                ORDER BY account,a.kind,o.id;
                """);
            command.Parameters.AddWithValue("period", period);
            await using var reader = await command.ExecuteReaderAsync(token);
            if (!await reader.ReadAsync(token)) return null;
            var details = new List<PeriodReconciliationDetail>();
            do
            {
                if (!reader.IsDBNull(0))
                    details.Add(new(reader.GetGuid(0), reader.GetString(1), reader.GetString(2), reader.GetDecimal(3),
                        reader.GetDecimal(4), reader.GetDecimal(5), reader.GetDecimal(6)));
            } while (await reader.ReadAsync(token));
            var byKind = details.ToLookup(row => row.Kind);
            var totals = new[] { "electricity", "member-fee" }.Select(kind =>
            {
                var rows = byKind[kind];
                return new PeriodReconciliationLine(kind, rows.Sum(row => row.Charged), rows.Sum(row => row.Settled),
                    rows.Sum(row => row.Outstanding), rows.Sum(row => row.Excess));
            }).ToArray();
            return new(totals, details);
        }, token);
}
