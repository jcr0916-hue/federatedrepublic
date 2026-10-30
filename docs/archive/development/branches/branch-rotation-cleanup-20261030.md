# Branch history — three-branch rolling cleanup

**Original branch:** `maintenance/branch-rotation-cleanup-20261030`
**PR:** [#269 — preserve branch history and enforce guarded three-branch rotation](https://github.com/jcr0916-hue/federatedrepublic/pull/269).
**Status:** implementation and preservation prepared in PR #269; live disposition pending post-merge gates.

## Purpose and significant changes

Finish the backlog after October 18 and make branch closure sustainable: permanent main/cold storage, three newest eligible completed branches, and concrete exceptions. The [frozen inventory](../BRANCH-CLEANUP-20261030.json) covers all 57 branches at the expanded audit checkpoint; the [review](../BRANCH-CLEANUP-REVIEW-20261030.md) links 47 completed-branch handoffs and seven substantive holds. A concurrently created Torenthia branch remains independent active work.

The history-only commit `0bb710a2966b119c42552fd7b7061063a9ebf33d` has the exact tree of audit main `a8bf128dae8db8710d3a10f1de101439c338781d`, preserving 141 original commits via 29 original completed tip parents. Merge this PR with a **merge commit**, not squash/rebase, or preservation will not reach main. Cold storage remains unchanged.

`scripts/rolling-branch-cleanup.py`, safety regressions, the reviewed policy JSON, and two workflows implement live inventory, seven-day external attestations, default preview/manual apply, recurring post-main-CI rotation, full pagination, open-head/base/protection/ancestry/dependency checks, fresh previews, atomic batches of at most 20, SHA leases, and already-absent completion. Two obsolete release-specific workflows are retired; original versions remain in Git. Eighteen missing historical handoffs are backfilled from verified merged PR evidence.

## Verification and results

- Initial baseline site build passed: 485 output files, SHA-256 hashes recorded for exact comparison after changes.
- 24 new destructive-operation regressions, 12 existing Batch 12 safety regressions, and seven manifest regressions passed locally.
- Final site comparison passed: all 485 output files are byte-identical to the baseline; zero public file changes. Both workflow files parse successfully.
- CI, merge, and actual cleanup results: pending. No branch deletion is claimed by this pre-merge handoff.

## Decisions and lessons

**Shipped when merged:** preservation and guarded policy/workflow. **Historical:** intermediate completed-branch versions, never adopted into the current tree. **Rejected:** unconditional automatic deletion, REST read-then-delete pretending to be an atomic lease, and writing to/deleting cold storage. **Unresolved:** seven substantive branch holds in the policy; no editorial or constitutional choice is inferred from a closed PR. Reuse the explicit review marker and merge commits for future work. A squash merge or missing review safely blocks automatic cleanup.

## Preservation and branch disposition

This handoff lands in main with the implementation. Keep this branch temporarily as one of the three newest eligible completed branches after merge; the next reviewed completions displace it automatically. An exact final-tip dependency review will be attached to the PR after verification. The Actions summary/artifact and permanent session results ledger record actual disposition separately. Production source and build configuration are outside this change; no deployment, alias, domain, environment, or security setting is deleted.

A separately completed Torenthia PR #268 was audited during execution; its original tip `ceb1b5c006ece0e7fdcec57028c7c56ef8237603` is an additional parent of the delivery commit, preserving 5 more original commits. Its substantive published content remains in its own PR.
