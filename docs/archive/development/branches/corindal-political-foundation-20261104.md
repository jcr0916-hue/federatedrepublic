# Branch history — docs/corindal-political-foundation-20261104

**Original branch:** `docs/corindal-political-foundation-20261104`
**PR:** [#300 — Record approved Corindal political foundation](https://github.com/jcr0916-hue/federatedrepublic/pull/300).
**Head at initial verification:** `9bd39a491f14f9592e64c2238e8952e64ce4ec81` (before this PR-link update); the PR's head metadata identifies the final SHA.
**Status:** President-approved editorial foundation; proposed repository integration, awaiting the author's merge review. Not merged or deployed.

## Purpose

Record the President's approval in *Constitution 16* on a new feature branch, with no merge to main or deployment. Source baseline: `2cc3168ab322e069c4b07d1060544cd6f6f2b055`; Year 14, Month 2; narrative worldSeq 183, nrsSeq 135.

## Changes and artifacts

- [Corindal Political Foundation](../../../torenthia/CORINDAL-POLITICAL-FOUNDATION.md) records the approved Year 12 Vorn/Veth election and Year 16 expiration, Year 14 full State Senate cycle, eight figures, three nonpartisan factions, current estimated alignment and two approved locations.
- [Story Bible](../../../torenthia/STORY-BIBLE.md), [Status](../../../torenthia/STORY-STATUS.md), [political planning](../../../torenthia/POLITICAL-CHARACTER-PLANNING.md), [editorial status](../../../torenthia/EDITORIAL-CURRENT-STATUS.md) and [navigation](../../../torenthia/README.md) point to that decision and preserve its scope.
- **Historically preserved:** [Before the Ground Thaws](../../../torenthia/agents/corindal/publication-candidates/before-the-ground-thaws.md) remains unchanged and unpublished; baseline blob `c7e616cd876a241969f7fdc73ee21f7bb4621a78`. Its proposed characters, operational history and dialogue are not incorporated as canon.

## Results and verification

- Read repository `AGENTS.md`, the handoff template, historical branch-report index and lifecycle policy. No nested `AGENTS.md` appears in the complete baseline tree.
- Checked the current State/federal constitutional text, Corindal profile, news 118, NRS 134, published frontier metadata and active canonical/planning records against the approval conversation.
- Local verification passed: fetched baseline blob hashes match GitHub; added relative links resolve against the baseline tree plus this change; modified scope is Markdown documentation only; the candidate remains byte-for-byte identical; the whitespace check reports no errors.
- Recomputed coalition totals: 37 / 30 / 29 meet 26; a single faction plus all unaligned reaches only 22 / 21 / 14.
- Confirmed unchanged Eleventy configuration excludes `docs/**`; unchanged `vercel.json` disables feature-branch Git deployments. No public HTML, data ledger, publishing sequence, clock, constitutional source or deployment configuration is changed.
- The full application build/test suite was not run locally for these internal Markdown edits. The initial content commit passed the GitHub **World publishing** push check ([run 41966199823](https://github.com/jcr0916-hue/federatedrepublic/actions/runs/41966199823)); final-head validation is tracked in PR #300. That initial result does not assert the outcome of later runs.

## Decisions and lessons

- **Approved:** the political foundation is editorial continuity, distinct from a new World/NRS publication or in-world official act. Reuse the dedicated approval record when preparing future coverage.
- **Rejected:** treating the alignment estimate as certified results, giving a lone faction a majority through three unaligned members, or making Ferrel indispensable to every coalition.
- **Rejected:** inventing a remedial statute, allowing political officials to draw/select the commission's map, importing the freight candidate's cast by reference, or drafting a duplicate freight story.
- **Unresolved:** the exact mid-cycle statutory mechanism, Year 14 polling date/results, audit outcomes/restoration, future candidacies and all reserved Rehn developments. The first election feature excludes Rehn.
- **Shipped:** none by this branch at handoff; main and public release are outside authorization. **Experimental:** none.

## Open follow-ups

The author reviews the PR for merge approval. Any first election feature is later drafting/publication work, not delivered or published here. Preserve the current frontier and all unresolved decisions.

## Preservation and branch disposition

This note and substantive documents are retained together on the feature branch pending review; preservation on main has not occurred. The unpublished candidate is retained in its existing repository path without adopting its contents.

**Branch disposition:** retain as the head of an open, unmerged PR. No branch cleanup or deletion is authorized or performed. After an explicitly authorized merge, apply the [three-branch lifecycle](../BRANCH-LIFECYCLE.md) and record actual disposition in the cleanup ledger; this note is not deletion clearance. Prefer a merge commit to preserve original history.

**Pending dependency review:** repository deployment settings were read as described above; live hosting bindings, external automation and final branch protections/dependencies have not been comprehensively checked. No `branch-cleanup-review` attestation is supplied. Recheck the final SHA, preservation, protections and dependencies before any future cleanup, using the [rolling-cleanup workflow](../../../../.github/workflows/rolling-branch-cleanup.yml).
