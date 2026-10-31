# Branch history — maintenance/branch-handoff-policy-20261014

**Original branch:** `maintenance/branch-handoff-policy-20261014`  
**PR:** to be assigned on PR creation  
**Status:** proposed

## Purpose
Introduce a routine that preserves branch decisions and results without recreating historical investigations.

## Changes and artifacts
- `AGENTS.md`: working instructions for future branches.
- `.github/pull_request_template.md`: small merge-time handoff checklist.
- `docs/archive/development/BRANCH-HANDOFF-TEMPLATE.md`: structured record of work and findings.
- `docs/archive/development/BRANCH-LIFECYCLE.md`: merged note retention, separate deletion gate and natural stopping criteria.

## Results and verification
Documents created on this branch; GitHub Actions/PR checks not yet confirmed. No branch deletion performed.

## Decisions and lessons
- Keep the handoff note under a durable archive path **before merging**, so it lands naturally on `main` without post-merge file moves.
- Do not automatically delete on merge: a note alone does not establish Git history preservation or clearance of deployments and automation.
- For legacy branches, reuse existing preservation reports and distinguish retained Git history from reviewed experiment results.

## Open follow-ups
- Verify PR review and merge.
- Evaluate historic branches with unique commits using existing research; do not force cleanup when straightforward candidates are exhausted.

## Preservation and branch disposition
This note and its four associated policy files will be retained on `main` if merged. External branch-name dependencies not checked. **Deletion approval: not granted.**
