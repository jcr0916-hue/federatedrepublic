# Torenthia repository organization — staged migration plan

**Status:** Stage 3 in progress under explicit migration authorization. Record sources are relocated in validated batches; no archival deletion is authorized by this plan.

## Preservation invariants

1. `main` remains the only current source of authority. Keep published Torenthia records, constitutionally relevant history, operational docs, and required fixtures on `main`.
2. Cold-storage branch: `archive/legacy-project-material`. Verify a file's bytes, provenance and manifest entry on that branch **before** removing it from `main`; do not merge the archive back.
3. Do not relocate `docs/archive/constitution/` historical JSON/Markdown pairs: constitutional archival policy explicitly requires them on `main`.
4. Preserve public URLs for every existing Torenthia record; never silently change `worldId`, `worldSeq`, `nrsSeq`, `nrsId`, or related-record targets.
5. Never create two independent editable copies of the Story Bible or Story Status. Move them atomically with all consumers, or leave them at existing paths.

## Stage 1 — discover and document dependencies

Inventory `docs/` and published root-level `torenthia-*.html` sources. Classify each as active, generated, historical-but-required, obsolete-and-archived, or unknown. Treat unknown as retain. Search both literal references and runtime path construction.

Known references to update when the four active World docs are moved:
- `PROJECT-SOURCES.md`, `docs/README.md`, `docs/WORLD-PUBLISHING.md`
- `scripts/world-status.mjs`, `scripts/check-world-publishing.mjs`, `scripts/place-downloads.sh`
- `lib/world-context-packet.mjs`, `lib/republic-ingest.mjs`, `scripts/republic-ingest.test.mjs`
- `_data/atlas.js`, `_data/stats.js`, `eleventy.config.mjs`
- Other internal Markdown references and operation guides found by a full repository search.

## Stage 2 — active documentation

Move the active Story Bible, Story Status, Storylines, and Publishing workflow to `docs/torenthia/`. Update every script, test, README, import mapping, and relative link in the **same** PR. Re-run all relevant tests and check source-packet output. Avoid stubs that introduce competing authority.

## Stage 3 — published record sources

Use source directories `torenthia/nrs/`, `torenthia/news/`, `torenthia/court/`, and `torenthia/dispatches/` only after auditing the inventory and routing. Add explicit permalink or output-path compatibility so old public URLs remain byte-for-byte stable. Verify Eleventy collections, the World authoring generator, metadata validators, related links, archives, site search, feeds, and generated output. Migrate in bounded batches with no metadata changes.

## Stage 4 — cold storage

Compare candidate obsolete files with the existing archive branch and its preservation manifest. Copy missing originals to the archive branch with provenance and hashes before removing from `main` in a separate PR. Do not archive merely because a document is old; operational references and audit history may still depend on it.

## Release gates

For each migration PR: review diff and file counts; run `npm run world:publish-check`, build and relevant tests; check public URL preservation; await GitHub and Vercel checks; merge only when green. Verify production after merge. Roll back via the migration commit if unexpected URL or content regressions appear.

## Stage 3 routing prerequisite (implemented independently)

Eleventy now recognizes source stems under `torenthia/nrs/`, `torenthia/news/`, `torenthia/court/`, and `torenthia/dispatches/` and publishes those documents at their historical root `torenthia-*.html` URLs. Existing root-level files retain the original permalink behavior. **This routing rule alone does not authorize moving records.** Runtime inventory, ingestion, authoring, cross-record links, and validators still assume root-level source files and must be migrated and tested before any record relocation.


### Stage 3 first controlled record batch

The first pilot relocation moves three published HTML sources, without changing their contents or public URLs:

- `torenthia-nrs-124.html` → `torenthia/nrs/torenthia-nrs-124.html`
- `torenthia-news-001.html` → `torenthia/news/torenthia-news-001.html`
- `torenthia-sc-001.html` → `torenthia/court/torenthia-sc-001.html`

The existing `worldId`, sequences, related-record links and root-level public permalinks remain unchanged. Remaining root-level records are intentionally untouched. Verify World publishing checks, Eleventy/Vercel output, and Constitution archival before merging. Subsequent batches should proceed only after this pilot is validated.


### Stage 3 second controlled record batch

