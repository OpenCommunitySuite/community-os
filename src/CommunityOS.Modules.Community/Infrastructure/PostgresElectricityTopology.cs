using Npgsql;

namespace CommunityOS.Modules.Community.Infrastructure;

public sealed record ElectricityTopology(DateOnly StartsOn, IReadOnlyList<ElectricityTopologyPoint> Points);

public sealed record ElectricityTopologyPoint(Guid Id, short Depth, string Designation, Guid? PlotId,
    Guid? ParentPointId, Guid? SubstationId, string? SubstationDesignation);

public sealed record TopologySubstation(Guid Id, string Designation);
public sealed record TopologyPlacement(Guid PointId, short Depth, Guid? ParentPointId, Guid? SubstationId);
public enum TopologyPublicationOutcome { Published, InvalidTree, DateConflict }

public sealed partial class PostgresElectricityStore
{
    public Task<TopologyPublicationOutcome> PublishTopologyAsync(Guid community, DateOnly date,
        IReadOnlyList<TopologySubstation> substations, IReadOnlyList<TopologyPlacement> points, ElectricityActor actor,
        CancellationToken token)
    {
        var byId = new Dictionary<Guid, TopologyPlacement>();
        var stationIds = new HashSet<Guid>();
        foreach (var station in substations)
            if (station.Id == Guid.Empty || string.IsNullOrWhiteSpace(station.Designation) ||
                station.Designation.Length > 128 || station.Designation.Contains('\0') || !stationIds.Add(station.Id))
                return Task.FromResult(TopologyPublicationOutcome.InvalidTree);
        foreach (var point in points)
            if (point.PointId == Guid.Empty || !byId.TryAdd(point.PointId, point))
                return Task.FromResult(TopologyPublicationOutcome.InvalidTree);
        foreach (var point in points)
        {
            var valid = point switch
            {
                { Depth: 0, ParentPointId: null, SubstationId: Guid station } => stationIds.Contains(station),
                { Depth: 1 or 2, SubstationId: null, ParentPointId: Guid parent } =>
                    byId.TryGetValue(parent, out var parentPoint) && parentPoint.Depth == point.Depth - 1,
                _ => false
            };
            if (!valid) return Task.FromResult(TopologyPublicationOutcome.InvalidTree);
        }

        return RunAsync(community, async (connection, transaction) =>
        {
            await using var serialize = Query(connection, transaction, community, """
                SELECT pg_advisory_xact_lock(hashtextextended('electricity-topology:' || @community::text, 0));
                """);
            await serialize.ExecuteNonQueryAsync(token);
            await using var checkDate = Query(connection, transaction, community, """
                SELECT EXISTS (SELECT 1 FROM community_electricity.topology_revision
                    WHERE community_id = @community AND starts_on >= @date);
                """);
            checkDate.Parameters.AddWithValue("date", date);
            if (await checkDate.ExecuteScalarAsync(token) is true) return TopologyPublicationOutcome.DateConflict;

            var pointIds = points.Select(point => point.PointId).ToArray();
            var depths = points.Select(point => point.Depth).ToArray();
            await using var validate = Query(connection, transaction, community, """
                SELECT count(*) FROM unnest(@ids, @depths) requested(id, depth)
                JOIN community_electricity.accounting_point p ON p.community_id = @community AND p.id = requested.id
                WHERE (p.plot_id IS NOT NULL) = (requested.depth = 2);
                """);
            validate.Parameters.AddWithValue("ids", pointIds);
            validate.Parameters.AddWithValue("depths", depths);
            if (await validate.ExecuteScalarAsync(token) is not long count || count != points.Count)
                return TopologyPublicationOutcome.InvalidTree;

            var ids = substations.Select(s => s.Id).ToArray();
            var names = substations.Select(s => s.Designation).ToArray();
            await using var checkStations = Query(connection, transaction, community, """
                SELECT EXISTS (
                    SELECT 1 FROM unnest(@ids, @names) requested(id, name)
                    JOIN community_electricity.substation s ON s.community_id = @community AND s.id = requested.id
                    WHERE s.designation <> requested.name);
                """);
            checkStations.Parameters.AddWithValue("ids", ids);
            checkStations.Parameters.AddWithValue("names", names);
            if (await checkStations.ExecuteScalarAsync(token) is true) return TopologyPublicationOutcome.InvalidTree;

            await using var stations = Query(connection, transaction, community, """
                INSERT INTO community_electricity.substation (community_id, id, designation)
                SELECT @community, s.id, s.designation FROM unnest(@ids, @names) s(id, designation)
                ON CONFLICT (community_id, id) DO NOTHING;
                """);
            stations.Parameters.AddWithValue("ids", ids);
            stations.Parameters.AddWithValue("names", names);
            await stations.ExecuteNonQueryAsync(token);

            await using var revision = Query(connection, transaction, community, """
                INSERT INTO community_electricity.topology_revision
                    (community_id, starts_on, account_id, subject_id, admission_id, basis)
                VALUES (@community, @date, @account, @subject, @admission, @basis);
                """);
            revision.Parameters.AddWithValue("date", date);
            BindActor(revision, actor);
            await revision.ExecuteNonQueryAsync(token);

            await using var insert = Query(connection, transaction, community, """
                INSERT INTO community_electricity.topology_point
                    (community_id, starts_on, point_id, depth, parent_point_id, substation_id)
                SELECT @community, @date, p.id, p.depth, nullif(p.parent, @empty), nullif(p.station, @empty)
                FROM unnest(@ids, @depths, @parents, @stations) p(id, depth, parent, station);
                """);
            insert.Parameters.AddWithValue("date", date);
            insert.Parameters.AddWithValue("ids", pointIds);
            insert.Parameters.AddWithValue("depths", depths);
            insert.Parameters.AddWithValue("parents", points.Select(p => p.ParentPointId ?? Guid.Empty).ToArray());
            insert.Parameters.AddWithValue("stations", points.Select(p => p.SubstationId ?? Guid.Empty).ToArray());
            insert.Parameters.AddWithValue("empty", Guid.Empty);
            await insert.ExecuteNonQueryAsync(token);
            return TopologyPublicationOutcome.Published;
        }, token);
    }

