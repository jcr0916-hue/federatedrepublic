# Repository working instructions

## Branch lifecycle and historical knowledge

For every new development branch and pull request:

1. Create a brief permanent handoff note under `docs/archive/development/branches/` in the **same PR**. Use the PR number when available for the filename (`pr-<number>.md`), otherwise a descriptive branch slug; do not rename an existing note merely to add a PR number.
2. Record original branch name, purpose, significant changes and files, experiments/tests and actual results, decisions/rejected approaches, known limitations, and links to relevant PRs, commits or artifacts. Mark unavailable information as *not established*; do not invent results.
3. Distinguish what was **shipped**, **experimental**, **rejected**, **unresolved**, and **historically preserved**. Note specifically what future work should reuse or avoid repeating.
4. Finish the handoff note **before merging** so it is archived automatically on `main`; there is no separate post-merge archive commit. Record the pending branch-disposition check, then record the eventual deletion or retention in the cleanup ledger, avoiding a second needless PR solely to edit the note.
5. **Delete merged task branches by default.** Once PR checks pass and the handoff note is preserved on `main`, run the reviewed post-merge cleanup; do not retain a branch merely because it was used for testing. Verify its frozen tip SHA, protected/default status, reachable historical commits (including the permanent archive), open PRs, and deployment/automation references before deletion. Use an atomic SHA lease for the deletion; if verification fails, retain and document why. A branch with unique history needs preservation review rather than a forced deletion. Already-absent branches count as complete, not failures.
7. **Branch closure is part of the task.** A PR is considered content-merged but not administratively closed until the merged head branch is deleted or a concrete retention exception is recorded in its archived handoff. Report both merge and disposition; do not describe a still-live branch as cleaned up. Deletion may be carried out by a safeguarded post-merge workflow or a reviewed cleanup batch, without a fresh routine user approval for each fully verified task branch. Never bypass protections to meet the default.
6. `main` and `archive/legacy-project-material` are permanent and must not be deleted.

Use [the branch handoff template](docs/archive/development/BRANCH-HANDOFF-TEMPLATE.md) and consult [historical branch reports](docs/archive/development/BRANCH-REPORTS-INDEX.md) before repeating prior analysis.

Keep branch handoffs concise; link extensive logs rather than copying them. Constitutional, Torenthia, and website editorial records belong in their existing substantive folders; the branch handoff note links to those records rather than replacing them.
