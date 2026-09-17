from pathlib import Path
import re

root = Path('.')

files = {
"torenthia-nrs-038.html": r'''---
worldKind: nrs
worldSeq: 117
worldDate: "13.12"
worldTitle: "Notice of Refusal — Norvane, National Trust Designation, Argent Ridge Parcel"
worldOutlet: "National Record System"
worldBlurb: "Norvane declines consent to the proposed Argent Ridge National Trust designation, citing the State's immediate need to preserve the parcel's residential development option for the northern arrival corridor."
worldPlaces: "argent-ridge,norvane"
---
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <link rel="icon" href="favicon.ico" sizes="any">
  <link rel="icon" type="image/png" href="favicon-32.png" sizes="32x32">
  <link rel="apple-touch-icon" href="apple-touch-icon.png">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Notice of Refusal — Norvane, National Trust Designation, Argent Ridge Parcel — National Record System</title>
  <meta name="description" content="Norvane declines consent to the proposed Argent Ridge National Trust designation under §18.4.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600&family=Jost:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="site.css">
  <style>
    .nrs-masthead{background:#1a2a1a;border-bottom:3px solid #4a8a4a;padding:1.5rem 2rem;margin-bottom:0}.nrs-masthead-inner{max-width:700px;margin:0 auto}.nrs-eyebrow{font-family:'JetBrains Mono',monospace;font-size:.6rem;letter-spacing:.2em;text-transform:uppercase;color:#6aaa6a;margin-bottom:.5rem}.nrs-doc-id{font-family:'JetBrains Mono',monospace;font-size:1.4rem;color:#c8e8c8;letter-spacing:.05em}.nrs-doc-subtitle{font-family:'Cormorant Garamond',serif;font-size:1.1rem;font-style:italic;color:rgba(200,232,200,.7);margin-top:.3rem}.nrs-body{background:#f4faf4;border:1px solid #a0c8a0;padding:2rem;font-family:'JetBrains Mono',monospace;font-size:.8rem;line-height:1.9;color:#0a1a0a;margin:2rem 0}.nrs-section-head{font-family:'JetBrains Mono',monospace;font-size:.68rem;letter-spacing:.18em;text-transform:uppercase;color:#2a6a2a;border-bottom:1px solid #a0c8a0;padding-bottom:.35rem;margin:2rem 0 1rem}.nrs-section-head:first-child{margin-top:0}.nrs-field{display:flex;gap:.75rem;margin-bottom:.35rem;flex-wrap:wrap}.nrs-field-label{color:#2a6a2a;min-width:210px;flex-shrink:0}.nrs-body p{margin:0 0 .9rem}.nrs-nav{max-width:700px;margin:0 auto 4rem;padding:0 1rem;display:flex;justify-content:space-between;gap:1rem;font-family:'Jost',sans-serif;font-size:.85rem}.nrs-nav a{color:var(--gold2);text-decoration:none}
  </style>
</head>
<body>
  <a href="#main-content" class="skip-nav">Skip to main content</a>
  <div id="site-nav"></div>
  <div class="nrs-masthead"><div class="nrs-masthead-inner"><div class="nrs-eyebrow">National Record System &middot; State Consent &middot; Year 13</div><div class="nrs-doc-id">NRS-Y13-0664</div><div class="nrs-doc-subtitle">National Trust Designation &mdash; Host State Response</div></div></div>
  <main id="main-content"><div class="nrs-body">
    <div class="nrs-section-head">Record Identification</div>
    <div class="nrs-field"><span class="nrs-field-label">NRS Reference:</span><span>NRS-Y13-0664</span></div>
    <div class="nrs-field"><span class="nrs-field-label">Subject:</span><span>Argent Ridge federal parcel &mdash; proposed National Trust designation</span></div>
    <div class="nrs-field"><span class="nrs-field-label">State:</span><span>Norvane</span></div>
    <div class="nrs-field"><span class="nrs-field-label">Constitutional Basis:</span><span>Federated Republic &sect;18.4</span></div>
    <div class="nrs-field"><span class="nrs-field-label">Related Records:</span><span>NRS-Y13-0498; NRS-Y13-0616 (Varek consent)</span></div>
    <div class="nrs-section-head">State Response</div>
    <p>Norvane does not consent to designation of the Argent Ridge parcel as a National Trust at this time.</p>
    <p>The State identifies the residential development authorized for the Norvane portion of the parcel as the largest presently available buildable tract within practical reach of the northern Lake Varda arrival corridor. Existing reception capacity remains under material pressure. The State states that surrendering the development option before replacement housing capacity is secured would materially constrain its ability to provide shelter and related services.</p>
    <p>This refusal does not dispute the cultural, environmental, or public value of Argent Ridge and does not object to Varek's consent as to its own portion. It states only that Norvane cannot presently consent to a federal designation that would remove the residential option available on its side of the parcel.</p>
    <div class="nrs-section-head">Effect</div>
    <p>The host-State consent requirement of &sect;18.4 is not satisfied. The proposed National Trust designation does not take effect.</p>
    <p><em>End of record.</em></p>
  </div><div class="nrs-nav"><a href="torenthia-nrs-035.html">&larr; Varek Consent</a><a href="torenthia-record.html">The Record &rarr;</a></div></main>
  {% include "footer.njk" %}<script src="nav.js"></script>
</body>
</html>
''',
"torenthia-news-076.html": r'''---
worldKind: news
worldSeq: 118
worldDate: "13.12"
worldTitle: "Norvane Says No to Riverglow. The Reason Is a Freight Shed."
worldOutlet: "The Torenthian"
worldAuthor: "Aleth Fenn"
worldBlurb: "Norvane has refused the consent needed to protect Argent Ridge as a National Trust. The State says the same land is its best remaining housing option near the northern arrival corridor."
worldPlaces: "argent-ridge,norvane,varek"
---
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><link rel="icon" href="favicon.ico" sizes="any"><link rel="icon" type="image/png" href="favicon-32.png" sizes="32x32"><link rel="apple-touch-icon" href="apple-touch-icon.png"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Norvane Says No to Riverglow. The Reason Is a Freight Shed. — The Torenthian</title>
  <meta name="description" content="Norvane refuses consent to the Argent Ridge National Trust designation because it wants to preserve the tract's housing option for the northern arrival corridor.">
  <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600&family=Jost:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet"><link rel="stylesheet" href="site.css">
</head>
<body class="paper-torenthian"><a href="#main-content" class="skip-nav">Skip to main content</a><div id="site-nav"></div>
<main id="main-content"><div class="article-wrap">
  <div class="article-section">The North &middot; Argent Ridge</div>
  <h1 class="article-headline">Norvane Says No to Riverglow. The Reason Is a Freight Shed.</h1>
  <p class="article-deck">Varek consented to protecting the ridge. Norvane has now refused. Its reason is not opposition to the place. It is that the State still needs somewhere to put people.</p>
  <div class="article-byline"><span class="byline-author">Aleth Fenn</span><span class="byline-role">Northern Correspondent</span><span class="byline-sep">&middot;</span><span>Norvane</span><span class="byline-date">Year 13, Month 12</span></div>
  <div class="article-body">
    <p>Norvane has refused the consent required to designate Argent Ridge as a National Trust, stopping a proposal that already has the necessary federal supermajorities and Varek's approval.</p>
    <p>The filing is blunt about why. The residential half of the development authorized on Norvane's side of the ridge is the largest buildable federal tract within practical reach of the State's northern Lake Varda arrival corridor. People are still sleeping in a converted freight shed. Norvane is not willing to give up the option of building housing there before it has another one.</p>
    <p>That makes this the argument Riverglow's campaign has been heading toward since before most of its volunteers knew it existed. Repealing the development statute can stop this development. It cannot protect the land permanently. Protection requires a National Trust designation under &sect;18.4, and because the ridge crosses two States, both must consent.</p>
    <p>Varek said yes last month. Norvane has now said no.</p>
    <p>The State's filing does not dispute that the ridge is loved, and it does not object to Varek protecting its own side. It says Norvane cannot surrender the residential option while its reception system remains under pressure.</p>
    <p>That distinction is not helping people who have spent months collecting signatures under a statute they now understand does not answer the question they thought they were asking.</p>
    <p>One Riverglow organizer, reached after the filing appeared, did not accuse Norvane of bad faith. "If they were trying to build a resort, this would be easy," she said. "They're trying to get families out of a freight shed. That doesn't make the ridge less worth saving. It just means there isn't a villain to beat."</p>
    <p>Nothing in the Constitution gives the federal government a way to override the refusal. That is what State consent means. Norvane can change its answer later, but until it does, the Trust designation cannot take effect.</p>
    <p>The citizen-repeal campaign continues on its separate track. If it succeeds, the Argent Ridge Act falls. The land would still be federal, still undesignated, and still capable of becoming the subject of another disposal statute later. The two processes now sit beside each other in public: one may stop a law, and the other is blocked by a State that needs the land for something most of the campaign's own supporters do not want to dismiss.</p>
  </div>
  <div class="article-nav"><a href="torenthia-nrs-038.html">&larr; Norvane's filing</a><a href="torenthia-state-norvane.html">Norvane profile &rarr;</a></div>
</div></main>{% include "footer.njk" %}<script src="nav.js"></script></body></html>
''',
"torenthia-news-077.html": r'''---
worldKind: news
worldSeq: 119
worldDate: "13.12"
worldTitle: "Valedon Says Yes, but Not to Torenthia's Agenda"
worldOutlet: "The Torenthian"
worldAuthor: "Petra Vend"
worldBlurb: "Valedon accepts the proposed Lake Varda conference and offers to host it, while insisting the meeting begin with regional navigation and civilian safety rather than any government's account of the Varda incidents."
---
<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><link rel="icon" href="favicon.ico" sizes="any"><link rel="icon" type="image/png" href="favicon-32.png" sizes="32x32"><link rel="apple-touch-icon" href="apple-touch-icon.png"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Valedon Says Yes, but Not to Torenthia's Agenda — The Torenthian</title><meta name="description" content="Valedon accepts the Lake Varda conference and offers to host, while narrowing the agenda to navigation and civilian safety."><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600&family=Jost:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet"><link rel="stylesheet" href="site.css"></head>
<body class="paper-torenthian"><a href="#main-content" class="skip-nav">Skip to main content</a><div id="site-nav"></div><main id="main-content"><div class="article-wrap">
<div class="article-section">Foreign Affairs &middot; Lake Varda</div><h1 class="article-headline">Valedon Says Yes, but Not to Torenthia's Agenda</h1><p class="article-deck">The second invited government has accepted the Lake Varda conference and offered to host it. Its answer also makes clear that accepting a table is not accepting Torenthia's description of what belongs on it.</p>
<div class="article-byline"><span class="byline-author">Petra Vend</span><span class="byline-role">Political Correspondent</span><span class="byline-sep">&middot;</span><span>Verentum</span><span class="byline-date">Year 13, Month 12</span></div>
<div class="article-body">
<p>Valedon has accepted Torenthia's proposal for a trilateral conference on Lake Varda, removing the last unanswered invitation from a diplomatic initiative that began after the Sunderland Interim Authority repeatedly failed to provide substantive answers about the lake incidents.</p>
<p>The acceptance is not an endorsement of Torenthia's account. Valedon's written reply says the meeting should begin with civilian navigation, cross-border rescue coordination, and procedures for reducing the risk of another encounter on the lake. Questions of responsibility for prior incidents may be raised, it says, but should not be treated as agreed premises of the conference.</p>
<p>Valedon also offered to host the talks. The original Torenthian proposal had identified Valedon as a possible venue and co-convener precisely because the Directorate said it knew of no direct Valedon interest in Sunderland. The reply accepts that role in similarly narrow language.</p>
<p>Caldris accepted last month, also without endorsing Torenthia's account. Its response said participation meant talks only. With Valedon's answer, all three proposed participants have now agreed to meet in principle.</p>
<p>What they have not agreed is a date, a final agenda, or the level of delegation. The Foreign Affairs Directorate said scheduling discussions would begin immediately and that any agreed conference notice would be published to the NRS.</p>
<p>The result is progress of the most diplomatic kind: everybody has agreed there should be a room, and nobody has yet agreed what the first sentence spoken inside it should mean.</p>
</div><div class="article-nav"><a href="torenthia-news-070.html">&larr; Caldris accepts</a><a href="torenthia-record.html">The Record &rarr;</a></div></div></main>{% include "footer.njk" %}<script src="nav.js"></script></body></html>
''',
"torenthia-news-078.html": r'''---
worldKind: news
worldSeq: 120
worldDate: "13.12"
worldTitle: "The Winter Timetable Starts Monday"
worldOutlet: "TNB Caldenmere"
worldAuthor: "TNB News Desk"
worldBlurb: "Caldenmere's regional rail operator moves to its winter timetable Monday, adding early morning service on two inland lines and dropping three late-evening runs with low seasonal use."
worldMundane: true
---
<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><link rel="icon" href="favicon.ico" sizes="any"><link rel="icon" type="image/png" href="favicon-32.png" sizes="32x32"><link rel="apple-touch-icon" href="apple-touch-icon.png"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>The Winter Timetable Starts Monday — TNB Caldenmere</title><meta name="description" content="Caldenmere regional rail moves to its winter timetable Monday, with earlier inland service and fewer late-evening trains."><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600&family=Jost:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet"><link rel="stylesheet" href="site.css"></head>
<body class="paper-tnb"><a href="#main-content" class="skip-nav">Skip to main content</a><div id="site-nav"></div><main id="main-content"><div class="article-wrap">
<div class="article-section">Caldenmere &middot; Transport</div><h1 class="article-headline">The Winter Timetable Starts Monday</h1><p class="article-deck">Two inland lines get earlier trains for winter shift changes. Three late-evening services with low seasonal use come off the board until spring.</p>
<div class="article-byline"><span class="byline-author">TNB News Desk</span><span class="byline-role">Caldenmere Bureau</span><span class="byline-sep">&middot;</span><span>Caldenmere</span><span class="byline-date">Year 13, Month 12</span></div>
<div class="article-body">
<p>Caldenmere's regional rail operator will switch to its winter timetable on Monday, moving the first trains on two inland routes earlier and suspending three late-evening services until spring.</p>
<p>The operator said the earlier departures reflect seasonal shift changes at food-processing and maintenance facilities along the inland lines. The first trains will leave twenty-five and forty minutes earlier respectively. Connecting buses will move with them.</p>
<p>Three late-evening trains with consistently low winter use will be removed from the schedule. The last remaining service on each route will still depart after the evening commuter period, and the operator said no station will lose its final connection to the regional hub.</p>
<p>Printed timetables are being replaced this week. Existing tickets remain valid, and monthly pass holders do not need to replace their cards.</p>
<p>The winter schedule is expected to remain in effect until the first Monday of Month 3.</p>
</div><div class="article-nav"><a href="torenthia.html">&larr; The World</a><a href="torenthia-record.html">The Record &rarr;</a></div></div></main>{% include "footer.njk" %}<script src="nav.js"></script></body></html>
'''
}

