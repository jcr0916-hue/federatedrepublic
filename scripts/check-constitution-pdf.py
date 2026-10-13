#!/usr/bin/env python3
"""Check complete canonical text in the public PDF. Requires pypdf."""
import json
import re
from pathlib import Path
from pypdf import PdfReader
source = json.loads(Path('constitution_data.json').read_text())
reader = PdfReader('pdf/constitution-current.pdf')
text = '\n'.join(re.sub(r'The Federated Republic · Constitution\s*\d+\s*', '', p.extract_text()) for p in reader.pages)
normalize = lambda s: re.sub(r'\s+', '', s)
normalized = normalize(text)
if not any(a.get('preamble') for a in source):
    assert 'WebuiltaRepublicworthlivingin' not in normalized, 'Stale PDF Preamble present'
    assert 'Preamble' not in text, 'Stale PDF Preamble heading present'
count = 0
for article in source:
    if article.get('preamble'):
        assert normalize(article['text']) in normalized, 'Preamble'
    for provision in article['provisions']:
        assert normalize(provision['text']) in normalized, provision['num']
        count += 1
assert f'{count} provisions' in text.casefold()
print(f'PDF: all {count} provisions and correct Preamble status verified across {len(reader.pages)} pages.')
