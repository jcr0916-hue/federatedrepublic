#!/usr/bin/env python3
"""Check scenario references, built links, and synchronization of the two libraries."""
import html
import json
import re
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

library = Path('scenarios.html').read_text()
assert library == Path('scenarios-FINAL.html').read_text()
categories = json.loads(re.search(r'const SCENARIO_CATS = (.*);', library)[1])
entries = [e for c in categories for e in c['entries']]
assert len(entries) == len(pages) == len({e['href'] for e in entries})
assert {e['href'] for e in entries} == {p.name for p in pages}
for entry in entries:
    source = Path(entry['href']).read_text()
    match = re.search(r'<p class="scenario-subtitle">(.*?)</p>', source, re.S)
    if match:
        expected = re.sub(r'\s+', ' ', html.unescape(re.sub('<[^>]+>', '', match[1]))).strip()
        assert entry['desc'] == expected, entry['href']
print(f'All {len(pages)} scenario references, built links, and library descriptions are consistent.')
