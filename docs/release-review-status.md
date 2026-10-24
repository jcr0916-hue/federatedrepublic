# Constitution Release Review

This is a **review-only release branch** created from `main` commit `631a8ca2996d8a8423cdd225c0e13b3e8ad0dd8f`.

- Candidate constitutional JSON staged in `constitution_data.json` (20 articles, 177 provisions).
- Historical Torenthia citation to retired §2.10 replaced by §10.1 in `torenthia-nrs-103.html`.
- The validation-only workflow `.github/workflows/constitution-release-review.yml` generates and checks derived artifacts inside a temporary CI copy, not as publication commits.
- Successful isolated release-branch check: https://github.com/jcr0916-hue/federatedrepublic/actions/runs/40048810094

**Still pending:** inspect the full release diff, generate and commit publication artifacts on this branch, run all release tests, and obtain explicit authorization before merging to `main` or deploying. No adoption is implied by this branch.

## Generated release artifacts — validation checkpoint

The release-review branch now includes regenerated `docs/constitution-current.md`, `docs/constitutional-quickref.md`, `annotated.html`, `search-index.js` and `pdf/constitution-current.pdf`. The stage workflow passed: https://github.com/jcr0916-hue/federatedrepublic/actions/runs/40052588714 . The generated-artifact staging commit was `2b91fae4259d6db83b0df452f962c9b86a10b672`.

At this checkpoint, comparison with `main` identified ten changed files, including canonical source JSON, those generated derivatives, the historical citation correction, two review workflows, and the release-status record. The site build passed, but `_site` is a generated CI output rather than a committed release artifact. Review the whole diff and run any additional full-suite release checks before explicit merge and publication authorization. No release has occurred.
