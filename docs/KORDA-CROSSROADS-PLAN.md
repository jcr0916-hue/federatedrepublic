# Crossroads: The Korda Convention — Feature Plan
*Second installment of the "Living Crossroads" interactive format. First installment: `thoss-crossroads.json`, now SEALED.*
*Status: ACTIVE DRAFTING, revised 260918 — updated to current Korda canon after the relocation vote and delegate-profile beat. Structural plan is greenlit; role introductions and Scene 1 are now being authored in `docs/KORDA-CROSSROADS-CONTENT-DRAFT.md`.*

---

## 1. What this is

A branching, meter-driven interactive piece letting a reader play a Korda Territory Assembly delegate seated at the Territory Convention. The Convention convened under §15.5.a(4) following the Joint Monitor Council's determination that §15.5.a(1) applies (nrs-034); corridor petitioners then sued the JMC over that determination (nrs-037), the Court paused the Convention's clock while it decided (nrs-039), and ultimately affirmed the JMC 6–3 (*Korda Corridor Petitioners, et al. v. Joint Monitor Council*, SC-Y13-0119, decided Y13 M12 — `torenthia-sc-002.html`). The Convention has 90 days from its first session to produce a resolution or all petitions lapse together. After the Supreme Court dissolved the interim stay on Month 12 Day 26, three days were credited and roughly 87 days remained. Since then the Convention has voted 25–8 to relocate its remaining sessions from Verentum into Korda (`torenthia-news-079.html`), and the public record has begun to establish delegates beyond Orin (`torenthia-news-081.html`). The interactive therefore begins at the first sitting in Korda after relocation, with the litigation settled and approximately 87 days on the clock. The reader plays through a compressed version of that remaining period and reaches one of five possible endings.

**Corrected 260917:** the previous draft of this plan cited the case as *Kelvant Corridor Committee v. Elections Panel* (SC-Y13-0144) — that citation came from a discarded AI test opinion, never adopted as canon, and named the wrong defendant (Elections Panel instead of the JMC) with the wrong docket. The real case is above. It also framed the Convention as "triggered by" the court case; it wasn't — the JMC's determination triggered the Convention, and the court case is a challenge to that determination that the Convention survived.

**This is explicitly non-canon.** The real Convention resolves on its own schedule through actual NRS/news publication, independent of anything any reader chooses here. This mirrors the house precedent set by `thoss-crossroads.json`, which ran as a "what if" parallel to Thoss's actual path to the Civic Consulship and was marked `SEALED` once the §2.6 motion made her real path canon.

**Sealing plan:** the day the real Convention outcome publishes, this file gets the same treatment — a `"note": "SEALED. Korda Convention canon crossroads."` flag added, left live for readers to compare against, never edited further.

---

## 2. Technical architecture — reuse, mostly

The existing engine (`crossroads.html` + `api/crossroads.js`) is generic: it fetches a JSON file and runs whatever scenes/meters/fragments it finds. Most of the content plan below needs no new engine code. Three items, not two — the third is real work, not a formatting change:

1. **Generalize the data-source fetch.** `crossroads.html` currently hardcodes `fetch('thoss-crossroads.json')`. For this to be a recurring franchise rather than a one-off, that line should read the target file from a query parameter (`crossroads.html?game=korda-crossroads.json`), defaulting to the most recent installment.
2. **Update `ai-features.html`.** The current transparency page lists three features (Provision Annotator, Scenario Navigator, Government Questionnaire) and does not mention Living Crossroads at all, despite `crossroads.html` linking to it as "AI Feature*." Pre-existing gap, not introduced by this plan — but fix it alongside this launch: add a row describing the classifier's routing-only behavior (never generates prose, only maps free text to a pre-vetted fragment id).
3. **Corrected 260917 — role selection is new engine work, not a data-file concern.** `thoss-crossroads.json` was single-protagonist: fixed starting state, no role concept anywhere in `crossroads.html`. Checked the file directly — the intro screen renders `title`/`premise`/`scope` from the JSON and moves straight to Scene 1; there is no picker, no branch on which role is loaded, no mechanism for role-conditional starting meters or role-gated fragment sets. Playing two named delegates with different starting values and different available options at Scenes 1 and 3 needs: an intro role-picker screen, role-conditional meter initialization, and role-conditional fragment filtering read from the JSON. This is real client-side work on top of item 1, not covered by it. Scope it explicitly before committing to a date.

