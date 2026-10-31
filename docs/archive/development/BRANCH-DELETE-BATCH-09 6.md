# Branch cleanup — Batch 09 — frozen candidate manifest

2026-10-14. This batch has **six** candidate refs. This manifest freezes each SHA after the first-pass audit recorded in [Batch 09 audit](BRANCH-DELETE-BATCH-09-AUDIT.md). None of these candidates has commits ahead of `main` as checked at audit time. The two permanent branches are excluded.

| Branch | Frozen head SHA | Ahead of main |
| --- | --- | ---: |
| `fix/idempotent-reviewed-branch-cleanup-20261014` | `36713d52da1a5185c651fe741b971b4655efed70` | 0 |
| `maintenance/branch-cleanup-batch-08-20261014` | `8be96c35ae4282fa39aa0ec78aec4ffa11337396` | 0 |
| `korda-convention-resolution-and-vote-2026-10-10` | `c9d4885d8801f5dfb1d074beab133532d574e637` | 0 |
| `navigator-answer-judicial-selection` | `1d3e734b0a2a5201e39b6a0c57220f14f5549bad` | 0 |
| `navigator-deterministic-title-match` | `02e9125d7b524cf5e33f21035b85d0b28d1916d2` | 0 |
| `content/torenthia-2026-10-01` | `e0b76dcffa0b1f0b5e8e2f1ceb75d089bed44b62` | 0 |

The archive branch was independently checked at `0053ac4da09d32807d7f5b71ef0fff2075b421c1`. Open-PR search showed only #149, whose branch is not in this batch. The guarded workflow repeats the checks for candidate SHAs, archive stability, open PRs and history preservation before deletion. It also treats missing candidate refs as already deleted.

**External dependency clearance is NOT established by this manifest.** Before selecting `DELETE-BATCH-09`, separately confirm that deployments, automation, workflows and integrations do not require these six branch names. Run the workflow on `main` in `preview` first. Merging this PR performs no deletion; deletion requires a separate manual dispatch and explicit mode selection.

Existing branch-history reports preserve development work. Do not redo already documented research. The running total before this batch is **59 confirmed deletions across eight batches**.