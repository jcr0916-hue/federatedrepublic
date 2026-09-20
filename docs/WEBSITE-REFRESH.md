# Website orientation and discovery refresh

Implements the September 19 website review through shared navigation, clearer entry points, constitutional reading aids, connected world records, and dated editorial summaries. Constitutional text, provision anchors, published PDFs, and the Crossroads rules remain unchanged.

## Reader-facing changes

- Shared grouped navigation is rendered at build time across the site and remains usable without JavaScript.
- The homepage separates Read / Understand / Follow, The Formation, Featured Now, recent fictional records, and real project updates.
- Republic Now provides four dated editorial briefs: Korda, Lake Varda, Fiscal Equalization, and Argent Ridge. Each dossier links evidence and constitutional mechanisms.
- The Republic at a Glance combines the domestic map with an accessible directory of twelve states and four territories. State pages include location context and related coverage; Solara and Morantine have dedicated pages.
- The Record supports text, type, file, and jurisdiction filters with shareable URLs. All records remain available without scripting.
- The Constitution reader provides article introductions, a compact article index, question-based paths, search, and references into the fictional Republic.
- Scenario categories use expandable lists. `before-the-republic.html` is the primary story-first introduction; The Formation remains a constitutional scenario; Ordinary Law remains in the Everyday Governance category; Crossroads is distinguished as a non-canonical interactive companion. All 51 scenario endings use shared “What this tested” and “Go deeper” reading bridges.
- Diagrams gain keyboard controls and corrected allocation/review wording. A simplified lawmaking fragment connects the reader and Quick Sheets.
- History search, sources labeling, AI disclosures, and questionnaire follow-through clarify the supporting tools.

## Publishing records

Every world record has a stable `worldId` matching its filename without `.html`, a unique integer `worldSeq`, and a quoted fictional `worldDate` (`13.12`: year 13, month 12). Chronology compares year, month, then sequence numerically.

Required arrays are `worldArcs`, `worldJurisdictions`, `worldProvisions`, and `worldRelated`. Empty arrays are valid. Related references are existing filenames including `.html`; provisions must match canonical references. The build rejects missing/duplicate IDs or sequences, invalid dates, and unresolved provisions or related records.

Arc and jurisdiction tags describe discovery relationships. They do not assert a current legal outcome. Review these tags when publishing; do not substitute body-text matches for editorial metadata. `_data/currentFiles.json` contains separately authored status summaries, explicit `asOf` dates, supporting record IDs, and constitutional references. Update a brief only after reviewing its supporting records. New records automatically enter chronology, recent lists, map coverage, and relevant tagged collections.

The existing map geometry supplies regional crops. Varenne coordinates and petition boundaries are not established by that geometry and are deliberately not drawn. Add those only after canon supplies them.

## Validation

Run `npm run build`, `npm run check:discovery`, `npm run test:world`, `npm run test:assets`, and `npm run test:crossroads`. Also run the existing Python checks: `scripts/check-consistency.py`, `scripts/check-constitutional-site.py`, and `scripts/check-scenarios.py`.

The discovery checker covers all built local links, fragments, inline JavaScript syntax, and the complete record inventory. Browser checks covered fourteen page families at 390px and 1280px, archive filtering and pagination, reader search and focus restoration, diagram keyboard activation, map inspection, history links/search, and all nine questionnaire steps. The questionnaire response was mocked; live AI provider calls were not made. No-JavaScript checks covered navigation, records, scenarios, and diagrams.

## Follow-up editorial work

The scenario-ending rollout covers the complete 51-story library. Curated summaries, labeled provision links, and specific next reads live in `_data/scenarioBridges.json`; pages opt in with `_includes/scenario-end.njk`. Summaries must be checked against the story and current constitutional text. World links describe a related mechanism, not a claim that a standalone scenario is part of Torenthian canon. News and NRS article bodies retain their existing presentation; their shared navigation, metadata, and related-reading sections are improved without a wholesale article-template migration. More detailed maps require verified geography. Full assistive-technology testing and live AI-provider testing remain separate release checks. This branch does not change deployment settings or publish production.
