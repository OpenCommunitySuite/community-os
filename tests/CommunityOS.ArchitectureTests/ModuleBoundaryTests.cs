using ArchUnitNET.Domain;
using ArchUnitNET.Fluent.Slices;
using ArchUnitNET.Loader;
using ArchUnitNET.xUnitV3;
using Xunit;
using static ArchUnitNET.Fluent.ArchRuleDefinition;
using ReflectionAssembly = System.Reflection.Assembly;

namespace CommunityOS.ArchitectureTests;

public class ModuleBoundaryTests
{
    private static readonly Architecture Architecture = new ArchLoader()
        .LoadAssemblies(
            ReflectionAssembly.Load("CommunityOS.Web"),
            ReflectionAssembly.Load("CommunityOS.Worker"),
            typeof(Modules.Community.Infrastructure.CommunityModule).Assembly)
        .Build();

    private const string DomainNamespace = @"^CommunityOS\.Modules\.[^.]+\.Domain(\..+)?$";
    private const string ApplicationNamespace = @"^CommunityOS\.Modules\.[^.]+\.Application(\..+)?$";
    private const string InfrastructureNamespace = @"^CommunityOS\.Modules\.[^.]+\.Infrastructure(\..+)?$";
    private const string HostNamespace = @"^CommunityOS\.(Web|Worker)(\..+)?$";

    [Fact]
    public void Domain_Does_Not_Depend_On_Application_Infrastructure_Or_Hosts()
    {
        var rule = Types()
            .That().ResideInNamespaceMatching(DomainNamespace)
            .Should().NotDependOnAny(Types().That()
                .ResideInNamespaceMatching(ApplicationNamespace)
                .Or().ResideInNamespaceMatching(InfrastructureNamespace)
                .Or().ResideInNamespaceMatching(HostNamespace))
            .Because("Domain must stay independent of Application, Infrastructure and Hosts")
            .WithoutRequiringPositiveResults();

        rule.Check(Architecture);
    }

    [Fact]
    public void Application_Does_Not_Depend_On_Infrastructure_Or_Hosts()
    {
        var rule = Types()
            .That().ResideInNamespaceMatching(ApplicationNamespace)
            .Should().NotDependOnAny(Types().That()
                .ResideInNamespaceMatching(InfrastructureNamespace)
                .Or().ResideInNamespaceMatching(HostNamespace))
            .Because("Application must stay independent of Infrastructure and Hosts")
            .WithoutRequiringPositiveResults();

        rule.Check(Architecture);
    }

    [Fact]
    public void Functional_Modules_Do_Not_Depend_On_Each_Other()
    {
        var rule = SliceRuleDefinition.Slices()
            .Matching("CommunityOS.Modules.(*).**")
            .Should().NotDependOnEachOther();

        rule.Check(Architecture);
    }
}
