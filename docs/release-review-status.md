# Constitution Release Review

This is a **review-only release branch** created from `main` commit `631a8ca2996d8a8423cdd225c0e13b3e8ad0dd8f`.

- Candidate constitutional JSON staged in `constitution_data.json` (20 articles, 177 provisions).
- Historical Torenthia citation to retired §2.10 replaced by §10.1 in `torenthia-nrs-103.html`.
- The validation-only workflow `.github/workflows/constitution-release-review.yml` generates and checks derived artifacts inside a temporary CI copy, not as publication commits.
- Successful isolated release-branch check: https://github.com/jcr0916-hue/federatedrepublic/actions/runs/40048810094

**Still pending:** inspect the full release diff, generate and commit publication artifacts on this branch, run all release tests, and obtain explicit authorization before merging to `main` or deploying. No adoption is implied by this branch.
