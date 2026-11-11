using CommunityOS.Modules.Community.Application.Register;
using Npgsql;

namespace CommunityOS.Modules.Community.Infrastructure;

public sealed class PostgresRegisterStore(NpgsqlDataSource dataSource) : IRegisterStore
{
    public async Task CreateAsync(RegisterEntry entry, CancellationToken cancellationToken)
    {
        await using var connection = await dataSource.OpenConnectionAsync(cancellationToken);
        await using var transaction = await connection.BeginTransactionAsync(cancellationToken);
        await SetCommunityScopeAsync(connection, transaction, entry.CommunityId, cancellationToken);
        await InsertEntryAsync(connection, transaction, entry, cancellationToken);
        if (entry.Addition is { } addition)
        {
            await using var attribution = new NpgsqlCommand("""
                INSERT INTO community_register.manual_addition (community_id, plot_id, admission_id, account_id, subject_id, basis)
                VALUES (@community, @plot, @admission, @account, @subject, @basis);
                """, connection, transaction);
            attribution.Parameters.AddWithValue("community", entry.CommunityId);
            attribution.Parameters.AddWithValue("plot", entry.PlotId);
            attribution.Parameters.AddWithValue("admission", addition.AdmissionId);
            attribution.Parameters.AddWithValue("account", addition.AccountId);
            attribution.Parameters.AddWithValue("subject", addition.SubjectId);
            attribution.Parameters.AddWithValue("basis", addition.Basis);
            await attribution.ExecuteNonQueryAsync(cancellationToken);
        }
        await transaction.CommitAsync(cancellationToken);
    }

    private static async Task InsertEntryAsync(NpgsqlConnection connection, NpgsqlTransaction transaction,
        RegisterEntry entry, CancellationToken cancellationToken)
    {
        await using var command = new NpgsqlCommand("""
            INSERT INTO community_register.subject (community_id, id, display_name)
            SELECT @community, @owner, @name WHERE @name <> '';

            INSERT INTO community_register.plot (community_id, id, number)
            VALUES (@community, @plot, @number);

            INSERT INTO community_register.ownership (community_id, plot_id, subject_id)
            VALUES (@community, @plot, @owner);

            INSERT INTO community_register.personal_account (community_id, plot_id, id, number)
            VALUES (@community, @plot, @account, @account_number);
            """, connection, transaction);
        command.Parameters.AddWithValue("community", entry.CommunityId);
        command.Parameters.AddWithValue("owner", entry.OwnerId);
        command.Parameters.AddWithValue("name", entry.OwnerName);
        command.Parameters.AddWithValue("plot", entry.PlotId);
        command.Parameters.AddWithValue("number", entry.PlotNumber);
        command.Parameters.AddWithValue("account", Guid.CreateVersion7());
        command.Parameters.AddWithValue("account_number", entry.AccountNumber);
        await command.ExecuteNonQueryAsync(cancellationToken);
    }

    public async Task<bool> CorrectOwnerAsync(Guid communityId, Guid plotId, Guid revision, Guid ownerId,
        string reason, CancellationToken cancellationToken)
    {
        await using var connection = await dataSource.OpenConnectionAsync(cancellationToken);
        await using var transaction = await connection.BeginTransactionAsync(cancellationToken);
        await SetCommunityScopeAsync(connection, transaction, communityId, cancellationToken);
        await using var command = new NpgsqlCommand("""
            WITH corrected AS (
                UPDATE community_register.ownership
                SET subject_id = @owner, revision = uuidv7()
                WHERE community_id = @community AND plot_id = @plot
                    AND revision = @revision AND subject_id <> @owner
                RETURNING OLD.subject_id AS previous_subject_id
            )
            INSERT INTO community_register.ownership_correction
                (community_id, plot_id, previous_revision, previous_subject_id, corrected_subject_id, reason)
            SELECT @community, @plot, @revision, previous_subject_id, @owner, @reason
            FROM corrected;
            """, connection, transaction);
        command.Parameters.AddWithValue("community", communityId);
        command.Parameters.AddWithValue("plot", plotId);
        command.Parameters.AddWithValue("revision", revision);
        command.Parameters.AddWithValue("owner", ownerId);
        command.Parameters.AddWithValue("reason", reason);
        var changed = await command.ExecuteNonQueryAsync(cancellationToken) == 1;
        await transaction.CommitAsync(cancellationToken);
        return changed;
    }

    public async Task<RegisterImportResult> ApplyImportAsync(RegisterImportPlan plan, string confirmedBy,
        CancellationToken cancellationToken)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(confirmedBy);
        await using var connection = await dataSource.OpenConnectionAsync(cancellationToken);
        await using var transaction = await connection.BeginTransactionAsync(cancellationToken);
        await SetCommunityScopeAsync(connection, transaction, plan.CommunityId, cancellationToken);
        await using var batch = new NpgsqlCommand("""
            INSERT INTO community_register.register_import (community_id, plan_id, confirmed_by)
            VALUES (@community, @plan, @operator)
            ON CONFLICT DO NOTHING;
            """, connection, transaction);
        batch.Parameters.AddWithValue("community", plan.CommunityId);
        batch.Parameters.AddWithValue("plan", plan.Id);
        batch.Parameters.AddWithValue("operator", confirmedBy.Trim());
        if (await batch.ExecuteNonQueryAsync(cancellationToken) == 0)
        {
            return RegisterImportResult.AlreadyApplied;
        }

