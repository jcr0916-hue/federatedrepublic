# Repository working instructions

## Branch lifecycle and historical knowledge

For every new development branch and pull request:

1. Create a brief permanent handoff note under `docs/archive/development/branches/` in the **same PR**. Use the PR number when available for the filename (`pr-<number>.md`), otherwise a descriptive branch slug; do not rename an existing note merely to add a PR number.
2. Record original branch name, purpose, significant changes and files, experiments/tests and actual results, decisions/rejected approaches, known limitations, and links to relevant PRs, commits or artifacts. Mark unavailable information as *not established*; do not invent results.
3. Distinguish what was **shipped**, **experimental**, **rejected**, **unresolved**, and **historically preserved**. Note specifically what future work should reuse or avoid repeating.
4. Finish the handoff note **before merging** so it is archived automatically on `main`; there is no separate post-merge archive commit. Record the pending branch-disposition check, then record the eventual deletion or retention in the cleanup ledger, avoiding a second needless PR solely to edit the note.
5. **Keep the three newest eligible completed development branches, ordered by PR merge time.** Delete older completed branches through reviewed rolling cleanup. Retain every open PR head/base, unfinished branch, protected/default ref, active dependency, and branch with unique unpreserved history in addition to the three-branch buffer. `main` and `archive/legacy-project-material` are permanent and must never be deleted; cold storage is outside rotation.
6. Before deletion, verify the frozen tip SHA, applicable protections, merged PR tip, original history reachability through permanent refs, permanent Markdown handoff, and deployment/automation references. Run a read-only preview, then repeat the gates and delete with an atomic server-enforced SHA lease. A moved/uncertain ref is held; already-absent branches are successfully complete. Never enable unconditional delete-on-merge or bypass protection to meet the count.
7. **Branch closure is part of the task.** Report content merge and actual branch disposition separately. Remaining in the three-branch buffer is a concrete temporary retention exception, discharged automatically when newer eligible branches displace it. The [rolling cleanup policy](docs/archive/development/BRANCH-LIFECYCLE.md) explains dependency attestations, preservation, workflow ledgers, and how to finish closure without another routine user approval.

Use [the branch handoff template](docs/archive/development/BRANCH-HANDOFF-TEMPLATE.md) and consult [historical branch reports](docs/archive/development/BRANCH-REPORTS-INDEX.md) before repeating prior analysis.

Keep branch handoffs concise; link extensive logs rather than copying them. Constitutional, Torenthia, and website editorial records belong in their existing substantive folders; the branch handoff note links to those records rather than replacing them.