    public Task<ElectricityTopology?> TopologyOnAsync(Guid community, DateOnly date, CancellationToken token) =>
        RunAsync<ElectricityTopology?>(community, async (connection, transaction) =>
        {
            await using var command = Query(connection, transaction, community, """
                WITH current_revision AS (
                    SELECT community_id, starts_on FROM community_electricity.topology_revision
                    WHERE community_id = @community AND starts_on <= @date
                    ORDER BY starts_on DESC LIMIT 1
                )
                SELECT r.starts_on, n.point_id, n.depth, coalesce(a.common_designation, p.number),
                    a.plot_id, n.parent_point_id, n.substation_id, s.designation
                FROM current_revision r
                LEFT JOIN community_electricity.topology_point n USING (community_id, starts_on)
                LEFT JOIN community_electricity.accounting_point a
                    ON (a.community_id, a.id) = (n.community_id, n.point_id)
                LEFT JOIN community_register.plot p ON (p.community_id, p.id) = (a.community_id, a.plot_id)
                LEFT JOIN community_electricity.substation s ON (s.community_id, s.id) = (n.community_id, n.substation_id)
                ORDER BY n.depth, n.point_id;
                """);
            command.Parameters.AddWithValue("date", date);
            await using var reader = await command.ExecuteReaderAsync(token);
            if (!await reader.ReadAsync(token)) return null;

            var startsOn = reader.GetFieldValue<DateOnly>(0);
            var points = new List<ElectricityTopologyPoint>();
            do
            {
                if (!reader.IsDBNull(1))
                    points.Add(new(reader.GetGuid(1), reader.GetInt16(2), reader.GetString(3),
                        OptionalId(reader, 4), OptionalId(reader, 5), OptionalId(reader, 6),
                        reader.IsDBNull(7) ? null : reader.GetString(7)));
            } while (await reader.ReadAsync(token));
            return new(startsOn, points);
        }, token);

    private static Guid? OptionalId(NpgsqlDataReader reader, int index) =>
        reader.IsDBNull(index) ? null : reader.GetGuid(index);
}
