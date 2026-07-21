#!/usr/bin/env python3
"""
Build constitutional-quickref.md from constitution_data.json.

The quickref is a DERIVED artifact. Never edit it by hand — edit the constitution,
then re-run this. Hand-editing is what let it drift 25% out of sync with the
document (wrong names on 41 provisions, an entire article that no longer existed,
and a Monitor-removal threshold that appears nowhere in the constitution).

Everything below is extracted verbatim or mechanically. No prose is invented.
"""
import json, re, sys
from collections import OrderedDict

ROMAN = {1:'I',2:'II',3:'III',4:'IV',5:'V',6:'VI',7:'VII',8:'VIII',9:'IX',10:'X',
         11:'XI',12:'XII',13:'XIII',14:'XIV',15:'XV',16:'XVI',17:'XVII',18:'XVIII',
         19:'XIX',20:'XX'}

def clean(t):
    return re.sub(r'\s+', ' ', t).strip()

def first_sentences(t, n=2):
    t = clean(t)
    # strip a leading "(1) " enumerator for readability
    parts = re.split(r'(?<=[.;])\s+(?=[A-Z(])', t)
    out = ' '.join(parts[:n])
    return out if len(out) < 420 else out[:417].rsplit(' ',1)[0] + '…'

def thresholds_in(t):
    """Extract every threshold-bearing clause verbatim."""
    hits = []
    for m in re.finditer(r'[^.;]*?\b(?:\d{1,3}%|\d/\d|absolute majority|simple majority)\b[^.;]*[.;]', t):
        s = clean(m.group(0)).rstrip('.;')
        if 8 < len(s) < 210:
            hits.append(s)
    return hits

def deadlines_in(t):
    hits = []
    for m in re.finditer(r'[^.;]*?\b\d+\s*(?:days?|months?|years?|hours?)\b[^.;]*[.;]', t):
        s = clean(m.group(0)).rstrip('.;')
        if 8 < len(s) < 210:
            hits.append(s)
    return hits

def main(src, dst):
    d = json.load(open(src))
    total = sum(len(a['provisions']) for a in d)
    L = []
    L.append("# Federated Republic Constitution — Quick Reference")
    L.append("")
    L.append("> **GENERATED FILE — DO NOT EDIT BY HAND.**")
    L.append("> Built from `constitution_data.json` by `scripts/build-quickref.py`.")
    L.append("> To change anything here, change the constitution and re-run the script.")
    L.append("> Every line below is extracted mechanically from the document; no summary is written by hand,")
    L.append("> because the hand-written version drifted 25% out of sync and invented a threshold that")
    L.append("> does not exist in the constitution.")
    L.append(">")
    L.append(f"> **{sum(1 for a in d if not a.get('preamble'))} articles · {total} provisions**")
    L.append("")
    L.append("---")
    L.append("")

    # ---------- index ----------
    L.append("## INDEX")
    L.append("")
    for i, a in enumerate(d, 1):
        if a.get('preamble'):
            L.append("- **Preamble**")
            continue
        nums = [p['num'] for p in a['provisions']]
        if not nums:
            continue
        rng = f"{nums[0]}–{nums[-1]}" if len(nums) > 1 else nums[0]
        L.append(f"- **{a.get('heading','(untitled)')}**  ·  {rng}  ({len(nums)} provisions)")
    L.append("")
    L.append("---")
    L.append("")

    # ---------- articles ----------
    for i, a in enumerate(d, 1):
        L.append(f"## {a.get('heading','(untitled)').upper()}")
        L.append("")
        for p in a['provisions']:
            t = clean(p['text'])
            L.append(f"### {p['num']} — {p.get('name','(untitled)')}")
            L.append("")
            L.append(first_sentences(t))
            L.append("")
            th = thresholds_in(t)
            if th:
                L.append("- **Thresholds:**")
                for x in dict.fromkeys(th):
                    L.append(f"  - {x}")
            dl = deadlines_in(t)
            if dl:
                L.append("- **Time limits:**")
                for x in list(dict.fromkeys(dl))[:6]:
                    L.append(f"  - {x}")
            refs = sorted(set(re.findall(r'§\d+\.\d+(?:\.[a-z])?', t)))
            if refs:
                L.append(f"- **Cross-refs:** {', '.join(refs)}")
            L.append("")
        L.append("---")
        L.append("")

    # ---------- every threshold in the document ----------
    L.append("## EVERY THRESHOLD IN THE CONSTITUTION")
    L.append("")
    L.append("Extracted verbatim. If a threshold is not in this table, it is not in the constitution.")
    L.append("")
    L.append("| § | Provision | Threshold clause (verbatim) |")
    L.append("|---|---|---|")
    for a in d:
        if a.get("preamble"):
            continue
        for p in a['provisions']:
            for x in dict.fromkeys(thresholds_in(clean(p['text']))):
                L.append(f"| {p['num']} | {p.get('name','')} | {x.replace('|','/')} |")
    L.append("")
    open(dst,'w').write('\n'.join(L) + '\n')
    print(f"wrote {dst}: {len(d)} articles, {total} provisions, {len(L)} lines")

if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
