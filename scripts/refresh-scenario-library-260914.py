#!/usr/bin/env python3
import json, re
from pathlib import Path

p = Path('scenarios.html')
text = p.read_text()
m = re.search(r'const SCENARIO_CATS = (.*);', text)
if not m:
    raise SystemExit('SCENARIO_CATS not found')
cats = json.loads(m.group(1))
by_name = {c['name']: c for c in cats}

def take(href):
    for c in cats:
        for i,e in enumerate(c['entries']):
            if e['href'] == href:
                return c['entries'].pop(i)
    raise SystemExit(f'missing {href}')

def put(cat, href):
    e = take(href)
    by_name[cat]['entries'].append(e)

put('Fiscal & Monetary', 'scenario-automatic-floor.html')
put('Fiscal & Monetary', 'scenario-the-formula.html')
put('Elections & Campaigns', 'scenario-the-graduation.html')
put('Immigration & Rights', 'scenario-sponsoring-state.html')
put('Legislature & Lawmaking', 'scenario-the-severed-clause.html')

by_name['Judiciary']['entries'].append({
    'href':'scenario-the-cause.html',
    'title':'The Cause',
    'desc':''
})
by_name['Fiscal & Monetary']['entries'].append({
    'href':'scenario-the-rate.html',
    'title':'The Rate',
    'desc':''
})
by_name['The Public Record']['entries'].append({
    'href':'scenario-the-three-hours.html',
    'title':'The Three Hours',
    'desc':''
})

text = text[:m.start(1)] + json.dumps(cats, ensure_ascii=False) + text[m.end(1):]
p.write_text(text)
print('Scenario categories reorganized and three new scenarios registered.')
