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
        electricity.MapGet("/plots", (Guid community, HttpContext http, CancellationToken token) =>
            access.WithAccessAsync<IResult>(http.Request.Cookies[PlatformWeb.Cookie], community, RegisterPermission.ReadElectricity,
                async _ => Results.Ok(await store.ListPlotsAsync(community, token)), Results.StatusCode(403), token));
        electricity.MapGet("/plots/{plot:guid}/installations", (Guid community, Guid plot, HttpContext http,
            CancellationToken token) =>
            access.WithAccessAsync<IResult>(http.Request.Cookies[PlatformWeb.Cookie], community, RegisterPermission.ReadElectricity,
                async _ => Results.Ok(await store.InstallationsAsync(community, plot, token)), Results.StatusCode(403), token));
        electricity.MapPost("/installations/{installation:guid}/replacement", (Guid community, Guid installation,
            ReplacementInput input, HttpContext http, CancellationToken token) =>
        {
            if (installation == Guid.Empty || input.RequestId == Guid.Empty || input.EffectiveOn == default ||
                input.Designation?.Trim() is not { Length: > 0 and <= 128 } designation || designation.Contains('\0') ||
                input.Reason?.Trim() is not { Length: > 0 and <= 500 } reason || reason.Contains('\0'))
                return Task.FromResult<IResult>(Results.BadRequest());

            return access.WithAccessAsync<IResult>(http.Request.Cookies[PlatformWeb.Cookie], community,
                RegisterPermission.ReplaceElectricity, async actor =>
                {
                    var replacement = new ElectricityReplacement(input.RequestId, installation, input.EffectiveOn,
                        designation, reason);
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
                input.Designation?.Trim() is not { Length: > 0 and <= 128 } designation || designation.Contains('\0'))
            {
                return Task.FromResult<IResult>(Results.BadRequest());
            }

            return access.WithAccessAsync<IResult>(http.Request.Cookies[PlatformWeb.Cookie], community,
                RegisterPermission.SetupElectricity, async actor =>
                {
                    if (input.StartsOn > Today()) return Results.BadRequest(new { Outcome = "FutureDate" });
                    return await store.SetupAsync(community, plot, designation, input.StartsOn, Actor(actor), token, mode) switch
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

    private sealed record SetupInput(string? Designation, DateOnly StartsOn, string? RegisterMode);
    private sealed record ReadingInput(DateOnly Date, string? Value, string? Channel);
    private sealed record ReplacementInput(Guid RequestId, DateOnly EffectiveOn, string? Designation, string? Reason);
}