        var current = await ReadEntriesAsync(connection, transaction, plan.CommunityId, cancellationToken);
        if (!plan.Preview(current).CanProceed)
        {
            return RegisterImportResult.Conflicts;
        }

        await using var item = new NpgsqlCommand("""
            INSERT INTO community_register.register_import_item (community_id, plan_id, source_row, plot_id, subject_id)
            VALUES (@community, @plan, @row, @plot, @subject);
            """, connection, transaction);
        item.Parameters.AddWithValue("community", plan.CommunityId);
        item.Parameters.AddWithValue("plan", plan.Id);
        var row = item.Parameters.AddWithValue("row", 0);
        var plot = item.Parameters.AddWithValue("plot", Guid.Empty);
        var subject = item.Parameters.AddWithValue("subject", Guid.Empty);
        foreach (var (sourceRow, entry) in plan.CreateEntries())
        {
            await InsertEntryAsync(connection, transaction, entry, cancellationToken);
            row.Value = sourceRow;
            plot.Value = entry.PlotId;
            subject.Value = entry.OwnerId;
            await item.ExecuteNonQueryAsync(cancellationToken);
        }

        await transaction.CommitAsync(cancellationToken);
        return RegisterImportResult.Applied;
    }

    public async Task<RegisterImportReceipt?> FindImportReceiptAsync(Guid communityId, string planId,
        CancellationToken cancellationToken)
    {
        await using var connection = await dataSource.OpenConnectionAsync(cancellationToken);
        await using var transaction = await connection.BeginTransactionAsync(cancellationToken);
        await SetCommunityScopeAsync(connection, transaction, communityId, cancellationToken);
        await using var command = new NpgsqlCommand("""
            SELECT b.confirmed_by, b.recorded_at, i.source_row, p.id, p.number, i.subject_id, a.id, a.number
            FROM community_register.register_import b
            JOIN community_register.register_import_item i USING (community_id, plan_id)
            JOIN community_register.plot p ON (p.community_id, p.id) = (i.community_id, i.plot_id)
            JOIN community_register.personal_account a ON (a.community_id, a.plot_id) = (p.community_id, p.id)
            WHERE b.community_id = @community AND b.plan_id = @plan
            ORDER BY i.source_row;
            """, connection, transaction);
        command.Parameters.AddWithValue("community", communityId);
        command.Parameters.AddWithValue("plan", planId);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        if (!await reader.ReadAsync(cancellationToken))
        {
            return null;
        }

        var confirmedBy = reader.GetString(0);
        var recordedAt = reader.GetDateTime(1);
        var items = new List<RegisterImportReceiptItem>();
        do
        {
            items.Add(new(reader.GetInt32(2), reader.GetGuid(3), reader.GetString(4),
                reader.GetGuid(5), reader.GetGuid(6), reader.GetString(7)));
        } while (await reader.ReadAsync(cancellationToken));

        return new(planId, confirmedBy, recordedAt, items);
    }

    public async Task<IReadOnlyList<RegisterEntry>> ListAsync(Guid communityId, CancellationToken cancellationToken)
    {
        await using var connection = await dataSource.OpenConnectionAsync(cancellationToken);
        await using var transaction = await connection.BeginTransactionAsync(cancellationToken);
        await SetCommunityScopeAsync(connection, transaction, communityId, cancellationToken);
        return await ReadEntriesAsync(connection, transaction, communityId, cancellationToken);
    }

    private static async Task<IReadOnlyList<RegisterEntry>> ReadEntriesAsync(NpgsqlConnection connection,
        NpgsqlTransaction transaction, Guid communityId, CancellationToken cancellationToken)
    {
        await using var command = new NpgsqlCommand("""
            SELECT s.id, p.id, s.display_name, p.number, a.number, o.revision
            FROM community_register.plot p
            JOIN community_register.ownership o ON (o.community_id, o.plot_id) = (p.community_id, p.id)
            JOIN community_register.subject s ON (s.community_id, s.id) = (o.community_id, o.subject_id)
            JOIN community_register.personal_account a ON (a.community_id, a.plot_id) = (p.community_id, p.id)
            WHERE p.community_id = @community
            ORDER BY p.number, s.id;
            """, connection, transaction);
        command.Parameters.AddWithValue("community", communityId);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var entries = new List<RegisterEntry>();
        while (await reader.ReadAsync(cancellationToken))
        {
            entries.Add(new RegisterEntry(communityId, reader.GetGuid(0), reader.GetGuid(1),
                reader.GetString(2), reader.GetString(3), reader.GetString(4), reader.GetGuid(5)));
        }

        return entries;
    }

    internal static async Task SetCommunityScopeAsync(NpgsqlConnection connection, NpgsqlTransaction transaction,
        Guid communityId, CancellationToken cancellationToken)
    {
        ArgumentOutOfRangeException.ThrowIfEqual(communityId, Guid.Empty);
        await using var command = new NpgsqlCommand(
            "SELECT set_config('community_os.community_id', @community, true);", connection, transaction);
        command.Parameters.AddWithValue("community", communityId.ToString("D"));
        await command.ExecuteNonQueryAsync(cancellationToken);
    }
}
