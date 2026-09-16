from pathlib import Path
import json
import re
import string

root = Path('.')

# Archive the exact current generated Markdown before changing canonical source.
src = root / 'docs/constitution-current.md'
archive_dir = root / 'docs/archive/constitution'
archive_dir.mkdir(parents=True, exist_ok=True)
base = archive_dir / 'Constitution-260915.md'
if base.exists():
    for suffix in string.ascii_lowercase:
        candidate = archive_dir / f'Constitution-260915-{suffix}.md'
        if not candidate.exists():
            base = candidate
            break
    else:
        raise RuntimeError('No archive suffix available')
base.write_bytes(src.read_bytes())
print('Archived current Constitution to', base)

new_216 = """(1) A Consul is temporarily unable to exercise authority upon the Consul’s declaration or upon determination by a majority of the Council of Ministers, with at least five participating. The determination is published to the NRS and acting authority vests immediately under the applicable succession provision.

(2) The Consul may end the incapacity by publishing a declaration that the incapacity has ended. Full authority returns 24 hours after publication.

(3) Where incapacity is again determined on the same or substantially similar grounds within 90 days of restoration, the determination requires two-thirds of the deciding body. For 30 days thereafter, the Consul may resume authority only upon a restoration declaration approved by a majority of that body, or through relief granted by the SC. Expiration of that period does not itself end the incapacity; if it is not extended, subsection (2) again governs restoration.

(4) By simple majority of each chamber, the Legislature may set a longer period for a determination under subsection (3), not exceeding six months from the heightened determination. During that period the same restoration and judicial-review rights apply. Continuation beyond the authorized period requires a fresh two-thirds determination; absent such a determination, subsection (2) again governs restoration.

(5) A Consul may petition the SC for expedited review of a determination under subsection (3). Review is limited to whether this section was lawfully invoked and whether the stated grounds concern inability to exercise the authority of the office. Political or policy disagreement alone is not incapacity.

(6) Where fewer than five Council members are available, enough legislators to bring the deciding body to five are selected by lot from the Senate for a Civic Consul proceeding and from the Assembly for a Legat Consul proceeding. The same thresholds apply.

(7) A person upon whom acting executive authority would fall under §2.5(6) or §2.9(6) may decline by publishing a declination to the NRS within 48 hours of the incapacity publication. Upon publication, acting authority passes by constitutional operation to the next person in the applicable order of succession. A declination is irrevocable and does not prejudice the person's eligibility for any future succession event. A person who does not publish a declination within 48 hours is deemed to have accepted. The person last in the order of succession may not decline.

(8) Incapacity suspends only the exercise of authority. The Consul remains in office, with the term, compensation, benefits, and constitutional protections of that office. Nothing in this section prevents removal, resignation, death, or any other constitutional succession event.

(9) While serving in an acting executive capacity under §2.5(6) or §2.9(6), the acting officer may not exercise any legislative function; the officer retains their seat and any chamber office held, and the chamber provides for the exercise of those functions during that period under its internal procedures. Acting service neither extends nor suspends the officer's own electoral mandate; where the acting officer ceases to be a member of the chamber from which they were drawn, acting authority passes by constitutional operation to the next qualified person in the applicable order of succession."""

data_path = root / 'constitution_data.json'
data = json.loads(data_path.read_text(encoding='utf-8'))
found = False
for article in data:
    for provision in article.get('provisions', []):
        if provision.get('num') == '§2.16':
            provision['text'] = new_216
            found = True
            break
    if found:
        break
if not found:
    raise RuntimeError('§2.16 not found in constitution_data.json')
data_path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

# Adjust the Twenty-Four Hours scenario to test the revised mechanism.
p = root / 'scenario-the-twenty-four-hours.html'
s = p.read_text(encoding='utf-8')
old_desc = ('The Council of Ministers determines that the Civic Consul is temporarily unable to exercise authority. '
            'He disagrees. Under §2.16 he does not need to persuade a court, a chamber, or a doctor — he publishes a '
            'declaration and, twenty-four hours later, he is Consul again. The provision hands him that door on purpose. '
            'A repeat determination on the same or substantially similar grounds within 90 days changes that procedure.')
new_desc = ('The Council of Ministers determines that the Civic Consul is temporarily unable to exercise authority. '
            'He restores himself once after twenty-four hours. When the same incapacity recurs inside ninety days, the '
            'Council must reach two-thirds, restoration requires broader agreement, and the SC becomes available to police misuse.')
