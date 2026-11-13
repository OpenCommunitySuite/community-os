using CommunityOS.Modules.Community.Infrastructure;
using CommunityOS.Modules.Platform.Infrastructure;

internal static class CommunityBillingRecalculationWeb
{
    public static void Map(RouteGroupBuilder routes, RegisterAccessStore access, PostgresBillingStore store)
    {
        routes.MapGet("/periods/{period:guid}/accruals", (Guid community, Guid period, HttpContext http, CancellationToken token) =>
            access.WithAccessAsync<IResult>(http.Request.Cookies[PlatformWeb.Cookie], community, RegisterPermission.ReadBilling,
                async _ => Results.Ok(await store.AccrualsAsync(community, period, token)), Results.StatusCode(403), token));
        routes.MapPost("/accruals/{accrual:guid}/recalculation/preview", (Guid community, Guid accrual, Input input,
            HttpContext http, CancellationToken token) =>
        {
            if (Reason(input) is not { } reason) return Task.FromResult<IResult>(Results.BadRequest());
            return access.WithAccessAsync<IResult>(http.Request.Cookies[PlatformWeb.Cookie], community, RegisterPermission.ReadBilling,
                async _ => Response(await store.PreviewRecalculationAsync(community, accrual, reason, token)),
                Results.StatusCode(403), token);
        });
        routes.MapPost("/accruals/{accrual:guid}/recalculation/confirm", (Guid community, Guid accrual, Input input,
            HttpContext http, CancellationToken token) =>
        {
            if (Reason(input) is not { } reason || input.Digest is not { Length: 64 } digest ||
                !digest.All(character => character is >= '0' and <= '9' or >= 'A' and <= 'F'))
                return Task.FromResult<IResult>(Results.BadRequest());
            return access.WithAccessAsync<IResult>(http.Request.Cookies[PlatformWeb.Cookie], community, RegisterPermission.RecalculateBilling,
                async actor => Response(await store.ConfirmRecalculationAsync(community, accrual, reason, digest,
                    CommunityElectricityWeb.Actor(actor), token)), Results.StatusCode(403), token,
                recalculation: new(accrual, digest));
        });
    }

    private static IResult Response(RecalculationResult result) => result.Outcome switch
    {
        "NotFound" => Results.NotFound(result),
        "StalePreview" => Results.Conflict(result),
        _ => Results.Ok(result),
    };

    private static string? Reason(Input input) =>
        input.Reason?.Trim() is { Length: > 0 and <= 500 } reason && !reason.Contains('\0') ? reason : null;

    private sealed record Input(string? Reason, string? Digest);
}
