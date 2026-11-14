namespace CommunityOS.Modules.Community.Infrastructure;

public sealed record WaterBalancePoint(Guid Id, Guid? ParentId, string Designation, decimal? Volume,
    bool MissingStart, bool MissingEnd, bool InstallationChanged = false);
public sealed record WaterBalanceBranch(Guid Id, decimal? ChildrenVolume, decimal? Difference);
public sealed record WaterBalance(string Outcome, IReadOnlyList<WaterBalancePoint> Points,
    IReadOnlyList<WaterBalanceBranch> Branches, DateOnly? SplitOn = null);

public sealed partial class PostgresWaterStore
{
    public Task<WaterBalance> BalanceAsync(Guid community, DateOnly from, DateOnly until, CancellationToken token) =>
        RunAsync(community, async (connection, transaction) =>
        {
            await using var query = Query(connection, transaction, community, """
                WITH revision AS (
                    SELECT min(starts_on) AS split_on
                    FROM community_water.topology_revision
                    WHERE community_id=@community AND starts_on>@from AND starts_on<@until
                ), initial AS (
                    SELECT max(starts_on) AS date FROM community_water.topology_revision
                    WHERE community_id=@community AND starts_on<=@from
                )
                SELECT revision.split_on, n.point_id, n.parent_id, p.designation, opening.value_m3, closing.value_m3,
                    first_installation.id IS NOT NULL AND last_installation.id IS NOT NULL
                        AND first_installation.id <> last_installation.id
                FROM revision CROSS JOIN initial
                LEFT JOIN community_water.topology_point n ON n.community_id=@community AND n.starts_on=initial.date
                LEFT JOIN community_water.accounting_point p ON (p.community_id,p.id)=(n.community_id,n.point_id)
                LEFT JOIN community_water.installation first_installation
                    ON (first_installation.community_id,first_installation.point_id)=(n.community_id,n.point_id)
                    AND first_installation.starts_on<=@from AND (first_installation.ends_before IS NULL OR first_installation.ends_before>@from)
                LEFT JOIN community_water.installation last_installation
                    ON (last_installation.community_id,last_installation.point_id)=(n.community_id,n.point_id)
                    AND last_installation.starts_on<=@until AND (last_installation.ends_before IS NULL OR last_installation.ends_before>@until)
                LEFT JOIN community_water.reading opening ON (opening.community_id,opening.installation_id,opening.measured_on)=(first_installation.community_id,first_installation.id,@from)
                LEFT JOIN community_water.reading closing ON (closing.community_id,closing.installation_id,closing.measured_on)=(last_installation.community_id,last_installation.id,@until)
                ORDER BY p.designation,n.point_id;
                """);
            query.Parameters.AddWithValue("from", from);
            query.Parameters.AddWithValue("until", until);
            await using var reader = await query.ExecuteReaderAsync(token);
            await reader.ReadAsync(token);
            if (!reader.IsDBNull(0)) return new WaterBalance("TopologyChanged", [], [], reader.GetFieldValue<DateOnly>(0));
            if (reader.IsDBNull(1)) return new WaterBalance("NoTopology", [], []);

            var points = new List<WaterBalancePoint>();
            do
            {
                var first = ReadValue(reader, 4);
                var last = ReadValue(reader, 5);
                var installationChanged = reader.GetBoolean(6);
                points.Add(new(reader.GetGuid(1), reader.IsDBNull(2) ? null : reader.GetGuid(2), reader.GetString(3),
                    installationChanged ? null : last - first, first is null, last is null, installationChanged));
            } while (await reader.ReadAsync(token));
            var children = points.ToLookup(point => point.ParentId);
            var branches = points.Where(point => children.Contains(point.Id)).Select(point =>
            {
                var inputs = children[point.Id];
                decimal? sum = inputs.All(child => child.Volume.HasValue) ? inputs.Sum(child => child.Volume) : null;
                return new WaterBalanceBranch(point.Id, sum, point.Volume - sum);
            }).ToArray();
            return new WaterBalance("Ready", points, branches);
        }, token);
}
