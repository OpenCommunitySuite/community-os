"""Read-only UI rehearsal using an existing synthetic stand and a temporary session."""

import argparse
import hashlib
import os
from pathlib import Path
import re
import secrets
import subprocess
import sys
import threading

sys.dont_write_bytecode = True
import stand


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--image', required=True)
    parser.add_argument('--template-container', required=True)
    parser.add_argument('--community', required=True)
    parser.add_argument('--login', required=True)
    parser.add_argument('--node', required=True)
    parser.add_argument('--screenshot', type=Path, required=True)
    parser.add_argument('--expect-read-only', action='store_true')
    parser.add_argument('--permission-profiles', action='store_true',
                        help='Rehearse help with browser-only permission flag overrides; never change grants')
    parser.add_argument('--scenario', choices=['finance', 'electricity-installation', 'water-manual', 'water-verification', 'water-topology'], default='finance')
    parser.add_argument('--topology-editor-ui', action='store_true',
                        help='Override only the topology editor browser flag; never change grants')
    parser.add_argument('--water-replacement-ui', action='store_true',
                        help='Override only the water replacement browser flag; never change grants')
    args = parser.parse_args()
    if args.water_replacement_ui and args.scenario != 'water-manual':
        parser.error('--water-replacement-ui requires --scenario water-manual')
    if args.topology_editor_ui and args.scenario != 'electricity-installation':
        parser.error('--topology-editor-ui requires --scenario electricity-installation')
    if args.scenario != 'finance' and args.permission_profiles:
        parser.error('--permission-profiles only applies to the finance scenario')
    if not re.fullmatch(r'communityos-test-stand:[a-zA-Z0-9_.-]+', args.image):
        parser.error('Use a communityos-test-stand image')
    if not args.template_container.startswith('communityos-test-stand-'):
        parser.error('Use a synthetic stand template container')
    if not re.fullmatch(r'[a-zA-Z0-9_-]+', args.login):
        parser.error('Invalid synthetic login')
    if args.screenshot.resolve().is_relative_to(stand.ROOT):
        parser.error('Keep screenshots outside the repository')
    docker = stand.Docker(23750)
    template = docker.call('GET', f'/containers/{args.template_container}/json')
    if not (template['Config'].get('Labels', {}).get(stand.LABEL, '').startswith('communityos-test-stand')
            and 'CommunityRegister__SyntheticStandEnabled=true' in template['Config']['Env']):
        raise RuntimeError('Template is not a labelled synthetic stand')
    # The inherited environment contains secrets; never print it.
    environment = template['Config']['Env']
    platform = next(value.split('=', 1)[1] for value in environment if value.startswith('Platform__Database='))
    database = re.search(r'(?:^|;)Database=([^;]+)', platform, re.IGNORECASE).group(1)
    if not re.fullmatch(r'communityos_[a-zA-Z0-9_]+', database):
        raise RuntimeError('Unexpected synthetic database name')
    prefix = 'communityos-test-stand-help-' + secrets.token_hex(4)
    name = prefix + '-web'
    docker.call('POST', '/containers/create?name=' + name, {
        'Image': args.image, 'Env': environment, 'Labels': {stand.LABEL: prefix},
        'HostConfig': {'NetworkMode': template['HostConfig']['NetworkMode']},
    })
    secret = secrets.token_bytes(32)
    digest = hashlib.sha256(secret).hexdigest()
    session_minutes = 15 if args.permission_profiles else 5
    postgres = 'communityos-test-stand-postgres'
    try:
        archive = docker.call('GET', f'/containers/{args.template_container}/archive?path=/run/stand/https.pfx')
        docker.call('PUT', f'/containers/{name}/archive?path=/run/stand', archive,
                    headers={'Content-Type': 'application/x-tar'})
        docker.call('POST', f'/containers/{name}/start')
        stand.psql(docker, postgres, database,
                   f"INSERT INTO platform_provisioning.platform_session SELECT decode('{digest}','hex'), "
                   f"id, now()+interval '{session_minutes} min', null FROM platform_provisioning.platform_account WHERE login='{args.login}';",
                   private=True)
        stand.PREFIX = prefix
        with stand.PrivateRelay(5543, docker) as relay:
            threading.Thread(target=relay.serve_forever, daemon=True).start()
            try:
                script = Path(__file__).with_name({
                    'finance': 'check_finance_help.cjs',
                    'electricity-installation': 'check_electricity_installation_help.cjs',
                    'water-manual': 'check_water_manual_help.cjs',
                    'water-verification': 'check_water_verification_help.cjs',
                    'water-topology': 'check_water_topology_help.cjs',
                }[args.scenario])
                subprocess.run([args.node, str(script)], check=True,
                               env=dict(os.environ, STAND_PROBE_COOKIE=secret.hex(),
                                        STAND_COMMUNITY=args.community, STAND_HELP_SCREENSHOT=str(args.screenshot),
                                        STAND_EXPECT_READ_ONLY='1' if args.expect_read_only else '0',
                                        STAND_TOPOLOGY_EDITOR_UI='1' if args.topology_editor_ui else '0',
                                        STAND_WATER_REPLACEMENT_UI='1' if args.water_replacement_ui else '0',
                                        STAND_HELP_PERMISSION_PROFILES='1' if args.permission_profiles else '0'))
            finally:
                relay.shutdown()
    finally:
        try:
            stand.psql(docker, postgres, database,
                       f"DELETE FROM platform_provisioning.platform_session WHERE token_digest=decode('{digest}','hex');", private=True)
        finally:
            docker.call('POST', f'/containers/{name}/stop?t=5')


if __name__ == '__main__':
    main()
