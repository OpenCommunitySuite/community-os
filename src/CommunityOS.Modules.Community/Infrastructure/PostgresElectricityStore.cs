using CommunityOS.Modules.Community.Application.Electricity;
using Npgsql;

namespace CommunityOS.Modules.Community.Infrastructure;

public sealed record ElectricityActor(Guid AccountId, Guid SubjectId, Guid AdmissionId, string Basis);
public sealed record ElectricityInstallation(Guid Id, Guid PointId, Guid MeterId, string MeterDesignation, DateOnly StartsOn,
    DateOnly? EndsBefore = null, ElectricityReplacementHistory? Replacement = null,
    string RegisterMode = ManualElectricity.Total, MeterInstallationDetails? Details = null);
public sealed record ElectricityReplacementHistory(string Reason, DateTime RecordedAt, Guid AccountId, Guid SubjectId);
public sealed record ElectricityPlot(Guid Id, string Number, ElectricityInstallation? Installation);
public sealed record CommonElectricityPoint(Guid Id, string Designation, string Boundary);
public sealed record ElectricitySeries(IReadOnlyList<ElectricityReading> Readings, IReadOnlyList<ElectricityInterval> Intervals,
    string Unit, IReadOnlyList<ElectricityCombinedInterval> CombinedIntervals);
public sealed record ElectricityRecognition(ReadingOutcome Outcome, Guid? ReadingId = null, string? MeterDesignation = null);
public enum ElectricitySetupOutcome { Created, MissingPlot, Conflict }
public sealed record ElectricityReplacement(Guid RequestId, Guid InstallationId, DateOnly EffectiveOn, string Designation,
    string Reason, MeterInstallationDetails? Details = null);
public enum ElectricityReplacementOutcome { Replaced, Replayed, Missing, InvalidDate, ExistingReading, Conflict }
public sealed record ElectricityReplacementResult(ElectricityReplacementOutcome Outcome, Guid? InstallationId = null);

public sealed partial class PostgresElectricityStore(NpgsqlDataSource source)
{
    public Task<IReadOnlyList<ElectricityInstallation>> InstallationsAsync(Guid community, Guid plot, CancellationToken token) =>
        ReadInstallationsAsync(community, plot, false, token);

    public Task<IReadOnlyList<ElectricityInstallation>> CommonInstallationsAsync(Guid community, Guid point, CancellationToken token) =>
        ReadInstallationsAsync(community, point, true, token);

    private Task<IReadOnlyList<ElectricityInstallation>> ReadInstallationsAsync(Guid community, Guid target, bool common,
        CancellationToken token) =>
        RunAsync<IReadOnlyList<ElectricityInstallation>>(community, async (connection, transaction) =>
        {
            await using var query = Query(connection, transaction, community, """
                SELECT i.id, i.point_id, i.meter_id, m.designation, i.starts_on, i.ends_before,
                    r.reason, r.recorded_at, r.account_id, r.subject_id, m.register_mode,
                    m.model, m.serial_number, i.location, i.mounted_on, i.seal_serial_number, i.reading_multiplier
                FROM community_electricity.accounting_point p
                JOIN community_electricity.installation i ON (i.community_id, i.point_id) = (p.community_id, p.id)
                JOIN community_electricity.meter m ON (m.community_id, m.id) = (i.community_id, i.meter_id)
                LEFT JOIN community_electricity.replacement r ON
                    (r.community_id, r.new_installation_id) = (i.community_id, i.id)
                WHERE p.community_id = @community AND
                    ((@common AND p.plot_id IS NULL AND p.id = @target) OR (NOT @common AND p.plot_id = @target))
                ORDER BY i.starts_on DESC, i.id;
                """);
            query.Parameters.AddWithValue("target", target);
            query.Parameters.AddWithValue("common", common);
            await using var reader = await query.ExecuteReaderAsync(token);
            var installations = new List<ElectricityInstallation>();
            while (await reader.ReadAsync(token))
            {
                installations.Add(new(reader.GetGuid(0), reader.GetGuid(1), reader.GetGuid(2), reader.GetString(3),
                    reader.GetFieldValue<DateOnly>(4), reader.IsDBNull(5) ? null : reader.GetFieldValue<DateOnly>(5),
                    reader.IsDBNull(6) ? null : new(reader.GetString(6), reader.GetDateTime(7), reader.GetGuid(8), reader.GetGuid(9)),
                    reader.GetString(10), ReadDetails(reader, 11)));
            }
            return installations;
        }, token);