**Safety ceiling, unchanged from the Thoss version:** the AI (`/api/crossroads`, Claude, classifier-only) never writes narrative text. It receives the player's free-text move plus a list of fragment ids and one-line descriptors, and returns exactly one fragment id (or `out_of_bounds` / `needs_detail`). All prose the player ever sees was authored in advance and lives in the JSON. Confirmed against the live `api/crossroads.js` — this is exactly what it does. Deliberate cost/quality control; stays exactly as designed.

**New data file:** `korda-crossroads.json`, same schema as `thoss-crossroads.json` (`id`, `title`, `premise`, `note`, `glossary`, `articles`, `meters`, `scenes[]`, `endings{}` — confirmed against the sealed file directly), with the additions described in §4 below.

---

## 3. Playable roles

Two named delegates, selectable at the intro screen. Same scene sequence for both; role changes opening framing, starting meter values, and which fragments are available at role-relevant junctions (see §5).

### Sena Threll — Interior delegate
- **District:** an inland township near Adren, ancestral inland Korda.
- **Before politics:** ran logistics for the regional agricultural cooperative — personally rerouted grain shipments for years around infrastructure that never got funded, while investment went to the lake corridor instead.
- **Relationship to Orin:** ideologically aligned, one term junior, not a copy. Orin is the careful, quotable co-sponsor deliberately held back from the petition's public face; Threll has less to protect and says what Orin can't. A little private friction: the unglamorous work, someone else's name on it.
- **Starting agenda:** clean whole-Territory Statehood, no special corridor carve-outs. She's watched the corridor's petition clear every procedural hurdle already and doesn't start generous.

### Davin Kesh — Corridor delegate
- **District:** the lake corridor, based near Varenne Station.
- **Before politics:** ran a small freight-hauling operation through the corridor; personally circulated signatures for the original §15.4 petition.
- **Where he's standing now — corrected 260917:** the previous draft said he "organized a referendum that hit 60%+ approval" — that's wrong on two counts. 60% is the *passage threshold* §15.4 sets for the vote (restated in nrs-024), not a result, and the vote never happened at all — nrs-034/news-073 already established the Day 8 referendum was canceled before it could be held. Kesh's real grievance is sharper than "we won and it got erased": his petition certified, cleared its viability assessment, was scheduled and three weeks out — and then got erased by a second petition without ever reaching a ballot. He has never gotten to find out if his side would have won. Real, specific, court-conceded-legitimate grievance either way. Quiet pressure from Kelvant-side business contacts to hold the line — **this is a plausible landing spot for the still-unused Lakeland Journal business-interest voice** flagged in KORDA-CONVENTION-ARC.md; not required, but worth deciding on purpose rather than by accident.
- **Starting agenda:** preserve corridor distinctness — ideally a negotiated split, at minimum entrenched autonomy inside a unified Korda. Not reflexively hostile to the interior's case, but arrives believing his community was cheated of a vote it earned.

Both roles must be able to reach all five endings. A Kesh playthrough reaching Clean Whole Statehood should read as a real defeat he had a hand in; a Threll playthrough reaching Ugly Split should read as a real failure of her own management, not a locked-out outcome.

---

## 4. Meters

| id | label | start (Threll) | start (Kesh) | min | max |
|---|---|---|---|---|---|
| `interior` | Interior Support | 58 | 42 | 0 | 100 |
| `corridor` | Corridor Support | 30 | 64 | 0 | 100 |
| `swing` | Swing Votes | 35 | 35 | 0 | 100 |
| `days` | Days Remaining | 87 | 87 | 0 | 87 |

Starting values are placeholders for balancing, not final — tune once fragment deltas are written so neither role trivially wins or trivially loses. `days` begins at **87**, matching the published post-stay position, and counts down. The number is a compressed game clock, not a promise that every fictional scene maps one-for-one to a published calendar day.

A fifth internal-only flag (not shown as a meter bar, tracked in the ending logic) — `trust`: starts neutral, damaged by broken promises or a mishandled walkout threat, repaired by honored conditional commitments. This is what separates Negotiated Split from Ugly Split at the ending stage without needing a fifth visible bar.

### What the support meters mean — added 260918

`interior`, `corridor`, and `swing` are **not direct referendum polling and not literal vote counts for a particular constitutional outcome.** They track the playable delegate's credibility, coalition access, and ability to move members within those blocs. A Kesh playthrough can build corridor credibility and spend it selling a compromise; a Threll playthrough can earn corridor respect without abandoning whole-Territory Statehood. This keeps persuasion distinct from concession and prevents the meters from becoming disguised policy sliders.

Public polling may exist elsewhere in the live World/Stats layer, but it is environmental context only. It is not a fifth player-controlled meter and does not determine the Convention ending.

---

