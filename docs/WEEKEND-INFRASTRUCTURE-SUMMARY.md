# Weekend infrastructure handoff

Ready for review/commit on `weekend-infrastructure`. No implementation commit,
push or deployment was made. Base: existing local ingest commit `b026f22`, directly
above fetched main `ea62db7`; ingest is present locally but was not on main at the
start of this work.

## Changes

- `lib/world.mjs`, `eleventy.config.mjs`, `index.html`, `torenthia.html`, and
  `_includes/related-world.njk`: combined discovery/archive plus independent
  narrative and NRS publication streams. SC stays narrative. Latest excludes NRS;
  Previous/Next follows its own stream; dossiers retain cross-stream membership.
- `lib/world-authoring.mjs`, `lib/world-publishing.mjs`, their scripts, and
  `lib/republic-ingest.mjs`: independent NRS sequence/reference validation,
  stream-aware authoring and shared clock warnings. Existing ingest utilities,
  commands and conservative import boundaries are reused.
- All 41 existing `torenthia-nrs-*.html` files: two front-matter additions only,
  `nrsSeq` and `nrsId`. Historical sequences remain frozen. Runtime never derives
  an NRS identity by reading prose.
- `_data/worldChronology.json`, `_data/worldClocks.json`,
  `lib/world-chronology.mjs`, `scripts/world-status.mjs`: published history derives
  from front matter plus explicit events; ten seeded clocks include relative,
  seasonal, exact/month deadlines, untimed processes and an uninstantiated SC
  template. Planned entries never advance canon or produce overdue warnings.
- `docs/WORLD-STORY-STATUS.md`: checked frontier and generated clock dashboard;
  editorial summaries, constraints and planning notes retained. The LC spring
  window is distinguished from an exact date. Bible unchanged.
- `related-rail.js`, `site.css`, `_includes/related-world.njk`: complete 3/2/1-card
  layouts, whole-card arrow/keyboard movement, reduced-motion support, hidden
  scrollbar, retained touch/print behavior. Related records precede dossier,
  provisions, then places/archive; sequence links remain separate.
- Publishing, migration and ingest docs explain the behavior. Optional separate
  person/office ID hooks are validated; profile/org-chart UI and State history
  remain roadmap only.

## Verification

`npm run world:publish-check` passed: **75 tests**, guarded build, discovery,
constitutional consistency/site checks and all scenario checks. Built **232
pages**, verified **137 World records**, **176 provisions**, and **52 scenario
references**. `git diff --check` passed. Current publishing validation reports
zero editorial warnings.

A comparison with the base commit confirmed that all 137 article bodies,
world IDs, fictional dates and historical worldSeq values are unchanged.
Ingest tests verify immutable preview, collision refusal, human-review holds,
apply/archive behavior and new NRS compatibility.

Browser verification on `torenthia-news-089.html`:

| Width | Complete cards | Clipped cards | Page overflow |
| --- | --- | --- | --- |
| 390 | 1 | 0 | No |
| 768 | 2 | 0 | No |
| 820 | 2 | 0 | No |
| 1024 | 3 | 0 | No |
| 1100 | 3 | 0 | No |

Tablet arrow movement was exactly 394px (card plus gap); desktop keyboard
movement was 356px, with focus retained on the track. Browser reported no page
errors. Desktop, tablet and mobile screenshots were visually inspected.

## Known follow-ups

- Resolve calendar conventions before converting Korda active days or the Argent
  eight-month limit to exact future dates. Spring has no numbered-month bounds;
  the engine issues review warnings in Y14, not fabricated day-level deadlines.
- Registries are deliberately seeded, not an exhaustive extraction of every
  potential clock from prose. Add/resolve obligations with editorial review and
  source records; refresh the marked dashboard with `npm run world:status -- --write`.
- Existing NRS 010/011 summaries cite NRS-Y13-0291 incorrectly. Explicit identity
  metadata matches their own document reference fields (0293/0294); summaries
  are preserved for editorial correction.
- No current SC seat/class or statutory appointment-period length is invented.
  Its template records constitutional ceilings and requires an established
  trigger before activation.
- Human Status prose outside the dashboard is retained and remains editorial;
  automatic checks cover the structured dashboard and numerical frontier.
