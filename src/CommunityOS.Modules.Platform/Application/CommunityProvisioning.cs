namespace CommunityOS.Modules.Platform.Application;

public sealed record CommunityReservation(Guid OperationId, Guid CommunityId, Guid CreatorAccountId,
    Guid InitialAdministratorAccountId, string DisplayName);

public interface ICommunityReservationStore
{
    Task<CommunityReservation?> ReserveAsync(CommunityReservation reservation, Guid requestId,
        CancellationToken cancellationToken);
}

// This use case is called only after Platform authorization; it never grants access.
public sealed class CommunityProvisioning(ICommunityReservationStore store)
{
    public async Task<CommunityReservation?> ReserveAsync(Guid authorizedCreatorAccountId, Guid requestId,
        Guid initialAdministratorAccountId, string displayName, CancellationToken cancellationToken)
    {
        ArgumentOutOfRangeException.ThrowIfEqual(authorizedCreatorAccountId, Guid.Empty);
        ArgumentOutOfRangeException.ThrowIfEqual(requestId, Guid.Empty);
        ArgumentOutOfRangeException.ThrowIfEqual(initialAdministratorAccountId, Guid.Empty);
        ArgumentException.ThrowIfNullOrWhiteSpace(displayName);
        var reservation = new CommunityReservation(Guid.CreateVersion7(), Guid.CreateVersion7(),
            authorizedCreatorAccountId, initialAdministratorAccountId, displayName.Trim());
        return await store.ReserveAsync(reservation, requestId, cancellationToken);
    }
}
