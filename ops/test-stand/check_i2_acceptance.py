"""Run all isolated I-2 resource browser scenarios at one committed revision."""

import argparse
import json
from pathlib import Path
import re
import subprocess
import sys
import time

sys.dont_write_bytecode = True
import stand
from check_electricity_topology_publication import SCENARIOS, stand_image

RUNTIME_INPUTS = ('src', 'global.json', 'Directory.Build.props', 'Directory.Packages.props',
                  '.dockerignore', 'ops/test-stand/Dockerfile')
RUNNER = Path(__file__).with_name('check_electricity_topology_publication.py')


def git(*args):
    return subprocess.check_output(['git', *args], cwd=stand.ROOT, text=True).strip()


def require_checkout(commit):
    if git('rev-parse', 'HEAD') != commit:
        raise RuntimeError('Checkout HEAD differs from --commit')
    if git('status', '--porcelain', '--untracked-files=no'):
        raise RuntimeError('The tracked checkout must be clean for the entire suite')


def run(args):
    require_checkout(args.commit)
    source = git('rev-parse', '--verify', args.image_source_commit + '^{commit}')
    if git('diff', '--name-only', source, args.commit, '--', *RUNTIME_INPUTS):
        raise RuntimeError('The image source differs from the checked commit in runtime build inputs')
    image = stand_image(stand.Docker(23750), args.image)
    image_id = image['Id']
    revision_label = (image['Config'].get('Labels') or {}).get('org.opencontainers.image.revision')
    if revision_label and revision_label != source:
        raise RuntimeError('Docker image revision label does not match the supplied source commit')

    args.output_dir.mkdir(parents=True)
    report_path = args.output_dir / 'summary.json'
    results = [{'scenario': name, 'status': 'not_run'} for name in SCENARIOS]
    report = {
        'commit': args.commit, 'image_source_commit': source, 'image_id': image_id,
        'image_source_basis': 'image_revision_label' if revision_label else 'operator_declaration',
        'status': 'running', 'scenarios': results,
    }

    def save():
        temporary = report_path.with_suffix('.tmp')
        temporary.write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
        temporary.replace(report_path)

    save()
    try:
        for result in results:
            require_checkout(args.commit)
            name = result['scenario']
            print(f'Scenario: {name}', flush=True)
            result['status'] = 'running'
            save()
            started = time.monotonic()
            child = subprocess.run(
                [sys.executable, str(RUNNER), '--scenario', name, '--image', args.image,
                 '--expected-image-id', image_id, '--template-container', args.template_container,
                 '--login', args.login, '--node', args.node, '--screenshot', str(args.output_dir / f'{name}.png')],
                cwd=stand.ROOT, stdout=subprocess.PIPE, encoding='utf-8',
            )
            passes = [line for line in child.stdout.splitlines() if line.startswith('PASS:')]
            result.update(seconds=round(time.monotonic() - started, 1), pass_count=len(passes),
                          exit_code=child.returncode)
            require_checkout(args.commit)
            if child.returncode or not passes:
                raise RuntimeError(f'Scenario {name} failed or did not report a successful check')
            result['status'] = 'passed'
            save()
            for check in passes:
                print(check, flush=True)
        report['status'] = 'passed'
    except BaseException:
        for result in results:
            if result['status'] == 'running':
                result['status'] = 'failed'
        report['status'] = 'failed'
        raise
    finally:
        save()
        print(f'Summary: {report_path}', flush=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--commit', required=True, help='Full SHA of the clean checkout under test')
    parser.add_argument('--image-source-commit', required=True, help='Full SHA used to build the image')
    parser.add_argument('--image', required=True)
    parser.add_argument('--template-container', required=True)
    parser.add_argument('--login', required=True)
    parser.add_argument('--node', required=True)
    parser.add_argument('--output-dir', type=Path, required=True)
    args = parser.parse_args()
    for value in (args.commit, args.image_source_commit):
        if not re.fullmatch(r'[0-9a-f]{40}', value):
            parser.error('Commit arguments must be full Git SHAs')
    if not re.fullmatch(r'communityos-test-stand:[a-zA-Z0-9_.-]+', args.image):
        parser.error('Use a synthetic stand image')
    args.output_dir = args.output_dir.resolve()
    if args.output_dir.is_relative_to(stand.ROOT) or args.output_dir.exists():
        parser.error('Choose a new output directory outside the repository')
    try:
        run(args)
    except (RuntimeError, OSError, subprocess.CalledProcessError) as error:
        parser.exit(1, f'{error}\n')


if __name__ == '__main__':
    main()
