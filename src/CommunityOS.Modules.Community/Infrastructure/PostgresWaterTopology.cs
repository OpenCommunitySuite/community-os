using Npgsql;

namespace CommunityOS.Modules.Community.Infrastructure;

public sealed record WaterPlacement(Guid PointId, Guid? ParentId);
public sealed record WaterTopology(DateOnly StartsOn, IReadOnlyList<WaterPlacement> Points);

public sealed partial class PostgresWaterStore
{
    public Task<TopologyPublicationOutcome> PublishTopologyAsync(Guid community, DateOnly date, Guid root,
        IReadOnlyDictionary<Guid, Guid> parents, ElectricityActor actor, CancellationToken token) =>
        RunAsync(community, async (connection, transaction) =>
        {
            await using var serialize = Query(connection, transaction, community,
                "SELECT pg_advisory_xact_lock(hashtextextended('water-topology:' || @community::text, 0));");
            await serialize.ExecuteNonQueryAsync(token);
            await using var check = Query(connection, transaction, community, """
                SELECT EXISTS (SELECT 1 FROM community_water.topology_revision
                    WHERE community_id=@community AND starts_on>=@date);
                """);
            check.Parameters.AddWithValue("date", date);
            if (await check.ExecuteScalarAsync(token) is true) return TopologyPublicationOutcome.DateConflict;

            var ids = parents.Keys.Append(root).ToArray();
            var points = new Dictionary<Guid, bool>();
            await using (var lookup = Query(connection, transaction, community, """
                SELECT id,plot_id IS NOT NULL FROM community_water.accounting_point
                WHERE community_id=@community AND id=ANY(@ids)
                    AND EXISTS (SELECT 1 FROM community_water.installation i
                        WHERE i.community_id=@community AND i.point_id=accounting_point.id AND i.starts_on<=@date);
                """))
            {
                lookup.Parameters.AddWithValue("ids", ids);
                lookup.Parameters.AddWithValue("date", date);
                await using var reader = await lookup.ExecuteReaderAsync(token);
                while (await reader.ReadAsync(token)) points.Add(reader.GetGuid(0), reader.GetBoolean(1));
            }
            if (points.Count != ids.Length || !points.TryGetValue(root, out var individual) || individual ||
                parents.Any(pair => pair.Value != root && (!points.TryGetValue(pair.Value, out var parentIndividual) ||
                    parentIndividual || !points[pair.Key] || parents[pair.Value] != root)))
                return TopologyPublicationOutcome.InvalidTree;

            await using var publish = Query(connection, transaction, community, """
                INSERT INTO community_water.topology_revision (community_id,starts_on,admission_id,account_id,subject_id,basis)
                VALUES (@community,@date,@admission,@account,@subject,@basis);
                INSERT INTO community_water.topology_point (community_id,starts_on,point_id,parent_id)
                SELECT @community,@date,id,nullif(parent,@empty) FROM unnest(@ids,@parents) AS links(id,parent);
                """);
            publish.Parameters.AddWithValue("date", date);
            publish.Parameters.AddWithValue("ids", ids);
            publish.Parameters.AddWithValue("parents", ids.Select(id => parents.GetValueOrDefault(id)).ToArray());
            publish.Parameters.AddWithValue("empty", Guid.Empty);
            BindActor(publish, actor);
            await publish.ExecuteNonQueryAsync(token);
            return TopologyPublicationOutcome.Published;
        }, token);

    public Task<WaterTopology?> TopologyOnAsync(Guid community, DateOnly date, CancellationToken token) =>
        RunAsync<WaterTopology?>(community, async (connection, transaction) =>
        {
            await using var query = Query(connection, transaction, community, """
                SELECT starts_on,point_id,parent_id FROM community_water.topology_point
                WHERE community_id=@community AND starts_on=(SELECT max(starts_on)
                    FROM community_water.topology_revision WHERE community_id=@community AND starts_on<=@date)
                ORDER BY parent_id NULLS FIRST,point_id;
                """);
            query.Parameters.AddWithValue("date", date);
            await using var reader = await query.ExecuteReaderAsync(token);
            if (!await reader.ReadAsync(token)) return null;
            var startsOn = reader.GetFieldValue<DateOnly>(0);
            var points = new List<WaterPlacement>();
            do { points.Add(new(reader.GetGuid(1), reader.IsDBNull(2) ? null : reader.GetGuid(2))); }
            while (await reader.ReadAsync(token));
            return new(startsOn, points);
        }, token);
}
