"""Exercise isolated synthetic resource writes through the UI and revoke their grant."""

import argparse
import hashlib
import os
from pathlib import Path
import queue
import re
import secrets
import subprocess
import sys
import threading
import uuid

sys.dont_write_bytecode = True
import stand


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--image', required=True)
    parser.add_argument('--template-container', required=True)
    parser.add_argument('--login', required=True)
    parser.add_argument('--node', required=True)
    parser.add_argument('--screenshot', type=Path, required=True)
    parser.add_argument('--scenario', choices=['topology', 'manual-readings', 'dual-readings', 'replacement', 'csv-import', 'water-readings', 'water-replacement'], default='topology')
    args = parser.parse_args()
    dual = args.scenario == 'dual-readings'
    replacement = args.scenario == 'replacement'
    csv_import = args.scenario == 'csv-import'
    water_replacement = args.scenario == 'water-replacement'
    water = args.scenario in ('water-readings', 'water-replacement')
    manual = args.scenario != 'topology'
    grant_column = 'electricity_recognition_basis' if manual else 'topology_publication_basis'
    basis = 'Synthetic manual reading acceptance' if manual else 'Synthetic topology acceptance'
    if dual:
        basis = 'Synthetic dual reading acceptance'
    if replacement:
        grant_column = 'electricity_replacement_basis'
        basis = 'Synthetic replacement acceptance'
    if csv_import:
        basis = 'Synthetic CSV acceptance'
    if water:
        grant_column = 'water_recognition_basis'
        basis = 'Synthetic water reading acceptance'
    if water_replacement:
        grant_column = 'water_replacement_basis'
        basis = 'Synthetic water replacement acceptance'
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
          VALUES ('{community}','{account}','{subject}',true,true,{str(not water).lower()},{str(manual and not water).lower()},{str(water).lower()},NULL);
        COMMIT;
    """)
    commands = ['BEGIN;']
    for index in range(3):
        if water:
            if index == 2:
                continue
            plot, point, meter = (str(uuid.uuid4()) for _ in range(3))
            commands.extend([
                f"INSERT INTO community_register.plot VALUES ('{community}','{plot}','Plot {index}');",
                f"INSERT INTO community_water.accounting_point (community_id,id,plot_id,designation) VALUES ('{community}','{point}','{plot}','Water {index}');",
                f"INSERT INTO community_water.meter (community_id,id,designation) VALUES ('{community}','{meter}','Meter {index}');",
                f"INSERT INTO community_water.installation (community_id,id,point_id,meter_id,starts_on,admission_id,account_id,subject_id,basis) VALUES ('{community}',gen_random_uuid(),'{point}','{meter}','2026-01-01',gen_random_uuid(),'{account}','{subject}','Synthetic fixture');",
            ])
            continue
        for label in (f'Root {index}', f'Street {index}'):
            commands.append(f"INSERT INTO community_electricity.accounting_point (community_id,id,common_designation,measurement_boundary) VALUES ('{community}',gen_random_uuid(),'{label}','Synthetic boundary');")
        plot, point, meter = (str(uuid.uuid4()) for _ in range(3))
        commands.extend([
            f"INSERT INTO community_register.plot VALUES ('{community}','{plot}','Plot {index}');",
            f"INSERT INTO community_electricity.accounting_point (community_id,id,plot_id) VALUES ('{community}','{point}','{plot}');",
            f"INSERT INTO community_electricity.meter (community_id,id,designation,register_mode) VALUES ('{community}','{meter}','Meter {index}','{'dual' if dual else 'total'}');",
            f"INSERT INTO community_electricity.installation (community_id,id,point_id,meter_id,starts_on,admission_id,account_id,subject_id,basis,reading_multiplier) VALUES ('{community}',gen_random_uuid(),'{point}','{meter}','2026-01-01',gen_random_uuid(),'{account}','{subject}','Synthetic fixture',{40 if manual else 1});",
        ])
    sql(register, '\n'.join(commands + ['COMMIT;']))
    prefix = 'communityos-test-stand-topology-' + secrets.token_hex(4)
    name = prefix + '-web'
    secret = secrets.token_bytes(32)
    digest = hashlib.sha256(secret).hexdigest()
    docker.call('POST', '/containers/create?name=' + name, {
        'Image': args.image, 'Env': environment, 'Labels': {stand.LABEL: prefix},
        'HostConfig': {'NetworkMode': template['HostConfig']['NetworkMode']},
    })
    try:
        sql(platform, f"UPDATE platform_provisioning.register_operator SET {grant_column}='{basis}' WHERE community_id='{community}' AND account_id='{account}';")
        if replacement:
            sql(platform, f"UPDATE platform_provisioning.register_operator SET can_replace_electricity=true, electricity_recognition_basis='{basis}' WHERE community_id='{community}' AND account_id='{account}';")
        if water_replacement:
            sql(platform, f"UPDATE platform_provisioning.register_operator SET water_recognition_basis='{basis}' WHERE community_id='{community}' AND account_id='{account}';")
        archive = docker.call('GET', f'/containers/{args.template_container}/archive?path=/run/stand/https.pfx')
        docker.call('PUT', f'/containers/{name}/archive?path=/run/stand', archive, headers={'Content-Type': 'application/x-tar'})
        docker.call('POST', f'/containers/{name}/start')
        sql(platform, f"INSERT INTO platform_provisioning.platform_session VALUES (decode('{digest}','hex'),'{account}',now()+interval '10 min',null);")
        stand.PREFIX = prefix
        with stand.PrivateRelay(5543, docker) as relay:
            threading.Thread(target=relay.serve_forever, daemon=True).start()
            try:
                script = Path(__file__).with_name('check_electricity_manual_readings.cjs') if manual else Path(__file__).with_suffix('.cjs')
                if dual:
                    script = Path(__file__).with_name('check_electricity_dual_readings.cjs')
                if replacement:
                    script = Path(__file__).with_name('check_electricity_replacement.cjs')
                if csv_import:
                    script = Path(__file__).with_name('check_electricity_csv_import.cjs')
                if water:
                    script = Path(__file__).with_name('check_water_readings.cjs')
                if water_replacement:
                    script = Path(__file__).with_name('check_water_replacement.cjs')
                child = subprocess.Popen([args.node, str(script)],
                    env=dict(os.environ, STAND_PROBE_COOKIE=secret.hex(), STAND_COMMUNITY=community,
                             STAND_HELP_SCREENSHOT=str(args.screenshot)),
                    stdin=subprocess.PIPE, stdout=subprocess.PIPE, text=True, encoding='utf-8')
                messages = queue.Queue()
                def output():
                    for line in child.stdout:
                        messages.put(line.strip())
                    messages.put(None)
                threading.Thread(target=output, daemon=True).start()
                revoked = False
                try:
                    while True:
                        message = messages.get(timeout=90)
                        if message is None:
                            break
                        if message == 'REVOKE' and not revoked:
                            sql(platform, f"UPDATE platform_provisioning.register_operator SET {grant_column}=NULL WHERE community_id='{community}' AND account_id='{account}';")
                            revoked = True
                            child.stdin.write('REVOKED\n')
                            child.stdin.flush()
                        elif message.startswith('PASS:'):
                            print(message)
                        else:
                            raise RuntimeError('Unexpected browser probe output')
                    if child.wait(timeout=10) != 0 or not revoked:
                        raise RuntimeError('Browser electricity acceptance failed')
                finally:
                    if child.poll() is None:
                        child.kill()
                        child.wait()
            finally:
                relay.shutdown()
        if water:
            rows = sql(register, f"SELECT admission_id,installation_id,measured_on FROM community_water.reading WHERE community_id='{community}' ORDER BY measured_on;").splitlines()
            admissions = sql(platform, f"SELECT count(*) FROM platform_provisioning.water_admission WHERE community_id='{community}' AND action='recognize';")
            attributed = sql(register, f"SELECT count(*) FROM community_water.reading WHERE community_id='{community}' AND account_id='{account}' AND subject_id='{subject}' AND source='manual-observation' AND basis='{basis}';")
            if len(rows) != 5 or admissions != ('6' if water_replacement else '8') or attributed != '5':
                raise RuntimeError('Unexpected water reading/admission count or attribution')
            for row in rows:
                admission, installation, date = row.split('|')
                admission, installation = str(uuid.UUID(admission)), str(uuid.UUID(installation))
                dates = ('2026-01-01', '2026-01-02', '2026-01-03', '2026-01-04', '2026-01-05') if water_replacement else ('2026-01-01', '2026-01-02', '2026-01-03')
                if date not in dates:
                    raise RuntimeError('Unexpected water reading date')
                linked = sql(platform, f"SELECT count(*) FROM platform_provisioning.water_admission WHERE id='{admission}' AND community_id='{community}' AND account_id='{account}' AND subject_id='{subject}' AND action='recognize' AND target_id='{installation}' AND effective_on='{date}' AND basis='{basis}';")
                if linked != '1':
                    raise RuntimeError('Water reading does not reference its Platform admission')
            print(f'PASS: five water readings with original attribution linked to {admissions} Platform admissions')
            if water_replacement:
                changes = sql(register, f"SELECT admission_id,old_installation_id,request_id FROM community_water.replacement WHERE community_id='{community}' AND effective_on='2026-01-04';").splitlines()
                count = sql(platform, f"SELECT count(*) FROM platform_provisioning.water_admission WHERE community_id='{community}' AND action='replace';")
                if len(changes) != 1 or count != '4':
                    raise RuntimeError('Unexpected water replacement/admission count')
                admission, old, request = (str(uuid.UUID(value)) for value in changes[0].split('|'))
                linked = sql(platform, f"SELECT count(*) FROM platform_provisioning.water_admission WHERE id='{admission}' AND community_id='{community}' AND account_id='{account}' AND subject_id='{subject}' AND action='replace' AND target_id='{old}' AND request_id='{request}' AND effective_on='2026-01-04' AND basis='{basis}';")
                if linked != '1':
                    raise RuntimeError('Water replacement does not reference its Platform admission')
                print('PASS: one water replacement linked to four Platform admissions, no replacement after revocation')
            return
        if manual:
            rows = sql(register, f"SELECT admission_id,installation_id,measured_on,channel FROM community_electricity.reading WHERE community_id='{community}' ORDER BY measured_on;").splitlines()
            admissions = sql(platform, f"SELECT count(*) FROM platform_provisioning.electricity_admission WHERE community_id='{community}' AND action='recognize';")
            expected_readings, expected_admissions = (6, '10') if dual else (3, '6')
            if replacement:
                expected_readings = 5
            if csv_import:
                expected_admissions = '14'
            if len(rows) != expected_readings or admissions != expected_admissions:
                raise RuntimeError('Unexpected reading/admission count after denial')
            for row in rows:
                admission, installation, date, channel = row.split('|')
                admission, installation = str(uuid.UUID(admission)), str(uuid.UUID(installation))
                dates = ('2026-01-01', '2026-01-02', '2026-01-03', '2026-01-04', '2026-01-05') if replacement else ('2026-01-01', '2026-01-02', '2026-01-03')
                if date not in dates or channel not in (('day', 'night') if dual else ('total',)):
                    raise RuntimeError('Unexpected recognized reading target')
                linked = sql(platform, f"SELECT count(*) FROM platform_provisioning.electricity_admission WHERE id='{admission}' AND community_id='{community}' AND account_id='{account}' AND subject_id='{subject}' AND action='recognize' AND target_id='{installation}' AND effective_on='{date}' AND channel='{channel}' AND basis='{basis}';")
                if linked != '1':
                    raise RuntimeError('Reading does not reference its Platform admission')
            print(f'PASS: {expected_readings} readings linked to Platform admissions, {expected_admissions} attempts, no admission after revocation')
            if csv_import:
                imported = sql(register, f"SELECT count(*) FROM community_electricity.reading WHERE community_id='{community}' AND source='csv-import';")
                if imported != '3':
                    raise RuntimeError('Imported readings must preserve CSV provenance')
            if replacement:
                changes = sql(register, f"SELECT admission_id,old_installation_id,request_id FROM community_electricity.replacement WHERE community_id='{community}' AND effective_on='2026-01-04';").splitlines()
                count = sql(platform, f"SELECT count(*) FROM platform_provisioning.electricity_admission WHERE community_id='{community}' AND action='replace';")
                if len(changes) != 1 or count != '4':
                    raise RuntimeError('Unexpected replacement/admission count')
                admission, old, request = (str(uuid.UUID(value)) for value in changes[0].split('|'))
                linked = sql(platform, f"SELECT count(*) FROM platform_provisioning.electricity_admission WHERE id='{admission}' AND community_id='{community}' AND account_id='{account}' AND subject_id='{subject}' AND action='replace' AND target_id='{old}' AND request_id='{request}' AND effective_on='2026-01-04' AND basis='{basis}';")
                if linked != '1':
                    raise RuntimeError('Replacement does not reference its Platform admission')
                print('PASS: one replacement linked to Platform admission, four attempts, no replacement after revocation')
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
                if water_replacement:
                    extra = ', water_recognition_basis=NULL'
                sql(platform, f"UPDATE platform_provisioning.register_operator SET {grant_column}=NULL{extra} WHERE community_id='{community}' AND account_id='{account}';")
            finally:
                docker.call('POST', f'/containers/{name}/stop?t=5')
                docker.call('DELETE', f'/containers/{name}?v=true')


if __name__ == '__main__':
    main()