for name, content in files.items():
    p = root / name
    if p.exists():
        raise RuntimeError(f'{name} already exists')
    p.write_text(content, encoding='utf-8')

# Norvane state profile: make the now-published refusal current.
p = root / 'torenthia-state-norvane.html'
s = p.read_text(encoding='utf-8')
old = '<p>Varek has <a href="torenthia-nrs-035.html">filed its consent</a> to the proposed National Trust designation. Norvane has not responded. This profile describes the State whose consent is still required; the public record below follows that question as it develops.</p>'
new = '<p>Varek has <a href="torenthia-nrs-035.html">filed its consent</a> to the proposed National Trust designation. Norvane has now <a href="torenthia-nrs-038.html">refused consent</a>, citing the same residential tract as its best remaining large housing option near the northern arrival corridor. The Trust designation therefore cannot take effect unless Norvane later changes its position.</p>'
if old not in s: raise RuntimeError('Norvane profile marker not found')
p.write_text(s.replace(old,new), encoding='utf-8')

# Argent Ridge arc: preserve the planned logic, now mark it published.
p = root / 'docs/ARGENT-RIDGE-ARC.md'
s = p.read_text(encoding='utf-8')
s = s.replace('- Norvane has **not responded**. References below to a future refusal remain arc planning,\n  not a published event. Phase One repeal signatures and the separate Trust request remain open.', '- Norvane **refused consent** in **nrs-038**, with the human consequences covered in **news-076**\n  (seq 117–118). The refusal preserves the residential development option near the northern arrival\n  corridor while reception capacity remains under pressure. Phase One repeal signatures remain open.')
s = s.replace('**BEAT 5+ — the two-state deadlock.** [ongoing background thread]\nVarek consents. Norvane refuses. The human politics of WHY each state lands where it does.\nThis can run indefinitely as background texture — the Republic visibly continuing after Thoss.', '**BEAT 5+ — the two-state deadlock.** [PUBLISHED OPENING — nrs-038 + news-076, Y13 M12]\nVarek consents. Norvane refuses. The first deadlock beat is now public: Norvane ties its refusal\nto arrival-corridor housing capacity, not hostility to Riverglow. The thread can continue as\nbackground texture through the separate repeal campaign and any later change in State position.')
p.write_text(s, encoding='utf-8')

