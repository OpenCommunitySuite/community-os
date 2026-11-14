namespace CommunityOS.Modules.Community.Infrastructure;

public sealed record WaterVerification(DateOnly VerifiedOn, DateOnly DueOn, string Evidence, Guid AccountId, DateTime RecordedAt);
public sealed record WaterVerificationMeter(Guid Id, string Designation, string Point, bool Active,
    IReadOnlyList<WaterVerification> History);

public sealed partial class PostgresWaterStore
{
    public Task<IReadOnlyList<WaterVerificationMeter>> VerificationMetersAsync(Guid community, CancellationToken token) =>
        RunAsync<IReadOnlyList<WaterVerificationMeter>>(community, async (connection, transaction) =>
        {
            await using var command = Query(connection, transaction, community, """
                SELECT m.id,m.designation,p.designation,i.ends_before IS NULL,
                    v.verified_on,v.due_on,v.evidence,v.account_id,v.recorded_at
                FROM community_water.meter m
                JOIN community_water.installation i ON (i.community_id,i.meter_id)=(m.community_id,m.id)
                JOIN community_water.accounting_point p ON (p.community_id,p.id)=(i.community_id,i.point_id)
                LEFT JOIN community_water.meter_verification v ON (v.community_id,v.meter_id)=(m.community_id,m.id)
                WHERE m.community_id=@community ORDER BY p.designation,i.starts_on DESC,m.id,v.verified_on DESC;
                """);
            var meters = new List<WaterVerificationMeter>();
            List<WaterVerification> history = [];
            await using var reader = await command.ExecuteReaderAsync(token);
            while (await reader.ReadAsync(token))
            {
                var id = reader.GetGuid(0);
                if (meters.Count == 0 || meters[^1].Id != id)
                {
                    history = [];
                    meters.Add(new(id, reader.GetString(1), reader.GetString(2), reader.GetBoolean(3), history));
                }
                if (!reader.IsDBNull(4))
                    history.Add(new(reader.GetFieldValue<DateOnly>(4), reader.GetFieldValue<DateOnly>(5),
                        reader.GetString(6), reader.GetGuid(7), reader.GetDateTime(8)));
            }
            return meters;
        }, token);

    public Task<string> VerifyMeterAsync(Guid community, Guid meter, DateOnly verifiedOn, DateOnly dueOn, string evidence,
        ElectricityActor actor, CancellationToken token) =>
        RunAsync(community, async (connection, transaction) =>
        {
            await using var insert = Query(connection, transaction, community, """
                INSERT INTO community_water.meter_verification
                    (community_id,meter_id,verified_on,due_on,evidence,admission_id,account_id,subject_id,basis)
                SELECT @community,id,@verified,@due,@evidence,@admission,@account,@subject,@basis
                FROM community_water.meter WHERE community_id=@community AND id=@meter
                ON CONFLICT (community_id,meter_id,verified_on) DO NOTHING;
                """);
            insert.Parameters.AddWithValue("meter", meter);
            insert.Parameters.AddWithValue("verified", verifiedOn);
            insert.Parameters.AddWithValue("due", dueOn);
            insert.Parameters.AddWithValue("evidence", evidence);
            BindActor(insert, actor);
            if (await insert.ExecuteNonQueryAsync(token) == 1) return "Recorded";

            await using var existing = Query(connection, transaction, community, """
                SELECT due_on=@due AND evidence=@evidence FROM community_water.meter_verification
                WHERE community_id=@community AND meter_id=@meter AND verified_on=@verified;
                """);
            existing.Parameters.AddWithValue("meter", meter);
            existing.Parameters.AddWithValue("verified", verifiedOn);
            existing.Parameters.AddWithValue("due", dueOn);
            existing.Parameters.AddWithValue("evidence", evidence);
            return await existing.ExecuteScalarAsync(token) switch
            {
                true => "Replayed",
                false => "Conflict",
                _ => "NotFound"
            };
        }, token);
}
