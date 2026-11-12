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
    public void Multiplier_preserves_exact_decimal_values_and_raw_delta()
    {
        var first = new ElectricityReading(Guid.NewGuid(), new(2026, 1, 1), 0, ManualElectricity.Source,
            ManualElectricity.Rule, DateTime.UtcNow, Guid.Empty, Guid.Empty);
        var second = first with { Id = Guid.NewGuid(), Date = first.Date.AddDays(1), Value = 0.001m };
        var small = Assert.Single(ManualElectricity.Intervals([first, second], 0.000001m));
        Assert.Equal("0.000000001", small.ValueExact);
        Assert.Equal("0.001", small.RawDeltaExact);
        var large = Assert.Single(ManualElectricity.Intervals([first, second with { Value = 999999999999.999m }], 1_000_000m));
        Assert.Equal("999999999999999000", large.ValueExact);
        Assert.True(ManualElectricity.SupportsMultiplier(40));
        Assert.False(ManualElectricity.SupportsMultiplier(0));
        Assert.False(ManualElectricity.SupportsMultiplier(0.0000001m));
        Assert.False(ManualElectricity.SupportsMultiplier(1_000_001m));
    }

    [Fact]
    public void Combined_estimate_requires_identical_adjacent_bounds()
    {
        var date = new DateOnly(2026, 1, 1);
        ElectricityReading Reading(int day, decimal value, string channel) =>
            new(Guid.NewGuid(), date.AddDays(day), value, ManualElectricity.Source, ManualElectricity.DualRule,
                DateTime.UtcNow, Guid.Empty, Guid.Empty, channel);
        ElectricityReading[] readings = [Reading(0, 100, ManualElectricity.Day), Reading(0, 20, ManualElectricity.Night),
            Reading(2, 106, ManualElectricity.Day), Reading(2, 23, ManualElectricity.Night)];
        var combined = Assert.Single(ManualElectricity.CombinedIntervals(ManualElectricity.Intervals(readings)));
        Assert.Equal(9m, combined.Value);
        Assert.Empty(ManualElectricity.CombinedIntervals(ManualElectricity.Intervals(
            [.. readings, Reading(1, 103, ManualElectricity.Day)])));
    }

    [Fact]
    public void Historical_installation_only_accepts_dates_before_replacement()
    {
        var start = new DateOnly(2026, 1, 1);
        var end = start.AddDays(2);
        Assert.Equal(ReadingOutcome.Recognized,
            ManualElectricity.Evaluate(start, end, end.AddDays(-1), 10m, null, null, null, end));
        Assert.Equal(ReadingOutcome.OutsideInstallation,
            ManualElectricity.Evaluate(start, end, end, 10m, null, null, null, end));
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
