from pathlib import Path
import re

ROOT = Path(".")

def write(path, text):
    (ROOT / path).write_text(text, encoding="utf-8")

def news(seq, title, outlet, author, section, deck, body, blurb, mundane=False, image=None):
    fn = f"torenthia-news-{seq:03d}.html"
    fm = [
        "---",
        "worldKind: news",
        f"worldSeq: {seq+44}",
        'worldDate: "13.12"',
        f'worldTitle: "{title}"',
        f'worldOutlet: "{outlet}"',
        f'worldAuthor: "{author}"',
        f'worldBlurb: "{blurb}"',
    ]
    if mundane:
        fm.append("worldMundane: true")
    if image:
        fm.append(f'worldImage: "{image}"')
    fm.append("---")
    paper = "tnb" if outlet.startswith("TNB") else "torenthian"
    role = "News Desk" if author == "TNB News Desk" else "Political Correspondent"
    place = "Korda" if outlet == "The Korda Press" else "Verentum"
    html = "\n".join(fm) + f"""
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <link rel="icon" href="favicon.ico" sizes="any">
  <link rel="icon" type="image/png" href="favicon-32.png" sizes="32x32">
  <link rel="apple-touch-icon" href="apple-touch-icon.png">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title} — {outlet}</title>
  <meta name="description" content="{blurb}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600&family=Jost:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="site.css">
</head>
<body class="paper-{paper}">
  <a href="#main-content" class="skip-nav">Skip to main content</a>
  <div id="site-nav"></div>
  <main id="main-content">
    <div class="article-wrap">
      <div class="article-section">{section}</div>
      <h1 class="article-headline">{title}</h1>
      <p class="article-deck">{deck}</p>
      <div class="article-byline">
        <span class="byline-author">{author}</span>
        <span class="byline-role">{role}</span>
        <span class="byline-sep">&middot;</span>
        <span>{place}</span>
        <span class="byline-date">Year 13, Month 12</span>
      </div>
      <div class="article-body">
{body}
      </div>
      <div class="article-nav">
        <a href="torenthia.html">&larr; The World</a>
        <a href="torenthia-record.html">The Record &rarr;</a>
      </div>
    </div>
  </main>
  {{% include "footer.njk" %}}
  <script src="nav.js"></script>
</body>
</html>
"""
    write(fn, html)

news(
79,
"The Convention Is Going Home",
"The Torenthian",
"Petra Vend",
"Korda &middot; Territory Convention",
"The Korda Territory Convention voted to move its remaining sessions from Verentum to Korda. The vote settled where the delegates will sit, not what they will decide.",
"""        <p>The Korda Territory Convention will move its remaining sessions out of Verentum and into Korda after delegates approved relocation by 25 votes to 8.</p>
        <p>The motion does not change the Convention's constitutional authority, its membership, or the ninety-day period that resumed after the Supreme Court dissolved its interim stay. It changes only the place where the thirty-three Korda Assembly delegates will do the work.</p>
        <p>The argument for moving was mostly practical and only partly symbolic. Delegates supporting relocation said residents should not have to travel to the federal capital to watch a proceeding about the future of their own Territory, and that local press, municipal officials, petition organizers, and ordinary residents would be easier to hear inside Korda than from a committee room in Verentum.</p>
        <p>Opponents did not argue that the Convention belonged permanently in the capital. Their concern was delay. The Convention has already lost time to litigation, and some delegates wanted the existing rooms, staff, translation support, and public-record systems left undisturbed while the clock runs.</p>
        <div class="pull-quote"><p>"If moving the chairs takes four days, then it costs four days," one opposing delegate said during debate. "Nobody should pretend logistics are free because the symbolism is attractive."</p></div>
        <p>Dessa Orin supported relocation but declined to connect that vote to either underlying petition. "Where we meet is not what we decide," she said. "People at home deserve to see this close up. They also deserve not to be told that moving the room means we have chosen the answer."</p>
        <p>The Convention clerk said the next sitting will take place in Korda once a public venue and records facility are confirmed. The clock continues to run in the meantime. Nothing in the relocation vote alters the requirement that any eventual Convention resolution still go to the affected voters and then through the ordinary constitutional path for the status it proposes.</p>""",
"The Korda Territory Convention votes 25–8 to move its remaining sessions from Verentum into Korda, changing the venue without deciding either petition."
)

