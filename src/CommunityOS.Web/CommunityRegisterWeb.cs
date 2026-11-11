using CommunityOS.Modules.Community.Application.Register;
using CommunityOS.Modules.Community.Infrastructure;
using CommunityOS.Modules.Platform.Infrastructure;
using Npgsql;

internal static class CommunityRegisterWeb
{
    public static void Map(WebApplication app, NpgsqlDataSource platform, string frontend)
    {
        if (!app.Configuration.GetValue<bool>("CommunityRegister:SyntheticStandEnabled") ||
            app.Configuration["CommunityRegister:Database"] is not { Length: > 0 } connectionString)
        {
            return;
        }

        var database = NpgsqlDataSource.Create(connectionString);
        app.Lifetime.ApplicationStopped.Register(database.Dispose);
        var access = new RegisterAccessStore(platform);
        var register = new ManualRegister(new PostgresRegisterStore(database));
        var routes = PlatformWeb.SecureRoutes(app, "/community");
        CommunityImportWeb.Map(routes, access, register, new PostgresImportDraftStore(database));
        CommunityImportApprovalWeb.Map(routes, access, new PostgresImportApprovalStore(database));
        MapCorrections(routes, access, new PostgresOwnershipCorrectionStore(database));
        var index = Path.GetFullPath(Path.Combine(frontend, "community.html"));
        var script = Path.GetFullPath(Path.Combine(frontend, "community.js"));
        routes.MapGet("/", () => Results.File(index, "text/html; charset=utf-8"));
        routes.MapGet("/community.js", () => Results.File(script, "text/javascript; charset=utf-8"));
        routes.MapGet("/register/communities", async (HttpContext http, CancellationToken token) =>
        {
            var communities = await access.ListAsync(http.Request.Cookies[PlatformWeb.Cookie], token);
            return communities is null ? Results.Unauthorized() : Results.Ok(communities);
        });
        routes.MapGet("/register/{community:guid}", (Guid community, HttpContext http, CancellationToken token) =>
            access.WithAccessAsync<IResult>(http.Request.Cookies[PlatformWeb.Cookie], community, false,
                async _ => Results.Ok(await register.ListAsync(community, token)), Results.StatusCode(403), token));
        routes.MapPost("/register/{community:guid}", (Guid community, RegisterInput input, HttpContext http,
            CancellationToken token) =>
            access.WithAccessAsync<IResult>(http.Request.Cookies[PlatformWeb.Cookie], community, true,
                actor => AddAsync(register, community, input, actor, token), Results.StatusCode(403), token));
    }

    private static void MapCorrections(RouteGroupBuilder routes, RegisterAccessStore access,
        PostgresOwnershipCorrectionStore corrections)
    {
        var plot = routes.MapGroup("/register/{community:guid}/plots/{plotId:guid}/corrections");
        routes.MapGet("/register/{community:guid}/owners", (Guid community, HttpContext http, CancellationToken token) =>
            access.WithAccessAsync<IResult>(http.Request.Cookies[PlatformWeb.Cookie], community,
                RegisterPermission.ReadCorrectionCandidates,
                async _ => Results.Ok(await corrections.OwnersAsync(community, token)), Results.StatusCode(403), token));
        plot.MapGet("/", (Guid community, Guid plotId, HttpContext http, CancellationToken token) =>
            access.WithAccessAsync<IResult>(http.Request.Cookies[PlatformWeb.Cookie], community, RegisterPermission.Read,
                async _ => Results.Ok(await corrections.HistoryAsync(community, plotId, token)),
                Results.StatusCode(403), token));
        plot.MapPost("/", (Guid community, Guid plotId, CorrectionInput input, HttpContext http, CancellationToken token) =>
        {
            if (plotId == Guid.Empty || input.Revision == Guid.Empty || input.OwnerId == Guid.Empty ||
                input.Reason?.Trim() is not { Length: > 0 and <= 500 } reason || reason.Contains('\0'))
            {
                return Task.FromResult<IResult>(Results.BadRequest());
            }

            return access.WithAccessAsync<IResult>(http.Request.Cookies[PlatformWeb.Cookie], community,
                RegisterPermission.CorrectOwnership, async actor =>
                {
                    var result = await corrections.CorrectAsync(community, new(plotId, input.Revision, input.OwnerId, reason),
                        new(actor.AdmissionId, actor.AccountId, actor.SubjectId, actor.AdditionBasis!), token);
                    return result switch
                    {
                        OwnershipCorrectionResult.Corrected => Results.NoContent(),
                        OwnershipCorrectionResult.Stale => Results.Conflict(new { Outcome = "stale" }),
                        OwnershipCorrectionResult.Unchanged => Results.BadRequest(new { Outcome = "unchanged" }),
                        _ => Results.BadRequest(new { Outcome = "invalid-owner" }),
                    };
                }, Results.StatusCode(403), token, correction: new(plotId, input.Revision, input.OwnerId));
        });
    }

    private static async Task<IResult> AddAsync(ManualRegister register, Guid community, RegisterInput input,
        RegisterActor actor, CancellationToken token)
    {
        if (input.PlotNumber?.Trim() is not { Length: > 0 and <= 128 } plot ||
            input.AccountNumber?.Trim() is not { Length: > 0 and <= 128 } account ||
            input.OwnerName?.Trim().Length > 256)
        {
            return Results.BadRequest();
        }

        try
        {
            var ownerId = await register.CreateAsync(community, input.OwnerId, input.OwnerName, plot, account, token,
                new RegisterAddition(actor.AdmissionId, actor.AccountId, actor.SubjectId, actor.AdditionBasis!));
            return Results.Ok(new { OwnerId = ownerId });
        }
        catch (ArgumentException)
        {
            return Results.BadRequest();
        }
        catch (PostgresException error) when (error.SqlState == PostgresErrorCodes.UniqueViolation)
        {
            return Results.Conflict();
        }
        catch (PostgresException error) when (error.SqlState == PostgresErrorCodes.ForeignKeyViolation)
        {
            return Results.BadRequest();
        }
    }

    private sealed record RegisterInput(Guid? OwnerId, string? OwnerName, string? PlotNumber, string? AccountNumber);
    private sealed record CorrectionInput(Guid Revision, Guid OwnerId, string? Reason);
}
