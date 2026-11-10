using System.Net;
using System.Security.Cryptography;
using CommunityOS.Modules.Platform.Application;
using CommunityOS.Modules.Platform.Infrastructure;
using Npgsql;

internal static class BootstrapRehearsal
{
    private const string Cookie = "__Host-communityos-rehearsal";

    public static void MapBootstrapRehearsal(this WebApplication app)
    {
        if (!app.Environment.IsDevelopment() || !app.Configuration.GetValue<bool>("BootstrapRehearsal:Enabled"))
        {
            return;
        }

        var config = app.Configuration.GetSection("BootstrapRehearsal");
        var creator = ReadAccount(config.GetSection("Creator"));
        var administrator = ReadAccount(config.GetSection("Administrator"));
        if (creator.Id == administrator.Id || CryptographicOperations.FixedTimeEquals(creator.Digest, administrator.Digest))
        {
            throw new InvalidOperationException("Configure distinct synthetic rehearsal accounts and codes.");
        }

        var dataSource = NpgsqlDataSource.Create(config["Database"]
            ?? throw new InvalidOperationException("Configure an isolated rehearsal database."));
        app.Lifetime.ApplicationStopped.Register(dataSource.Dispose);
        var sessions = new BootstrapRehearsalSessions(dataSource);
        var provisioning = new CommunityProvisioning(new PostgresCommunityReservationStore(dataSource));
        var store = new PostgresBootstrapAdministratorStore(dataSource);
        var bootstrap = new BootstrapAdministrator(store);
        using var resource = typeof(BootstrapRehearsal).Assembly.GetManifestResourceStream("CommunityOS.Web.BootstrapRehearsal.html")
            ?? throw new InvalidOperationException("Missing rehearsal page.");
        using var reader = new StreamReader(resource);
        var page = reader.ReadToEnd();

        var routes = app.MapGroup("/platform/rehearsal");
        routes.AddEndpointFilter(async (invocation, next) =>
        {
            var http = invocation.HttpContext;
            var request = http.Request;
            var remote = http.Connection.RemoteIpAddress;
            if (!request.IsHttps || remote is null || !IPAddress.IsLoopback(remote) ||
                request.Host.Host is not ("localhost" or "127.0.0.1" or "[::1]"))
            {
                return Results.NotFound();
            }

            // A cross-origin page cannot send this header without a successful CORS preflight.
            if (!HttpMethods.IsGet(request.Method) && request.Headers["X-Bootstrap-Rehearsal"] != "1")
            {
                return Results.StatusCode(403);
            }

            http.Response.Headers.CacheControl = "no-store";
            http.Response.Headers.ContentSecurityPolicy =
                "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'";
            return await next(invocation);
        });

        routes.MapGet("/", () => Results.Content(page, "text/html; charset=utf-8"));
        routes.MapPost("/login", async (LoginInput input, HttpContext http, CancellationToken token) =>
        {
            if (!TryReadCode(input.Code, out var code))
            {
                return Results.Unauthorized();
            }

            var digest = SHA256.HashData(code);
            var matchesCreator = CryptographicOperations.FixedTimeEquals(creator.Digest, digest);
            var matchesAdministrator = CryptographicOperations.FixedTimeEquals(administrator.Digest, digest);
            if (!matchesCreator && !matchesAdministrator)
            {
                return Results.Unauthorized();
            }

            await sessions.EndAsync(http.Request.Cookies[Cookie], token);
            var session = await sessions.StartAsync(matchesCreator ? creator.Id : administrator.Id, token);
            http.Response.Cookies.Append(Cookie, session, CookieOptions());
            return Results.Ok(new { Role = matchesCreator ? "creator" : "administrator" });
        });
        routes.MapPost("/logout", async (HttpContext http, CancellationToken token) =>
        {
            await sessions.EndAsync(http.Request.Cookies[Cookie], token);
            http.Response.Cookies.Delete(Cookie, CookieOptions());
            return Results.NoContent();
        });

        routes.MapPost("/communities", async (CreateInput input, HttpContext http, CancellationToken token) =>
        {
            if (await ResolveAsync(http, token) != creator.Id)
            {
                return Results.StatusCode(403);
            }

            if (input.RequestId == Guid.Empty || input.AdministratorAccountId != administrator.Id ||
                string.IsNullOrWhiteSpace(input.DisplayName) || input.DisplayName.Length > 150)
            {
                return Results.BadRequest();
            }

            var reserved = await provisioning.ReserveAsync(creator.Id, input.RequestId, administrator.Id,
                input.DisplayName, token);
            if (reserved is null)
            {
                return Results.Conflict();
            }

            var assignment = await bootstrap.AssignAsync(reserved.OperationId, token);
            return Results.Ok(new { Reservation = reserved, Assignment = assignment });
        });
        routes.MapGet("/communities/{communityId:guid}/assignment", async (
            Guid communityId, HttpContext http, CancellationToken token) =>
        {
            var accountId = await ResolveAsync(http, token);
            if (accountId is null || !await store.IsAssignedAsync(communityId, accountId.Value, token))
            {
                return Results.StatusCode(403);
            }

            return Results.Ok(new { CommunityId = communityId, AccountId = accountId });
        });
        routes.MapPost("/communities/{communityId:guid}/operations/{operationId:guid}/revoke", async (
            Guid communityId, Guid operationId, HttpContext http, CancellationToken token) =>
        {
            if (await ResolveAsync(http, token) != creator.Id)
            {
                return Results.StatusCode(403);
            }

            return await bootstrap.RevokeAsync(communityId, operationId, creator.Id, token)
                ? Results.NoContent()
                : Results.NotFound();
        });
        routes.MapGet("/communities/{communityId:guid}/events", async (
            Guid communityId, HttpContext http, CancellationToken token) =>
        {
            if (await ResolveAsync(http, token) != creator.Id)
            {
                return Results.StatusCode(403);
            }

            return Results.Ok(await store.ReadEventsAsync(communityId, token));
        });

        async Task<Guid?> ResolveAsync(HttpContext http, CancellationToken token)
        {
            var account = await sessions.ResolveAsync(http.Request.Cookies[Cookie], token);
            return account == creator.Id || account == administrator.Id ? account : null;
        }
    }

    private static CookieOptions CookieOptions() => new()
    {
        HttpOnly = true,
        Secure = true,
        SameSite = SameSiteMode.Strict,
        Path = "/",
    };

    private static RehearsalAccount ReadAccount(IConfigurationSection section)
    {
        if (!Guid.TryParse(section["AccountId"], out var id) || id == Guid.Empty ||
            !TryReadCode(section["CodeSha256"], out var digest))
        {
            throw new InvalidOperationException("Configure a synthetic rehearsal account ID and code digest.");
        }

        return new(id, digest);
    }

    private static bool TryReadCode(string? text, out byte[] bytes)
    {
        bytes = new byte[32];
        return text is { Length: 64 } &&
            Convert.FromHexString(text, bytes, out _, out _) == System.Buffers.OperationStatus.Done;
    }

    private sealed record RehearsalAccount(Guid Id, byte[] Digest);
    private sealed record LoginInput(string? Code);
    private sealed record CreateInput(Guid RequestId, Guid AdministratorAccountId, string? DisplayName);
}
