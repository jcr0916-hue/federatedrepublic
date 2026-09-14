#!/usr/bin/env python3
"""Synchronize scenario shelves, no-script links, counts, and preview descriptions."""
import html
import json
import re
from pathlib import Path

library = Path('scenarios.html')
page = library.read_text()
categories = json.loads(re.search(r'const SCENARIO_CATS = (.*);', page)[1])
featured = json.loads(re.search(r'const FEATURED_SHELF = (.*);', page)[1])

def plain(value):
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', '', value))).strip()

def description(href):
    text = Path(href).read_text()
    match = re.search(r'<p class="scenario-subtitle">(.*?)</p>', text, re.S)
    if match:
        return plain(match[1])
    match = re.search(r'<meta name="description" content="([^"]*)"', text)
    assert match, href
    return plain(match[1])

entries = [entry for category in categories for entry in category['entries']]
assert len({e['href'] for e in entries}) == len(entries)
assert {e['href'] for e in entries} == {p.name for p in Path('.').glob('scenario-*.html')}
for entry in entries + featured['entries']:
    entry['desc'] = description(entry['href'])
for name, value in [('SCENARIO_CATS', categories), ('FEATURED_SHELF', featured)]:
    page = re.sub(r'const ' + name + r' = .*;', lambda _: 'const ' + name + ' = ' + json.dumps(value, ensure_ascii=False) + ';', page)

fallback = '<noscript>\n<div style="max-width:860px;margin:0 auto;padding:0 1rem">\n'
for category in categories:
    fallback += '<h3>' + html.escape(category['name']) + '</h3><ul>\n'
    for entry in category['entries']:
        fallback += '<li><a href="' + entry['href'] + '">' + html.escape(entry['title']) + '</a> — ' + html.escape(entry['desc']) + '</li>\n'
    fallback += '</ul>\n'
fallback += '</div>\n</noscript>'
page = re.sub(r'<noscript>.*?</noscript>', lambda _: fallback, page, flags=re.S)
page = re.sub(r'\d+ scenarios testing', str(len(entries)) + ' scenarios testing', page)
page = re.sub(r'<strong>\d+</strong>Total scenarios', '<strong>' + str(len(entries)) + '</strong>Total scenarios', page)
refs = set()
for source in Path('.').glob('scenario-*.html'):
    refs.update(re.findall(r'§\d+\.\d+(?:\.[a-z])?', html.unescape(source.read_text())))
page = re.sub(r'<strong>\d+</strong>Provisions (?:tested|referenced)', '<strong>' + str(len(refs)) + '</strong>Provisions referenced', page)
for i, category in enumerate(categories):
    n = len(category['entries'])
    pattern = r'(<button[^>]*data-cat="' + str(i) + r'"[^>]*>\s*<span class="sccard-num">).*?(</span>)'
    page = re.sub(pattern, lambda m: m[1] + str(n) + (' scenario' if n == 1 else ' scenarios') + m[2], page, flags=re.S)
library.write_text(page)
print(f'Synchronized {len(entries)} scenarios and {len(featured["entries"])} featured entries in the scenario library.')
