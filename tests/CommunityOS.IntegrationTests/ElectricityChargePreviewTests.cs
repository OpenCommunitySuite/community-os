using CommunityOS.Modules.Community.Application.Electricity;
using CommunityOS.Modules.Community.Application.Finance;
using Xunit;

namespace CommunityOS.IntegrationTests;

public class ElectricityChargePreviewTests
{
    private static readonly DateOnly From = new(2026, 1, 1);
    private static readonly DateOnly Until = From.AddMonths(1);
    private static readonly Guid Installation = Guid.NewGuid();

    [Theory]
    [InlineData(1, 3, 12)]
    [InlineData(40, 120, 480)]
    public void Calculates_consumption_and_preserves_the_inputs(int multiplier, int volume, int amount)
    {
        var readings = new[] { Reading(From, 100m), Reading(Until, 103m) };
        var tariff = Tariff();
        var preview = Calculate(readings, [tariff], multiplier);
        Assert.Equal(ChargePreviewStatus.Ready, preview.Status);
        Assert.Equal(tariff.Id, preview.Tariff?.Id);
        Assert.Equal(Installation, preview.InstallationId);
        var register = Assert.Single(preview.Registers!);
        Assert.Equal((readings[0].Id, readings[1].Id), (register.StartReading, register.EndReading));
        Assert.Equal((decimal)volume, register.Consumption);
        Assert.Equal((decimal)amount, preview.AmountUah);
    }

    [Fact]
    public void Requires_complete_bounds_and_one_tariff_covering_the_period()
    {
        var readings = new[] { Reading(From, 100m), Reading(Until, 103m) };
        var tariff = Tariff();
        Assert.Equal(ChargePreviewStatus.MissingBoundary, Calculate([readings[0]], [tariff]).Status);
        Assert.Equal(ChargePreviewStatus.MissingTariff, Calculate(readings, []).Status);
        Assert.Equal(ChargePreviewStatus.AmbiguousTariff, Calculate(readings, [tariff, Tariff()]).Status);
        Assert.Equal(ChargePreviewStatus.TariffChanges, Calculate(readings, [tariff with { From = From.AddDays(1) }]).Status);
        Assert.Equal(ChargePreviewStatus.MissingBoundary, ElectricityChargePreview.Calculate(From, Until, Installation,
            From, Until, ManualElectricity.Total, 1m, readings, [tariff]).Status);
    }

    [Fact]
    public void Prices_each_register_and_rounds_the_combined_amount_once()
    {
        var readings = new[] { Reading(From, 10m, "day"), Reading(Until, 10.003m, "day"),
            Reading(From, 20m, "night"), Reading(Until, 20.002m, "night") };
        var tariff = Tariff() with { Rates = new Dictionary<string, decimal> { ["day"] = 1m, ["night"] = 1m } };
        var preview = ElectricityChargePreview.Calculate(From, Until, Installation, From, null, ManualElectricity.Dual,
            1m, readings, [tariff]);
        Assert.Equal(0.01m, preview.AmountUah);
        Assert.Equal(new[] { 0.003m, 0.002m }, preview.Registers!.Select(register => register.Amount));
    }

    private static ChargePreview Calculate(ElectricityReading[] readings, PreviewTariff[] tariffs, decimal multiplier = 1m) =>
        ElectricityChargePreview.Calculate(From, Until, Installation, From, null, ManualElectricity.Total, multiplier, readings, tariffs);

    private static PreviewTariff Tariff() => new(Guid.NewGuid(), From, Until, "synthetic",
        new Dictionary<string, decimal> { [ManualElectricity.Total] = 4m });

    private static ElectricityReading Reading(DateOnly date, decimal value, string channel = ManualElectricity.Total) =>
        new(Guid.NewGuid(), date, value, ManualElectricity.Source, ManualElectricity.Rule, DateTime.UtcNow, Guid.Empty, Guid.Empty, channel);
}
