using System.Security.Cryptography;
using System.Text;
using Npgsql;
using NpgsqlTypes;

namespace CommunityOS.Modules.Platform.Infrastructure;

public sealed record RecoveryDeliveryJob(Guid Id, int Attempt, string Channel, string Destination, byte[] Digest);

public sealed class RecoveryDeliveryStore(NpgsqlDataSource dataSource, byte[] key)
{
    public static byte[] ReadKey(string hex)
    {
        var key = Convert.FromHexString(hex);
        return key.Length == 32 ? key : throw new InvalidOperationException("Recovery delivery requires a 32-byte key.");
    }

    public byte[] DeriveCode(Guid jobId) =>
        HMACSHA256.HashData(key, Encoding.ASCII.GetBytes("CommunityOS/platform-password-recovery/v1/" + jobId.ToString("D")));

    public async Task RequestAsync(string? login, CancellationToken token)
    {
        var job = Guid.CreateVersion7();
        var code = DeriveCode(job);
        try
        {
            await using var command = dataSource.CreateCommand(
                "SELECT platform_provisioning.request_recovery_delivery(@login, @job, @digest);");
            command.Parameters.AddWithValue("login", login is { Length: > 0 and <= 128 }
                ? PlatformAuthenticationStore.NormalizeLogin(login) : string.Empty);
            command.Parameters.AddWithValue("job", job);
            command.Parameters.AddWithValue("digest", SHA256.HashData(code));
            await command.ExecuteNonQueryAsync(token);
        }
        finally
        {
            CryptographicOperations.ZeroMemory(code);
        }
    }

    public async Task<RecoveryDeliveryJob?> ClaimAsync(CancellationToken token)
    {
        await using var command = dataSource.CreateCommand("SELECT * FROM platform_provisioning.claim_recovery_delivery();");
        await using var reader = await command.ExecuteReaderAsync(token);
        return await reader.ReadAsync(token) ? new(reader.GetGuid(0), reader.GetInt32(1),
            reader.GetString(2), reader.GetString(3), reader.GetFieldValue<byte[]>(4)) : null;
    }

    public async Task FinishAsync(RecoveryDeliveryJob job, RecoveryDeliveryOutcome outcome, CancellationToken token)
    {
        await using var command = dataSource.CreateCommand(
            "SELECT platform_provisioning.finish_recovery_delivery(@job, @attempt, @outcome, @delay);");
        command.Parameters.AddWithValue("job", job.Id);
        command.Parameters.AddWithValue("attempt", job.Attempt);
        command.Parameters.AddWithValue("outcome", outcome.Status);
        command.Parameters.AddWithValue("delay", Math.Clamp(outcome.RetrySeconds, 30, 900));
        await command.ExecuteNonQueryAsync(token);
    }
}

public sealed class RecoveryChannelOperator(NpgsqlDataSource dataSource)
{
    public async Task<bool> SetAsync(Guid account, string? channel, string? destination, CancellationToken token)
    {
        await using var command = dataSource.CreateCommand(
            "SELECT platform_provisioning.set_recovery_channel(@account, @channel, @destination);");
        command.Parameters.AddWithValue("account", account);
        command.Parameters.AddWithValue("channel", NpgsqlDbType.Text, (object?)channel ?? DBNull.Value);
        command.Parameters.AddWithValue("destination", NpgsqlDbType.Text, (object?)destination ?? DBNull.Value);
        return await command.ExecuteScalarAsync(token) is true;
    }
}
