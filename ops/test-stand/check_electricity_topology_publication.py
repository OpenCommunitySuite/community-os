"""Exercise isolated synthetic resource writes through the UI and revoke their grant."""

import argparse
from contextlib import contextmanager
import hashlib
import os
from pathlib import Path
import queue
import re
import secrets
import subprocess
import sys
import threading
import time
import uuid

sys.dont_write_bytecode = True
import stand


@contextmanager
def hold_installation(docker, postgres, database, community, installation, schema):
    """Hold a synthetic installation and identify the blocking session."""
    exec_id = docker.exec_id(postgres, [
        'psql', '-X', '-qAt', '-v', 'ON_ERROR_STOP=1', '-U', stand.MIGRATOR, '-d', database,
    ], stdin=True)
    sock, stream = docker.hijack(exec_id)
    with sock, stream:
        sock.settimeout(8)
        sock.sendall(f"""
            BEGIN;
            SET LOCAL lock_timeout = '3s';
            SET LOCAL idle_in_transaction_session_timeout = '25s';
            SELECT 'LOCKED|' || pg_backend_pid() FROM {schema}.installation
              WHERE community_id='{community}' AND id='{installation}' FOR UPDATE;
        """.encode())
        output = b''
        frames = stand.frames(stream)
        try:
            for channel, data in frames:
                if channel == 1:
                    output += data
                    locked = re.search(rb'LOCKED\|(\d+)\n', output)
                    if locked:
                        break
            else:
                raise RuntimeError('Synthetic installation lock was not acquired')
            yield int(locked[1])
        finally:
            sock.sendall(b'ROLLBACK;\n\\q\n')
            for _ in frames:
                pass
    if docker.call('GET', f'/exec/{exec_id}/json')['ExitCode'] != 0:
        raise RuntimeError('Synthetic installation lock session failed')


