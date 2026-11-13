using CommunityOS.Modules.Community.Infrastructure;
using CommunityOS.Modules.Platform.Infrastructure;

internal static class CommunityPaymentWeb
{
    public static void Map(RouteGroupBuilder billing, RegisterAccessStore access, PostgresBillingStore store)
    {
        var routes = billing.MapGroup("/payments");
        MapReallocation(routes, access, store);
        routes.MapPost("/correction/preview", (Guid community, PaymentCorrectionInput input, HttpContext http, CancellationToken token) =>
            NormalizeCorrection(input) is { } valid
                ? access.WithAccessAsync<IResult>(http.Request.Cookies[PlatformWeb.Cookie], community, RegisterPermission.ReadBilling,
                    async _ => Results.Ok(await store.PreviewPaymentCorrectionAsync(community, valid, token)), Results.StatusCode(403), token)
                : Task.FromResult(Invalid()));
        routes.MapPost("/correction/confirm", (Guid community, CorrectionConfirmation confirmation, HttpContext http, CancellationToken token) =>
        {
            if (NormalizeCorrection(confirmation.Input) is not { } input || confirmation.Digest is not { Length: 64 } digest ||
                !digest.All(c => c is >= '0' and <= '9' or >= 'A' and <= 'F'))
                return Task.FromResult(Invalid());
            return access.WithAccessAsync<IResult>(http.Request.Cookies[PlatformWeb.Cookie], community, RegisterPermission.CorrectPayment,
                async actor => Response(await store.CorrectPaymentAsync(community, input, digest, CommunityElectricityWeb.Actor(actor), token)),
                Results.StatusCode(403), token, payment: new(input.RequestId, digest));
        });
        routes.MapGet("/", (Guid community, HttpContext http, CancellationToken token) =>
            access.WithAccessAsync<IResult>(http.Request.Cookies[PlatformWeb.Cookie], community, RegisterPermission.ReadBilling,
                async _ => Results.Ok(await store.PaymentDeskAsync(community, token)), Results.StatusCode(403), token));
        routes.MapPost("/record", (Guid community, PaymentInput input, HttpContext http, CancellationToken token) =>
            ReceiptAsync(community, input, http, token, false));
        routes.MapPost("/accept-cash", (Guid community, PaymentInput input, HttpContext http, CancellationToken token) =>
            ReceiptAsync(community, input, http, token, true));

        Task<IResult> ReceiptAsync(Guid community, PaymentInput input, HttpContext http, CancellationToken token, bool cash)
        {
            if (input.RequestId == Guid.Empty || input.PayerId == Guid.Empty || input.ReceivedOn == default ||
                input.ReceivedOn > CommunityElectricityWeb.Today() || !Amount(input.Amount) || Reason(input.Reason) is not { } reason)
                return Task.FromResult<IResult>(Invalid());
            input = input with { Reason = reason };
            var permission = cash ? RegisterPermission.AcceptCash : RegisterPermission.RecordPayment;
            var digest = cash ? PostgresBillingStore.CashDigest(community, input) : PostgresBillingStore.PaymentDigest(community, input);
            return access.WithAccessAsync<IResult>(http.Request.Cookies[PlatformWeb.Cookie], community, permission,
                async actor => Response(await (cash
                    ? store.AcceptCashAsync(community, input, CommunityElectricityWeb.Actor(actor), token)
                    : store.RecordPaymentAsync(community, input, CommunityElectricityWeb.Actor(actor), token))),
                Results.StatusCode(403), token, payment: new(input.RequestId, digest));
        }
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

    private static void MapReallocation(RouteGroupBuilder routes, RegisterAccessStore access, PostgresBillingStore store)
    {
        routes.MapPost("/reallocation/preview", (Guid community, ReallocationInput input, HttpContext http, CancellationToken token) =>
            NormalizeTransfer(input) is { } valid
                ? access.WithAccessAsync<IResult>(http.Request.Cookies[PlatformWeb.Cookie], community, RegisterPermission.ReadBilling,
                    async _ => Results.Ok(await store.PreviewReallocationAsync(community, valid, token)), Results.StatusCode(403), token)
                : Task.FromResult(Invalid()));
        routes.MapPost("/reallocation/confirm", (Guid community, TransferConfirmation confirmation, HttpContext http, CancellationToken token) =>
        {
            if (NormalizeTransfer(confirmation.Input) is not { } input || confirmation.Digest is not { Length: 64 } digest ||
                !digest.All(c => c is >= '0' and <= '9' or >= 'A' and <= 'F'))
                return Task.FromResult(Invalid());
            return access.WithAccessAsync<IResult>(http.Request.Cookies[PlatformWeb.Cookie], community, RegisterPermission.ReallocatePayment,
                async actor => Response(await store.ReallocateAsync(community, input, digest, CommunityElectricityWeb.Actor(actor), token)),
                Results.StatusCode(403), token, payment: new(input.RequestId, digest));
        });
    }

    private static ReallocationInput? NormalizeTransfer(ReallocationInput? input) =>
        input is not null && input.RequestId != Guid.Empty && input.PaymentId != Guid.Empty &&
        input.SourceBatchId != Guid.Empty && input.SourceObligationId != Guid.Empty && input.TargetObligationId != Guid.Empty &&
        input.SourceObligationId != input.TargetObligationId && Amount(input.Amount) && Reason(input.Reason) is { } reason
        ? input with { Reason = reason } : null;

    private sealed record TransferConfirmation(ReallocationInput? Input, string? Digest);

    private static PaymentCorrectionInput? NormalizeCorrection(PaymentCorrectionInput? input) =>
        input is not null && input.RequestId != Guid.Empty && input.PaymentId != Guid.Empty &&
        Amount(input.Amount) && Reason(input.Reason) is { } reason ? input with { Reason = reason } : null;

    private sealed record CorrectionConfirmation(PaymentCorrectionInput? Input, string? Digest);
}
