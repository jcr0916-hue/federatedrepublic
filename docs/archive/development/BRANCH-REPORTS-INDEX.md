# Development branch history — cleanup stage 1

## Current cleanup and rotation

- [October 30 frozen inventory](BRANCH-CLEANUP-20261030.json) and [preservation/dependency review](BRANCH-CLEANUP-REVIEW-20261030.md): 57 audited refs, 47 completed branches, original-history preservation, handoffs, deletion preview, and explicit exceptions.
- [Three-branch lifecycle](BRANCH-LIFECYCLE.md), [reviewed policy](branch-cleanup-policy.json), and [implementation handoff](branches/branch-rotation-cleanup-20261030.md).
- [October 18 actual cleanup results](BRANCH-CLEANUP-RESULTS-20261018.md) and [exact deletion ledger](BRANCH-CLEANUP-RESULTS-20261018.json): 135 refs deleted, cold storage preserved, substantive holds retained.

The older reports below are historical checkpoints. Their counts and proposed dispositions are not current deletion clearance.

These reports preserve initial branch purposes and compare each historical branch to `main`. They are **evidence references**, not full forensic preservation or clearance for deletion.

| Branch | Ahead of main | Action |
|---|---:|---|
| [`benchmark-navigator-sonnet5`](branch-benchmark-navigator-sonnet5.md) | 6 | Hold pending unique-work assessment |
| [`constitutional-subsidiarity-transition`](branch-constitutional-subsidiarity-transition.md) | 8 | Hold pending unique-work assessment |
| [`publishing-safety-and-papers`](branch-publishing-safety-and-papers.md) | 12 | Hold pending unique-work assessment |
| [`torenthia-publish-2026-10-09`](branch-torenthia-publish-2026-10-09.md) | 0 | Provisional cleanup candidate |
| [`weekend-infrastructure`](branch-weekend-infrastructure.md) | 0 | Provisional cleanup candidate |
| [`world-record-generator`](branch-world-record-generator.md) | 0 | Provisional cleanup candidate |

## Delete-gate checklist

- Confirm all relevant historical versions, tests, outcomes and decision records are preserved in `main` or immutable historical storage.
- Inspect branch-specific files and unique commits; record a source commit SHA and destination for each retained artifact.
- Confirm no open pull request or active deployment needs the branch.
- Produce a separate signed-off deletion manifest and review it before removing any remote ref.
- Retain `main` and `archive/legacy-project-material`. Do not delete either.

## Note on branch counts

This repository had 129 branches at the opening of the October 13 cleanup session, including `main` and the storage branch. Counts change with short-lived work branches and should always be refreshed before deletion.
