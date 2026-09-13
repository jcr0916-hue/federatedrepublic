#!/usr/bin/env python3
"""Verify full constitutional rendering and full-text search, including lettered anchors."""
import html
import json
import re
from pathlib import Path

provisions = [p for a in json.loads(Path('constitution_data.json').read_text()) for p in a['provisions']]
page = Path('annotated.html').read_text()
index = json.loads(Path('search-index.js').read_text().split('const SEARCH_INDEX = ', 1)[1].rstrip(';'))
assert len(index) == len(provisions)
normalize = lambda text: re.sub(r'\s+', '', html.unescape(re.sub('<[^>]+>', '', text)))
for p, entry in zip(provisions, index):
    assert all(entry[k] == p[k] for k in ('num', 'name', 'text')), p['num']
    block = page.split('id="' + entry['id'] + '"', 1)[1].split('<div class="provision"', 1)[0]
    assert normalize(p['text']) in normalize(block), p['num']
assert 'var pid = p.id;' in page
assert "'ann-' + CONSTITUTION_REVISION" in page
print(f'Full text and search anchors verified for {len(provisions)} provisions.')
