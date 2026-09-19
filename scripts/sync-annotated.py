#!/usr/bin/env python3
"""Synchronize provision blocks with the canonical JSON, preserving surrounding design.

The two September 2026 Article III aliases preserve links to the former competence
and delegation provisions; they do not restore the deleted generic office rules.
"""
import html
import json
import re
from pathlib import Path

source = json.loads(Path('constitution_data.json').read_text())
page = Path('annotated.html').read_text()

def anchor(num):
    return 's' + num[1:].replace('.', '-', 1).replace('.', '')

def block(p):
    ident = anchor(p['num'])
    label = f'    <div class="prov-label"><span class="prov-num" title="Click to copy link to {p["num"]}" onclick="copyProvLink(\'{ident}\')" style="cursor:pointer">{p["num"]}<span class="prov-permalink" aria-hidden="true">¶</span></span><span class="prov-name">{html.escape(p["name"])}</span></div>'
    paragraphs = [x for x in p['text'].splitlines() if x.strip()]
    if len(paragraphs) == 1:
        body = '    <p class="prov-text">' + html.escape(paragraphs[0], quote=False) + '</p>'
    else:
        body = '    <div class="prov-text">\n' + '\n'.join('      <p class="prov-para">' + html.escape(x, quote=False) + '</p>' for x in paragraphs) + '\n    </div>'
    return f'  <div class="provision" id="{ident}">\n{label}\n{body}\n  </div>'

aliases = {'s3-10': 's3-12', 's3-11': 's3-13'}
normalize = lambda s: re.sub(r'\s+', '', html.unescape(re.sub('<[^>]+>', '', s)))
for a in source:
    for p in a['provisions']:
        ident = anchor(p['num'])
        old_ident = ident
        if f'class="provision" id="{ident}"' not in page and ident in aliases:
            old_ident = aliases[ident]
        pattern = r'  <div class="provision" id="' + re.escape(old_ident) + r'">.*?\n  </div>'
        match = re.search(pattern, page, re.S)
        if match:
            text_part = re.split(r'<(?:p|div) class="prov-text">', match[0], maxsplit=1)[1]
            if normalize(text_part) != normalize(p['text']) or old_ident != ident:
                page = page[:match.start()] + block(p) + page[match.end():]
        else:
            # A newly appended provision belongs after the last provision of its article.
            prefix = ident.split('-')[0] + '-'
            matches = list(re.finditer(r'  <div class="provision" id="' + re.escape(prefix) + r'[^\"]+">.*?\n  </div>', page, re.S))
            if not matches:
                raise ValueError('No article insertion point for ' + p['num'])
            pos = matches[-1].end()
            page = page[:pos] + '\n\n' + block(p) + page[pos:]
        if ident in aliases and f'id="{aliases[ident]}"' not in page:
            target = f'  <div class="provision" id="{ident}">'
            page = page.replace(target, f'  <span id="{aliases[ident]}" aria-hidden="true"></span>\n' + target, 1)
count = sum(len(a['provisions']) for a in source)
articles = sum(not a.get('preamble', False) for a in source)
page = re.sub(r'Annotated Edition — \d+ provisions &nbsp;·&nbsp; \d+ articles',
              'Annotated Edition — {{ constitution.provisions }} provisions &nbsp;·&nbsp; {{ constitution.articles }} articles', page)
Path('annotated.html').write_text(page)
print('Annotated provisions synchronized.')
