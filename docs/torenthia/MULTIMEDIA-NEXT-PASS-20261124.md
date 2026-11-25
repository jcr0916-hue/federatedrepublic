# Torenthia multimedia — next review pass (24 November 2026)

**Status:** Editorial/technical media audit only. No images, public pages, constitutional canon or World records changed by this note. Companion to the 98-image repository census and PRs #368, #369, #390.

## Decisions already established by the President

- Verentum is a deliberately **modern purpose-built federal capital** and a functioning city that developed around its capital district, not an inherited old urban core.
- A new image portraying **the broader modern Verentum city around the capital district** was generated and approved in conversation. **Important asset gap: it has NOT been committed to the repository**, and its publishing path/derivative is not established. Avoid claiming this latest approved view is already on the live site.
- Existing government Assembly, Senate and council-of-ministers interiors are **on hold for replacement**, ideally a coordinated Verentum architectural family. Do not reuse them now.
- Existing `images/verentum-street-level.png` and `images/verentum-cIvic-campus.png` are instead **Terenne, Aldenmere's State capital**, despite legacy filenames. Do not confuse them with Verentum or overwrite recently updated federal-capital imagery.
- Calden, Dorven and other approved city-image reuse remain in proposal/draft PR #390, with actual pixel and runtime review pending.

## Evidence checked in this pass

- `atlas.html` already shows a world map, with HTML nation entries sourced from `_data/atlas.js`. The entries for **Marisvia**, **Valedon** and **Caldris** are text-first and no inline city/landscape images are defined for them.
- Existing image masters: `images/marisvia-cityscape.png`, `images/valedon-cityscape.png`, `images/caldris-landscape.png` (verified in earlier complete Git tree). These are **credible place-identification candidates** for an Atlas subsection, more appropriate than generic illustration in NRS records. Before implementing, inspect pixels, fit, actual city identity, alt/captions, responsiveness and image size (each around 2.6–2.8 MiB).
- `torenthia/news/torenthia-news-143.html` is a Calden waterfront worker/candidate story with no image; `calden-cityscape.png` identifies Calden but **does not establish an actual photograph of the crane operator or campaign event**. Resist adding it as if it showed the specific reported moment.
- `torenthia/news/torenthia-news-086.html` is an editor's narrative about a co-operative weighbridge in Dorven; `dorven-cityscape.png` **does not show that scale**. Better use cityscape on the State profile than illustrative news evidence.
- Additional potential portrait masters: `images/Corwin-Hale.png` and `images/Lenne-Akar.png` depict established journalists/editors, while `images/Pell-Sandris.png` depicts a Legat Consul candidate. Published stories `news-086` (Corwin Hale), `news-143` (Lenne Akar) and `news-016` (Pell Sandris) establish their narrative roles, but **do not establish the pixels**. Do not blindly add a journalist's image to a news event; consider press identity or profiles only where a reader benefits from knowing the person.
- Existing inline portraits of Carrow, Mak, Vael, Thoss already identify regular figures. Prioritize continuity, not new portraits for every mention.

## Ranked next review candidates

| Priority | Item | Proposed responsible placement | Condition |
| --- | --- | --- | --- |
| 1 | Approved new **Verentum broader-city image** | Torenthia capital context / gallery, paired with existing **capital district** image | Original image must be imported from conversation-generated file into repository on a reviewed branch; no duplicate, no overwrite, derivative and accessibility review |
| 2 | Marisvia / Valedon / Caldris existing place images | **Atlas** nation section (rather than State pages), where neighboring countries are described | Review image pixels and optimize before linking; must not imply specific foreign events |
| 3 | Calden / Dorven / Terenne existing place images | Respective State profiles, already **draft PR #390** | Source presence checked; verify rendering/asset weight and Terenne reclassification |
| 4 | Pell Sandris established portrait | Specific character profile or a relevant biographical/political feature | Confirm image identity and editorial function; no generalized campaign event staging |
| 5 | Journalist portraits (Corwin Hale, Lenne Akar) | Press identity/editorial profile if one is actually useful | Avoid repetitive portraits in bylined news |
| Hold | Government interiors / judiciary architectural graphics | Future coordinated modernization | Explicitly deferred by President |
| Hold | Ostara civic **plan/proposal/realized** group | Dedicated illustrated chronology only | Do not claim proposals were built; needs canon provenance |
| Hold | Lake Varda **incident** depiction | Specific verified event only | Filename alone is not proof of event or accurate scene |

## Implementation and verification cautions

- All relevant large PNGs exceed 1 MiB, often 2–3 MiB, so make optimized display derivatives rather than directly adding multiple full-size masters to the Atlas. Keep originals in source library.
- `docs/ASSET-DEPLOYMENT.md`: source `images/x.png` maps to public `/x.png`, and only public asset references are selected for `_site`.
- Technical verification not done here: image pixels, licensing/provenance, screenshots, Eleventy production build or asset validation. GitHub source review alone must not be described as a visual review or successful publication.
- Branch-first and President-controlled merge. Do not alter main site, Compacts, or unrelated canonical work in this media pass.
