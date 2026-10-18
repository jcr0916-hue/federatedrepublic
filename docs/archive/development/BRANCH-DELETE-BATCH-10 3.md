# Branch cleanup — Batch 10 (frozen manifest)

Audit date: 2026-10-14. Six refs, all verified with GitHub commit comparison to have **zero commits ahead of main**. Frozen tips captured from the GitHub commit API. The batch is not automatically executed on merge.

| Branch | Frozen SHA | Ahead of main |
| --- | --- | ---: |
| `maintenance/branch-cleanup-batch-09-20261014` | `62ff4b9f8dcaa2a7648007fc55d3152094a17d46` | 0 |
| `maintenance/branch-cleanup-batch-09-audit-20261014` | `e181a80806dc69e1410e05264de4a96dad725707` | 0 |
| `korda-decision-runway-and-doc-cleanup-2026-10-10` | `b948073ac4f6862a1666739fdbb8abd7d2f59bc0` | 0 |
| `navigator-deterministic-explicit-section` | `5439648387e4d0bbfdcaa6670e1a82921fa1d67c` | 0 |
| `content/torenthia-2026-09-28` | `267114ec9b6e1ee49b82f7abb600b05f08024e44` | 0 |
| `docs/torenthia-2026-09-28-publication` | `62a05ef768fdbc23db93b9c890a30a93b9fca793` | 0 |

The permanent archive ref was frozen in the script as `0053ac4da09d32807d7f5b71ef0fff2075b421c1`. The currently open PRs #149 and #157 do not correspond to these six candidates. All branch-specific work is already reachable on `main`; prior development-report archives should be consulted rather than redundantly re-audited.

### Exclusions
Branches with unique commits ahead of `main` were **not selected**, including `session-progress-2026-09-26` (3), `update-weekly-tracking-2026-09-27` (2), `world-oct4-content` (15), `constitutional-review-2026-10-08-article-vi` (28) and `navigator-context-packets` (3). They remain for separate results/preservation analysis.

### Manual approval gates
1. Merge the proposed workflow and run **preview** from `main`.
2. Separately verify there are no deployments, workflow references, branch-name automations or external consumers dependent on these six branch names. **This clearance is not established here.**
3. Only then manually run `DELETE-BATCH-10`. The script rechecks SHA drift, archive stability, open PRs and permanent history before delete, and treats 404 missing refs as already deleted.

Prior confirmed deletion total: **65 across nine batches**. Potential total after this batch: **71**, if all six are newly deleted.
