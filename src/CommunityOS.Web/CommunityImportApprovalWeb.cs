using CommunityOS.Modules.Community.Infrastructure;
using CommunityOS.Modules.Platform.Infrastructure;

internal static class CommunityImportApprovalWeb
{
    public static void Map(RouteGroupBuilder routes, RegisterAccessStore access, PostgresImportApprovalStore store)
    {
        var imports = routes.MapGroup("/import-approvals/{community:guid}");
        var submission = imports.MapGroup("/{draft:guid}/{revision:int:min(1)}/{plan}");

        Task<IResult> Read(HttpContext http, Guid community, CancellationToken token, Func<Task<IResult>> action) =>
            access.WithAccessAsync(http.Request.Cookies[PlatformWeb.Cookie], community, RegisterPermission.ReadImportApproval,
                _ => action(), Results.StatusCode(403), token);

        Task<IResult> Write(HttpContext http, Guid community, ImportSubmissionKey key, RegisterPermission permission,
            CancellationToken token, Func<ImportApprovalActor, Task<IResult>> action) =>
            !ValidPlan(key.PlanId) ? Task.FromResult<IResult>(Results.NotFound()) :
                access.WithAccessAsync(http.Request.Cookies[PlatformWeb.Cookie], community, permission,
                    actor => action(new(actor.AccountId, actor.SubjectId, actor.AdmissionId, actor.AdditionBasis)),
                    Results.StatusCode(403), token, new(key.DraftId, key.Revision, key.PlanId));

        imports.MapGet("/", (Guid community, HttpContext http, CancellationToken token) =>
            Read(http, community, token, async () => Results.Ok(await store.ListAsync(community, token))));
        submission.MapGet("/", (Guid community, Guid draft, int revision, string plan, HttpContext http,
            CancellationToken token) => Read(http, community, token, async () =>
            {
                var preview = await store.PreviewAsync(community, new(draft, revision, plan), token);
                return preview is null ? Results.NotFound() : Results.Ok(preview);
            }));
        submission.MapGet("/receipt", (Guid community, Guid draft, int revision, string plan, HttpContext http,
            CancellationToken token) => Read(http, community, token, async () =>
            {
                var receipt = await store.ReceiptAsync(community, new(draft, revision, plan), token);
                return receipt is null ? Results.NotFound() : Results.Ok(receipt);
            }));
        submission.MapPost("/submit", (Guid community, Guid draft, int revision, string plan, HttpContext http,
            CancellationToken token) => Write(http, community, new(draft, revision, plan), RegisterPermission.SubmitImport,
            token, async actor => await store.SubmitAsync(community, new(draft, revision, plan), actor, token)
                ? Results.NoContent() : Results.Conflict()));
        submission.MapPost("/approve", (Guid community, Guid draft, int revision, string plan, HttpContext http,
            CancellationToken token) => Write(http, community, new(draft, revision, plan), RegisterPermission.ApproveImport,
            token, async actor =>
            {
                var result = await store.ApplyAsync(community, new(draft, revision, plan), actor, token);
                return result switch
                {
                    ImportApprovalResult.Applied or ImportApprovalResult.Replayed =>
                        Results.Ok(new { Outcome = result.ToString() }),
                    ImportApprovalResult.Forbidden => Results.StatusCode(403),
                    ImportApprovalResult.Missing => Results.NotFound(),
                    _ => Results.Conflict(new { Outcome = result.ToString() }),
                };
            }));
    }

    private static bool ValidPlan(string plan) => plan.Length == 64 &&
        plan.All(character => character is >= '0' and <= '9' or >= 'A' and <= 'F');
}
