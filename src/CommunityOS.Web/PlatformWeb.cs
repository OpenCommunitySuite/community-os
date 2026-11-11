using CommunityOS.Modules.Platform.Application;
using CommunityOS.Modules.Platform.Infrastructure;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.RateLimiting;
using Npgsql;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Http.Features;

internal static class PlatformWeb
{
    private const string Cookie = "__Host-communityos-platform";
    private const string DatabaseKey = "Platform:Database";

    public static void AddPlatformWeb(this IServiceCollection services)
    {
        services.AddAntiforgery(options =>
        {
            options.HeaderName = "X-Platform-CSRF";
            options.Cookie.Name = "__Host-communityos-platform-csrf";
            options.Cookie.Path = "/";
            options.Cookie.HttpOnly = true;
            options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
            options.Cookie.SameSite = SameSiteMode.Strict;
        });
        services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
            options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(http =>
                HttpMethods.IsPost(http.Request.Method) &&
                http.Request.Path.Value?.TrimEnd('/').ToLowerInvariant() is "/platform/login" or "/platform/recover" or "/platform/recovery-request"
                    ? RateLimitPartition.GetFixedWindowLimiter(http.Request.Path.Value!.TrimEnd('/').ToLowerInvariant(), _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = 20,
                        Window = TimeSpan.FromMinutes(1),
                    })
                    : RateLimitPartition.GetNoLimiter("other"));
            options.AddConcurrencyLimiter("platform-password", limiter => limiter.PermitLimit = 2);
        });
    }

    public static void MapPlatformWeb(this WebApplication app)
    {
        if (app.Configuration[DatabaseKey] is not { Length: > 0 } connectionString)
        {
            return;
        }

        var frontend = app.Configuration["Platform:FrontendDirectory"]
            ?? throw new InvalidOperationException("Configure Platform:FrontendDirectory for the built Platform Application.");
        var index = Path.GetFullPath(Path.Combine(frontend, "index.html"));
        var script = Path.GetFullPath(Path.Combine(frontend, "platform.js"));
        if (!File.Exists(index) || !File.Exists(script))
        {
            throw new InvalidOperationException("Build the Platform Application before enabling the Platform routes.");
        }

        var dataSource = NpgsqlDataSource.Create(connectionString);
        app.Lifetime.ApplicationStopped.Register(dataSource.Dispose);
        app.Use(async (http, next) =>
        {
            if (HttpMethods.IsPost(http.Request.Method) && http.Request.Path.StartsWithSegments("/platform") &&
                http.Features.Get<IHttpMaxRequestBodySizeFeature>() is { IsReadOnly: false } body)
            {
                body.MaxRequestBodySize = 8192;
            }

            await next(http);
        });
        app.UseRateLimiter();
        var accounts = new PlatformAuthenticationStore(dataSource);
        var delivery = app.Configuration["RecoveryDelivery:Key"] is { Length: > 0 } key
            ? new RecoveryDeliveryStore(dataSource, RecoveryDeliveryStore.ReadKey(key)) : null;




        var routes = app.MapGroup("/platform");
        routes.AddEndpointFilter(async (invocation, next) =>
        {
            var http = invocation.HttpContext;
            if (!http.Request.IsHttps)
            {
                return Results.NotFound();
            }

            http.Response.Headers.CacheControl = "no-store";
            http.Response.Headers.ContentSecurityPolicy =
                "default-src 'none'; script-src 'self'; style-src 'unsafe-inline'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'";
            if (!HttpMethods.IsGet(http.Request.Method))
            {
                var antiforgery = http.RequestServices.GetRequiredService<IAntiforgery>();
                if (!await antiforgery.IsRequestValidAsync(http))
                {
                    return Results.StatusCode(403);
                }
            }

            return await next(invocation);
        });
        routes.MapGet("/", () => Results.File(index, "text/html; charset=utf-8"));
        routes.MapGet("/platform.js", () => Results.File(script, "text/javascript; charset=utf-8"));
        routes.MapGet("/csrf", (HttpContext http, IAntiforgery antiforgery) =>
            Results.Ok(new { Token = antiforgery.GetAndStoreTokens(http).RequestToken }));

        routes.MapPost("/login", async (LoginInput input, HttpContext http, CancellationToken token) =>
        {
            if (input.Login is not { Length: > 0 and <= 128 } || !PlatformPassword.IsAcceptable(input.Password))
            {
                await accounts.RecordLoginDenialAsync(token);
                return Results.Unauthorized();
            }

            var credential = await accounts.FindCredentialAsync(input.Login, token);
            if (!await PlatformPassword.VerifyAsync(input.Password!, credential?.PasswordHash) || credential is null)
            {
                await accounts.RecordLoginDenialAsync(token);
                return Results.Unauthorized();
            }

            await accounts.RevokeSessionAsync(http.Request.Cookies[Cookie], token);
            var session = await accounts.StartSessionAsync(credential, token);
            if (session is null)
            {
                await accounts.RecordLoginDenialAsync(token);
                return Results.Unauthorized();
            }

            http.Response.Cookies.Append(Cookie, session, CookieOptions());
            return Results.Ok(new { AccountId = credential.Id });
        }).RequireRateLimiting("platform-password");

        routes.MapPost("/recovery-request", async (RecoveryRequest input, CancellationToken token) =>
        {
            if (delivery is null)
            {
                return Results.StatusCode(StatusCodes.Status503ServiceUnavailable);
            }

            await delivery.RequestAsync(input.Login, token);
            return Results.Accepted();
        });
        routes.MapPost("/recover", async (RecoveryInput input, HttpContext http, CancellationToken token) =>
        {
            var recovery = new PlatformPasswordRecovery(dataSource, delivery);
            if (!await recovery.ConsumeAsync(input.Login, input.Code, input.NewPassword, token))
            {
                return Results.BadRequest();
            }

            http.Response.Cookies.Delete(Cookie, CookieOptions());
            return Results.NoContent();
        }).RequireRateLimiting("platform-password");
        routes.MapPost("/logout", async (HttpContext http, CancellationToken token) =>
        {
            await accounts.RevokeSessionAsync(http.Request.Cookies[Cookie], token);
            http.Response.Cookies.Delete(Cookie, CookieOptions());
            return Results.NoContent();
        });

        routes.MapPost("/communities", (CreateInput input, HttpContext http, CancellationToken token) =>
            accounts.WithCreatorAsync<IResult>(http.Request.Cookies[Cookie], input.AdministratorAccountId,
                async (actor, targetActive, transaction) =>
                {
                    if (input.RequestId == Guid.Empty || input.AdministratorAccountId == Guid.Empty ||
                        string.IsNullOrWhiteSpace(input.DisplayName) || input.DisplayName.Length > 150 || !targetActive)
                    {
                        return Results.BadRequest();
                    }

                    var provisioning = new CommunityProvisioning(new PostgresCommunityReservationStore(dataSource, transaction));
                    var reserved = await provisioning.ReserveAsync(actor, input.RequestId, input.AdministratorAccountId,
                        input.DisplayName, token);
                    if (reserved is null)
                    {
                        return Results.Conflict();
                    }

                    var bootstrap = new BootstrapAdministrator(new PostgresBootstrapAdministratorStore(dataSource, transaction));
                    var assignment = await bootstrap.AssignAsync(reserved.OperationId, token);
                    return Results.Ok(new { Reservation = reserved, Assignment = assignment });
                }, Results.StatusCode(403), token));
        routes.MapGet("/communities/{communityId:guid}/assignment", async (
            Guid communityId, HttpContext http, CancellationToken token) =>
        {
            var account = await accounts.ResolveAssignedAccountAsync(http.Request.Cookies[Cookie], communityId, token);
            return account is not null
                ? Results.Ok(new { CommunityId = communityId, AccountId = account.Value })
                : Results.StatusCode(403);
        });

        routes.MapPost("/communities/{communityId:guid}/operations/{operationId:guid}/revoke", (
            Guid communityId, Guid operationId, HttpContext http, CancellationToken token) =>
            accounts.WithCreatorAsync<IResult>(http.Request.Cookies[Cookie], null,
                async (actor, _, transaction) =>
                {
                    var scoped = new PostgresBootstrapAdministratorStore(dataSource, transaction);
                    if (!await scoped.WasCreatedByAsync(communityId, actor, token))
                    {
                        return Results.NotFound();
                    }

                    var bootstrap = new BootstrapAdministrator(scoped);
                    return await bootstrap.RevokeAsync(communityId, operationId, actor, token)
                        ? Results.NoContent()
                        : Results.NotFound();
                }, Results.StatusCode(403), token));
        routes.MapGet("/communities/{communityId:guid}/events", (
            Guid communityId, HttpContext http, CancellationToken token) =>
            accounts.WithCreatorAsync<IResult>(http.Request.Cookies[Cookie], null,
                async (actor, _, transaction) =>
                {
                    var scoped = new PostgresBootstrapAdministratorStore(dataSource, transaction);
                    if (!await scoped.WasCreatedByAsync(communityId, actor, token))
                    {
                        return Results.NotFound();
                    }

                    var events = await scoped.ReadEventsAsync(communityId, token);
                    await accounts.RecordAuditReadAsync(transaction, actor, communityId, token);
                    return Results.Ok(events);
                }, Results.StatusCode(403), token));
    }
    public static async Task<int> AddAccountAsync(string[] args)
    {
        if (args is not ["add", var login, "creator" or "user"] ||
            !Console.IsInputRedirected ||
            Environment.GetEnvironmentVariable("Platform__Database") is not { Length: > 0 } connectionString)
        {
            Console.Error.WriteLine("Use platform-account add <login> <creator|user> with Platform__Database and a password on standard input.");
            return 2;
        }

        var password = await Console.In.ReadLineAsync();
        if (!PlatformPassword.IsAcceptable(password))
        {
            Console.Error.WriteLine("Password must be 15–256 characters.");
            return 2;
        }

        try
        {
            await using var source = NpgsqlDataSource.Create(connectionString);
            var accounts = new PlatformAuthenticationStore(source);
            Console.WriteLine(await accounts.AddAccountAsync(login, password!, args[2] == "creator", default));
            return 0;
        }
        catch (ArgumentException)
        {
            Console.Error.WriteLine("Invalid account input.");
            return 2;
        }
        catch (NpgsqlException)
        {
            Console.Error.WriteLine("Account could not be created.");
            return 1;
        }
    }

    public static async Task<int> IssueRecoveryAsync(string[] args)
    {
        if (args is not ["issue", var id] || !Guid.TryParse(id, out var accountId) || accountId == Guid.Empty ||
            Environment.GetEnvironmentVariable("Platform__RecoveryOperatorDatabase") is not { Length: > 0 } connection)
        {
            Console.Error.WriteLine("Use platform-recovery issue <account-id> with Platform__RecoveryOperatorDatabase.");
            return 2;
        }

        try
        {
            await using var source = NpgsqlDataSource.Create(connection);
            var code = await new PlatformPasswordRecovery(source).IssueAsync(accountId, default);
            if (code is not null)
            {
                Console.WriteLine(code);
                return 0;
            }
        }
        catch (NpgsqlException)
        {
            // The diagnostic must not include credential material.
        }

        Console.Error.WriteLine("Recovery code could not be issued.");
        return 1;
    }
    public static async Task<int> ManageRecoveryChannelAsync(string[] args)
    {
        if (args.Length < 2 || !Guid.TryParse(args[1], out var account) || account == Guid.Empty ||
            Environment.GetEnvironmentVariable("RecoveryDelivery__ChannelOperatorDatabase") is not { Length: > 0 } connection)
        {
            return ChannelUsage();
        }

        string? channel = null;
        string? destination = null;
        if (args is ["confirm", _, "email" or "telegram"] && Console.IsInputRedirected)
        {
            channel = args[2];
            destination = (await Console.In.ReadLineAsync())?.Trim();
            if (destination is not { Length: > 0 and <= 320 } ||
                (channel == "email" && (!System.Net.Mail.MailAddress.TryCreate(destination, out var address) ||
                    address.Address != destination)) ||
                (channel == "telegram" && (!long.TryParse(destination, System.Globalization.NumberStyles.None,
                    System.Globalization.CultureInfo.InvariantCulture, out var chatId) || chatId <= 0)))
            {
                return ChannelUsage();
            }
        }
        else if (args is not ["revoke", _])
        {
            return ChannelUsage();
        }

        try
        {
            await using var source = NpgsqlDataSource.Create(connection);
            var changed = await new RecoveryChannelOperator(source).SetAsync(account, channel, destination, default);
            if (changed)
            {
                return 0;
            }
        }
        catch (NpgsqlException)
        {
            // Never print provider destinations or SQL diagnostics.
        }

        Console.Error.WriteLine("Recovery channel could not be changed.");
        return 1;
    }

    private static int ChannelUsage()
    {
        Console.Error.WriteLine("Use platform-recovery-channel confirm <account-id> <email|telegram> with the verified destination on stdin, or revoke <account-id>.");
        return 2;
    }
    private static CookieOptions CookieOptions() => new()
    {
        HttpOnly = true,
        Secure = true,
        SameSite = SameSiteMode.Strict,
        Path = "/",
    };

    private sealed record RecoveryRequest(string? Login);
    private sealed record RecoveryInput(string? Login, string? Code, string? NewPassword);
    private sealed record LoginInput(string? Login, string? Password);
    private sealed record CreateInput(Guid RequestId, Guid AdministratorAccountId, string? DisplayName);
}