    public async Task<ElectricityReplacementResult> ReplaceAsync(Guid community, ElectricityReplacement input,
        DateOnly today, ElectricityActor actor, CancellationToken token)
    {
        var details = input.Details ?? MeterInstallationDetails.Legacy;
        try
        {
            return await RunAsync<ElectricityReplacementResult>(community, async (connection, transaction) =>
            {
                await using var requestLock = Query(connection, transaction, community, """
                    SELECT pg_advisory_xact_lock(hashtextextended(@community::text || ':' || @request::text, 0));
                    """);
                requestLock.Parameters.AddWithValue("request", input.RequestId);
                await requestLock.ExecuteNonQueryAsync(token);

                await using var existing = Query(connection, transaction, community, """
                    SELECT r.old_installation_id, r.effective_on, m.designation, r.reason, r.new_installation_id,
                        m.model, m.serial_number, i.location, i.mounted_on, i.seal_serial_number, i.reading_multiplier
                    FROM community_electricity.replacement r
                    JOIN community_electricity.installation i ON (i.community_id, i.id) = (r.community_id, r.new_installation_id)
                    JOIN community_electricity.meter m ON (m.community_id, m.id) = (i.community_id, i.meter_id)
                    WHERE r.community_id = @community AND r.request_id = @request;
                    """);
                existing.Parameters.AddWithValue("request", input.RequestId);
                await using (var reader = await existing.ExecuteReaderAsync(token))
                {
                    if (await reader.ReadAsync(token))
                        return reader.GetGuid(0) == input.InstallationId && reader.GetFieldValue<DateOnly>(1) == input.EffectiveOn &&
                            reader.GetString(2) == input.Designation && reader.GetString(3) == input.Reason &&
                            ReadDetails(reader, 5) == details
                            ? new(ElectricityReplacementOutcome.Replayed, reader.GetGuid(4)) : new(ElectricityReplacementOutcome.Conflict);
                }

                await using var installation = Query(connection, transaction, community, """
                    SELECT i.point_id, i.starts_on, i.ends_before, m.register_mode FROM community_electricity.installation i
                    JOIN community_electricity.meter m ON (m.community_id, m.id) = (i.community_id, i.meter_id)
                    WHERE i.community_id = @community AND i.id = @old FOR UPDATE OF i;
                    """);
                installation.Parameters.AddWithValue("old", input.InstallationId);
                Guid point;
                string mode;
                await using (var reader = await installation.ExecuteReaderAsync(token))
                {
                    if (!await reader.ReadAsync(token)) return new(ElectricityReplacementOutcome.Missing);
                    if (!reader.IsDBNull(2)) return new(ElectricityReplacementOutcome.Conflict);
                    if (input.EffectiveOn <= reader.GetFieldValue<DateOnly>(1) || input.EffectiveOn > today)
                        return new(ElectricityReplacementOutcome.InvalidDate);
                    point = reader.GetGuid(0);
                    mode = reader.GetString(3);
                }

                await using var readings = Query(connection, transaction, community, """
                    SELECT EXISTS (SELECT 1 FROM community_electricity.reading WHERE community_id = @community
                        AND installation_id = @old AND measured_on >= @date);
                    """);
                readings.Parameters.AddWithValue("old", input.InstallationId);
                readings.Parameters.AddWithValue("date", input.EffectiveOn);
                if (await readings.ExecuteScalarAsync(token) is true) return new(ElectricityReplacementOutcome.ExistingReading);

                await using var replace = Query(connection, transaction, community, """
                    UPDATE community_electricity.installation SET ends_before = @date
                    WHERE community_id = @community AND id = @old;
                    INSERT INTO community_electricity.meter (community_id, id, designation, register_mode, model, serial_number)
                    VALUES (@community, @meter, @designation, @mode, @model, @serial);
                    INSERT INTO community_electricity.installation
                        (community_id, id, point_id, meter_id, starts_on, admission_id, account_id, subject_id, basis,
                         location, mounted_on, seal_serial_number, reading_multiplier)
                    VALUES (@community, @new, @point, @meter, @date, @admission, @account, @subject, @basis,
                        @location, @mounted, @seal, @multiplier);
                    INSERT INTO community_electricity.replacement
                        (community_id, request_id, point_id, old_installation_id, new_installation_id, effective_on,
                         reason, admission_id, account_id, subject_id, basis)
                    VALUES (@community, @request, @point, @old, @new, @date, @reason, @admission, @account, @subject, @basis);
                    """);
                var next = Guid.CreateVersion7();
                replace.Parameters.AddWithValue("old", input.InstallationId);
                replace.Parameters.AddWithValue("new", next);
                replace.Parameters.AddWithValue("point", point);
                replace.Parameters.AddWithValue("meter", Guid.CreateVersion7());
                replace.Parameters.AddWithValue("date", input.EffectiveOn);
                replace.Parameters.AddWithValue("designation", input.Designation);
                replace.Parameters.AddWithValue("mode", mode);
                replace.Parameters.AddWithValue("request", input.RequestId);
                replace.Parameters.AddWithValue("reason", input.Reason);
                BindActor(replace, actor);
                BindDetails(replace, details);
                await replace.ExecuteNonQueryAsync(token);
                return new(ElectricityReplacementOutcome.Replaced, next);
            }, token);
        }
        catch (PostgresException error) when (error.SqlState == PostgresErrorCodes.UniqueViolation &&
            error.TableName is "meter" or "installation" or "replacement")
        {
            return new(ElectricityReplacementOutcome.Conflict);
        }
    }

