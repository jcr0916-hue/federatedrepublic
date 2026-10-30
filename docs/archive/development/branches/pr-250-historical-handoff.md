# Historical branch handoff — PR #250

**Original branch:** `chore/torenthia-world-authoring-paths-20261026`  
**PR:** [World: route newly authored and ingested Torenthia records into source folders](https://github.com/jcr0916-hue/federatedrepublic/pull/250)  
**Frozen original tip:** `201c53452013d2be12bfb1fc30158be490ee032b`  
**Status:** shipped; original history preserved for recovery.

## Purpose and shipped result

World: route newly authored and ingested Torenthia records into source folders. The PR merged on 2026-10-26T23:19:55Z as `79c3429942cb69c3616efbd647da5e2906b30556`. This retrospective note records verified repository evidence.

## Significant files

- `docs/torenthia/README.md`
- `lib/republic-ingest.mjs`
- `scripts/new-world.mjs`
- `scripts/republic-ingest.test.mjs`

## Tests, decisions, and lessons

Historical individual test outcomes and rejected experiments are **not established by this handoff**; consult the linked PR and preserved commits. Current publishing and cleanup validation is recorded in the [October 30 cleanup review](../BRANCH-CLEANUP-REVIEW-20261030.md). Reuse the shipped implementation on `main`; old intermediate source is retained for historical investigation, not adopted as current content.

## Preservation and disposition

The history-only commit `0bb710a2966b119c42552fd7b7061063a9ebf33d` preserves original commit objects and file trees, including intermediate experiments, without replacing the current source tree. It must reach `main` through a merge commit before deletion. The branch has no open PR at the audit checkpoint; workflow and hosting dependency checks are in the cleanup review. It enters the three-newest-completed rotation and may be SHA-leased away only after fresh gates pass. Unresolved work outside the merged PR is **not established**.
