using System.Security.Cryptography;
using System.Text.Json;
using Npgsql;

namespace CommunityOS.Modules.Community.Infrastructure;

public sealed record OneOffInput(Guid RequestId, Guid[] Accounts, decimal Amount, string Purpose, string Reason, DateOnly DueOn);
public sealed record OneOffAccount(Guid Id, string Number, Guid? DebtorId, string? Debtor, string Status, Guid? PlotId = null);
public sealed record OneOffPlan(OneOffInput Input, IReadOnlyList<OneOffAccount> Accounts, string Digest)
{
    public bool Ready => Accounts.Count > 0 && Accounts.All(account => account.Status == "Ready");
    public decimal Total => Input.Amount * Accounts.Count;
}
public sealed record OneOffPosted(Guid Id, string Digest, JsonElement Snapshot, Guid Author, DateTime PostedAt);
public sealed record OneOffResult(string Outcome, OneOffPosted? Posted = null);

public sealed partial class PostgresBillingStore
{
    public Task<IReadOnlyList<OneOffAccount>> OneOffAccountsAsync(Guid community, CancellationToken token) =>
        RunAsync<IReadOnlyList<OneOffAccount>>(community,
            async (connection, transaction) => await ResolveAccountsAsync(connection, transaction, community, null, token), token);

    public Task<OneOffPlan> PreviewOneOffAsync(Guid community, OneOffInput input, CancellationToken token) =>
        RunAsync(community, (connection, transaction) => PreviewOneOffAsync(connection, transaction, community, input, token), token);

    public Task<IReadOnlyList<OneOffPosted>> OneOffHistoryAsync(Guid community, CancellationToken token) =>
        RunAsync<IReadOnlyList<OneOffPosted>>(community,
            async (connection, transaction) => await ReadOneOffAsync(connection, transaction, community, null, token), token);

    public async Task<OneOffResult> PostOneOffAsync(Guid community, OneOffInput input, string digest,
        ElectricityActor actor, CancellationToken token)
    {
        input = input with { Accounts = input.Accounts.Order().ToArray() };
        try
        {
            return await RunAsync<OneOffResult>(community, async (connection, transaction) =>
            {
                var existing = (await ReadOneOffAsync(connection, transaction, community, input.RequestId, token)).SingleOrDefault();
                if (existing is not null) return Replay(existing, input, digest);
                var plan = await PreviewOneOffAsync(connection, transaction, community, input, token);
                if (plan.Digest != digest) return new("StalePreview");
                if (!plan.Ready) return new("Incomplete");
                await using var command = Command(connection, transaction, community, null, """
                    WITH batch AS (
                        INSERT INTO community_billing.one_off_batch
                            (community_id,id,digest,snapshot,admission_id,account_id,subject_id,basis)
                        VALUES (@community,@id,@digest,@snapshot::jsonb,@admission,@actor,@subject,@basis)
                        RETURNING id
                    ), charges AS (
                        INSERT INTO community_billing.accrual
                            (community_id,id,one_off_id,personal_account_id,debtor_id,kind,amount_uah)
                        SELECT @community,gen_random_uuid(),batch.id,target.account,target.debtor,'one-off',@amount
                        FROM batch CROSS JOIN unnest(@accounts,@debtors) target(account,debtor)
                        RETURNING id
                    )
                    INSERT INTO community_billing.obligation (community_id,id,accrual_id)
                    SELECT @community,gen_random_uuid(),id FROM charges;
                    """);
                command.Parameters.AddWithValue("id", input.RequestId);
                command.Parameters.AddWithValue("digest", digest);
                command.Parameters.AddWithValue("snapshot", JsonSerializer.Serialize(plan, Json));
                command.Parameters.AddWithValue("admission", actor.AdmissionId);
                command.Parameters.AddWithValue("actor", actor.AccountId);
                command.Parameters.AddWithValue("subject", actor.SubjectId);
                command.Parameters.AddWithValue("basis", actor.Basis);
                command.Parameters.AddWithValue("amount", input.Amount);
                command.Parameters.AddWithValue("accounts", plan.Accounts.Select(account => account.Id).ToArray());
                command.Parameters.AddWithValue("debtors", plan.Accounts.Select(account => account.DebtorId!.Value).ToArray());
                await command.ExecuteNonQueryAsync(token);
                return new("Posted", (await ReadOneOffAsync(connection, transaction, community, input.RequestId, token)).Single());
            }, token);
        }
        catch (PostgresException error) when (error.SqlState == PostgresErrorCodes.SerializationFailure ||
            (error.SqlState == PostgresErrorCodes.UniqueViolation && error.ConstraintName == "one_off_batch_pkey"))
        {
            return await RunAsync(community, async (connection, transaction) =>
                Replay((await ReadOneOffAsync(connection, transaction, community, input.RequestId, token)).SingleOrDefault(), input, digest), token);
        }
    }

