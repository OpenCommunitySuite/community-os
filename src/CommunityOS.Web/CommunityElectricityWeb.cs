using System.Globalization;
using CommunityOS.Modules.Community.Application.Electricity;
using CommunityOS.Modules.Community.Infrastructure;
using CommunityOS.Modules.Platform.Infrastructure;

internal static class CommunityElectricityWeb
{
    private static readonly TimeZoneInfo StandTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Europe/Kyiv");

    public static void Map(RouteGroupBuilder routes, RegisterAccessStore access, PostgresElectricityStore store)
    {
        var electricity = routes.MapGroup("/electricity/{community:guid}");
        electricity.MapGet("/topology", (Guid community, DateOnly date, HttpContext http, CancellationToken token) =>
            access.WithAccessAsync<IResult>(http.Request.Cookies[PlatformWeb.Cookie], community, RegisterPermission.ReadElectricity,
                async _ => Results.Ok(new { Topology = await store.TopologyOnAsync(community, date, token) }),
                Results.StatusCode(403), token));
        electricity.MapPost("/topology", (Guid community, TopologyInput input, HttpContext http, CancellationToken token) =>
        {
            if (input.StartsOn == default || input.Substations is not { Length: <= 1000 } stations ||
                input.Points is not { Length: <= 10000 } points ||
                stations.Any(s => s is null || s.Designation?.Trim() is not { Length: > 0 and <= 128 } name ||
                    name.Contains('\0')) || points.Any(p => p is null))
                return Task.FromResult<IResult>(Results.BadRequest());

            return access.WithAccessAsync<IResult>(http.Request.Cookies[PlatformWeb.Cookie], community,
                RegisterPermission.PublishElectricityTopology, async actor =>
                {
                    var outcome = await store.PublishTopologyAsync(community, input.StartsOn,
                        stations.Select(s => s with { Designation = s.Designation.Trim() }).ToArray(), points, Actor(actor), token);
                    return outcome switch
                    {
                        TopologyPublicationOutcome.Published => Results.NoContent(),
                        TopologyPublicationOutcome.DateConflict => Results.Conflict(new { Outcome = outcome.ToString() }),
                        _ => Results.BadRequest(new { Outcome = outcome.ToString() }),
                    };
                }, Results.StatusCode(403), token, electricity: new(community, input.StartsOn));
        });
        electricity.MapGet("/plots", (Guid community, HttpContext http, CancellationToken token) =>
            access.WithAccessAsync<IResult>(http.Request.Cookies[PlatformWeb.Cookie], community, RegisterPermission.ReadElectricity,
                async _ => Results.Ok(await store.ListPlotsAsync(community, token)), Results.StatusCode(403), token));
        electricity.MapGet("/common-points", (Guid community, HttpContext http, CancellationToken token) =>
            access.WithAccessAsync<IResult>(http.Request.Cookies[PlatformWeb.Cookie], community, RegisterPermission.ReadElectricity,
                async _ => Results.Ok(await store.ListCommonPointsAsync(community, token)), Results.StatusCode(403), token));
        electricity.MapGet("/common-points/{point:guid}/installations", (Guid community, Guid point, HttpContext http,
            CancellationToken token) =>
            access.WithAccessAsync<IResult>(http.Request.Cookies[PlatformWeb.Cookie], community, RegisterPermission.ReadElectricity,
                async _ => Results.Ok(await store.CommonInstallationsAsync(community, point, token)), Results.StatusCode(403), token));
        electricity.MapPost("/common-points", (Guid community, CommonSetupInput input, HttpContext http,
            CancellationToken token) =>
        {
            var mode = input.RegisterMode ?? ManualElectricity.Total;
            if (input.StartsOn == default || mode is not (ManualElectricity.Total or ManualElectricity.Dual) ||
                input.Designation?.Trim() is not { Length: > 0 and <= 128 } designation || designation.Contains('\0') ||
                input.PointDesignation?.Trim() is not { Length: > 0 and <= 128 } name || name.Contains('\0') ||
                input.Boundary?.Trim() is not { Length: > 0 and <= 500 } boundary || boundary.Contains('\0') ||
                !TryDetails(input.Details, input.StartsOn, out var details))
                return Task.FromResult<IResult>(Results.BadRequest());

            var point = new CommonElectricityPoint(Guid.CreateVersion7(), name, boundary);
            return access.WithAccessAsync<IResult>(http.Request.Cookies[PlatformWeb.Cookie], community,
                RegisterPermission.SetupCommonElectricity, async actor =>
                {
                    if (input.StartsOn > Today()) return Results.BadRequest(new { Outcome = "FutureDate" });
                    var result = await store.SetupCommonAsync(community, point, designation, input.StartsOn, Actor(actor), token, mode, details);
                    return result == ElectricitySetupOutcome.Created
                        ? Results.Created($"/community/electricity/{community}/common-points/{point.Id}/installations", new { point.Id })
                        : Results.Conflict(new { Outcome = "CommonPointConflict" });
                }, Results.StatusCode(403), token, electricity: new(point.Id, input.StartsOn, RegisterMode: mode));
        });
        electricity.MapGet("/plots/{plot:guid}/installations", (Guid community, Guid plot, HttpContext http,
            CancellationToken token) =>
            access.WithAccessAsync<IResult>(http.Request.Cookies[PlatformWeb.Cookie], community, RegisterPermission.ReadElectricity,
                async _ => Results.Ok(await store.InstallationsAsync(community, plot, token)), Results.StatusCode(403), token));
        electricity.MapPost("/installations/{installation:guid}/replacement", (Guid community, Guid installation,
            ReplacementInput input, HttpContext http, CancellationToken token) =>
        {
            if (installation == Guid.Empty || input.RequestId == Guid.Empty || input.EffectiveOn == default ||
                input.Designation?.Trim() is not { Length: > 0 and <= 128 } designation || designation.Contains('\0') ||
                input.Reason?.Trim() is not { Length: > 0 and <= 500 } reason || reason.Contains('\0') ||
                !TryDetails(input.Details, input.EffectiveOn, out var details))
                return Task.FromResult<IResult>(Results.BadRequest());

            return access.WithAccessAsync<IResult>(http.Request.Cookies[PlatformWeb.Cookie], community,
                RegisterPermission.ReplaceElectricity, async actor =>
                {
                    var replacement = new ElectricityReplacement(input.RequestId, installation, input.EffectiveOn,
                        designation, reason, details);
                    var result = await store.ReplaceAsync(community, replacement, Today(), Actor(actor), token);
                    var response = new { Outcome = result.Outcome.ToString(), result.InstallationId };
                    return result.Outcome switch
                    {
                        ElectricityReplacementOutcome.Replaced or ElectricityReplacementOutcome.Replayed => Results.Ok(response),
                        ElectricityReplacementOutcome.Missing => Results.NotFound(),
                        ElectricityReplacementOutcome.InvalidDate => Results.BadRequest(response),
                        _ => Results.Conflict(response),
                    };
                }, Results.StatusCode(403), token, electricity: new(installation, input.EffectiveOn, input.RequestId));
        });
        electricity.MapPost("/plots/{plot:guid}/installation", (Guid community, Guid plot, SetupInput input,
            HttpContext http, CancellationToken token) =>
        {
            var mode = input.RegisterMode ?? ManualElectricity.Total;
            if (plot == Guid.Empty || input.StartsOn == default ||
                mode is not (ManualElectricity.Total or ManualElectricity.Dual) ||
                input.Designation?.Trim() is not { Length: > 0 and <= 128 } designation || designation.Contains('\0') ||
                !TryDetails(input.Details, input.StartsOn, out var details))
            {
                return Task.FromResult<IResult>(Results.BadRequest());
            }

            return access.WithAccessAsync<IResult>(http.Request.Cookies[PlatformWeb.Cookie], community,
                RegisterPermission.SetupElectricity, async actor =>
                {
                    if (input.StartsOn > Today()) return Results.BadRequest(new { Outcome = "FutureDate" });
                    return await store.SetupAsync(community, plot, designation, input.StartsOn, Actor(actor), token, mode, details) switch
                    {
                        ElectricitySetupOutcome.Created => Results.NoContent(),
                        ElectricitySetupOutcome.MissingPlot => Results.NotFound(),
                        _ => Results.Conflict(new { Outcome = "InstallationConflict" }),
                    };
                }, Results.StatusCode(403), token, electricity: new(plot, input.StartsOn, RegisterMode: mode));
        });
        electricity.MapGet("/installations/{installation:guid}/readings", (Guid community, Guid installation,
            HttpContext http, CancellationToken token) =>
            access.WithAccessAsync<IResult>(http.Request.Cookies[PlatformWeb.Cookie], community, RegisterPermission.ReadElectricity,
                async _ => await store.SeriesAsync(community, installation, token) is { } series
                    ? Results.Ok(series) : Results.NotFound(), Results.StatusCode(403), token));
        electricity.MapPost("/installations/{installation:guid}/readings", (Guid community, Guid installation,
            ReadingInput input, HttpContext http, CancellationToken token) =>
        {
            if (installation == Guid.Empty || input.Date == default)
            {
                return Task.FromResult<IResult>(Results.BadRequest());
            }
            if (!TryReadValue(input.Value, out var value))
                return Task.FromResult<IResult>(Results.BadRequest(new { Outcome = "InvalidValue" }));
            var channel = input.Channel ?? ManualElectricity.Total;
            if (channel is not (ManualElectricity.Total or ManualElectricity.Day or ManualElectricity.Night))
                return Task.FromResult<IResult>(Results.BadRequest(new { Outcome = "UnsupportedChannel" }));

            return access.WithAccessAsync<IResult>(http.Request.Cookies[PlatformWeb.Cookie], community,
                RegisterPermission.RecognizeElectricity, async actor =>
                {
                    var result = await store.RecognizeAsync(community, installation, input.Date, value, Today(), Actor(actor), token, channel);
                    return result.Outcome switch
                    {
                        ReadingOutcome.Recognized or ReadingOutcome.AlreadyRecorded => Results.Ok(Response(result)),
                        ReadingOutcome.DateConflict or ReadingOutcome.Decreasing => Results.Conflict(Response(result)),
                        ReadingOutcome.NotFound => Results.NotFound(),
                        _ => Results.BadRequest(Response(result)),
                    };
                }, Results.StatusCode(403), token, electricity: new(installation, input.Date, Channel: channel));
        });
    }

