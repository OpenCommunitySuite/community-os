namespace CommunityOS.Modules.Community.Application.Register;

public sealed record RegisterImportReceipt(string PlanId, string ConfirmedBy, DateTime RecordedAtUtc,
    IReadOnlyList<RegisterImportReceiptItem> Items);

public sealed record RegisterImportReceiptItem(int SourceRow, Guid PlotId, string PlotNumber,
    Guid ImportedSubjectId, Guid AccountId, string AccountNumber);
