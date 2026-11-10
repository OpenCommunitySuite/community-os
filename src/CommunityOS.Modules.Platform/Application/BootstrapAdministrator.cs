namespace CommunityOS.Modules.Platform.Application;

public sealed record BootstrapAdministratorAssignment(Guid OperationId, Guid CommunityId, Guid AdministratorAccountId,
    DateTime GrantedAtUtc, DateTime? RevokedAtUtc);

public interface IBootstrapAdministratorStore
{
    Task<BootstrapAdministratorAssignment?> AssignAsync(Guid operationId, CancellationToken cancellationToken);

    Task<bool> RevokeAsync(Guid communityId, Guid operationId, Guid revokerAccountId,
        CancellationToken cancellationToken);
}

// Internal provisioning step. A trusted workflow calls it after authorization and account verification.
public sealed class BootstrapAdministrator(IBootstrapAdministratorStore store)
{
    public Task<BootstrapAdministratorAssignment?> AssignAsync(Guid operationId, CancellationToken cancellationToken)
    {
        ArgumentOutOfRangeException.ThrowIfEqual(operationId, Guid.Empty);
        return store.AssignAsync(operationId, cancellationToken);
    }

    public Task<bool> RevokeAsync(Guid communityId, Guid operationId, Guid authorizedRevokerAccountId,
        CancellationToken cancellationToken)
    {
        ArgumentOutOfRangeException.ThrowIfEqual(communityId, Guid.Empty);
        ArgumentOutOfRangeException.ThrowIfEqual(operationId, Guid.Empty);
        ArgumentOutOfRangeException.ThrowIfEqual(authorizedRevokerAccountId, Guid.Empty);
        return store.RevokeAsync(communityId, operationId, authorizedRevokerAccountId, cancellationToken);
    }
}
