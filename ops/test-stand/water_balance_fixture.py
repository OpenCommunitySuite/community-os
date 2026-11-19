"""Deterministic facts for balance acceptance in a new synthetic community."""

import uuid


def seed(sql, community, account, subject, *, root_replacement=False):
    rows = sql(f"""SELECT p.id,p.designation,i.id FROM community_water.accounting_point p
        JOIN community_water.installation i ON (i.community_id,i.point_id)=(p.community_id,p.id)
        WHERE p.community_id='{community}';""").splitlines()
    points = {}
    for row in rows:
        point, designation, installation = row.split('|')
        points[designation] = (str(uuid.UUID(point)), str(uuid.UUID(installation)))
    if set(points) != {'Root', 'Street', 'Water 0', 'Water 1'}:
        raise RuntimeError('Unexpected balance fixture points')
    root, street, leaf, other = (points[name][0] for name in ('Root', 'Street', 'Water 0', 'Water 1'))
    commands = ['BEGIN;']
    for date, placements in (
        ('2026-01-01', [(root, None), (street, root), (leaf, street), (other, root)]),
        ('2026-01-04', [(root, None), (leaf, root), (other, root)]),
    ):
        commands.append(f"""INSERT INTO community_water.topology_revision
            (community_id,starts_on,admission_id,account_id,subject_id,basis)
            VALUES ('{community}','{date}',gen_random_uuid(),'{account}','{subject}','Synthetic fixture');""")
        for point, parent in placements:
            parent_sql = f"'{parent}'" if parent else 'NULL'
            commands.append(f"INSERT INTO community_water.topology_point VALUES ('{community}','{date}','{point}',{parent_sql});")
    values = {
        'Root': [(1, 0), (2, 10), (3, 20), (4, 30), (5, 30), (6, 31), (7, 33)],
        'Street': [(1, 0), (2, 6), (3, 12)],
        'Water 0': [(1, 0), (2, 4), (3, 8), (4, 10), (5, 10), (6, 12)],
        'Water 1': [(1, 0), (2, 3), (4, 10), (5, 10), (6, 11), (7, 12)],
    }
    if root_replacement:
        values['Root'].pop()
        values['Water 0'].extend([(7, 13), (8, 15)])
        values['Water 1'].append((8, 13))

    def reading(installation, day, value):
        return f"""INSERT INTO community_water.reading
            (community_id,id,installation_id,measured_on,value_m3,source,recognition_rule,admission_id,account_id,subject_id,basis)
            VALUES ('{community}',gen_random_uuid(),'{installation}','2026-01-{day:02d}',{value},
                'manual-observation','synthetic-fixture',gen_random_uuid(),'{account}','{subject}','Synthetic fixture');"""
    for name, readings in values.items():
        commands.extend(reading(points[name][1], day, value) for day, value in readings)
    if root_replacement:
        sql('\n'.join(commands + ['COMMIT;']))
        return
    old = points['Water 0'][1]
    meter, new = str(uuid.uuid4()), str(uuid.uuid4())
    commands.extend([
        f"UPDATE community_water.installation SET ends_before='2026-01-07' WHERE community_id='{community}' AND id='{old}';",
        f"INSERT INTO community_water.meter (community_id,id,designation) VALUES ('{community}','{meter}','Synthetic replacement');",
        f"""INSERT INTO community_water.installation
            (community_id,id,point_id,meter_id,starts_on,admission_id,account_id,subject_id,basis)
            VALUES ('{community}','{new}','{leaf}','{meter}','2026-01-07',gen_random_uuid(),'{account}','{subject}','Synthetic fixture');""",
        f"""INSERT INTO community_water.replacement
            (community_id,request_id,point_id,old_installation_id,new_installation_id,effective_on,reason,admission_id,account_id,subject_id,basis)
            VALUES ('{community}',gen_random_uuid(),'{leaf}','{old}','{new}','2026-01-07','Synthetic fixture',gen_random_uuid(),'{account}','{subject}','Synthetic fixture');""",
        reading(new, 7, 0),
        'COMMIT;',
    ])
    sql('\n'.join(commands))


def verify_root_replacement(register, platform, community, account, subject, basis):
    replacement = register(f"""SELECT r.admission_id, r.old_installation_id, r.new_installation_id, r.request_id
        FROM community_water.replacement r
        JOIN community_water.accounting_point p ON (p.community_id,p.id)=(r.community_id,r.point_id)
        WHERE r.community_id='{community}' AND p.designation='Root' AND r.effective_on='2026-01-07'
          AND r.account_id='{account}' AND r.subject_id='{subject}' AND r.basis='{basis}';""").splitlines()
    if len(replacement) != 1 or register(
        f"SELECT count(*) FROM community_water.replacement WHERE community_id='{community}';"
    ) != '1':
        raise RuntimeError('Expected one attributed replacement of the root meter')
    admission, old, new, request = replacement[0].split('|')

    readings = [row.split('|') for row in register(f"""SELECT admission_id, installation_id, measured_on,
          trim_scale(value_m3), source, account_id, subject_id, basis
        FROM community_water.reading WHERE community_id='{community}' AND basis <> 'Synthetic fixture'
        ORDER BY measured_on;""").splitlines()]
    expected_readings = [
        [new, '2026-01-07', '100', 'manual-observation', account, subject, basis],
        [new, '2026-01-08', '104', 'manual-observation', account, subject, basis],
    ]
    if [row[1:] for row in readings] != expected_readings:
        raise RuntimeError('Unexpected new root readings or attribution')

    admissions = [row.split('|') for row in platform(f"""SELECT id, action, target_id, effective_on, request_id,
          account_id, subject_id, basis FROM platform_provisioning.water_admission
        WHERE community_id='{community}' ORDER BY action, effective_on;""").splitlines()]
    expected_admissions = [
        [readings[0][0], 'recognize', new, '2026-01-07', '', account, subject, basis],
        [readings[1][0], 'recognize', new, '2026-01-08', '', account, subject, basis],
        [admission, 'replace', old, '2026-01-07', request, account, subject, basis],
    ]
    if admissions != expected_admissions:
        raise RuntimeError('Root replacement or readings do not match their Platform admissions')
