using CommunityOS.Modules.Community.Infrastructure;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.Diagnostics.HealthChecks;

if (args is ["register", .. var registerArgs])
{
    Environment.ExitCode = await RegisterCommand.RunAsync(registerArgs);
    return;
}

if (args is ["platform-account", .. var accountArgs])
{
    Environment.ExitCode = await PlatformWeb.AddAccountAsync(accountArgs);
    return;
}

if (args is ["platform-recovery", .. var recoveryArgs])
{
    Environment.ExitCode = await PlatformWeb.IssueRecoveryAsync(recoveryArgs);
    return;
}

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCommunityModule();
builder.Services.AddPlatformWeb();

builder.Services.AddHealthChecks()
    .AddCheck("startup", () => HealthCheckResult.Healthy(), tags: ["startup"])
    .AddCheck("live", () => HealthCheckResult.Healthy(), tags: ["live"])
    .AddCheck("ready", () => HealthCheckResult.Healthy(), tags: ["ready"]);

var app = builder.Build();
app.MapBootstrapRehearsal();
app.MapPlatformWeb();

app.MapHealthChecks("/health/startup", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("startup"),
});

app.MapHealthChecks("/health/live", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("live"),
});

app.MapHealthChecks("/health/ready", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready"),
});

app.Run();
