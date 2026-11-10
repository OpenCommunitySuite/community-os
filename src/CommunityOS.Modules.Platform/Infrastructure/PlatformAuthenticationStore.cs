using System.Security.Cryptography;
using Npgsql;

namespace CommunityOS.Modules.Platform.Infrastructure;

public sealed record PlatformCredential(Guid Id, string PasswordHash);

public sealed class PlatformAuthenticationStore(NpgsqlDataSource dataSource)
{
    public static string NormalizeLogin(string login) => login.Trim().ToLowerInvariant();

    public async Task<Guid> AddAccountAsync(string login, string password, bool creator, CancellationToken token)
    {
        var normalized = NormalizeLogin(login);
        if (normalized.Length is < 1 or > 128 || normalized.Any(c => !char.IsAsciiLetterOrDigit(c) && c is not ('.' or '-' or '_' or '@')))
        {
            throw new ArgumentException("Login must be 1–128 ASCII letters, digits or . - _ @.");
        }

        var id = Guid.CreateVersion7();
        await using var command = dataSource.CreateCommand("""
            INSERT INTO platform_provisioning.platform_account (id, login, password_hash, can_create_community)
            VALUES (@id, @login, @hash, @creator);
            """);
        command.Parameters.AddWithValue("id", id);
        command.Parameters.AddWithValue("login", normalized);
        command.Parameters.AddWithValue("hash", await PlatformPassword.HashAsync(password));
        command.Parameters.AddWithValue("creator", creator);
        await command.ExecuteNonQueryAsync(token);
        return id;
    }

    public async Task<PlatformCredential?> FindCredentialAsync(string login, CancellationToken token)
    {
        await using var command = dataSource.CreateCommand("""
            SELECT id, password_hash FROM platform_provisioning.platform_account
            WHERE login = @login AND disabled_at IS NULL;
            """);
        command.Parameters.AddWithValue("login", NormalizeLogin(login));
        await using var reader = await command.ExecuteReaderAsync(token);
        return await reader.ReadAsync(token) ? new(reader.GetGuid(0), reader.GetString(1)) : null;
    }

    public async Task<string?> StartSessionAsync(PlatformCredential credential, CancellationToken token)
    {
        var secret = RandomNumberGenerator.GetBytes(32);
        await using var command = dataSource.CreateCommand("""
            WITH created AS (
                INSERT INTO platform_provisioning.platform_session (token_digest, account_id, expires_at)
                SELECT @digest, id, clock_timestamp() + interval '30 minutes'
                FROM platform_provisioning.platform_account
                WHERE id = @account AND password_hash = @hash AND disabled_at IS NULL
                FOR SHARE
                RETURNING account_id
            )
            INSERT INTO platform_provisioning.platform_auth_security_event (event_kind, account_id)
            SELECT 'session-started', account_id FROM created;
            """);
        command.Parameters.AddWithValue("digest", SHA256.HashData(secret));
        command.Parameters.AddWithValue("account", credential.Id);
        command.Parameters.AddWithValue("hash", credential.PasswordHash);
        return await command.ExecuteNonQueryAsync(token) == 1 ? Convert.ToHexString(secret) : null;
    }

    public async Task RevokeSessionAsync(string? secret, CancellationToken token)
    {
        var digest = Digest(secret);
        if (digest is null)
        {
            return;
        }

        await using var command = dataSource.CreateCommand("""
            WITH revoked AS (
                UPDATE platform_provisioning.platform_session SET revoked_at = clock_timestamp()
                WHERE token_digest = @digest AND revoked_at IS NULL
                RETURNING account_id
            )
            INSERT INTO platform_provisioning.platform_auth_security_event (event_kind, account_id)
            SELECT 'session-revoked', account_id FROM revoked;
            """);
        command.Parameters.AddWithValue("digest", digest);
        await command.ExecuteNonQueryAsync(token);
    }

