# Branch history — Torenthia State city image reuse

**Original branch:** `feature/torenthia-state-city-image-reuse-20261124`  
**PR:** draft, to be linked after creation  
**Status:** PROPOSED, unmerged, not deployed  
**Based on:** `main` 2026-11-24; independent of draft multimedia inventory PR #363 and drafts #368/#369.

## Purpose and direction

The Constitution is the primary project. Torenthia serves it, with its own multimedia identity. This branch makes three modest, purposeful uses of **existing source images** on State profiles: identify the place described, not illustrate every article or add decorative generic images. The President confirmed that two legacy filenames beginning `verentum-` are now to depict **Terenne**, the Aldenmere State capital. Recently established **Verentum federal capital** imagery must not be overwritten or conflated.

## Changes and files

- `torenthia-state-aldenmere.html`: inline figure for `verentum-street-level.png`, explicitly identified in alt/caption as **Terenne**, the coastal State capital. Keep its legacy asset filename unchanged until a separate approved rename; no changes to Verentum.
- `torenthia-state-caldenmere.html`: existing `calden-cityscape.png` view next to the port city introduction, avoiding claims that the artwork shows a specific incident.
- `torenthia-state-orath.html`: existing `dorven-cityscape.png` next to Dorven's local/economic identity, avoiding claims that artwork shows the co-op weighbridge.
- This permanent branch handoff. No new images or changes to shared templates, global CSS or institutional canon.

## What was verified

- Read `AGENTS.md`, three State page source files, `_includes/state-profile.njk`, and `docs/ASSET-DEPLOYMENT.md` from GitHub `main`.
- GitHub main recursive tree reports `truncated:false` and confirms all three existing image binary paths, with sizes 2,329,042; 2,783,716; and 2,609,620 bytes respectively.
- Existing pages present a purpose for each: Aldenmere distinguishes Terenne/Verentum, Caldenmere presents Calden's port/finance identity, and Orath connects Dorven to agricultural co-operative and reporting life.
- Source edits use root-relative-on-current-page image filenames consistent with repository collector mapping of `images/example.png` to public `/example.png`.
- **Not verified:** visual pixels/accuracy, asset licensing, mobile/desktop rendered screens, accessible alt and caption in browser, build and asset checks. Available connector disallows binary image inspection. All three full-resolution PNGs are >2MB; optimize as a later performance improvement if the placement is approved.

## Explicit rejected or deferred approaches

- Do **not** reuse either Terenne image to represent the federal city Verentum. Preserve the newly approved Verentum character and distinct federal district.
- Do **not** rename legacy `verentum-street-level.png` or `verentum-cIvic-campus.png` within this PR; renaming should be an independent, usage-checked change.
- Do not add Terenne's separate civic-campus image to the same State profile yet; would add >3MB without showing a second specific need.
- Do not alter `torenthia.html`, constitutional source, published World records, flags, maps or newsroom systems.

## Next gates and preservation

- Inspect branch diff and actual pictures, especially Terenne identification.
- Run `npm run build`, `npm run check:assets`, `npm run world:publish-check`. No local checkout available in this task; **not run**, do not claim passed.
- Review image-performance trade-off; optimize derivatives without deleting masters if justified.
- Obtain Presidential authorization before any merge/deployment.
- Retain branch while its PR is open. After authorized merge, preserve this note on main, perform frozen-tip, dependency and history checks under `AGENTS.md`; no branch deletion approved or performed. Deployment/automation dependencies **not yet checked**.
