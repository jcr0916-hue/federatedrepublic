# Branch history — release-review-constitution-261023

**Original branch:** `release-review-constitution-261023`
**PR:** not yet opened; add before merge
**Candidate baseline:** `118fca1794d173e7b2b7cbf4e54b8211599fcbb2`
**Substantive release commit:** `44dab96a`
**Status:** proposed for release; local editorial audit complete

## Purpose

Complete the authorized constitutional release, reconciling all scenarios and Torenthia with the approved 20-article/177-provision candidate and verifying the resulting publication. The user explicitly authorized substantive edits, merge and deployment; earlier review-only checkpoints are preserved history.

## Changes and artifacts

See the [substantive release record](../../../operations/CONSTITUTIONAL-COMPATIBILITY-261023.md), [338-decision per-file register](../../../operations/constitutional-compatibility-261023.json) and [validation snapshot](../../../operations/constitutional-release-261023-verification.json). They cover all 54 scenarios, 253 Torenthia pages and related explainers, discovery metadata, Navigator authorities and authoring guidance.

Replaced the obsolete second-renewal scenario with The Changed Mission at its existing URL. Reconciled Statehood decisions, Korda viability/Convention duties, fiscal guarantees, executive incapacity, Monitors, courts and military scope. Rebuilt twelve quicksheets and seven diagram views; regenerated thirteen PDFs. The approved canonical source remains unchanged by the compatibility pass.

## Results and verification

Full publishing suite passed: 368 built pages, 238 public records, 13 State historical tests, 12 State profile/source routes, 54 scenarios and 177 provision text/search anchors. All PDFs passed text/structure checks; the Constitution has 57 pages and each quicksheet one page. Visual inspection found no clipping or overlap. Final desktop/mobile browser flow passed on 28 desktop and seven mobile routes, including search, discovery, all diagram tabs, keyboard switching, deep links and source links, with no uncaught page errors or failing same-origin responses. Final hash/CI/production confirmation is recorded separately; local success alone does not establish deployment.

## Decisions and lessons

- **Proposed shipment:** preserve political outcomes and chronology where possible while making removed constitutional mechanisms explicit statutory choices only where compatible. Audit findings are evidence; the institution assigned the decision must decide.
- **Rejected:** superficial citation substitution, restoring obsolete constitutional text, inventing an Assembly tally, automatic adverse decisions by silence, JMC permission gates, compulsory devolution and force-pushing shared history.
- **Historically preserved:** exact superseded scenario with provenance, previous main Constitution JSON/Markdown pair dated 261024 UTC, existing archives and all candidate commits. State Constitutions retain their independent source text.
- **Reuse:** the per-file decisions, reviewed hashes, ordinary live-reference check and explicit snapshot mode. Browser interaction found old handlers that static syntax checks could not detect.
- **Experimental:** none of the compatibility fixes are left as an experimental alternative. Provider-generated AI answer quality is not certified by mocked benchmark tests.

## Open follow-ups

Before merge: final snapshot/hash checks, remote CI and expected-head merge. After merge: verify the deployed main SHA, public reader flow, deterministic Navigator response and exact published PDF bytes; append deployment evidence to the release PR. No other editorial blocker identified by this audit.

## Preservation and branch disposition

Retain this branch and merge normally so all candidate and compatibility commits remain reachable. The prior production deployment and safe rollback procedure are in the release record. This branch is referenced by the release-review workflow and may be referenced by Vercel previews; cleanup is not part of this release.

**Deletion approval:** Not granted by this note. Requires a separate approved manifest and guarded cleanup. `main` and `archive/legacy-project-material` remain permanent.
