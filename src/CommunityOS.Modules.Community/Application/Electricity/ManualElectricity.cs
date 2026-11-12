namespace CommunityOS.Modules.Community.Application.Electricity;

public enum ReadingOutcome { Recognized, AlreadyRecorded, DateConflict, OutsideInstallation, FutureDate, InvalidValue, Decreasing, NotFound, UnsupportedChannel }

public sealed record ElectricityReading(Guid Id, DateOnly Date, decimal Value, string Source, string Rule,
    DateTime RecognizedAt, Guid AccountId, Guid SubjectId, string Channel = ManualElectricity.Total);

public sealed record ElectricityInterval(Guid FromReadingId, Guid ToReadingId, DateOnly From, DateOnly To, decimal Value,
    string Channel = ManualElectricity.Total);
public sealed record ElectricityCombinedInterval(ElectricityInterval Day, ElectricityInterval Night)
{
    public decimal Value => Day.Value + Night.Value;
}

public static class ManualElectricity
{
    public const string Source = "manual-observation";
    public const string Rule = "manual-electricity-daily-v1";
    public const string Unit = "kWh";
    public const string Total = "total";
    public const string Dual = "dual";
    public const string Day = "day";
    public const string Night = "night";
    public const string DualRule = "manual-electricity-daily-dual-v1";

    public static bool SupportsChannel(string mode, string channel) =>
        mode == Total && channel == Total || mode == Dual && channel is Day or Night;

    public static ReadingOutcome Evaluate(DateOnly installationStart, DateOnly today, DateOnly date, decimal value,
        decimal? sameDate, decimal? preceding, decimal? following, DateOnly? installationEnd = null)
    {
        if (date < installationStart || date >= installationEnd) return ReadingOutcome.OutsideInstallation;
        if (date > today) return ReadingOutcome.FutureDate;
        if (value is < 0 or > 999999999999.999m || decimal.Round(value, 3) != value)
            return ReadingOutcome.InvalidValue;
        if (sameDate is decimal existing)
            return existing == value ? ReadingOutcome.AlreadyRecorded : ReadingOutcome.DateConflict;
        if (preceding > value || following < value) return ReadingOutcome.Decreasing;
        return ReadingOutcome.Recognized;
    }

    public static IReadOnlyList<ElectricityInterval> Intervals(IReadOnlyList<ElectricityReading> readings)
    {
        var intervals = new List<ElectricityInterval>();
        foreach (var channel in readings.GroupBy(reading => reading.Channel))
        {
            ElectricityReading? previous = null;
            foreach (var current in channel.OrderBy(reading => reading.Date))
            {
                if (previous is not null)
                    intervals.Add(new(previous.Id, current.Id, previous.Date, current.Date, current.Value - previous.Value, channel.Key));
                previous = current;
            }
        }
        return intervals;
    }

    public static IReadOnlyList<ElectricityCombinedInterval> CombinedIntervals(IReadOnlyList<ElectricityInterval> intervals)
    {
        var nights = intervals.Where(interval => interval.Channel == Night)
            .ToDictionary(interval => (interval.From, interval.To));
        return intervals.Where(interval => interval.Channel == Day && nights.ContainsKey((interval.From, interval.To)))
            .Select(interval => new ElectricityCombinedInterval(interval, nights[(interval.From, interval.To)])).ToArray();
    }
}
