# Branch history — fix/constitutional-archive-recovery-261023

**Original branch:** `fix/constitutional-archive-recovery-check-261023`

**PR:** not yet opened

**Base:** published release merge `8759e9f73de4609b856b06ff13bd97f4358bfc41`

**Status:** proposed corrective follow-up; public release already verified

## Purpose and changes

Finish the constitutional release's post-merge validation by repairing the recovery job's handling of two documented historical incidents. See the [repair record](../../../operations/CONSTITUTIONAL-ARCHIVE-RECOVERY-261023.md) and [public production snapshot](../../../operations/constitutional-release-261023-production.json).

The script narrowly recognizes fixed duplicate-alias restoration commits and one historical JSON/Markdown mismatch with exact raw-source preservation. It adds the missing valid pre-#219 archive pair, eight regression tests, a full-history pre-merge recovery rehearsal and durable release deployment evidence. The approved Constitution and all public site/PDF outputs stay unchanged.

## Results and decisions

- **Proposed shipment:** fail-closed fixed-history reconciliation. All 33 archival tests passed; real history recovered one pair and then zero on repetition.
- **Historically preserved:** exact broken PR #219 sources with explicit unverified status; valid pre-#219 matched pair; all previously existing archives, baseline and Git commits.
- **Rejected:** advancing the baseline, deleting duplicates, certifying mismatched old text, allowing arbitrary future archive changes or suppressing the failed job. An initial workflow-file edit could not be published because the repository credential lacks workflow scope; commit `cb45b625` remains on the local original repair branch. The shipped approach integrates a read-only historical preflight into the existing `check` command already called by CI.
- **Experimental:** none. Final full publishing/remote checks and deployment verification are still required.

## Follow-ups and preservation

Record final CI, merge and production recovery success in the PR. Reuse the fixed-history evidence and regression cases when investigating another recovery failure; do not broaden these recognitions without fresh historical proof. Retain both this branch and `release-review-constitution-261023`; this repair changes an archival workflow and therefore must trigger its post-merge recovery run.

**Deletion approval:** Not granted. Separate preservation review is required. `main` and `archive/legacy-project-material` remain permanent.
