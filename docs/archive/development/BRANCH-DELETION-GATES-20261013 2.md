# Branch cleanup — preservation gate and preliminary deletion manifest

**Inventory date:** 2026-10-13. This is an audit and proposed disposition, **not** authorization or execution of deletion.

## Protected refs

Never delete `main` or `archive/legacy-project-material`. Retain all branches containing commits not reachable from `main` until complete byte-level preservation of needed historical work has been verified. Do not assume PR links and Markdown notes preserve unreachable commit objects after ref deletion.

## Branch-only history: HOLD

- [`benchmark-navigator-sonnet5`](review-benchmark-navigator-sonnet5-20261013.md) — 6 commits ahead, 390 behind
- [`constitutional-subsidiarity-transition`](review-constitutional-subsidiarity-transition-20261013.md) — 8 commits ahead, 389 behind
- [`publishing-safety-and-papers`](review-publishing-safety-and-papers-20261013.md) — 12 commits ahead, 629 behind

These branches collectively contain **26 branch-only commits**. They must remain intact pending exact file/patch snapshots, comparison to current implementations and a recorded decision about adoption or retirement. Do not silently revive obsolete constitutional JSON or temporary API routes.

## Fully behind main: preliminary low-risk candidates

- [`auto-world-dossiers`](review-auto-world-dossiers-20261013.md) — fully reachable from main; operational/deployment review still needed
- [`torenthia-publish-2026-10-09`](review-torenthia-publish-2026-10-09-20261013.md) — fully reachable from main; operational/deployment review still needed
- [`weekend-infrastructure`](review-weekend-infrastructure-20261013.md) — fully reachable from main; operational/deployment review still needed
- [`world-record-generator`](review-world-record-generator-20261013.md) — fully reachable from main; operational/deployment review still needed

## 127 merged PR branch histories

Five historical batches under `docs/archive/development/MERGED-PR-BATCH-01.md` through `05.md` provide 127 reports. **That does not certify deletion safety** for squash-merged branches: preserve orphan intermediate history, especially tests and benchmark artifacts, before releasing refs.

## Required deletion gates

1. Freeze and inventory branch-tip SHA, merge history, unique commit chain, and relevant output artifacts.
2. Check the diff and intended state against current `main` without overwriting current constitutional sources.
3. Preserve any unique content and relevant intermediate history under a durable retained ref or exact-byte archive.
4. Confirm no preview deployment, workflow, PR or external link requires the ref.
5. Recompare each candidate to current `main`; require explicit approved exact-name deletion manifest.
6. Only after approval delete refs in small batches and verify `main` and archive storage still exist.

**Current deletion authorization: none. No refs are deleted by this report.**
