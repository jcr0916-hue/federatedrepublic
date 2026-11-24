# Branch history — approved territorial compact documents

**Original branch:** `docs/territorial-compacts-approved-editorial-20261124`  
**PR:** pending draft PR creation  
**Status:** PROPOSED repository documentation; unmerged, not deployed, not enacted canon

## Purpose

The President requested that the previously created territorial compacts be kept in the `federatedrepublic` repository, rather than only in ChatGPT Library. The Constitution is the primary project; the Torenthia world and agent editorial compacts serve it. No fictional legal enactment is implied.

## Content preserved

- Three *verbatim approved Library copies*: `docs/torenthia/territorial-compacts/SOLARA-TERRITORIAL-COMPACT-v0.3-APPROVED-EDITORIAL.md`, `MORANTINE-TERRITORIAL-COMPACT-v0.2-APPROVED-EDITORIAL.md`, `VERDMONT-TERRITORIAL-COMPACT-v0.2-APPROVED-EDITORIAL.md`.
- `docs/torenthia/territorial-compacts/README.md` — status-qualified index linking these plus pre-existing `docs/torenthia/KORDA-TERRITORIAL-COMPACT.md`.
- This handoff. **Korda Compact was already on main and is unchanged.**

## Actual validation

- GitHub `main` recursive tree list (non-truncated) found only the Korda compact as a complete Compact file; qualification records for Solara/Morantine/Verdmont pointed explicitly to approved editorial copies in ChatGPT Library.
- Retrieved the exact approved named files (not unapproved draft versions) from Library `/Torenthia/Agent Governance/`, and materialized their original files.
- Source byte sizes were **20,833**, **17,462**, **18,226** bytes. GitHub created text was checked against the Library-read full text, including restored final newline; all three content comparisons returned exact equality.
- Verified titles and cautionary status text of all three: editorial approval, not statutory enactment. No testing command or publishing pipeline was run as part of this documentation-only change.
- **Unverified:** CI results on this PR until Actions executes. Do not claim build or publication checks have passed.

## Decisions and rejected paths

- **Accepted:** preserve the approved v0.3/v0.2/v0.2 text verbatim, including its in-file draft status language, and explain metadata separately in an index.
- **Rejected:** synthesizing compacts from agent briefs, silently revising approved documents, or presenting them as enacted in Year 14.
- **Deferred:** changing agent source manifests, website links, published NRS, canonical history, or legal status; those are independent actions requiring review.

## Open follow-ups and lifecycle

- Review PR; only merge to `main` with explicit Presidential approval. No autonomous deployment or fictitious legal canon changes.
- Retain branch while PR remains open. No branch protection/deployment/automation dependency clearance has been conducted. After an authorized merge, follow `AGENTS.md` branch lifecycle, final-tip preservation, dependency review and rolling three-branch rotation rules. No deletion authorized or performed.
