# Repository working instructions

## Branch lifecycle and historical knowledge

For every new development branch and pull request:

1. Create a brief permanent handoff note under `docs/archive/development/branches/` in the **same PR**. Use the PR number when available for the filename (`pr-<number>.md`), otherwise a descriptive branch slug; do not rename an existing note merely to add a PR number.
2. Record original branch name, purpose, significant changes and files, experiments/tests and actual results, decisions/rejected approaches, known limitations, and links to relevant PRs, commits or artifacts. Mark unavailable information as *not established*; do not invent results.
3. Distinguish what was **shipped**, **experimental**, **rejected**, **unresolved**, and **historically preserved**. Note specifically what future work should reuse or avoid repeating.
4. Keep the handoff note when merging: it becomes part of `main` automatically. Do not require a post-merge file move. Update it before merging if review changes the outcome.
5. Do **not** automatically delete branches on merge. A separate cleanup process must check frozen tip SHA, protected refs, reachable historical commits (including the archive), open PRs, and deployment/automation references. A branch with unique history must receive explicit preservation review. Missing branches count as already complete, not failures.
6. `main` and `archive/legacy-project-material` are permanent and must not be deleted.

Use [the branch handoff template](docs/archive/development/BRANCH-HANDOFF-TEMPLATE.md) and consult [historical branch reports](docs/archive/development/BRANCH-REPORTS-INDEX.md) before repeating prior analysis.

Keep branch handoffs concise; link extensive logs rather than copying them. Constitutional, Torenthia, and website editorial records belong in their existing substantive folders; the branch handoff note links to those records rather than replacing them.