    public Task<IReadOnlyList<ElectricityPlot>> ListPlotsAsync(Guid community, CancellationToken token) =>
        RunAsync<IReadOnlyList<ElectricityPlot>>(community, async (connection, transaction) =>
        {
            await using var command = Query(connection, transaction, community, """
                SELECT p.id, p.number, i.id, a.id, m.id, m.designation, i.starts_on, m.register_mode,
                    m.model, m.serial_number, i.location, i.mounted_on, i.seal_serial_number, i.reading_multiplier
                FROM community_register.plot p
                LEFT JOIN community_electricity.accounting_point a ON (a.community_id, a.plot_id) = (p.community_id, p.id)
                LEFT JOIN community_electricity.installation i ON (i.community_id, i.point_id) = (a.community_id, a.id)
                    AND i.ends_before IS NULL
                LEFT JOIN community_electricity.meter m ON (m.community_id, m.id) = (i.community_id, i.meter_id)
                WHERE p.community_id = @community ORDER BY p.number, p.id;
                """);
            await using var reader = await command.ExecuteReaderAsync(token);
            var plots = new List<ElectricityPlot>();
            while (await reader.ReadAsync(token))
            {
                plots.Add(new(reader.GetGuid(0), reader.GetString(1), reader.IsDBNull(2) ? null :
                    new(reader.GetGuid(2), reader.GetGuid(3), reader.GetGuid(4), reader.GetString(5),
                        reader.GetFieldValue<DateOnly>(6), RegisterMode: reader.GetString(7), Details: ReadDetails(reader, 8))));
            }
            return plots;
        }, token);

    public Task<IReadOnlyList<CommonElectricityPoint>> ListCommonPointsAsync(Guid community, CancellationToken token) =>
        RunAsync<IReadOnlyList<CommonElectricityPoint>>(community, async (connection, transaction) =>
        {
            await using var command = Query(connection, transaction, community, """
                SELECT id, common_designation, measurement_boundary
                FROM community_electricity.accounting_point
                WHERE community_id = @community AND plot_id IS NULL
                ORDER BY common_designation, id;
                """);
            await using var reader = await command.ExecuteReaderAsync(token);
            var points = new List<CommonElectricityPoint>();
            while (await reader.ReadAsync(token))
                points.Add(new(reader.GetGuid(0), reader.GetString(1), reader.GetString(2)));
            return points;
        }, token);

    public Task<ElectricitySetupOutcome> SetupAsync(Guid community, Guid plot, string designation,
        DateOnly startsOn, ElectricityActor actor, CancellationToken token, string mode = ManualElectricity.Total,
        MeterInstallationDetails? details = null) =>
        SetupPointAsync(community, plot, null, designation, startsOn, actor, token, mode, details ?? MeterInstallationDetails.Legacy);

