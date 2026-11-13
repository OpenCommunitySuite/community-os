using System.Buffers.Binary;
using System.Globalization;
using System.Security.Cryptography;
using System.Text;

namespace CommunityOS.Modules.Community.Infrastructure;

public static class BankStatementDbf
{
    private static readonly (string Name, char Type, int Length, int Scale)[] Layout =
    [
        ("TIP",'C',4,0), ("N_D",'C',10,0), ("DATE",'C',10,0), ("SUMMA",'N',15,2),
        ("NAME_A",'C',140,0), ("COUNT_A",'C',40,0), ("MFO_A",'C',9,0), ("BANK_A",'C',45,0),
        ("NAME_B",'C',140,0), ("COUNT_B",'C',32,0), ("MFO_B",'C',9,0), ("BANK_B",'C',45,0),
        ("N_P",'C',160,0), ("VAL",'C',4,0), ("OKPO_A",'C',10,0), ("OKPO_B",'C',10,0),
        ("TIME",'C',17,0), ("REF",'C',16,0), ("SUM_E",'N',15,2),
    ];

    public static BankStatementCsv Parse(ReadOnlySpan<byte> bytes)
    {
        if (bytes.Length > BankStatementCsv.MaximumBytes) throw new FormatException("FileTooLarge");
        var header = 33 + Layout.Length * 32;
        var width = 1 + Layout.Sum(field => field.Length);
        if (bytes.Length < header || bytes[0] != 3 || bytes[29] != 0xc9 || bytes[header - 1] != 0x0d ||
            BinaryPrimitives.ReadUInt16LittleEndian(bytes[8..]) != header ||
            BinaryPrimitives.ReadUInt16LittleEndian(bytes[10..]) != width)
            throw new FormatException("InvalidDbf");
        var count = BinaryPrimitives.ReadUInt32LittleEndian(bytes[4..]);
        if (count > BankStatementCsv.MaximumRows) throw new FormatException("TooManyRows");
        var end = header + (int)count * width;
        if (bytes.Length != end && (bytes.Length != end + 1 || bytes[end] != 0x1a))
            throw new FormatException("InvalidDbf");
        var offsets = new Dictionary<string, (int Offset, int Length)>();
        var offset = 1;
        for (var index = 0; index < Layout.Length; index++)
        {
            var field = Layout[index];
            var descriptor = bytes.Slice(32 + index * 32, 32);
            var name = Encoding.ASCII.GetString(descriptor[..11]).TrimEnd('\0');
            if (name != field.Name || descriptor[11] != field.Type || descriptor[16] != field.Length ||
                descriptor[17] != field.Scale) throw new FormatException("InvalidDbf");
            offsets.Add(name, (offset, field.Length));
            offset += field.Length;
        }
        Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);
        var encoding = Encoding.GetEncoding(1251);
        var rows = new List<BankStatementRow>();
        for (var index = 0; index < count; index++)
        {
            var record = bytes.Slice(header + index * width, width);
            if (record[0] == '*') continue;
            if (record[0] != ' ' || record.Contains((byte)0)) throw new FormatException("InvalidDbf");
            rows.Add(ReadRow(encoding.GetString(record), index + 2, offsets));
        }
        if (rows.Count == 0) throw new FormatException("EmptyStatement");
        return new(Convert.ToHexString(SHA256.HashData(bytes)), rows);
    }

    private static BankStatementRow ReadRow(string raw, int line, Dictionary<string, (int Offset, int Length)> offsets)
    {
        string Field(string name)
        {
            var (offset, length) = offsets[name];
            return raw.Substring(offset, length).Trim();
        }
        var id = Field("REF");
        var account = Field("COUNT_A");
        var currency = Field("VAL");
        var direction = Field("TIP") switch { "C;R;" => "incoming", "D;R;" => "outgoing", _ => "" };
        DateOnly? date = DateOnly.TryParseExact(Field("DATE"), "dd.MM.yyyy", CultureInfo.InvariantCulture, DateTimeStyles.None,
            out var parsed) && parsed != default ? parsed : null;
        var validAmount = decimal.TryParse(Field("SUMMA"), NumberStyles.AllowLeadingSign | NumberStyles.AllowDecimalPoint,
            CultureInfo.InvariantCulture, out var signed) && signed is >= -999999999.99m and <= 999999999.99m &&
            signed != 0 && decimal.Round(signed, 2) == signed;
        var error = id.Length == 0 || !id.All(c => char.IsAsciiLetterOrDigit(c) || c is '.' or '-' or '_')
            ? "InvalidIdentifier" : date is null ? "InvalidDate" : direction == "" ? "InvalidDirection" :
            !validAmount || (signed > 0) != (direction == "incoming") ? "InvalidAmount" :
            currency != "UAH" ? "UnsupportedCurrency" :
            account.Length != 29 || !account.StartsWith("UA", StringComparison.Ordinal) ||
            !account.AsSpan(2).ToArray().All(char.IsAsciiDigit) ? "InvalidBankAccount" : null;
        return new(line, raw, id, date, direction, validAmount ? Math.Abs(signed) : null, currency, error, account);
    }
}
