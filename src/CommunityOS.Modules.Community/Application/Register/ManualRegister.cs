namespace CommunityOS.Modules.Community.Application.Register;

public sealed record RegisterEntry(
    Guid CommunityId, Guid OwnerId, Guid PlotId, string OwnerName, string PlotNumber, string AccountNumber, Guid OwnershipRevision = default)
{
    public RegisterAddition? Addition { get; init; }
}

public sealed record RegisterAddition(Guid AdmissionId, Guid AccountId, Guid SubjectId, string Basis);

public interface IRegisterStore
{
    Task<bool> CorrectOwnerAsync(Guid communityId, Guid plotId, Guid revision, Guid ownerId, string reason,
        CancellationToken cancellationToken);
    Task CreateAsync(RegisterEntry entry, CancellationToken cancellationToken);
    Task<IReadOnlyList<RegisterEntry>> ListAsync(Guid communityId, CancellationToken cancellationToken);
}

public sealed class ManualRegister(IRegisterStore store)
{
    public async Task<Guid> CreateAsync(
        Guid communityId, Guid? ownerId, string? ownerName, string plotNumber, string accountNumber,
        CancellationToken cancellationToken, RegisterAddition? addition = null)
    {
        ArgumentOutOfRangeException.ThrowIfEqual(communityId, Guid.Empty);
        if (ownerId == Guid.Empty)
        {
            throw new ArgumentOutOfRangeException(nameof(ownerId));
        }
        if (ownerId is null)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(ownerName);
        }
        else if (ownerName is not null)
        {
            throw new ArgumentException("Specify either a new owner name or an existing owner ID.");
        }
        ArgumentException.ThrowIfNullOrWhiteSpace(plotNumber);
        ArgumentException.ThrowIfNullOrWhiteSpace(accountNumber);

        var entry = new RegisterEntry(communityId, ownerId ?? Guid.CreateVersion7(), Guid.CreateVersion7(),
            ownerName?.Trim() ?? string.Empty, plotNumber.Trim(), accountNumber.Trim()) { Addition = addition };
        await store.CreateAsync(entry, cancellationToken);
        return entry.OwnerId;
    }

    public Task<bool> CorrectOwnerAsync(Guid communityId, Guid plotId, Guid revision, Guid ownerId, string reason,
        CancellationToken cancellationToken)
    {
        ArgumentOutOfRangeException.ThrowIfEqual(communityId, Guid.Empty);
        ArgumentOutOfRangeException.ThrowIfEqual(plotId, Guid.Empty);
        ArgumentOutOfRangeException.ThrowIfEqual(revision, Guid.Empty);
        ArgumentOutOfRangeException.ThrowIfEqual(ownerId, Guid.Empty);
        ArgumentException.ThrowIfNullOrWhiteSpace(reason);
        return store.CorrectOwnerAsync(communityId, plotId, revision, ownerId, reason.Trim(), cancellationToken);
    }

    public Task<IReadOnlyList<RegisterEntry>> ListAsync(Guid communityId, CancellationToken cancellationToken)
    {
        ArgumentOutOfRangeException.ThrowIfEqual(communityId, Guid.Empty);
        return store.ListAsync(communityId, cancellationToken);
    }
}
