# Branch lifecycle — preserve knowledge and retain three completed branches

`main` and `archive/legacy-project-material` are permanent. Cold storage is never a rotation candidate. GitHub's unconditional delete-on-merge setting must remain disabled.

## Finish each development branch

Create a temporary branch, test it, and include a concise permanent Markdown handoff under `docs/archive/development/branches/` in the same PR. Use [the template](BRANCH-HANDOFF-TEMPLATE.md); record shipped work, experiments, rejected approaches, actual test results, unresolved issues, and reusable lessons. Unknown results are **not established**, never guessed. Complete the note before merging; no post-merge file move is needed.

Prefer **Create a merge commit**, preserving the original branch tip and intermediate commits on main. Squash/rebase merges may leave unique Git objects; those branches remain held until their original history is deliberately preserved. Historical preservation does not adopt obsolete content. For the October 30 backlog, a history-only merge preserves 141 original commits with an unchanged source tree; see [the audit](BRANCH-CLEANUP-REVIEW-20261030.md).

## Three-branch rotation and exceptions

Keep the **three newest eligible completed branches by PR merge timestamp**, with PR number as a deterministic tie-breaker. An eligible branch must have a same-repository merged PR to main, the exact merged tip still live, both original tip and merge commit reachable through permanent history, a handoff on main, and current dependency clearance. Every older eligible branch is a deletion candidate.

Retain **in addition** all permanent/default/protected refs, applicable branch rules, open PR heads/bases, unfinished work, unique unpreserved commits, active workflow/deployment references, and uncertain or expired dependency reviews. Never force a numerical target by deleting an uncertain branch. The [policy manifest](branch-cleanup-policy.json) records frozen historical reviews and explicit holds.

## Explicit external dependency review

GitHub cannot inspect every hosting or external automation setting. After the final commit, a repository owner/collaborator must check branch-specific deployment hooks, domain/environment bindings, active deployments, and automation. Add one JSON marker to the PR description, replacing the example values with real verified information:

```text
<!-- branch-cleanup-review: {"sha":"EXACT_40_CHARACTER_FINAL_SHA","handoff":"docs/archive/development/branches/your-handoff.md","dependencies":"none","reviewed_at":"2026-10-30T12:00:00+00:00"} -->
```

The attestation identifies the exact frozen SHA and an existing handoff naming the original branch. It expires after **seven days**. A new commit invalidates it. A missing, malformed, expired, future-dated, or fork-authored review cannot authorize deletion. Do not add it for an unchecked or active dependency. Update it only after another actual review. Historical reviewed entries follow the same expiry and SHA rules.

## Recurring cleanup and ledgers

[Three-branch rolling cleanup](../../../.github/workflows/rolling-branch-cleanup.yml) runs after a successful **World publishing** main run. Dispatch manually from main in **preview** (default) or **apply** mode. PR/other-branch execution cannot activate this privileged job. The script fetches full history and completely paginates branch, PR, active-run, and deployment records. It rechecks protections/applicable rules, literal workflow references, permanent tips, original history, handoffs, and explicit external reviews.

Every apply consumes a JSON preview less than one hour old and repeats all safety gates for batches of at most 20. Deletion is a single atomic Git push per batch with an exact SHA lease on every ref. A stale lease is never overridden. Missing refs are already complete, including disappearance between validation and push; they are never recreated. Protection/API/preservation uncertainty stops or holds the operation.

Each run publishes a mobile-readable Actions summary and a JSON preview/actual ledger artifact for 90 days. Permanent session results belong in `docs/archive/development/BRANCH-CLEANUP-RESULTS-<date>.*` and the [report index](BRANCH-REPORTS-INDEX.md). Report merge and actual deletion/retention separately. A handoff may state its pending three-branch-buffer exception and link the cleanup workflow, avoiding a needless PR just to edit the note afterward.

## Natural stopping rule

Stop when only the three-branch buffer and documented exceptions remain. Review unique historical work substantively before adopting, archiving, or retiring it. Reuse the October 18 [results](BRANCH-CLEANUP-RESULTS-20261018.md), [older preservation manifest](COMPLETE-BRANCH-PRESERVATION-MANIFEST-20261013.md), and [reports](BRANCH-REPORTS-INDEX.md) before repeating earlier research.