## 5. Scene outline (6 decision scenes + resolve)

### Scene 1 — "First Sitting in Korda"
The move from Verentum is complete. The Court case is over; the room now has to do political work. The player chooses how to use the first local sitting: force the substantive question early, build a cross-bloc working group, or spend the opening days organizing and persuading without changing the role's stated goal. Role-specific options let Threll consolidate the inland case while reaching toward Mire/Rell-type delegates, while Kesh can organize the corridor around the fact that its certified referendum was canceled before a ballot. **No concession is required in Scene 1.** This is the first place the game teaches the difference between holding a position and merely repeating it.
*Dimensions: own bloc / opposing bloc / swing delegates; public motion / working group / private whip count; speed versus information.*

### Scene 2 — "Orin's Offer"
Orin proposes that any Convention resolution carry an enforceable fiscal/infrastructure commitment addressing the capacity queue that helped produce the whole-Territory grievance. It is **not** a permanent constitutional entrenchment of the national §12.6 formula and does not resolve that stalled federal fight by side door. Threll can champion the commitment, narrow it to avoid turning the Convention into a fiscal conference, or hold it back as leverage. Kesh can accept a Territory-wide infrastructure guarantee, demand a corridor-side equivalent, or argue that the Convention should decide status before attaching spending commitments.
*This scene can echo the stalled Fiscal Equalization thread without hijacking or resolving it.*