news(
80,
"Now There Is Actually Going to Be a Meeting",
"The Torenthian",
"Petra Vend",
"LC Race &middot; Lake Varda",
"Caldris and Valedon have both accepted the Lake Varda conference in principle. For the four Legat Consul candidates, a proposal that was hypothetical last month is now part of the record they have to campaign around.",
"""        <p>There is still no conference date, no final agenda, and no agreed delegation level. But there will, barring a new breakdown, be a meeting. Caldris has accepted. Valedon has accepted and offered to host. The diplomatic proposal issued by Ines Carrow's Directorate is no longer an invitation waiting for answers.</p>
        <p>That makes the politics harder for all four Legat Consul candidates, including Carrow.</p>
        <p>Carrow's campaign again refused to treat the development as a campaign achievement. Her Directorate said scheduling work is continuing through official channels and that campaign staff are not participating in those discussions. Asked whether she would attend if the conference occurs during the electoral period, Carrow said only that attendance would be decided by the sitting Legat Consul and the participating governments.</p>
        <p>Tobias Vael welcomed the fact that neighboring governments had agreed to talk but said the test was what Torenthia was willing to concede. "A meeting is not a policy," his statement said. "The Republic should enter it knowing what it will not trade away."</p>
        <p>Seren Mak called the acceptances overdue and said the conference should include an explicit timetable for civilian navigation protections on Lake Varda. Her campaign did not answer whether Torenthia should accept Valedon's narrower framing of the opening agenda.</p>
        <p>Pell Sandris, who last month was the only rival willing to say plainly that Carrow's current office gives her a structural advantage in the race, took much the same line again. "This is good work," he said. "It is also work being done by the government she currently serves. Voters can credit the official, the institution, both, or neither. The rest of us do not get to pretend it didn't happen because it is inconvenient."</p>
        <p>The awkwardness runs in both directions. Carrow gains visibility from a process she is not free to campaign through, while her opponents have to respond to a diplomatic development without turning a still-unresolved security problem into a prop. The conference is now real enough to matter and unfinished enough that nobody can safely claim the result.</p>""",
"With both Caldris and Valedon now willing to attend the Lake Varda conference, all four Legat Consul candidates have to campaign around a diplomatic process that is finally real but still unresolved."
)

news(
81,
"Thirty-Three Delegates, Three Kordas",
"The Korda Press",
"Mara Iset",
"The Convention &middot; Delegates",
"The Convention is one body on paper. Its delegates arrive from districts that experience Korda very differently — the lake corridor, the interior, and the administrative center among them.",
"""        <p>The Constitution gives Korda one Territory Convention. It does not give its thirty-three delegates one reason for being there.</p>
        <p><strong>Dessa Orin</strong> is already familiar outside the Territory. She sits on the Assembly's Territories and Fiscal Affairs Committee, co-sponsored the fiscal equalization measure that helped propel Elin Thoss into national attention, and has spent years pressing federal offices over Korda's infrastructure queue. Her public position inside the Convention remains deliberately incomplete. She has said the whole Territory deserves a workable future and has not said which petition provides it.</p>
        <p><strong>Jalen Mire</strong> represents a lake-corridor district where the canceled merger referendum was not an abstraction. His district had organizers, polling locations, and voters who expected to decide whether their communities should join Kelvant. Mire has not endorsed the merger petition in the Convention. He has, however, objected repeatedly to language suggesting the canceled referendum can be treated as though it never qualified. "Those signatures are not a preliminary draft," he said after the relocation vote. "People did the work the Constitution asked them to do."</p>
        <p><strong>Tomas Rell</strong> represents an inland district whose residents would not have voted in the corridor referendum at all. His district includes farming communities tied to the same roads and transfer system that whole-Territory petitioners have cited for years. Rell says the Convention exists because a decision about one part of Korda could materially change what remains. "The corridor has a claim," he said. "So does the place left on the other side of the line."</p>
        <p>The distinctions are not clean factions. Mire voted to move the Convention into Korda. Rell did too. Orin has worked closely with the Civic Consul and still refuses to say what resolution she wants. Delegates who disagree about the petitions can agree about venue, records, witnesses, and what facts they need before taking a substantive vote.</p>
        <p>That is likely to matter as the Convention settles into its Korda sessions. The eventual resolution, if there is one, will look like a single proposition on paper. The room producing it contains several different versions of what Korda is now and what would count as preserving it.</p>""",
"A closer look at three Korda Convention delegates shows why the body cannot be reduced to two petition camps: corridor, inland, and federal-capacity grievances overlap without lining up neatly."
)

