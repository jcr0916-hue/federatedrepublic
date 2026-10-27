# Torenthia repository organization — staged migration plan

**Status:** staged; no source moves or archival deletions authorized by this document alone.

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