# Character/reference: Valedon has now answered, without inventing a government or official.
p = root / 'docs/CHARACTER-REFERENCE.md'
s = p.read_text(encoding='utf-8')
old = '| **Valedon** | "The nation that almost joined" (Year 18 referendum, §15.6). No prior diplomatic content — only appeared before as a road name near Morantine Territory (dispatch-sarn). nrs-032 invites Valedon as **proposed venue and co-convener**, explicitly not as a stakeholder — the Directorate states it is not aware of any direct Valedon interest in Sunderland and the invitation does not presume one. | **This is genuinely the first Valedon diplomatic content in the project.** No capital city, government structure, or named official exists yet — do not invent one without checking world-canon.md\'s editorial rule that map/place detail follows coverage. |'
new = '| **Valedon** | "The nation that almost joined" (Year 18 referendum, §15.6). Invited in nrs-032 as proposed venue and co-convener, explicitly not as a stakeholder. In news-077 Valedon accepts, offers to host, and narrows the opening agenda to civilian navigation, rescue coordination, and risk reduction without adopting Torenthia\'s account of prior incidents. | No capital city, government structure, or named official exists yet. The written reply remains institutional and unnamed; do not invent those details without a coverage reason. |'
if old not in s: raise RuntimeError('Valedon character reference marker not found')
p.write_text(s.replace(old,new), encoding='utf-8')

