# Reviewed cleanup batch 08 — fully retained histories

Six existing historical branch tips were individually compared to current `main` and found to have **0 commits ahead**. The previously recorded design-principles and Constitution closing decisions, PDF production, World opening, and maintenance code remain in the current main history. This cleanup removes only redundant ref names after explicit activation.

| Branch | Frozen tip SHA | Commits ahead of main |
|---|---|---:|
| `maintenance/branch-cleanup-batch-07-20261014` | `f72216cf67ca0b85fcd0300e95546475695ae6ce` | 0 |
| `design-principles-update-2026-10-10` | `aa9832169f8dcbd47832b21ba9ba442ea958c7a4` | 0 |
| `world-y13m12-opening-records` | `6b4fffd5a8c450adffac502ffba519dab6e36efc` | 0 |
| `constitution-pdf-2026-10-11` | `557a4f6d800b84cf9810cf9916c616be53289003` | 0 |
| `constitution-door-closing-2026-10-10` | `f960865f0e0792771cd3fc943057b543e4fbd73e` | 0 |
| `changelog-and-open-items` | `bc89834686c1f5a498860a84ac79eb0686b61a4e` | 0 |

The workflow is preview-only by default. It rechecks immutable tips, no open PR head, and reachability from either permanent branch. An operator must additionally confirm no deployment or automation depends on each name before choosing `DELETE-BATCH-08`. The branch `fix/cleanup-batch05-permanent-reachability-20261014` remains excluded because it is attached to open PR #149. Experiments not reachable from current main remain excluded pending substantive outcome review.
