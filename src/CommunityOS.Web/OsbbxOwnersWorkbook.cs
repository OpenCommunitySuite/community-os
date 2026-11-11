using System.Globalization;
using System.IO.Compression;
using System.Xml;
using System.Xml.Linq;
using CommunityOS.Modules.Community.Application.Register;

internal static class OsbbxOwnersWorkbook
{
    private static readonly XNamespace Sheet = "http://schemas.openxmlformats.org/spreadsheetml/2006/main";
    private static readonly XNamespace Rel = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
    private static readonly XNamespace PackageRel = "http://schemas.openxmlformats.org/package/2006/relationships";

    public static IReadOnlyList<RegisterImportRow> Read(string path)
    {
        using var stream = File.OpenRead(path);
        return Read(stream);
    }

    public static IReadOnlyList<RegisterImportRow> Read(Stream stream, int? rowLimit = null)
    {
        using var archive = new ZipArchive(stream, ZipArchiveMode.Read, leaveOpen: true);
        var workbook = ReadPart(archive, "xl/workbook.xml");
        var relationships = ReadPart(archive, "xl/_rels/workbook.xml.rels");
        var sheet = workbook.Root?.Element(Sheet + "sheets")?.Elements(Sheet + "sheet")
            .FirstOrDefault(element => (string?)element.Attribute("name") == "Власники");
        var sheetId = (string?)sheet?.Attribute(Rel + "id");
        var sheetRelation = relationships.Root?.Elements(PackageRel + "Relationship")
            .FirstOrDefault(element => sheetId is not null && (string?)element.Attribute("Id") == sheetId);
        var stringsRelation = relationships.Root?.Elements(PackageRel + "Relationship")
            .FirstOrDefault(element => (string?)element.Attribute("Type") == Rel.NamespaceName + "/sharedStrings");
        var strings = stringsRelation is null ? [] : (ReadPart(archive, ResolvePart(stringsRelation))
            .Root ?? throw new FormatException("Invalid shared strings.")).Elements(Sheet + "si").Select(ReadText).ToArray();
        var rows = ReadPart(archive, ResolvePart(sheetRelation)).Root?.Element(Sheet + "sheetData")
            ?.Elements(Sheet + "row") ?? [];
        using var iterator = rows.GetEnumerator();
        if (!iterator.MoveNext())
        {
            throw new FormatException("The OSBBX owners sheet is empty.");
        }

        var header = ReadCells(iterator.Current);
        var plotColumn = FindColumn(header, "Номер ділянки", strings);
        var ownerColumn = FindColumn(header, "ПІБ", strings);
        var accountColumn = FindColumn(header, "Особовий рахунок", strings);
        var candidates = new List<RegisterImportRow>();
        var previousRow = 1;
        while (iterator.MoveNext())
        {
            var row = iterator.Current;
            var cells = ReadCells(row);
            if (!cells.Values.Any(cell => ReadValue(cell, strings).Length > 0))
            {
                continue;
            }

            if (!int.TryParse((string?)row.Attribute("r"), NumberStyles.None, CultureInfo.InvariantCulture,
                    out var number) || number < 2 || (rowLimit.HasValue && number <= previousRow))
            {
                throw new FormatException("Invalid row number in the OSBBX owners sheet.");
            }
            previousRow = number;

            var plotCell = cells.GetValueOrDefault(plotColumn);
            var ownerCell = cells.GetValueOrDefault(ownerColumn);
            var accountCell = cells.GetValueOrDefault(accountColumn);
            var plot = ReadValue(plotCell, strings).Trim();
            var owner = ReadValue(ownerCell, strings).Trim();
            var account = ReadValue(accountCell, strings).Trim();
            if (account.Length > 0 && (string?)accountCell?.Attribute("t") is not ("s" or "inlineStr" or "str"))
            {
                throw new FormatException($"Account number at Excel row {number} must be stored as text.");
            }

            if (rowLimit is int limit &&
                (candidates.Count >= limit || plot.Length > 128 || owner.Length > 512 || account.Length > 128 ||
                 plotCell?.Element(Sheet + "f") is not null || ownerCell?.Element(Sheet + "f") is not null ||
                 accountCell?.Element(Sheet + "f") is not null))
            {
                throw new FormatException("The OSBBX owners sheet exceeds the supported limits or contains formulas.");
            }

            candidates.Add(new(number, plot, string.Empty, owner, account, RequiresOwnerReview: true));
        }

        return candidates;
    }

    private static string ResolvePart(XElement? relation)
    {
        var target = (string?)relation?.Attribute("Target");
        if (string.IsNullOrWhiteSpace(target) || (string?)relation?.Attribute("TargetMode") == "External" ||
            !Uri.TryCreate(new Uri("https://workbook.invalid/xl/workbook.xml"), target, out var uri) ||
            uri.Host != "workbook.invalid" || !uri.AbsolutePath.StartsWith("/xl/", StringComparison.Ordinal))
        {
            throw new FormatException("The workbook has no readable OSBBX owners sheet or shared strings.");
        }

        return Uri.UnescapeDataString(uri.AbsolutePath[1..]);
    }

    private static XDocument ReadPart(ZipArchive archive, string name)
    {
        var entry = archive.GetEntry(name) ?? throw new FormatException("A required XLSX part is missing.");
        if (entry.Length > 8_000_000)
        {
            throw new FormatException("An XLSX part exceeds the supported size.");
        }
        using var stream = entry.Open();
        using var reader = XmlReader.Create(stream, new XmlReaderSettings
        {
            DtdProcessing = DtdProcessing.Prohibit,
            MaxCharactersInDocument = 8_000_000,
            XmlResolver = null,
        });
        return XDocument.Load(reader);
    }

    private static Dictionary<string, XElement> ReadCells(XElement row)
    {
        var cells = new Dictionary<string, XElement>(StringComparer.Ordinal);
        foreach (var cell in row.Elements(Sheet + "c"))
        {
            var reference = (string?)cell.Attribute("r") ?? string.Empty;
            var column = new string(reference.TakeWhile(character => character is >= 'A' and <= 'Z').ToArray());
            if (column.Length == 0 || !cells.TryAdd(column, cell))
            {
                throw new FormatException("Invalid cell reference in the OSBBX owners sheet.");
            }
        }

        return cells;
    }

    private static string FindColumn(Dictionary<string, XElement> header, string title, string[] strings)
    {
        var columns = header.Where(pair => string.Join(' ', ReadValue(pair.Value, strings)
            .Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries)) == title).ToArray();
        return columns.Length == 1 ? columns[0].Key : throw new FormatException($"Expected one column: {title}.");
    }

    private static string ReadValue(XElement? cell, string[] strings)
    {
        if (cell is null)
        {
            return string.Empty;
        }

        var value = (string?)cell.Element(Sheet + "v") ?? string.Empty;
        return (string?)cell.Attribute("t") switch
        {
            "inlineStr" => ReadText(cell.Element(Sheet + "is")),
            "s" when int.TryParse(value, NumberStyles.None, CultureInfo.InvariantCulture, out var index)
                && (uint)index < (uint)strings.Length => strings[index],
            "s" => throw new FormatException("Invalid shared string index in the OSBBX workbook."),
            _ => value,
        };
    }

    private static string ReadText(XElement? element) =>
        string.Concat(element?.Elements().Where(child => child.Name == Sheet + "t" || child.Name == Sheet + "r")
            .Select(child => child.Name == Sheet + "t" ? child.Value : (string?)child.Element(Sheet + "t")) ?? []);
}
