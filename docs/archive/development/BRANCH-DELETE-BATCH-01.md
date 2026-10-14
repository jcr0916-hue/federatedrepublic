# Branch cleanup — reviewed batch 01

**Status: ready for manual dependency confirmation; not yet deleted.** Baseline audit 2026-10-13. These 10 branch refs were each verified to have zero commits ahead of both `main` and the permanent `archive/legacy-project-material` branch. Original histories remain reachable. Live deployment/workflow dependency clearance is still required.

| Exact branch | Frozen expected tip | Ahead main | Ahead archive |
|---|---|---:|---:|
| `torenthia-publish-2026-10-09` | `5a4046721e56fd96e88eb42a215ba264384e764f` | 0 | 0 |
| `weekend-infrastructure` | `ada859069f514bb9de7a12d8c7edf31a3b5e3cf5` | 0 | 0 |
| `world-record-generator` | `e542cdf84ee75159c3de7594e547820449eb4ea7` | 0 | 0 |
| `auto-world-dossiers` | `ab4d57e2fe269b5013b99a0e17ca182250c34b85` | 0 | 0 |
| `maintenance/branch-preservation-inventory-20261012` | `a63fd59306c019d25f7c6a8b29f171f75745b395` | 0 | 0 |
| `maintenance/merged-branch-history-batch-01-20261013` | `0cfcbf6a9f29c6ecaadbf5488ddb5aa95eb94820` | 0 | 0 |
| `maintenance/merged-branch-history-batch-02-20261013` | `33305edc58a5b0d2cd67defe3e7b728a4de9d268` | 0 | 0 |
| `maintenance/merged-branch-history-batch-03-20261013` | `5e72f19dbf63d0f7b2344564e6b7433950c369d9` | 0 | 0 |
| `maintenance/merged-branch-history-batch-04-20261013` | `5a955cc174ad88be771b288e2db4ed3014aebb0b` | 0 | 0 |
| `maintenance/merged-branch-history-batch-05-20261013` | `3a01dec45e913d93e3b7808751cd4b81a78cefff` | 0 | 0 |

## Guarded deletion process

A deletion workflow is provided in `.github/workflows/reviewed-branch-cleanup.yml`. It defaults to preview and only deletes with an explicit `DELETE-BATCH-01` confirmation. The script rechecks exact commit SHA, permanent-archive ancestry, ancestry to `main`, and open PR heads immediately before deletion. GitHub branch protection and permissions are additionally enforced by GitHub. **Operator must separately confirm no live deployment or external automation relies on the branch name**; preserving commits does not preserve environment references.

No other names are authorized by this batch. Permanent refs `main` and `archive/legacy-project-material` are never eligible. Do not activate deletion until this PR is merged and the operator reviews this exact list.
