# Branch history — audit/torenthia-article-i-20261016

**Original branch:** `audit/torenthia-article-i-20261016`

**PR:** not yet opened; this note will be updated with its link before delivery.

**Head commit at handoff:** final reviewed commit is identified by the PR; checks
below were run on the proposed tree based on `c69f9b2bf80c069881ff28e77f3dc1c1e437b0b6`.

**Status:** proposed; shipped only after the PR merges.

## Purpose

Run Article I as a narrow pilot for the Torenthia constitutional citation audit.
Use only merged federal text; preserve published history and keep the weekend
Orath/Merath profiles independent of the constitutional editing track.

## Changes and artifacts

- [Per-article register](../../torenthia-citation-audit/README.md) and
  [dated Article I evidence](../../torenthia-citation-audit/article-i-20261016.md),
  linked from `docs/README.md`: baseline hashes, 279-page coverage, the 20 current
  identifiers/names/anchors, findings, retained references, and continuation.
- `torenthia-nrs-009.html` and `torenthia-nrs-030.html`: classification limits
  cite §10.2; remove incorrect §1.19 metadata/reading links and §1.19.b prose.
- Nine scenario pages: canonical Article I tags; remove a duplicate emergency
  tag. `scenario-harder-ballot.html` also uses the current §1.9 explanation
  without its former security qualification. Events, figures, outcomes, and
  remediation are preserved.

## Results and verification

- `npm ci --ignore-scripts --no-audit --no-fund`: passed; 136 locked packages
  installed in the isolated checkout, without changing the manifest/lockfile.
- `npm run world:publish-check`: passed in full after content edits. The build
  wrote 337 pages; discovery verified all 337 pages, 221 public World records,
  and five State historical tests. All 54 scenario-reference/library/link checks
  passed; constitutional rendering/search agreed for all 177 provisions.
  Archive-current checks and all test suites in that command passed.
  The full chain also passed again after refreshing to merged Article XVI.
- Additional read-only scoped verification: passed for all 279 source pages,
  101 federal Article I citation occurrences, 20 canonical scenario tags,
  32 built Article I links, and all 20 current anchors. Publication identity/date
  metadata, all 115 news pages, all nine profiles, and the constitutional source
  are unchanged. Both corrected NRS reading rails point to §10.2.
- `python3 -B scripts/constitution-archive.py check --base c69f9b2bf80c069881ff28e77f3dc1c1e437b0b6`:
  passed. `git diff --cached --check`: passed. New archival Markdown links resolve locally.

## Decisions and lessons

- Accepted reference updates and one limited explanatory clarification. No
  verified Article I functional conflict required changing established events.
- §1.19.b must not be mechanically replaced with §1.19.a: neither supplies the
  classification ceiling. The operative authority is §10.2.
- State §1 references are State citations, not stale federal references. All
  nine State profiles and all State Constitutions remain unchanged.
- Rejected broad narrative rewrites, Constitution edits, and expansion into
  other articles or unrelated historical references. Existing generic Article I
  wording does not need a new numbered citation merely because text was trimmed.
- Reuse the merged baseline/hash and corpus method for Article II, but refresh
  authority and publication inventory. Article II–XX audits are still pending.
  Add dated audit supplements when needed; preserve this evidence and handoff.
- Article XVI PR #181 merged during this pass. Refreshing the checkout retained
  its Constitution and scenario edits; Article I's hash stayed identical. Re-run
  validation after such a refresh instead of importing an unmerged working branch.

## Open follow-ups

- User review and merge; publication is not established by opening this PR.
- The audit covers the recorded baseline and requested four corpora. It does
  not certify all mechanisms in those pages or court/dispatch/dossier references.
- Ongoing unmerged Constitution edits remain outside the branch. At the initial
  GitHub check, the only open PR was unrelated cleanup PR #149; branches containing
  proposals or historical work were not imported or modified.
- The [17–18 October profile plan](../../../operations/WEEKEND-OBJECTIVES-2026-10-17.md)
  still controls Orath/Merath work. No profile pages, shared State templates,
  World IDs, chronology/clocks, or Story Bible/Status were changed by this audit.

## Preservation and branch disposition

- This note and the substantive dated audit/register travel in the same PR and
  remain under `docs/archive/` on merge. No post-merge file move is needed.
- No experimental product code or separate branch-only canon was introduced.
- Branch-name dependencies (deployments, automations, external links): not
  established beyond the PR association. Recheck in any later cleanup review.
- **Deletion approval:** not granted by this note. Requires separate approved
  manifest and guarded cleanup. Permanent branches remain protected.
