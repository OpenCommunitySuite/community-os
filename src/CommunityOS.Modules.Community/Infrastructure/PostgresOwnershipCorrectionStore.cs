using Npgsql;

namespace CommunityOS.Modules.Community.Infrastructure;

public sealed record OwnershipCorrection(Guid PlotId, Guid Revision, Guid OwnerId, string Reason);
public sealed record OwnershipCorrectionActor(Guid AdmissionId, Guid AccountId, Guid SubjectId, string Basis);
public sealed record OwnershipCorrectionHistory(Guid PreviousRevision, Guid PreviousOwnerId, string PreviousOwnerName,
    Guid CorrectedOwnerId, string CorrectedOwnerName, string Reason, DateTime RecordedAt, Guid? AccountId, Guid? SubjectId);
public enum OwnershipCorrectionResult { Corrected, Stale, InvalidOwner, Unchanged }
public sealed record OwnershipCorrectionOwner(Guid Id, string Name);

public sealed class PostgresOwnershipCorrectionStore(NpgsqlDataSource source)
{
    public async Task<IReadOnlyList<OwnershipCorrectionOwner>> OwnersAsync(Guid community, CancellationToken token)
    {
        await using var connection = await source.OpenConnectionAsync(token);
        await using var transaction = await connection.BeginTransactionAsync(token);
        await PostgresRegisterStore.SetCommunityScopeAsync(connection, transaction, community, token);
        await using var command = new NpgsqlCommand("""
            SELECT id, display_name FROM community_register.subject
            WHERE community_id = @community ORDER BY display_name, id;
            """, connection, transaction);
        command.Parameters.AddWithValue("community", community);
        await using var reader = await command.ExecuteReaderAsync(token);
        var owners = new List<OwnershipCorrectionOwner>();
        while (await reader.ReadAsync(token))
        {
            owners.Add(new(reader.GetGuid(0), reader.GetString(1)));
        }
        return owners;
    }

    public async Task<OwnershipCorrectionResult> CorrectAsync(Guid community, OwnershipCorrection correction,
        OwnershipCorrectionActor actor, CancellationToken token)
    {
        await using var connection = await source.OpenConnectionAsync(token);
        await using var transaction = await connection.BeginTransactionAsync(token);
        await PostgresRegisterStore.SetCommunityScopeAsync(connection, transaction, community, token);
        await transaction.SaveAsync("correct_ownership", token);

        OwnershipCorrectionResult result;
        try
        {
            if (await PostgresRegisterStore.CorrectOwnerAsync(connection, transaction, community, correction.PlotId,
                    correction.Revision, correction.OwnerId, correction.Reason, token))
            {
                result = OwnershipCorrectionResult.Corrected;
            }
            else
            {
                await using var current = new NpgsqlCommand("""
                    SELECT subject_id FROM community_register.ownership
                    WHERE community_id = @community AND plot_id = @plot AND revision = @revision;
                    """, connection, transaction);
                BindTarget(current, community, correction);
                result = await current.ExecuteScalarAsync(token) is Guid subject && subject == correction.OwnerId
                    ? OwnershipCorrectionResult.Unchanged : OwnershipCorrectionResult.Stale;
            }
        }
        catch (PostgresException error) when (
            (error.TableName is "ownership" or "ownership_correction" && error.SqlState == PostgresErrorCodes.ForeignKeyViolation) ||
            (error.TableName == "ownership" && error.SqlState == PostgresErrorCodes.UniqueViolation))
        {
            await transaction.RollbackAsync("correct_ownership", token);
            result = OwnershipCorrectionResult.InvalidOwner;
        }

        await using var audit = new NpgsqlCommand("""
            INSERT INTO community_register.ownership_correction_event
                (community_id, admission_id, plot_id, previous_revision, account_id, subject_id, basis, outcome)
            VALUES (@community, @admission, @plot, @revision, @account, @subject, @basis, @outcome);
            """, connection, transaction);
        BindTarget(audit, community, correction);
        audit.Parameters.AddWithValue("admission", actor.AdmissionId);
        audit.Parameters.AddWithValue("account", actor.AccountId);
        audit.Parameters.AddWithValue("subject", actor.SubjectId);
        audit.Parameters.AddWithValue("basis", actor.Basis);
        audit.Parameters.AddWithValue("outcome", result == OwnershipCorrectionResult.InvalidOwner
            ? "invalid-owner" : result.ToString().ToLowerInvariant());
        await audit.ExecuteNonQueryAsync(token);
        await transaction.CommitAsync(token);
        return result;
    }

    public async Task<IReadOnlyList<OwnershipCorrectionHistory>> HistoryAsync(Guid community, Guid plot,
        CancellationToken token)
    {
        await using var connection = await source.OpenConnectionAsync(token);
        await using var transaction = await connection.BeginTransactionAsync(token);
        await PostgresRegisterStore.SetCommunityScopeAsync(connection, transaction, community, token);
        await using var command = new NpgsqlCommand("""
            SELECT h.previous_revision, h.previous_subject_id, previous.display_name,
                h.corrected_subject_id, corrected.display_name, h.reason, h.recorded_at, e.account_id, e.subject_id
            FROM community_register.ownership_correction h
            JOIN community_register.subject previous ON (previous.community_id, previous.id) =
                (h.community_id, h.previous_subject_id)
            JOIN community_register.subject corrected ON (corrected.community_id, corrected.id) =
                (h.community_id, h.corrected_subject_id)
            LEFT JOIN community_register.ownership_correction_event e ON
                (e.community_id, e.plot_id, e.previous_revision) = (h.community_id, h.plot_id, h.previous_revision)
                AND e.outcome = 'corrected'
            WHERE h.community_id = @community AND h.plot_id = @plot
            ORDER BY h.recorded_at DESC, h.previous_revision DESC;
            """, connection, transaction);
        command.Parameters.AddWithValue("community", community);
        command.Parameters.AddWithValue("plot", plot);
        await using var reader = await command.ExecuteReaderAsync(token);
        var history = new List<OwnershipCorrectionHistory>();
        while (await reader.ReadAsync(token))
        {
            history.Add(new(reader.GetGuid(0), reader.GetGuid(1), reader.GetString(2), reader.GetGuid(3),
                reader.GetString(4), reader.GetString(5), reader.GetDateTime(6), reader.IsDBNull(7) ? null : reader.GetGuid(7),
                reader.IsDBNull(8) ? null : reader.GetGuid(8)));
        }
        return history;
    }

    private static void BindTarget(NpgsqlCommand command, Guid community, OwnershipCorrection correction)
    {
        command.Parameters.AddWithValue("community", community);
        command.Parameters.AddWithValue("plot", correction.PlotId);
        command.Parameters.AddWithValue("revision", correction.Revision);
    }
}
