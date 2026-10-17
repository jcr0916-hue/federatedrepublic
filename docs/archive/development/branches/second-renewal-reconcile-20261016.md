# Branch history — fix/second-renewal-reconcile-20261016

**Original branch:** `fix/second-renewal-reconcile-20261016`

**PR:** replacement for [#197](https://github.com/jcr0916-hue/federatedrepublic/pull/197); link pending creation

**Head commit at handoff:** pending; final tip will be recorded by the replacement PR

**Status:** proposed; not merged or shipped

**Recorded:** 16 October 2026 (America/Los_Angeles)

## Purpose

Recover only PR #197's missing Second Renewal corrections on merged main [`facc90d5f5975d14306dabc99b03f718c6a39e9a`](https://github.com/jcr0916-hue/federatedrepublic/commit/facc90d5f5975d14306dabc99b03f718c6a39e9a), preserving Work's shipped [PR #198 audit](https://github.com/jcr0916-hue/federatedrepublic/pull/198).

## Changes and artifacts

- `scenario-the-second-renewal.html`: seven line replacements carried from #197's tip [`35c02bdb6e26fcfde37fe5d6eeef4565c1d6f16d`](https://github.com/jcr0916-hue/federatedrepublic/commit/35c02bdb6e26fcfde37fe5d6eeef4565c1d6f16d). Name the Legat Consul as Plan submitter in the three descriptions, subtitle and opening explanation; explain the voluntary Year 8 early approval; distinguish refusal of a further renewal from the expenditure cutoff when authorization lapses.
- This permanent handoff is the only additional file. No constitutional source, generated source, audit record, or other scenario is changed.
- Preserve #198's current provision tags and treaty explanation: §14.4's twelve-month limit, renewal under §2.2, and application of §14.3. Preserve the Year 7 vote, Year 8 Months 3/7/8, and Years 9/10/12 outcomes.

## Results and verification

- Compared #197's complete three-file patch and branch commits with main and checked canonical §§14.2–14.4. All three intended scenario corrections remained missing; #198 had independently corrected treaty treatment.
- `npm run world:publish-check`: passed, including the full test suite, 337 built pages, 221 public records, five State historical tests, 54 scenarios and 177 constitutional provisions. Local dependencies were copied from the existing audit checkout after verifying identical lockfiles; a fresh `npm ci` was not run locally.
- `python3 -B scripts/constitution-archive.py check-current --base origin/main`: passed against the merged audit baseline.
- Direct preservation checks: exactly seven changed source lines, every added line present in #197; all current provision tags and the treaty paragraph retained; identical historical dates/vote and matching description/subtitle text. Rendered scenario and library verification are included in the publishing check.
- `git diff --check`: passed. Remote CI and deployment results are not established at this pre-PR handoff; consult the replacement PR's checks. No browser preview was performed.

## Decisions and lessons

- **Accepted:** apply the seven explanatory line changes to latest main, retaining the established early Plan adoption and historical outcome. Reuse main's audited text as the baseline for future scenario work.
- **Rejected:** replacing the page with #197's whole file, which would restore the superseded implication that treaty obligations escape renewal/transition requirements. Do not repeat that approach.
- **Experimental:** none. This branch contains only the scenario reconciliation and required handoff.
- **Historically preserved:** #197's [original review record](https://github.com/jcr0916-hue/federatedrepublic/blob/35c02bdb6e26fcfde37fe5d6eeef4565c1d6f16d/docs/operations/SCENARIO-ARTICLE-XIV-REVIEW-20261016.md) and [original branch note](https://github.com/jcr0916-hue/federatedrepublic/blob/35c02bdb6e26fcfde37fe5d6eeef4565c1d6f16d/docs/archive/development/branches/scenario-second-renewal-20261016.md) remain linked at their frozen tip. The First War selection/review findings are historical references, not a new review or a change in this replacement. The broader audit's [Article XIV record](../../torenthia-citation-audit/article-xiv-20261016.md) remains intact.

## Open follow-ups

- **Unresolved:** confirm replacement PR CI/deployment and review before merge. Recommend closing obsolete #197 once this replacement is ready; neither PR is closed or merged by this handoff.
- This is a bounded reconciliation, not a new constitutional or scenario-wide semantic audit.

## Preservation and branch disposition

- This note must merge with the scenario correction and stay under `docs/archive/development/branches/`; no post-merge move is required.
- Retain `review/scenario-second-renewal-20261016` at its frozen tip above and retain this replacement branch. #197's separate records and intermediate history require preservation review before any future deletion.
- Branch dependencies: #197 is open and has a successful Vercel preview reported in its discussion. Replacement deployment/automation references and other cleanup dependencies have not been checked for deletion clearance.
- **Deletion approval:** not granted. No branch is deleted; `main` and `archive/legacy-project-material` remain permanent. Cleanup requires a separate approved manifest and guarded preservation review.
