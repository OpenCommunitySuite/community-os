using CommunityOS.Modules.Community.Infrastructure;
using CommunityOS.Modules.Platform.Infrastructure;

internal static class CommunityBillingWeb
{
    public static void Map(RouteGroupBuilder routes, RegisterAccessStore access, PostgresBillingStore store)
    {
        var billing = routes.MapGroup("/billing/{community:guid}");
        CommunityBillingRecalculationWeb.Map(billing, access, store);
        billing.MapGet("/preview", (Guid community, DateOnly from, DateOnly until, DateOnly calculatedOn, DateOnly dueOn,
            HttpContext http, CancellationToken token) =>
        {
            var period = new BillingPeriod(from, until, calculatedOn, dueOn);
            if (!Valid(period)) return Task.FromResult<IResult>(Results.BadRequest());
            return access.WithAccessAsync<IResult>(http.Request.Cookies[PlatformWeb.Cookie], community, RegisterPermission.ReadBilling,
                async _ => Results.Ok(await store.PreviewAsync(community, period, token)), Results.StatusCode(403), token);
        });
        billing.MapGet("/history", (Guid community, DateOnly from, DateOnly until, HttpContext http, CancellationToken token) =>
            access.WithAccessAsync<IResult>(http.Request.Cookies[PlatformWeb.Cookie], community, RegisterPermission.ReadBilling,
                async _ => await store.HistoryAsync(community, new(from, until, default, default), token) is { } result
                    ? Results.Ok(result) : Results.NotFound(), Results.StatusCode(403), token));
        billing.MapPost("/post", (Guid community, PostInput input, HttpContext http, CancellationToken token) =>
        {
            if (input.Period is not { } period || !Valid(period) ||
                input.Digest is not { Length: 64 } digest || !digest.All(character => character is >= '0' and <= '9' or >= 'A' and <= 'F'))
                return Task.FromResult<IResult>(Results.BadRequest());
            return access.WithAccessAsync<IResult>(http.Request.Cookies[PlatformWeb.Cookie], community, RegisterPermission.PostBilling,
                async actor =>
                {
                    var result = await store.PostAsync(community, period, digest, CommunityElectricityWeb.Actor(actor), token);
                    return result.Result is null ? Results.Conflict(result) : Results.Ok(result);
                }, Results.StatusCode(403), token, billing: new(period.From, period.Until, digest));
        });
    }

    private static bool Valid(BillingPeriod period) => period.From != default && period.From < period.Until &&
        period.Until <= period.CalculatedOn && period.CalculatedOn <= period.DueOn;

    private sealed record PostInput(BillingPeriod? Period, string? Digest);
}
