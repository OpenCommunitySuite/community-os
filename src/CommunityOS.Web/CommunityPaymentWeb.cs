using CommunityOS.Modules.Community.Infrastructure;
using CommunityOS.Modules.Platform.Infrastructure;

internal static class CommunityPaymentWeb
{
    public static void Map(RouteGroupBuilder billing, RegisterAccessStore access, PostgresBillingStore store)
    {
        var routes = billing.MapGroup("/payments");
        routes.MapGet("/", (Guid community, HttpContext http, CancellationToken token) =>
            access.WithAccessAsync<IResult>(http.Request.Cookies[PlatformWeb.Cookie], community, RegisterPermission.ReadBilling,
                async _ => Results.Ok(await store.PaymentDeskAsync(community, token)), Results.StatusCode(403), token));
        routes.MapPost("/record", (Guid community, PaymentInput input, HttpContext http, CancellationToken token) =>
        {
            if (input.RequestId == Guid.Empty || input.PayerId == Guid.Empty || input.ReceivedOn == default ||
                input.ReceivedOn > CommunityElectricityWeb.Today() || !Amount(input.Amount) || Reason(input.Reason) is not { } reason)
                return Task.FromResult<IResult>(Invalid());
            input = input with { Reason = reason };
            return access.WithAccessAsync<IResult>(http.Request.Cookies[PlatformWeb.Cookie], community, RegisterPermission.RecordPayment,
                async actor => Response(await store.RecordPaymentAsync(community, input, CommunityElectricityWeb.Actor(actor), token)),
                Results.StatusCode(403), token, payment: new(input.RequestId, PostgresBillingStore.PaymentDigest(community, input)));
        });
        routes.MapPost("/preview", (Guid community, AllocationInput input, HttpContext http, CancellationToken token) =>
        {
            if (Normalize(input) is not { } valid) return Task.FromResult<IResult>(Invalid());
            return access.WithAccessAsync<IResult>(http.Request.Cookies[PlatformWeb.Cookie], community, RegisterPermission.ReadBilling,
                async _ => Results.Ok(await store.PreviewAllocationAsync(community, valid, token)), Results.StatusCode(403), token);
        });
        routes.MapPost("/allocate", (Guid community, Confirmation confirmation, HttpContext http, CancellationToken token) =>
        {
            if (Normalize(confirmation.Input) is not { } input || confirmation.Digest is not { Length: 64 } digest ||
                !digest.All(c => c is >= '0' and <= '9' or >= 'A' and <= 'F'))
                return Task.FromResult<IResult>(Invalid());
            return access.WithAccessAsync<IResult>(http.Request.Cookies[PlatformWeb.Cookie], community, RegisterPermission.AllocatePayment,
                async actor => Response(await store.AllocateAsync(community, input, digest, CommunityElectricityWeb.Actor(actor), token)),
                Results.StatusCode(403), token, payment: new(input.RequestId, digest));
        });
    }

    private static AllocationInput? Normalize(AllocationInput? input)
    {
        if (input is null || input.RequestId == Guid.Empty || input.PaymentId == Guid.Empty ||
            Reason(input.Reason) is not { } reason || input.Lines is not { Length: >= 1 and <= 100 } lines ||
            lines.Any(line => line is null || line.ObligationId == Guid.Empty || !Amount(line.Amount)) ||
            lines.Select(line => line.ObligationId).Distinct().Count() != lines.Length)
            return null;
        return input with { Reason = reason };
    }

    private static string? Reason(string? input) =>
        input?.Trim() is { Length: > 0 and <= 500 } reason && !reason.Contains('\0') ? reason : null;

    private static bool Amount(decimal value) => value is > 0 and <= 999_999_999m && decimal.Round(value, 2) == value;
    private static IResult Invalid() => Results.BadRequest(new { Outcome = "InvalidInput" });
    private static IResult Response(PaymentResult result) => result.Id is not null ? Results.Ok(result) :
        result.Outcome == "NotFound" ? Results.NotFound(result) : Results.Conflict(result);
    private sealed record Confirmation(AllocationInput? Input, string? Digest);
}
