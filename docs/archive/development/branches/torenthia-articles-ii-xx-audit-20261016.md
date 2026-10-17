# Branch history — audit/torenthia-articles-ii-xx-20261016

**Original branch:** `audit/torenthia-articles-ii-xx-20261016`

**PR:** pending creation; link will be recorded before delivery.

**Status:** proposed; shipped only after review and merge. Baseline: `c39e7086b4e65d6a93fbaead6f729aafbbfb1161`.

## Purpose and changes

Complete the requested Article II–XX citation audit and a final Article I supplement after the finished constitutional edits. The [register](../../torenthia-citation-audit/README.md) links all twenty dated records; the [completion record](../../torenthia-citation-audit/remaining-articles-20261016.md) contains scope, method, verified hypothetical conflicts, and limits.

Correct scenario provision names, reading rails, obsolete authority references, Convention/incapacity paragraphs, and explanatory descriptions that no longer match current text. Five hypothetical examples need limited procedural/setup corrections, described explicitly in the completion record; no canonical Torenthia event or outcome changes. State citations remain distinct from federal citations.

## Results and verification

- First full `npm run world:publish-check` after content edits: passed; 337 built pages, 221 public records, five State historical tests, 54 scenario pages, and 177 constitutional provisions verified.
- Final `npm run world:publish-check` after the reading-rail updates: passed in full with the same 337-page / 221-record / 54-scenario / 177-provision coverage.
- Scoped verification: passed for 279 sources, 1,923 decoded federal citation occurrences, 243 canonical scenario tags, 1,496 rendered constitutional links, all twenty completed-text audit records, and their documentation links. Publication identity/date metadata, all nine profiles, canonical Winning Bid history, constitutional source bytes, and scope boundaries are preserved.
- `python3 -B scripts/constitution-archive.py check --base c39e7086b4e65d6a93fbaead6f729aafbbfb1161`: passed. `git diff --check`: passed. The merged baseline was unchanged at the final authority recheck.
- These are local validation results; PR CI is checked separately before delivery.

## Decisions, rejected approaches, and reuse

- Use only the completed merged baseline through PR #191. No unmerged constitutional text was imported.
- Preserve [PR #182](https://github.com/jcr0916-hue/federatedrepublic/pull/182) and its Article I evidence unchanged; append a dated follow-up for the later renumbering.
- Preserve published events, identities, dates, figures, votes, and political views. The First Nomination’s hypothetical first vote changes from 61–39 to 41–59 because the former would confirm under current §4.4; the original rejection and second nomination remain.
- Reject broad canon rewrites, State Constitution edits, new World IDs, and unrelated State-profile work. All nine profiles and canonical Winning Bid history remain byte-identical to the baseline.
- Reuse the per-article hashes, current identifier maps, baseline inventories, and recorded decisions. Future source changes require a new dated supplement, not a claim that this audit covers them.

## Limitations and follow-ups

- User review and merge remain. This branch does not claim publication merely because a PR is opened.
- Scope is the four requested corpora and material rendered into their reading rails. Other court, dispatch, dossier, historical, and reference corpora are not certified by this audit.
- The current statutory date for the next federal-host competition is not established. The obsolete constitutional twenty-year deadline is removed without inventing a replacement.
- No federal/State constitutional sources, generated constitutional derivatives, shared State template, chronology/clock registries, or Story Bible/Status are changed. Orath/Merath remain for the independent [weekend plan](../../../operations/WEEKEND-OBJECTIVES-2026-10-17.md).

## Preservation and branch disposition

The per-article records, register, completion record, and this handoff travel in the same PR and remain on main after merge. No post-merge move is required. No experimental runtime code or unique branch-only canon is introduced. Branch-name dependencies beyond the PR are not established; deployment and automation dependencies require a separate cleanup review.

**Deletion approval:** not granted. Keep this branch; permanent refs remain protected.
