using Npgsql;

namespace CommunityOS.Modules.Community.Infrastructure;

public sealed record WaterReplacement(Guid RequestId, Guid InstallationId, DateOnly EffectiveOn, string Designation, string Reason);
public sealed record WaterInstallation(Guid Id, string MeterDesignation, DateOnly StartsOn, DateOnly? EndsBefore, string? Reason);

public sealed partial class PostgresWaterStore
{
    public Task<IReadOnlyList<WaterInstallation>> InstallationsAsync(Guid community, Guid point, CancellationToken token) =>
        RunAsync<IReadOnlyList<WaterInstallation>>(community, async (connection, transaction) =>
        {
            await using var command = Query(connection, transaction, community, """
                SELECT i.id, m.designation, i.starts_on, i.ends_before, r.reason
                FROM community_water.installation i
                JOIN community_water.meter m ON (m.community_id,m.id)=(i.community_id,i.meter_id)
                LEFT JOIN community_water.replacement r ON (r.community_id,r.new_installation_id)=(i.community_id,i.id)
                WHERE i.community_id=@community AND i.point_id=@point ORDER BY i.starts_on DESC;
                """);
            command.Parameters.AddWithValue("point", point);
            await using var reader = await command.ExecuteReaderAsync(token);
            var installations = new List<WaterInstallation>();
            while (await reader.ReadAsync(token))
                installations.Add(new(reader.GetGuid(0), reader.GetString(1), reader.GetFieldValue<DateOnly>(2),
                    reader.IsDBNull(3) ? null : reader.GetFieldValue<DateOnly>(3), reader.IsDBNull(4) ? null : reader.GetString(4)));
            return installations;
        }, token);

    public async Task<ElectricityReplacementResult> ReplaceAsync(Guid community, WaterReplacement input,
        DateOnly today, ElectricityActor actor, CancellationToken token)
    {
        try
        {
            return await RunAsync<ElectricityReplacementResult>(community, async (connection, transaction) =>
            {
                await using var requestLock = Query(connection, transaction, community, """
                    SELECT pg_advisory_xact_lock(hashtextextended(@community::text || ':' || @request::text, 0));
                    """);
                requestLock.Parameters.AddWithValue("request", input.RequestId);
                await requestLock.ExecuteNonQueryAsync(token);

                await using var existing = Query(connection, transaction, community, """
                    SELECT r.old_installation_id, r.effective_on, m.designation, r.reason, r.new_installation_id
                    FROM community_water.replacement r
                    JOIN community_water.installation i ON (i.community_id, i.id) = (r.community_id, r.new_installation_id)
                    JOIN community_water.meter m ON (m.community_id, m.id) = (i.community_id, i.meter_id)
                    WHERE r.community_id = @community AND r.request_id = @request;
                    """);
                existing.Parameters.AddWithValue("request", input.RequestId);
                await using (var reader = await existing.ExecuteReaderAsync(token))
                {
                    if (await reader.ReadAsync(token))
                        return reader.GetGuid(0) == input.InstallationId && reader.GetFieldValue<DateOnly>(1) == input.EffectiveOn &&
                            reader.GetString(2) == input.Designation && reader.GetString(3) == input.Reason
                            ? new(ElectricityReplacementOutcome.Replayed, reader.GetGuid(4)) : new(ElectricityReplacementOutcome.Conflict);
                }

                await using var installation = Query(connection, transaction, community, """
                    SELECT i.point_id, i.starts_on, i.ends_before FROM community_water.installation i
                    WHERE i.community_id = @community AND i.id = @old FOR UPDATE OF i;
                    """);
                installation.Parameters.AddWithValue("old", input.InstallationId);
                Guid point;
                await using (var reader = await installation.ExecuteReaderAsync(token))
                {
                    if (!await reader.ReadAsync(token)) return new(ElectricityReplacementOutcome.Missing);
                    if (!reader.IsDBNull(2)) return new(ElectricityReplacementOutcome.Conflict);
                    if (input.EffectiveOn <= reader.GetFieldValue<DateOnly>(1) || input.EffectiveOn > today)
                        return new(ElectricityReplacementOutcome.InvalidDate);
                    point = reader.GetGuid(0);
                }

                await using var readings = Query(connection, transaction, community, """
                    SELECT EXISTS (SELECT 1 FROM community_water.reading WHERE community_id = @community
                        AND installation_id = @old AND measured_on >= @date);
                    """);
                readings.Parameters.AddWithValue("old", input.InstallationId);
                readings.Parameters.AddWithValue("date", input.EffectiveOn);
                if (await readings.ExecuteScalarAsync(token) is true) return new(ElectricityReplacementOutcome.ExistingReading);

                await using var replace = Query(connection, transaction, community, """
                    UPDATE community_water.installation SET ends_before = @date
                    WHERE community_id = @community AND id = @old;
                    INSERT INTO community_water.meter (community_id, id, designation)
                    VALUES (@community, @meter, @designation);
                    INSERT INTO community_water.installation
                        (community_id, id, point_id, meter_id, starts_on, admission_id, account_id, subject_id, basis)
                    VALUES (@community, @new, @point, @meter, @date, @admission, @account, @subject, @basis);
                    INSERT INTO community_water.replacement
                        (community_id, request_id, point_id, old_installation_id, new_installation_id, effective_on,
                         reason, admission_id, account_id, subject_id, basis)
                    VALUES (@community, @request, @point, @old, @new, @date, @reason, @admission, @account, @subject, @basis);
                    """);
                var next = Guid.CreateVersion7();
                replace.Parameters.AddWithValue("old", input.InstallationId);
                replace.Parameters.AddWithValue("new", next);
                replace.Parameters.AddWithValue("point", point);
                replace.Parameters.AddWithValue("meter", Guid.CreateVersion7());
                replace.Parameters.AddWithValue("date", input.EffectiveOn);
                replace.Parameters.AddWithValue("designation", input.Designation);
                replace.Parameters.AddWithValue("request", input.RequestId);
                replace.Parameters.AddWithValue("reason", input.Reason);
                BindActor(replace, actor);
                await replace.ExecuteNonQueryAsync(token);
                return new(ElectricityReplacementOutcome.Replaced, next);
            }, token);
        }
        catch (PostgresException error) when (error.SqlState == PostgresErrorCodes.UniqueViolation &&
            error.TableName is "meter" or "installation" or "replacement")
        {
            return new(ElectricityReplacementOutcome.Conflict);
        }
    }
}
