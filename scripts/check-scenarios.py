#!/usr/bin/env python3
"""Check scenario references, built links, and scenario-library metadata."""
import html
import json
import re
import subprocess
from pathlib import Path

provisions = {p['num'] for a in json.loads(Path('constitution_data.json').read_text()) for p in a['provisions']}
pages = list(Path('.').glob('scenario-*.html'))
for page in pages:
    text = html.unescape(page.read_text())
    for ref in set(re.findall(r'§\d+\.\d+(?:\.[a-z])?', text)):
        assert ref in provisions, (page, ref)
    for href in re.findall(r'href="([^"]+)"', text):
        if '://' in href or href.startswith(('#', 'mailto:')):
            continue
        path, _, anchor = href.partition('#')
        target = Path('_site') / path
        assert target.exists(), (page, href)
        if anchor and target.suffix == '.html':
            assert f'id="{anchor}"' in target.read_text(), (page, href)

library = Path('_site/scenarios.html').read_text()
data = json.loads(subprocess.check_output(['node', '--input-type=module', '-e',
    "import {loadScenarios} from './lib/scenarios.mjs'; console.log(JSON.stringify(loadScenarios()));"], text=True))
entries = data['entries']
visible = html.unescape(re.sub(r'<[^>]+>', '', re.sub(r'<span class="def-pop">.*?</span>', '', library, flags=re.S)))
assert len(entries) == len(pages) == len({e['href'] for e in entries})
assert {e['href'] for e in entries} == {p.name for p in pages}
assert 'crossroads.html' not in library and 'Living Crossroads' not in library
assert 'SCENARIO_CATS' not in library
for entry in entries:
    assert f'href="{entry["href"]}"' in library, entry['href']
    assert entry['title'] in html.unescape(library), entry['href']
    assert entry['desc'] in visible, entry['href']
    assert entry['minutes'] >= 1
    assert set(entry['refs']) <= provisions, entry['href']
assert 'Calder did not seek re-election' not in Path('_site/scenario-the-direction.html').read_text()
print(f'All {len(pages)} scenario references, built links, and generated library entries are consistent.')
