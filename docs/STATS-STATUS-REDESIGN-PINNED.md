# Stats Table Status Redesign — Pinned for Weekend Work (260928)

**Status: DESIGN AGREED, NOTHING BUILT. This touches live site code (torenthia.html templates,
_data/stats.js, CSS, the popup mechanism) and real data changes, not a single day's world
content — explicitly deferred to a weekend session rather than built during regular content days.**

---

## THE PROBLEM (verified, not assumed)

The stats table's "audit" column uses six undefined terms — Passing, Review, Strained, Watch,
Crisis, "First audit passed · awaiting second" — with zero explanation anywhere on the site.

**Concrete proof this actually breaks, not just theoretically could:** Corindal and Korda both
carry the identical label "Crisis," and mean completely unrelated things. Corindal's is a real
governance-compliance judgment — it actually failed audits under §15.3, is `Provisional (from
State)`. Korda's is purely situational — the multi-petition/Convention crisis — since it hasn't
had a Statehood Audit even start yet (`Territory`, plain). Same word, two unrelated meanings,
no way for a reader to tell which.

**Separately, §9.1's general rule is unconditional:** "Monitors hold an information-only
mandate: they observe constitutional processes, verify compliance, and publish findings to the
NRS." The annual Statehood Audit under §15.2(7) runs "under the same Monitor structure" — so
every state's annual audit finding should be a published NRS record, every year. This has never
actually been done for almost any state. Real gap, not fixed as part of this pass (see scope
note below).

## THE ARCHITECTURE — already better than expected, verified directly

`_data/stats.js` already has two genuinely separate arrays: `const states = [...]` (line 89) and
`const territories = [...]` (line 104). `torenthia.html` already renders them through two
separate loops (states at line 464, territories at line 475). **Corindal is already correctly
placed inside `states`, not `territories`** — consistent with §15.3(3)'s "the State remains a
State" during Provisional status. No misclassification bug found.

The only actual gap: both loops currently point at the same generic `audit` field and the same
CSS pattern (`aud aud-{{ s.audit | lower }}`), so despite the data already being split, the
column label and value vocabulary never diverged. This is a smaller fix than a restructure —
give each loop its own label and its own meaning, not a new architecture.

## AGREED DESIGN

**Replace the ambiguous single-word labels with a green/yellow/red system**, on the reasoning
that color answers "should I be concerned" and a popup answers "why" — so two entries can both
be red without lying to anyone, because the popup carries the actual, specific, honestly
different reason.

**Column label changes, since the two sections mean genuinely different things:**
- States section: "Status" — tied to real audit-compliance meaning (green/Passing,
  yellow/Early Warning or comparable concern, red/Provisional or serious).
- Territories section: something distinct from "Status" (working name: "Progress") — tied to
  statehood-process meaning (green/on track, yellow/not yet started or slow, red/genuinely
  contested — Korda specifically).

**Popup mechanism: reuse the existing constitutional-glossary hover/tap pattern** already proven
on the site (hover shows the bubble on desktop, tap triggers on mobile) rather than build a new
mechanism from scratch.

## THE SUMMARY-WRITING PRINCIPLE (the most recently refined, and the one to hold hardest to)

**Status (the color) applies to everyone — it's factual, costs nothing to state for all sixteen
entries.** A real, substantive popup *summary* is different: write one only where there's actual
coverage that gives it real content. Don't manufacture drama for a state nothing's happened to
just to fill the popup box. Agreed explicitly: "We provide what we have that gives value,
otherwise we wait to provide it when it does give value."

**Practical effect:** most entries get status + an honest, minimal placeholder ("Passing —
nothing notable," "Territory — process not yet initiated," etc.). Only places genuinely in the
news get a real written summary. As new coverage happens, upgrade that entry's placeholder to a
real summary at that point — never before.

**Proposed starting list for real summaries** (John confirmed the principle; this specific list
is my own read of who currently qualifies, not yet independently confirmed name-by-name — worth
a quick sanity check when this is actually built, since coverage may have moved by then):
- Korda (multi-petition crisis, Convention question)
- Kelvant (actively absorbing the corridor)
- Norvane (Argent Ridge, refugee-housing need)
- Varek (Argent Ridge consent vote; has its own state page)
- Corindal (Sollis's ongoing dispatch; established failed-audit backstory)
- Harren (has its own state page, founding-state identity — thinner coverage than the others,
  but a real page exists)
- Rhovane (Lake Varda spillover pressure)

**Morantine and Solara are a slightly different case** — the status itself ("first audit
passed, awaiting second") already is the real information, so their popup can just state that
plainly without needing outside news coverage to justify existing.

**Everyone else** (Merath, Orath, Aldenmere, Caldenmere, Selvane, Arvane, and Verdmont): plain
status color + honest placeholder text, nothing invented.

## SEPARATE, SMALLER ITEM FOUND ALONG THE WAY — not part of this redesign's scope

`world-canon.md` still describes Verdmont as "Provisional." `stats.js` correctly has it as a
plain `Territory`. Under the corrected Territory-State rules (Provisional applies only to a
demoted State, never to a Territory pursuing statehood), one of these is stale. `stats.js` is
almost certainly the one that's right; `world-canon.md`'s line needs updating to match. Small,
independent fix — doesn't need to happen in the same pass as the status redesign, but shouldn't
be forgotten either.

## SCOPE NOTE — what this pass does NOT attempt

This redesign fixes the *label and popup* problem. It does not retroactively write the NRS
audit-publication records §9.1 actually requires for every state, every year — that's
correctly identified as a separate, much larger effort, and the plan is to write those only for
states already carrying real story weight (the same list as the real-summary candidates above),
not backfill all sixteen speculatively.

## NEXT STEPS WHEN THIS IS ACTUALLY BUILT

1. Confirm the real-summary candidate list still matches current coverage (things may have
   moved between now and the weekend session).
2. Update `_data/stats.js`: add a color field alongside (or replacing) the current `audit`
   string field for both `states` and `territories` arrays; add summary text where earned,
   honest placeholders elsewhere.
3. Update `torenthia.html`: split the single `c-aud`/`audit` column logic into two
   differently-labeled columns matching the two loops; wire in the glossary-style popup
   mechanism for the summary text.
4. Add whatever CSS is needed for the green/yellow/red indicators, consistent with the site's
   existing visual language.
5. Fix the Verdmont `world-canon.md` inconsistency while in this area, since it's cheap and
   related.
6. Do not touch the NRS-publication gap in this pass — separate, later effort.