    public Task<ElectricitySetupOutcome> SetupCommonAsync(Guid community, CommonElectricityPoint point, string designation,
        DateOnly startsOn, ElectricityActor actor, CancellationToken token, string mode, MeterInstallationDetails? details = null) =>
        SetupPointAsync(community, null, point, designation, startsOn, actor, token, mode, details ?? MeterInstallationDetails.Legacy);

    private async Task<ElectricitySetupOutcome> SetupPointAsync(Guid community, Guid? plot, CommonElectricityPoint? common,
        string designation, DateOnly startsOn, ElectricityActor actor, CancellationToken token, string mode,
        MeterInstallationDetails details)
    {
        try
        {
            return await RunAsync(community, async (connection, transaction) =>
            {
                await using var command = Query(connection, transaction, community, """
                    WITH point AS (
                        INSERT INTO community_electricity.accounting_point
                            (community_id, id, plot_id, common_designation, measurement_boundary)
                        SELECT @community, @point, @plot, @common_name, @boundary
                        WHERE @plot IS NULL OR EXISTS (
                            SELECT 1 FROM community_register.plot WHERE community_id = @community AND id = @plot)
                        RETURNING id
                    ), meter AS (
                        INSERT INTO community_electricity.meter (community_id, id, designation, register_mode, model, serial_number)
                        SELECT @community, @meter, @designation, @mode, @model, @serial FROM point RETURNING id
                    )
                    INSERT INTO community_electricity.installation
                        (community_id, id, point_id, meter_id, starts_on, admission_id, account_id, subject_id, basis,
                         location, mounted_on, seal_serial_number, reading_multiplier)
                    SELECT @community, @id, point.id, meter.id, @starts, @admission, @account, @subject, @basis,
                        @location, @mounted, @seal, @multiplier
                    FROM point CROSS JOIN meter;
                    """);
                command.Parameters.AddWithValue("plot", NpgsqlTypes.NpgsqlDbType.Uuid, plot is Guid id ? id : DBNull.Value);
                command.Parameters.AddWithValue("point", common?.Id ?? Guid.CreateVersion7());
                command.Parameters.AddWithValue("common_name", NpgsqlTypes.NpgsqlDbType.Text, (object?)common?.Designation ?? DBNull.Value);
                command.Parameters.AddWithValue("boundary", NpgsqlTypes.NpgsqlDbType.Text, (object?)common?.Boundary ?? DBNull.Value);
                command.Parameters.AddWithValue("meter", Guid.CreateVersion7());
                command.Parameters.AddWithValue("id", Guid.CreateVersion7());
                command.Parameters.AddWithValue("designation", designation);
                command.Parameters.AddWithValue("mode", mode);
                command.Parameters.AddWithValue("starts", startsOn);
                BindActor(command, actor);
                BindDetails(command, details);
                return await command.ExecuteNonQueryAsync(token) == 1 ? ElectricitySetupOutcome.Created : ElectricitySetupOutcome.MissingPlot;
            }, token);
        }
        catch (PostgresException error) when (error.SqlState == PostgresErrorCodes.UniqueViolation &&
            error.TableName is "accounting_point" or "meter")
        {
            return ElectricitySetupOutcome.Conflict;
        }
    }

    public Task<ElectricitySeries?> SeriesAsync(Guid community, Guid installation, CancellationToken token) =>
        RunAsync<ElectricitySeries?>(community, async (connection, transaction) =>
        {
            await using var command = Query(connection, transaction, community, """
                SELECT r.id, r.measured_on, r.value_kwh, r.source, r.recognition_rule, r.recognized_at, r.account_id, r.subject_id,
                    r.channel, i.reading_multiplier
                FROM community_electricity.installation i
                LEFT JOIN community_electricity.reading r ON (r.community_id, r.installation_id) = (i.community_id, i.id)
                WHERE i.community_id = @community AND i.id = @installation
                ORDER BY r.measured_on, r.channel;
                """);
            command.Parameters.AddWithValue("installation", installation);
            await using var reader = await command.ExecuteReaderAsync(token);
            if (!await reader.ReadAsync(token)) return null;
            var multiplier = reader.GetDecimal(9);
            var readings = new List<ElectricityReading>();
            do
            {
                if (!reader.IsDBNull(0))
                    readings.Add(new(reader.GetGuid(0), reader.GetFieldValue<DateOnly>(1), reader.GetDecimal(2),
                        reader.GetString(3), reader.GetString(4), reader.GetDateTime(5), reader.GetGuid(6), reader.GetGuid(7),
                        reader.GetString(8)));
            } while (await reader.ReadAsync(token));
            var intervals = ManualElectricity.Intervals(readings, multiplier);
            return new(readings, intervals, ManualElectricity.Unit, ManualElectricity.CombinedIntervals(intervals));
        }, token);