    private static OneOffResult Replay(OneOffPosted? existing, OneOffInput input, string digest) => existing switch
    {
        null => new("StalePreview"),
        { Digest: var stored } when stored == digest &&
            existing.Snapshot.GetProperty("input").Deserialize<OneOffInput>(Json) is { } saved &&
            saved.Accounts.SequenceEqual(input.Accounts) && saved with { Accounts = input.Accounts } == input =>
            new("Replayed", existing),
        _ => new("RequestConflict"),
    };

    private static async Task<OneOffPlan> PreviewOneOffAsync(NpgsqlConnection connection, NpgsqlTransaction transaction,
        Guid community, OneOffInput input, CancellationToken token)
    {
        input = input with { Accounts = input.Accounts.Order().ToArray() };
        var resolved = (await ResolveAccountsAsync(connection, transaction, community, input.Accounts, token))
            .ToDictionary(account => account.Id);
        var accounts = input.Accounts.Select(id => resolved.GetValueOrDefault(id) ??
            new(id, "", null, null, "Unavailable")).ToArray();
        return new(input, accounts, Convert.ToHexString(SHA256.HashData(
            JsonSerializer.SerializeToUtf8Bytes(new
            {
                Community = community, input.RequestId, AmountInKopiykas = decimal.ToInt64(input.Amount * 100),
                input.Purpose, input.Reason, input.DueOn, Accounts = accounts,
            }, Json))));
    }

    private static async Task<List<OneOffAccount>> ResolveAccountsAsync(NpgsqlConnection connection, NpgsqlTransaction transaction,
        Guid community, Guid[]? accounts, CancellationToken token)
    {
        await using var command = Command(connection, transaction, community, null, """
            SELECT a.id,a.number,owners.ids,s.display_name,a.plot_id
            FROM community_register.personal_account a
            CROSS JOIN LATERAL (
                SELECT array(SELECT o.subject_id FROM community_register.ownership o
                    WHERE (o.community_id,o.plot_id)=(a.community_id,a.plot_id) ORDER BY o.subject_id) ids
            ) owners
            LEFT JOIN community_register.subject s ON (s.community_id,s.id)=(a.community_id,owners.ids[1])
                AND cardinality(owners.ids)=1
            WHERE a.community_id=@community AND (@accounts IS NULL OR a.id=ANY(@accounts))
            ORDER BY a.number,a.id;
            """);
        command.Parameters.AddWithValue("accounts", NpgsqlTypes.NpgsqlDbType.Array | NpgsqlTypes.NpgsqlDbType.Uuid,
            (object?)accounts ?? DBNull.Value);
        await using var reader = await command.ExecuteReaderAsync(token);
        var result = new List<OneOffAccount>();
        while (await reader.ReadAsync(token))
        {
            var id = reader.GetGuid(0);
            var number = reader.GetString(1);
            result.Add(reader.IsDBNull(3) ? new(id, number, null, null, "AmbiguousDebtor", reader.GetGuid(4)) :
                new(id, number, reader.GetFieldValue<Guid[]>(2)[0], reader.GetString(3), "Ready", reader.GetGuid(4)));
        }
        return result;
    }

    private static async Task<List<OneOffPosted>> ReadOneOffAsync(NpgsqlConnection connection, NpgsqlTransaction transaction,
        Guid community, Guid? id, CancellationToken token)
    {
        await using var command = Command(connection, transaction, community, null, """
            SELECT id,digest,snapshot::text,account_id,posted_at FROM community_billing.one_off_batch
            WHERE community_id=@community AND (@id IS NULL OR id=@id)
            ORDER BY posted_at DESC,id LIMIT 100;
            """);
        command.Parameters.AddWithValue("id", NpgsqlTypes.NpgsqlDbType.Uuid, (object?)id ?? DBNull.Value);
        await using var reader = await command.ExecuteReaderAsync(token);
        var result = new List<OneOffPosted>();
        while (await reader.ReadAsync(token))
            result.Add(new(reader.GetGuid(0), reader.GetString(1), JsonSerializer.Deserialize<JsonElement>(reader.GetString(2)),
                reader.GetGuid(3), reader.GetDateTime(4)));
        return result;
    }
}