# Pending file: replace the stale batch handoff with current results, and note Korda had already advanced.
p = root / 'docs/WORLD-THREADS-PENDING.md'
s = p.read_text(encoding='utf-8')
start = s.index('## NEXT BATCH HANDOFF')
end = s.index('\n---\n', start)
block = '''## NEXT BATCH HANDOFF — 260917 / Y13 M12

- **Argent Ridge:** Norvane's outstanding §18.4 response is now resolved. `torenthia-nrs-038.html`
  records refusal; `torenthia-news-076.html` carries the human angle. Varek consented earlier, so
  the National Trust designation is blocked unless Norvane later changes position. The separate
  citizen-repeal campaign remains open.
- **Lake Varda conference:** `torenthia-news-077.html` records Valedon's acceptance and offer to
  host. All three proposed participants now agree to meet in principle; date, final agenda, and
  delegation level remain open. Valedon does not adopt Torenthia's account of the prior incidents.
- **Mundane:** `torenthia-news-078.html` is an ordinary Caldenmere winter rail-timetable change.
  `worldMundane: true`; no hidden hook or follow-up obligation.
- **Korda:** no extra procedural beat added in this batch because canon had already advanced past
  the earlier suggestion: the Convention opened and `torenthia-nrs-037.html` records the same-day
  Supreme Court challenge. That live arc remains governed by `KORDA-CONVENTION-ARC.md`.
- **Publishing:** the two substantive news entries and the Norvane filing belong in the World/Record
  surfaces. The mundane rail item stays Record-only. None warrants a main-site What's New entry.
'''
s = s[:start] + block + s[end:]
p.write_text(s, encoding='utf-8')

