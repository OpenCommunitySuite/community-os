using Microsoft.Extensions.DependencyInjection;

namespace CommunityOS.Modules.Community.Composition;

public static class CommunityModule
{
    public static IServiceCollection AddCommunityModule(this IServiceCollection services)
    {
        ArgumentNullException.ThrowIfNull(services);
        return services;
    }
}
