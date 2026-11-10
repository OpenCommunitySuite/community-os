namespace CommunityOS.Modules.Community.Application.Register;

public sealed record RegisterImportRow(int Row, string PlotNumber, string OwnerKey, string OwnerName, string AccountNumber);

public sealed record RegisterImportCandidate(int Row, string PlotNumber, string OwnerKey, string OwnerName, string AccountNumber,
    string PlotAction, string OwnerAction, string OwnershipAction, string AccountAction, string AccountLinkAction,
    IReadOnlyList<string> Issues);

public sealed record RegisterImportPreview(bool CanProceed, IReadOnlyList<RegisterImportCandidate> Candidates)
{
    public static RegisterImportPreview Create(
        IReadOnlyList<RegisterImportRow> rows, IReadOnlyList<RegisterEntry> current)
    {
        var occupiedPlots = current.Select(entry => entry.PlotNumber).ToHashSet(StringComparer.Ordinal);
        var occupiedAccounts = current.Select(entry => entry.AccountNumber).ToHashSet(StringComparer.Ordinal);
        var duplicatePlots = Duplicates(rows.Select(row => row.PlotNumber));
        var duplicateAccounts = Duplicates(rows.Select(row => row.AccountNumber));
        var ambiguousOwners = rows.GroupBy(row => row.OwnerKey, StringComparer.Ordinal)
            .Where(group => group.Select(row => row.OwnerName).Distinct(StringComparer.Ordinal).Skip(1).Any())
            .Select(group => group.Key).ToHashSet(StringComparer.Ordinal);
        var firstOwnerRows = rows.GroupBy(row => row.OwnerKey, StringComparer.Ordinal)
            .ToDictionary(group => group.Key, group => group.First().Row, StringComparer.Ordinal);
        var candidates = new List<RegisterImportCandidate>(rows.Count);

        foreach (var row in rows)
        {
            var issues = new List<string>();
            var plotAction = NumberAction(row.PlotNumber, duplicatePlots, occupiedPlots, "plot", issues);
            var accountAction = NumberAction(row.AccountNumber, duplicateAccounts, occupiedAccounts, "account", issues);
            var ownerAction = firstOwnerRows[row.OwnerKey] == row.Row ? "create" : "reuse-batch-owner";
            if (row.OwnerKey.Length == 0 || row.OwnerName.Length == 0)
            {
                issues.Add("owner-key-and-name-required");
                ownerAction = "rejected";
            }
            else if (ambiguousOwners.Contains(row.OwnerKey))
            {
                issues.Add("owner-key-has-conflicting-names");
                ownerAction = "requires-decision";
            }

            var ownershipAction = plotAction == "create" && (ownerAction is "create" or "reuse-batch-owner")
                ? "create" : "blocked";
            var linkAction = plotAction == "create" && accountAction == "create" ? "create" : "blocked";
            candidates.Add(new(row.Row, row.PlotNumber, row.OwnerKey, row.OwnerName, row.AccountNumber,
                plotAction, ownerAction, ownershipAction, accountAction, linkAction, issues));
        }

        return new(candidates.Count > 0 && candidates.All(candidate => candidate.Issues.Count == 0), candidates);
    }

    private static HashSet<string> Duplicates(IEnumerable<string> values) =>
        values.GroupBy(value => value, StringComparer.Ordinal).Where(group => group.Skip(1).Any())
            .Select(group => group.Key).ToHashSet(StringComparer.Ordinal);

    private static string NumberAction(string number, HashSet<string> duplicates, HashSet<string> occupied,
        string field, List<string> issues)
    {
        if (number.Length == 0)
        {
            issues.Add(field + "-number-required");
            return "rejected";
        }

        if (duplicates.Contains(number))
        {
            issues.Add(field + "-number-duplicated-in-file");
        }

        if (occupied.Contains(number))
        {
            issues.Add(field + "-number-already-in-register");
        }

        return duplicates.Contains(number) || occupied.Contains(number) ? "conflict" : "create";
    }
}
