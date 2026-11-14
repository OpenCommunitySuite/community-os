using CommunityOS.Modules.Community.Application.Electricity;
using CommunityOS.Modules.Community.Infrastructure;
using CommunityOS.Modules.Platform.Infrastructure;

internal static class CommunityWaterWeb
{
    public static void Map(RouteGroupBuilder routes, RegisterAccessStore access, PostgresWaterStore store)
    {
        var water = routes.MapGroup("/water/{community:guid}");
        water.MapGet("/balance", (Guid community, DateOnly from, DateOnly until, HttpContext http, CancellationToken token) =>
        {
            if (from == default || from >= until || until > CommunityElectricityWeb.Today())
                return Task.FromResult<IResult>(Results.BadRequest());
            return access.WithAccessAsync<IResult>(http.Request.Cookies[PlatformWeb.Cookie], community, RegisterPermission.ReadWater,
                async _ => Results.Ok(await store.BalanceAsync(community, from, until, token)), Results.StatusCode(403), token);
        });
        water.MapGet("/topology", (Guid community, DateOnly date, HttpContext http, CancellationToken token) =>
            access.WithAccessAsync<IResult>(http.Request.Cookies[PlatformWeb.Cookie], community, RegisterPermission.ReadWater,
                async _ => await store.TopologyOnAsync(community, date, token) is { } topology
                    ? Results.Ok(topology) : Results.Text("null", "application/json"), Results.StatusCode(403), token));
        water.MapPost("/topology", (Guid community, WaterTopology input, HttpContext http, CancellationToken token) =>
        {
            if (input.StartsOn == default || input.StartsOn > CommunityElectricityWeb.Today() ||
                input.Points is not { Count: > 0 and <= 2000 } || input.Points.Any(p => p is null ||
                    p.PointId == Guid.Empty || p.ParentId == Guid.Empty) ||
                input.Points.Select(p => p.PointId).Distinct().Count() != input.Points.Count)
                return Task.FromResult<IResult>(Results.BadRequest());
            var roots = input.Points.Where(p => p.ParentId is null).ToArray();
            if (roots.Length != 1) return Task.FromResult<IResult>(Results.BadRequest());
            var root = roots[0].PointId;
            var parents = input.Points.Where(p => p.ParentId is not null).ToDictionary(p => p.PointId, p => p.ParentId!.Value);
            return access.WithAccessAsync<IResult>(http.Request.Cookies[PlatformWeb.Cookie], community, RegisterPermission.SetupWater,
                async actor =>
                {
                    var result = await store.PublishTopologyAsync(community, input.StartsOn, root, parents,
                        CommunityElectricityWeb.Actor(actor), token);
                    var response = new { Outcome = result.ToString() };
                    return result == TopologyPublicationOutcome.Published ? Results.Ok(response) : Results.Conflict(response);
                }, Results.StatusCode(403), token, water: new(root, input.StartsOn, Topology: true));
        });
        water.MapGet("/points", (Guid community, HttpContext http, CancellationToken token) =>
            access.WithAccessAsync<IResult>(http.Request.Cookies[PlatformWeb.Cookie], community, RegisterPermission.ReadWater,
                async _ => Results.Ok(await store.ListAsync(community, token)), Results.StatusCode(403), token));
        water.MapGet("/plots", (Guid community, HttpContext http, CancellationToken token) =>
            access.WithAccessAsync<IResult>(http.Request.Cookies[PlatformWeb.Cookie], community, RegisterPermission.ReadWater,
                async _ => Results.Ok(await store.PlotsAsync(community, token)), Results.StatusCode(403), token));
        water.MapPost("/points", (Guid community, SetupInput input, HttpContext http, CancellationToken token) =>
        {
            var name = input.Designation?.Trim();
            var boundary = input.Boundary?.Trim();
            var meter = input.MeterDesignation?.Trim();
            if (input.StartsOn == default || input.StartsOn > CommunityElectricityWeb.Today() ||
                input.PlotId == Guid.Empty || !Valid(meter, 128) ||
                (input.PlotId is null && (!Valid(name, 128) || !Valid(boundary, 500))))
                return Task.FromResult<IResult>(Results.BadRequest());

            var point = Guid.CreateVersion7();
            var setup = new WaterSetup(point, input.PlotId, name ?? "", input.PlotId is null ? boundary : null, meter!, input.StartsOn);
            return access.WithAccessAsync<IResult>(http.Request.Cookies[PlatformWeb.Cookie], community, RegisterPermission.SetupWater,
                async actor => await store.SetupAsync(community, setup, CommunityElectricityWeb.Actor(actor), token) switch
                {
                    ElectricitySetupOutcome.Created => Results.Created($"/community/water/{community}/points", new { Id = point }),
                    ElectricitySetupOutcome.MissingPlot => Results.NotFound(),
                    _ => Results.Conflict(new { Outcome = "PointConflict" }),
                }, Results.StatusCode(403), token, water: new(point, input.StartsOn));
        });
        water.MapGet("/installations/{installation:guid}/readings", (Guid community, Guid installation, HttpContext http,
            CancellationToken token) =>
            access.WithAccessAsync<IResult>(http.Request.Cookies[PlatformWeb.Cookie], community, RegisterPermission.ReadWater,
                async _ => await store.SeriesAsync(community, installation, token) is { } series
                    ? Results.Ok(series) : Results.NotFound(), Results.StatusCode(403), token));
        water.MapPost("/installations/{installation:guid}/readings", (Guid community, Guid installation, ReadingInput input,
            HttpContext http, CancellationToken token) =>
        {
            if (installation == Guid.Empty || input.Date == default || !CommunityElectricityWeb.TryReadValue(input.Value, out var value))
                return Task.FromResult<IResult>(Results.BadRequest(new { Outcome = "InvalidValue" }));

            return access.WithAccessAsync<IResult>(http.Request.Cookies[PlatformWeb.Cookie], community, RegisterPermission.RecognizeWater,
                async actor =>
                {
                    var result = await store.RecognizeAsync(community, installation, input.Date, value,
                        CommunityElectricityWeb.Today(), CommunityElectricityWeb.Actor(actor), token);
                    var response = new { Outcome = result.Outcome.ToString(), result.ReadingId };
                    return result.Outcome switch
                    {
                        ReadingOutcome.Recognized or ReadingOutcome.AlreadyRecorded => Results.Ok(response),
                        ReadingOutcome.DateConflict or ReadingOutcome.Decreasing => Results.Conflict(response),
                        ReadingOutcome.NotFound => Results.NotFound(),
                        _ => Results.BadRequest(response),
                    };
                }, Results.StatusCode(403), token, water: new(installation, input.Date));
        });
    }

    private static bool Valid(string? value, int limit) =>
        value is { Length: > 0 } && value.Length <= limit && !value.Contains('\0');

    private sealed record SetupInput(Guid? PlotId, string? Designation, string? Boundary, string? MeterDesignation, DateOnly StartsOn);
    private sealed record ReadingInput(DateOnly Date, string? Value);
}
