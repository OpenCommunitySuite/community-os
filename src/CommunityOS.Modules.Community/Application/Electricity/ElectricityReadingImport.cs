using System.Globalization;

namespace CommunityOS.Modules.Community.Application.Electricity;

public sealed record ElectricityImportRow(int Line, Guid InstallationId, DateOnly MeasuredOn, string Channel, decimal Value);

public sealed record ElectricityImportRecord(int Line, ElectricityImportRow? Reading, string? Error);

public static class ElectricityReadingImport
{
    public const int MaximumRecords = 500;
    public const int MaximumBytes = 128 * 1024;
    public const string Header = "installation_id,measured_on,channel,value_kwh";

    public const string WaterHeader = "installation_id,measured_on,value_m3";

    public static IReadOnlyList<ElectricityImportRecord> Parse(TextReader reader, bool water = false)
    {
        if (reader.ReadLine() != (water ? WaterHeader : Header))
            throw new FormatException("InvalidHeader");

        var rows = new List<ElectricityImportRecord>();
        while (reader.ReadLine() is { } line)
        {
            if (rows.Count == MaximumRecords)
                throw new FormatException("TooManyRecords");
            var fields = line.Split(',');
            if (water && fields is [var id, var date, var value])
                fields = [id, date, ManualElectricity.Total, value];
            else if (water)
                fields = [];
            rows.Add(ParseLine(rows.Count + 2, fields));
        }
        return rows;
    }

    private static ElectricityImportRecord ParseLine(int number, string[] fields)
    {
        if (fields is not [var id, var date, var channel, var value])
            return new(number, null, "InvalidFields");
        if (!Guid.TryParseExact(id, "D", out var installation) || installation == Guid.Empty)
            return new(number, null, "InvalidInstallation");
        if (!DateOnly.TryParseExact(date, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var measuredOn) ||
            measuredOn == DateOnly.MinValue)
            return new(number, null, "InvalidDate");
        if (channel is not (ManualElectricity.Total or ManualElectricity.Day or ManualElectricity.Night))
            return new(number, null, "UnsupportedChannel");
        if (!TryValue(value, out var cumulative))
            return new(number, null, "InvalidValue");
        return new(number, new(number, installation, measuredOn, channel, cumulative), null);
    }

    private static bool TryValue(string value, out decimal result)
    {
        result = 0;
        var valid = value.Split('.') switch
        {
            [var whole] => Digits(whole, 12),
            [var whole, var fraction] => Digits(whole, 12) && Digits(fraction, 3),
            _ => false
        };
        return valid && decimal.TryParse(value, NumberStyles.AllowDecimalPoint, CultureInfo.InvariantCulture, out result);
    }

    private static bool Digits(string value, int maximum) =>
        value.Length > 0 && value.Length <= maximum && value.All(char.IsAsciiDigit);
}