    private static object Response(ElectricityRecognition result) =>
        new { Outcome = result.Outcome.ToString(), result.ReadingId };

    private static ElectricityActor Actor(RegisterActor actor) =>
        new(actor.AccountId, actor.SubjectId, actor.AdmissionId, actor.AdditionBasis!);

    private static DateOnly Today() => DateOnly.FromDateTime(TimeZoneInfo.ConvertTime(DateTimeOffset.UtcNow, StandTimeZone).DateTime);

    private static bool TryReadValue(string? text, out decimal value)
    {
        value = 0;
        if (text is not { Length: > 0 and <= 16 }) return false;
        var point = text.IndexOf('.');
        return (point < 0 || text.Length - point - 1 <= 3) &&
            decimal.TryParse(text, NumberStyles.AllowDecimalPoint, CultureInfo.InvariantCulture, out value);
    }

    private static bool TryDetails(DetailsInput? input, DateOnly startsOn, out MeterInstallationDetails details)
    {
        details = MeterInstallationDetails.Legacy;
        if (input is null) return true;
        var multiplier = 1m;
        if (input.Multiplier is { } text)
        {
            var point = text.IndexOf('.');
            if (text.Length is < 1 or > 14 || (point >= 0 && text.Length - point - 1 > 6) ||
                !decimal.TryParse(text, NumberStyles.AllowDecimalPoint, CultureInfo.InvariantCulture, out multiplier) ||
                !ManualElectricity.SupportsMultiplier(multiplier))
                return false;
        }

        var model = Optional(input.Model);
        var serial = Optional(input.SerialNumber);
        var location = Optional(input.Location);
        var seal = Optional(input.SealSerialNumber);
        if (model is null || serial is null || location is null || input.MountedOn is null ||
            !Valid(model, 128) || !Valid(serial, 128) || !Valid(location, 500) || !Valid(seal, 128) ||
            input.MountedOn == DateOnly.MinValue || input.MountedOn > startsOn)
            return false;

        details = new(model, serial, location, input.MountedOn, seal, multiplier);
        return true;

        static string? Optional(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
        static bool Valid(string? value, int limit) => value is null || (value.Length <= limit && !value.Contains('\0'));
    }

    private sealed record SetupInput(string? Designation, DateOnly StartsOn, string? RegisterMode, DetailsInput? Details);
    private sealed record TopologyInput(DateOnly StartsOn, TopologySubstation[]? Substations, TopologyPlacement[]? Points);
    private sealed record CommonSetupInput(string? PointDesignation, string? Boundary, string? Designation,
        DateOnly StartsOn, string? RegisterMode, DetailsInput? Details);
    private sealed record ReadingInput(DateOnly Date, string? Value, string? Channel);
    private sealed record ReplacementInput(Guid RequestId, DateOnly EffectiveOn, string? Designation, string? Reason, DetailsInput? Details);
    private sealed record DetailsInput(string? Model, string? SerialNumber, string? Location, DateOnly? MountedOn,
        string? SealSerialNumber, string? Multiplier);
}
