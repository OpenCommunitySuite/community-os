using CommunityOS.Modules.Community.Infrastructure;
using CommunityOS.Modules.Platform.Infrastructure;

internal static class CommunityBankWeb
{
    public static void Map(RouteGroupBuilder billing, RegisterAccessStore access, PostgresBillingStore store)
    {
        var routes = billing.MapGroup("/bank");
        routes.MapGet("/", (Guid community, HttpContext http, CancellationToken token) =>
            access.WithAccessAsync<IResult>(http.Request.Cookies[PlatformWeb.Cookie], community, RegisterPermission.ReadBilling,
                async _ => Results.Ok(await store.BankDeskAsync(community, token)), Results.StatusCode(403), token));
        routes.MapPost("/{account:guid}/preview", (Guid community, Guid account, HttpContext http, CancellationToken token) =>
            ImportAsync(community, account, http, token, false));
        routes.MapPost("/{account:guid}/import", (Guid community, Guid account, HttpContext http, CancellationToken token) =>
            ImportAsync(community, account, http, token, true));

        async Task<IResult> ImportAsync(Guid community, Guid account, HttpContext http, CancellationToken token, bool confirm)
        {
            BankStatementCsv csv;
            try
            {
                var buffer = new byte[BankStatementCsv.MaximumBytes + 1];
                var length = await http.Request.Body.ReadAtLeastAsync(buffer, buffer.Length, false, token);
                var bytes = buffer.AsSpan(0, length);
                csv = length > 0 && bytes[0] == 3 ? BankStatementDbf.Parse(bytes) : BankStatementCsv.Parse(bytes);
            }
            catch (FormatException error)
            {
                return Results.BadRequest(new { Outcome = error.Message });
            }
            var digest = http.Request.Headers["X-Bank-Preview"].ToString();
            if (confirm && (digest.Length != 64 || !digest.All(c => c is >= '0' and <= '9' or >= 'A' and <= 'F')))
                return Results.BadRequest();
            return await access.WithAccessAsync<IResult>(http.Request.Cookies[PlatformWeb.Cookie], community,
                confirm ? RegisterPermission.ImportBank : RegisterPermission.ReadBilling, async actor =>
                {
                    var result = confirm
                        ? await store.ImportBankAsync(community, account, csv, digest, CommunityElectricityWeb.Actor(actor), token)
                        : await store.PreviewBankAsync(community, account, csv, token);
                    return result.Outcome switch
                    {
                        "NotFound" => Results.NotFound(result),
                        "Imported" or "Ready" => Results.Ok(result),
                        _ when !confirm => Results.Ok(result),
                        _ => Results.Conflict(result),
                    };
                }, Results.StatusCode(403), token, payment: confirm ? new(account, digest) : null);
        }

        routes.MapPost("/recognize", (Guid community, BankRecognition input, HttpContext http, CancellationToken token) =>
        {
            if (input.TransactionId == Guid.Empty || input.PayerId == Guid.Empty ||
                input.Reason?.Trim() is not { Length: > 0 and <= 500 } reason || reason.Contains('\0'))
                return Task.FromResult<IResult>(Results.BadRequest());
            input = input with { Reason = reason };
            return access.WithAccessAsync<IResult>(http.Request.Cookies[PlatformWeb.Cookie], community,
                RegisterPermission.RecognizeBank, async actor =>
                {
                    var result = await store.RecognizeBankPaymentAsync(community, input, CommunityElectricityWeb.Actor(actor), token);
                    return result.Id is not null ? Results.Ok(result) : Results.Conflict(result);
                }, Results.StatusCode(403), token, payment: new(input.TransactionId,
                    PostgresBillingStore.BankRecognitionDigest(community, input)));
        });
    }
}
