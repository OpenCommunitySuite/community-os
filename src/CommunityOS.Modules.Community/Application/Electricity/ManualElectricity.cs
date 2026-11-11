namespace CommunityOS.Modules.Community.Application.Electricity;

public enum ReadingOutcome { Recognized, AlreadyRecorded, DateConflict, OutsideInstallation, FutureDate, InvalidValue, Decreasing, NotFound }

public sealed record ElectricityReading(Guid Id, DateOnly Date, decimal Value, string Source, string Rule,
    DateTime RecognizedAt, Guid AccountId, Guid SubjectId);

public sealed record ElectricityInterval(Guid FromReadingId, Guid ToReadingId, DateOnly From, DateOnly To, decimal Value);

public static class ManualElectricity
{
    public const string Source = "manual-observation";
    public const string Rule = "manual-electricity-daily-v1";
    public const string Unit = "kWh";

    public static ReadingOutcome Evaluate(DateOnly installationStart, DateOnly today, DateOnly date, decimal value,
        decimal? sameDate, decimal? preceding, decimal? following)
    {
        if (date < installationStart) return ReadingOutcome.OutsideInstallation;
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
        for (var index = 1; index < readings.Count; index++)
        {
            var previous = readings[index - 1];
            var current = readings[index];
            intervals.Add(new(previous.Id, current.Id, previous.Date, current.Date, current.Value - previous.Value));
        }
        return intervals;
    }
}
