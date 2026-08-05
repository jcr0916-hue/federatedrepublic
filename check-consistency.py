#!/usr/bin/env python3
"""
Pre-push consistency check.

Catches the specific failure that has bitten this project three times: some files
from a delivery get copied into the repo and others don't, leaving the source of
truth (constitution_data.json) disagreeing with the files generated from it.

This does NOT check that content is *correct* — only that every file agrees with
constitution_data.json, which is the bible. If they disagree, something didn't land.

Usage, from the repo root:
    python3 scripts/check-consistency.py
"""
import json
import os
import re
import sys

FAIL = []
WARN = []


def fail(msg):
    FAIL.append(msg)


def warn(msg):
    WARN.append(msg)


# ---------------------------------------------------------------- load bible --
if not os.path.exists('constitution_data.json'):
    print("ERROR: run this from the repo root (constitution_data.json not found)")
    sys.exit(1)

data = json.load(open('constitution_data.json', encoding='utf-8'))
provs = {p['num']: p for a in data if not a.get('preamble') for p in a.get('provisions', [])}
n_prov = len(provs)
n_art = sum(1 for a in data if not a.get('preamble'))

print(f"constitution_data.json: {n_art} articles, {n_prov} provisions\n")


# ------------------------------------------------------- annotated.html check --
if os.path.exists('annotated.html'):
    ann = open('annotated.html', encoding='utf-8').read()

    rendered = ann.count('class="provision"')
    if rendered != n_prov:
        fail(f"annotated.html renders {rendered} provisions, JSON has {n_prov}")

    # every provision id present?
    def anchor(num):
        parts = num[1:].split('.')
        a = 's' + parts[0]
        if len(parts) > 1:
            a += '-' + parts[1]
        if len(parts) > 2:
            a += parts[2]
        return a

    missing = [n for n in provs if f'id="{anchor(n)}"' not in ann]
    if missing:
        fail(f"annotated.html missing provisions: {', '.join(missing[:8])}"
             + (f" (+{len(missing)-8} more)" if len(missing) > 8 else ""))

    # spot-check that each provision's opening words appear in annotated.html.
    # catches the "JSON updated but annotated.html didn't" case.
    # annotated.html HTML-escapes apostrophes/quotes and may use &mdash;, so
    # normalize both sides to bare alphanumerics before comparing.
    def norm(s):
        import html as _html
        s = _html.unescape(s)
        s = s.replace('&mdash;', '—')
        return re.sub(r'[^a-z0-9]', '', s.lower())

    ann_norm = norm(ann)
    drift = []
    for num, p in provs.items():
        first = p['text'].split('\n')[0].strip()
        probe = norm(first[:70])
        if probe and probe not in ann_norm:
            drift.append(num)
    if drift:
        fail(f"annotated.html text differs from JSON in: {', '.join(drift[:8])}"
             + (f" (+{len(drift)-8} more)" if len(drift) > 8 else ""))

    # structural
    stripped = re.sub(r'<script.*?</script>|<style.*?</style>', '', ann, flags=re.S | re.I)
    opens = len(re.findall(r'<div\b', stripped))
    closes = len(re.findall(r'</div\s*>', stripped))
    if opens != closes:
        fail(f"annotated.html div tags unbalanced: {opens} open, {closes} close")
else:
    warn("annotated.html not found")


# ------------------------------------------------------------- docs/ md check --
for path in ('docs/constitution-current.md', 'docs/constitutional-quickref.md'):
    if not os.path.exists(path):
        warn(f"{path} not found")
        continue
    txt = open(path, encoding='utf-8').read()
    m = re.search(r'\*\*(\d+) articles · (\d+) provisions\*\*', txt)
    if not m:
        warn(f"{path}: could not read header counts")
    elif int(m.group(2)) != n_prov:
        fail(f"{path} header says {m.group(2)} provisions, JSON has {n_prov} "
             f"— run: npm run sync")


# -------------------------------------------------------- search-index check --
if os.path.exists('search-index.js'):
    idx = open('search-index.js', encoding='utf-8').read()
    entries = idx.count('"num"')
    if entries and entries != n_prov:
        fail(f"search-index.js has {entries} entries, JSON has {n_prov} — run: npm run sync")
else:
    warn("search-index.js not found")


# -------------------------------------------------- updates.js sanity check ---
if os.path.exists('_data/updates.js'):
    upd = open('_data/updates.js', encoding='utf-8').read()
    linked = set(re.findall(r'href:\s*"(torenthia-[^"]+\.html)"', upd))
    for href in sorted(linked):
        if not os.path.exists(href):
            fail(f"_data/updates.js links to {href}, which does not exist in the repo")

    # newest world file not in the feed? probably an un-landed updates.js
    world = sorted(
        f for f in os.listdir('.')
        if re.match(r'torenthia-news-\d+\.html$', f)
    )
    if world:
        newest = world[-1]
        if newest not in linked:
            warn(f"newest world piece ({newest}) is not in _data/updates.js "
                 f"— intentional, or did updates.js not land?")
else:
    warn("_data/updates.js not found")


# ------------------------------------------------------------------- report ---
print()
if FAIL:
    print("PROBLEMS FOUND — do not push until resolved:\n")
    for f in FAIL:
        print(f"  [FAIL] {f}")
if WARN:
    print()
    for w in WARN:
        print(f"  [warn] {w}")

if not FAIL:
    print("All consistent. Safe to push.")
    if WARN:
        print("(warnings above are informational, not blocking)")

sys.exit(1 if FAIL else 0)
