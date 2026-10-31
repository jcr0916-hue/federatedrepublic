# Branch cleanup — batch 02

**Proposed seven branches, no automatic deletion upon merge.** Each frozen branch tip was individually checked on 2026-10-14: zero commits ahead of `main` and zero ahead of `archive/legacy-project-material`; open PR head list was empty. Historical benchmark decisions are documented in `AI-EXPERIMENT-DECISIONS.md`. The active deployment/dependency check remains operator responsibility before deletion.

| Branch | Expected exact SHA | Ahead main | Ahead archive |
|---|---|---:|---:|
| `ai-cleanup-haiku-benchmark` | `44311017e4cf6b603476692ab64f7c4947924044` | 0 | 0 |
| `ai-crossroads-shadow-benchmark` | `56e278da875b85e26e9d3ae2ffd475882c41e35c` | 0 | 0 |
| `ai-gateway-all-live-features` | `992b089756e5775541bb09d6e0203da88062285c` | 0 | 0 |
| `ai-gateway-crossroads-poc` | `a8674d4bc80e7044c8624353903ca546d188f1de` | 0 | 0 |
| `ai-navigator-escalation-benchmark` | `0ac72122071c34de9ce5e80743df599e0a45cd2d` | 0 | 0 |
| `ai-navigator-haiku-answer-only-benchmark` | `8c0f2c142d836b8192eee079ec4850b39d12a7cd` | 0 | 0 |
| `ai-navigator-haiku-close-paraphrase` | `90551e1e928f23884159e07b247678bb419d9ebf` | 0 | 0 |

Run the reviewed cleanup workflow on `main` first in **preview**. After successful verification and explicit external-dependency clearance, rerun with **DELETE-BATCH-02**. The guarded script refuses SHA drift, unpreserved history, open PRs, archive changes and unexpected confirmation modes. Never delete the two permanent branches.
