#!/usr/bin/env python3
"""Check live federal references and the frozen editorial-audit register.

The register documents a dated human editorial review; it is not a proof of legal
meaning. --snapshot verifies its exact reviewed files for this release. Ordinary
future publishing can run the reference check without freezing narrative content.
"""
import argparse
import hashlib
import html
import json
import re
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument('--snapshot', action='store_true')
args = parser.parse_args()
source = json.loads(Path('constitution_data.json').read_text())
provisions = {p['num'] for a in source for p in a['provisions']}
anchors = {'s' + n[1:].replace('.', '-', 1).replace('.', '') for n in provisions}
errors = []
root_pages = sorted(Path('.').glob('*.html'))
for page in root_pages:
    if page.name.startswith(('constitutional-history', 'state-constitution-')):
        continue  # Dated historical text and State-law sources have their own authority.
    text = html.unescape(page.read_text())
    if not page.name.startswith('torenthia-state-'):
        for ref in set(re.findall(r'§\d+\.\d+(?:\.[a-z])?', text)):
            if ref not in provisions:
                errors.append(f'{page}: unknown federal provision {ref}')
    for ref in re.findall(r'annotated\.html#(s[\w-]+)', text):
        if ref not in anchors and ref not in {'s3-12', 's3-13'}:
            errors.append(f'{page}: missing federal anchor {ref}')
bridges = json.loads(Path('_data/scenarioBridges.json').read_text())
for name, data in bridges.items():
    for item in data.get('provisions', []):
        if item['ref'] not in provisions:
            errors.append(f'{name}: stale reading-bridge provision {item["ref"]}')
register = json.loads(Path('docs/operations/constitutional-compatibility-261023.json').read_text())
for entry in register['entries']:
    if entry['classification'] == 'pending' or not entry['decision']:
        errors.append(f'{entry["path"]}: incomplete audit decision')
    if args.snapshot:
        path = Path(entry['path'])
        digest = hashlib.sha256(path.read_bytes()).hexdigest() if path.is_file() else None
        if digest != entry.get('reviewed_sha256'):
            errors.append(f'{path}: differs from reviewed release snapshot')
if args.snapshot:
    expected = {p.name for p in [*Path('.').glob('scenario-*.html'), *Path('.').glob('torenthia*.html')]}
    covered = {e['path'] for e in register['entries']}
    if expected - covered:
        errors.append(f'Unreviewed corpus files: {sorted(expected-covered)}')
    if hashlib.sha256(Path('constitution_data.json').read_bytes()).hexdigest() != register['constitution_sha256']:
        errors.append('Canonical source differs from the approved review candidate')
if errors:
    raise SystemExit('\n'.join(errors))
print(f'Live references checked on {len(root_pages)} pages; {len(register["entries"])} documented decisions; snapshot={args.snapshot}.')