news(
82,
"Line 4 Adds Two Saturday Cars",
"TNB Verentum",
"TNB News Desk",
"Verentum &middot; Transit",
"Verentum's Line 4 tram will run two additional cars on Saturdays through the end of Month 12 after ridership on the midday service exceeded the seasonal timetable.",
"""        <p>Verentum Transit will add two cars to the Line 4 Saturday schedule through the end of Month 12, the agency said Thursday.</p>
        <p>The change affects the midday service only. The first and last departures remain unchanged, and weekday service will continue on the existing timetable.</p>
        <p>Transit staff said Saturday passenger counts have been running above the level used to set the seasonal schedule, particularly between the central interchange and the western residential stops. The additional cars will be inserted into the existing service rather than creating a new route.</p>
        <p>Printed timetables at major stops will be replaced over the next several days. The electronic timetable will show the added departures beginning this weekend.</p>
        <p>The temporary adjustment ends with Month 12. The agency said the ordinary seasonal timetable will then be reviewed before the next schedule is published.</p>""",
"Verentum Transit adds two Saturday cars to Line 4 through the end of Month 12 after midday ridership ran above the seasonal schedule.",
mundane=True
)

p = ROOT / "docs/CHARACTER-REFERENCE.md"
t = p.read_text(encoding="utf-8")
needle = "| **Dessa Orin** | Korda Assembly delegate, Territories and Fiscal Affairs Committee. Co-sponsor of Thoss's equalization bill. Her four-year-capacity-queue grievance is the established motive behind the whole-Territory petition. Will be automatically seated as a Convention delegate if/when the Convention triggers — **held back from the petition's public face deliberately**, so her Convention moment isn't pre-spent. |\n"
if needle not in t:
    raise SystemExit("Dessa Orin character row not found")
repl = needle + "| **Jalen Mire** | Korda Assembly delegate from a lake-corridor district. First named in news-081. Treats the canceled corridor referendum as a completed constitutional effort that must be respected in Convention deliberations; has not yet endorsed a substantive Convention outcome. |\n| **Tomas Rell** | Korda Assembly delegate from an inland agricultural district. First named in news-081. Emphasizes the interests of residents who would not have voted in the corridor referendum and the infrastructure/economic consequences for the remainder; has not yet endorsed a substantive Convention outcome. |\n"
t = t.replace(needle, repl)
p.write_text(t, encoding="utf-8")

p = ROOT / "docs/KORDA-CONVENTION-ARC.md"
t = p.read_text(encoding="utf-8")
anchor = "- **Still open:** the Convention's actual proceedings and resolution, Thoss's preferred\n"
insert = "- **news-079 (seq 123):** Convention relocation passes 25–8. Remaining sessions move from Verentum into Korda once a public venue/records facility is confirmed. This decides venue only; the clock continues and no substantive petition position is implied.\n- **news-081 (seq 125):** first delegate-texture piece beyond Orin. Jalen Mire (lake-corridor district) insists the canceled referendum remains a constitutional accomplishment that must be respected; Tomas Rell (inland agricultural district) stresses the interests of residents who had no vote in that referendum. Neither is locked to a final Convention outcome.\n"
if anchor in t:
    t = t.replace(anchor, insert + anchor)
t = t.replace("- **Still open:** the Convention's actual proceedings and resolution, Thoss's preferred\n  outcome, the relocation vote (Verentum → Korda), venue coverage once relocated, public\n  opinion polling, coverage of delegates beyond Orin.",
              "- **Still open:** the Convention's actual proceedings and resolution, Thoss's preferred\n  outcome, the exact Korda venue and first session there, public opinion polling, and deeper\n  delegate coverage.")
