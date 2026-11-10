using System.Security.Cryptography;
using Npgsql;

namespace CommunityOS.Modules.Platform.Infrastructure;

// Sessions for the isolated bootstrap rehearsal host.
public sealed class BootstrapRehearsalSessions(NpgsqlDataSource dataSource)
{
    public async Task<string> StartAsync(Guid accountId, CancellationToken cancellationToken)
    {
        var token = RandomNumberGenerator.GetBytes(32);
        await using var command = dataSource.CreateCommand("""
            INSERT INTO platform_provisioning.rehearsal_session (token_digest, account_id, expires_at)
            VALUES (@digest, @account, clock_timestamp() + interval '30 minutes');
            """);
        command.Parameters.AddWithValue("digest", SHA256.HashData(token));
        command.Parameters.AddWithValue("account", accountId);
        await command.ExecuteNonQueryAsync(cancellationToken);
        return Convert.ToHexString(token);
    }

    public async Task<Guid?> ResolveAsync(string? token, CancellationToken cancellationToken)
    {
        if (!TryDigest(token, out var digest))
        {
            return null;
        }

        await using var command = dataSource.CreateCommand("""
            SELECT account_id FROM platform_provisioning.rehearsal_session
            WHERE token_digest = @digest AND expires_at > clock_timestamp();
            """);
        command.Parameters.AddWithValue("digest", digest);
        return (Guid?)await command.ExecuteScalarAsync(cancellationToken);
    }

    public async Task EndAsync(string? token, CancellationToken cancellationToken)
    {
        if (!TryDigest(token, out var digest))
        {
            return;
        }

        await using var command = dataSource.CreateCommand("""
            DELETE FROM platform_provisioning.rehearsal_session WHERE token_digest = @digest;
            """);
        command.Parameters.AddWithValue("digest", digest);
        await command.ExecuteNonQueryAsync(cancellationToken);
    }

    private static bool TryDigest(string? token, out byte[] digest)
    {
        Span<byte> bytes = stackalloc byte[32];
        if (token is { Length: 64 } && Convert.FromHexString(token, bytes, out _, out _) == System.Buffers.OperationStatus.Done)
        {
            digest = SHA256.HashData(bytes);
            return true;
        }

        digest = [];
        return false;
    }
}
