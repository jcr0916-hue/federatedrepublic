# Branch lifecycle policy revision — October 29, 2026

**Original branch:** `maintenance/branch-lifecycle-delete-by-default-20261029`
**Purpose:** Restore a short-lived development branch policy without repeating destructive cleanup errors.

## Shipped
- `AGENTS.md`: a branch is not administratively closed merely because its PR merged. Record its work in the same PR, archive on `main` at merge, then delete by default through reviewed SHA-leased post-merge cleanup.
- `docs/archive/development/BRANCH-HANDOFF-TEMPLATE.md`: make the disposition expectation explicit.
- Continue to protect `main` and `archive/legacy-project-material`, preserve unique history and active dependencies.

## Validation and prior lessons
- Prior cleanup records `docs/archive/development/BRANCH-CLEANUP-RESULTS-20261018.md` and `scripts/reviewed-branch-cleanup-batch-12.py` include live ref, ancestry, open PR, protection, and SHA lease checks.
- This policy update **does not itself perform deletion**, and existing task branches must be inventoried for safe cleanup.
- CI results are not yet established at draft time.

## Decisions
- Rejected: unconditional deletion immediately on merge (can lose unique work).
- Rejected: indefinite retention of every merged development branch.
- Selected: default deletion after verifying completed archive and safe ancestry, with documented exceptions.
- This policy branch is also subject to the new rule once merged.

## Unresolved
- Operationalize reviewed post-merge cleanup and apply it to retained historical branches; do not claim these refs have been deleted before verification.
