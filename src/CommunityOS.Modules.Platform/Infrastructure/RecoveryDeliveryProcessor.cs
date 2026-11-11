using System.Globalization;
using System.Net;
using System.Net.Http.Json;
using System.Net.Mail;
using System.Text.Json;

namespace CommunityOS.Modules.Platform.Infrastructure;

public sealed record RecoveryDeliveryOutcome(string Status, int RetrySeconds = 30)
{
    public static RecoveryDeliveryOutcome Sent { get; } = new("sent");
    public static RecoveryDeliveryOutcome Failed { get; } = new("failed");
    public static RecoveryDeliveryOutcome Retry { get; } = new("retry");
}

public interface IRecoveryTransport
{
    Task<RecoveryDeliveryOutcome> SendAsync(string destination, string code, CancellationToken token);
}

public sealed class RecoveryDeliveryProcessor(RecoveryDeliveryStore store, IReadOnlyDictionary<string, IRecoveryTransport> transports)
{
    public async Task<bool> ProcessOneAsync(CancellationToken token)
    {
        var job = await store.ClaimAsync(token);
        if (job is null)
        {
            return false;
        }

        var code = store.ResolveDeliveryCode(job);
        var outcome = RecoveryDeliveryOutcome.Failed;
        if (code is not null && transports.TryGetValue(job.Channel, out var transport))
        {
            using var deadline = CancellationTokenSource.CreateLinkedTokenSource(token);
            deadline.CancelAfter(TimeSpan.FromSeconds(12));
            try
            {
                outcome = await transport.SendAsync(job.Destination, code, deadline.Token);
            }
            catch (OperationCanceledException) when (!token.IsCancellationRequested)
            {
                outcome = RecoveryDeliveryOutcome.Retry;
            }
        }

        await store.FinishAsync(job, outcome, token);
        return true;
    }
}

public sealed class SmtpRecoveryTransport(string host, int port, string sender, string username, string password)
    : IRecoveryTransport
{
    public async Task<RecoveryDeliveryOutcome> SendAsync(string destination, string code, CancellationToken token)
    {
        try
        {
            using var client = new SmtpClient(host, port)
            {
                EnableSsl = true,
                Credentials = new NetworkCredential(username, password),
            };
            using var message = new MailMessage(sender, destination, "Community OS — код відновлення",
                $"Одноразовий код відновлення Community OS: {code}");
            await client.SendMailAsync(message, token);
            return RecoveryDeliveryOutcome.Sent;
        }
        catch (SmtpException exception)
        {
            return (int)exception.StatusCode >= 500 ? RecoveryDeliveryOutcome.Failed : RecoveryDeliveryOutcome.Retry;
        }
        catch (FormatException)
        {
            return RecoveryDeliveryOutcome.Failed;
        }
    }
}

public sealed class TelegramRecoveryTransport(HttpClient client, string botToken) : IRecoveryTransport
{
    public async Task<RecoveryDeliveryOutcome> SendAsync(string destination, string code, CancellationToken token)
    {
        if (!long.TryParse(destination, NumberStyles.None, CultureInfo.InvariantCulture, out var chatId) || chatId <= 0)
        {
            return RecoveryDeliveryOutcome.Failed;
        }

        try
        {
            var url = "https://api.telegram.org/bot" + Uri.EscapeDataString(botToken) + "/sendMessage";
            // The Bot API token is part of the path. Do not log the URI or provider response.
            using var response = await client.PostAsJsonAsync(url, new
            {
                chat_id = chatId,
                text = $"Одноразовий код відновлення Community OS: {code}",
                protect_content = true,
                allow_paid_broadcast = false,
            }, token);
            if (response.StatusCode == HttpStatusCode.TooManyRequests)
            {
                using var limit = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync(token), cancellationToken: token);
                var delay = limit.RootElement.TryGetProperty("parameters", out var parameters) &&
                    parameters.TryGetProperty("retry_after", out var seconds) && seconds.TryGetInt32(out var retry) ? retry : 60;
                return new("retry", delay);
            }

            if (!response.IsSuccessStatusCode)
            {
                return (int)response.StatusCode >= 500 ? RecoveryDeliveryOutcome.Retry : RecoveryDeliveryOutcome.Failed;
            }

            using var result = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync(token), cancellationToken: token);
            return result.RootElement.TryGetProperty("ok", out var ok) && ok.ValueKind == JsonValueKind.True
                ? RecoveryDeliveryOutcome.Sent : RecoveryDeliveryOutcome.Failed;
        }
        catch (Exception exception) when (exception is HttpRequestException or JsonException or InvalidOperationException)
        {
            return RecoveryDeliveryOutcome.Retry;
        }
    }
}