    public Task<ElectricityRecognition> RecognizeAsync(Guid community, Guid installation, DateOnly date,
        decimal value, DateOnly today, ElectricityActor actor, CancellationToken token, string channel = ManualElectricity.Total) =>
        EvaluateReadingAsync(community, installation, date, value, today, actor, token, channel, ManualElectricity.Source);

    public Task<ElectricityRecognition> PreviewImportAsync(Guid community, ElectricityImportRow row, DateOnly today, CancellationToken token) =>
        EvaluateReadingAsync(community, row.InstallationId, row.MeasuredOn, row.Value, today, null, token, row.Channel, "csv-import");

    public Task<ElectricityRecognition> RecognizeImportAsync(Guid community, ElectricityImportRow row, DateOnly today,
        ElectricityActor actor, CancellationToken token) =>
        EvaluateReadingAsync(community, row.InstallationId, row.MeasuredOn, row.Value, today, actor, token, row.Channel, "csv-import");

    private Task<ElectricityRecognition> EvaluateReadingAsync(Guid community, Guid installation, DateOnly date,
        decimal value, DateOnly today, ElectricityActor? actor, CancellationToken token, string channel, string readingSource) =>
        RunAsync<ElectricityRecognition>(community, async (connection, transaction) =>
        {
            await using var locked = Query(connection, transaction, community, """
                SELECT i.starts_on, i.ends_before, m.register_mode, m.designation FROM community_electricity.installation i
                JOIN community_electricity.meter m ON (m.community_id, m.id) = (i.community_id, i.meter_id)
                WHERE i.community_id = @community AND i.id = @installation
                """ + (actor is null ? ";" : " FOR UPDATE OF i;"));
            locked.Parameters.AddWithValue("installation", installation);
            await using var installationReader = await locked.ExecuteReaderAsync(token);
            if (!await installationReader.ReadAsync(token)) return new(ReadingOutcome.NotFound);
            var meter = installationReader.GetString(3);
            if (!ManualElectricity.SupportsChannel(installationReader.GetString(2), channel))
                return new(ReadingOutcome.UnsupportedChannel, MeterDesignation: meter);
            var starts = installationReader.GetFieldValue<DateOnly>(0);
            DateOnly? endsBefore = installationReader.IsDBNull(1) ? null : installationReader.GetFieldValue<DateOnly>(1);
            await installationReader.DisposeAsync();

            await using var neighbors = Query(connection, transaction, community, """
                SELECT
                    (SELECT id FROM community_electricity.reading
                        WHERE community_id = @community AND installation_id = @installation AND channel = @channel AND measured_on = @date),
                    (SELECT value_kwh FROM community_electricity.reading
                        WHERE community_id = @community AND installation_id = @installation AND channel = @channel AND measured_on = @date),
                    (SELECT value_kwh FROM community_electricity.reading
                        WHERE community_id = @community AND installation_id = @installation AND channel = @channel AND measured_on < @date
                        ORDER BY measured_on DESC LIMIT 1),
                    (SELECT value_kwh FROM community_electricity.reading
                        WHERE community_id = @community AND installation_id = @installation AND channel = @channel AND measured_on > @date
                        ORDER BY measured_on LIMIT 1);
                """);
            BindReading(neighbors, installation, date);
            neighbors.Parameters.AddWithValue("channel", channel);
            await using var reader = await neighbors.ExecuteReaderAsync(token);
            await reader.ReadAsync(token);
            var outcome = ManualElectricity.Evaluate(starts, today, date, value, DecimalOrNull(reader, 1),
                DecimalOrNull(reader, 2), DecimalOrNull(reader, 3), endsBefore);
            if (outcome != ReadingOutcome.Recognized)
                return new(outcome, outcome == ReadingOutcome.AlreadyRecorded ? reader.GetGuid(0) : null, meter);
            if (actor is null) return new(outcome, MeterDesignation: meter);
            await reader.DisposeAsync();

            await using var insert = Query(connection, transaction, community, """
                INSERT INTO community_electricity.reading
                    (community_id, id, installation_id, measured_on, value_kwh, source, recognition_rule,
                     admission_id, account_id, subject_id, basis, channel)
                VALUES (@community, @id, @installation, @date, @value, @source, @rule, @admission, @account, @subject, @basis, @channel);
                """);
            var id = Guid.CreateVersion7();
            BindReading(insert, installation, date);
            BindActor(insert, actor);
            insert.Parameters.AddWithValue("id", id);
            insert.Parameters.AddWithValue("value", value);
            insert.Parameters.AddWithValue("source", readingSource);
            insert.Parameters.AddWithValue("rule", channel == ManualElectricity.Total ? ManualElectricity.Rule : ManualElectricity.DualRule);
            insert.Parameters.AddWithValue("channel", channel);
            await insert.ExecuteNonQueryAsync(token);
            return new(ReadingOutcome.Recognized, id, meter);
        }, token);

