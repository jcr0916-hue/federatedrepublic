# Branch history — <branch name>

**Original branch:** `<branch>`  
**PR:** <link or not yet opened>  
**Head commit at handoff:** `<SHA or pending>`  
**Status:** proposed / shipped / experimental / rejected / unresolved

## Purpose
Brief goal and context.

## Changes and artifacts
- Relevant source, documents, scenarios and tests (paths/links).

## Results and verification
- Commands/checks, actual outcomes, benchmark findings, and any observed tradeoffs. Clearly distinguish tested from untested.

## Decisions and lessons
- Accepted decisions and reasons.
- Rejected or abandoned alternatives and reasons.
- What future work should reuse and what should not be repeated.

## Open follow-ups
- Unresolved defects, dependencies, risks, or next steps; write "none identified" only if verified.

## Preservation and branch disposition
- Where results and important files are retained on `main` or permanent archive.
- Any branch-only or intermediate history needing preservation review.
- Branch name dependencies (deployments, automation, external links): checked / not checked; describe evidence.
- **Branch disposition:** Keep temporarily if among the three newest eligible completed branches; otherwise delete through guarded, SHA-leased cleanup after successful merge. Retain protection, unique-history, unfinished-work, or active-dependency exceptions in addition to the rotating three. Link the eventual disposition ledger; a live branch is retained, not already deleted.
- **Dependency review:** After the final commit, inspect live deployment settings, automation, open PRs and branch rules. Add the exact final SHA and this note's path to the PR's `branch-cleanup-review` marker described in [the lifecycle policy](BRANCH-LIFECYCLE.md). Do not assert "none" for an unchecked dependency. The review expires after seven days; renew it only after checking again.
- **History preservation:** Prefer a merge commit so the original tip remains an ancestor of `main`. A squash merge requires separate original-history preservation before cleanup; a handoff or PR link alone does not preserve unreachable Git objects. Never change or delete cold storage as part of rotation.
