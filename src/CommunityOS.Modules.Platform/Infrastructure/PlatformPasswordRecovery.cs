using System.Buffers;
using System.Security.Cryptography;
using Npgsql;

namespace CommunityOS.Modules.Platform.Infrastructure;

public sealed class PlatformPasswordRecovery(NpgsqlDataSource dataSource)
{
    public async Task<string?> IssueAsync(Guid accountId, CancellationToken token)
    {
        var code = RandomNumberGenerator.GetBytes(32);
        try
        {
            await using var command = dataSource.CreateCommand(
                "SELECT platform_provisioning.issue_password_recovery(@account, @digest);");
            command.Parameters.AddWithValue("account", accountId);
            command.Parameters.AddWithValue("digest", SHA256.HashData(code));
            return await command.ExecuteScalarAsync(token) is true ? Convert.ToHexString(code) : null;
        }
        finally
        {
            CryptographicOperations.ZeroMemory(code);
        }
    }

    public async Task<bool> ConsumeAsync(string? login, string? code, string? newPassword, CancellationToken token)
    {
        if (login is not { Length: > 0 and <= 128 } || !PlatformPassword.IsAcceptable(newPassword) ||
            Digest(code) is not { } digest)
        {
            return false;
        }

        var credential = await new PlatformAuthenticationStore(dataSource).FindCredentialAsync(login, token);
        if (credential is null || await PlatformPassword.VerifyAsync(newPassword!, credential.PasswordHash))
        {
            return false;
        }

        var hash = await PlatformPassword.HashAsync(newPassword!);
        await using var command = dataSource.CreateCommand(
            "SELECT platform_provisioning.consume_password_recovery(@login, @digest, @expected, @hash);");
        command.Parameters.AddWithValue("login", PlatformAuthenticationStore.NormalizeLogin(login));
        command.Parameters.AddWithValue("digest", digest);
        command.Parameters.AddWithValue("expected", credential.PasswordHash);
        command.Parameters.AddWithValue("hash", hash);
        return await command.ExecuteScalarAsync(token) is true;
    }

    private static byte[]? Digest(string? code)
    {
        Span<byte> bytes = stackalloc byte[32];
        if (code is not { Length: 64 } ||
            Convert.FromHexString(code, bytes, out _, out _) != OperationStatus.Done)
        {
            return null;
        }

        var digest = SHA256.HashData(bytes);
        CryptographicOperations.ZeroMemory(bytes);
        return digest;
    }
}
