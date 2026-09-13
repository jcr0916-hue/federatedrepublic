#!/usr/bin/env python3
import json, pathlib, re, html

ROOT = pathlib.Path(__file__).resolve().parents[1]

# --- canonical Constitution ---
p = ROOT / 'constitution_data.json'
data = json.loads(p.read_text(encoding='utf-8'))
prov = None
for article in data:
    for item in article.get('provisions', []):
        if item.get('num') == '§15.2':
            prov = item
            break
    if prov:
        break
if not prov:
    raise SystemExit('§15.2 not found')

prov['text'] = """(1) A Territory's elected governing authority under §15.1 may by resolution request a Statehood Audit for the whole Territory. Alternatively, a citizen petition — signed by a percentage of eligible voters within the Territory defined by statute at not less than 5% nor more than 15%, authenticated through the NVS using Citizen Voting Credentials, and certified by the Elections Panel — achieves the same effect. A defined geographic subdivision of a Territory may petition for Statehood independently of the remainder under the same criteria, using the citizen petition mechanism scoped to eligible voters within the subdivision.
(2) Each Monitor conducts the portion of the Statehood Audit within that Monitor's constitutional domain and publishes an individual finding. The audit examines: free, lawful, and competitive elections; functioning constitutional government capable of State responsibilities; effective rule of law and lawful administration; substantial compliance with Article I; and other objective constitutional-capacity criteria established by statute. An overall failed audit requires at least two of the three Monitors to find a material failure within their respective domains. A single material-failure finding is published as a warning requiring remediation but does not constitute overall audit failure. All findings and dissents are published to the NRS.
(3) Initiation under subsection (1) opens a Statehood proceeding. The Territory must receive a successful Statehood Audit within two years after initiation. If no successful audit is achieved within that period, the proceeding lapses and may be initiated again under subsection (1).
(4) After the first successful Statehood Audit, the Territory remains a Territory and no Provisional status arises. A second successful Statehood Audit must be completed within two years after publication of the first successful audit. A failed audit or warning during that period does not by itself terminate the proceeding; the Territory may achieve the required second successful audit at any time before the deadline. If the second successful audit is not achieved within that period, the proceeding lapses and may be initiated again under subsection (1).
(5) Upon publication of the second successful Statehood Audit, the Territory becomes a State immediately by constitutional operation. No additional political vote, legislative act, executive confirmation, or Provisional stage is required. The Statehood change is recorded to the NRS as soon as possible.
(6) Statehood immediately creates two Senate seats. The Elections Panel assigns the two seats by public lot to two distinct existing Senate classes and administers a special election within 90 days. The first senators serve only the remainder of the assigned class terms; the classes and terms of existing States are unaffected.
(7) Every State is subject to an annual Statehood Audit under the same Monitor structure and criteria. Judicial review is available for legality, process, jurisdiction, and application of the stated criteria; a court may not substitute its policy judgment for a Monitor's domain assessment.
(8) Where active conflict prevents completion of an annual audit in a significant portion of a State's territory, the Monitors may publish a provisional audit-status finding for that cycle. A provisional audit status is unavailable where the State materially contributed to the conflict conditions."""

p.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

# --- Torenthia source-of-truth status ledger ---
stats_path = ROOT / '_data' / 'stats.js'
stats = stats_path.read_text(encoding='utf-8')
stats = stats.replace('{ name: "Morantine",  pop: 1.6, senate: 0, assembly: 15, rel: "Territory (statehood process)", audit: null, char: "Southern border · Valedon country" },',
                      '{ name: "Morantine",  pop: 1.6, senate: 0, assembly: 15, rel: "Territory (statehood process)", audit: "First audit passed · awaiting second", char: "Southern border · Valedon country" },')
stats = stats.replace('{ name: "Solara",     pop: 0.9, senate: 0, assembly:  9, rel: "Territory (statehood process)", audit: null, char: "Western Sea island · Distinct culture" },',
                      '{ name: "Solara",     pop: 0.9, senate: 0, assembly:  9, rel: "Territory (statehood process)", audit: "First audit passed · awaiting second", char: "Western Sea island · Distinct culture" },')
stats_path.write_text(stats, encoding='utf-8')

# --- current Korda planning note: keep process description current ---
korda_path = ROOT / 'docs' / 'KORDA-CONVENTION-ARC.md'
if korda_path.exists():
    k = korda_path.read_text(encoding='utf-8')
    k = k.replace('**§15.2** — the whole-territory statehood path: Statehood Audit administered by the JMC,\nno political vote required, Provisional status on passing. This is what a competing\nwhole-territory petition would be seeking.',
                  '**§15.2** — the whole-territory statehood path: two successful Statehood Audits are required. The first must be achieved within two years after the pathway begins and the second within two years after the first. No political vote or Provisional stage is required; the Territory remains a Territory until the second successful audit, when Statehood takes effect automatically by constitutional operation. This is what a competing whole-territory petition would be seeking.')
    korda_path.write_text(k, encoding='utf-8')

# --- annotated Constitution provision block only ---
ann_path = ROOT / 'annotated.html'
if ann_path.exists():
    ann = ann_path.read_text(encoding='utf-8')
    def anchor(num):
        parts = num[1:].split('.')
        out = 's' + parts[0]
        if len(parts) > 1: out += '-' + parts[1]
        if len(parts) > 2: out += parts[2]
        return out
    def render(item):
        num, name, text = item['num'], item.get('name',''), item.get('text','')
        aid = anchor(num)
        label = (f'  <div class="provision" id="{aid}">\n'
                 f'    <div class="prov-label"><span class="prov-num" title="Click to copy link to {html.escape(num)}" onclick="copyProvLink(\'{aid}\')" style="cursor:pointer">{html.escape(num)}<span class="prov-permalink" aria-hidden="true">¶</span></span><span class="prov-name">{html.escape(name)}</span></div>\n')
        paras = [x.strip() for x in text.split('\n') if x.strip()]
        body = '    <div class="prov-text">\n' + ''.join(f'      <p class="prov-para">{html.escape(x, quote=False)}</p>\n' for x in paras) + '    </div>\n'
        return label + body + '  </div>'
    pattern = re.compile(r'  <div class="provision" id="s15-2">.*?(?=\n\n  <div class="provision" id="s15-3">)', re.S)
    ann2, n = pattern.subn(render(prov), ann, count=1)
    if n != 1:
        raise SystemExit(f'annotated §15.2 replacement count={n}')
    ann_path.write_text(ann2, encoding='utf-8')

print('Applied two-audit Statehood correction.')
