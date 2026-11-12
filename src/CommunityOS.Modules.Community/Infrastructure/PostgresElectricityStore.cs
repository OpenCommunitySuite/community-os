using CommunityOS.Modules.Community.Application.Electricity;
using Npgsql;

namespace CommunityOS.Modules.Community.Infrastructure;

public sealed record ElectricityActor(Guid AccountId, Guid SubjectId, Guid AdmissionId, string Basis);
public sealed record ElectricityInstallation(Guid Id, Guid PointId, Guid MeterId, string MeterDesignation, DateOnly StartsOn);
public sealed record ElectricityPlot(Guid Id, string Number, ElectricityInstallation? Installation);
public sealed record ElectricitySeries(IReadOnlyList<ElectricityReading> Readings, IReadOnlyList<ElectricityInterval> Intervals,
    string Unit);
public sealed record ElectricityRecognition(ReadingOutcome Outcome, Guid? ReadingId = null);
public enum ElectricitySetupOutcome { Created, MissingPlot, Conflict }

public sealed class PostgresElectricityStore(NpgsqlDataSource source)
{
    public Task<IReadOnlyList<ElectricityPlot>> ListPlotsAsync(Guid community, CancellationToken token) =>
        RunAsync<IReadOnlyList<ElectricityPlot>>(community, async (connection, transaction) =>
        {
            await using var command = Query(connection, transaction, community, """
                SELECT p.id, p.number, i.id, a.id, m.id, m.designation, i.starts_on
                FROM community_register.plot p
                LEFT JOIN community_electricity.accounting_point a ON (a.community_id, a.plot_id) = (p.community_id, p.id)
                LEFT JOIN community_electricity.installation i ON (i.community_id, i.point_id) = (a.community_id, a.id)
                LEFT JOIN community_electricity.meter m ON (m.community_id, m.id) = (i.community_id, i.meter_id)
                WHERE p.community_id = @community ORDER BY p.number, p.id;
                """);
            await using var reader = await command.ExecuteReaderAsync(token);
            var plots = new List<ElectricityPlot>();
            while (await reader.ReadAsync(token))
            {
                plots.Add(new(reader.GetGuid(0), reader.GetString(1), reader.IsDBNull(2) ? null :
                    new(reader.GetGuid(2), reader.GetGuid(3), reader.GetGuid(4), reader.GetString(5), reader.GetFieldValue<DateOnly>(6))));
            }
            return plots;
        }, token);