s = s.replace(old_desc, new_desc)
s = s.replace('<span class="prov-tag">§2.16(3) Restoration &amp; the 90-Day Brake</span>',
              '<span class="prov-tag">§2.16(2)–(5) Restoration &amp; Recurring Incapacity</span>')
s = s.replace('<span class="prov-tag">§2.16(4) Declination</span>',
              '<span class="prov-tag">§2.16(7) Declination</span>')
s = s.replace('If fewer than five Ministers were in office, the other Consul and Chief Justice could instead jointly determine incapacity and publish it to the NRS. Here the Council of Ministers has eleven members in office.',
              'If fewer than five Council members were available, legislators selected by lot would fill the deciding body to five — Senators for a Civic Consul proceeding, Assembly members for a Legat Consul proceeding. Here the Council of Ministers has eleven members in office.')
s = s.replace('§2.16(4) — The Declination Chain', '§2.16(7) — The Declination Chain')
s = s.replace('§2.16(4)(c)', '§2.16(7)')
s = s.replace('§2.16(4)(d)', '§2.16(7)')
s = s.replace('§2.16(3)(a) — The Restoration', '§2.16(2) — The Restoration')

replacement = '''      <p class="panel-num">Panel Four</p>

      <div class="beat">
        <div class="beat-label">§2.16(3) — The Second Determination</div>
        <div class="beat-title">The same grounds inside ninety days now require two-thirds.</div>
        <p>On Day 26 it happens again, in a Council session, in front of everybody, and it is not subtle and it is not tiredness.</p>
        <p>The Council votes ten to one. This time a bare majority would not be enough. Because the determination rests on the same or substantially similar grounds inside ninety days of restoration, §2.16(3) requires <strong>two-thirds of the deciding body</strong>. Ten to one clears it.</p>
        <p>Aurel Vasko publishes a second restoration declaration on Day 27. Unlike the first declaration, it does not restore him by itself. For the next thirty days he needs a majority of the deciding body to approve restoration, or he may ask the Supreme Court to review the heightened determination.</p>
      </div>

      <div class="nrs-doc">
        <div class="nrs-header">NRS-Y41-1217 &middot; Heightened Determination of Incapacity &middot; Council of Ministers</div>
        FILED: Year 41, Month 10, Day 10, 14:31<br>
        BY: Council of Ministers under §2.16(3)<br>
        MEMBERS PARTICIPATING: 11 &nbsp;&nbsp; THRESHOLD: two-thirds (8) — MET<br>
        VOTE: 10 &ndash; 1<br>
        <br>
        DETERMINATION: The Civic Consul is again temporarily unable to exercise the authority of the office on substantially similar grounds within 90 days of restoration.<br>
        <br>
        EFFECT: Heightened restoration requirements apply for 30 days unless a longer period is authorized under §2.16(4).
      </div>

      <p class="panel-num">Panel Five</p>

      <div class="beat">
        <div class="beat-label">§2.16(3)–(5) — The Dispute</div>
        <div class="beat-title">Nobody gets the office merely by refusing to yield.</div>
        <p>Vasko insists that he has recovered. The Council does not agree: only four members support his restoration declaration. Acting authority therefore continues.</p>
        <p>He petitions the SC. The question is deliberately narrow. The Court is not asked whether Vasko is medically competent, whether it likes his judgment, or whether the Council would govern better. It asks whether §2.16 was lawfully invoked and whether the stated grounds concern an actual inability to exercise the authority of the office. Political or policy disagreement alone cannot do the work.</p>
        <p>On this record — repeated observed disorientation, the second episode in the Council room itself, and a ten-to-one heightened determination — the Court leaves the determination in place.</p>
      </div>

      <p class="panel-num">Panel Six</p>

      <div class="beat">
        <div class="beat-label">§2.16(4) — Time Without Removal</div>
        <div class="beat-title">Thirty days is the default. Longer temporary incapacity requires both chambers.</div>
        <p>The Council expects recovery to take longer than a month. It cannot simply keep voting every thirty days. The Assembly and Senate may each, by simple majority, authorize a specified longer period, never beyond six months from the heightened determination.</p>
        <p>Assume they authorize three months. That vote does not find Vasko incapable and it does not remove him. It authorizes time for the Council's two-thirds determination to remain operative. Throughout the period Vasko can still return by restoration declaration plus a Council majority, or return to the SC if the constitutional basis for the determination no longer exists.</p>
        <p>If three months expire without a fresh two-thirds determination, the heightened restriction ends. The incapacity itself does not vanish at midnight; ordinary §2.16(2) restoration again governs. An unconscious Consul does not regain authority by the movement of a clock.</p>
      </div>

      <div class="verdict-box">
        <p><strong>What the revised provision is actually for.</strong> §2.16 separates the office from the authority of the office. Aurel Vasko remains Civic Consul throughout. His term runs, his benefits and protections continue, and no vacancy exists. Someone else temporarily exercises his authority.</p>
        <p>The first interruption is intentionally easy in both directions: a Council majority can protect continuity, and the Consul can ordinarily restore after twenty-four hours. Repetition changes the burden. The Council must reach two-thirds; the Consul then needs a Council majority for early restoration or may test the invocation before the SC.</p>
        <p><strong>The Legislature controls duration, not incapacity.</strong> Both chambers can authorize more than thirty days, up to six months, but neither chamber decides whether Vasko is unable to exercise authority. If the political system concludes that he should no longer hold office at all, §2.6 remains available and nothing in §2.16 blocks it.</p>
        <p><strong>Every material act remains attributable.</strong> The Council's votes, Vasko's declarations, any legislative extension, and the Court's judgment all enter the public constitutional record. The mechanism does not ask anyone to diagnose a mind. It asks each institution a narrower question and prevents any one of them from quietly turning temporary incapacity into removal.</p>
      </div>

      <div class="article-nav">'''