# Timeline current-state edits. Do not rebuild the long historical index by hand; append the four new rows.
p = root / 'docs/WORLD-TIMELINE.md'
s = p.read_text(encoding='utf-8')
s = re.sub(r'\*Last verified: .*?\*', '*Last verified: 260917, against published world front matter through seq 120.*', s, count=1)
s = s.replace('**Current world date: Year 13, Month 11.**', '**Current world date: Year 13, Month 12.**')
s = s.replace('| **No clock at all** | Argent Ridge Trust designation: Varek has consented; Norvane’s consent remains outstanding, with no response deadline. The Norvane profile supplies context without announcing a decision. | nrs-029, news-069, nrs-035 |', '| **No clock at all** | Argent Ridge Trust designation: Varek consented; Norvane has now refused, so the §18.4 designation cannot take effect unless Norvane later changes position. The separate §13.1 repeal campaign continues. | nrs-029, news-069, nrs-035, nrs-038, news-076 |')
s = s.replace('| **Not yet started** | Territory Convention 90-day clock (§15.5.a(4)): the JMC has determined both petitions must enter the Convention process. No first-session date announced; the clock begins at that session, not at the determination. | nrs-034, news-073 |', '| **Started Year 13, Month 12, Day 9** | Territory Convention 90-day clock (§15.5.a(4)) began with the first session. A same-day SC challenge now contests the JMC trigger; no stay has yet been published. | nrs-034, news-075, nrs-036, nrs-037 |')
s = re.sub(r'\| \*\*Argent Ridge\*\* \(Norvane, §13\.1/§18\.4\) \|.*?\|\n', '| **Argent Ridge** (Norvane, §13.1/§18.4) | 118 / 13.12 | **LIVE, Trust designation blocked.** nrs-038/news-076: Norvane refused §18.4 consent because the residential side of the tract remains its best large housing option near the northern arrival corridor. Varek has already consented. The separate §13.1 repeal campaign continues; even a repeal would not itself create Trust protection. |\n', s, count=1)
s = re.sub(r'\| \*\*Lake Varda / Sunderland crisis\*\* \|.*?\|\n', '| **Lake Varda / Sunderland crisis** | 119 / 13.12 | **LIVE — all three proposed conference participants now agree to meet in principle.** news-077: Valedon accepted and offered to host, while narrowing the opening agenda to civilian navigation, rescue coordination, and risk reduction rather than accepting Torenthia\'s account of prior incidents. Caldris had already accepted on similarly narrow terms. No date, final agenda, or delegation level is set. The §10.2 redaction petition remains separately open. |\n', s, count=1)
# append rows to chronological index if not already present
if '| 117 | 13.12 | NRS | Notice of Refusal — Norvane' not in s:
    s += '\n| 117 | 13.12 | NRS | Notice of Refusal — Norvane, National Trust Designation, Argent Ridge Parcel | National Record System |\n| 118 | 13.12 | News | Norvane Says No to Riverglow. The Reason Is a Freight Shed. | The Torenthian |\n| 119 | 13.12 | News | Valedon Says Yes, but Not to Torenthia\'s Agenda | The Torenthian |\n| 120 | 13.12 | News | The Winter Timetable Starts Monday | TNB Caldenmere |\n'
p.write_text(s, encoding='utf-8')

print('Torenthia batch staged.')
