#!/usr/bin/env python3
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]

def read(path):
    return (ROOT / path).read_text(encoding='utf-8')

def write(path, text):
    (ROOT / path).write_text(text, encoding='utf-8')

def must_replace(text, old, new, label):
    if old not in text:
        raise SystemExit(f'Missing expected text for {label}')
    return text.replace(old, new)

# 1) Glossary: retire the obsolete Territory->Provisional concept.
p='glossary.html'; s=read(p)
pat=r'<div class="term-entry" data-term="provisional membership period" id="term-provisional-membership-period">.*?</div>\s*</div>'
m=re.search(pat,s,re.S)
if not m:
    raise SystemExit('Glossary provisional membership block not found')
new='''<div class="term-entry" data-term="statehood proceeding provisional membership period" id="term-provisional-membership-period">
          <div class="term-name">Statehood Proceeding <a href="annotated.html#s15-2" class="term-ref">§15.2 →</a></div>
          <p class="term-def">The constitutional pathway by which a Territory becomes a State. After the pathway is initiated, the Territory must obtain a first successful Statehood Audit within two years. It remains a Territory after that first success and must obtain a second successful Statehood Audit within two years after publication of the first. A failed audit or warning during that interval does not by itself end the proceeding if the required second success is achieved before the deadline. Upon publication of the second successful audit, Statehood takes effect immediately by constitutional operation. No Provisional stage applies to Territory-to-State admission.</p>
          <p class="term-note">Provisional status under §15.1.a is reserved for an existing State in remediation; it is not part of the Statehood pathway.</p>
        </div>'''
s=s[:m.start()]+new+s[m.end()-6:]
write(p,s)

# 2) States quicksheet: update admission sequence and framing.
p='quicksheet-states.html'; s=read(p)
s=must_replace(s,
'How a place joins, rises, falls, or leaves: the Statehood Audit with no political vote, Provisional status, mandatory and voluntary devolution, the independence exit, and the acknowledged — not granted — sovereignty of Indigenous Nations.',
'How a place joins, rises, falls, or leaves: the two-audit Statehood pathway, Provisional remediation for existing States, mandatory and voluntary devolution, the independence exit, and the acknowledged — not granted — sovereignty of Indigenous Nations.', 'quicksheet meta')
s=must_replace(s,
'How a place rises to statehood, falls from it, or leaves entirely — all by audited standards rather than political favor. Statehood is earned by passing an audit, not granted by a vote; and Indigenous sovereignty is acknowledged as something that precedes the Republic, not conferred by it.',
'How a place rises to statehood, falls from it, or leaves entirely — all by audited standards rather than political favor. Statehood requires two successful audits within the constitutional timetable, not a political admission vote; and Indigenous sovereignty is acknowledged as something that precedes the Republic, not conferred by it.', 'quicksheet tagline')
s=must_replace(s,
'<div class="cas-title">Statehood Audit</div>\n          <div class="cas-detail">Each Monitor publishes its domain finding. Overall failure requires material failure in at least two domains. One material finding is a warning requiring remediation, not an overall failure (§15.2).</div>',
'<div class="cas-title">First Successful Audit</div>\n          <div class="cas-detail">Must occur within two years after initiation. Each Monitor publishes its domain finding; overall failure requires material failure in at least two domains. After the first success, the jurisdiction remains a Territory.</div>', 'quicksheet first audit')
s=must_replace(s,
'<div class="cas-num">§15.2</div>\n          <div class="cas-title">Full Statehood</div>\n          <div class="cas-detail">Passing confers Statehood immediately by constitutional operation. Two Senate seats arise; the Panel assigns distinct existing classes by lot and holds a special election within 90 days. There is no Provisional entry stage.</div>',
'<div class="cas-num">§15.2 · SECOND AUDIT</div>\n          <div class="cas-title">Full Statehood</div>\n          <div class="cas-detail">A second successful audit must occur within two years after the first. Its publication confers Statehood immediately by constitutional operation. Two Senate seats arise and a special election follows within 90 days. There is no Provisional entry stage.</div>', 'quicksheet statehood')
s=must_replace(s,'political votes to become a State — <strong>the Audit alone</strong> decides (§15.2).','political admission votes to become a State — <strong>two successful audits</strong> decide (§15.2).','quicksheet fact')
write(p,s)

