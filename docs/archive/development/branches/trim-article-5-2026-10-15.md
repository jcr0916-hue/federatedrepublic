# Branch history — trim-article-5-2026-10-15

**Original branch:** `trim-article-5-2026-10-15`  
**PR:** to be filled in once opened (draft)  
**Head commit at handoff:** see the PR  
**Status:** proposed (shipped only once the PR merges)

## Purpose
Trim Article V to the text settled with John one provision at a time. Follows PR #165 (Article IV, merged). Guiding rule: make it possible for the government to function; do not solve every imaginable case.

## Changes and artifacts
- `constitution_data.json` plus generated files (`annotated.html`, `docs/constitution-current.md`, `docs/constitutional-quickref.md`, `search-index.js`, constitution archive pair `Constitution-261016`). 20 articles, 177 provisions.
- §5.1: opening route-list sentence cut; last paragraph says the child "receives the parent's status". §5.1.a: two phrases cut. §5.2: unchanged. §5.3: "a citizen or Inhabitant child" becomes "a child".
- History entry `article-5-concise-261015`. No page, test or fixture cited the removed wording.
- `constitution-current.pdf` regenerated in the cloud container (subset fonts); a Mac render may differ slightly.

## Results and verification
- See the PR for the check results; the full `npm run world:publish-check` chain, the five site checks and the archive check were run before opening it.

## Decisions and lessons
- A child born in the Republic to undocumented parents is a citizen only if otherwise stateless. Left as a policy choice, not a drafting defect.
- §5.1.a keeps "a State or Territory of voting citizenship" in full; shortening it to "one" left the referent unclear.
- §5.2 stays whole: it is the only statement of the right of legal residents to work and enter contracts, and the only description of the status.
- §5.3 stay "until custodial arrangements are resolved" is a stay, not a bar; the family leaving together resolves it. Any process or deadline is left to statute.

## Open follow-ups
- `scenario-the-departure` says §5.1 provides that citizenship "cannot be stripped"; naturalized citizenship can be revoked for material fraud. Pre-existing wording, not changed here.
- Article VI onward continues the same article-by-article process.

## Preservation and branch disposition
- Results live on `main` once merged: the history entry, this note, and the regenerated constitution archive pair.
- Branch name dependencies (deployments, automation, external links): not checked.
- **Deletion approval:** Not granted by this note. Requires separate approved manifest and guarded cleanup.
