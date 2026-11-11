using System.Text.Json;
using CommunityOS.Modules.Community.Application.Register;
using Npgsql;

namespace CommunityOS.Modules.Community.Infrastructure;

public sealed record ImportSubmissionKey(Guid DraftId, int Revision, string PlanId);
public sealed record ImportApprovalActor(Guid AccountId, Guid SubjectId, Guid AdmissionId, string? Basis);
public sealed record ImportSubmission(ImportSubmissionKey Key, DateTime SubmittedAt, bool Applied);
public sealed record ImportSubmissionPreview(ImportSubmission Submission, RegisterImportPreview Preview);
public enum ImportApprovalResult { Applied, Replayed, Conflict, Stale, PlanAlreadyApplied, Forbidden, Missing }

public sealed class PostgresImportApprovalStore(NpgsqlDataSource source)
{
    public Task<IReadOnlyList<ImportSubmission>> ListAsync(Guid community, CancellationToken token) =>
        RunAsync<IReadOnlyList<ImportSubmission>>(community, async (connection, transaction) =>
        {
            await using var command = new NpgsqlCommand("""
                SELECT s.draft_id, s.revision, s.plan_id, s.submitted_at, s.applied_plan_id IS NOT NULL
                FROM community_register.import_submission s
                JOIN community_register.import_draft d ON (d.community_id, d.id) = (s.community_id, s.draft_id)
                WHERE s.community_id = @community AND (s.revision = d.revision OR s.applied_plan_id IS NOT NULL)
                ORDER BY s.submitted_at DESC, s.draft_id, s.revision LIMIT 100;
                """, connection, transaction);
            command.Parameters.AddWithValue("community", community);
            await using var reader = await command.ExecuteReaderAsync(token);
            var result = new List<ImportSubmission>();
            while (await reader.ReadAsync(token))
            {
                result.Add(new(new(reader.GetGuid(0), reader.GetInt32(1), reader.GetString(2)),
                    reader.GetDateTime(3), reader.GetBoolean(4)));
            }
            return result;
        }, token);

    public Task<bool> SubmitAsync(Guid community, ImportSubmissionKey key, ImportApprovalActor actor,
        CancellationToken token) => RunAsync(community, async (connection, transaction) =>
    {
        var draft = await LockDraftAsync(connection, transaction, community, key, token);
        if (draft is null || draft.Revision != key.Revision || draft.Account != actor.AccountId ||
            draft.Subject != actor.SubjectId)
        {
            return false;
        }

        var plan = draft.Plan(community);
        if (plan.Id != key.PlanId ||
            !plan.Preview(await PostgresRegisterStore.ReadEntriesAsync(connection, transaction, community, token)).CanProceed)
        {
            return false;
        }

        await using var command = TargetCommand(connection, transaction, community, key, """
            INSERT INTO community_register.import_submission
                (community_id, draft_id, revision, plan_id, submit_admission_id, prepared_by_account, prepared_by_subject)
            VALUES (@community, @draft, @revision, @plan, @admission, @account, @subject)
            ON CONFLICT (community_id, draft_id, revision) DO NOTHING;
            """);
        AddActor(command, actor);
        await command.ExecuteNonQueryAsync(token);
        return true;
    }, token);

    public Task<ImportSubmissionPreview?> PreviewAsync(Guid community, ImportSubmissionKey key, CancellationToken token) =>
        RunAsync<ImportSubmissionPreview?>(community, async (connection, transaction) =>
        {
            var draft = await LockDraftAsync(connection, transaction, community, key, token);
            var submission = await FindAsync(connection, transaction, community, key, token);
            if (draft?.Revision != key.Revision || submission is null || submission.Applied)
            {
                return null;
            }

            var plan = draft.Plan(community);
            return plan.Id == key.PlanId ? new(submission, plan.Preview(
                await PostgresRegisterStore.ReadEntriesAsync(connection, transaction, community, token))) : null;
        }, token);