# 3) Rewrite the Statehood scenario to test the two-success sequence.
p='scenario-the-audit.html'; s=read(p)
old_desc='Year 3. A Territory passes the Statehood Audit, with clean findings from all three Monitors. No political vote required. The pathway is automatic. What happens next, in what order, and who can stop it.'
new_desc='Year 3. A Territory completes its second successful Statehood Audit within the constitutional window. No political admission vote is required. Statehood now takes effect automatically.'
s=must_replace(s, old_desc, new_desc, 'scenario audit description')
s=must_replace(s,'Statehood · §15.2 · Automatic Pathway · All Three Monitors','Statehood · §15.2 · Two-Audit Pathway · All Three Monitors','scenario audit tag')
body_pat=r'<div class="scenario-body">.*?</div>\s*<div class="scenario-nav">'
body_new='''<div class="scenario-body">
      <p>The Territory of Velmora entered the Statehood proceeding at the beginning of Year 1. Before two years elapsed, each Monitor completed its constitutional-domain review and all three published successful findings. That first successful Statehood Audit satisfied the first deadline — but Velmora did not become a State. It remained a Territory, with Assembly representation but no Senate seats.</p>

      <p>Year 2 brought a warning from one Monitor over an administrative defect. Because an overall failed audit requires material-failure findings from at least two Monitors, the warning did not itself constitute overall failure. More importantly, §15.2 does not terminate the Statehood proceeding merely because a warning or failed audit occurs between the two required successes. Velmora remediated the defect while the two-year clock after its first successful audit continued to run.</p>

      <p>In Year 3, before that second deadline expired, all three Monitors again published successful findings. Velmora had now completed the two successful Statehood Audits required by §15.2.</p>

      <div class="beat">
        <div class="beat-label">§15.2 — First Success Is Not Admission</div>
        <div class="beat-title">The first successful audit proves initial capacity. The Territory remains a Territory.</div>
        <p>The first successful audit did not create Statehood, Senate seats, or Provisional status. It started the second constitutional window: Velmora had two years from publication of that first success to achieve a second successful Statehood Audit.</p>
        <p>This is a durability test rather than a one-day snapshot. A Territory must show that it can meet the State standard and then sustain that capacity long enough to pass again.</p>
      </div>

      <div class="beat">
        <div class="beat-label">§15.2 — What Becomes Automatic</div>
        <div class="beat-title">Publication of the second successful audit is the constitutional trigger.</div>
        <p>When the Year 3 findings completed Velmora’s second successful audit, Velmora became a State immediately by constitutional operation. No political admission vote, legislative act, executive confirmation, or Provisional stage was required. The change was recorded to the NRS as soon as possible.</p>
        <p>Statehood immediately created two Senate seats. The Elections Panel assigned them by public lot to two distinct existing Senate classes and administered a special election within 90 days. The first senators served only the remainders of those class terms.</p>
      </div>

      <div class="beat">
        <div class="beat-label">§15.2 — The Deadline Has Teeth</div>
        <div class="beat-title">Miss the window and the proceeding lapses; the Territory may start again.</div>
        <p>If Velmora had failed to obtain its first successful audit within two years of initiation, the Statehood proceeding would have lapsed. The same would have happened if it failed to obtain the second successful audit within two years after the first. Lapse is not permanent disqualification: the Territory may initiate a new Statehood proceeding under §15.2.</p>
        <p>Political actors still cannot veto a Territory that satisfies the constitutional criteria. The safeguard is temporal and institutional rather than political: two demonstrated successes, within defined windows, before Statehood vests automatically.</p>
      </div>

      <p>The significance is the symmetry. An existing State in serious remediation must demonstrate durable compliance before ordinary State status is restored, and an aspiring Territory must likewise demonstrate durable capacity before Statehood begins. The two pathways serve different constitutional statuses, but both reject a single favorable snapshot as sufficient proof of stability.</p>

    </div>
    <div class="scenario-nav">'''
if not re.search(body_pat,s,re.S):
    raise SystemExit('scenario-the-audit body not found')
s=re.sub(body_pat,body_new,s,count=1,flags=re.S)
write(p,s)

# 4) Scenario library copies.
new_index='The Audit</a> — Year 3. A Territory completes its second successful Statehood Audit within the constitutional window. The first success kept it a Territory; the second makes Statehood automatic by constitutional operation.'
old_index='The Audit</a> — Year 3. A Territory passes the Statehood Audit, with clean findings from all three Monitors. No political vote required. The pathway is automatic. What happens next, in what order, and who can stop it.'
for p in ('scenarios.html','scenarios-FINAL.html'):
    s=read(p)
    s=must_replace(s,old_index,new_index,p)
    write(p,s)

# 5) Navigator keywords only; no change to behavior.
p='api/navigator.js'; s=read(p)
old="{title:'The Audit',file:'scenario-the-audit.html',kw:['statehood','audit','automatic','territory','monitors','senate','§15.2']}"
new="{title:'The Audit',file:'scenario-the-audit.html',kw:['statehood','audit','two audits','first audit','second audit','automatic','territory','monitors','senate','§15.2']}"
if old in s:
    s=s.replace(old,new)
write(p,s)

print('Targeted two-audit website patch applied.')
