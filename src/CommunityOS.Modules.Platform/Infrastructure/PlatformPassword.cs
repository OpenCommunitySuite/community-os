using System.Security.Cryptography;
using System.Text;
using Konscious.Security.Cryptography;

namespace CommunityOS.Modules.Platform.Infrastructure;

public static class PlatformPassword
{
    // Versioned profile. Do not change profile 1 after hashes have been stored.
    private const string Profile = "argon2id-v19-m65536-t3-p1";

    public static bool IsAcceptable(string? password) => password is { Length: >= 15 and <= 256 };

    public static async Task<string> HashAsync(string password)
    {
        if (!IsAcceptable(password))
        {
            throw new ArgumentException("Password must be 15–256 characters.", nameof(password));
        }

        var salt = RandomNumberGenerator.GetBytes(16);
        return $"{Profile}:{Convert.ToHexString(salt)}:{Convert.ToHexString(await DeriveAsync(password, salt))}";
    }

    public static async Task<bool> VerifyAsync(string password, string? storedHash)
    {
        if (storedHash?.Split(':') is [Profile, var saltText, var expectedText] &&
            TryHex(saltText, 16, out var salt) && TryHex(expectedText, 32, out var expected))
        {
            var actual = await DeriveAsync(password, salt);
            return CryptographicOperations.FixedTimeEquals(expected, actual);
        }

        // Do comparable work for an unknown login or unusable credential.
        await DeriveAsync(password, new byte[16]);
        return false;
    }
    private static async Task<byte[]> DeriveAsync(string password, byte[] salt)
    {
        var bytes = Encoding.UTF8.GetBytes(password);
        try
        {
            using var argon = new Argon2id(bytes)
            {
                Salt = salt,
                MemorySize = 65536,
                Iterations = 3,
                DegreeOfParallelism = 1,
            };
            return await argon.GetBytesAsync(32);
        }
        finally
        {
            CryptographicOperations.ZeroMemory(bytes);
        }
    }

    private static bool TryHex(string value, int size, out byte[] bytes)
    {
        bytes = new byte[size];
        return value.Length == size * 2 &&
            Convert.FromHexString(value, bytes, out _, out _) == System.Buffers.OperationStatus.Done;
    }
}
