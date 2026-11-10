using CommunityOS.Modules.Community.Infrastructure;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.Diagnostics.HealthChecks;

if (args is ["register", .. var registerArgs])
{
    Environment.ExitCode = await RegisterCommand.RunAsync(registerArgs);
    return;
}

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCommunityModule();

builder.Services.AddHealthChecks()
    .AddCheck("startup", () => HealthCheckResult.Healthy(), tags: ["startup"])
    .AddCheck("live", () => HealthCheckResult.Healthy(), tags: ["live"])
    .AddCheck("ready", () => HealthCheckResult.Healthy(), tags: ["ready"]);

var app = builder.Build();
app.MapBootstrapRehearsal();

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
