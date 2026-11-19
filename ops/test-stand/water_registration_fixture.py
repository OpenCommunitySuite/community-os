"""Verify the records for water points registered through the synthetic stand forms."""


def verify(register, platform, community, account, subject, basis):
    points = [row.split('|') for row in register(f"""
        SELECT p.id, i.id, i.admission_id, p.designation, plot.number, p.measurement_boundary,
            m.designation, i.starts_on, i.account_id, i.subject_id, i.basis
        FROM community_water.accounting_point p
        LEFT JOIN community_register.plot plot ON (plot.community_id,plot.id)=(p.community_id,p.plot_id)
        LEFT JOIN community_water.installation i ON (i.community_id,i.point_id)=(p.community_id,p.id)
        LEFT JOIN community_water.meter m ON (m.community_id,m.id)=(i.community_id,i.meter_id)
        WHERE p.community_id='{community}' ORDER BY i.starts_on;""").splitlines()]
    if [row[3:] for row in points] != [
        ['Synthetic water supply', '', 'Synthetic water boundary', 'Common meter', '2026-01-01',
         account, subject, basis],
        ['Plot 0', 'Plot 0', '', 'Plot meter', '2026-01-02', account, subject, basis],
    ]:
        raise RuntimeError('Expected one common and one individual water point with their own installations')
    if register(f"SELECT count(*) FROM community_water.meter WHERE community_id='{community}';") != '2':
        raise RuntimeError('Unexpected meter record after conflict or revocation')
    common, individual = points
    readings = [row.split('|') for row in register(f"""
        SELECT admission_id, installation_id, measured_on, trim_scale(value_m3), source, account_id, subject_id, basis
        FROM community_water.reading WHERE community_id='{community}';""").splitlines()]
    expected = {
        (common[1], '2026-01-02', '10'), (common[1], '2026-01-03', '12.5'),
        (individual[1], '2026-01-02', '5'), (individual[1], '2026-01-03', '7'),
    }
    if (len(readings) != 4 or {tuple(row[1:4]) for row in readings} != expected
            or any(row[4:] != ['manual-observation', account, subject, basis] for row in readings)):
        raise RuntimeError('Expected two attributed readings on each water installation')

    admissions = [row.split('|') for row in platform(f"""
        SELECT id, action, target_id, effective_on, account_id, subject_id, basis
        FROM platform_provisioning.water_admission WHERE community_id='{community}';""").splitlines()]
    if len(admissions) != 7 or any(row[4:] != [account, subject, basis] for row in admissions):
        raise RuntimeError('Unexpected admission count or attribution')
    stored = {row[2]: ['setup', row[0], row[7]] for row in points}
    stored.update({row[0]: ['recognize', row[1], row[2]] for row in readings})
    issued = {row[0]: row[1:4] for row in admissions}
    if any(issued.get(key) != value for key, value in stored.items()):
        raise RuntimeError('Installation or reading is missing its dated Platform admission')
    conflict = [value for key, value in issued.items() if key not in stored]
    if (len(conflict) != 1 or conflict[0][0] != 'setup' or conflict[0][2] != '2026-01-03'
            or conflict[0][1] in {row[0] for row in points}):
        raise RuntimeError('Expected one setup conflict with a separate unused target')
