"""Verify the stored result of the synthetic common electricity form scenario."""


def verify(register, platform, community, account, subject, basis, individual_installation):
    common = [row.split('|') for row in register(f"""
        SELECT p.id, i.id, i.admission_id, p.plot_id, p.common_designation, p.measurement_boundary,
            i.starts_on, trim_scale(i.reading_multiplier), m.register_mode, i.account_id, i.subject_id, i.basis
        FROM community_electricity.accounting_point p
        LEFT JOIN community_electricity.installation i ON (i.community_id,i.point_id)=(p.community_id,p.id)
        LEFT JOIN community_electricity.meter m ON (m.community_id,m.id)=(i.community_id,i.meter_id)
        WHERE p.community_id='{community}' AND p.plot_id IS NULL;""").splitlines()]
    if [row[3:] for row in common] != [
        ['', 'Synthetic supply input', 'Synthetic measurement boundary', '2026-01-01',
         '40', 'total', account, subject, basis],
    ]:
        raise RuntimeError('Expected one attributed common point and its installation without a plot')
    point, installation, setup_admission = common[0][:3]

    readings = [row.split('|') for row in register(f"""
        SELECT admission_id, installation_id, measured_on, trim_scale(value_kwh), channel,
            source, account_id, subject_id, basis
        FROM community_electricity.reading WHERE community_id='{community}'
        ORDER BY installation_id, measured_on;""").splitlines()]
    expected_readings = {
        (installation, '2026-01-02', '100'), (installation, '2026-01-03', '103'),
        (individual_installation, '2026-01-02', '2'), (individual_installation, '2026-01-03', '4'),
    }
    if (len(readings) != 4 or {tuple(row[1:4]) for row in readings} != expected_readings
            or any(row[4:] != ['total', 'manual-observation', account, subject, basis] for row in readings)):
        raise RuntimeError('Expected four attributed readings on their own installations')

    admissions = [row.split('|') for row in platform(f"""
        SELECT id, action, target_id, effective_on, register_mode, channel, account_id, subject_id, basis
        FROM platform_provisioning.electricity_admission WHERE community_id='{community}';""").splitlines()]
    if len(admissions) != 7 or any(row[6:] != [account, subject, basis] for row in admissions):
        raise RuntimeError('Unexpected admission count or attribution')
    setup = [row[:6] for row in admissions if row[1] == 'setup-common']
    expected_setup = [setup_admission, 'setup-common', point, '2026-01-01', 'total', '']
    if len(setup) != 2 or expected_setup not in setup:
        raise RuntimeError('Expected the linked setup admission and the conflicting attempt')
    conflict = next(row for row in setup if row != expected_setup)
    if conflict[2] == point or conflict[3:] != expected_setup[3:]:
        raise RuntimeError('Conflicting setup must have its own unconsumed target')

    recorded = {row[0]: ['recognize', row[1], row[2], '', 'total'] for row in readings}
    recognized = {row[0]: row[1:6] for row in admissions if row[1] == 'recognize'}
    if len(recognized) != 5 or any(recognized.get(key) != value for key, value in recorded.items()):
        raise RuntimeError('Reading admission targets or dates do not match')
    replay = next(value for key, value in recognized.items() if key not in recorded)
    if replay != ['recognize', installation, '2026-01-02', '', 'total']:
        raise RuntimeError('Unexpected fifth recognition admission')
