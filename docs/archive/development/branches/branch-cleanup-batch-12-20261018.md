# Branch cleanup batch 12 — 2026-10-18

## Scope
Review ten existing branches with no commits ahead of main, checked using GitHub compare on 2026-10-18. Candidate SHA pins are in scripts/reviewed-branch-cleanup-batch-12.py. Prior branch-cleanup Batch 05 Boolean correction was merged in PR #149.

## Safety and modes
Script defaults to CLEANUP_MODE=preview and requires GITHUB_REPOSITORY, GITHUB_TOKEN. It validates each expected SHA against the live ref, blocks an open PR, verifies every commit is preserved in at least one of main or archive/legacy-project-material, and checks the frozen archive tip. It never deletes in preview. An explicitly configured CLEANUP_MODE=DELETE-BATCH-12 is required for deletion; do not set it until user approval and preview result review. Check external preview deployments/references before deleting.

## Verification completed
- Ten named branches confirmed with ahead_by=0 relative to main using GitHub compare.
- Two permanent branches intentionally omitted.
- PR #197 remains unresolved and its head is excluded.
- No deletes performed; no runtime authenticated preview of the new script has been executed.

## Next steps
Merge PR only after review; execute preview using repository-owned authenticated environment (GITHUB_REPOSITORY and GITHUB_TOKEN). Check results and explicit approval before any DELETE-BATCH-12 execution. Inventory and review remaining branches in follow-on batches.