    private async Task<T> RunAsync<T>(Guid community, Func<NpgsqlConnection, NpgsqlTransaction, Task<T>> action,
        CancellationToken token)
    {
        await using var connection = await source.OpenConnectionAsync(token);
        await using var transaction = await connection.BeginTransactionAsync(token);
        await PostgresRegisterStore.SetCommunityScopeAsync(connection, transaction, community, token);
        var result = await action(connection, transaction);
        await transaction.CommitAsync(token);
        return result;
    }

    private static NpgsqlCommand Query(NpgsqlConnection connection, NpgsqlTransaction transaction, Guid community, string sql)
    {
        var command = new NpgsqlCommand(sql, connection, transaction);
        command.Parameters.AddWithValue("community", community);
        return command;
    }

    private static void BindActor(NpgsqlCommand command, ElectricityActor actor)
    {
        command.Parameters.AddWithValue("admission", actor.AdmissionId);
        command.Parameters.AddWithValue("account", actor.AccountId);
        command.Parameters.AddWithValue("subject", actor.SubjectId);
        command.Parameters.AddWithValue("basis", actor.Basis);
    }

    private static void BindDetails(NpgsqlCommand command, MeterInstallationDetails details)
    {
        command.Parameters.AddWithValue("model", NpgsqlTypes.NpgsqlDbType.Text, (object?)details.Model ?? DBNull.Value);
        command.Parameters.AddWithValue("serial", NpgsqlTypes.NpgsqlDbType.Text, (object?)details.SerialNumber ?? DBNull.Value);
        command.Parameters.AddWithValue("location", NpgsqlTypes.NpgsqlDbType.Text, (object?)details.Location ?? DBNull.Value);
        command.Parameters.AddWithValue("mounted", NpgsqlTypes.NpgsqlDbType.Date, (object?)details.MountedOn ?? DBNull.Value);
        command.Parameters.AddWithValue("seal", NpgsqlTypes.NpgsqlDbType.Text, (object?)details.SealSerialNumber ?? DBNull.Value);
        command.Parameters.AddWithValue("multiplier", details.Multiplier);
    }

    private static MeterInstallationDetails ReadDetails(NpgsqlDataReader reader, int start) => new(
        ReadOptionalText(reader, start), ReadOptionalText(reader, start + 1), ReadOptionalText(reader, start + 2),
        reader.IsDBNull(start + 3) ? null : reader.GetFieldValue<DateOnly>(start + 3),
        ReadOptionalText(reader, start + 4), reader.GetDecimal(start + 5));

    private static string? ReadOptionalText(NpgsqlDataReader reader, int index) =>
        reader.IsDBNull(index) ? null : reader.GetString(index);

    private static void BindReading(NpgsqlCommand command, Guid installation, DateOnly date)
    {
        command.Parameters.AddWithValue("installation", installation);
        command.Parameters.AddWithValue("date", date);
    }

    private static decimal? DecimalOrNull(NpgsqlDataReader reader, int index) =>
        reader.IsDBNull(index) ? null : reader.GetDecimal(index);
}
