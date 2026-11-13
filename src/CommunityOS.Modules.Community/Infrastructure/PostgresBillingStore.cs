using System.Data;
using System.Security.Cryptography;
using System.Text.Json;
using CommunityOS.Modules.Community.Application.Electricity;
using CommunityOS.Modules.Community.Application.Finance;
using Npgsql;

namespace CommunityOS.Modules.Community.Infrastructure;

public sealed record BillingPeriod(DateOnly From, DateOnly Until, DateOnly CalculatedOn, DateOnly DueOn);
public sealed record BillingFee(Guid Id, DateOnly From, DateOnly? Until, string Basis, decimal AmountUah);
public sealed record BillingLine(Guid AccountId, string AccountNumber, Guid? DebtorId, string Status,
    ChargePreview? Electricity, BillingFee? Fee);
public sealed record BillingPlan(BillingPeriod Period, IReadOnlyList<BillingLine> Lines)
{
    public bool Ready => Lines.Count > 0 && Lines.All(line => line.Status == "Ready");
}
public sealed record BillingSnapshot(BillingPlan Plan, string Digest);
public sealed record PostedBilling(Guid Id, string Digest, JsonElement Snapshot, Guid AccountId, DateTime PostedAt);
public sealed record BillingPosting(string Outcome, PostedBilling? Result = null);

