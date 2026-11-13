namespace CommunityOS.Modules.Community.Infrastructure;

public sealed record PeriodReconciliationLine(string Kind, decimal Charged, decimal Settled, decimal Outstanding, decimal Excess);

public sealed partial class PostgresBillingStore
{
    public Task<IReadOnlyList<PeriodReconciliationLine>?> ReconcilePeriodAsync(Guid community, Guid period, CancellationToken token) =>
        RunAsync<IReadOnlyList<PeriodReconciliationLine>?>(community, async (connection, transaction) =>
        {
            await using var command = Command(connection, transaction, community, null, """
                SELECT kind.name, coalesce(sum(o.amount_uah),0),
                    coalesce(sum(o.amount_uah - greatest(o.outstanding_uah,0)),0),
                    coalesce(sum(greatest(o.outstanding_uah,0)),0),
                    coalesce(sum(greatest(-o.outstanding_uah,0)),0)
                FROM community_billing.posted_period p
                CROSS JOIN (VALUES ('electricity'), ('member-fee')) kind(name)
                LEFT JOIN community_billing.accrual a
                    ON (a.community_id,a.period_id,a.kind)=(p.community_id,p.id,kind.name)
                LEFT JOIN community_billing.obligation_remainder o
                    ON (o.community_id,o.accrual_id)=(a.community_id,a.id)
                WHERE p.community_id=@community AND p.id=@period
                GROUP BY kind.name ORDER BY kind.name;
                """);
            command.Parameters.AddWithValue("period", period);
            await using var reader = await command.ExecuteReaderAsync(token);
            var lines = new List<PeriodReconciliationLine>();
            while (await reader.ReadAsync(token))
                lines.Add(new(reader.GetString(0), reader.GetDecimal(1), reader.GetDecimal(2), reader.GetDecimal(3), reader.GetDecimal(4)));
            return lines.Count == 0 ? null : lines;
        }, token);
}
