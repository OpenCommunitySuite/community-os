using CommunityOS.Modules.Community.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = Host.CreateApplicationBuilder(args);

builder.Services.AddCommunityModule();

var host = builder.Build();

host.Run();