    public async Task<T> WithCreatorAsync<T>(string? secret, Guid? targetAccountId,
        Func<Guid, bool, NpgsqlTransaction, Task<T>> action, T denied, CancellationToken token)
    {
        var digest = Digest(secret);
        if (digest is null)
        {
            return denied;
        }

        await using var connection = await dataSource.OpenConnectionAsync(token);
        await using var transaction = await connection.BeginTransactionAsync(token);
        await using var authorization = new NpgsqlCommand("""
            SELECT a.id
            FROM platform_provisioning.platform_session s
            JOIN platform_provisioning.platform_account a ON a.id = s.account_id
            WHERE s.token_digest = @digest AND s.expires_at > clock_timestamp()
                AND s.revoked_at IS NULL AND a.disabled_at IS NULL AND a.can_create_community
            FOR SHARE OF a;
            """, connection, transaction);
        authorization.Parameters.AddWithValue("digest", digest);
        if (await authorization.ExecuteScalarAsync(token) is not Guid actor)
        {
            return denied;
        }

        var targetActive = true;
        if (targetAccountId is Guid target)
        {
            await using var check = new NpgsqlCommand("""
                SELECT id FROM platform_provisioning.platform_account
                WHERE id = @id AND disabled_at IS NULL FOR SHARE;
                """, connection, transaction);
            check.Parameters.AddWithValue("id", target);
            targetActive = await check.ExecuteScalarAsync(token) is Guid;
        }

        await using var current = new NpgsqlCommand("""
            SELECT true FROM platform_provisioning.platform_session
            WHERE token_digest = @digest AND account_id = @actor AND revoked_at IS NULL
                AND expires_at > clock_timestamp()
            FOR SHARE;
            """, connection, transaction);
        current.Parameters.AddWithValue("digest", digest);
        current.Parameters.AddWithValue("actor", actor);
        if (await current.ExecuteScalarAsync(token) is not true)
        {
            return denied;
        }

        await using var deadline = new NpgsqlCommand("""
            SELECT expires_at > clock_timestamp() FROM platform_provisioning.platform_session
            WHERE token_digest = @digest;
            """, connection, transaction);
        deadline.Parameters.AddWithValue("digest", digest);
        if (await deadline.ExecuteScalarAsync(token) is not true)
        {
            return denied;
        }

        var result = await action(actor, targetActive, transaction);
        await transaction.CommitAsync(token);
        return result;
    }
    public async Task RecordLoginDenialAsync(CancellationToken token)
    {
        await using var command = dataSource.CreateCommand("""
            INSERT INTO platform_provisioning.platform_auth_security_event (event_kind) VALUES ('login-denied');
            """);
        await command.ExecuteNonQueryAsync(token);
    }

    public async Task RecordAuditReadAsync(NpgsqlTransaction transaction, Guid actor, Guid communityId,
        CancellationToken token)
    {
        await using var command = new NpgsqlCommand("""
            INSERT INTO platform_provisioning.platform_auth_security_event (event_kind, account_id, community_id)
            VALUES ('bootstrap-audit-read', @account, @community);
            """, transaction.Connection, transaction);
        command.Parameters.AddWithValue("account", actor);
        command.Parameters.AddWithValue("community", communityId);
        await command.ExecuteNonQueryAsync(token);
    }

    public async Task<Guid?> ResolveAssignedAccountAsync(string? secret, Guid communityId, CancellationToken token)
    {
        var digest = Digest(secret);
        if (digest is null)
        {
            return null;
        }

        await using var command = dataSource.CreateCommand("""
            SELECT a.id
            FROM platform_provisioning.platform_session s
            JOIN platform_provisioning.platform_account a ON a.id = s.account_id
            JOIN platform_provisioning.community_reservation r ON r.initial_administrator_account_id = a.id
            JOIN platform_provisioning.bootstrap_administrator b ON b.operation_id = r.operation_id
            WHERE s.token_digest = @digest AND s.expires_at > clock_timestamp() AND s.revoked_at IS NULL
                AND a.disabled_at IS NULL AND r.community_id = @community AND b.revoked_at IS NULL;
            """);
        command.Parameters.AddWithValue("digest", digest);
        command.Parameters.AddWithValue("community", communityId);
        return (Guid?)await command.ExecuteScalarAsync(token);
    }
    private static byte[]? Digest(string? secret)
    {
        Span<byte> bytes = stackalloc byte[32];
        return secret is { Length: 64 } &&
            Convert.FromHexString(secret, bytes, out _, out _) == System.Buffers.OperationStatus.Done
            ? SHA256.HashData(bytes) : null;
    }
}