public sealed partial class PostgresBillingStore(NpgsqlDataSource source)
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    public Task<BillingSnapshot> PreviewAsync(Guid community, BillingPeriod period, CancellationToken token) =>
        RunAsync(community, (connection, transaction) => CalculateAsync(connection, transaction, community, period, token), token);

    public Task<PostedBilling?> HistoryAsync(Guid community, BillingPeriod period, CancellationToken token) =>
        RunAsync(community, (connection, transaction) => ReadPostedAsync(connection, transaction, community, period, token), token);

    public async Task<BillingPosting> PostAsync(Guid community, BillingPeriod period, string digest,
        ElectricityActor actor, CancellationToken token)
    {
        try
        {
            return await RunAsync<BillingPosting>(community, async (connection, transaction) =>
            {
                var existing = await ReadPostedAsync(connection, transaction, community, period, token);
                if (existing is not null)
                    return existing.Digest == digest ? new("Replayed", existing) : new("PeriodAlreadyPosted");
                var snapshot = await CalculateAsync(connection, transaction, community, period, token);
                if (snapshot.Digest != digest) return new("StalePreview");
                if (!snapshot.Plan.Ready) return new("Incomplete");
                var id = Guid.CreateVersion7();
                await using var insert = Command(connection, transaction, community, period, """
                    INSERT INTO community_billing.posted_period
                        (community_id,id,starts_on,ends_on,calculated_on,due_on,digest,snapshot,admission_id,account_id,subject_id,basis)
                    VALUES (@community,@id,@from,@until,@calculated,@due,@digest,@snapshot::jsonb,@admission,@account,@subject,@basis);
                    """);
                insert.Parameters.AddWithValue("id", id);
                insert.Parameters.AddWithValue("digest", digest);
                insert.Parameters.AddWithValue("snapshot", JsonSerializer.Serialize(snapshot.Plan, Json));
                insert.Parameters.AddWithValue("admission", actor.AdmissionId);
                insert.Parameters.AddWithValue("account", actor.AccountId);
                insert.Parameters.AddWithValue("subject", actor.SubjectId);
                insert.Parameters.AddWithValue("basis", actor.Basis);
                await insert.ExecuteNonQueryAsync(token);
                foreach (var line in snapshot.Plan.Lines)
                {
                    await using var detail = Command(connection, transaction, community, period, """
                        WITH rows AS (
                            INSERT INTO community_billing.accrual
                                (community_id,id,period_id,personal_account_id,debtor_id,kind,amount_uah)
                            VALUES (@community,@electricity_id,@period,@account,@debtor,'electricity',@electricity),
                                   (@community,@fee_id,@period,@account,@debtor,'member-fee',@fee)
                            RETURNING id
                        )
                        INSERT INTO community_billing.obligation (community_id,id,accrual_id)
                        SELECT @community,gen_random_uuid(),id FROM rows WHERE id IS NOT NULL;
                        """);
                    detail.Parameters.AddWithValue("period", id);
                    detail.Parameters.AddWithValue("account", line.AccountId);
                    detail.Parameters.AddWithValue("debtor", line.DebtorId!.Value);
                    detail.Parameters.AddWithValue("electricity_id", Guid.CreateVersion7());
                    detail.Parameters.AddWithValue("fee_id", Guid.CreateVersion7());
                    detail.Parameters.AddWithValue("electricity", line.Electricity!.AmountUah!.Value);
                    detail.Parameters.AddWithValue("fee", line.Fee!.AmountUah);
                    await detail.ExecuteNonQueryAsync(token);
                }
                return new("Posted", await ReadPostedAsync(connection, transaction, community, period, token));
            }, token);
        }
        catch (PostgresException error) when (error.SqlState == PostgresErrorCodes.SerializationFailure ||
            (error.SqlState == PostgresErrorCodes.UniqueViolation &&
             error.ConstraintName == "posted_period_community_id_starts_on_ends_on_key"))
        {
            var existing = await HistoryAsync(community, period, token);
            return existing is null ? new("StalePreview") :
                existing.Digest == digest ? new("Replayed", existing) : new("PeriodAlreadyPosted");
        }
    }

    private static async Task<BillingSnapshot> CalculateAsync(NpgsqlConnection connection, NpgsqlTransaction transaction,
        Guid community, BillingPeriod period, CancellationToken token, Guid? account = null)
    {
        var tariffs = new List<PreviewTariff>();
        await using (var command = Command(connection, transaction, community, period, """
            SELECT id, applicable_from, applicable_until, basis, rates::text FROM community_billing.tariff
            WHERE community_id=@community AND applicable_from < @until
              AND (applicable_until IS NULL OR applicable_until > @from) ORDER BY id;
            """))
        await using (var reader = await command.ExecuteReaderAsync(token))
            while (await reader.ReadAsync(token))
                tariffs.Add(new(reader.GetGuid(0), reader.GetFieldValue<DateOnly>(1), DateOrNull(reader, 2), reader.GetString(3),
                    new SortedDictionary<string, decimal>(JsonSerializer.Deserialize<Dictionary<string, decimal>>(reader.GetString(4), Json)!,
                        StringComparer.Ordinal)));

        var fees = new List<BillingFee>();
        await using (var command = Command(connection, transaction, community, period, """
            SELECT id, applicable_from, applicable_until, basis, amount_uah FROM community_billing.member_fee
            WHERE community_id=@community AND applicable_from < @until
              AND (applicable_until IS NULL OR applicable_until > @from) ORDER BY id;
            """))
        await using (var reader = await command.ExecuteReaderAsync(token))
            while (await reader.ReadAsync(token))
                fees.Add(new(reader.GetGuid(0), reader.GetFieldValue<DateOnly>(1), DateOrNull(reader, 2), reader.GetString(3),
                    reader.GetDecimal(4)));
        var fee = fees.Count == 1 && fees[0].From <= period.From &&
            (fees[0].Until is null || fees[0].Until >= period.Until) ? fees[0] : null;

        var inputs = new List<AccountInput>();
        await using (var command = Command(connection, transaction, community, period, """
            SELECT a.id,a.number,owners.ids,i.id,i.starts_on,i.ends_before,m.register_mode,i.reading_multiplier
            FROM community_register.personal_account a
            CROSS JOIN LATERAL (
                SELECT array(SELECT o.subject_id FROM community_register.ownership o
                    WHERE o.community_id=a.community_id AND o.plot_id=a.plot_id ORDER BY o.subject_id) ids
            ) owners
            LEFT JOIN community_electricity.accounting_point p ON p.community_id=a.community_id AND p.plot_id=a.plot_id
            LEFT JOIN community_electricity.installation i ON i.community_id=p.community_id AND i.point_id=p.id
                AND i.starts_on <= @from AND (i.ends_before IS NULL OR i.ends_before > @from)
            LEFT JOIN community_electricity.meter m ON m.community_id=i.community_id AND m.id=i.meter_id
            WHERE a.community_id=@community AND (@account IS NULL OR a.id=@account) ORDER BY a.id,i.id;
            """))
        {
            command.Parameters.AddWithValue("account", NpgsqlTypes.NpgsqlDbType.Uuid, (object?)account ?? DBNull.Value);
            await using var reader = await command.ExecuteReaderAsync(token);
            while (await reader.ReadAsync(token))
                inputs.Add(new(reader.GetGuid(0), reader.GetString(1), reader.GetFieldValue<Guid[]>(2),
                    reader.IsDBNull(3) ? null : reader.GetGuid(3), DateOrNull(reader, 4), DateOrNull(reader, 5),
                    reader.IsDBNull(6) ? null : reader.GetString(6), reader.IsDBNull(7) ? 1m : reader.GetDecimal(7)));
        }

        var lines = new List<BillingLine>();
        foreach (var group in inputs.GroupBy(input => input.Id))
        {
            var input = group.First();
            Guid? debtor = input.Owners is [var owner] ? owner : null;
            ChargePreview? electricity = null;
            if (group.Count() == 1 && input.Installation is Guid installation)
            {
                var readings = await ReadBoundsAsync(connection, transaction, community, period, installation, token);
                electricity = ElectricityChargePreview.Calculate(period.From, period.Until, installation, input.Start!.Value,
                    input.End, input.Mode!, input.Multiplier, readings, tariffs);
            }
            var status = debtor is null ? "AmbiguousDebtor" : electricity is null ? "MissingInstallation" :
                electricity.Status != ChargePreviewStatus.Ready ? electricity.Status.ToString() :
                fee is null ? "MissingOrAmbiguousFee" : "Ready";
            lines.Add(new(input.Id, input.Number, debtor, status, electricity, fee));
        }
        var plan = new BillingPlan(period, lines);
        return new(plan, Convert.ToHexString(SHA256.HashData(JsonSerializer.SerializeToUtf8Bytes(plan, Json))));
    }

    private static async Task<List<ElectricityReading>> ReadBoundsAsync(NpgsqlConnection connection, NpgsqlTransaction transaction,
        Guid community, BillingPeriod period, Guid installation, CancellationToken token)
    {
        await using var command = Command(connection, transaction, community, period, """
            SELECT id,measured_on,value_kwh,source,recognition_rule,recognized_at,account_id,subject_id,channel
            FROM community_electricity.reading WHERE community_id=@community AND installation_id=@installation
                AND measured_on IN (@from,@until) ORDER BY measured_on,channel;
            """);
        command.Parameters.AddWithValue("installation", installation);
        await using var reader = await command.ExecuteReaderAsync(token);
        var result = new List<ElectricityReading>();
        while (await reader.ReadAsync(token))
            result.Add(new(reader.GetGuid(0), reader.GetFieldValue<DateOnly>(1), reader.GetDecimal(2), reader.GetString(3),
                reader.GetString(4), reader.GetDateTime(5), reader.GetGuid(6), reader.GetGuid(7), reader.GetString(8)));
        return result;
    }

    private static async Task<PostedBilling?> ReadPostedAsync(NpgsqlConnection connection, NpgsqlTransaction transaction,
        Guid community, BillingPeriod period, CancellationToken token)
    {
        await using var command = Command(connection, transaction, community, period, """
            SELECT id,digest,snapshot::text,account_id,posted_at FROM community_billing.posted_period
            WHERE community_id=@community AND starts_on=@from AND ends_on=@until;
            """);
        await using var reader = await command.ExecuteReaderAsync(token);
        return await reader.ReadAsync(token) ? new(reader.GetGuid(0), reader.GetString(1),
            JsonSerializer.Deserialize<JsonElement>(reader.GetString(2)), reader.GetGuid(3), reader.GetDateTime(4)) : null;
    }

    private async Task<T> RunAsync<T>(Guid community, Func<NpgsqlConnection, NpgsqlTransaction, Task<T>> action, CancellationToken token)
    {
        await using var connection = await source.OpenConnectionAsync(token);
        await using var transaction = await connection.BeginTransactionAsync(IsolationLevel.Serializable, token);
        await PostgresRegisterStore.SetCommunityScopeAsync(connection, transaction, community, token);
        var result = await action(connection, transaction);
        await transaction.CommitAsync(token);
        return result;
    }

    private static NpgsqlCommand Command(NpgsqlConnection connection, NpgsqlTransaction transaction,
        Guid community, BillingPeriod? period, string sql)
    {
        var command = new NpgsqlCommand(sql, connection, transaction);
        command.Parameters.AddWithValue("community", community);
        if (period is null) return command;
        command.Parameters.AddWithValue("from", period.From);
        command.Parameters.AddWithValue("until", period.Until);
        command.Parameters.AddWithValue("calculated", period.CalculatedOn);
        command.Parameters.AddWithValue("due", period.DueOn);
        return command;
    }

    private static DateOnly? DateOrNull(NpgsqlDataReader reader, int index) =>
        reader.IsDBNull(index) ? null : reader.GetFieldValue<DateOnly>(index);

    private sealed record AccountInput(Guid Id, string Number, Guid[] Owners, Guid? Installation,
        DateOnly? Start, DateOnly? End, string? Mode, decimal Multiplier);
}
