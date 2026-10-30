# Historical branch handoff — PR #247

**Original branch:** `chore/torenthia-canon-status-relocation-20261026`  
**PR:** [Docs: relocate Torenthia Story Bible and Story Status with runtime consumers](https://github.com/jcr0916-hue/federatedrepublic/pull/247)  
**Frozen original tip:** `e113a2b9382f383101660a95bfb956a1d624c5b2`  
**Status:** shipped; original history preserved for recovery.

## Purpose and shipped result

Docs: relocate Torenthia Story Bible and Story Status with runtime consumers. The PR merged on 2026-10-26T15:33:33Z as `197d1c4f8451aed934ad7c3d06291185c0148ad7`. This retrospective note records verified repository evidence.

## Significant files

- `PROJECT-SOURCES.md`
- `docs/README.md`
- `docs/operations/REPUBLIC-INGEST.md`
- `docs/torenthia/PUBLISHING.md`
- `docs/torenthia/README.md`
- `docs/torenthia/STORY-BIBLE.md`
- `docs/torenthia/STORY-STATUS.md`
- `docs/world/visual-identity/KELVANT-FLAG.md`
- `lib/republic-ingest.mjs`
- `lib/world-context-packet.mjs`
- `lib/world-draft-validation.mjs`
- `scripts/check-world-publishing.mjs`
- `scripts/place-downloads.sh`
- `scripts/republic-ingest.test.mjs`
- `scripts/world-status.mjs`

## Tests, decisions, and lessons

Historical individual test outcomes and rejected experiments are **not established by this handoff**; consult the linked PR and preserved commits. Current publishing and cleanup validation is recorded in the [October 30 cleanup review](../BRANCH-CLEANUP-REVIEW-20261030.md). Reuse the shipped implementation on `main`; old intermediate source is retained for historical investigation, not adopted as current content.

## Preservation and disposition

The history-only commit `0bb710a2966b119c42552fd7b7061063a9ebf33d` preserves original commit objects and file trees, including intermediate experiments, without replacing the current source tree. It must reach `main` through a merge commit before deletion. The branch has no open PR at the audit checkpoint; workflow and hosting dependency checks are in the cleanup review. It enters the three-newest-completed rotation and may be SHA-leased away only after fresh gates pass. Unresolved work outside the merged PR is **not established**.
