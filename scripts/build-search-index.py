#!/usr/bin/env python3
"""Rebuild search-index.js from constitution_data.json.
ID convention matches annotated.html anchors: §1.19.b -> s1-19b, §2.14.a -> s2-14a.
Full text is searchable; the revision invalidates cached annotations after constitutional changes
and after any change to what the annotator is given (its prompt/packet logic or the recorded design history)."""
import json
import hashlib

def prov_id(num):
    parts = num.replace('§','').split('.')
    pid = 's' + parts[0]
    if len(parts) > 1: pid += '-' + parts[1]
    if len(parts) > 2: pid += parts[2]
    return pid

def truncate(text, limit=300):
    if len(text) <= limit: return text
    cut = text[:limit]
    return cut[:cut.rfind(' ')] if ' ' in cut else cut

data = json.load(open('constitution_data.json'))
entries = []
for article in data:
    for p in article['provisions']:
        entries.append({'id': prov_id(p['num']), 'num': p['num'],
                        'name': p['name'], 'text': p['text']})
digest = hashlib.sha256(json.dumps(data, ensure_ascii=False, sort_keys=True).encode())
for extra in ('api/_annotator-core.js', 'annotation-history.json'):
    digest.update(open(extra, 'rb').read())
revision = digest.hexdigest()[:16]
out = 'const CONSTITUTION_REVISION = ' + json.dumps(revision) + ';\nconst SEARCH_INDEX = ' + json.dumps(entries, ensure_ascii=False, separators=(',',':')) + ';'
open('search-index.js','w').write(out)
print(f'Wrote {len(entries)} entries')
