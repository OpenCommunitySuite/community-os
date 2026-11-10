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
            var store = new PostgresRegisterStore(dataSource);
            var register = new ManualRegister(store);
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
                case ["preview-import", var file, .. var resolution] when resolution.Length <= 1:
                    var plan = ReadImportPlan(communityId, file, resolution.SingleOrDefault());
                    var current = await register.ListAsync(communityId, default);
                    var preview = plan.Preview(current);
                    Console.WriteLine(System.Text.Json.JsonSerializer.Serialize(new
                    {
                        PlanId = preview.CanProceed ? plan.Id : null,
                        preview.CanProceed,
                        preview.Candidates,
                    }));
                    return preview.CanProceed ? 0 : 1;
                case ["apply-import", var importFile, var planId, .. var decisions] when decisions.Length <= 1:
                    var reviewed = ReadImportPlan(communityId, importFile, decisions.SingleOrDefault());
                    if (!string.Equals(reviewed.Id, planId, StringComparison.OrdinalIgnoreCase))
                    {
                        Console.Error.WriteLine("The input differs from the reviewed plan. Run preview-import again.");
                        return 1;
                    }

                    var confirmedBy = Environment.GetEnvironmentVariable("COMMUNITYOS_REGISTER_OPERATOR");
                    if (string.IsNullOrWhiteSpace(confirmedBy))
                    {
                        Console.Error.WriteLine("Set COMMUNITYOS_REGISTER_OPERATOR to the confirming operator's identifier.");
                        return 2;
                    }

                    var result = await store.ApplyImportAsync(reviewed, confirmedBy, default);
                    Console.WriteLine(result);
                    return result == RegisterImportResult.Conflicts ? 1 : 0;
                case ["import-receipt", var receiptId] when receiptId.Length == 64 && receiptId.All(Uri.IsHexDigit):
                    var receipt = await store.FindImportReceiptAsync(communityId, receiptId.ToUpperInvariant(), default);
                    if (receipt is null)
                    {
                        Console.Error.WriteLine("No applied import with that plan ID in this community.");
                        return 1;
                    }

                    Console.WriteLine(System.Text.Json.JsonSerializer.Serialize(receipt));
                    return 0;
                case ["list"]:
                    var entries = await register.ListAsync(communityId, default);
                    Console.WriteLine(System.Text.Json.JsonSerializer.Serialize(entries));
                    return 0;
                default:
                    Console.Error.WriteLine("register add-new <name> <plot> <account> | add-existing <owner-id> <plot> <account> | correct-owner <plot-id> <revision> <owner-id> <reason> | preview-import <file> [decisions.csv] | apply-import <file> <plan-id> [decisions.csv] | import-receipt <plan-id> | list");
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
        catch (Microsoft.VisualBasic.FileIO.MalformedLineException exception)
        {
            Console.Error.WriteLine($"Malformed CSV at line {exception.LineNumber}.");
            return 2;
        }
        catch (Exception exception) when (exception is InvalidDataException or System.Xml.XmlException)
        {
            Console.Error.WriteLine(exception is System.Xml.XmlException xml
                ? $"Invalid XLSX XML at line {xml.LineNumber}, position {xml.LinePosition}."
                : "The XLSX workbook is invalid.");
            return 2;
        }
        catch (FormatException exception)
        {
            Console.Error.WriteLine(exception.Message);
            return 2;
        }
        catch (Exception exception) when (exception is IOException or UnauthorizedAccessException or System.Text.DecoderFallbackException)
        {
            Console.Error.WriteLine("The import file could not be read.");
            return 2;
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

    private static RegisterImportPlan ReadImportPlan(Guid communityId, string file, string? decisions)
    {
        if (!Path.GetExtension(file).Equals(".xlsx", StringComparison.OrdinalIgnoreCase))
        {
            if (decisions is not null)
            {
                throw new FormatException("A separate decisions CSV is only supported for OSBBX workbooks.");
            }

            return RegisterImportPlan.Create(communityId, RegisterCsv.Read(file));
        }

        var source = OsbbxOwnersWorkbook.Read(file);
        if (decisions is null)
        {
            return RegisterImportPlan.Create(communityId, source);
        }

        var resolved = RegisterCsv.Read(decisions);
        var byPlot = resolved.ToLookup(row => row.PlotNumber, StringComparer.Ordinal);
        if (source.Count != resolved.Count ||
            source.Select(row => row.PlotNumber).Distinct(StringComparer.Ordinal).Count() != source.Count)
        {
            throw new FormatException("The decisions CSV must contain exactly one row for each workbook plot.");
        }

        var rows = new List<RegisterImportRow>(source.Count);
        foreach (var original in source)
        {
            if (original.PlotNumber.Length == 0 || original.AccountNumber.Length == 0 ||
                byPlot[original.PlotNumber].ToArray() is not [var decision] ||
                decision.AccountNumber != original.AccountNumber)
            {
                throw new FormatException($"The decisions do not match the plot and account in workbook row {original.Row}.");
            }

            rows.Add(decision with { Row = original.Row });
        }

        return RegisterImportPlan.Create(communityId, rows, source);
    }
}
