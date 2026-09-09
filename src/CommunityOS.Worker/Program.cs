using CommunityOS.Modules.Community.Composition;

var builder = Host.CreateApplicationBuilder(args);

builder.Services.AddCommunityModule();

await builder.Build().RunAsync();
