using System.Text;
using CommunityOS.Modules.Community.Infrastructure;
using Xunit;

namespace CommunityOS.IntegrationTests;

public class BankStatementCsvTests
{
    private const string Header = "external_id,booked_on,direction,amount,currency\n";

    [Fact]
    public void Retains_source_rows_and_reports_invalid_fields()
    {
        const string valid = "tx-1,2026-02-01,incoming,300.00,UAH";
        var parsed = BankStatementCsv.Parse(Encoding.UTF8.GetBytes(Header + valid + "\n" +
            "tx-2,2026-02-02,outgoing,1.001,UAH\n\ntx-3,2026-02-03,incoming,1,EUR"));
        Assert.Equal(64, parsed.Digest.Length);
        Assert.Equal(valid, parsed.Rows[0].Raw);
        Assert.Equal(2, parsed.Rows[0].Line);
        Assert.Equal(300m, parsed.Rows[0].Amount);
        Assert.Equal(new string?[] { null, "InvalidAmount", "InvalidFields", "UnsupportedCurrency" },
            parsed.Rows.Select(row => row.Error));
    }

    [Fact]
    public void Rejects_empty_invalid_and_oversized_files()
    {
        Assert.Throws<FormatException>(() => BankStatementCsv.Parse(Encoding.UTF8.GetBytes(Header)));
        Assert.Throws<FormatException>(() => BankStatementCsv.Parse([0xff]));
        Assert.Throws<FormatException>(() => BankStatementCsv.Parse(new byte[BankStatementCsv.MaximumBytes + 1]));
    }
}
