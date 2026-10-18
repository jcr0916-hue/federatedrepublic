# Reviewed branch cleanup — batch 07 (2026-10-14)

Ten branch heads proposed for retirement. Each tip has **zero commits ahead of main** as individually checked before this PR. Preservation requires retaining the historical reports and original commits, not rerunning tests. Current merged work on main includes the resulting Navigator benchmark removals, archival workflow, Torenthia publishing checks, Preamble removal, and the World publication guard. This is branch-name cleanup, not feature removal.

| Exact ref | Frozen SHA | Ahead main |
|---|---|---:|
| `maintenance/branch-cleanup-batch-06-20261014` | `80674848b2fa81d638ef46191bf22b2921ad61d4` | 0 |
| `remove-navigator-model-benchmark-final` | `fb9c3f26b91c40b3ef8cf0407e084f967252938c` | 0 |
| `remove-temporary-navigator-benchmark` | `48abadfffe9d4d24b3af2c74052730964226d27f` | 0 |
| `retire-korda-crossroads-feature-2026-10-10` | `42393697d0a2d81256fded9dd69316f49b06b48d` | 0 |
| `world-publishing-guards` | `208100e32f1eda37694b51f501b18f94aab43d96` | 0 |
| `constitution-automatic-archival` | `a77701b5fba19de9f5035f946e9c4c2f544c6d15` | 0 |
| `project/remove-preamble-torenthia-y14m1` | `79a204073035e1ca22a54c61bf2ea00c270c8a7d` | 0 |
| `review-intent-decisions-2026-10-11` | `5828a04c7941315f47c603894ebe98548b5d453d` | 0 |
| `world-y14m01-opening-2026-10-12` | `bd564b88295c029eca4d1b4f97e42e01ea4b9dff` | 0 |
| `typingmind-kb-tags` | `49f6ef4e0f61d9b6c8a2aa9867c6f7ab67d76ca9` | 0 |

The cleanup script checks the exact SHAs, open PRs, and reachability from either permanent branch. Merging this PR does **not** delete any branch. Before running `DELETE-BATCH-07`, use `preview` and confirm no workflow, preview deployment, or automation still depends on these branch names. Do not delete either permanent branch. Branches with unique, unreviewed experimental results are deliberately excluded.
