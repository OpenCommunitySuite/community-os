using CommunityOS.Modules.Community.Infrastructure;
using CommunityOS.Modules.Platform.Infrastructure;

internal static class CommunityBudgetWeb
{
    public static void Map(RouteGroupBuilder billing, RegisterAccessStore access, PostgresBillingStore store)
    {
        billing.MapGet("/expenses", (Guid community, HttpContext http, CancellationToken token) =>
            access.WithAccessAsync<IResult>(http.Request.Cookies[PlatformWeb.Cookie], community, RegisterPermission.ReadBilling,
                async _ => Results.Ok(await store.ExpensesAsync(community, token)), Results.StatusCode(403), token));
        billing.MapPost("/expenses", (Guid community, ExpenseInput input, HttpContext http, CancellationToken token) =>
        {
            if (input.RequestId == Guid.Empty || input.IncurredOn == default ||
                !Valid(input.Purpose, 200) || !Valid(input.Evidence, 500) ||
                input.Amount is <= 0 or > 999_999_999m || decimal.Round(input.Amount, 2) != input.Amount)
                return Task.FromResult<IResult>(Results.BadRequest());

            var normalized = input with { Purpose = input.Purpose.Trim(), Evidence = input.Evidence.Trim(), Amount = decimal.Round(input.Amount * 100, 0) / 100m };
            var digest = PostgresBillingStore.ExpenseDigest(normalized);
            return access.WithAccessAsync<IResult>(http.Request.Cookies[PlatformWeb.Cookie], community, RegisterPermission.RecognizeExpense,
                async actor =>
                {
                    var outcome = await store.RecognizeExpenseAsync(community, normalized, digest, CommunityElectricityWeb.Actor(actor), token);
                    return outcome is "Recognized" or "Replayed" ? Results.Ok(new { Outcome = outcome }) : Results.Conflict(new { Outcome = outcome });
                }, Results.StatusCode(403), token, oneOff: new(normalized.RequestId, digest));
        });

        billing.MapGet("/expenses/{expense:guid}/distribution", (Guid community, Guid expense, HttpContext http, CancellationToken token) =>
            access.WithAccessAsync<IResult>(http.Request.Cookies[PlatformWeb.Cookie], community, RegisterPermission.ReadBilling,
                async _ => await store.ExpenseDistributionAsync(community, expense, token) is { } preview
                    ? Results.Ok(preview) : Results.NotFound(), Results.StatusCode(403), token));
        billing.MapPost("/expenses/{expense:guid}/distribution",
            (Guid community, Guid expense, ExpenseDistributionInput input, HttpContext http, CancellationToken token) =>
            {
                if (expense == Guid.Empty || input.RequestId == Guid.Empty || input.PreviousId == Guid.Empty ||
                    input.RequestId == input.PreviousId || input.Parts is not { Length: <= 100 } ||
                    input.Parts.Any(part => part is null || part.BudgetItemId == Guid.Empty ||
                        part.Amount is <= 0 or > 999_999_999m || decimal.Round(part.Amount, 2) != part.Amount))
                    return Task.FromResult<IResult>(Results.BadRequest());
                var parts = input.Parts.OrderBy(part => part.BudgetItemId).Select(part => part with
                    { Amount = decimal.Round(part.Amount * 100, 0) / 100m }).ToArray();
                if (parts.Select(part => part.BudgetItemId).Distinct().Count() != parts.Length)
                    return Task.FromResult<IResult>(Results.BadRequest());

                var normalized = input with { Parts = parts };
                var digest = PostgresBillingStore.ExpenseDistributionDigest(expense, normalized);
                return access.WithAccessAsync<IResult>(http.Request.Cookies[PlatformWeb.Cookie], community, RegisterPermission.AllocateExpense,
                    async actor =>
                    {
                        var outcome = await store.AllocateExpenseAsync(community, expense, normalized, digest,
                            CommunityElectricityWeb.Actor(actor), token);
                        return outcome switch
                        {
                            "Allocated" or "Replayed" => Results.Ok(new { Outcome = outcome }),
                            "Missing" => Results.NotFound(),
                            "InvalidParts" => Results.BadRequest(new { Outcome = outcome }),
                            _ => Results.Conflict(new { Outcome = outcome })
                        };
                    }, Results.StatusCode(403), token, oneOff: new(normalized.RequestId, digest));
            });

        billing.MapGet("/budgets", (Guid community, HttpContext http, CancellationToken token) =>
            access.WithAccessAsync<IResult>(http.Request.Cookies[PlatformWeb.Cookie], community, RegisterPermission.ReadBilling,
                async _ => Results.Ok(await store.BudgetsAsync(community, token)), Results.StatusCode(403), token));
        billing.MapPost("/budgets", (Guid community, BudgetInput input, HttpContext http, CancellationToken token) =>
        {
            if (input.RequestId == Guid.Empty || input.StartsOn == default || input.EndsOn < input.StartsOn ||
                !Valid(input.Title, 200) || !Valid(input.Evidence, 500) ||
                input.Items is not { Length: >= 1 and <= 100 } ||
                input.Items.Any(item => item is null || !Valid(item.Designation, 200) ||
                    item.Amount is < 0 or > 999_999_999m || decimal.Round(item.Amount, 2) != item.Amount))
                return Task.FromResult<IResult>(Results.BadRequest());
            var items = input.Items.Select(item => item with { Designation = item.Designation.Trim() })
                .OrderBy(item => item.Designation, StringComparer.Ordinal).ToArray();
            if (items.Select(item => item.Designation).Distinct(StringComparer.Ordinal).Count() != items.Length)
                return Task.FromResult<IResult>(Results.BadRequest());
            var normalized = input with { Title = input.Title.Trim(), Evidence = input.Evidence.Trim(), Items = items };
            var digest = PostgresBillingStore.BudgetDigest(normalized);
            return access.WithAccessAsync<IResult>(http.Request.Cookies[PlatformWeb.Cookie], community, RegisterPermission.RegisterBudget,
                async actor =>
                {
                    var outcome = await store.RegisterBudgetAsync(community, normalized, digest, CommunityElectricityWeb.Actor(actor), token);
                    return outcome is "Registered" or "Replayed" ? Results.Ok(new { Outcome = outcome }) : Results.Conflict(new { Outcome = outcome });
                }, Results.StatusCode(403), token, oneOff: new(normalized.RequestId, digest));
        });
    }

    private static bool Valid(string? value, int length) =>
        value?.Trim() is { Length: > 0 } text && text.Length <= length && !text.Contains('\0');
}