    public Task<ImportApprovalResult> ApplyAsync(Guid community, ImportSubmissionKey key, ImportApprovalActor actor,
        CancellationToken token) => RunAsync(community, async (connection, transaction) =>
    {
        var draft = await LockDraftAsync(connection, transaction, community, key, token);
        var submission = await FindAsync(connection, transaction, community, key, token);
        if (draft is null || submission is null)
        {
            return ImportApprovalResult.Missing;
        }
        if (draft.Account == actor.AccountId || draft.Subject == actor.SubjectId ||
            string.IsNullOrWhiteSpace(actor.Basis))
        {
            return ImportApprovalResult.Forbidden;
        }

        var result = ImportApprovalResult.Replayed;
        if (!submission.Applied)
        {
            result = ImportApprovalResult.Stale;
            if (draft.Revision == key.Revision && draft.Plan(community) is { } plan && plan.Id == key.PlanId)
            {
                await transaction.SaveAsync("apply_register", token);
                try
                {
                    var applied = await PostgresRegisterStore.ApplyImportAsync(connection, transaction, plan,
                        actor.AccountId.ToString(), token);
                    result = applied switch
                    {
                        RegisterImportResult.Applied => ImportApprovalResult.Applied,
                        RegisterImportResult.AlreadyApplied => ImportApprovalResult.PlanAlreadyApplied,
                        _ => ImportApprovalResult.Conflict,
                    };
                }
                catch (PostgresException error) when (error.SqlState == PostgresErrorCodes.DeadlockDetected ||
                    (error.SqlState == PostgresErrorCodes.UniqueViolation && error.TableName is "plot" or "personal_account"))
                {
                    result = ImportApprovalResult.Conflict;
                }

                if (result == ImportApprovalResult.Applied)
                {
                    await using var update = TargetCommand(connection, transaction, community, key, """
                        UPDATE community_register.import_submission SET applied_plan_id = @plan
                        WHERE community_id = @community AND draft_id = @draft AND revision = @revision;
                        """);
                    await update.ExecuteNonQueryAsync(token);
                }
                else
                {
                    await transaction.RollbackAsync("apply_register", token);
                }
            }
        }

        await using var audit = TargetCommand(connection, transaction, community, key, """
            INSERT INTO community_register.import_approval_event
                (community_id, admission_id, draft_id, revision, approved_by_account, approved_by_subject, basis, outcome)
            VALUES (@community, @admission, @draft, @revision, @account, @subject, @basis, @outcome);
            """);
        AddActor(audit, actor);
        audit.Parameters.AddWithValue("basis", actor.Basis!);
        audit.Parameters.AddWithValue("outcome", result == ImportApprovalResult.PlanAlreadyApplied
            ? "plan-already-applied" : result.ToString().ToLowerInvariant());
        await audit.ExecuteNonQueryAsync(token);
        return result;
    }, token);

    public async Task<RegisterImportReceipt?> ReceiptAsync(Guid community, ImportSubmissionKey key, CancellationToken token)
    {
        var submission = await RunAsync(community,
            (connection, transaction) => FindAsync(connection, transaction, community, key, token), token);
        return submission?.Applied == true
            ? await new PostgresRegisterStore(source).FindImportReceiptAsync(community, key.PlanId, token) : null;
    }

    private static async Task<ImportSubmission?> FindAsync(NpgsqlConnection connection, NpgsqlTransaction transaction,
        Guid community, ImportSubmissionKey key, CancellationToken token)
    {
        await using var command = TargetCommand(connection, transaction, community, key, """
            SELECT submitted_at, applied_plan_id IS NOT NULL
            FROM community_register.import_submission
            WHERE community_id = @community AND draft_id = @draft AND revision = @revision AND plan_id = @plan;
            """);
        await using var reader = await command.ExecuteReaderAsync(token);
        return await reader.ReadAsync(token) ? new(key, reader.GetDateTime(0), reader.GetBoolean(1)) : null;
    }

    private static async Task<ApprovalDraft?> LockDraftAsync(NpgsqlConnection connection, NpgsqlTransaction transaction,
        Guid community, ImportSubmissionKey key, CancellationToken token)
    {
        await using var command = TargetCommand(connection, transaction, community, key, """
            SELECT revision, operator_account_id, operator_subject_id, source_rows, decisions
            FROM community_register.import_draft WHERE community_id = @community AND id = @draft
            FOR UPDATE;
            """);
        await using var reader = await command.ExecuteReaderAsync(token);
        return await reader.ReadAsync(token)
            ? new(reader.GetInt32(0), reader.GetGuid(1), reader.GetGuid(2),
                JsonSerializer.Deserialize<RegisterImportRow[]>(reader.GetString(3))!,
                JsonSerializer.Deserialize<RegisterOwnerDecision[]>(reader.GetString(4))!)
            : null;
    }

    private async Task<T> RunAsync<T>(Guid community, Func<NpgsqlConnection, NpgsqlTransaction, Task<T>> operation,
        CancellationToken token)
    {
        await using var connection = await source.OpenConnectionAsync(token);
        await using var transaction = await connection.BeginTransactionAsync(token);
        await PostgresRegisterStore.SetCommunityScopeAsync(connection, transaction, community, token);
        var result = await operation(connection, transaction);
        await transaction.CommitAsync(token);
        return result;
    }

    private static NpgsqlCommand TargetCommand(NpgsqlConnection connection, NpgsqlTransaction transaction,
        Guid community, ImportSubmissionKey key, string sql)
    {
        var command = new NpgsqlCommand(sql, connection, transaction);
        command.Parameters.AddWithValue("community", community);
        command.Parameters.AddWithValue("draft", key.DraftId);
        command.Parameters.AddWithValue("revision", key.Revision);
        command.Parameters.AddWithValue("plan", key.PlanId);
        return command;
    }

    private static void AddActor(NpgsqlCommand command, ImportApprovalActor actor)
    {
        command.Parameters.AddWithValue("account", actor.AccountId);
        command.Parameters.AddWithValue("subject", actor.SubjectId);
        command.Parameters.AddWithValue("admission", actor.AdmissionId);
    }

    private sealed record ApprovalDraft(int Revision, Guid Account, Guid Subject,
        RegisterImportRow[] Source, RegisterOwnerDecision[] Decisions)
    {
        public RegisterImportPlan Plan(Guid community) =>
            RegisterImportPlan.Create(community, RegisterImportDraft.Resolve(Source, Decisions), Source);
    }
}
