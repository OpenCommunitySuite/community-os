namespace CommunityOS.Modules.Community.Infrastructure;

public sealed record WaterChargePreview(string Status, string AccountNumber, Guid? InstallationId = null,
    Guid? OpeningReadingId = null, Guid? ClosingReadingId = null, decimal? Volume = null,
    Guid? TariffId = null, string? Basis = null, decimal? Rate = null, decimal? AmountUah = null);
public sealed record WaterBillingAccount(Guid Id, string Number);

public sealed partial class PostgresBillingStore
{
    public Task<IReadOnlyList<WaterBillingAccount>> WaterBillingAccountsAsync(Guid community, CancellationToken token) =>
        RunAsync<IReadOnlyList<WaterBillingAccount>>(community, async (connection, transaction) =>
        {
            await using var query = Command(connection, transaction, community, null, """
                SELECT a.id,a.number FROM community_register.personal_account a
                JOIN community_water.accounting_point p ON (p.community_id,p.plot_id)=(a.community_id,a.plot_id)
                WHERE a.community_id=@community ORDER BY a.number,a.id;
                """);
            await using var reader = await query.ExecuteReaderAsync(token);
            var accounts = new List<WaterBillingAccount>();
            while (await reader.ReadAsync(token)) accounts.Add(new(reader.GetGuid(0), reader.GetString(1)));
            return accounts;
        }, token);

    public Task<WaterChargePreview?> PreviewWaterAsync(Guid community, Guid account, DateOnly from, DateOnly until,
        CancellationToken token) => RunAsync<WaterChargePreview?>(community, async (connection, transaction) =>
    {
        await using var query = Command(connection, transaction, community, new(from, until, until, until), """
            SELECT a.number, i.id, o.id, c.id, c.value_m3-o.value_m3,
                t.id, t.basis, t.rate_uah, t.applicable_from<=@from
                    AND (t.applicable_until IS NULL OR t.applicable_until>=@until),
                (SELECT count(*) FROM community_register.ownership own
                    WHERE (own.community_id,own.plot_id)=(a.community_id,a.plot_id))
            FROM community_register.personal_account a
            LEFT JOIN community_water.accounting_point p ON (p.community_id,p.plot_id)=(a.community_id,a.plot_id)
            LEFT JOIN community_water.installation i ON (i.community_id,i.point_id)=(p.community_id,p.id)
                AND i.starts_on<=@from AND (i.ends_before IS NULL OR i.ends_before>@until)
            LEFT JOIN community_water.reading o ON (o.community_id,o.installation_id,o.measured_on)=(i.community_id,i.id,@from)
            LEFT JOIN community_water.reading c ON (c.community_id,c.installation_id,c.measured_on)=(i.community_id,i.id,@until)
            LEFT JOIN community_billing.water_tariff t ON t.community_id=a.community_id AND t.applicable_from<@until
                AND (t.applicable_until IS NULL OR t.applicable_until>@from)
            WHERE a.community_id=@community AND a.id=@account;
            """);
        query.Parameters.AddWithValue("account", account);
        await using var reader = await query.ExecuteReaderAsync(token);
        if (!await reader.ReadAsync(token)) return null;
        var number = reader.GetString(0);
        if (reader.GetInt64(9) != 1) return new("AmbiguousDebtor", number);
        if (reader.IsDBNull(4)) return new("MissingBoundary", number);
        var installation = reader.GetGuid(1);
        var opening = reader.GetGuid(2);
        var closing = reader.GetGuid(3);
        var volume = reader.GetDecimal(4);
        var preview = new WaterChargePreview("MissingTariff", number, installation, opening, closing, volume);
        if (reader.IsDBNull(5)) return preview;
        var coversPeriod = reader.GetBoolean(8);
        var rate = reader.GetDecimal(7);
        var ready = preview with
        {
            Status = "Ready", TariffId = reader.GetGuid(5), Basis = reader.GetString(6),
            Rate = rate, AmountUah = decimal.Round(volume * rate, 2, MidpointRounding.AwayFromZero)
        };
        if (await reader.ReadAsync(token)) return preview with { Status = "AmbiguousTariff" };
        return coversPeriod ? ready : preview with { Status = "TariffChanges" };
    }, token);
}
