using System.Buffers.Binary;
using System.Text;
using CommunityOS.Modules.Community.Infrastructure;
using Xunit;

namespace CommunityOS.IntegrationTests;

public class BankStatementDbfTests
{
    internal const string Iban = "UA000000000000000000000000001";

    [Fact]
    public void Maps_p24_rows_and_rejects_a_truncated_record()
    {
        var bytes = Create();
        var rows = BankStatementDbf.Parse(bytes).Rows;
        Assert.Equal(new[] { "incoming", "outgoing" }, rows.Select(row => row.Direction));
        Assert.All(rows, row => { Assert.Null(row.Error); Assert.Equal(Iban, row.StatementAccount); });
        Assert.Equal(300m, rows[0].Amount);
        Assert.Equal(5m, rows[1].Amount);
        Assert.Throws<FormatException>(() => BankStatementDbf.Parse(bytes.AsSpan(0, bytes.Length - 1)));
    }

    internal static byte[] Create()
    {
        string[] fields = ["TIP:4", "N_D:10", "DATE:10", "SUMMA:15", "NAME_A:140", "COUNT_A:40", "MFO_A:9",
            "BANK_A:45", "NAME_B:140", "COUNT_B:32", "MFO_B:9", "BANK_B:45", "N_P:160", "VAL:4",
            "OKPO_A:10", "OKPO_B:10", "TIME:17", "REF:16", "SUM_E:15"];
        const int header = 641, width = 732;
        var bytes = new byte[header + 2 * width];
        bytes[0] = 3;
        bytes[29] = 0xc9;
        bytes[header - 1] = 0x0d;
        BinaryPrimitives.WriteUInt32LittleEndian(bytes.AsSpan(4), 2);
        BinaryPrimitives.WriteUInt16LittleEndian(bytes.AsSpan(8), header);
        BinaryPrimitives.WriteUInt16LittleEndian(bytes.AsSpan(10), width);
        var offset = 1;
        for (var index = 0; index < fields.Length; index++)
        {
            var parts = fields[index].Split(':');
            var name = parts[0];
            var length = int.Parse(parts[1], System.Globalization.CultureInfo.InvariantCulture);
            var descriptor = 32 + index * 32;
            Encoding.ASCII.GetBytes(name, bytes.AsSpan(descriptor));
            var numeric = name is "SUMMA" or "SUM_E";
            bytes[descriptor + 11] = (byte)(numeric ? 'N' : 'C');
            bytes[descriptor + 16] = (byte)length;
            bytes[descriptor + 17] = (byte)(numeric ? 2 : 0);
            for (var row = 0; row < 2; row++)
            {
                var record = header + row * width;
                bytes[record] = (byte)' ';
                var value = name switch
                {
                    "TIP" => row == 0 ? "C;R;" : "D;R;",
                    "DATE" => "01.02.2026",
                    "SUMMA" => row == 0 ? "300.00" : "-5.00",
                    "COUNT_A" => Iban,
                    "VAL" => "UAH",
                    "REF" => row == 0 ? "dbf-1" : "dbf-2",
                    _ => "",
                };
                Encoding.ASCII.GetBytes(value.PadRight(length), bytes.AsSpan(record + offset, length));
            }
            offset += length;
        }
        return bytes;
    }
}