s, n = re.subn(r'      <p class="panel-num">Panel Four</p>.*?      <div class="article-nav">', replacement, s, flags=re.S)
if n != 1:
    raise RuntimeError(f'Expected one Panel Four replacement, got {n}')
p.write_text(s, encoding='utf-8')

# Update current Article II quick sheet.
p = root / 'quicksheet-article-2.html'
s = p.read_text(encoding='utf-8')
old = '''          <div class="veto-flow">
            <span class="flow-step">Consul declares — or Council determines</span><span class="flow-arrow">→</span>
            <span class="flow-step">Acting authority vests in order</span><span class="flow-arrow">→</span>
            <span class="flow-step">Consul restores by declaration</span>
          </div>
          <div style="font-size:8.6px;color:var(--muted);line-height:1.4">Incapacity begins on NRS publication by the Consul or Council. If fewer than five Council members hold office, the other Consul and Chief Justice may determine it jointly. Restoration normally takes 24 hours; repeat incapacity within 90 days requires the accountability chamber to restore authority. The last successor cannot decline. Incapacity ends after 90 days unless a removal process has begun; pay, benefits, and term continue (§2.16).</div>'''
new = '''          <div class="veto-flow">
            <span class="flow-step">Majority determines</span><span class="flow-arrow">→</span>
            <span class="flow-step">24h ordinary restoration</span><span class="flow-arrow">→</span>
            <span class="flow-step">Repeat: 2/3 + review</span>
          </div>
          <div style="font-size:8.6px;color:var(--muted);line-height:1.4">A first incapacity may be determined by a Council majority and ordinarily ends 24 hours after the Consul declares restoration. A substantially similar recurrence inside 90 days needs 2/3; for 30 days restoration then needs a deciding-body majority or SC relief. Both chambers may authorize a longer period up to six months. If fewer than five Council members are available, legislators are drawn by lot to fill the body to five. Incapacity suspends authority, not the office (§2.16).</div>'''
if old not in s:
    raise RuntimeError('Quick sheet incapacity block not found')
p.write_text(s.replace(old, new), encoding='utf-8')

# Update the standing NRS procedural reference so it does not describe repealed mechanics.
p = root / 'torenthia-nrs-012.html'
s = p.read_text(encoding='utf-8')
s = s.replace('how an incapacity is determined, how acting authority vests, how a Consul ends it, and what changes if the same grounds recur inside ninety days.',
              'how incapacity is determined, how acting authority vests, how restoration works, and how repeated incapacity is handled inside ninety days.')
