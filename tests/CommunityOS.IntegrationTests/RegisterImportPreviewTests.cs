using CommunityOS.Modules.Community.Application.Register;
using Xunit;

namespace CommunityOS.IntegrationTests;

public class RegisterImportPreviewTests
{
    [Fact]
    public void Preview_Reuses_Only_Explicit_Batch_Identity()
    {
        var preview = RegisterImportPreview.Create(
            [new(2, "1", "S-1", "Same name", "A-1"),
             new(3, "2", "S-1", "Same name", "A-2"),
             new(4, "3", "S-2", "Same name", "A-3")], []);

        Assert.True(preview.CanProceed);
        Assert.Equal(["create", "reuse-batch-owner", "create"],
            preview.Candidates.Select(row => row.OwnerAction));
    }

    [Fact]
    public void Preview_Blocks_Ambiguous_Identity_And_Number_Conflicts()
    {
        var preview = RegisterImportPreview.Create(
            [new(2, "1", "S-1", "First name", "A-2"),
             new(3, "2", "S-1", "Second name", "A-2")],
            [new(Guid.Empty, Guid.Empty, Guid.Empty, "Existing", "1", "A-1")]);

        Assert.False(preview.CanProceed);
        Assert.Equal("conflict", preview.Candidates[0].PlotAction);
        Assert.All(preview.Candidates, row =>
        {
            Assert.Equal("requires-decision", row.OwnerAction);
            Assert.Equal("conflict", row.AccountAction);
            Assert.Equal("blocked", row.OwnershipAction);
            Assert.Equal("blocked", row.AccountLinkAction);
        });
        Assert.False(RegisterImportPreview.Create([], []).CanProceed);
    }

    [Fact]
    public void Preview_Leaves_Legacy_Owner_Presentations_Unresolved()
    {
        var preview = RegisterImportPreview.Create(
            [new(2, "1", "", "Same name", "0001", true),
             new(3, "2A", "", "Same name", "0002", true),
             new(4, "3", "", "Current (former owner)", "0003", true)], []);

        Assert.False(preview.CanProceed);
        Assert.All(preview.Candidates, candidate =>
        {
            Assert.Equal("requires-decision", candidate.OwnerAction);
            Assert.Equal("blocked", candidate.OwnershipAction);
        });
        Assert.Contains("owner-name-repeated-in-workbook", preview.Candidates[0].Issues);
        Assert.DoesNotContain("owner-name-repeated-in-workbook", preview.Candidates[2].Issues);
        Assert.Equal("0001", preview.Candidates[0].AccountNumber);
    }

}
