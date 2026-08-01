#!/usr/bin/env python3
"""
Build constitution-current.md from constitution_data.json.

This is the COMPLETE text of the constitution as markdown — every provision in full,
nothing truncated. It is a DERIVED artifact: never edit it by hand, edit
constitution_data.json and re-run this script.

Distinct from constitutional-quickref.md, which is a deliberately truncated INDEX
(first sentences plus extracted thresholds) meant for fast lookup. This file is the
document itself.

Counts in the header are COMPUTED, never typed. The hand-maintained docx title block
drifted to "166 Provisions" while the actual count was 167 — that class of error is
structurally impossible here.

Usage: python3 scripts/build-constitution-md.py constitution_data.json constitution-current.md
"""
import json, re, sys

def clean(t):
    """Normalize whitespace without altering content."""
    return re.sub(r'[ \t]+', ' ', t).strip()

def split_paras(text):
    """
    Provision text stores subsections separated by newlines, e.g.
    "(1) ...\n(2) ...". Preserve that structure as separate markdown paragraphs.
    Text without newlines returns as a single paragraph.
    """
    parts = [clean(p) for p in text.split('\n')]
    return [p for p in parts if p]

def main(src, dst):
    d = json.load(open(src, encoding='utf-8'))

    articles = [a for a in d if not a.get('preamble')]
    preamble = next((a for a in d if a.get('preamble')), None)
    total_provisions = sum(len(a.get('provisions', [])) for a in articles)

    L = []
    L.append("# The Federated Republic — Constitution")
    L.append("")
    L.append("> **GENERATED FILE — DO NOT EDIT BY HAND.**")
    L.append("> Built from `constitution_data.json` by `scripts/build-constitution-md.py`.")
    L.append("> To change anything here, change `constitution_data.json` and re-run the script.")
    L.append("> This is the complete text; nothing is truncated or summarized.")
    L.append(">")
    L.append(f"> **{len(articles)} articles · {total_provisions} provisions**")
    L.append("")
    L.append("thefederatedrepublic.org")
    L.append("")
    L.append("---")
    L.append("")

    # Preamble
    if preamble:
        L.append(f"## {preamble.get('heading', 'Preamble')}")
        L.append("")
        for para in split_paras(preamble.get('text', '')):
            L.append(para)
            L.append("")
        L.append("---")
        L.append("")

    # Articles
    for a in articles:
        L.append(f"## {a.get('heading', '')}")
        L.append("")
        for p in a.get('provisions', []):
            num = p.get('num', '')
            name = p.get('name', '')
            L.append(f"### {num} — {name}" if name else f"### {num}")
            L.append("")
            for para in split_paras(p.get('text', '')):
                L.append(para)
                L.append("")
        L.append("---")
        L.append("")

    # trailing separator is redundant
    while L and L[-1] in ('', '---'):
        L.pop()
    L.append("")

    out = '\n'.join(L)
    open(dst, 'w', encoding='utf-8').write(out)
    print(f"wrote {dst}: {len(articles)} articles, {total_provisions} provisions, "
          f"{len(out):,} chars")

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print(__doc__)
        sys.exit(1)
    main(sys.argv[1], sys.argv[2])
