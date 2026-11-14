using CommunityOS.Modules.Community.Application.Electricity;
using Npgsql;

namespace CommunityOS.Modules.Community.Infrastructure;

public sealed record WaterPoint(Guid Id, Guid? PlotId, string Designation, string? Boundary,
    Guid InstallationId, string MeterDesignation, DateOnly StartsOn);
public sealed record WaterSetup(Guid PointId, Guid? PlotId, string Designation, string? Boundary,
    string MeterDesignation, DateOnly StartsOn);
public sealed record WaterReading(Guid Id, DateOnly Date, decimal Value)
{
    public string ValueExact => ManualElectricity.Exact(Value);
}
public sealed record WaterInterval(DateOnly From, DateOnly To, string ValueExact);
public sealed record WaterSeries(IReadOnlyList<WaterReading> Readings, IReadOnlyList<WaterInterval> Intervals, string Unit = "m³");
public sealed record WaterPlot(Guid Id, string Number);

public sealed partial class PostgresWaterStore(NpgsqlDataSource source)
{
    public Task<IReadOnlyList<WaterPlot>> PlotsAsync(Guid community, CancellationToken token) =>
        RunAsync<IReadOnlyList<WaterPlot>>(community, async (connection, transaction) =>
        {
            await using var command = Query(connection, transaction, community, """
                SELECT p.id, p.number FROM community_register.plot p WHERE p.community_id = @community
                AND NOT EXISTS (SELECT 1 FROM community_water.accounting_point w
                    WHERE (w.community_id, w.plot_id) = (p.community_id, p.id))
                ORDER BY p.number, p.id;
                """);
            await using var reader = await command.ExecuteReaderAsync(token);
            var plots = new List<WaterPlot>();
            while (await reader.ReadAsync(token)) plots.Add(new(reader.GetGuid(0), reader.GetString(1)));
            return plots;
        }, token);

    public Task<IReadOnlyList<WaterPoint>> ListAsync(Guid community, CancellationToken token) =>
        RunAsync<IReadOnlyList<WaterPoint>>(community, async (connection, transaction) =>
        {
            await using var command = Query(connection, transaction, community, """
                SELECT p.id, p.plot_id, p.designation, p.measurement_boundary, i.id, m.designation, i.starts_on
                FROM community_water.accounting_point p
                JOIN community_water.installation i ON (i.community_id, i.point_id) = (p.community_id, p.id)
                JOIN community_water.meter m ON (m.community_id, m.id) = (i.community_id, i.meter_id)
                WHERE p.community_id = @community ORDER BY p.designation, p.id;
                """);
            await using var reader = await command.ExecuteReaderAsync(token);
            var points = new List<WaterPoint>();
            while (await reader.ReadAsync(token))
                points.Add(new(reader.GetGuid(0), reader.IsDBNull(1) ? null : reader.GetGuid(1), reader.GetString(2),
                    reader.IsDBNull(3) ? null : reader.GetString(3), reader.GetGuid(4), reader.GetString(5),
                    reader.GetFieldValue<DateOnly>(6)));
            return points;
        }, token);

    public async Task<ElectricitySetupOutcome> SetupAsync(Guid community, WaterSetup setup, ElectricityActor actor,
        CancellationToken token)
    {
        try
        {
            return await RunAsync(community, async (connection, transaction) =>
            {
                await using var command = Query(connection, transaction, community, """
                    WITH point AS (
                        INSERT INTO community_water.accounting_point
                            (community_id, id, plot_id, designation, measurement_boundary)
                        SELECT @community, @point, @plot, coalesce(p.number, @designation), @boundary
                        FROM (SELECT 1) input LEFT JOIN community_register.plot p
                            ON p.community_id = @community AND p.id = @plot
                        WHERE @plot IS NULL OR p.id IS NOT NULL
                        RETURNING id
                    ), meter AS (
                        INSERT INTO community_water.meter (community_id, id, designation)
                        SELECT @community, @meter, @meter_name FROM point RETURNING id
                    )
                    INSERT INTO community_water.installation
                        (community_id, id, point_id, meter_id, starts_on, admission_id, account_id, subject_id, basis)
                    SELECT @community, @installation, point.id, meter.id, @date, @admission, @account, @subject, @basis
                    FROM point CROSS JOIN meter;
                    """);
                command.Parameters.AddWithValue("point", setup.PointId);
                command.Parameters.AddWithValue("plot", NpgsqlTypes.NpgsqlDbType.Uuid, (object?)setup.PlotId ?? DBNull.Value);
                command.Parameters.AddWithValue("designation", setup.Designation);
                command.Parameters.AddWithValue("boundary", NpgsqlTypes.NpgsqlDbType.Text, (object?)setup.Boundary ?? DBNull.Value);
                command.Parameters.AddWithValue("meter", Guid.CreateVersion7());
                command.Parameters.AddWithValue("meter_name", setup.MeterDesignation);
                command.Parameters.AddWithValue("installation", Guid.CreateVersion7());
                command.Parameters.AddWithValue("date", setup.StartsOn);
                BindActor(command, actor);
                return await command.ExecuteNonQueryAsync(token) == 1
                    ? ElectricitySetupOutcome.Created : ElectricitySetupOutcome.MissingPlot;
            }, token);
        }
        catch (PostgresException error) when (error.SqlState == PostgresErrorCodes.UniqueViolation)
        {
            return ElectricitySetupOutcome.Conflict;
        }
    }

