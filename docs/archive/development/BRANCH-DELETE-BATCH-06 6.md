# Reviewed branch cleanup — batch 06 (2026-10-14)

Ten historical maintenance, Constitution recovery and website-fix refs are proposed. All ten branch tips were individually verified **zero commits ahead of current main**. Historical reports and the original work remain in `main`; their older heads are also accounted for by the preservation archive where applicable. There are currently no open PRs using these ten names. The guarded workflow must recheck SHAs, open PR heads and commit reachability before any deletion.

| Exact ref | Frozen SHA | Ahead main |
|---|---|---:|
| `fix/annotated-table-of-contents-20261013` | `d2f4f07d95d874e7237f613966acc775b9e83309` | 0 |
| `fix/cleanup-reachability-either-permanent-20261014` | `3fccb1d7351c73424f6d7712fdc60dea57149af4` | 0 |
| `fix/remove-stale-annotated-preamble-20261013` | `1fb728850cb283158cfde97aeb0b216475cd6241` | 0 |
| `history/constitution-recovery-index-20261012` | `30f5bc882dfb11cc07dd0d8d75937473a0450290` | 0 |
| `history/recover-constitution-editions-20261012` | `a12a14c5d0ffefeedbb158bfc9fcd64d3b65b7a0` | 0 |
| `history/recovered-constitution-source-editions` | `e23bf126f64d75515c366ef6923a0b8baf7020e6` | 0 |
| `history/two-track-constitution-recovery-20261012` | `61f5cc1f88d29f60d372f230aac3c7c90a3a2302` | 0 |
| `maintenance/branch-cleanup-batch-05-20261014` | `dcac879b698b814355e694737a7099846589b814` | 0 |
| `maintenance/decision-register-ai-20261013` | `5247ba8ddebd931e33491a55d42da3d652c9f085` | 0 |
| `maintenance/development-branch-history-20261013` | `c8ab278b017fd8948b0c25555716b8319061a399` | 0 |

This is not permission to delete on merge. Use workflow `preview`, separately confirm branch-name deployment and automation dependencies, then explicitly run `DELETE-BATCH-06`. Neither `main` nor `archive/legacy-project-material` is eligible. The open `fix/cleanup-batch05-permanent-reachability-20261014` branch is excluded.
