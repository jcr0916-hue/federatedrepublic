# Branch history — Torenthia Solara existing-image reuse

**Original branch:** `feature/torenthia-solara-existing-image-reuse`  
**PR:** pending PR creation, draft  
**Head commit at handoff:** pending final edits; current content commit `bc9ade905a6786cd250460a64799583d3a67c6b9`  
**Status:** PROPOSED, unmerged, not deployed

## Purpose
Trial **one** image-reuse placement based on the review in [PR #363](https://github.com/jcr0916-hue/federatedrepublic/pull/363). Torenthia illustrates the Constitution; this is not a general website redesign, a canon update or a requirement for consistent visual styles.

## Changes and artifacts
- `territory-solara.html`: add a figure of Ostara using the **already referenced** public asset `ostara-card.webp`. The image appears in the Torenthia landing-page Faces & Places visual tour. Position next to introductory geography, provide descriptive alt text and a caption linking to `republic-at-a-glance.html#solara`. Uses native fluid sizing without inventing asset dimensions.
- This permanent branch note, filed in the same PR.

## Actual verification
- Inspected current `main` sources for `AGENTS.md`, `territory-solara.html`, `torenthia.html`, `_includes/editorial.njk`, `_includes/related-rail.njk`, `site.css`, and previous audit docs.
- Verified `ostara-card.webp` is referenced in the existing Torenthia visual tour; historical GitHub binary read returned UTF-8 decoding error at `images/ostara-card.webp`, consistent with a binary asset.
- **Not established:** actual image pixels, asset dimensions, visual appropriateness in Solara profile, accessibility audit, production build, mobile/desktop render. Attempts via public web fetch and container HTTP requests did not retrieve pixels because remote access failed. Do not claim visual approval.
- **Tests not run:** `npm run build`, `npm run check:assets`, `npm run world:publish-check` — no local checkout was available. A reviewer must run these before any merge.

## Decisions and lessons
- **PROPOSED** reuse instead of new image generation. One contextual image helps identify Ostara without requiring a picture on every Territory or news page.
- **REJECTED**: automatically applying to Lake Varda as well, manufacturing a new image or editing story text/canon; verify first.
- Preserve existing images and maps; do not change the public library merely for deployment optimization.

## Open follow-ups
1. Visually preview the exact Ostara image on Solara in mobile and desktop contexts; check caption, aspect ratio and crop.
2. Confirm rights/provenance for the existing asset, correct alt text and that the image is placed in a useful context.
3. Run build, asset and World validations, verify no duplicate/broken paths.
4. If approved, merge only with President authorization. No automatic deployment action.

## Preservation and branch disposition
- Original work is in this PR's feature branch. `main` is unchanged.
- **Dependencies:** main audit PR #363 remains open; this PR refers to its recommendations but is based on `main` for independent review.
- Branch deployment, automation and protected-ref checks: **not performed**. Retain branch while PR is open.
- After any authorized merge, retain the handoff in `main` and follow `AGENTS.md` branch lifecycle, frozen-tip SHA check and rotating three-branch buffer. Do not delete automatically.