body = '''  <div class="nrs-section-head">1. Initial Incapacity and Acting Authority</div>
  <p>A Consul is temporarily unable to exercise authority upon the Consul's own declaration or upon a determination by a majority of the Council of Ministers, with at least five participating. The determination is published to this System and acting authority vests immediately under the applicable succession provision.</p>
  <p>The Council does not acquire executive authority by making the determination. Authority goes only where §2.5(6) or §2.9(6) already directs it.</p>

  <div class="nrs-section-head">2. Ordinary Restoration</div>
  <p>The Consul may ordinarily end the incapacity by publishing a declaration that the incapacity has ended. <strong>Full authority returns 24 hours after publication.</strong></p>
  <p>The interval is a transition period, not an approval process. On a first incapacity no court, chamber, medical body, or Council vote is required for restoration.</p>

  <div class="nrs-section-head">3. Repeated Incapacity Inside Ninety Days</div>
  <p>Where incapacity is again determined on the same or substantially similar grounds within <strong>90 days of restoration</strong>, the determination requires <strong>two-thirds of the deciding body</strong>.</p>
  <p>For the next <strong>30 days</strong>, a restoration declaration does not operate alone. Restoration requires approval by a majority of the deciding body, or relief granted by the SC. Expiration of the heightened period does not itself restore the Consul; absent an extension, the ordinary restoration rule again governs.</p>

  <div class="nrs-section-head">4. Longer Periods</div>
  <p>By simple majority of each chamber, the Legislature may authorize the heightened determination to remain operative for a specified longer period, never beyond <strong>six months from the heightened determination</strong>. The same restoration and SC-review rights remain available throughout.</p>
  <p>Continuation beyond the authorized period requires a fresh two-thirds determination. The legislative votes authorize duration; they do not themselves determine incapacity.</p>

  <div class="nrs-section-head">5. Supreme Court Review</div>
  <p>A Consul under the heightened procedure may petition the SC for expedited review. Review is limited to whether §2.16 was lawfully invoked and whether the stated grounds concern inability to exercise the authority of the office. <strong>Political or policy disagreement alone is not incapacity.</strong></p>

  <div class="nrs-section-head">6. Depleted Council</div>
  <p>Where fewer than five Council members are available, enough legislators to bring the deciding body to five are selected by lot. For a Civic Consul proceeding they are selected from the Senate; for a Legat Consul proceeding they are selected from the Assembly. The ordinary majority and heightened two-thirds thresholds then apply to that body.</p>

  <div class="nrs-section-head">7. Declination</div>
  <p>A person upon whom acting executive authority would fall may decline by publishing a declination within <strong>48 hours</strong>. Acting authority then passes by constitutional operation to the next person in the applicable succession order.</p>
  <p>A declination is irrevocable but does not prejudice eligibility for a future succession event. Silence for 48 hours is deemed acceptance. The person last in the order of succession may not decline.</p>

  <div class="nrs-section-head">8. Status of the Consul</div>
  <p>Incapacity suspends only the exercise of authority. The Consul remains the holder of the office; the term, compensation, benefits, and constitutional protections continue. Removal, resignation, death, or another constitutional succession event remains available according to the provisions governing that event.</p>

  <div class="nrs-section-head">Records Generated Under This Section</div>
  <p>Material acts under §2.16 are entered in the constitutional record: incapacity determinations and votes, restoration declarations and approvals, declinations, legislative authorizations of longer periods, and judgments on expedited SC review.</p>

'''
s, n = re.subn(r'  <div class="nrs-section-head">1\. When a Consul Is Temporarily Unable to Exercise Authority</div>.*?(?=  <div class="nrs-section-head">Note on Scope</div>)', body, s, flags=re.S)
if n != 1:
    raise RuntimeError(f'Expected one NRS procedural body replacement, got {n}')
p.write_text(s, encoding='utf-8')

# Add a current public update; preserve prior update/history entries as historical records.
p = root / '_data/updates.js'
s = p.read_text(encoding='utf-8')
marker = 'const updates = [\n'
entry = '''  {
    category: "constitution",
    badge: "Amendment",
    title: "§2.16 — Recurring Executive Incapacity",
    blurb: "Executive incapacity now separates a first temporary interruption from a repeated dispute: recurrence inside 90 days requires 2/3, adds SC review, and permits time-limited legislative extensions without turning incapacity into removal.",
    href: "scenario-the-twenty-four-hours.html",
  },
'''
if entry not in s:
    if marker not in s:
        raise RuntimeError('updates.js insertion point not found')
    p.write_text(s.replace(marker, marker + entry, 1), encoding='utf-8')
