# Branch handoff — testing/korda-agent-readiness-20261101

**Original branch:** `testing/korda-agent-readiness-20261101`
**Base:** active feature `docs/federated-editorial-operating-model-20261101` at [`be462b06604681d4dadfdabafb395b0c64876e04`](https://github.com/jcr0916-hue/federatedrepublic/commit/be462b06604681d4dadfdabafb395b0c64876e04), [PR #273](https://github.com/jcr0916-hue/federatedrepublic/pull/273).
**PR:** [#274](https://github.com/jcr0916-hue/federatedrepublic/pull/274), draft stacked on #273; no merge is requested.
**Substantive checkpoint commit:** [`0e0cb5df4f7b8e721a9467613bc92d3654102a28`](https://github.com/jcr0916-hue/federatedrepublic/commit/0e0cb5df4f7b8e721a9467613bc92d3654102a28). This handoff-reference follow-up is its direct child; the exact final head is reported in #274 and the saving chat.
**Status:** saved documentation and historical evidence; testing remains incomplete; nothing shipped to main.

## Purpose and branch choice

Preserve the approved Korda founding-Compact editorial reconstruction and all supplied setup/testing/draft documents from Constitution 15. Live inspection found fifteen remote refs. The prior weekend testing branch, `weekend/state-tests-research-framework-20261031` at `ba8a47d9aa7b4b2520f05899b0cd01ef10f16758`, completed through merged [PR #271](https://github.com/jcr0916-hue/federatedrepublic/pull/271) on October 31, 2026. It is retained history, not the active place to restart testing.

The chosen testing branch starts at the open editorial feature's exact existing head, preserving both of its commits and its Corindal/editorial work. It adds a separate reviewable Korda checkpoint without modifying that feature ref, other branches, or existing local checkouts. The inspected local weekend and Korda checkouts were clean and are left untouched. Main was `ed68a7aa62fe4c36f3376cc3f7199d7980b15ce7`; no merge, deployment or publication is authorized here.

## Changes and artifacts

- [Canonical Compact](../../../torenthia/KORDA-TERRITORIAL-COMPACT.md): user's final file, byte-identical to the existing saved copy, with only the two approved final copyedits relative to the corrected draft. Canonical editorial reconstruction; not an independently verified historical transcript or new NRS act.
- [Korda checkpoint](../../../torenthia/agents/korda/README.md): setup inventory, exact progress, qualifications, superseded material and next step.
- [Original setup files](../../../torenthia/agents/korda/setup/), [source/draft register and hashes](../../../torenthia/agents/korda/SOURCE-MANIFEST.json), original attachments and the recovered final five conversation turns.
- [Assigned Trial 01](../../../torenthia/agents/korda/TRIAL-01-PROMPT.md), [historical review](../../../torenthia/agents/korda/TRIAL-01-REVIEW.md) and [pending follow-up](../../../torenthia/agents/korda/TRIAL-01-FOLLOW-UP.md).
- Torenthia documentation hub and State-story pilot link this checkpoint; the hub's two stale public-index links now point to existing source pages. All changes remain under `docs/`, excluded by the existing site build.

## Actual results and verification

- The supplied setup packet contains five files; the two chat attachments and final Compact bring the byte-preserved source count to eight. Original SHA-256 hashes and byte counts are in the manifest.
- Trial 01 is **conditional pass — incomplete submission**, as assessed in Constitution 15. Parts I/II were submitted; Parts III/IV are missing. The review finds constitutional/Compact/current-canon understanding satisfactory, source verification partial, and editorial independence not yet demonstrated.
- The saved completion prompt requires three independent story opportunities (at least one ordinary local concern), detailed source verification and an accurate distinction between the Convention and the federal Assembly members constituting it.
- No new external-agent trials, runtime/access inspection, full source audit or Trial 02/03 was performed. The source packet and training upload are author-reported. Earlier chat turns, a separate Constitution training attachment, and a live TypingMind export were not supplied.
- Source-fidelity verification passed for all **eight original files**. All **twelve Compact articles** match the corrected draft after exactly the two approved body copyedits, with heading/blank-line formatting normalized for comparison. **45 relative documentation links** resolve against the base tree plus the checkpoint. Trial-completeness and follow-up checks passed; **17 files, all under `docs/`**, are included. Remote-tree verification also confirmed all 17 uploaded blobs match the locally verified bytes and every other pre-existing file is unchanged. Remote CI is tracked on [PR #274 checks](https://github.com/jcr0916-hue/federatedrepublic/pull/274/checks); no unobserved CI result is asserted here.
- Inspected `vercel.json` keeps non-main Git deployments disabled (`"**": false`, `"main": true`); no deployment configuration is changed. The World publishing workflow runs checks for branches and PRs; this is validation, not an instruction to publish new records.

## Decisions, rejected approaches and reuse

**Accepted:** reuse the final Compact without redesign; preserve all original files verbatim; distinguish approved editorial reconstruction, published canon, source evidence and unresolved proposals. Preserve the earlier three-trial outline while identifying the later four-part Trial 01 as the actual unfinished assignment.

**Rejected/superseded:** residual executive authority as an assumed appointment authorization; the redundant Article 1(2) non-State sentence; equating thirty-three federal members with thirty-three districts; treating the Convention as unrelated in membership to Korda's federal delegation; treating the trial response's offer to begin reporting as a full pass.

**Historically preserved:** the corrected draft's explanation and citation-audit sections, its superseded wording, the incomplete trial submission and original setup instructions. Do not silently rewrite these as current instructions or canon.

## Open follow-ups

Send the saved completion prompt to the Korda Agent; review Parts III/IV and the institutional clarification before a definitive Trial 01 decision. Do not begin Trials 02/03 or original reporting on the strength of this checkpoint. Review exact live configuration and refresh published sources before later operational use.

The testing branch depends on open PR #273. Keep its changes and this checkpoint reviewable; eventual integration must preserve both handoffs. This task expressly stops before any merge to main, deployment, fictional-time advance or World/NRS event.

## Preservation and branch disposition

The handoff is permanent Markdown included with the substantive files in the same draft PR. **It is presently preserved only on this testing branch, not yet archived on main.** Do not claim eventual merge or deletion as complete.

Retain this unfinished/open-PR branch and its active #273 base. Under [AGENTS.md](../../../../AGENTS.md) and [the lifecycle policy](../BRANCH-LIFECYCLE.md), any eventual approved integration must carry the handoff into main before closure, preferably by a **merge commit** preserving the original tip and intermediate commits. A squash/rebase requires deliberate preservation of otherwise unreachable original history.

After final integration, retain the **three newest eligible completed branches ordered by PR merge time**, plus unfinished/open PR, protected/default, active-dependency and unique-history exceptions. Before any later deletion, verify the frozen tip and protections/rules, exact merged tip and permanent ancestry, permanent handoff, deployment/automation dependencies, and a current explicit external dependency review. Preview first; repeat the gates and use an atomic SHA-leased deletion. A moved or uncertain ref is held. Record actual retention/deletion in the rolling-cleanup ledger, not a second routine archive PR.

**Dependency review:** repository rulesets returned empty at inspection and existing listed branch flags were unprotected; this is not external dependency clearance. External hosting hooks and automation settings have not been fully inspected, and #273 is an active dependency. No `dependencies: none` deletion attestation is granted. Any later attestation must identify the exact final SHA and this handoff, follow the seven-day expiry rules, and be renewed after new commits.

`main` and `archive/legacy-project-material` are permanent; cold storage is outside rotation. No branch is deleted, no unconditional delete-on-merge setting is enabled, and no cleanup workflow is invoked by this save.
