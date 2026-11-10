using System.Net;
using System.Text.Json;
using CommunityOS.Modules.Platform.Infrastructure;
using Xunit;

namespace CommunityOS.IntegrationTests;

public sealed class TelegramRecoveryTransportTests
{
    [Fact]
    public async Task Sends_To_The_Bound_Chat_Without_Paid_Broadcast_And_Respects_Retry_After()
    {
        using var client = new HttpClient(new TelegramFixture());
        var transport = new TelegramRecoveryTransport(client, "synthetic-token");
        var outcome = await transport.SendAsync("123456", "synthetic-code", TestContext.Current.CancellationToken);
        Assert.Equal(new RecoveryDeliveryOutcome("retry", 95), outcome);
    }

    private sealed class TelegramFixture : HttpMessageHandler
    {
        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken token)
        {
            Assert.Equal(HttpMethod.Post, request.Method);
            Assert.Equal("https://api.telegram.org/botsynthetic-token/sendMessage", request.RequestUri?.AbsoluteUri);
            using var payload = JsonDocument.Parse(await request.Content!.ReadAsStringAsync(token));
            Assert.Equal(123456, payload.RootElement.GetProperty("chat_id").GetInt64());
            Assert.Contains("synthetic-code", payload.RootElement.GetProperty("text").GetString());
            Assert.False(payload.RootElement.GetProperty("allow_paid_broadcast").GetBoolean());
            Assert.True(payload.RootElement.GetProperty("protect_content").GetBoolean());
            return new HttpResponseMessage(HttpStatusCode.TooManyRequests)
            {
                Content = new StringContent("""{"ok":false,"parameters":{"retry_after":95}}"""),
            };
        }
    }
}
