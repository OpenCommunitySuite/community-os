"""Run the P24 DBF browser check in a disposable synthetic stand."""

import argparse
import hashlib
import http.client
import os
from pathlib import Path
import secrets
import ssl
import subprocess
import sys
import tempfile
import threading
import time
import uuid

sys.dont_write_bytecode = True
import stand


def seed(docker):
    postgres = stand.PREFIX + '-postgres'
    operator = uuid.UUID(stand.psql(docker, postgres, stand.PLATFORM,
        "SELECT id FROM platform_provisioning.platform_account WHERE login='stand-administrator';"))
    community, payer, plot, personal_account, bank_account = (uuid.uuid4() for _ in range(5))
    iban = 'UA000000000000000000000000001'
    cookie = secrets.token_bytes(32)
    digest = hashlib.sha256(cookie).hexdigest()
    stand.psql(docker, postgres, stand.PLATFORM, f"""
        BEGIN;
        INSERT INTO platform_provisioning.community_reservation
            (operation_id,community_id,creator_account_id,request_id,initial_administrator_account_id,display_name)
        SELECT gen_random_uuid(),'{community}',id,gen_random_uuid(),'{operator}','Synthetic P24 DBF'
        FROM platform_provisioning.platform_account WHERE login='stand-creator';
        INSERT INTO platform_provisioning.register_availability
            (community_id,community_active,register_enabled,billing_enabled)
        VALUES ('{community}',true,true,true);
        INSERT INTO platform_provisioning.register_operator
            (community_id,account_id,subject_id,linked,can_read,can_read_billing,
             one_off_post_basis,bank_import_basis,bank_recognition_basis,payment_allocate_basis)
        VALUES ('{community}','{operator}','{payer}',true,true,true,
            'Synthetic DBF fixture','Synthetic DBF fixture','Synthetic DBF fixture','Synthetic DBF fixture');
        INSERT INTO platform_provisioning.platform_session (token_digest,account_id,expires_at)
        VALUES (decode('{digest}','hex'),'{operator}',now()+interval '5 minutes');
        COMMIT;
    """, private=True)
    stand.psql(docker, postgres, stand.REGISTER, f"""
        BEGIN;
        INSERT INTO community_register.subject (community_id,id,display_name)
        VALUES ('{community}','{payer}','Synthetic payer');
        INSERT INTO community_register.plot (community_id,id,number) VALUES ('{community}','{plot}','P24');
        INSERT INTO community_register.ownership (community_id,plot_id,subject_id)
        VALUES ('{community}','{plot}','{payer}');
        INSERT INTO community_register.personal_account (community_id,id,plot_id,number)
        VALUES ('{community}','{personal_account}','{plot}','P24-001');
        INSERT INTO community_billing.bank_account (community_id,id,name,source,iban)
        VALUES ('{community}','{bank_account}','Synthetic bank account','P24','{iban}');
        COMMIT;
    """, private=True)
    return dict(STAND_COMMUNITY=str(community), STAND_PAYER=str(payer), STAND_PERSONAL_ACCOUNT=str(personal_account),
                STAND_BANK_ACCOUNT=str(bank_account), STAND_IBAN=iban, STAND_PROBE_COOKIE=cookie.hex())


def wait_web(port, certificate):
    tls = ssl.create_default_context(cafile=certificate)
    for _ in range(30):
        connection = http.client.HTTPSConnection('127.0.0.1', port, context=tls, timeout=2)
        try:
            connection.request('GET', '/health/ready')
            with connection.getresponse() as response:
                if response.status == 200:
                    return
        except (OSError, http.client.HTTPException):
            pass
        finally:
            connection.close()
        time.sleep(1)
    raise RuntimeError('Disposable stand did not become ready')


def remove_stand(docker):
    prefix = stand.PREFIX
    resources = [(f'/containers/{prefix}-{part}/json', f'/containers/{prefix}-{part}?force=true', True)
                 for part in ('worker', 'web', 'postgres')]
    resources += [(f'/volumes/{prefix}-{part}', f'/volumes/{prefix}-{part}', False)
                  for part in ('web-state', 'postgres-data')]
    resources.append((f'/networks/{prefix}', f'/networks/{prefix}', False))
    failures = []
    for lookup, delete, container in resources:
        try:
            info = docker.call('GET', lookup, missing=True)
            if info is None:
                continue
            labels = info['Config'].get('Labels') if container else info.get('Labels')
            if (labels or {}).get(stand.LABEL) != prefix:
                raise RuntimeError('Resource has a different ownership label')
            docker.call('DELETE', delete, missing=True)
            if docker.call('GET', lookup, missing=True) is not None:
                raise RuntimeError('Resource still exists after removal')
        except RuntimeError as error:
            failures.append(f'{lookup}: {error}')
    if failures:
        raise RuntimeError('Disposable stand cleanup failed: ' + ', '.join(failures))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--image', required=True, help='Local communityos-test-stand image of the tested checkout')
    parser.add_argument('--node', required=True, help='Path to Node.js')
    args = parser.parse_args()
    if Path(tempfile.gettempdir()).resolve().is_relative_to(stand.ROOT):
        parser.error('Use TEMP and TMP outside the repository')
    docker = stand.Docker(23750)
    stand.PREFIX += '-p24-' + secrets.token_hex(8)
    stand.LABELS = {stand.LABEL: stand.PREFIX}
    with tempfile.TemporaryDirectory(prefix='communityos-p24-') as temp:
        directory = Path(temp)
        result = subprocess.run(['pwsh', '-NoProfile', '-File', str(Path(__file__).with_name('init.ps1')),
                                 '-Directory', temp, '-Image', args.image], stdout=subprocess.DEVNULL)
        if result.returncode:
            raise RuntimeError('Stand configuration generation failed')
        config = stand.read_config(directory / 'stand.json')
        try:
            stand.start_database(docker, config)
            stand.migrate_stand(docker)
            stand.up(docker, config, directory)
            with stand.PrivateRelay(0, docker) as relay:
                port = relay.server_address[1]
                threading.Thread(target=relay.serve_forever, daemon=True).start()
                try:
                    wait_web(port, directory / 'https.pem')
                    fixture = seed(docker)
                    script = Path(__file__).with_suffix('.cjs')
                    result = subprocess.run([args.node, str(script)], env=dict(os.environ, **fixture,
                        STAND_ORIGIN=f'https://127.0.0.1:{port}', TEMP=temp, TMP=temp, TMPDIR=temp))
                    if result.returncode:
                        raise RuntimeError(f'Edge check exited with code {result.returncode}')
                finally:
                    relay.shutdown()
        finally:
            remove_stand(docker)
    print('PASS: disposable containers, volumes, network, relay and local temporary directory released', flush=True)


if __name__ == '__main__':
    try:
        main()
    except (OSError, RuntimeError, ValueError) as error:
        sys.exit(str(error))
