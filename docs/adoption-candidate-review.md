# Adoption candidate — comparison and release checklist

**Status:** Review package only. No update to `constitution_data.json`, generated adopted text, `main`, PDFs, or website.

## Candidate source

- Clean candidate: `docs/adoption-candidate-constitution.md`
- Approved working integration: `docs/constitution-integrated-working.md`
- Existing adopted generated reference: `docs/constitution-current.md`
- Approval and historical decisions: `docs/WORKING-CONSTITUTIONAL-AMENDMENTS.md`

## Structural comparison

- Candidate: 177 numbered sections across 20 Articles.
- Current adopted generated reference: 177 numbered sections across 20 Articles.
- Section text changed or introduced: 105.
- Unchanged section text: 72.
- New section identifiers: §3.9.a, §5.1.b, §12.2.a, §15.2.a.
- Removed section identifiers: §2.10, §7.11, §9.6, §14.3.
- Candidate section content matches integrated working draft: yes.

## Changed sections by Article

- Article 1: 5 changed — §1.7, §1.11, §1.12, §1.16, §1.17
- Article 2: 9 changed — §2.2, §2.5, §2.6.a, §2.9.a, §2.12, §2.14.b, §2.15, §2.16, §2.18
- Article 3: 8 changed — §3.2, §3.3, §3.4, §3.5, §3.9, §3.9.a, §3.10, §3.11
- Article 4: 4 changed — §4.1, §4.2, §4.3, §4.5
- Article 5: 2 changed — §5.1, §5.1.b
- Article 6: 3 changed — §6.2, §6.3, §6.3.a
- Article 7: 6 changed — §7.2, §7.2.a, §7.4, §7.10, §7.12, §7.14
- Article 8: 3 changed — §8.2, §8.3, §8.4
- Article 9: 14 changed — §9.1, §9.1.a, §9.1.b, §9.1.c, §9.1.d, §9.1.e, §9.4, §9.4.a, §9.5, §9.5.a, §9.7, §9.7.a, §9.8, §9.9
- Article 10: 0 changed — none
- Article 11: 1 changed — §11.1
- Article 12: 8 changed — §12.1, §12.1.a, §12.1.b, §12.2, §12.2.a, §12.3, §12.4, §12.6
- Article 13: 2 changed — §13.1, §13.2
- Article 14: 4 changed — §14.1, §14.2, §14.4, §14.5
- Article 15: 6 changed — §15.1.a, §15.2, §15.2.a, §15.3, §15.4, §15.5.a
- Article 16: 5 changed — §16.1, §16.2, §16.3, §16.4, §16.5
- Article 17: 2 changed — §17.1, §17.3
- Article 18: 5 changed — §18.1, §18.2, §18.3, §18.4, §18.5
- Article 19: 11 changed — §19.1, §19.2, §19.3, §19.3.a, §19.4, §19.5, §19.6, §19.7, §19.8, §19.9, §19.10
- Article 20: 7 changed — §20.1, §20.2, §20.3, §20.4, §20.5, §20.6, §20.7

## Release checklist (partially completed)

- [x] Extract a separate clean candidate without the working-draft notice.
- [x] Compare candidate section identifiers and text with the integrated draft.
- [x] Compare candidate sections against the currently generated adopted Markdown.
- [ ] Independent legal/policy review and explicit approval of the adoption package.
- [x] Stage a separate `docs/adoption-candidate-data.json` using the current `constitution_data.json` schema (20 articles, 177 provisions), without changing the canonical file. Verify candidate structure and normalized generated section text against clean Markdown.
- [x] Run the Python candidate conversion script and existing Markdown renderer on GitHub Actions. Both candidate-text equivalence and exact JSON regeneration diff passed in run `40047730284`.
- [ ] On a separately approved release branch, generate the adopted Markdown, website, PDF and annotated edition from canonical data.
- [ ] Diff all generated outputs against the approved candidate; verify publication and site links.
- [ ] Run repository tests and any release workflows; record results.
- [ ] Obtain explicit authorization before merging to the adopted Constitution and publishing.
- [ ] Prepare and verify rollback and restoration procedures for canonical data and deployment.

**Caution:** A changed section count is not a count of individual amendments. The historical register includes superseded proposals; use the latest approved integration as the candidate, not each historical proposal independently.

## Isolated conversion artifacts

- `scripts/prepare-adoption-candidate.py` converts the clean candidate and checks the generated provision text using the existing renderer.
- `docs/adoption-candidate-data.json` is the staged canonical-schema candidate, **not** the repository's operative `constitution_data.json`.
- Structural comparison of the staged JSON with the clean Markdown passed: 20 Articles, 177 sections and unique identifiers. A live repository test run and publication generation remain outstanding.

## GitHub Actions validation (2026-10-23)

- Workflow: `.github/workflows/adoption-candidate-validation.yml` on the working branch.
- Run: https://github.com/jcr0916-hue/federatedrepublic/actions/runs/40047730284
- Verified by job summary: checkouts completed; generator-equivalent text comparison passed; candidate Python conversion regenerated the staged JSON with a clean diff.
- Scope: isolated candidate only; no published outputs or canonical source writes. PDF, annotated edition, and website generation and comparison still need dedicated validation.

## Isolated output-validation findings (2026-10-23)

- Workflow: `.github/workflows/adoption-candidate-validation.yml` (candidate-only temporary directory).
- Candidate JSON conversion and renderer-equivalence checks **PASS**.
- `scripts/sync-annotated.py`, `scripts/build-search-index.py`, and `scripts/check-constitutional-site.py` **PASS** with candidate data: all 177 provisions and search anchors.
- Full website production validation **BLOCKED**: the world metadata validator and Eleventy collection both reject an obsolete constitutional provision reference `§2.10` associated with `torenthia-nrs-103.html`. This section is intentionally absent from the candidate. The blocker must be fixed in historical-world citation metadata after verifying the appropriate replacement reference or citation treatment; do not restore the deleted constitutional provision.
- Candidate PDF generation and accessibility checks **NOT EXECUTED** because the site-render step failed. Do not count them as passing.
- Runs: https://github.com/jcr0916-hue/federatedrepublic/actions/runs/40047884324 and https://github.com/jcr0916-hue/federatedrepublic/actions/runs/40047927659 .
- All testing was confined to the working branch and temporary CI files. The adopted Constitution and live website were not modified.

## Historical citation migration and website build (2026-10-23)

The candidate removes §2.10, while `torenthia-nrs-103.html` retained both a prose citation and `worldProvisions` metadata pointing to that identifier. Both references were corrected to §10.1, the NRS record framework, without changing the fictional reporting calendar or statutory reporting premise. This correction is committed on the working branch as `142eaf950f0d`.

Isolated GitHub Actions run https://github.com/jcr0916-hue/federatedrepublic/actions/runs/40048051458 passed candidate data, conversion, annotated content, search-index, and Eleventy website build. Candidate PDF generation and accessibility remained in progress at this checkpoint; record final results separately. No release or canonical-source changes were made.