Following the validated three-record pilot, batch 2 relocates seven more unchanged HTML source records: NRS 121–123 to `torenthia/nrs/`, news 002–004 to `torenthia/news/`, and Supreme Court 002 to `torenthia/court/`. The existing root-level public URLs, metadata, and cross-record links are preserved. This is a source-only relocation; no narrative content is revised. Require passing World publishing, Constitution archival, and Vercel checks before merging.


### Stage 3 third controlled record batch

Batch 3 relocates eight unchanged published sources: NRS 117–120 to `torenthia/nrs/` and news 005–008 to `torenthia/news/`. Historical root-level public URLs and record metadata are preserved. The shared World inventory, discovery checks, and consistency checks were prepared in prior batches. Merge only after World publishing, Constitution archival, and Vercel validation.


### Stage 3 fourth controlled record batch

After merging [PR #253](https://github.com/jcr0916-hue/federatedrepublic/pull/253) on head `4dea14564290a6f274e2f18819ee314087f44230`, 18 of 256 records were categorized. World publishing, Constitution archival, and Vercel passed on that head; the full local publishing gate also passed. The production merge `7afff123c63dee3aafd337fd8d451387aba172c5` deployed READY.

Batch 4 relocates **40 unchanged sources**: NRS 101–116, news 009–028, and all four dispatches (Ottoline Pree, Sarn, Sollis, Vann). Totals after this batch: **58 categorized; 198 remaining at root** (100 NRS, 98 news). Both court records were already migrated.

The dependency audit found and repaired three remaining source-path assumptions, without weakening their checks:

- Metadata advice now uses `worldSourceFiles` so categorized records remain in its audit.
- Live constitutional reference checks scan all four categorized directories. Dated snapshot checks resolve historical record paths while preserving the original audit register and hash requirements.
- Homepage editorial links accept categorized dispatch sources while continuing to reject missing records.

Regression tests cover all four streams, invalid federal provisions/anchors, snapshot-byte drift, metadata warnings, and missing dispatches. The full `npm run world:publish-check` passed. All **256 source records, 470 generated public files, and 336 protected Constitution/archival/State-source files** match the pre-batch baseline byte-for-byte. Require World publishing, Constitution archival, and Vercel success on the final PR head before merge; verify production afterward. Keep all branches and archival records.


### Stage 3 controlled record batch 5

After [PR #254](https://github.com/jcr0916-hue/federatedrepublic/pull/254) passed all required checks, merged as `083a0c02eedd0a0e2ad7ae8c87db4bd774772a33`, and was verified in production, batch 5 relocates **40 unchanged sources**: NRS 081–100 and news 029–048. Reuse the categorized inventory, stable root permalink rule, and path-aware checks from batch 4. Total after this batch: **98/256 categorized; 158 at root**.

The full `npm run world:publish-check` passed locally, including build, archival, chronology, authoring, ingestion, discovery, and constitutional references. All 256 source records, 470 public output files, and 336 protected Constitution/archive/State files remain byte-identical to the pre-batch baseline; all source blobs also match the pre-pilot PR #251 base. Require World publishing, Constitution archival, and Vercel success on this PR head and post-merge production verification. Keep all records and branches.

### Filename preservation lesson

NRS 96–99 are historically named `torenthia-nrs-96.html` through `torenthia-nrs-99.html`, without zero padding. Select actual inventory filenames when batching; retain their exact names and URLs. A preliminary local preparation stopped on the absent padded spelling before publishing any branch changes, then resumed with the real filenames and reran the full gate. Do not normalize these names.


### Stage 3 controlled record batch 6

After [PR #255](https://github.com/jcr0916-hue/federatedrepublic/pull/255) passed all required checks, merged as `6cecc2915905b9c82d300d73b7edfc97c14829fb`, and was verified in production, batch 6 relocates **40 unchanged sources**: NRS 061–080 and news 049–068. Reuse the categorized inventory, stable root permalink rule, and path-aware checks from batch 4. Total after this batch: **138/256 categorized; 118 at root**.

The full `npm run world:publish-check` passed locally, including build, archival, chronology, authoring, ingestion, discovery, and constitutional references. All 256 source records, 470 public output files, and 336 protected Constitution/archive/State files remain byte-identical to the pre-batch baseline; all source blobs also match the pre-pilot PR #251 base. Require World publishing, Constitution archival, and Vercel success on this PR head and post-merge production verification. Keep all records and branches.
