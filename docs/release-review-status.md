# Constitution Release Review — published

The user subsequently authorized substantive compatibility changes, merge and deployment. [Release PR #233](https://github.com/jcr0916-hue/federatedrepublic/pull/233) merged as `8759e9f73de4609b856b06ff13bd97f4358bfc41`; all scenarios and Torenthia pages were audited, The Second Renewal was replaced by The Changed Mission, and public site/PDF/API verification passed. See the [complete release record](operations/CONSTITUTIONAL-COMPATIBILITY-261023.md) and [historical recovery follow-up](operations/CONSTITUTIONAL-ARCHIVE-RECOVERY-261023.md).

The checkpoints below preserve the earlier review-only state. Their pending items and authorization restrictions were superseded by that later instruction and completed release work.

## Historical review-only staging

This is a **review-only release branch** created from `main` commit `631a8ca2996d8a8423cdd225c0e13b3e8ad0dd8f`.

- Candidate constitutional JSON staged in `constitution_data.json` (20 articles, 177 provisions).
- Historical Torenthia citation to retired §2.10 replaced by §10.1 in `torenthia-nrs-103.html`.
- The validation-only workflow `.github/workflows/constitution-release-review.yml` generates and checks derived artifacts inside a temporary CI copy, not as publication commits.
- Successful isolated release-branch check: https://github.com/jcr0916-hue/federatedrepublic/actions/runs/40048810094

**Still pending:** inspect the full release diff, generate and commit publication artifacts on this branch, run all release tests, and obtain explicit authorization before merging to `main` or deploying. No adoption is implied by this branch.

## Generated release artifacts — validation checkpoint

The release-review branch now includes regenerated `docs/constitution-current.md`, `docs/constitutional-quickref.md`, `annotated.html`, `search-index.js` and `pdf/constitution-current.pdf`. The stage workflow passed: https://github.com/jcr0916-hue/federatedrepublic/actions/runs/40052588714 . The generated-artifact staging commit was `2b91fae4259d6db83b0df452f962c9b86a10b672`.

At this checkpoint, comparison with `main` identified ten changed files, including canonical source JSON, those generated derivatives, the historical citation correction, two review workflows, and the release-status record. The site build passed, but `_site` is a generated CI output rather than a committed release artifact. Review the whole diff and run any additional full-suite release checks before explicit merge and publication authorization. No release has occurred.

## Expanded release-diff and scenario-test checkpoint (2026-10-23)

Review of the proposed release diff confirmed staged constitutional source, regenerated Markdown, annotated edition, quick reference, search index, PDF, historical citation fix, and validation workflows. Prior generation, site, text, and PDF checks passed.

The expanded CI review uncovered stale scenario citations to retired constitutional sections. Working-branch release-review changes update the contraction scenario's superseded §9.6 funding assertion, the classification scenario's §2.10 publication citation, the direction scenario's §7.11 disclosure reference, and the automatic-floor scenario's §9.6 funding claim to operative protections. These are editorial scenario compatibility repairs, not amendments to the Constitution.

**OPEN BLOCKER:** `scenario-the-second-renewal.html` is conceptually based on retired §14.3 (a mandatory Transition and Reconstruction Plan after the second renewal). This provision is absent from the approved candidate, and multiple claims in the scenario no longer describe constitutional requirements. Do not silently replace citations or represent the scenario as applicable current law. A substantive rewrite or explicit archival treatment requires separate review before a full scenario-suite pass. The last expanded workflow run is https://github.com/jcr0916-hue/federatedrepublic/actions/runs/40054745105 .

Full scenario-suite certification is pending. No merge or public deployment is authorized.
