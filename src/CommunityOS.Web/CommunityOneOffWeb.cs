using CommunityOS.Modules.Community.Infrastructure;
using CommunityOS.Modules.Platform.Infrastructure;

internal static class CommunityOneOffWeb
{
    public static void Map(RouteGroupBuilder billing, RegisterAccessStore access, PostgresBillingStore store)
    {
        var routes = billing.MapGroup("/one-off");
        routes.MapGet("/accounts", (Guid community, HttpContext http, CancellationToken token) =>
            access.WithAccessAsync<IResult>(http.Request.Cookies[PlatformWeb.Cookie], community, RegisterPermission.ReadBilling,
                async _ => Results.Ok(await store.OneOffAccountsAsync(community, token)), Results.StatusCode(403), token));
        routes.MapGet("/history", (Guid community, HttpContext http, CancellationToken token) =>
            access.WithAccessAsync<IResult>(http.Request.Cookies[PlatformWeb.Cookie], community, RegisterPermission.ReadBilling,
                async _ => Results.Ok(await store.OneOffHistoryAsync(community, token)), Results.StatusCode(403), token));
        routes.MapPost("/preview", (Guid community, OneOffInput input, HttpContext http, CancellationToken token) =>
        {
            if (Normalize(input) is not { } normalized) return Task.FromResult<IResult>(Invalid());
            return access.WithAccessAsync<IResult>(http.Request.Cookies[PlatformWeb.Cookie], community, RegisterPermission.ReadBilling,
                async _ => Results.Ok(await store.PreviewOneOffAsync(community, normalized, token)), Results.StatusCode(403), token);
        });
        routes.MapPost("/post", (Guid community, Confirmation input, HttpContext http, CancellationToken token) =>
        {
            if (Normalize(input.Input) is not { } normalized || input.Digest is not { Length: 64 } digest ||
                !digest.All(c => c is >= '0' and <= '9' or >= 'A' and <= 'F'))
                return Task.FromResult<IResult>(Invalid());
            return access.WithAccessAsync<IResult>(http.Request.Cookies[PlatformWeb.Cookie], community, RegisterPermission.PostOneOff,
                async actor =>
                {
                    var result = await store.PostOneOffAsync(community, normalized, digest, CommunityElectricityWeb.Actor(actor), token);
                    return result.Posted is null ? Results.Conflict(result) : Results.Ok(result);
                }, Results.StatusCode(403), token, oneOff: new(normalized.RequestId, digest));
        });
    }

    private static IResult Invalid() => Results.BadRequest(new { Outcome = "InvalidInput" });

    private static OneOffInput? Normalize(OneOffInput? input)
    {
        if (input is null || input.RequestId == Guid.Empty || input.Accounts is not { Length: >= 1 and <= 100 } accounts ||
            accounts.Contains(Guid.Empty) || accounts.Distinct().Count() != accounts.Length || input.DueOn == default ||
            input.Amount is <= 0 or > 999_999_999m || decimal.Round(input.Amount, 2) != input.Amount ||
            input.Purpose?.Trim() is not { Length: > 0 and <= 200 } purpose ||
            input.Reason?.Trim() is not { Length: > 0 and <= 500 } reason || purpose.Contains('\0') || reason.Contains('\0'))
            return null;
        return input with { Purpose = purpose, Reason = reason };
    }

    private sealed record Confirmation(OneOffInput? Input, string? Digest);
}
