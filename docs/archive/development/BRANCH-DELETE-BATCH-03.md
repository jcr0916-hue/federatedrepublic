# Branch cleanup batch 03 — Navigator experiment branches

Six named benchmark branches; previously evaluated experiments and decisions are documented in [AI-EXPERIMENT-DECISIONS.md](AI-EXPERIMENT-DECISIONS.md). Each branch was rechecked with zero commits ahead of `main` and the permanent archive. No changes to active Navigator or prior benchmark conclusions.

| Branch | Frozen SHA |
|---|---|
| `ai-navigator-haiku-direct-benchmark` | `0bcee4254914b1aeffa11a1a2f73b76597efe15c` |
| `ai-navigator-haiku-single-source-benchmark` | `f06359ca0401679b07f8bdf5b4ebaae6525eb89c` |
| `ai-navigator-haiku-temperature-zero` | `1ba168416d55856dec79f5a57fc8369c550ed93b` |
| `ai-navigator-model-benchmark` | `f01d684a3dcc418276e4ccb49904cc7e9b1cc83f` |
| `ai-navigator-model-benchmark-verify` | `b4738f832aa880e13c326b540720ab9b1a745e4a` |
| `ai-record-navigator-benchmark` | `cc88d174b691b3c58a4b27dc1739bb1ae5fe4d33` |

Preview must succeed before choosing `DELETE-BATCH-03`. Explicitly verify there are no external deployment/automation references. Script requires matching SHAs, zero ahead of main and archive, no open PR and unchanged archive tip. The two permanent branches are excluded. Neither merge nor preview deletes branches.
