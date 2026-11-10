using CommunityOS.Modules.Platform.Infrastructure;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Npgsql;

internal sealed class RecoveryDeliveryWorker(RecoveryDeliveryProcessor processor, ILogger<RecoveryDeliveryWorker> logger)
    : BackgroundService
{
    public static void Add(IServiceCollection services, IConfiguration configuration)
    {
        var settings = configuration.GetSection("RecoveryDelivery");
        if (settings["WorkerDatabase"] is not { Length: > 0 } connection)
        {
            return;
        }

        var key = RecoveryDeliveryStore.ReadKey(Required(settings, "Key"));
        var transports = new Dictionary<string, IRecoveryTransport>();
        if (settings["Smtp:Host"] is { Length: > 0 } host)
        {
            var port = int.Parse(settings["Smtp:Port"] ?? "587", System.Globalization.CultureInfo.InvariantCulture);
            transports.Add("email", new SmtpRecoveryTransport(host, port, Required(settings, "Smtp:Sender"),
                Required(settings, "Smtp:Username"), Required(settings, "Smtp:Password")));
        }

        if (settings["Telegram:Token"] is { Length: > 0 } token)
        {
            services.AddSingleton(_ => new HttpClient(new HttpClientHandler { AllowAutoRedirect = false }));
            services.AddSingleton<IRecoveryTransport>(provider =>
                new TelegramRecoveryTransport(provider.GetRequiredService<HttpClient>(), token));
        }

        if (transports.Count == 0 && settings["Telegram:Token"] is not { Length: > 0 })
        {
            throw new InvalidOperationException("Configure at least one recovery transport.");
        }

        services.AddSingleton(_ => NpgsqlDataSource.Create(connection));
        services.AddSingleton(provider =>
        {
            var telegram = provider.GetService<IRecoveryTransport>();
            if (telegram is not null)
            {
                transports.Add("telegram", telegram);
            }

            return new RecoveryDeliveryProcessor(new RecoveryDeliveryStore(provider.GetRequiredService<NpgsqlDataSource>(), key), transports);
        });
        services.AddHostedService<RecoveryDeliveryWorker>();
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await processor.ProcessOneAsync(stoppingToken);
            }
            catch (NpgsqlException)
            {
                // Database diagnostics may include parameters. Report only the failure category.
                logger.LogWarning("Recovery delivery database operation failed.");
            }

            await Task.Delay(TimeSpan.FromSeconds(2), stoppingToken);
        }
    }

    private static string Required(IConfiguration settings, string name) =>
        settings[name] is { Length: > 0 } value ? value : throw new InvalidOperationException($"Missing recovery setting {name}.");
}
