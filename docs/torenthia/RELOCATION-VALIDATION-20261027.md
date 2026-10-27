# Torenthia record relocation — completion evidence

Completed 2026-10-27 on `main` at record merge `dc60c74d9e8d0dfae3746c998a3196bb0eaa50ba`. All **256** published record sources are categorized; no record source remains at root.

## Scope and totals

- `torenthia/nrs/`: 124 records.
- `torenthia/news/`: 126 records.
- `torenthia/court/`: 2 Supreme Court records.
- `torenthia/dispatches/`: 4 dispatches.

The continuation beginning with open PR #253 completed 246 records. PRs #251 and #252 had already completed 10. Subsequent source-only batches were 40, 40, 40, 40, 40, and 38 records. Root public URLs, filenames (including unpadded NRS 96–99), metadata, narrative chronology, links, archives, documentation, and source bytes are preserved.

## Merged batches

- [PR #251](https://github.com/jcr0916-hue/federatedrepublic/pull/251): 3 records; final head `e0168036f9c4481465072c140fbc36a99ddbf4f3`; merge `299d3318df8cd53f9360e5056227c44a115f4787`.
- [PR #252](https://github.com/jcr0916-hue/federatedrepublic/pull/252): 7 records; final head `65c24148a69c417450411ec3012ba663f768980b`; merge `f9f2389accc64c37fe0a6da41c08fbff6097265e`.
- [PR #253](https://github.com/jcr0916-hue/federatedrepublic/pull/253): 8 records; final head `4dea14564290a6f274e2f18819ee314087f44230`; merge `7afff123c63dee3aafd337fd8d451387aba172c5`.
- [PR #254](https://github.com/jcr0916-hue/federatedrepublic/pull/254): 40 records; final head `43f06821ba3582969352b54be03644228189eeab`; merge `083a0c02eedd0a0e2ad7ae8c87db4bd774772a33`.
- [PR #255](https://github.com/jcr0916-hue/federatedrepublic/pull/255): 40 records; final head `eb07e0e54f6a79a2bab7a05f56e6455cf25f1cc1`; merge `6cecc2915905b9c82d300d73b7edfc97c14829fb`.
- [PR #256](https://github.com/jcr0916-hue/federatedrepublic/pull/256): 40 records; final head `4ec579f335e786bf28e0ecba60542683c2e67ea0`; merge `cda006583b7f606a40e3ed8f26ab91e463f72ba7`.
- [PR #257](https://github.com/jcr0916-hue/federatedrepublic/pull/257): 40 records; final head `4413658bb5899cd2a16aa12f9157d34473bca9c6`; merge `fc88f344a13b765acf0b95790081dde076812dfe`.
- [PR #258](https://github.com/jcr0916-hue/federatedrepublic/pull/258): 40 records; final head `1b0c584cf0fed49f9cc65c2f5a687edd83b66006`; merge `342ba20a76d9db29778185c932d42cf453dd542f`.
- [PR #259](https://github.com/jcr0916-hue/federatedrepublic/pull/259): 38 records; final head `250870b920d9adad8764c558a5afe3a2f3f6ada9`; merge `dc60c74d9e8d0dfae3746c998a3196bb0eaa50ba`.

For every listed final head, GitHub reports **World publishing check: success**, **Constitution archival check: success**, and **Vercel: success**. The recovery-only Constitution job is intentionally skipped on pull requests; the archival validation job passes. Heads were checked immediately before merges for PRs #253–#259. Final #251/#252 outcomes were also rechecked during the completion audit. No unresolved review threads or substantive PR comments were present on the continuation PRs at review time.

## Preservation proof

[The machine-readable manifest](RECORD-RELOCATION-MANIFEST-20261027.json) maps every original public filename to its categorized source path, original Git blob ID, and SHA-256 digest, and records PR heads, merges and production evidence.

- All 256 source blobs match pre-pilot baseline `79c3429942cb69c3616efbd647da5e2906b30556`. This includes every byte of front matter and narrative content.
- All 470 generated public files have the same paths and bytes as the built merged-PR-#253 baseline `7afff123c63dee3aafd337fd8d451387aba172c5`. This covers historical record routes, feeds, search/navigation data, archive chronology, related links, and Constitution output.
- All 336 protected files match the same continuation baseline: canonical Constitution JSON/Markdown, generated federal reference sources, historical constitutional pairs, and State Constitution sources.
- The full `npm run world:publish-check` passed locally on PR #253 and each subsequent record batch. It includes the build, Constitution archival, ingestion, authoring packets, metadata, chronology, discovery/link checks, and constitutional reference checks. No workflow gate was weakened.
- GitHub file diffs identify all HTML relocations as 100% identical renames. All record identities remain unique.

## Production verification

Deployment `dpl_4adPmz5n4ZaoYW9EM28BmoCwMAYX` is READY for record merge `dc60c74d9e8d0dfae3746c998a3196bb0eaa50ba` on the production project `federatedrepublic` in team `the-federated-republic`.

At `https://thefederatedrepublic.org`, all **256 original record URLs** plus `index.html`, `torenthia.html`, `torenthia-record.html`, and `constitution-print.html` returned **HTTP 200** and content byte-identical to the validated local output baseline. Each earlier continuation merge also received production readiness and moved-record/content checks before the next PR proceeded.

Inventory-based authoring still discovers all 256 records and chooses `torenthia-nrs-125.html`, `torenthia-news-127.html`, and `torenthia-sc-003.html`; next narrative sequence is 174. No live AI generation request was needed for this migration.

## Root-path lessons and repairs

- PR #253 reused `readWorldInventory`'s `sourcePath` for packet excerpts; public basename alone does not locate a categorized source file.
- PR #254 repaired metadata audits that silently omitted moved sources, constitutional reference checks that scanned only root pages, and homepage-link resolution that handled numeric records but omitted dispatches.
- Regression tests retain metadata warnings in every categorized stream, reject invalid federal provisions/anchors, reject missing dispatch sources, and enforce frozen snapshot hashes after resolving historical record paths. The dated audit register itself is preserved.
- Preserve actual inventory filenames. NRS 96–99 were historically unpadded; do not normalize those names or public URLs.
- Every continuation branch has a permanent handoff under `docs/archive/development/branches/`. The missing PR #251 note was reconstructed explicitly as a retrospective; final check evidence for #251/#252 was recovered without inventing original experiments.

## Retention and remaining work

No record relocation remains. All migration branches and original records are retained. The permanent cold-storage branch `archive/legacy-project-material` remains at `0053ac4da09d32807d7f5b71ef0fff2075b421c1`; no archival content or canonical Constitution was modified. Do not merge cold storage back into `main`.

Stage 4 cold-storage removals and branch cleanup are separate work requiring provenance/manifest review and appropriate authorization. This completion report grants no deletion approval. Historical records and constitutional pairs remain on `main`.
