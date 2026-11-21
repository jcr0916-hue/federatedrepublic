# Branch history — Lake Varda existing-image reuse

**Original branch:** `feature/torenthia-lake-varda-image-reuse`  
**PR:** pending draft PR (added after review)  
**Status:** PROPOSED; unmerged, unshipped, not deployed  
**Base:** `main`; independent of Torenthia media inventory PR #363 and Solara media-reuse PR #368.

## Purpose
Small, reversible trial of existing image reuse. The Constitution is the main project; the fictional Torenthia dossiers illustrate its real-world operation. The aim is to help readers situate the Lake Varda file without adding generic decorative imagery.

## Changed files
- `dossier-lake-varda.html`: inserts one responsive figure between dossier question and the record timeline. Reuses `lake-varda-crossing.png`, already displayed in the Torenthia landing visual tour and source-verified under `images/lake-varda-crossing.png`. Caption explicitly states the crossing is geographic context, *not* a depiction of a diplomatic decision, and points to the map.
- This permanent branch handoff.

## Verification — actually performed
- Read `AGENTS.md`, `dossier-lake-varda.html`, `torenthia.html`, `_includes/editorial.njk`, and `site.css` from GitHub `main` before editing.
- Confirmed source-level asset reference in Torenthia tour and same asset file path in previous media audit; no binary edited.
- Attempted to retrieve deployed image and page using web and a direct HTTPS client; both failed (web cache errors and container DNS resolution). **Image pixel quality, exact geography, rendered screenshot, dimensions, licensing/provenance, and mobile/desktop display are not verified.** Do not treat this as visually approved.
- **Tests not run:** `npm run build`, `npm run check:assets`, and `npm run world:publish-check` (no working checkout accessible). No false test results claimed.

## Decisions / rejections
- Reuse existing crossing artwork with explanatory caption and map link rather than generating a new or oil-painted image.
- Did not alter the Lake Varda situation, fictional events, file chronology, article metadata, layout template, global CSS, other dossiers, or newsroom automation.
- Did not treat existing source references as an assurance of visual fitness.

## Remaining review gates
1. Preview live binary in image viewer and compare exact geography against established fictional atlas. If inaccurate, reject this reuse.
2. Inspect mobile and desktop page, alt text, caption and reading order, file sizes and rights.
3. Run production build and asset/world validations.
4. Merge/deploy only following presidential approval; otherwise close or revise draft.

## Branch preservation and disposition
- The handoff is within this branch and should be preserved upon any authorized merge.
- Active PR branch must be retained; pending branch automation/deployment/protection dependency review is **not performed**.
- Follow `AGENTS.md` frozen-SHA and rolling branch lifecycle policy after merge. Neither content merge nor branch deletion has occurred.