p.write_text(t, encoding="utf-8")

p = ROOT / "docs/WORLD-THREADS-PENDING.md"
t = p.read_text(encoding="utf-8")
marker = "*Storyline threads flagged but not yet activated or fully shaped. Captured here (not memory) so they survive compaction / new chats. When one is ready to activate and shape fully, promote it to its own ARC file like ARGENT-RIDGE-ARC.md / CORINDAL-ARC.md.*\n"
note = """
## LATEST WORLD BATCH — 260918 / Y13 M12

- **Korda relocation:** news-079 (seq 123) moves the Territory Convention from Verentum to Korda by a 25–8 procedural vote. It does not resolve either petition. Exact local venue remains open until a later beat needs it.
- **LC race / Varda:** news-080 (seq 124) has all four candidates react after both Caldris and Valedon accepted the conference in principle. Carrow keeps official scheduling separate from campaign activity; Vael stresses negotiating limits, Mak wants a civilian-navigation timetable, Sandris again names Carrow's structural incumbency advantage without alleging impropriety.
- **Convention delegates:** news-081 (seq 125) introduces Jalen Mire (corridor) and Tomas Rell (inland) alongside Dessa Orin. They establish different constituencies without locking three neat factions or pre-deciding the Convention.
- **Mundane:** news-082 (seq 126), TNB Verentum, adds two Saturday cars to Line 4 through Month 12. worldMundane: true; no hook and no follow-up obligation.
- **Publishing:** the three substantive entries belong in the World feed through front matter. The mundane entry remains Record-only. No main-site _data/updates.js announcement added.

"""
if "## LATEST WORLD BATCH — 260918 / Y13 M12" not in t:
    t = t.replace(marker, marker + note)
p.write_text(t, encoding="utf-8")

p = ROOT / "docs/WORLD-TIMELINE.md"
t = p.read_text(encoding="utf-8")
t = t.replace("*Last verified: 260917, against published world front matter through seq 122.*",
              "*Last verified: 260918, against published world front matter through seq 126.*")
t = re.sub(r'^\| \*\*Korda Convention arc\*\*[^\n]*$',
           "| **Korda Convention arc** (competing petitions, Convention active in Korda, SC challenge resolved) | 125 / 13.12 | **LIVE — venue moved; delegate positions beginning to emerge.** news-079: Convention votes 25–8 to relocate remaining sessions from Verentum to Korda; move changes venue only and clock continues. news-081 introduces Jalen Mire (corridor) and Tomas Rell (inland) alongside Orin, with distinct constituency concerns but no locked final positions. Next: confirm/use a Korda venue, hearings/evidence, polling, or first substantive Convention proposal without forcing a premature resolution. |",
           t, flags=re.M)
t = re.sub(r'^\| \*\*LC Race\*\*[^\n]*$',
           "| **LC Race** (Vael/Carrow/Mak/Sandris) | 124 / 13.12 | **LIVE, now campaigning around a real Lake Varda conference.** news-080: after Caldris and Valedon both accepted in principle, Carrow keeps Directorate scheduling separate from her campaign; Vael emphasizes negotiating limits, Mak asks for a civilian-navigation timetable, Sandris again names Carrow's structural incumbency advantage without alleging impropriety. No election date set. |",
           t, flags=re.M)
row122 = re.search(r'^\| 122 \|[^\n]*$', t, flags=re.M)
if not row122:
    raise SystemExit("seq 122 row not found in timeline")
rows = """| 123 | 13.12 | News | The Convention Is Going Home | The Torenthian |
| 124 | 13.12 | News | Now There Is Actually Going to Be a Meeting | The Torenthian |
| 125 | 13.12 | News | Thirty-Three Delegates, Three Kordas | The Korda Press |
| 126 | 13.12 | News | Line 4 Adds Two Saturday Cars | TNB Verentum |"""
if "| 123 | 13.12 | News | The Convention Is Going Home" not in t:
    t = t[:row122.end()] + "\n" + rows + t[row122.end():]
p.write_text(t, encoding="utf-8")

print("Torenthia batch written and bookkeeping updated.")
