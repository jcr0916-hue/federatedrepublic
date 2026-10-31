# Branch cleanup — Batch 09 (candidate audit, no deletion approval)

Audit date: 2026-10-14. This record is **not** a deletion manifest and does not authorize removal of any ref.

## First-pass candidates

The GitHub compare endpoint returned **zero commits ahead of `main`** for these six refs during the initial audit:

| Branch | Ahead of main | Behind main |
| --- | ---: | ---: |
| `fix/idempotent-reviewed-branch-cleanup-20261014` | 0 | 1 |
| `maintenance/branch-cleanup-batch-08-20261014` | 0 | 4 |
| `korda-convention-resolution-and-vote-2026-10-10` | 0 | 192 |
| `navigator-answer-judicial-selection` | 0 | 504 |
| `navigator-deterministic-title-match` | 0 | 512 |
| `content/torenthia-2026-10-01` | 0 | 452 |

These are candidate results only, not approved branch deletions. Their unique commit history appears preserved on `main` by ancestry comparison, but other deletion gates remain to be checked.

## Excluded pending separate review

- `fix/cleanup-batch05-permanent-reachability-20261014`: 1 commit ahead of `main`.
- `torenthia-2026-10-08-korda-compilation`: 11 commits ahead of `main`, though comparison with the permanent archive showed 0 ahead.
- `navigator-context-packets`: 3 commits ahead of `main`.
- `site-link-consistency`: 1 commit ahead of `main`.

These are **not** automatically unsafe to delete; they simply need preservation and results-focused review before selection. Do not repeat reviews already captured in earlier branch reports; consult existing reports first.

## Required gates before any DELETE-BATCH-09 workflow

1. Retrieve and freeze each candidate's exact remote head SHA, and ensure it cannot drift.
2. Check no open pull request or automation, deployment or external integration needs its branch name.
3. Re-check ancestry against `main` or `archive/legacy-project-material`, archive reference stability, and both permanent branch protections.
4. Preserve any branch-specific findings not already documented in the existing branch reports.
5. Create a new reviewed Batch 09 manifest and **preview-only** guarded workflow configuration; deletion must require separate explicit approval.
6. Ensure an already-deleted ref is reported as `ALREADY DELETED`, not a 404 failure.

**No refs are deleted by this PR.** Historical running total before this audit: **59 confirmed deletions in 8 batches**.
