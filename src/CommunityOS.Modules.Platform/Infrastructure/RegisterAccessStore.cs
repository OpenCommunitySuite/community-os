using Npgsql;

namespace CommunityOS.Modules.Platform.Infrastructure;

public sealed record RegisterCommunity(Guid Id, string Name, bool CanRead, bool CanAdd, bool CanPrepareImport,
    bool CanApproveImport, bool CanCorrectOwnership, bool CanReadElectricity, bool CanSetupElectricity,
    bool CanRecognizeElectricity, bool CanReplaceElectricity);
public sealed record RegisterActor(Guid AccountId, Guid SubjectId, string? AdditionBasis, Guid AdmissionId);
public sealed record RegisterImportTarget(Guid DraftId, int Revision, string PlanId);
public sealed record OwnershipCorrectionTarget(Guid PlotId, Guid Revision, Guid OwnerId);
public sealed record ElectricityTarget(Guid Id, DateOnly Date, Guid? RequestId = null);
public enum RegisterPermission
{
    Read, Add, PrepareImport, WriteImportDraft, ReadImportApproval, SubmitImport, ApproveImport,
    ReadCorrectionCandidates, CorrectOwnership, ReadElectricity, SetupElectricity, RecognizeElectricity, ReplaceElectricity
}

public sealed class RegisterAccessStore(NpgsqlDataSource dataSource)
{
    public async Task<IReadOnlyList<RegisterCommunity>?> ListAsync(string? session, CancellationToken token)
    {
        if (PlatformAuthenticationStore.Digest(session) is not { } digest)
        {
            return null;
        }

        await using var command = dataSource.CreateCommand("""
            SELECT c.community_id, c.display_name, v.register_enabled AND o.can_read,
                v.register_enabled AND o.can_add AND o.addition_basis IS NOT NULL,
                v.register_enabled AND o.can_prepare_import,
                v.register_enabled AND o.can_approve_import AND o.import_approval_basis IS NOT NULL,
                v.register_enabled AND o.can_read AND o.can_correct_ownership AND o.ownership_correction_basis IS NOT NULL,
                v.electricity_enabled AND o.can_read_electricity,
                v.electricity_enabled AND o.can_read_electricity AND o.can_setup_electricity AND o.electricity_setup_basis IS NOT NULL,
                v.electricity_enabled AND o.can_read_electricity AND o.can_recognize_electricity AND o.electricity_recognition_basis IS NOT NULL,
                v.electricity_enabled AND o.can_read_electricity AND o.can_replace_electricity AND o.electricity_replacement_basis IS NOT NULL
            FROM platform_provisioning.platform_session s
            JOIN platform_provisioning.platform_account a ON a.id = s.account_id
            LEFT JOIN (
                platform_provisioning.register_operator o
                JOIN platform_provisioning.register_availability v USING (community_id)
                JOIN platform_provisioning.community_reservation c USING (community_id)
            ) ON o.account_id = a.id AND o.linked AND v.community_active
                AND ((v.register_enabled AND (o.can_read OR (o.can_add AND o.addition_basis IS NOT NULL)
                    OR o.can_prepare_import OR (o.can_approve_import AND o.import_approval_basis IS NOT NULL)))
                    OR (v.electricity_enabled AND o.can_read_electricity))
            WHERE s.token_digest = @digest AND s.revoked_at IS NULL
                AND s.expires_at > clock_timestamp() AND a.disabled_at IS NULL
            ORDER BY c.display_name, c.community_id;
            """);
        command.Parameters.AddWithValue("digest", digest);
        await using var reader = await command.ExecuteReaderAsync(token);
        if (!await reader.ReadAsync(token))
        {
            return null;
        }

        var communities = new List<RegisterCommunity>();
        do
        {
            if (!reader.IsDBNull(0))
            {
                communities.Add(new(reader.GetGuid(0), reader.GetString(1), reader.GetBoolean(2), reader.GetBoolean(3),
                    reader.GetBoolean(4), reader.GetBoolean(5), reader.GetBoolean(6), reader.GetBoolean(7),
                    reader.GetBoolean(8), reader.GetBoolean(9), reader.GetBoolean(10)));
            }
        } while (await reader.ReadAsync(token));

        return communities;
    }

    public Task<T> WithAccessAsync<T>(string? session, Guid community, bool adding,
        Func<RegisterActor, Task<T>> action, T denied, CancellationToken token) =>
        WithAccessAsync(session, community, adding ? RegisterPermission.Add : RegisterPermission.Read, action, denied, token);

