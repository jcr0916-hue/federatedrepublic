# Torenthia multimedia — civic institutions and cityscapes: source application review

**2026-11-22** · **Review type:** inventory-to-page matching, no changes to pages or canon · **Source census:** [all 98 image-format files](MULTIMEDIA-FULL-ASSET-CENSUS-20261122.md).

## Evidence and scope

GitHub's complete, non-truncated recursive main tree proves the named image files are stored in the repository. GitHub indexed text search for exact filenames returned zero results for the files below; review of the current Torenthia landing page, Record, Republic-at-a-Glance, fiscal dossier, and several State profiles found no direct references. **This makes them candidates for unused or underused assets, not proof that no runtime/dynamic or nonindexed consumer uses them.** No rendered pixels were available: binary GitHub reads are refused and direct public HTTP image retrieval in the working environment failed DNS. Consequently, aesthetics, depicted identity, chronology and actual image content remain **unverified**.

This audit is *not* a mandate to fill pages. Torenthia serves the constitutional project; media should clarify institutions, geography or events. The main constitutional site receives its own later review.

## Institutional image candidates: verify before proposing placement

| Existing repository file | Size from main Git tree | Current use evidence | Potential purpose | Placement caution / recommendation |
| --- | ---: | --- | --- | --- |
| `images/torenthia-assembly-chamber.png` | 2,313,161 bytes | No exact-filename code-search match | Spatial identity for the Federal Assembly | **HIGH PRIORITY REVIEW** for a Torenthia institutions guide *only if* such a page would benefit from a distinctive chamber image; do not place on unrelated State Assembly pages |
| `images/senate-chamber.png` | 2,158,380 bytes | No exact-filename code-search match | Federal Senate chamber | **HIGH PRIORITY REVIEW** alongside Assembly image; do not imply that historical sessions took place in a particular depicted room without canon |
| `images/council-of-ministers-meetingroom.png` | 1,895,111 bytes | No exact-filename code-search match | Executive coordination setting | **HOLD pending semantic validation:** a generic meeting-room scene may convey an institutional body inconsistent with constitutional authorities; verify what institution and term are established before use |
| `logos/supreme-court-logo.svg` | 15,515 bytes | No exact-filename code-search match | Judiciary source or branch identification | **CONDITIONAL** for a court-record context; do not imply the logo is an official court seal without verifying design/canon |
| `images/verentum-cIvic-campus.png` | 3,372,085 bytes | No exact-filename code-search match | **Terenne State capital civic district, per President** | **DO NOT USE AS VERENTUM.** Keep filename intact pending separately reviewed nonbreaking rename; `cIvic` contains uppercase `I`. Do not assume card derivative depicts same city |
| `images/verentum-street-level.png` | 2,329,042 bytes | No exact-filename code-search match | **Terenne street-level geography, per President** | **DO NOT USE AS VERENTUM.** Existing federal-capital imagery was recently changed and must remain untouched |
| `images/ostara-civic-plan.png` / `images/ostara-civic-proposal.png` / `images/ostara-civic-realized.png` | 2,340,767 / 3,169,545 / 2,996,550 bytes | No exact-filename code-search matches | Distinguish possible capital-site futures | **HOLD** until stories establish exactly which proposal, plan and realization actually happened; no photo should pre-announce a speculative civic building |

### Finding: institution imagery may be more useful grouped than scattered

Existing Torenthia landing, the Record and State-profile layouts already carry purposeful maps, flags and press-source logos. There is no separate image-rich general Federal Assembly/Senate guide evident in the specific pages inspected. A **small “Federal institutions in Torenthia” reader route** (not a new fictional event or constitutional explanation) could be a justified future use of chamber images, but only once the original artwork is visually checked and the intended terminology is compared with actual federal constitutional provisions. **Do not create this page or promise it is needed merely because the files exist.**

## Place images: candidate inventory matched to reader tasks

| Existing file | Size from Git tree | Source reference search | Possible use; decision |
| --- | ---: | --- | --- |
| `images/calden-cityscape.png` | 2,783,716 bytes | No indexed code match | **PRIORITY VISUAL REVIEW**: Caldenmere reporting and port-region geography; may not show the quay from news 143, so do not relabel it as the crane operator's actual location |
| `images/dorven-cityscape.png` | 2,609,620 bytes | No indexed code match | **REVIEW** for Orath geography; distinguish Dorven city from a specific cooperative/weighbridge site |
| `images/marisvia-cityscape.png` | 2,805,309 bytes | No indexed code match | **REVIEW** for international context, if the depicted city is established and needed |
| `images/valedon-cityscape.png` | 2,715,171 bytes | No indexed code match | **REVIEW** for Lake Varda diplomacy/country context only if geographic/event details are not conflated |
| `images/caldris-landscape.png` | 2,843,049 bytes | No indexed code match | **LOW**: might be useful for foreign geography but no immediate function established |
| `images/sunderland-shoreline.png` | 1,863,072 bytes | No indexed code match | **CONDITIONAL** humanitarian/foreign-state context; verify what place image actually represents |
| `images/lake-varda-incident.png` | 2,346,051 bytes | No indexed code match | **HOLD**: event-specific label raises risk of implying a depicted incident is an authenticated fictional record. Confirm precise chronology first |
| `images/riverglow.png`, `images/riverglow-alt.png`, `images/riverglow-3.png` | 2,490,757 / 2,820,493 / 2,967,676 bytes | No indexed code matches | **LOW/HOLD**: likely drafts/alternatives, but filenames cannot prove versions, meaning, or intended setting |

## Unused versus strategically preserved

A **master image not referenced by the current published website is not necessarily an error.** The repository deliberately keeps image masters while the deployment asset collector publishes referenced/required files only (see `docs/ASSET-DEPLOYMENT.md`). Some civic artwork may be prepared for future stories, some portraits may belong to reporters, and some proposal graphics are historical alternatives. Do not purge or auto-publish them.

## Specific next decisions

1. **Highest-value gallery for Presidential review:** actual *Assembly chamber*, *Senate chamber*, and *Council of Ministers meeting room* art, plus *Calden* and *Dorven* cityscapes. Need pixels or thumbnails, not more source words.
2. **No immediate page edit from this pass**: images exist, but placement needs visual and constitutional verification.
3. **Do not generate a new Calden harbor picture** until `calden-cityscape.png` and other source assets are actually viewed.
4. **For any reused master**: a 1.8–3.4 MB PNG is relatively heavy. Prefer a right-sized WebP derivative for thumbnails if necessary, keeping the master unchanged and validating asset deployment.
5. **No unnecessary uniformity rule**: realistic, graphic, editorial and informational visuals may differ, as long as each does a job.

## Validation trace

- Git tree result `truncated:false` with 98 images, from `main`. Byte values above come from Git blobs.
- Exact-filename indexed GitHub searches previously returned no matches for these candidates; metadata in `worldImage` and dynamic paths remain a possible blind spot.
- Read `torenthia.html`, `torenthia-record.html`, `republic-at-a-glance.html`, `dossier-fiscal-equalization.html`, `torenthia-state-selvane.html`, `torenthia-state-caldenmere.html`.
- Direct binary GitHub fetch returned “only accepts UTF-8 text”; direct HTTPS fetch of Assembly PNG failed name resolution. **No visual approval, build, preview or image file modifications.**
- **No merge, deploy, canon update or newsroom change.**
