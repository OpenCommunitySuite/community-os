using CommunityOS.Modules.Community.Application.Electricity;
using Xunit;

namespace CommunityOS.IntegrationTests;

public class ElectricityReadingImportTests
{
    [Fact]
    public void Parses_exact_values_and_reports_bad_rows_without_discarding_other_rows()
    {
        var id = Guid.NewGuid();
        using var input = new StringReader($"""
            {ElectricityReadingImport.Header}
            {id:D},2026-01-02,day,100.003
            {id:D},2026-01-03,night,1.0001
            {id:D},2026-02-30,total,10
            {id:D},2026-01-01,total,999999999999.999
            """);
        var rows = ElectricityReadingImport.Parse(input);
        Assert.Equal(new[] { 2, 3, 4, 5 }, rows.Select(row => row.Line));
        Assert.Equal(new ElectricityImportRow(2, id, new(2026, 1, 2), ManualElectricity.Day, 100.003m),
            rows[0].Reading);
        Assert.Equal("InvalidValue", rows[1].Error);
        Assert.Equal("InvalidDate", rows[2].Error);
        Assert.Equal(999999999999.999m, rows[3].Reading?.Value);
    }

    [Fact]
    public void Rejects_unknown_template_and_oversize_batches()
    {
        using var badHeader = new StringReader("meter,date,channel,value");
        Assert.Equal("InvalidHeader", Assert.Throws<FormatException>(() => ElectricityReadingImport.Parse(badHeader)).Message);
        using var oversized = new StringReader(ElectricityReadingImport.Header + "\n" +
            string.Concat(Enumerable.Repeat("invalid\n", ElectricityReadingImport.MaximumRecords + 1)));
        Assert.Equal("TooManyRecords", Assert.Throws<FormatException>(() => ElectricityReadingImport.Parse(oversized)).Message);
    }
}
