namespace CommunityOS.Modules.Community.Application.Register;

public sealed record RegisterOwnerDecision(int Row, string? OwnerKey, string? OwnerName);

public static class RegisterImportDraft
{
    public static IReadOnlyList<RegisterImportRow> Resolve(IReadOnlyList<RegisterImportRow> source,
        IReadOnlyList<RegisterOwnerDecision> decisions)
    {
        var byRow = new Dictionary<int, RegisterOwnerDecision>();
        var sourceRows = source.Select(row => row.Row).ToHashSet();
        foreach (var decision in decisions)
        {
            if (decision is null || !sourceRows.Contains(decision.Row) || !byRow.TryAdd(decision.Row, decision) ||
                decision.OwnerKey?.Trim() is not { Length: > 0 and <= 128 } key || key.Contains('\0') ||
                decision.OwnerName?.Trim() is not { Length: > 0 and <= 512 } name || name.Contains('\0'))
            {
                throw new ArgumentException("Invalid owner decision.", nameof(decisions));
            }
        }

        return source.Select(row => byRow.TryGetValue(row.Row, out var decision)
            ? row with
            {
                OwnerKey = decision.OwnerKey!.Trim(),
                OwnerName = decision.OwnerName!.Trim(),
                RequiresOwnerReview = false,
            }
            : row).ToArray();
    }
}
