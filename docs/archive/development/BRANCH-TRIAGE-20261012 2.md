# Branch ancestry triage — 2026-10-12

These findings compare each no-PR working branch against `main`; **ahead** is unique reachable commit count, not proof that the changes are absent from `main` after a squash merge. No deletions are authorized.

| Branch | Git comparison | Unique commits ahead of main | Preliminary disposition |
|---|---|---:|---|
| `archive/legacy-project-material` | Retained historical storage | Not assessed for deletion | **Keep** |
| `benchmark-navigator-sonnet5` | Diverged | 6 | Review benchmark artifacts and outcomes before any deletion |
| `constitutional-subsidiarity-transition` | Diverged | 8 | Review constitutional changes and whether later implementation superseded them |
| `publishing-safety-and-papers` | Diverged | 12 | Review design-paper tooling and safety workflows; potential valuable unique work |
| `torenthia-publish-2026-10-09` | Fully behind | 0 | Candidate for preservation-report review, then deletion |
| `weekend-infrastructure` | Fully behind | 0 | Candidate for preservation-report review, then deletion |
| `world-record-generator` | Fully behind | 0 | Candidate for preservation-report review, then deletion |

## Specific divergent files

- `benchmark-navigator-sonnet5`: `api/navigator-benchmark.js` (added), `api/navigator.js`, `vercel.json`.
- `constitutional-subsidiarity-transition`: `constitution_data.json`, `docs/constitution-current.md`, `annotated.html`, `docs/constitutional-quickref.md`, and supporting pages. **Do not merge historical constitutional changes blindly into current law**.
- `publishing-safety-and-papers`: `docs/DESIGN-PAPERS.md`, `lib/design-papers.mjs`, `papers.html`, `scripts/design-papers.test.mjs`, `scripts/new-design-paper.mjs` and world publishing components. Compare against current code before deciding whether work is obsolete or missing.

## Unresolved safeguards

The initial inventory includes 116 branches associated with historically merged PRs. They are **not yet verified for deletion**: individual branches may contain post-merge commits, artifacts or intermediate history that is not represented in their merged PR. Review before creating the deletion manifest.

The existing Constitution snapshot policy begins at a fixed October 12 baseline; recovering earlier September–October source pairs is a distinct historical reconstruction operation. Do not replace current constitutional authority during recovery.
