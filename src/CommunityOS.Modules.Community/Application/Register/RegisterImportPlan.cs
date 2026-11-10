using System.Security.Cryptography;
using System.Text.Json;

namespace CommunityOS.Modules.Community.Application.Register;

public sealed class RegisterImportPlan
{
    private readonly RegisterImportRow[] rows;

    private RegisterImportPlan(Guid communityId, RegisterImportRow[] rows, string id)
    {
        CommunityId = communityId;
        this.rows = rows;
        Id = id;
    }

    public Guid CommunityId { get; }
    public string Id { get; }

    public static RegisterImportPlan Create(Guid communityId, IReadOnlyList<RegisterImportRow> rows,
        IReadOnlyList<RegisterImportRow>? source = null)
    {
        ArgumentOutOfRangeException.ThrowIfEqual(communityId, Guid.Empty);
        var snapshot = rows.ToArray();
        var payload = JsonSerializer.SerializeToUtf8Bytes(new { Version = 1, Community = communityId, Rows = snapshot, Source = source });
        return new(communityId, snapshot, Convert.ToHexString(SHA256.HashData(payload)));
    }

    public RegisterImportPreview Preview(IReadOnlyList<RegisterEntry> current) =>
        RegisterImportPreview.Create(rows, current);

    public IEnumerable<(int SourceRow, RegisterEntry Entry)> CreateEntries()
    {
        var owners = new Dictionary<string, Guid>(StringComparer.Ordinal);
        foreach (var row in rows)
        {
            var isNew = !owners.TryGetValue(row.OwnerKey, out var owner);
            if (isNew)
            {
                owner = Guid.CreateVersion7();
                owners.Add(row.OwnerKey, owner);
            }

            yield return (row.Row, new RegisterEntry(CommunityId, owner, Guid.CreateVersion7(),
                isNew ? row.OwnerName : string.Empty, row.PlotNumber, row.AccountNumber));
        }
    }
}

public enum RegisterImportResult { Applied, AlreadyApplied, Conflicts }