def wait_for_water_writes(sql, database, holder, expected):
    deadline = time.monotonic() + 6
    while time.monotonic() < deadline:
        waiting = sql(database, f"""
            WITH RECURSIVE blocked(pid) AS (
                SELECT {holder}
                UNION
                SELECT activity.pid FROM pg_stat_activity activity
                JOIN blocked ON blocked.pid = ANY(pg_blocking_pids(activity.pid))
                WHERE activity.datname = current_database() AND activity.wait_event_type = 'Lock'
            )
            SELECT CASE WHEN activity.query LIKE '%FOR UPDATE OF i%' THEN 'replace'
                        WHEN activity.query LIKE '%SELECT starts_on, ends_before%' THEN 'recognize'
                        ELSE 'unexpected' END
            FROM blocked JOIN pg_stat_activity activity USING (pid)
            WHERE pid <> {holder} AND activity.query LIKE '%community_water.installation%';
        """).splitlines()
        if sorted(waiting) == sorted(expected):
            return
        if any(action not in expected for action in waiting) or len(waiting) > len(expected):
            raise RuntimeError('Unexpected writes waiting on synthetic water installation')
        time.sleep(0.1)
    raise RuntimeError('Expected writes did not wait on synthetic water installation')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--image', required=True)
    parser.add_argument('--template-container', required=True)
    parser.add_argument('--login', required=True)
    parser.add_argument('--node', required=True)
    parser.add_argument('--screenshot', type=Path, required=True)
    water_races = {
        'water-import-race-import-first': 'recognize',
        'water-import-race-replacement-first': 'replace',
    }
    parser.add_argument('--scenario', choices=['topology', 'forest-replacement', 'installation-history', 'common-electricity', 'manual-readings', 'dual-readings', 'replacement', 'csv-import', 'csv-import-history', 'csv-import-dual', 'csv-import-revocation', 'water-readings', 'water-replacement', 'water-import', 'water-import-history', 'water-import-revocation', 'water-topology', 'water-balance', 'water-root-replacement-balance', 'water-verification', 'water-verification-history', *water_races], default='topology')
    args = parser.parse_args()
    dual_import = args.scenario == 'csv-import-dual'
    dual = args.scenario == 'dual-readings' or dual_import
    forest_replacement = args.scenario == 'forest-replacement'
    installation_history = args.scenario == 'installation-history'
    common_electricity = args.scenario == 'common-electricity'
    replacement = args.scenario == 'replacement'
    electricity_import_history = args.scenario == 'csv-import-history'
    csv_revocation = args.scenario in ('csv-import-revocation', 'water-import-revocation')
    csv_import = args.scenario in ('csv-import', 'csv-import-history', 'csv-import-dual', 'csv-import-revocation')
    water_replacement = args.scenario == 'water-replacement'
    import_history = args.scenario == 'water-import-history'
    water_race_order = water_races.get(args.scenario)
    water_import = water_race_order is not None or args.scenario in ('water-import', 'water-import-history', 'water-import-revocation')
    water_topology = args.scenario == 'water-topology'
    water_balance = args.scenario == 'water-balance'
    water_root_balance = args.scenario == 'water-root-replacement-balance'
    verification_history = args.scenario == 'water-verification-history'
    water_verification = args.scenario in ('water-verification', 'water-verification-history')
    water = args.scenario.startswith('water-')
    reading_schema = 'community_water' if water else 'community_electricity'
    manual = args.scenario not in ('topology', 'forest-replacement')
    grant_column = 'electricity_recognition_basis' if manual else 'topology_publication_basis'
    basis = 'Synthetic manual reading acceptance' if manual else 'Synthetic topology acceptance'
    if forest_replacement:
        basis = 'Synthetic forest replacement acceptance'
    if dual:
        basis = 'Synthetic dual reading acceptance'
    if replacement:
        grant_column = 'electricity_replacement_basis'
        basis = 'Synthetic replacement acceptance'
    if installation_history:
        grant_column = 'electricity_replacement_basis'
        basis = 'Synthetic installation history'
    if common_electricity:
        grant_column = 'common_electricity_setup_basis'
        basis = 'Synthetic common electricity registration'
    if csv_import:
        basis = 'Synthetic CSV acceptance'
    if water:
        grant_column = 'water_recognition_basis'
        basis = 'Synthetic water reading acceptance'
    if water_replacement:
        grant_column = 'water_replacement_basis'
        basis = 'Synthetic water replacement acceptance'
    if water_import:
        basis = 'Synthetic water CSV acceptance'
    if water_topology:
        grant_column = 'water_setup_basis'
        basis = 'Synthetic water topology acceptance'
    if water_balance:
        basis = 'Synthetic water balance acceptance'
    if water_root_balance:
        basis = 'Synthetic water root replacement balance'
    if water_verification:
        grant_column = 'water_verification_basis'
        basis = 'Synthetic water verification acceptance'
    if not re.fullmatch(r'communityos-test-stand:[a-zA-Z0-9_.-]+', args.image):
        parser.error('Use a synthetic stand image')
    if not args.template_container.startswith('communityos-test-stand-') or not re.fullmatch(r'[a-zA-Z0-9_-]+', args.login):
        parser.error('Use a synthetic template and login')
    if args.screenshot.resolve().is_relative_to(stand.ROOT):
        parser.error('Keep screenshots outside the repository')
    docker = stand.Docker(23750)
    template = docker.call('GET', f'/containers/{args.template_container}/json')
    environment = template['Config']['Env']
    if not (template['Config'].get('Labels', {}).get(stand.LABEL, '').startswith('communityos-test-stand')
            and 'CommunityRegister__SyntheticStandEnabled=true' in environment):
        raise RuntimeError('Template is not a labelled synthetic stand')
    def database(key):
        connection = next(value.split('=', 1)[1] for value in environment if value.startswith(key + '='))
        name = re.search(r'(?:^|;)Database=([^;]+)', connection, re.IGNORECASE).group(1)
        if not re.fullmatch(r'communityos_[a-zA-Z0-9_]+', name):
            raise RuntimeError('Unexpected synthetic database')
        return name
    platform, register = database('Platform__Database'), database('CommunityRegister__Database')
    postgres = 'communityos-test-stand-postgres'
    def sql(db, command):
        return stand.psql(docker, postgres, db, command, private=True)
    account = sql(platform, f"SELECT id FROM platform_provisioning.platform_account WHERE login='{args.login}' AND disabled_at IS NULL;")
    account = str(uuid.UUID(account))
    community, subject = str(uuid.uuid4()), str(uuid.uuid4())
    # A new community per run: never modify a pre-existing community or its grants.
    sql(platform, f"""
        BEGIN;
        INSERT INTO platform_provisioning.community_reservation
          (operation_id,community_id,creator_account_id,request_id,initial_administrator_account_id,display_name)
          VALUES (gen_random_uuid(),'{community}','{account}',gen_random_uuid(),'{account}','{basis}');
        INSERT INTO platform_provisioning.register_availability
          (community_id,community_active,register_enabled,electricity_enabled,water_enabled)
          VALUES ('{community}',true,true,{str(not water).lower()},{str(water).lower()});
        INSERT INTO platform_provisioning.register_operator
          (community_id,account_id,subject_id,linked,can_read,can_read_electricity,can_recognize_electricity,can_read_water,{grant_column})
          VALUES ('{community}','{account}','{subject}',true,true,{str(not water).lower()},{str(manual and not water and not installation_history).lower()},{str(water).lower()},NULL);
        COMMIT;
    """)
    commands = ['BEGIN;']
    if water_topology or water_balance or water_root_balance:
        for label in ('Root', 'Street'):
            point, meter = str(uuid.uuid4()), str(uuid.uuid4())
            commands.extend([
                f"INSERT INTO community_water.accounting_point (community_id,id,designation,measurement_boundary) VALUES ('{community}','{point}','{label}','Synthetic boundary');",
                f"INSERT INTO community_water.meter (community_id,id,designation) VALUES ('{community}','{meter}','{label} meter');",
                f"INSERT INTO community_water.installation (community_id,id,point_id,meter_id,starts_on,admission_id,account_id,subject_id,basis) VALUES ('{community}',gen_random_uuid(),'{point}','{meter}','2026-01-01',gen_random_uuid(),'{account}','{subject}','Synthetic fixture');",
            ])
    first_installation = str(uuid.uuid4())
    for index in range(1 if installation_history or common_electricity else 3):
        installation = first_installation if index == 0 else str(uuid.uuid4())
        if water:
            if index == 2:
                continue
            plot, point, meter = (str(uuid.uuid4()) for _ in range(3))
            commands.extend([
                f"INSERT INTO community_register.plot VALUES ('{community}','{plot}','Plot {index}');",
                f"INSERT INTO community_water.accounting_point (community_id,id,plot_id,designation) VALUES ('{community}','{point}','{plot}','Water {index}');",
                f"INSERT INTO community_water.meter (community_id,id,designation) VALUES ('{community}','{meter}','Meter {index}');",
                f"INSERT INTO community_water.installation (community_id,id,point_id,meter_id,starts_on,admission_id,account_id,subject_id,basis) VALUES ('{community}','{installation}','{point}','{meter}','2026-01-01',gen_random_uuid(),'{account}','{subject}','Synthetic fixture');",
            ])
            continue
        if installation_history:
            commands.append(f"INSERT INTO community_register.plot VALUES ('{community}',gen_random_uuid(),'Plot 0');")
            continue
        if not common_electricity:
            for label in (f'Root {index}', f'Street {index}'):
                commands.append(f"INSERT INTO community_electricity.accounting_point (community_id,id,common_designation,measurement_boundary) VALUES ('{community}',gen_random_uuid(),'{label}','Synthetic boundary');")
        plot, point, meter = (str(uuid.uuid4()) for _ in range(3))
        commands.extend([
            f"INSERT INTO community_register.plot VALUES ('{community}','{plot}','Plot {index}');",
            f"INSERT INTO community_electricity.accounting_point (community_id,id,plot_id) VALUES ('{community}','{point}','{plot}');",
            f"INSERT INTO community_electricity.meter (community_id,id,designation,register_mode) VALUES ('{community}','{meter}','Meter {index}','{'dual' if dual else 'total'}');",
            f"INSERT INTO community_electricity.installation (community_id,id,point_id,meter_id,starts_on,admission_id,account_id,subject_id,basis,reading_multiplier) VALUES ('{community}','{installation}','{point}','{meter}','2026-01-01',gen_random_uuid(),'{account}','{subject}','Synthetic fixture',{40 if manual else 1});",
        ])
    sql(register, '\n'.join(commands + ['COMMIT;']))
    def balance_fingerprint():
        tables = ('accounting_point', 'topology_revision', 'topology_point')
        if not water_root_balance:
            tables += ('installation', 'replacement')
        parts = [f"SELECT to_jsonb(t)::text AS value FROM community_water.{table} t WHERE community_id='{community}'" for table in tables]
        reading_filter = " AND basis='Synthetic fixture'" if water_root_balance else ''
        parts.append(f"SELECT to_jsonb(t)::text AS value FROM community_water.reading t WHERE community_id='{community}'{reading_filter}")
        parts = ' UNION ALL '.join(parts)
        return sql(register, f"SELECT md5(string_agg(value,'|' ORDER BY value)) FROM ({parts}) records;")
    if water_balance or water_root_balance:
        from water_balance_fixture import seed
        seed(lambda command: sql(register, command), community, account, subject, root_replacement=water_root_balance)
        fingerprint = balance_fingerprint()
    prefix = 'communityos-test-stand-topology-' + secrets.token_hex(4)
    name = prefix + '-web'
    secret = secrets.token_bytes(32)
    digest = hashlib.sha256(secret).hexdigest()
    docker.call('POST', '/containers/create?name=' + name, {
        'Image': args.image, 'Env': environment, 'Labels': {stand.LABEL: prefix},
        'HostConfig': {
            'NetworkMode': template['HostConfig']['NetworkMode'],
            'LogConfig': {'Type': 'json-file', 'Config': {'max-size': '10m', 'max-file': '3'}},
        },
    })
    try:
        if not water_balance:
            sql(platform, f"UPDATE platform_provisioning.register_operator SET {grant_column}='{basis}' WHERE community_id='{community}' AND account_id='{account}';")
        if replacement:
            sql(platform, f"UPDATE platform_provisioning.register_operator SET can_replace_electricity=true, electricity_recognition_basis='{basis}' WHERE community_id='{community}' AND account_id='{account}';")
        if installation_history:
            sql(platform, f"""UPDATE platform_provisioning.register_operator
                SET can_replace_electricity=true, can_setup_electricity=true, electricity_setup_basis='{basis}'
                WHERE community_id='{community}' AND account_id='{account}';""")
        if common_electricity:
            sql(platform, f"""UPDATE platform_provisioning.register_operator
                SET can_setup_common_electricity=true, electricity_recognition_basis='{basis}'
                WHERE community_id='{community}' AND account_id='{account}';""")
        if electricity_import_history or forest_replacement:
            sql(platform, f"UPDATE platform_provisioning.register_operator SET can_replace_electricity=true, electricity_replacement_basis='{basis}' WHERE community_id='{community}' AND account_id='{account}';")
        if water_replacement:
            sql(platform, f"UPDATE platform_provisioning.register_operator SET water_recognition_basis='{basis}' WHERE community_id='{community}' AND account_id='{account}';")
        if verification_history or import_history or water_race_order or water_root_balance:
            sql(platform, f"UPDATE platform_provisioning.register_operator SET water_replacement_basis='{basis}' WHERE community_id='{community}' AND account_id='{account}';")
        archive = docker.call('GET', f'/containers/{args.template_container}/archive?path=/run/stand/https.pfx')
        docker.call('PUT', f'/containers/{name}/archive?path=/run/stand', archive, headers={'Content-Type': 'application/x-tar'})
        docker.call('POST', f'/containers/{name}/start')
        sql(platform, f"INSERT INTO platform_provisioning.platform_session VALUES (decode('{digest}','hex'),'{account}',now()+interval '10 min',null);")
        stand.PREFIX = prefix
        with stand.PrivateRelay(5543, docker) as relay:
            threading.Thread(target=relay.serve_forever, daemon=True).start()
            try:
                script = Path(__file__).with_name('check_electricity_manual_readings.cjs') if manual else Path(__file__).with_suffix('.cjs')
                if dual and not dual_import:
                    script = Path(__file__).with_name('check_electricity_dual_readings.cjs')
                if replacement:
                    script = Path(__file__).with_name('check_electricity_replacement.cjs')
                if installation_history:
                    script = Path(__file__).with_name('check_electricity_installation_history.cjs')
                if common_electricity:
                    script = Path(__file__).with_name('check_common_electricity.cjs')
                if csv_import:
                    script = Path(__file__).with_name('check_electricity_csv_import.cjs')
                if water:
                    script = Path(__file__).with_name('check_water_readings.cjs')
                if water_replacement:
                    script = Path(__file__).with_name('check_water_replacement.cjs')
                if water_import:
                    script = Path(__file__).with_name('check_water_csv_import.cjs')
                if water_topology:
                    script = Path(__file__).with_name('check_water_topology_publication.cjs')
                if water_balance:
                    script = Path(__file__).with_name('check_water_balance_acceptance.cjs')
                if water_root_balance:
                    script = Path(__file__).with_name('check_water_root_replacement_balance.cjs')
                if water_verification:
                    script = Path(__file__).with_name('check_water_verification_acceptance.cjs')
                child = subprocess.Popen([args.node, str(script)],
                    env=dict(os.environ, STAND_PROBE_COOKIE=secret.hex(), STAND_COMMUNITY=community,
                             STAND_HELP_SCREENSHOT=str(args.screenshot), STAND_VERIFICATION_HISTORY=str(verification_history).lower(),
                             STAND_IMPORT_HISTORY=str(import_history).lower(),
                             STAND_ELECTRICITY_IMPORT_HISTORY=str(electricity_import_history).lower(),
                             STAND_ELECTRICITY_FOREST_REPLACEMENT=str(forest_replacement).lower(),
                             STAND_ELECTRICITY_IMPORT_DUAL=str(dual_import).lower(),
                             STAND_CSV_IMPORT_REVOCATION=str(csv_revocation).lower(),
                             STAND_WATER_IMPORT_RACE=water_race_order or ''),
                    stdin=subprocess.PIPE, stdout=subprocess.PIPE, text=True, encoding='utf-8')
                messages = queue.Queue()
                def output():
                    for line in child.stdout:
                        messages.put(line.strip())
                    messages.put(None)
                threading.Thread(target=output, daemon=True).start()
                revoked = False
                raced = False
                try:
                    while True:
                        message = messages.get(timeout=90)
                        if message is None:
                            break
                        if message == 'LOCK_RACE' and water_race_order and not raced:
                            with hold_installation(docker, postgres, register, community, first_installation, reading_schema) as holder:
                                child.stdin.write('LOCKED\n')
                                child.stdin.flush()
                                wait_for_water_writes(sql, register, holder, [water_race_order])
                                child.stdin.write('START_SECOND\n')
                                child.stdin.flush()
                                wait_for_water_writes(sql, register, holder, ['recognize', 'replace'])
                                admissions = sql(platform, f"""SELECT action FROM platform_provisioning.water_admission
                                    WHERE community_id='{community}' AND target_id='{first_installation}'
                                    AND effective_on='2026-01-04' ORDER BY action;""").splitlines()
                                if admissions != ['recognize', 'replace']:
                                    raise RuntimeError('Both queued writes must have distinct Platform admissions')
                            raced = True
                            child.stdin.write('RELEASED\n')
                            child.stdin.flush()
                        elif message == 'REVOKE_DURING_APPLY' and csv_revocation and not revoked:
                            with hold_installation(docker, postgres, register, community, first_installation, reading_schema):
                                child.stdin.write('LOCKED\n')
                                child.stdin.flush()
                                admission_table = 'water_admission' if water else 'electricity_admission'
                                admission_fields = 'target_id,effective_on' if water else 'target_id,effective_on,channel'
                                expected = f'{first_installation}|2026-01-01' + ('' if water else '|total')
                                deadline = time.monotonic() + 10
                                while True:
                                    admission = sql(platform, f"""SELECT {admission_fields}
                                        FROM platform_provisioning.{admission_table}
                                        WHERE community_id='{community}' AND action='recognize';""")
                                    if admission:
                                        if admission != expected:
                                            raise RuntimeError('Unexpected Platform admission while Community is locked')
                                        break
                                    if time.monotonic() >= deadline:
                                        raise RuntimeError('First Platform admission did not arrive while Community was locked')
                                    time.sleep(0.1)
                                if sql(register, f"SELECT count(*) FROM {reading_schema}.reading WHERE community_id='{community}';") != '0':
                                    raise RuntimeError('Reading was already committed before revocation')
                                revoked_account = sql(platform, f"""SET lock_timeout = '3s';
                                    UPDATE platform_provisioning.register_operator SET {grant_column}=NULL
                                    WHERE community_id='{community}' AND account_id='{account}' RETURNING account_id;""")
                                if revoked_account != account:
                                    raise RuntimeError('Synthetic grant was not revoked')
                            revoked = True
                            child.stdin.write('REVOKED\n')
                            child.stdin.flush()
                        elif message == 'REVOKE' and not (csv_revocation or water_race_order) and not revoked:
                            assignment = 'can_read_water=false' if water_balance else f'{grant_column}=NULL'
                            sql(platform, f"UPDATE platform_provisioning.register_operator SET {assignment} WHERE community_id='{community}' AND account_id='{account}';")
                            revoked = True
                            child.stdin.write('REVOKED\n')
                            child.stdin.flush()
                        elif message.startswith('PASS:'):
                            print(message)
                        else:
                            raise RuntimeError('Unexpected browser probe output')
                    if child.wait(timeout=10) != 0 or not (raced if water_race_order else revoked):
                        raise RuntimeError('Browser electricity acceptance failed')
                finally:
                    if child.poll() is None:
                        child.kill()
                        child.wait()
            finally:
                relay.shutdown()
        if water_verification:
            rows = sql(register, f"SELECT admission_id,meter_id,verified_on FROM community_water.meter_verification WHERE community_id='{community}';").splitlines()
            admissions = sql(platform, f"SELECT count(*) FROM platform_provisioning.water_admission WHERE community_id='{community}' AND action='verify-meter';")
            attributed = sql(register, f"SELECT count(*) FROM community_water.meter_verification WHERE community_id='{community}' AND account_id='{account}' AND subject_id='{subject}' AND basis='{basis}';")
            if len(rows) != 4 or admissions != '6' or attributed != '4':
                raise RuntimeError('Unexpected verification/admission count or attribution')
            from datetime import date
            for row in rows:
                admission, meter, verified = row.split('|')
                admission, meter = str(uuid.UUID(admission)), str(uuid.UUID(meter))
                verified = date.fromisoformat(verified).isoformat()
                linked = sql(platform, f"SELECT count(*) FROM platform_provisioning.water_admission WHERE id='{admission}' AND community_id='{community}' AND account_id='{account}' AND subject_id='{subject}' AND action='verify-meter' AND target_id='{meter}' AND effective_on='{verified}' AND basis='{basis}';")
                if linked != '1':
                    raise RuntimeError('Verification does not reference its Platform admission')
            print('PASS: four verifications linked to six Platform admissions, no verification after revocation')
            if verification_history:
                changes = sql(register, f"SELECT admission_id,old_installation_id,request_id,effective_on FROM community_water.replacement WHERE community_id='{community}';").splitlines()
                count = sql(platform, f"SELECT count(*) FROM platform_provisioning.water_admission WHERE community_id='{community}' AND action='replace';")
                if len(changes) != 1 or count != '1':
                    raise RuntimeError('Unexpected verification history replacement count')
                admission, old, request, effective = changes[0].split('|')
                admission, old, request = (str(uuid.UUID(value)) for value in (admission, old, request))
                effective = date.fromisoformat(effective).isoformat()
                linked = sql(platform, f"SELECT count(*) FROM platform_provisioning.water_admission WHERE id='{admission}' AND community_id='{community}' AND account_id='{account}' AND subject_id='{subject}' AND action='replace' AND target_id='{old}' AND request_id='{request}' AND effective_on='{effective}' AND basis='{basis}';")
                historical = sql(register, f"SELECT count(*) FROM community_water.meter_verification v JOIN community_water.installation i ON (i.community_id,i.meter_id)=(v.community_id,v.meter_id) WHERE v.community_id='{community}' AND i.id='{old}' AND i.ends_before='{effective}';")
                if linked != '1' or historical != '4':
                    raise RuntimeError('Replacement admission or removed meter verification history differs')
                print('PASS: replacement linked to Platform admission and four verifications remain on removed meter')
            return
        if water_balance:
            admissions = sql(platform, f"SELECT count(*) FROM platform_provisioning.water_admission WHERE community_id='{community}';")
            if admissions != '0' or balance_fingerprint() != fingerprint:
                raise RuntimeError('Read-only balance probe changed resource data or created admissions')
            print('PASS: balance fixture unchanged and no write admissions created')
            return
        if water_root_balance:
            from water_balance_fixture import verify_root_replacement
            if balance_fingerprint() != fingerprint:
                raise RuntimeError('Root replacement changed point identities, dated topology or fixture readings')
            verify_root_replacement(lambda command: sql(register, command), lambda command: sql(platform, command),
                                    community, account, subject, basis)
            print('PASS: dated topology and fixture readings preserved; replacement and two readings linked to Platform admissions')
            return
        if water_topology:
            rows = sql(register, f"SELECT r.admission_id,r.starts_on,p.point_id FROM community_water.topology_revision r JOIN community_water.topology_point p USING (community_id,starts_on) WHERE r.community_id='{community}' AND p.parent_id IS NULL;").splitlines()
            admissions = sql(platform, f"SELECT count(*) FROM platform_provisioning.water_admission WHERE community_id='{community}' AND action='publish-topology';")
            if len(rows) != 2 or admissions != '4':
                raise RuntimeError('Unexpected water topology/admission count')
            for row in rows:
                admission, date, root = row.split('|')
                admission, root = str(uuid.UUID(admission)), str(uuid.UUID(root))
                if date not in ('2026-01-01', '2026-01-02'):
                    raise RuntimeError('Unexpected topology date')
                linked = sql(platform, f"SELECT count(*) FROM platform_provisioning.water_admission WHERE id='{admission}' AND community_id='{community}' AND account_id='{account}' AND subject_id='{subject}' AND action='publish-topology' AND target_id='{root}' AND effective_on='{date}' AND basis='{basis}';")
                if linked != '1':
                    raise RuntimeError('Water topology does not reference its Platform admission')
            print('PASS: two water topology versions linked to four Platform admissions, no publication after revocation')
            return
        if water:
            rows = sql(register, f"SELECT admission_id,installation_id,measured_on FROM community_water.reading WHERE community_id='{community}' ORDER BY measured_on;").splitlines()
            admissions = sql(platform, f"SELECT count(*) FROM platform_provisioning.water_admission WHERE community_id='{community}' AND action='recognize';")
            expected_rows, expected_admissions = (3, '14') if water_import else (5, '6' if water_replacement else '8')
            if import_history:
                expected_rows, expected_admissions = 5, '20'
            if csv_revocation:
                expected_rows, expected_admissions = 1, '1'
            if water_race_order:
                expected_rows, expected_admissions = int(water_race_order == 'recognize'), '1'
            reading_source = 'csv-import' if water_import else 'manual-observation'
            attributed = sql(register, f"SELECT count(*) FROM community_water.reading WHERE community_id='{community}' AND account_id='{account}' AND subject_id='{subject}' AND source='{reading_source}' AND basis='{basis}';")
            if len(rows) != expected_rows or admissions != expected_admissions or attributed != str(expected_rows):
                raise RuntimeError('Unexpected water reading/admission count or attribution')
            for row in rows:
                admission, installation, date = row.split('|')
                admission, installation = str(uuid.UUID(admission)), str(uuid.UUID(installation))
                dates = ('2026-01-01', '2026-01-02', '2026-01-03', '2026-01-04', '2026-01-05') if water_replacement or import_history else ('2026-01-01', '2026-01-02', '2026-01-03')
                if water_race_order:
                    dates = ('2026-01-04',)
                if date not in dates:
                    raise RuntimeError('Unexpected water reading date')
                linked = sql(platform, f"SELECT count(*) FROM platform_provisioning.water_admission WHERE id='{admission}' AND community_id='{community}' AND account_id='{account}' AND subject_id='{subject}' AND action='recognize' AND target_id='{installation}' AND effective_on='{date}' AND basis='{basis}';")
                if linked != '1':
                    raise RuntimeError('Water reading does not reference its Platform admission')
            if expected_rows == 0:
                print('PASS: one attempted recognition and no water reading')
            else:
                print(f'PASS: {expected_rows} water readings with {reading_source} attribution linked to {admissions} Platform admissions')
            if water_replacement or import_history or water_race_order:
                changes = sql(register, f"SELECT admission_id,old_installation_id,request_id FROM community_water.replacement WHERE community_id='{community}' AND effective_on='2026-01-04';").splitlines()
                count = sql(platform, f"SELECT count(*) FROM platform_provisioning.water_admission WHERE community_id='{community}' AND action='replace';")
                expected_changes = int(water_race_order != 'recognize')
                if len(changes) != expected_changes or count != ('1' if import_history or water_race_order else '4'):
                    raise RuntimeError('Unexpected water replacement/admission count')
                if expected_changes == 0:
                    print('PASS: one attempted replacement and no replacement record')
                    return
                admission, old, request = (str(uuid.UUID(value)) for value in changes[0].split('|'))
                linked = sql(platform, f"SELECT count(*) FROM platform_provisioning.water_admission WHERE id='{admission}' AND community_id='{community}' AND account_id='{account}' AND subject_id='{subject}' AND action='replace' AND target_id='{old}' AND request_id='{request}' AND effective_on='2026-01-04' AND basis='{basis}';")
                if linked != '1':
                    raise RuntimeError('Water replacement does not reference its Platform admission')
                print('PASS: one water replacement linked to Platform admission' if import_history or water_race_order else 'PASS: one water replacement linked to four Platform admissions, no replacement after revocation')
            return
        if common_electricity:
            from common_electricity_fixture import verify
            verify(lambda command: sql(register, command), lambda command: sql(platform, command),
                   community, account, subject, basis, first_installation)
            print('PASS: one common point without a plot, four readings, and seven matching or attempted Platform admissions')
            return
        if installation_history:
            rows = [row.split('|') for row in sql(register, f"""
                SELECT i.id, i.point_id, i.admission_id, p.plot_id, i.starts_on, i.ends_before, m.register_mode,
                    i.account_id, i.subject_id, i.basis
                FROM community_electricity.installation i
                JOIN community_electricity.accounting_point p ON (p.community_id,p.id)=(i.community_id,i.point_id)
                JOIN community_electricity.meter m ON (m.community_id,m.id)=(i.community_id,i.meter_id)
                WHERE i.community_id='{community}' ORDER BY i.starts_on;""").splitlines()]
            if [row[4:] for row in rows] != [
                ['2026-01-02', '2026-01-04', 'dual', account, subject, basis],
                ['2026-01-04', '', 'dual', account, subject, basis],
            ]:
                raise RuntimeError('Expected two attributed, non-overlapping dual installations')
            old, current = rows
            if old[1] != current[1] or old[3] != current[3]:
                raise RuntimeError('Replacement changed the original point or plot')
            changes = [row.split('|') for row in sql(register, f"""
                SELECT request_id, old_installation_id, new_installation_id, admission_id, effective_on, account_id, subject_id, basis
                FROM community_electricity.replacement WHERE community_id='{community}';""").splitlines()]
            if [row[1:] for row in changes] != [[old[0], current[0], current[2], current[4], account, subject, basis]]:
                raise RuntimeError('Expected one attributed replacement connecting both installations')
            issued = [row.split('|') for row in sql(platform, f"""
                SELECT id, action, target_id, effective_on, register_mode, request_id, account_id, subject_id, basis
                FROM platform_provisioning.electricity_admission WHERE community_id='{community}'
                ORDER BY effective_on;""").splitlines()]
            if issued != [
                [old[2], 'setup', old[3], old[4], 'dual', '', account, subject, basis],
                [current[2], 'replace', old[0], current[4], '', changes[0][0], account, subject, basis],
            ]:
                raise RuntimeError('Installation and replacement must match exactly two Platform admissions')
            print('PASS: one point, two installations and two matching Platform admissions after invalid and revoked submissions')
            return
        if manual:
            rows = sql(register, f"SELECT admission_id,installation_id,measured_on,channel FROM community_electricity.reading WHERE community_id='{community}' ORDER BY measured_on;").splitlines()
            admissions = sql(platform, f"SELECT count(*) FROM platform_provisioning.electricity_admission WHERE community_id='{community}' AND action='recognize';")
            expected_readings, expected_admissions = (6, '10') if dual else (3, '6')
            if replacement:
                expected_readings = 5
            if csv_import:
                expected_admissions = '14'
            if electricity_import_history:
                expected_readings, expected_admissions = 5, '20'
            if dual_import:
                expected_admissions = '16'
            if csv_revocation:
                expected_readings, expected_admissions = 1, '1'
            if len(rows) != expected_readings or admissions != expected_admissions:
                raise RuntimeError('Unexpected reading/admission count after denial')
            for row in rows:
                admission, installation, date, channel = row.split('|')
                admission, installation = str(uuid.UUID(admission)), str(uuid.UUID(installation))
                dates = ('2026-01-01', '2026-01-02', '2026-01-03', '2026-01-04', '2026-01-05') if replacement or electricity_import_history else ('2026-01-01', '2026-01-02', '2026-01-03')
                if date not in dates or channel not in (('day', 'night') if dual else ('total',)):
                    raise RuntimeError('Unexpected recognized reading target')
                linked = sql(platform, f"SELECT count(*) FROM platform_provisioning.electricity_admission WHERE id='{admission}' AND community_id='{community}' AND account_id='{account}' AND subject_id='{subject}' AND action='recognize' AND target_id='{installation}' AND effective_on='{date}' AND channel='{channel}' AND basis='{basis}';")
                if linked != '1':
                    raise RuntimeError('Reading does not reference its Platform admission')
            if csv_import:
                imported = sql(register, f"SELECT count(*) FROM community_electricity.reading WHERE community_id='{community}' AND source='csv-import';")
                if imported != str(expected_readings):
                    raise RuntimeError('Imported readings must preserve CSV provenance')
            print(f'PASS: {expected_readings} readings linked to Platform admissions, {expected_admissions} attempts, no admission after revocation')
            if replacement or electricity_import_history:
                changes = sql(register, f"SELECT admission_id,old_installation_id,request_id FROM community_electricity.replacement WHERE community_id='{community}' AND effective_on='2026-01-04';").splitlines()
                count = sql(platform, f"SELECT count(*) FROM platform_provisioning.electricity_admission WHERE community_id='{community}' AND action='replace';")
                if len(changes) != 1 or count != ('1' if electricity_import_history else '4'):
                    raise RuntimeError('Unexpected replacement/admission count')
                admission, old, request = (str(uuid.UUID(value)) for value in changes[0].split('|'))
                linked = sql(platform, f"SELECT count(*) FROM platform_provisioning.electricity_admission WHERE id='{admission}' AND community_id='{community}' AND account_id='{account}' AND subject_id='{subject}' AND action='replace' AND target_id='{old}' AND request_id='{request}' AND effective_on='2026-01-04' AND basis='{basis}';")
                if linked != '1':
                    raise RuntimeError('Replacement does not reference its Platform admission')
                print('PASS: one replacement linked to Platform admission' if electricity_import_history else 'PASS: one replacement linked to Platform admission, four attempts, no replacement after revocation')
            return
        if forest_replacement:
            revisions = [row.split('|') for row in sql(register, f"""
                SELECT r.admission_id, r.starts_on, r.account_id, r.subject_id, r.basis, count(p.point_id)
                FROM community_electricity.topology_revision r LEFT JOIN community_electricity.topology_point p
                    USING (community_id, starts_on)
                WHERE r.community_id='{community}' GROUP BY r.starts_on, r.admission_id, r.account_id, r.subject_id, r.basis
                ORDER BY r.starts_on;""").splitlines()]
            if [row[1:] for row in revisions] != [
                ['2026-01-01', account, subject, basis, '9'],
                ['2026-01-03', account, subject, basis, '9'],
            ]:
                raise RuntimeError('Expected two attributed nine-point revisions')
            changes = sql(register, f"""
                SELECT r.admission_id, r.old_installation_id, r.request_id FROM community_electricity.replacement r
                JOIN community_electricity.installation old ON (old.community_id,old.id)=(r.community_id,r.old_installation_id)
                JOIN community_electricity.installation new ON (new.community_id,new.id)=(r.community_id,r.new_installation_id)
                JOIN community_electricity.accounting_point p ON (p.community_id,p.id)=(old.community_id,old.point_id)
                JOIN community_register.plot plot ON (plot.community_id,plot.id)=(p.community_id,p.plot_id)
                WHERE r.community_id='{community}' AND r.effective_on='2026-01-04' AND plot.number='Plot 0'
                    AND old.ends_before=r.effective_on AND new.starts_on=r.effective_on AND new.point_id=old.point_id
                    AND r.account_id='{account}' AND r.subject_id='{subject}' AND r.basis='{basis}';""").splitlines()
            if len(changes) != 1 or sql(register,
                    f"SELECT count(*) FROM community_electricity.replacement WHERE community_id='{community}';") != '1':
                raise RuntimeError('Expected one attributed replacement on the original point')
            admission, old, request = changes[0].split('|')
            issued = [row.split('|') for row in sql(platform, f"""
                SELECT id, action, target_id, effective_on, request_id, account_id, subject_id, basis
                FROM platform_provisioning.electricity_admission WHERE community_id='{community}'
                ORDER BY action, effective_on;""").splitlines()]
            expected = [
                [row[0], 'publish-topology', community, row[1], '', account, subject, basis] for row in revisions
            ] + [[admission, 'replace', old, '2026-01-04', request, account, subject, basis]]
            if issued != expected:
                raise RuntimeError('Revisions or replacement do not match their Platform admissions')
            print('PASS: two nine-point revisions and one replacement matched to exactly three Platform admissions')
            return
        revisions = sql(register, f"SELECT count(*) FROM community_electricity.topology_revision WHERE community_id='{community}';")
        admissions = sql(platform, f"SELECT count(*) FROM platform_provisioning.electricity_admission WHERE community_id='{community}' AND action='publish-topology';")
        if (revisions, admissions) != ('1', '2'):
            raise RuntimeError('Unexpected revision/admission count after denial')
        revision_admission = sql(register, f"SELECT admission_id FROM community_electricity.topology_revision WHERE community_id='{community}';")
        revision_admission = str(uuid.UUID(revision_admission))
        linked = sql(platform, f"SELECT count(*) FROM platform_provisioning.electricity_admission WHERE id='{revision_admission}' AND community_id='{community}' AND account_id='{account}' AND subject_id='{subject}' AND action='publish-topology' AND target_id='{community}' AND effective_on='2026-01-01' AND basis='Synthetic topology acceptance';")
        if linked != '1':
            raise RuntimeError('Published revision does not reference its Platform admission')
        print('PASS: one revision, two admissions (publication and conflict), no admission after revocation')
    finally:
        try:
            sql(platform, f"DELETE FROM platform_provisioning.platform_session WHERE token_digest=decode('{digest}','hex');")
        finally:
            try:
                extra = ', electricity_recognition_basis=NULL' if replacement else ''
                if installation_history:
                    extra = ', can_replace_electricity=false, can_setup_electricity=false, electricity_setup_basis=NULL'
                if common_electricity:
                    extra = ', can_setup_common_electricity=false, can_recognize_electricity=false, electricity_recognition_basis=NULL'
                if electricity_import_history or forest_replacement:
                    extra = ', can_replace_electricity=false, electricity_replacement_basis=NULL'
                if water_replacement:
                    extra = ', water_recognition_basis=NULL'
                if verification_history or import_history or water_race_order or water_root_balance:
                    extra = ', water_replacement_basis=NULL'
                if water_balance:
                    extra = ', can_read_water=false'
                sql(platform, f"UPDATE platform_provisioning.register_operator SET {grant_column}=NULL{extra} WHERE community_id='{community}' AND account_id='{account}';")
            finally:
                try:
                    docker.call('POST', f'/containers/{name}/stop?t=5')
                finally:
                    docker.call('DELETE', f'/containers/{name}?v=false')


if __name__ == '__main__':
    main()
