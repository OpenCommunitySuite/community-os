using CommunityOS.Modules.Community.Application.Electricity;

namespace CommunityOS.Modules.Community.Application.Finance;

public sealed record PreviewTariff(Guid Id, DateOnly From, DateOnly? Until, string Basis,
    IReadOnlyDictionary<string, decimal> Rates);

public sealed record PreviewRegister(string Channel, Guid StartReading, Guid EndReading,
    decimal StartValue, decimal EndValue, decimal Consumption, decimal Rate, decimal Amount);

public sealed record ChargePreview(ChargePreviewStatus Status, PreviewTariff? Tariff = null,
    Guid? InstallationId = null, decimal? Multiplier = null, IReadOnlyList<PreviewRegister>? Registers = null,
    decimal? AmountUah = null);

public enum ChargePreviewStatus { Ready, InvalidPeriod, MissingBoundary, MissingTariff, AmbiguousTariff, TariffChanges, InvalidRate }

public static class ElectricityChargePreview
{
    public static ChargePreview Calculate(DateOnly from, DateOnly until, Guid installationId, DateOnly installedOn,
        DateOnly? removedOn, string mode, decimal multiplier, IReadOnlyList<ElectricityReading> readings,
        IReadOnlyList<PreviewTariff> tariffs)
    {
        if (from >= until) return new(ChargePreviewStatus.InvalidPeriod);
        if (installedOn > from || removedOn <= until || !ManualElectricity.SupportsMultiplier(multiplier))
            return new(ChargePreviewStatus.MissingBoundary);

        var candidates = tariffs.Where(tariff => tariff.From < until &&
            (tariff.Until is null || tariff.Until > from)).ToArray();
        if (candidates.Length == 0) return new(ChargePreviewStatus.MissingTariff);
        if (candidates.Any(tariff => tariff.From > from || tariff.Until < until))
            return new(ChargePreviewStatus.TariffChanges);
        if (candidates.Length != 1) return new(ChargePreviewStatus.AmbiguousTariff);
        var tariff = candidates[0];

        string[] channels = mode switch
        {
            ManualElectricity.Total => [ManualElectricity.Total],
            ManualElectricity.Dual => [ManualElectricity.Day, ManualElectricity.Night],
            _ => []
        };
        if (channels.Length == 0) return new(ChargePreviewStatus.MissingBoundary);
        var details = new List<PreviewRegister>(channels.Length);
        foreach (var channel in channels)
        {
            var bounds = readings.Where(reading => reading.Channel == channel &&
                (reading.Date == from || reading.Date == until)).OrderBy(reading => reading.Date).ToArray();
            if (bounds is not [var start, var end] || start.Date != from || end.Date != until || start.Value > end.Value)
                return new(ChargePreviewStatus.MissingBoundary);
            if (!tariff.Rates.TryGetValue(channel, out var rate) || rate < 0 || rate > 1_000_000m)
                return new(ChargePreviewStatus.InvalidRate);
            var volume = (end.Value - start.Value) * multiplier;
            details.Add(new(channel, start.Id, end.Id, start.Value, end.Value, volume, rate, volume * rate));
        }

        var amount = decimal.Round(details.Sum(register => register.Amount), 2, MidpointRounding.AwayFromZero);
        return new(ChargePreviewStatus.Ready, tariff, installationId, multiplier, details, amount);
    }
}
