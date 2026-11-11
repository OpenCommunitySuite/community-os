using System.Buffers;
using System.Security.Cryptography;
using Npgsql;

namespace CommunityOS.Modules.Platform.Infrastructure;

public sealed class PlatformPasswordRecovery(NpgsqlDataSource dataSource, RecoveryDeliveryStore? delivery = null)
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
        if (login is not { Length: > 0 and <= 128 } || !PlatformPassword.IsAcceptable(newPassword))
        {
            return false;
        }

        var normalized = PlatformAuthenticationStore.NormalizeLogin(login);
        Guid? issuance = null;
        byte[]? digest;
        if (delivery is not null && RecoveryDeliveryStore.IsShortCode(code))
        {
            await using var lookup = dataSource.CreateCommand(
                "SELECT platform_provisioning.short_recovery_issuance(@login);");
            lookup.Parameters.AddWithValue("login", normalized);
            issuance = await lookup.ExecuteScalarAsync(token) is Guid id ? id : null;
            digest = issuance is Guid current ? delivery.ShortVerifier(current, code!) : null;
        }
        else
        {
            digest = Digest(code);
        }

        if (digest is null)
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
            issuance is null
                ? "SELECT platform_provisioning.consume_password_recovery(@login, @digest, @expected, @hash);"
                : "SELECT platform_provisioning.consume_short_recovery(@login, @issuance, @digest, @expected, @hash);");
        if (issuance is Guid jobId)
        {
            command.Parameters.AddWithValue("issuance", jobId);
        }

        command.Parameters.AddWithValue("login", normalized);
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
