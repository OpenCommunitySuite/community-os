using System.Globalization;
using System.Security.Cryptography;
using System.Text;

namespace CommunityOS.Modules.Community.Infrastructure;

public sealed record BankStatementRow(int Line, string Raw, string ExternalId, DateOnly? Date, string Direction,
    decimal? Amount, string Currency, string? Error, string? StatementAccount = null);

public sealed record BankStatementCsv(string Digest, IReadOnlyList<BankStatementRow> Rows)
{
    public const int MaximumBytes = 128 * 1024;
    public const int MaximumRows = 500;
    private const string Header = "external_id,booked_on,direction,amount,currency";

    public static BankStatementCsv Parse(ReadOnlySpan<byte> bytes)
    {
        if (bytes.Length > MaximumBytes) throw new FormatException("FileTooLarge");
        string text;
        try { text = new UTF8Encoding(false, true).GetString(bytes); }
        catch (DecoderFallbackException) { throw new FormatException("InvalidEncoding"); }
        using var reader = new StringReader(text.StartsWith('\uFEFF') ? text[1..] : text);
        if (reader.ReadLine() != Header) throw new FormatException("InvalidHeader");
        var rows = new List<BankStatementRow>();
        while (reader.ReadLine() is { } raw)
        {
            if (rows.Count == MaximumRows) throw new FormatException("TooManyRows");
            rows.Add(ParseRow(rows.Count + 2, raw));
        }
        if (rows.Count == 0) throw new FormatException("EmptyStatement");
        return new(Convert.ToHexString(SHA256.HashData(bytes)), rows);
    }

    private static BankStatementRow ParseRow(int line, string raw)
    {
        if (raw.Split(',') is not [var id, var dateText, var direction, var amountText, var currency])
            return new(line, raw, "", null, "", null, "", "InvalidFields");
        DateOnly? date = DateOnly.TryParseExact(dateText, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None,
            out var parsedDate) && parsedDate != default ? parsedDate : null;
        decimal? amount = ReadAmount(amountText);
        var error = id.Length is < 1 or > 128 || !id.All(c => char.IsAsciiLetterOrDigit(c) || c is '.' or '-' or '_')
            ? "InvalidIdentifier" : date is null ? "InvalidDate" :
            direction is not ("incoming" or "outgoing") ? "InvalidDirection" :
            amount is null ? "InvalidAmount" : currency != "UAH" ? "UnsupportedCurrency" : null;
        return new(line, raw, id, date, direction, amount, currency, error);
    }

    private static decimal? ReadAmount(string text)
    {
        var parts = text.Split('.');
        if (parts.Length > 2 || parts[0].Length is < 1 or > 9 ||
            (parts.Length == 2 && parts[1].Length is < 1 or > 2) ||
            parts.Any(part => !part.All(char.IsAsciiDigit))) return null;
        return decimal.TryParse(text, NumberStyles.AllowDecimalPoint, CultureInfo.InvariantCulture, out var amount) &&
            amount > 0 ? amount : null;
    }
}
