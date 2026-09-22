# Website orientation and discovery refresh

Implements the September 19 website review through shared navigation, clearer entry points, constitutional reading aids, connected world records, and dated editorial summaries. Constitutional text, provision anchors, published PDFs, and the Crossroads rules remain unchanged.

## Reader-facing changes

- Shared grouped navigation is rendered at build time across the site and remains usable without JavaScript.
- The homepage separates Read / Understand / Follow, the story-first transition scenario, Featured Now, recent fictional records, and real project updates.
- Republic Now provides four dated editorial briefs: Korda, Lake Varda, Fiscal Equalization, and Argent Ridge. Each dossier links evidence and constitutional mechanisms.
- The Republic at a Glance combines the domestic map with an accessible directory of twelve states and four territories. State pages include location context and related coverage; Solara and Morantine have dedicated pages.
- The Record supports text, type, file, and jurisdiction filters with shareable URLs. All records remain available without scripting.
- The Constitution reader provides article introductions, a compact article index, question-based paths, search, and references into the fictional Republic.
- Scenario categories use expandable lists. `scenario-the-first-twelve-years.html` is the primary story-first introduction and the Article XIX transition scenario; The Formation remains the focused government-formation scenario; Ordinary Law remains in the Everyday Governance category; Crossroads is distinguished as a non-canonical interactive companion. All scenario endings use shared “What this tested” and “Go deeper” reading bridges.
- Diagrams gain keyboard controls and corrected allocation/review wording. A simplified lawmaking fragment connects the reader and Quick Sheets.
- History search, sources labeling, AI disclosures, and questionnaire follow-through clarify the supporting tools.

## Publishing records

New World pieces can be started with the preview-first authoring helper:

`npm run world:new -- --kind news --date 13.12 --title "..." --blurb "..." --outlet "The Torenthian"`

The helper scans existing World files, assigns the next global `worldSeq`, chooses the next per-kind filename (for example `torenthia-news-087.html`), and prints advisory arc/jurisdiction/provision suggestions from the title and blurb. It does not create anything unless `--write` is supplied. When written, suggested metadata remains commented until explicitly accepted; the draft body is a minimal shell that must be replaced before publication. Optional accepted metadata can be passed with `--arcs`, `--jurisdictions`, `--provisions`, `--dossiers`, and `--related`. Dispatches use `--slug`; `--mundane` marks ordinary-life pieces.

Every world record has a stable `worldId` matching its filename without `.html`, a unique integer `worldSeq`, and a quoted fictional `worldDate` (`13.12`: year 13, month 12). Chronology compares year, month, then sequence numerically.

Required arrays are `worldArcs`, `worldJurisdictions`, `worldProvisions`, and `worldRelated`. Empty arrays are valid. Related references are existing filenames including `.html`; provisions must match canonical references. The build rejects missing/duplicate IDs or sequences, invalid dates, and unresolved provisions or related records.

Arc and jurisdiction tags describe discovery relationships. They do not assert a current legal outcome. Review these tags when publishing; body-text matches are advisory rather than authoritative. The normal build runs `scripts/check-world-metadata.mjs` against World records published after worldSeq 132 and warns when strong title/blurb/body signals suggest a missing arc, jurisdiction, or provision tag. Deliberate exceptions may use `worldSignalIgnore` for the specific suggestion rather than weakening a global rule.

`_data/currentFiles.json` contains separately authored status summaries, constitutional references, affected jurisdictions, and a frozen `seedRecords` baseline. New core dossier records opt in from their own front matter with `worldDossiers: ["<dossier-id>"]`; dossier key-record timelines and their “As of” dates then derive automatically from the World collection. Supporting coverage uses `worldArcs` without `worldDossiers`. New records automatically enter chronology, recent lists, map coverage, relevant tagged collections, and—when explicitly marked—the appropriate dossier timeline.

The existing map geometry supplies regional crops. Varenne coordinates and petition boundaries are not established by that geometry and are deliberately not drawn. Add those only after canon supplies them.

## Validation

Run `npm run build`, `npm run check:world-meta`, `npm run test:world-meta`, `npm run test:world-authoring`, `npm run check:discovery`, `npm run test:world`, `npm run test:assets`, and `npm run test:crossroads`. Also run the existing Python checks: `scripts/check-consistency.py`, `scripts/check-constitutional-site.py`, and `scripts/check-scenarios.py`.

The discovery checker covers all built local links, fragments, inline JavaScript syntax, and the complete record inventory. Browser checks covered fourteen page families at 390px and 1280px, archive filtering and pagination, reader search and focus restoration, diagram keyboard activation, map inspection, history links/search, and all nine questionnaire steps. The questionnaire response was mocked; live AI provider calls were not made. No-JavaScript checks covered navigation, records, scenarios, and diagrams.

## Follow-up editorial work

The scenario-ending rollout covers the complete 52-story library. Curated summaries, labeled provision links, and specific next reads live in `_data/scenarioBridges.json`; pages opt in with `_includes/scenario-end.njk`. Summaries must be checked against the story and current constitutional text. World links describe a related mechanism, not a claim that a standalone scenario is part of Torenthian canon. News and NRS article bodies retain their existing presentation; their shared navigation, metadata, and related-reading sections are improved without a wholesale article-template migration. More detailed maps require verified geography. Full assistive-technology testing and live AI-provider testing remain separate release checks. This branch does not change deployment settings or publish production.
