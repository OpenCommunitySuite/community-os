using CommunityOS.Modules.Community.Application.Electricity;
using Xunit;

namespace CommunityOS.IntegrationTests;

public class ManualElectricityTests
{
    [Theory]
    [InlineData(0, 10, null, null, null, ReadingOutcome.Recognized)]
    [InlineData(-1, 10, null, null, null, ReadingOutcome.OutsideInstallation)]
    [InlineData(31, 10, null, null, null, ReadingOutcome.FutureDate)]
    [InlineData(2, -1, null, null, null, ReadingOutcome.InvalidValue)]
    [InlineData(2, 10, 10, null, null, ReadingOutcome.AlreadyRecorded)]
    [InlineData(2, 11, 10, null, null, ReadingOutcome.DateConflict)]
    [InlineData(2, 9, null, 10, 12, ReadingOutcome.Decreasing)]
    [InlineData(2, 13, null, 10, 12, ReadingOutcome.Decreasing)]
    [InlineData(2, 10, null, 10, 10, ReadingOutcome.Recognized)]
    public void Recognition_checks_the_installation_day_and_both_neighbors(int day, int value,
        int? same, int? previous, int? next, ReadingOutcome expected)
    {
        var starts = new DateOnly(2026, 1, 1);
        Assert.Equal(expected, ManualElectricity.Evaluate(starts, starts.AddDays(30), starts.AddDays(day),
            value, same, previous, next));
        Assert.Equal(ReadingOutcome.InvalidValue,
            ManualElectricity.Evaluate(starts, starts, starts, 1.0001m, null, null, null));
    }

    [Fact]
    public void Intervals_preserve_dates_and_input_identifiers()
    {
        var start = new DateOnly(2026, 1, 1);
        var first = new ElectricityReading(Guid.NewGuid(), start, 10.25m, ManualElectricity.Source,
            ManualElectricity.Rule, DateTime.UtcNow, Guid.NewGuid(), Guid.NewGuid());
        var second = first with { Id = Guid.NewGuid(), Date = start.AddDays(2), Value = 15.125m };
        Assert.Empty(ManualElectricity.Intervals([first]));
        var interval = Assert.Single(ManualElectricity.Intervals([first, second]));
        Assert.Equal(new ElectricityInterval(first.Id, second.Id, first.Date, second.Date, 4.875m), interval);
    }
}
