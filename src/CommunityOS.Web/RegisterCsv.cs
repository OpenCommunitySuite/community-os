using CommunityOS.Modules.Community.Application.Register;
using Microsoft.VisualBasic.FileIO;

internal static class RegisterCsv
{
    private static readonly string[] Columns = ["plot_number", "owner_key", "owner_name", "account_number"];

    public static IReadOnlyList<RegisterImportRow> Read(string path)
    {
        using var parser = new TextFieldParser(path, new System.Text.UTF8Encoding(false, true));
        parser.SetDelimiters(",");
        if (parser.ReadFields() is not { } header || !header.SequenceEqual(Columns))
        {
            throw new FormatException("Expected CSV columns: " + string.Join(",", Columns));
        }

        var rows = new List<RegisterImportRow>();
        while (!parser.EndOfData)
        {
            var fields = parser.ReadFields();
            var row = rows.Count + 2;
            if (fields is not [var plot, var ownerKey, var ownerName, var account])
            {
                throw new FormatException($"Expected four fields in CSV record {row}.");
            }

            rows.Add(new(row, plot.Trim(), ownerKey.Trim(), ownerName.Trim(), account.Trim()));
        }

        return rows;
    }
}