    public Task<WaterSeries?> SeriesAsync(Guid community, Guid installation, CancellationToken token) =>
        RunAsync<WaterSeries?>(community, async (connection, transaction) =>
        {
            await using var command = Query(connection, transaction, community, """
                SELECT r.id, r.measured_on, r.value_m3 FROM community_water.installation i
                LEFT JOIN community_water.reading r ON (r.community_id, r.installation_id) = (i.community_id, i.id)
                WHERE i.community_id = @community AND i.id = @installation ORDER BY r.measured_on;
                """);
            command.Parameters.AddWithValue("installation", installation);
            await using var reader = await command.ExecuteReaderAsync(token);
            if (!await reader.ReadAsync(token)) return null;
            var readings = new List<WaterReading>();
            do
            {
                if (!reader.IsDBNull(0)) readings.Add(new(reader.GetGuid(0), reader.GetFieldValue<DateOnly>(1), reader.GetDecimal(2)));
            } while (await reader.ReadAsync(token));
            var intervals = readings.Zip(readings.Skip(1), (before, after) =>
                new WaterInterval(before.Date, after.Date, ManualElectricity.Exact(after.Value - before.Value))).ToArray();
            return new(readings, intervals);
        }, token);

    public Task<ElectricityRecognition> RecognizeAsync(Guid community, Guid installation, DateOnly date, decimal value,
        DateOnly today, ElectricityActor actor, CancellationToken token) =>
        RunAsync<ElectricityRecognition>(community, async (connection, transaction) =>
        {
            await using var locked = Query(connection, transaction, community, """
                SELECT starts_on FROM community_water.installation
                WHERE community_id = @community AND id = @installation FOR UPDATE;
                """);
            locked.Parameters.AddWithValue("installation", installation);
            await using var installationReader = await locked.ExecuteReaderAsync(token);
            if (!await installationReader.ReadAsync(token)) return new(ReadingOutcome.NotFound);
            var starts = installationReader.GetFieldValue<DateOnly>(0);
            await installationReader.DisposeAsync();

            await using var neighbors = Query(connection, transaction, community, """
                WITH series AS (
                    SELECT id, measured_on, value_m3 FROM community_water.reading
                    WHERE community_id = @community AND installation_id = @installation
                )
                SELECT (SELECT id FROM series WHERE measured_on = @date),
                    (SELECT value_m3 FROM series WHERE measured_on = @date),
                    (SELECT value_m3 FROM series WHERE measured_on < @date ORDER BY measured_on DESC LIMIT 1),
                    (SELECT value_m3 FROM series WHERE measured_on > @date ORDER BY measured_on LIMIT 1);
                """);
            neighbors.Parameters.AddWithValue("installation", installation);
            neighbors.Parameters.AddWithValue("date", date);
            await using var reader = await neighbors.ExecuteReaderAsync(token);
            await reader.ReadAsync(token);
            var outcome = ManualElectricity.Evaluate(starts, today, date, value,
                ReadValue(reader, 1), ReadValue(reader, 2), ReadValue(reader, 3));
            if (outcome != ReadingOutcome.Recognized)
                return new(outcome, outcome == ReadingOutcome.AlreadyRecorded ? reader.GetGuid(0) : null);
            await reader.DisposeAsync();

            await using var insert = Query(connection, transaction, community, """
                INSERT INTO community_water.reading (community_id, id, installation_id, measured_on, value_m3,
                    source, recognition_rule, admission_id, account_id, subject_id, basis)
                VALUES (@community, @id, @installation, @date, @value, 'manual-observation', 'manual-water-daily-v1',
                    @admission, @account, @subject, @basis);
                """);
            var id = Guid.CreateVersion7();
            insert.Parameters.AddWithValue("id", id);
            insert.Parameters.AddWithValue("installation", installation);
            insert.Parameters.AddWithValue("date", date);
            insert.Parameters.AddWithValue("value", value);
            BindActor(insert, actor);
            await insert.ExecuteNonQueryAsync(token);
            return new(outcome, id);
        }, token);

    private async Task<T> RunAsync<T>(Guid community, Func<NpgsqlConnection, NpgsqlTransaction, Task<T>> action, CancellationToken token)
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

    private static decimal? ReadValue(NpgsqlDataReader reader, int index) =>
        reader.IsDBNull(index) ? null : reader.GetDecimal(index);
}
