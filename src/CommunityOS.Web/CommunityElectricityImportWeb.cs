using System.Security.Cryptography;
using System.Text;
using CommunityOS.Modules.Community.Application.Electricity;
using CommunityOS.Modules.Community.Infrastructure;
using CommunityOS.Modules.Platform.Infrastructure;

internal static class CommunityElectricityImportWeb
{
    private static readonly UTF8Encoding StrictUtf8 = new(false, true);

    public static void Map(RouteGroupBuilder electricity, RegisterAccessStore access, PostgresElectricityStore store)
    {
        electricity.MapPost("/reading-import/preview", async (Guid community, HttpContext http, CancellationToken token) =>
        {
            var (batch, failure) = await ReadAsync(http.Request, token);
            if (batch is null) return failure!;
            return await access.WithAccessAsync<IResult>(http.Request.Cookies[PlatformWeb.Cookie], community, RegisterPermission.ReadElectricity,
                async _ =>
                {
                    var results = new List<RowResult>(batch.Rows.Count);
                    var today = CommunityElectricityWeb.Today();
                    foreach (var row in batch.Rows)
                    {
                        var result = row.Reading is { } reading
                            ? await store.PreviewImportAsync(community, reading, today, token) : null;
                        results.Add(Report(row, result, preview: true));
                    }
                    return Results.Ok(new { batch.Digest, Rows = results });
                }, Results.StatusCode(403), token);
        });

        electricity.MapPost("/reading-import/apply", async (Guid community, HttpContext http, CancellationToken token) =>
        {
            var (batch, failure) = await ReadAsync(http.Request, token);
            if (batch is null) return failure!;
            if (http.Request.Headers["X-Reading-Import-Digest"] != batch.Digest)
                return Results.Conflict(new { Outcome = "PreviewMismatch" });
            if (!batch.Rows.Any(row => row.Reading is not null))
                return Results.BadRequest(new { Outcome = "NoValidRecords" });

            var results = new List<RowResult>(batch.Rows.Count);
            var admitted = false;
            var today = CommunityElectricityWeb.Today();
            foreach (var row in batch.Rows)
            {
                if (row.Reading is not { } reading)
                {
                    results.Add(Report(row, null));
                    continue;
                }

                var result = await access.WithAccessAsync<ElectricityRecognition?>(
                    http.Request.Cookies[PlatformWeb.Cookie], community, RegisterPermission.RecognizeElectricity,
                    actor => RecognizeAsync(store, community, reading, today, actor, token), null, token,
                    electricity: new(reading.InstallationId, reading.MeasuredOn, Channel: reading.Channel));
                if (result is null && !admitted) return Results.StatusCode(403);
                admitted |= result is not null;
                results.Add(Report(row, result));
            }
            return Results.Ok(new { Rows = results });
        });
    }

    private static async Task<ElectricityRecognition?> RecognizeAsync(PostgresElectricityStore store, Guid community,
        ElectricityImportRow reading, DateOnly today, RegisterActor actor, CancellationToken token) =>
        await store.RecognizeImportAsync(community, reading, today, CommunityElectricityWeb.Actor(actor), token);

    private static RowResult Report(ElectricityImportRecord row, ElectricityRecognition? result, bool preview = false)
    {
        var input = row.Reading;
        return new(row.Line, input?.InstallationId, input?.MeasuredOn, input?.Channel,
            input is null ? null : ManualElectricity.Exact(input.Value),
            row.Error ?? (preview && result?.Outcome == ReadingOutcome.Recognized ? "Ready" : result?.Outcome.ToString()) ?? "Denied",
            result?.ReadingId, result?.MeterDesignation);
    }

    private static async Task<(Batch? Batch, IResult? Failure)> ReadAsync(HttpRequest request, CancellationToken token)
    {
        var limit = ElectricityReadingImport.MaximumBytes;
        if (request.ContentLength > limit) return (null, Results.StatusCode(413));
        var buffer = new byte[limit + 1];
        var count = await request.Body.ReadAtLeastAsync(buffer, buffer.Length, false, token);
        if (count > limit) return (null, Results.StatusCode(413));
        try
        {
            var offset = buffer.AsSpan(0, count).StartsWith(new byte[] { 0xef, 0xbb, 0xbf }) ? 3 : 0;
            using var csv = new StringReader(StrictUtf8.GetString(buffer, offset, count - offset));
            return (new(Convert.ToHexString(SHA256.HashData(buffer.AsSpan(0, count))), ElectricityReadingImport.Parse(csv)), null);
        }
        catch (DecoderFallbackException)
        {
            return (null, Results.BadRequest(new { Outcome = "InvalidEncoding" }));
        }
        catch (FormatException error)
        {
            return (null, Results.BadRequest(new { Outcome = error.Message }));
        }
    }

    private sealed record Batch(string Digest, IReadOnlyList<ElectricityImportRecord> Rows);
    private sealed record RowResult(int Line, Guid? InstallationId, DateOnly? MeasuredOn, string? Channel,
        string? Value, string Outcome, Guid? ReadingId, string? MeterDesignation);
}
