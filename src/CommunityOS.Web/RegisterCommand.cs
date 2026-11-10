using CommunityOS.Modules.Community.Application.Register;
using CommunityOS.Modules.Community.Infrastructure;
using Npgsql;

internal static class RegisterCommand
{
    public static async Task<int> RunAsync(string[] args)
    {
        var connectionString = Environment.GetEnvironmentVariable("COMMUNITYOS_REGISTER_DATABASE");
        if (string.IsNullOrWhiteSpace(connectionString) ||
            !Guid.TryParse(Environment.GetEnvironmentVariable("COMMUNITYOS_REGISTER_COMMUNITY"), out var communityId))
        {
            Console.Error.WriteLine("Set COMMUNITYOS_REGISTER_DATABASE and COMMUNITYOS_REGISTER_COMMUNITY.");
            return 2;
        }

        try
        {
            await using var dataSource = NpgsqlDataSource.Create(connectionString);
            var register = new ManualRegister(new PostgresRegisterStore(dataSource));
            switch (args)
            {
                case ["add-new", var name, var plot, var account]:
                    Console.WriteLine(await register.CreateAsync(communityId, null, name, plot, account, default));
                    return 0;
                case ["add-existing", var id, var plot, var account] when Guid.TryParse(id, out var ownerId):
                    Console.WriteLine(await register.CreateAsync(communityId, ownerId, null, plot, account, default));
                    return 0;
                case ["correct-owner", var plotId, var revision, var newOwner, var reason]
                    when Guid.TryParse(plotId, out var parsedPlot) && Guid.TryParse(revision, out var parsedRevision)
                        && Guid.TryParse(newOwner, out var parsedOwner):
                    if (await register.CorrectOwnerAsync(communityId, parsedPlot, parsedRevision, parsedOwner, reason, default))
                    {
                        return 0;
                    }

                    Console.Error.WriteLine("Ownership was not corrected. Refresh the register and check the plot and owner.");
                    return 1;
                case ["list"]:
                    var entries = await register.ListAsync(communityId, default);
                    Console.WriteLine(System.Text.Json.JsonSerializer.Serialize(entries));
                    return 0;
                default:
                    Console.Error.WriteLine("register add-new <name> <plot> <account> | add-existing <owner-id> <plot> <account> | correct-owner <plot-id> <revision> <owner-id> <reason> | list");
                    return 2;
            }
        }
        catch (PostgresException exception) when (exception.SqlState is "23505" or "23503")
        {
            Console.Error.WriteLine(exception.SqlState == "23505"
                ? "A plot or account with this number already exists."
                : "The owner does not exist in this community.");
            return 1;
        }
        catch (ArgumentException exception)
        {
            Console.Error.WriteLine(exception.Message);
            return 2;
        }
        catch (NpgsqlException)
        {
            Console.Error.WriteLine("The register database operation failed.");
            return 1;
        }
    }
}
