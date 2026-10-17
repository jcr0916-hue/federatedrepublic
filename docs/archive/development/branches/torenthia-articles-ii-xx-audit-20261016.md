# Branch history — audit/torenthia-articles-ii-xx-20261016

**Original branch:** `audit/torenthia-articles-ii-xx-20261016`

**PR:** [#198](https://github.com/jcr0916-hue/federatedrepublic/pull/198). Initial content commit: [`1a4d02f`](https://github.com/jcr0916-hue/federatedrepublic/commit/1a4d02f3f46d1059e1fc4f68d7fc80c17120166a); the reconciliation in this PR supersedes its earlier baseline.

**Status:** proposed; shipped only after review and merge. Baseline: `fc41e26b97dedcce9b84dacb7380b0ab9575eec2`.

## Purpose and changes

Complete the requested Article II–XX citation audit and a final Article I supplement after the finished constitutional edits. The [register](../../torenthia-citation-audit/README.md) links all twenty dated records; the [completion record](../../torenthia-citation-audit/remaining-articles-20261016.md) contains scope, method, verified hypothetical conflicts, and limits.

Correct scenario provision names, reading rails, obsolete authority references, Convention/incapacity paragraphs, and explanatory descriptions that no longer match current text. Five hypothetical examples need limited procedural/setup corrections, described explicitly in the completion record; no canonical Torenthia event or outcome changes. State citations remain distinct from federal citations.

## Results and verification

- First full `npm run world:publish-check` after content edits: passed; 337 built pages, 221 public records, five State historical tests, 54 scenario pages, and 177 constitutional provisions verified.
- Reconciled merged PRs #192–#196. A first post-reconciliation publishing pass detected stale §2.6.a derived text; regenerated the annotated page, search index, and quick reference from the unchanged merged source.
- Final `npm run world:publish-check`: passed in full after reconciliation and regeneration, with the same 337-page / 221-record / 54-scenario / 177-provision coverage.
- Scoped verification: passed for 279 sources, 1,926 decoded federal citation occurrences, 243 canonical scenario tags, 1,496 rendered constitutional links, all twenty completed-text article records, and their documentation links. Publication identity/date metadata, all nine profiles, canonical Winning Bid history, constitutional source/archive bytes, and scope boundaries are preserved.
- `python3 -B scripts/constitution-archive.py check-current --base fc41e26b97dedcce9b84dacb7380b0ab9575eec2`: passed. Whitespace check: passed. PR CI is checked separately before delivery.

## Decisions, rejected approaches, and reuse

- Use only merged text, including PR #195’s single-candidate restoration. Reconcile concurrent scenario corrections in PRs #192–#196 rather than overwriting them. No unmerged constitutional text was imported.
- Preserve [PR #182](https://github.com/jcr0916-hue/federatedrepublic/pull/182) and its Article I evidence unchanged; append a dated follow-up for the later renumbering.
- Preserve published events, identities, dates, figures, votes, and political views. The First Nomination’s hypothetical first vote changes from 61–39 to 41–59 because the former would confirm under current §4.4; the original rejection and second nomination remain.
- Reject broad canon rewrites, State Constitution edits, new World IDs, and unrelated State-profile work. All nine profiles and canonical Winning Bid history remain byte-identical to the baseline.
- Reuse the per-article hashes, current identifier maps, baseline inventories, and recorded decisions. Future source changes require a new dated supplement, not a claim that this audit covers them.

## Limitations and follow-ups

- User review and merge remain. This branch does not claim publication merely because a PR is opened.
- Scope is the four requested corpora and material rendered into their reading rails. Other court, dispatch, dossier, historical, and reference corpora are not certified by this audit.
- The current statutory date for the next federal-host competition is not established. The obsolete constitutional twenty-year deadline is removed without inventing a replacement.
- No federal/State constitutional sources, constitutional PDF, shared State template, chronology/clock registries, or Story Bible/Status are changed. The annotated display, search index, and generated quick reference are synchronized to merged §2.6.a. Orath/Merath remain for the independent [weekend plan](../../../operations/WEEKEND-OBJECTIVES-2026-10-17.md).

## Preservation and branch disposition

The per-article records, register, completion record, and this handoff travel in the same PR and remain on main after merge. No post-merge move is required. No experimental runtime code or unique branch-only canon is introduced. Branch-name dependencies beyond the PR are not established; deployment and automation dependencies require a separate cleanup review.

**Deletion approval:** not granted. Keep this branch; permanent refs remain protected.
