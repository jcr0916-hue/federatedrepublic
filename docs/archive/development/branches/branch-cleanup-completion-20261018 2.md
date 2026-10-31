# Branch cleanup completion batches — 2026-10-18

**Original branch:** `maintenance/branch-cleanup-completion-20261018`

**Purpose:** Complete the verified publishing-repair and obsolete-ref workflow after #213 and #211, preserving all history and current canon.

## Changes and evidence

- [Permanent review](../BRANCH-CLEANUP-REVIEW-20261018.md) records actual repair/Batch 12 results, experimental preservation decisions, external dependency checks, and retained work.
- [Frozen manifest](../BRANCH-CLEANUP-20261018.json) contains 125 exact candidates in batches 13–19, with full SHA and preservation/provenance evidence.
- `scripts/reviewed-branch-cleanup-manifest.py` selects one bounded batch and reuses #211's live safety gates and atomic server leases. Seven manifest validation tests pass; the twelve core safety tests and five historical tests also pass.

## Decisions and limitations

Shipped history remains in main; historical experiments remain in the unchanged permanent archive. No stale source is restored and no Torenthia Year 14 event or constitutional meaning changes. Unrecorded historical measurements remain not established. The older experimental HOLDs receive explicit preservation review in the permanent review, rather than being cleared solely by branch age.

Deletion is separate from merge. The user explicitly authorized rigorously verified obsolete-branch deletion on 2026-10-18; preview and live dependency checks remain mandatory. The two unique-work branches and both permanent branches are excluded. This PR head is retained while open; it can be reviewed separately after merging and preservation in main. The final completion record must distinguish actual deletions from this proposed manifest.
