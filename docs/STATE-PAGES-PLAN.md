# State Pages — Plan (built 260921, implementation deferred to weekend)

**Status: PLANNING ONLY. Nothing built. This conversation happened during regular
world-content sessions; John wants the actual template/backend build to happen this weekend,
separate from day-to-day world content production. This file exists so that session doesn't
have to re-derive any of this.**

---

## THE CORE PRINCIPLE

Same rule that already governs the map and every arc in this project: **detail follows
coverage, not a schedule.** A state gets its own page when it's earned real narrative
attention — not all twelve built speculatively up front. This applies to every layer below,
not just the page itself: a state's flag, its own map, and its "growing stats" block are each
their own slot that fills in whenever that state's story justifies it, not a checklist every
state owes on day one.

## FIRST STATE: HARREN

Agreed over Norvane and (briefly considered, now set aside) Selvane. Reasoning:

- **Confirmed canon, not just self-mythology.** "Founding State" is in `world-canon.md`'s own
  state table, independently corroborating Harren's own preamble claim — not just something
  Harren says about itself.
- **The federal constitution's own preamble never names Harren, or any state.** It's
  deliberately universal ("we came from different nations, communities, and traditions").
  **This tension should be preserved, not resolved** — the profile lets Harren claim the role
  while the federal text stays silent about it. Good material, don't close it off.
- **Real, unexplored hook:** Harren's preamble states "when the Republic was founded, its
  framers looked to Harren. Some of our innovations they adopted; others they adapted to the
  scale of a nation." Nobody has traced which specific federal provisions this actually refers
  to. That's a genuine, still-open piece of work for whoever writes the page.
- Vael's home state — existing character tie-in already in place.

**Selvane is explicitly on hold** — John is reworking it from a race-based framing (which he
didn't like) to a merit-based one, reflecting the state's mix of cultures/races valuing ability
over origin. Distinct constitutional identity from anything else in the twelve. **Do not build
anything toward Selvane's current constitution until that revision lands.**

## TEMPLATE PHILOSOPHY

One shared template, eventually — but **build Harren's actual page first, as a real instance,
before formalizing the shared mechanism.** A template built from theorizing about one state
risks baking in assumptions (e.g. "every state has a founding claim to interrogate") that don't
hold for the other eleven. Generalize once a second state's page exists to prove which parts of
the structure are genuinely universal versus specific to Harren.

**The template's sections are available slots, not mandatory content.** A thin state with less
story material shouldn't have padded, filled-for-the-sake-of-it sections just to match Harren's
shape — same principle as `mapdots.js` tolerating one entry next to fifteen without either
looking wrong.

## THE FIVE COMPONENTS

1. **History** — journalistic-profile voice, same register as news-065's SC justices profile.
   Preamble quoted directly (it's strong enough to carry weight on its own); specific
   provisions summarized, not reproduced, matching the restraint already used with the federal
   document itself.

2. **Quick facts** — pulled from the existing `stats.js` data (pop, Senate/Assembly seats,
   audit status, the one-line "char" description). **Do not hand-duplicate these numbers on
   the state page** — read from the same source `stats.js` already reads from, so a figure
   never drifts between the two places it appears.

3. **Flags** — real, standalone design work, treated as its own project per state, built when
   that state's page is built. For Harren specifically: should be designed from its actual
   identity (founding institutions, separated authority, "nothing escapes the public record"),
   not generic heraldry.

4. **Related content (what's been published mentioning this state)** — needs new build-time
   logic, but not a new *kind* of logic. `mapdots.js` already does exactly this pattern: scans
   published pieces at build time, matches by keyword, aggregates automatically. Build a
   parallel version for states rather than invent a different mechanism, so nothing needs
   manual upkeep and nothing goes stale the way the timeline almost did before we caught it.

5. **Growing stats (metrics that only start existing once a state's story earns them)** — kept
   **manually curated**, not automated. This is narrative judgment (what's worth tracking for
   *this* state specifically), not something a keyword scan can decide on its own. Norvane
   might eventually want an arrivals figure; Harren might never need one.

## NAVIGATION / DISCOVERY

**Carousel rejected for now.** Considered (inspired by diagrams.html's tab/carousel picker),
but that pattern is single-URL, client-side content-swapping — exactly wrong for something that
needs individual permalinks the way every other piece of site content does (stats table rows,
future news pieces, direct shares all need somewhere concrete to point). Revisit once several
state pages exist and there's genuinely something worth browsing between — not for one state.

**Two mechanisms agreed, roughly equal effort:**

1. **Stats table row becomes clickable once a state has a page.** Trivial — the row already
   exists, already data-driven from `stats.js`. No new component.

2. **Map click** — turns out to be far smaller than first assessed. **Correction, logged
   accurately:** initial assessment (checking atlas.html's map) found only a static image and
   concluded this was a large separate project. That was checking the wrong map. torenthia.html
   has its own interactive map already — `region-map-tier2-base.webp` as a base image with an
   SVG overlay, and existing positioned elements (the activity dots) using percentage-based
   `top/left` coordinates. `tier2-labels.json` already has pixel coordinates for every state
   name (`"HARREN": [780, 320]`, etc.) sitting unused. Converting those to percentages against
   the map's known 1536×1024 dimensions and adding one positioned, clickable element per
   published state page uses the exact mechanism the dots already prove works. Not a new
   system — an extension of one that already exists.

**Per-state maps, and finishing the Torenthia map's own style, are both explicitly deferred —
months out, per John.** Neither blocks anything above. A state page doesn't need its own map
any more than it needs its own flag before it can ship — both are slots, not gates.

## OTHER CORRECTIONS SURFACED DURING THIS CONVERSATION (already fixed elsewhere, logged here
for completeness)

- Ines Carrow's title corrected from an imprecise "intelligence director" characterization to
  the actually-established "Director of Foreign Affairs under LC Casimir Rehn, since Year 8" —
  fixed in `docs/CHARACTER-REFERENCE.md` (260914 session), not a state-pages item specifically,
  but surfaced while checking Foreign Affairs' constitutional basis during a different part of
  this same broader work.
- `search-index.js` is specifically the federal constitution's own provision index, not a
  site-wide index of news/NRS/world content. An earlier claim in this conversation that it
  might affect state-page searchability was checked and found incorrect — noted so it isn't
  repeated.

## NEXT STEPS (weekend session)

1. Design Harren's actual page content — preamble excerpt, the founding-state claim left
   deliberately unresolved against the federal text, current stats pulled live, Vael as the
   visible current figure.
2. Build the page as a real, working instance — not a template guessed at in the abstract.
3. Wire the stats-table link and the map-click overlay for Harren specifically.
4. Only after Harren exists and works: evaluate what from its structure is genuinely shared
   versus Harren-specific, and formalize into an actual template for state two.
5. Flags, per-state maps, and the "growing stats" block start empty and fill in per state as
   each earns them — not built speculatively now.