    public async Task<T> WithAccessAsync<T>(string? session, Guid community, RegisterPermission permission,
        Func<RegisterActor, Task<T>> action, T denied, CancellationToken token, RegisterImportTarget? target = null,
        OwnershipCorrectionTarget? correction = null, ElectricityTarget? electricity = null)
    {
        if (PlatformAuthenticationStore.Digest(session) is not { } digest)
        {
            return denied;
        }

        var submitting = permission == RegisterPermission.SubmitImport;
        var approving = permission == RegisterPermission.ApproveImport;
        var correcting = permission == RegisterPermission.CorrectOwnership;
        var setup = permission == RegisterPermission.SetupElectricity;
        var recognize = permission == RegisterPermission.RecognizeElectricity;
        var replace = permission == RegisterPermission.ReplaceElectricity;
        var electricityWrite = setup || recognize || replace;
        if (((submitting || approving) && target is null) || (correcting && correction is null) ||
            (electricityWrite && electricity is null) || (replace && electricity?.RequestId is null))
        {
            return denied;
        }

        await using var connection = await dataSource.OpenConnectionAsync(token);
        await using var transaction = await connection.BeginTransactionAsync(token);
        await using var authorization = new NpgsqlCommand("""
            SELECT a.id, o.subject_id, CASE WHEN @setup THEN o.electricity_setup_basis
                WHEN @recognize THEN o.electricity_recognition_basis WHEN @replace THEN o.electricity_replacement_basis
                WHEN @correcting THEN o.ownership_correction_basis
                WHEN @approval THEN o.import_approval_basis ELSE o.addition_basis END
            FROM platform_provisioning.platform_session s
            JOIN platform_provisioning.platform_account a ON a.id = s.account_id
            JOIN platform_provisioning.register_operator o ON o.account_id = a.id
            JOIN platform_provisioning.register_availability v ON v.community_id = o.community_id
            WHERE s.token_digest = @digest AND s.revoked_at IS NULL
                AND a.disabled_at IS NULL AND o.community_id = @community AND o.linked
                AND v.community_active
                AND ((v.register_enabled AND ((@adding AND o.can_add AND o.addition_basis IS NOT NULL) OR (@reading AND o.can_read)
                    OR (@preparing AND o.can_prepare_import)
                    OR (@approval AND o.can_approve_import AND o.import_approval_basis IS NOT NULL)
                    OR (@correcting AND o.can_read AND o.can_correct_ownership AND o.ownership_correction_basis IS NOT NULL)))
                    OR (v.electricity_enabled AND o.can_read_electricity AND (@read_electricity
                        OR (@setup AND o.can_setup_electricity AND o.electricity_setup_basis IS NOT NULL)
                        OR (@recognize AND o.can_recognize_electricity AND o.electricity_recognition_basis IS NOT NULL)
                        OR (@replace AND o.can_replace_electricity AND o.electricity_replacement_basis IS NOT NULL))))
            FOR SHARE OF a, s, o, v;
            """, connection, transaction);
        authorization.Parameters.AddWithValue("digest", digest);
        authorization.Parameters.AddWithValue("community", community);
        var adding = permission == RegisterPermission.Add;
        authorization.Parameters.AddWithValue("adding", adding);
        authorization.Parameters.AddWithValue("reading", permission == RegisterPermission.Read);
        var writingDraft = permission == RegisterPermission.WriteImportDraft;
        authorization.Parameters.AddWithValue("preparing", permission == RegisterPermission.PrepareImport || writingDraft || submitting);
        authorization.Parameters.AddWithValue("approval", permission == RegisterPermission.ReadImportApproval || approving);
        authorization.Parameters.AddWithValue("correcting", correcting || permission == RegisterPermission.ReadCorrectionCandidates);
        authorization.Parameters.AddWithValue("read_electricity", permission == RegisterPermission.ReadElectricity);
        authorization.Parameters.AddWithValue("setup", setup);
        authorization.Parameters.AddWithValue("recognize", recognize);
        authorization.Parameters.AddWithValue("replace", replace);
        var writing = adding || writingDraft || submitting || approving || correcting || electricityWrite;
        RegisterActor actor;
        await using (var reader = await authorization.ExecuteReaderAsync(token))
        {
            if (!await reader.ReadAsync(token))
            {
                return denied;
            }

            actor = new(reader.GetGuid(0), reader.GetGuid(1), reader.IsDBNull(2) ? null : reader.GetString(2),
                writing ? Guid.CreateVersion7() : Guid.Empty);
        }

        await using var deadline = new NpgsqlCommand("""
            SELECT expires_at > clock_timestamp()
            FROM platform_provisioning.platform_session WHERE token_digest = @digest;
            """, connection, transaction);
        deadline.Parameters.AddWithValue("digest", digest);
        if (await deadline.ExecuteScalarAsync(token) is not true)
        {
            return denied;
        }

        if (writing)
        {
            await using var admit = new NpgsqlCommand(adding ? """
                INSERT INTO platform_provisioning.register_addition_admission (id, community_id, account_id, subject_id, basis)
                SELECT @id, @community, @account, @subject, @basis
                FROM platform_provisioning.platform_session
                WHERE token_digest = @digest AND expires_at > clock_timestamp();
                """ : writingDraft ? """
                INSERT INTO platform_provisioning.register_import_draft_admission (id, community_id, account_id, subject_id)
                SELECT @id, @community, @account, @subject
                FROM platform_provisioning.platform_session
                WHERE token_digest = @digest AND expires_at > clock_timestamp();
                """ : correcting ? """
                INSERT INTO platform_provisioning.ownership_correction_admission
                    (id, community_id, account_id, subject_id, plot_id, previous_revision, owner_id, basis)
                SELECT @id, @community, @account, @subject, @plot, @previous, @owner, @basis
                FROM platform_provisioning.platform_session
                WHERE token_digest = @digest AND expires_at > clock_timestamp();
                """ : electricityWrite ? """
                INSERT INTO platform_provisioning.electricity_admission
                    (id, community_id, account_id, subject_id, action, target_id, effective_on, basis, request_id)
                SELECT @id, @community, @account, @subject, @action, @target, @date, @basis, @request
                FROM platform_provisioning.platform_session
                WHERE token_digest = @digest AND expires_at > clock_timestamp();
                """ : """
                INSERT INTO platform_provisioning.register_import_admission
                    (id, community_id, account_id, subject_id, draft_id, revision, plan_id, action, basis)
                SELECT @id, @community, @account, @subject, @draft, @revision, @plan, @action, @basis
                FROM platform_provisioning.platform_session
                WHERE token_digest = @digest AND expires_at > clock_timestamp();
                """, connection, transaction);
            admit.Parameters.AddWithValue("id", actor.AdmissionId);
            admit.Parameters.AddWithValue("community", community);
            admit.Parameters.AddWithValue("account", actor.AccountId);
            admit.Parameters.AddWithValue("subject", actor.SubjectId);
            if (adding || correcting || electricityWrite)
            {
                admit.Parameters.AddWithValue("basis", actor.AdditionBasis!);
            }
            if (electricityWrite)
            {
                admit.Parameters.AddWithValue("action", setup ? "setup" : recognize ? "recognize" : "replace");
                admit.Parameters.AddWithValue("target", electricity!.Id);
                admit.Parameters.AddWithValue("date", electricity.Date);
                admit.Parameters.AddWithValue("request", NpgsqlTypes.NpgsqlDbType.Uuid,
                    replace && electricity.RequestId is Guid request ? request : DBNull.Value);
            }
            if (correcting)
            {
                admit.Parameters.AddWithValue("plot", correction!.PlotId);
                admit.Parameters.AddWithValue("previous", correction.Revision);
                admit.Parameters.AddWithValue("owner", correction.OwnerId);
            }
            if (submitting || approving)
            {
                admit.Parameters.AddWithValue("draft", target!.DraftId);
                admit.Parameters.AddWithValue("revision", target.Revision);
                admit.Parameters.AddWithValue("plan", target.PlanId);
                admit.Parameters.AddWithValue("action", submitting ? "submit" : "approve");
                admit.Parameters.AddWithValue("basis", NpgsqlTypes.NpgsqlDbType.Text,
                    approving ? actor.AdditionBasis! : DBNull.Value);
            }
            admit.Parameters.AddWithValue("digest", digest);
            if (await admit.ExecuteNonQueryAsync(token) != 1)
            {
                return denied;
            }

            // Community writes start only after PostgreSQL acknowledges durable admission.
            await transaction.CommitAsync(token);
        }

        return await action(actor);
    }
}
