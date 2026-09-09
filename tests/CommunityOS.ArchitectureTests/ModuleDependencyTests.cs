using ArchUnitNET.Domain;
using ArchUnitNET.Fluent;
using ArchUnitNET.Loader;
using ArchUnitNET.xUnitV3;
using CommunityOS.Modules.Community.Composition;
using CommunityOS.Web;
using CommunityOS.Worker;
using Xunit;
using static ArchUnitNET.Fluent.ArchRuleDefinition;

namespace CommunityOS.ArchitectureTests;

public sealed class ModuleDependencyTests
{
    private static readonly Architecture Architecture = new ArchLoader()
        .LoadAssemblies(
            typeof(CommunityModule).Assembly,
            typeof(WebHostMarker).Assembly,
            typeof(WorkerHostMarker).Assembly)
        .Build();

    [Fact]
    public void Domain_must_not_depend_on_application_infrastructure_or_hosts()
    {
        var domain = Types().That().ResideInNamespace("CommunityOS.Modules.Community.Domain");
        var forbidden = Types().That()
            .ResideInNamespace("CommunityOS.Modules.Community.Application")
            .Or().ResideInNamespace("CommunityOS.Modules.Community.Infrastructure")
            .Or().ResideInAssembly(typeof(WebHostMarker).Assembly)
            .Or().ResideInAssembly(typeof(WorkerHostMarker).Assembly);

        Types().That().Are(domain).Should().NotDependOnAny(forbidden)
            .WithoutRequiringPositiveResults()
            .Check(Architecture);
    }

    [Fact]
    public void Application_must_not_depend_on_infrastructure_or_hosts()
    {
        var application = Types().That().ResideInNamespace("CommunityOS.Modules.Community.Application");
        var forbidden = Types().That()
            .ResideInNamespace("CommunityOS.Modules.Community.Infrastructure")
            .Or().ResideInAssembly(typeof(WebHostMarker).Assembly)
            .Or().ResideInAssembly(typeof(WorkerHostMarker).Assembly);

        Types().That().Are(application).Should().NotDependOnAny(forbidden)
            .WithoutRequiringPositiveResults()
            .Check(Architecture);
    }

    [Fact]
    public void Runtime_hosts_must_not_depend_on_each_other()
    {
        var web = Types().That().ResideInAssembly(typeof(WebHostMarker).Assembly);
        var worker = Types().That().ResideInAssembly(typeof(WorkerHostMarker).Assembly);

        Types().That().Are(web).Should().NotDependOnAny(worker).Check(Architecture);
        Types().That().Are(worker).Should().NotDependOnAny(web).Check(Architecture);
    }

    [Fact]
    public void Functional_module_must_not_reference_another_module_implementation()
    {
        var forbiddenReferences = typeof(CommunityModule).Assembly
            .GetReferencedAssemblies()
            .Where(reference =>
                reference.Name?.StartsWith("CommunityOS.Modules.", StringComparison.Ordinal) is true
                && reference.Name != typeof(CommunityModule).Assembly.GetName().Name)
            .Select(reference => reference.Name)
            .ToArray();

        Assert.Empty(forbiddenReferences);
    }
}