### Scene 3 — "The Corridor Line"
A corridor delegate (Kesh's own bloc, or — if playing Kesh — Kesh himself as the one making it) threatens to walk without merger language preserved in some form. Options: offer a carve-out/autonomy zone, hold the line for full unity, or let them walk. Kesh-specific option: make the threat *himself*, publicly, spending `corridor` support to spike `swing` attention. Threll-specific option: call the bluff directly.

**Added 260917 — two separate levers, not one.** Fragment deltas across Scenes 1, 3, and 5 should distinguish *concession* moves (which soften the character's own stated goal to buy support) from *persuasion/procedural* moves (direct outreach to `swing`, exploiting an opposing bloc's misstep, making an ultimatum backfire on whoever issued it) that can move the same meters without touching the goal at all. This is what keeps an uncompromising playthrough genuinely winnable rather than just harder-then-punished: holding the line *and* actively working the room is a real path to Clean Whole Statehood or the corridor's best outcome; holding the line and doing nothing else is what should reliably produce Hung Convention. Two immovable sides that only restate themselves get deadlock by default — that's the equilibrium this piece is actually about. Scenes 1 and 3 are the natural homes for the no-concession persuasion options; don't let every meter-moving choice route through "what will you give up."

### Scene 4 — "The Count"
Midpoint. The scene narrates the actual tally in plain language (not just meter bars) — a fellow delegate states where things stand relative to what's needed for a resolution. This is the designed moment for a pivot: if a player's initial path is visibly failing, they get an explicit, in-fiction opportunity to change strategy rather than being told to. No forced branch — just information.

### Scene 5 — "Put It in Writing"
Final coalition-building before time runs out: a concession, a procedural guarantee, a promise on record, or a last persuasion push that asks for votes without changing the player's substantive goal. Highest-variance scene — big deltas in both directions. This is where `trust` moves most and where tentative understandings become actual resolution language.

**Added 260917 — resolutionLocked spec.** The ending logic in §6 branches on a `resolutionLocked` flag that the original draft never assigned anywhere. Fix: each Scene 5 branch that closes a deal on the record (as opposed to a tentative or exploratory move) sets `resolutionLocked: true` as part of its delta. A move that extracts a promise but stops short of committing it publicly should NOT set the flag — that distinction is exactly what should separate "a deal that holds" from "a deal that talk radio later says never really existed."

### Scene 6 — "The Clock"
Either a resolution is locked in (per accumulated state) or the clock simply runs out. If `days` hits 0 before a resolution was secured in an earlier scene, this scene resolves straight to Hung Convention regardless of support levels.

**Added 260917.** Also give Scene 6 its own independent check: if no Scene 5 fragment set `resolutionLocked`, but accumulated support has clearly cleared one side's threshold (the same numeric bars §6 already uses for ending selection), Scene 6 can itself lock the resolution at the last moment — a quietly-successful playthrough shouldn't be forced into Hung Convention purely because the player never hit an explicit "close the deal" button earlier.

### `resolve`
Ending selection (see §6).

---

## 6. Endings

Five outcomes, each with two text variants (Interior-flavored / Corridor-flavored, selected by which role was played — not by which ending was reached) — ten ending texts total, sharing titles.

| Ending id | Title | Trigger shape |
|---|---|---|
| `clean_statehood` | Clean Whole Statehood | `interior` high, `corridor` low, rider not entrenched or entrenchment failed |
| `grand_bargain` | The Grand Bargain | broad support across blocs, a substantive package of protections/commitments, and `trust` neutral-or-better |
| `negotiated_split` | Negotiated Split | `corridor` held reasonably high, concessions extracted, `trust` neutral-or-better |
| `ugly_split` | Ugly Split | `corridor` outcome reached but `trust` damaged — mishandled ultimatum or broken promise |
| `hung_convention` | Hung Convention | `days` reaches 0 with no resolution locked, OR a deliberate late pivot to this outcome at Scene 4/5 |

**Selection logic (pseudocode, matching the Thoss file's `selectEnding()` pattern):**

```js
function selectEnding() {
  if (days <= 0 && !resolutionLocked) return 'hung_convention';
  if (lastFragmentId === 's5_deliberate_lapse') return 'hung_convention';
  if (broadPackage && interior >= 60 && corridor >= 45 && swing >= 55 && trust >= 0) return 'grand_bargain';
  if (interior >= 65 && corridor < 35) return 'clean_statehood';
  if (corridor >= 50 && trust >= 0) return 'negotiated_split';
  if (corridor >= 40 && trust < 0) return 'ugly_split';
  return 'hung_convention'; // fallback: no side achieved a workable majority
}
```

**Note added 260917 — boundary case to watch during balancing:** `interior === 65 && corridor === 35` falls through every branch (fails `corridor < 35` on the nose) straight to the `hung_convention` fallback, even though it reads like a clean interior win. Not a blocker — the plan already flags starting values and thresholds as placeholders — but worth deliberately deciding the boundary behavior (inclusive vs. exclusive) during the balancing pass rather than discovering it by accident during playtesting.

---

## 7. Ratification coda — added 260917 (John)

Winning the Convention is not winning the outcome. §15.5.a(4) is explicit: *any* resolution the Convention produces "must be ratified by referendum of the eligible voters it affects" — regardless of whether it proceeds under §15.2 or §15.4. This matters because the *ordinary*, non-Convention §15.2 whole-Territory path does **not** require a referendum at all (two successful Statehood Audits and the Territory becomes a State by constitutional operation, §15.2(5)) — the Convention route deliberately adds a popular-ratification step the normal path skips. So even Clean Whole Statehood, won outright inside the room, still has to survive a vote no delegate controls.

**Every one of the ten ending texts gets a short closing beat reflecting this — not just the compromise endings.** Structurally: the Convention result is stated, then the frame shifts to what the delegate doesn't get a vote on. Rough shape, to be written properly at fragment-authoring time, not final prose:

> *"The Convention has spoken. [outcome, role-flavored]. No delegate's name is on what happens next. That's up to a vote none of them get to cast."*

The **tone** of what follows this line (confident, uneasy, openly doubtful) tracks the same `trust`/margin signal already carried through the whole piece — a broad-coalition grand bargain reads like it will probably hold with voters; a thin, strong-armed, or ultimatum-driven win reads like the delegate privately knows they've just handed the real fight to someone else. This reuses the existing `trust` tracking rather than adding new state, and gives every ending — including the "good" ones — a note of real uncertainty rather than a tidy finish.

**Keep the coda speculative, never a verdict.** Consistent with §1's non-canon framing: this piece should never assert whether a hypothetical referendum passes or fails, only how confident the delegate is walking into one. The real Convention's real outcome, whenever it publishes, is under no obligation to agree with anything a reader chose here — that tension is the point, not a bug to smooth over.

**Scope note:** this is a text addition to existing endings, not a new interactive scene. A playable ratification-campaign scene (an actual Scene 7) remains legitimate future scope, but it is not part of this build. Do not add it until the six-scene Convention game, role picker, and ending balance are working.


---

## 8. Authored-content status — 260918

The structural plan is now approved for drafting. Full role-picker copy, both playable-role introductions, the shared Scene 1 setup, and the first role-conditional fragment set live in `docs/KORDA-CROSSROADS-CONTENT-DRAFT.md`.

Drafting order from here:
1. Finish and balance Scene 1 against both roles.
2. Author Scene 2 (Orin's Offer) without resolving the live §12.6 storyline.
3. Author Scene 3 and stress-test persuasion-versus-concession paths.
4. Only then wire role selection into the engine and move authored fragments into `korda-crossroads.json`.

The current public Korda storyline remains on the back burner while this feature is built. The Crossroads piece is non-canon and must not advance the real Convention.
