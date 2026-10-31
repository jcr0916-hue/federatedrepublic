# Branch history — content/orath-merath-profiles-20261017

**Original branch:** `content/orath-merath-profiles-20261017`

**PR:** [#200](https://github.com/jcr0916-hue/federatedrepublic/pull/200)

**Head commit at handoff:** [`133f90fa49f92668ac4ff98339edd95d036dabea`](https://github.com/jcr0916-hue/federatedrepublic/commit/133f90fa49f92668ac4ff98339edd95d036dabea); subsequent corrections, handoff updates and the final tip are recorded by #200

**Status:** proposed; not merged or shipped

**Recorded:** October 17, 2026 (America/Los_Angeles)

## Purpose

Prepare the two weekend State profiles from the actual Orath and Merath Constitutions, preserving established World canon and the shared editorial layout shipped in [#176](https://github.com/jcr0916-hue/federatedrepublic/pull/176) and [#178](https://github.com/jcr0916-hue/federatedrepublic/pull/178). Work begins from merged main `3d3ce16`, including #198’s citation audit and #199’s Second Renewal reconciliation, in a separate checkout. No existing working branch is switched or overwritten.

## Changes and artifacts

- `torenthia-state-orath.html` and `torenthia-state-merath.html`: distinct source-linked features. Orath centers Dorven, the Grange/Steward, counties/cooperatives, water and geographic access; Merath centers manufacturing connections, collective executive government, labor rights, industrial coordination and social-state finance.
- `state-constitution-{orath,merath}.html`: shared formatted readers with reciprocal profile/source links. Eleventy publishes original Markdown and new SVGs unchanged.
- `orath-flag.svg`, `merath-flag.svg`: clean vector equivalents of the user-approved design descriptions, with accessible titles/descriptions and matching alt text. Approved chat images were unavailable; no exact reproduction is claimed. Merath retains crimson bars and has no flames or sparks.
- `_data/statepages.js` adds map/directory/sibling routes. `_data/stats.js` changes only the two States’ descriptive summaries; all numerical facts, statuses, and other jurisdictions remain intact.
- Shared profile layout and styling are preserved; its Explore introduction now correctly describes navigation after the feature. The State reader safely renders Markdown bold and preserves Merath’s second italic tagline and distinct adoption line.
- Federal glossary injection is excluded from State profiles/readers after verification caught federal definitions misdescribing the Steward and authorized-majority denominator. Existing source prose remains unchanged. Discovery validation now guards this boundary, all eleven profile/reader/directory routes, source-download bytes, and every rendered State provision. Parser tests cover safe formatting and the two new sources’ complete provision sequences.
- [Editorial/source record](../../../world/ORATH-MERATH-PROFILES-20261017.md) and [flag provenance](../../../world/visual-identity/ORATH-MERATH-FLAGS.md) preserve the detailed decisions. No federal/State Constitution source, World sequence, clock, map coordinate, historical test, Bible or status file changes.
- After accepting the profiles, the user authorized correcting `torenthia-news-039.html`’s pre-existing Orath population/status inconsistency. Three paragraphs now use State status and the shared 5.4-million population, remove an unsupported Verentum district comparison, and preserve the nine-signature scene while distinguishing jurisdictional counting from eligible-voter signature thresholds. The [editorial record](../../../world/ORATH-MERATH-PROFILES-20261017.md#resolved-orath-populationstatus-inconsistency) preserves scope and the original version.

## Results and verification

- `npm run world:publish-check`: passed, repeated after correcting federal glossary injection. Includes 163 Node tests plus the Constitution archive tests, production build, 341 rendered pages, 221 public records, five historical State tests, 54 scenarios and 177 federal constitutional provisions. Existing three World reminders persist: Argent Ridge calendar conversion, spring LC election scheduling, and a status-dashboard/registry mismatch. Node also emits its existing module-type inference warning; this is not a failed check.
- After adding the permanent discovery guard, `npm run check:discovery`: passed for all eleven published State profile/Constitution pairs, source downloads, rendered provisions and glossary boundaries. An initial checker comparison treated Markdown list markers as text; normalization was corrected to account for semantic HTML lists. No source content was changed to satisfy the check.
- `python3 -B scripts/constitution-archive.py check-current --base origin/main` and `git diff --check`: passed. Original State source SHA-256 values: Orath `05cbc026d5b9bb712a92265f8e51a5b3de0b099585f4bea117a1cd7db94adf6b`; Merath `4e58579791223098e48505096e7d779eed8194e47d23090da5fd07514f68a940`. Source Markdown/SVG deployment byte equality and SVG XML/title/description checks passed.
- Browser: all four new pages checked at 1440, 768, 390 and 320px. No document overflow, broken images, missing alt attributes, duplicate h1, broken map labels, or interrupted feature/Explore ordering. Directory → profile → formatted Constitution → source download → profile → filtered archive flows passed at desktop and phone widths (Orath ten matching records; Merath three). Harren/Arvane profile checks passed at desktop/phone widths. First complete run recorded no page errors or local request failures; the repeated responsive/navigation assertions passed after the glossary fix.
- Desktop/phone screenshots were visually inspected. The repeat run’s final full-page screenshot of a standalone SVG timed out after the page/flow assertions; this was a preview-capture issue. Full flag PNG previews were rendered directly from the SVGs and inspected. Screenshots and browser output are local review artifacts under the project’s `output/orath-merath-profiles-2026-10-17/`; they are not shipped assets or remote artifacts.
- Dependencies reused from a completed sibling checkout after verifying identical lockfiles; a fresh local install was not run. Remote CI/deployment results are not established at this pre-PR handoff.
- Population/status follow-up: the full `npm run world:publish-check` passed again after the three-paragraph correction, including all 341 built pages and the eleven-State source/discovery checks. Targeted comparison confirmed unchanged publication front matter, date, paragraph structure and nine-signature scene; the obsolete population/territorial wording is absent from the article. A repository search found no other active Orath claim of this kind. Whitespace and base-relative Constitution archive checks passed. Original profile head `ef6ea002e693ec2807edbf1c063de6868988eb64` also passed [remote World publishing](https://github.com/jcr0916-hue/federatedrepublic/actions/runs/39032194297) and [Constitution archival](https://github.com/jcr0916-hue/federatedrepublic/actions/runs/39032194240), with a ready Vercel preview; consult #200 for the follow-up commit’s remote results.

## Decisions and lessons

- **Accepted:** reuse the shared editorial sequence and current statistics; let published mundane records supply local life. Distinguish constitutional requirements, legislative options, and historical acts. Do not invent a State capital or officeholder where none is established.
- **Rejected:** inventing unavailable flag-image proportions as exact approved artwork; duplicating the Constitution block; changing constitutional wording or allocating World IDs; adding federal glossary explanations to State institutions.
- **Experimental:** none shipped. Browser/SVG preview tooling is local verification only.
- **Historically preserved:** the user’s approved flag descriptions, source links, layout decisions, verification findings, and source hashes are retained by the records above and this handoff. Reuse the shared readers/assets and extend the dynamic State inventory rather than another hardcoded test list.

## Open follow-ups

- **Resolved:** `torenthia-news-039.html`’s Orath population/status inconsistency is corrected following the user’s explicit request. Original wording remains preserved at `ef6ea002e693ec2807edbf1c063de6868988eb64`; the article’s metadata, date and narrative events are unchanged. Follow-up validation results are recorded above.
- Confirm PR review and remote CI/deployment before merge. Existing chronology/dashboard reminders remain a separate publishing-maintenance task. Selvane is the remaining unpublished State profile in the current inventory.

## Preservation and branch disposition

This note and substantive editorial records belong in the same PR and stay in place on merge; no post-merge move is required. Proposed work is not yet shipped. No branch-only canon, unreproduced approved image, or discarded substantive draft is claimed. This branch’s deployment/automation dependencies have not been checked for deletion clearance.

**Deletion approval:** not granted. Retain this branch pending separate guarded preservation review; `main` and `archive/legacy-project-material` remain permanent.
