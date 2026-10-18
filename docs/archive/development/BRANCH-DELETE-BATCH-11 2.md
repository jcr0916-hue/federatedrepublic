# Branch cleanup — Batch 11 (frozen two-branch manifest)

2026-10-14. Following **71 verified deletions in ten batches**, this deliberately narrow batch contains two refs whose entire commit histories are already reachable from `main`. All other sampled branches showed commits ahead of `main` and are deferred for results and preservation review.

| Branch | Frozen SHA | Commits ahead of main |
| --- | --- | ---: |
| `maintenance/branch-cleanup-batch-10-20261014` | `f4dc10d46733125002efe5330a25d868acdafe5c` | 0 |
| `site-new-world-map` | `77bd9ab994048cc6182dc26b02c8bc66a1ba73c5` | 0 |

GitHub's open-PR search showed #149 and #157; neither is one of these branches. The script protects `main` and `archive/legacy-project-material`, compares frozen SHAs, checks current open pull requests, verifies history preservation and stable archive tip, and tolerates already-deleted candidate refs. The permanent archive tip expected by this workflow is `0053ac4da09d32807d7f5b71ef0fff2075b421c1`.

**External dependencies remain unverified**. Before any deletion: merge this PR, run a successful manual `preview` on `main`, verify no deployment, automation, workflow or integration relies on either branch name, and explicitly dispatch `DELETE-BATCH-11`. Merging this PR itself deletes nothing. If both are subsequently deleted, the cumulative confirmed total will be 73.

## Deferred work
Branches with unique commits are not deletion candidates without checking either permanent branch and reviewing useful historical work. Examples observed: `navigator-open-guide` (5 ahead of main), `world-metadata-safety-net` (8), `website-refresh` (2), `constitution-reader-polish` (1), and `world-oct4-content` (15). Use the existing reports to avoid duplicating previous analysis.