    public async Task<ElectricitySetupOutcome> SetupAsync(Guid community, Guid plot, string designation,
        DateOnly startsOn, ElectricityActor actor, CancellationToken token)
    {
        try
        {
            return await RunAsync(community, async (connection, transaction) =>
            {
                await using var command = Query(connection, transaction, community, """
                    WITH point AS (
                        INSERT INTO community_electricity.accounting_point (community_id, id, plot_id)
                        SELECT @community, @point, p.id FROM community_register.plot p
                        WHERE p.community_id = @community AND p.id = @plot RETURNING id
                    ), meter AS (
                        INSERT INTO community_electricity.meter (community_id, id, designation)
                        SELECT @community, @meter, @designation FROM point RETURNING id
                    )
                    INSERT INTO community_electricity.installation
                        (community_id, id, point_id, meter_id, starts_on, admission_id, account_id, subject_id, basis)
                    SELECT @community, @id, point.id, meter.id, @starts, @admission, @account, @subject, @basis
                    FROM point CROSS JOIN meter;
                    """);
                command.Parameters.AddWithValue("plot", plot);
                command.Parameters.AddWithValue("point", Guid.CreateVersion7());
                command.Parameters.AddWithValue("meter", Guid.CreateVersion7());
                command.Parameters.AddWithValue("id", Guid.CreateVersion7());
                command.Parameters.AddWithValue("designation", designation);
                command.Parameters.AddWithValue("starts", startsOn);
                BindActor(command, actor);
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
                SELECT r.id, r.measured_on, r.value_kwh, r.source, r.recognition_rule, r.recognized_at, r.account_id, r.subject_id
                FROM community_electricity.installation i
                LEFT JOIN community_electricity.reading r ON (r.community_id, r.installation_id) = (i.community_id, i.id)
                WHERE i.community_id = @community AND i.id = @installation
                ORDER BY r.measured_on;
                """);
            command.Parameters.AddWithValue("installation", installation);
            await using var reader = await command.ExecuteReaderAsync(token);
            if (!await reader.ReadAsync(token)) return null;
            var readings = new List<ElectricityReading>();
            do
            {
                if (!reader.IsDBNull(0))
                    readings.Add(new(reader.GetGuid(0), reader.GetFieldValue<DateOnly>(1), reader.GetDecimal(2),
                        reader.GetString(3), reader.GetString(4), reader.GetDateTime(5), reader.GetGuid(6), reader.GetGuid(7)));
            } while (await reader.ReadAsync(token));
            return new(readings, ManualElectricity.Intervals(readings), ManualElectricity.Unit);
        }, token);

    public Task<ElectricityRecognition> RecognizeAsync(Guid community, Guid installation, DateOnly date,
        decimal value, DateOnly today, ElectricityActor actor, CancellationToken token) =>
        RunAsync<ElectricityRecognition>(community, async (connection, transaction) =>
        {
            await using var locked = Query(connection, transaction, community, """
                SELECT starts_on FROM community_electricity.installation
                WHERE community_id = @community AND id = @installation FOR UPDATE;
                """);
            locked.Parameters.AddWithValue("installation", installation);
            await using var installationReader = await locked.ExecuteReaderAsync(token);
            if (!await installationReader.ReadAsync(token)) return new(ReadingOutcome.NotFound);
            var starts = installationReader.GetFieldValue<DateOnly>(0);
            await installationReader.DisposeAsync();

            await using var neighbors = Query(connection, transaction, community, """
                SELECT
                    (SELECT id FROM community_electricity.reading
                        WHERE community_id = @community AND installation_id = @installation AND measured_on = @date),
                    (SELECT value_kwh FROM community_electricity.reading
                        WHERE community_id = @community AND installation_id = @installation AND measured_on = @date),
                    (SELECT value_kwh FROM community_electricity.reading
                        WHERE community_id = @community AND installation_id = @installation AND measured_on < @date
                        ORDER BY measured_on DESC LIMIT 1),
                    (SELECT value_kwh FROM community_electricity.reading
                        WHERE community_id = @community AND installation_id = @installation AND measured_on > @date
                        ORDER BY measured_on LIMIT 1);
                """);
            BindReading(neighbors, installation, date);
            await using var reader = await neighbors.ExecuteReaderAsync(token);
            await reader.ReadAsync(token);
            var outcome = ManualElectricity.Evaluate(starts, today, date, value, DecimalOrNull(reader, 1),
                DecimalOrNull(reader, 2), DecimalOrNull(reader, 3));
            if (outcome != ReadingOutcome.Recognized)
                return new(outcome, outcome == ReadingOutcome.AlreadyRecorded ? reader.GetGuid(0) : null);
            await reader.DisposeAsync();

            await using var insert = Query(connection, transaction, community, """
                INSERT INTO community_electricity.reading
                    (community_id, id, installation_id, measured_on, value_kwh, source, recognition_rule,
                     admission_id, account_id, subject_id, basis)
                VALUES (@community, @id, @installation, @date, @value, @source, @rule, @admission, @account, @subject, @basis);
                """);
            var id = Guid.CreateVersion7();
            BindReading(insert, installation, date);
            BindActor(insert, actor);
            insert.Parameters.AddWithValue("id", id);
            insert.Parameters.AddWithValue("value", value);
            insert.Parameters.AddWithValue("source", ManualElectricity.Source);
            insert.Parameters.AddWithValue("rule", ManualElectricity.Rule);
            await insert.ExecuteNonQueryAsync(token);
            return new(ReadingOutcome.Recognized, id);
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

    private static void BindReading(NpgsqlCommand command, Guid installation, DateOnly date)
    {
        command.Parameters.AddWithValue("installation", installation);
        command.Parameters.AddWithValue("date", date);
    }

    private static decimal? DecimalOrNull(NpgsqlDataReader reader, int index) =>
        reader.IsDBNull(index) ? null : reader.GetDecimal(index);
}
