using System.Security.Cryptography;
using System.Text.Json;
using System.Xml;
using CommunityOS.Modules.Community.Application.Register;
using CommunityOS.Modules.Community.Infrastructure;
using CommunityOS.Modules.Platform.Infrastructure;

internal static class CommunityImportWeb
{
    internal const int MaxBodySize = 2 * 1024 * 1024;
    private const int MaxRows = 500;
    private const string WorkbookType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    public static void Map(RouteGroupBuilder routes, RegisterAccessStore access, ManualRegister register,
        PostgresImportDraftStore drafts)
    {
        var imports = routes.MapGroup("/imports/{community:guid}");
        Task<IResult> Authorize(HttpContext http, Guid community, CancellationToken token,
            Func<ImportDraftOwner, Task<IResult>> action, bool write = false) =>
            access.WithAccessAsync(http.Request.Cookies[PlatformWeb.Cookie], community,
                write ? RegisterPermission.WriteImportDraft : RegisterPermission.PrepareImport,
                actor => action(new(community, actor.AccountId, actor.SubjectId)), Results.StatusCode(403), token);

        imports.MapGet("/", (Guid community, HttpContext http, CancellationToken token) =>
            Authorize(http, community, token, async owner => Results.Ok(await drafts.ListAsync(owner, token))));
        imports.MapGet("/{id:guid}", (Guid community, Guid id, HttpContext http, CancellationToken token) =>
            Authorize(http, community, token, async owner =>
            {
                var draft = await drafts.ReadAsync(owner, id, token);
                return draft is null ? Results.NotFound() : await PreviewAsync(register, community, draft, token);
            }));
        imports.MapPost("/", async (Guid community, HttpContext http, CancellationToken token) =>
        {
            var session = http.Request.Cookies[PlatformWeb.Cookie];
            if (!await access.WithAccessAsync(session, community, RegisterPermission.PrepareImport,
                    _ => Task.FromResult(true), false, token))
            {
                return Results.StatusCode(403);
            }

            if (!string.Equals(http.Request.ContentType, WorkbookType, StringComparison.OrdinalIgnoreCase))
            {
                return Results.StatusCode(415);
            }

            if (http.Request.ContentLength > MaxBodySize)
            {
                return Results.StatusCode(413);
            }

            IReadOnlyList<RegisterImportRow> rows;
            byte[] hash;
            try
            {
                using var workbook = new MemoryStream();
                var buffer = new byte[16 * 1024];
                int received;
                while ((received = await http.Request.Body.ReadAsync(buffer, token)) != 0)
                {
                    if (workbook.Length + received > MaxBodySize)
                    {
                        return Results.StatusCode(413);
                    }

                    workbook.Write(buffer, 0, received);
                }
                workbook.Position = 0;
                rows = OsbbxOwnersWorkbook.Read(workbook, MaxRows);
                if (rows.Count == 0)
                {
                    return Results.BadRequest();
                }

                hash = SHA256.HashData(workbook.GetBuffer().AsSpan(0, (int)workbook.Length));
            }
            catch (BadHttpRequestException error)
            {
                return Results.StatusCode(error.StatusCode);
            }
            catch (Exception error) when (error is FormatException or InvalidDataException or XmlException)
            {
                return Results.BadRequest();
            }

            return await Authorize(http, community, token, async owner =>
            {
                var id = await drafts.CreateAsync(owner, hash, rows, token);
                return Results.Created($"/community/imports/{community}/{id}", new { Id = id });
            }, write: true);
        }).RequireRateLimiting("osbbx-upload");
        imports.MapPost("/{id:guid}/decisions", async (Guid community, Guid id, HttpContext http, CancellationToken token) =>
        {
            if (!http.Request.HasJsonContentType())
            {
                return Results.StatusCode(415);
            }

            DraftInput? input;
            try
            {
                input = await http.Request.ReadFromJsonAsync<DraftInput>(token);
            }
            catch (BadHttpRequestException error)
            {
                return Results.StatusCode(error.StatusCode);
            }
            catch (JsonException)
            {
                return Results.BadRequest();
            }

            if (input?.Decisions is not { Length: <= MaxRows } decisions || input.Revision < 1)
            {
                return Results.BadRequest();
            }

            return await Authorize(http, community, token, async owner =>
            {
                var draft = await drafts.ReadAsync(owner, id, token);
                if (draft is null)
                {
                    return Results.NotFound();
                }

                try
                {
                    RegisterImportDraft.Resolve(draft.Source, decisions);
                }
                catch (ArgumentException)
                {
                    return Results.BadRequest();
                }

                return await drafts.SaveAsync(owner, id, input.Revision, decisions, token)
                    ? Results.NoContent() : Results.Conflict();
            }, write: true);
        });
    }

    private static async Task<IResult> PreviewAsync(ManualRegister register, Guid community, ImportDraft draft,
        CancellationToken token)
    {
        var current = await register.ListAsync(community, token);
        var rows = RegisterImportDraft.Resolve(draft.Source, draft.Decisions);
        var plan = RegisterImportPlan.Create(community, rows, draft.Source);
        return Results.Ok(new { Draft = draft, Preview = plan.Preview(current), PlanId = plan.Id });
    }

    private sealed record DraftInput(int Revision, RegisterOwnerDecision[]? Decisions);
}
