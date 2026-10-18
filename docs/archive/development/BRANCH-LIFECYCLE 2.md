# Branch lifecycle — write once, preserve on merge, delete only after review

## Default process for new branches

Create the development branch, make changes, and include one **concise historical handoff** under `docs/archive/development/branches/` in the same PR. Fill the fields in [the template](BRANCH-HANDOFF-TEMPLATE.md), adding result links and rejected approaches as appropriate. The handoff should survive the merge naturally because the note lives in the branch and lands on `main` with the work; **no post-merge move** is necessary. Update it if review changes the outcome.

Record outcomes that would otherwise require rerunning research or reconstructing experiments. A short summary and stable links suffice; avoid duplicating long logs or replacing domain-specific histories. A failed experiment can still be a valuable result.

## Deletion is separate

A merged PR, a completed handoff note, or a GitHub 'delete branch' affordance is **not** sufficient authorization. Branch cleanup remains a separate, manual, reviewable process: freeze SHA, confirm history remains reachable through `main` or `archive/legacy-project-material`, inspect any otherwise unique intermediate work, confirm no open PR and no external branch-name dependencies, run a preview, then explicitly approve the exact deletion list. Never delete the permanent branches.

For the current historical backlog, use the existing [preservation manifest](COMPLETE-BRANCH-PRESERVATION-MANIFEST-20261013.md), [branch report index](BRANCH-REPORTS-INDEX.md), and [deletion gates](BRANCH-DELETION-GATES-20261013.md) instead of writing fresh handoff notes for every old branch. Older experimental branches may require results analysis even when their Git objects are archived.

## Natural stopping rule

Stop bulk cleanup when straightforward, fully reviewed merged-history candidates are exhausted and only experiments, unverified branch dependencies, or unique work remain. At that point produce an inventory and ranked preservation-review queue rather than deleting branches merely to reduce the count. Resume deletion only after explicit outcomes and safety gates are documented.
