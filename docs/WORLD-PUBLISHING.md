# Torenthia World Publishing Workflow

This document is the operational guide for adding new Torenthia World content to the Federated Republic project.

The goal of the publishing system is simple:

> Add one well-formed World file, give it accurate metadata, and let the site place it everywhere it belongs automatically.

The system deliberately separates **editorial judgment** from **automation**. Metadata is authoritative. Keyword analysis can suggest likely tags and warn about omissions, but it never silently changes canon.

---

## 1. Start with the preview-first authoring helper

Use:

```bash
npm run world:new -- \
  --kind news \
  --date 13.12 \
  --title "..." \
  --blurb "..." \
  --outlet "The Torenthian"
```

Supported kinds:

- `news`
- `nrs`
- `sc`
- `dispatch`

The helper scans the existing World files and calculates:

- the next global `worldSeq`
- the next filename for that record type
- the corresponding `worldId`
- likely arc tags
- likely jurisdiction tags
- likely constitutional provision tags

The first run is **preview-only**. It does not create a file.

At the current frontier after worldSeq 132, the next generated identifiers would begin with:

- global sequence: `133`
- news: `torenthia-news-087.html`
- NRS: `torenthia-nrs-042.html`
- Supreme Court: `torenthia-sc-003.html`

The helper always reads the repository before calculating these values, so future numbers advance automatically.

---

## 2. Review the suggested metadata

Suggestions are advisory.

For example, a title or blurb centered on Korda, the Territory Convention, and §15.5.a may produce suggestions such as:

```text
arcs: ["korda"]
jurisdictions: ["Korda"]
provisions: ["§15.5.a"]
```

Do not accept a suggestion merely because the helper produced it. Confirm that it describes the actual role of the record.

A record may mention Korda without being a core Korda development. A campaign story reacting to Korda, for example, can be tagged to the Korda arc without becoming a core Korda dossier record.

---

## 3. Create the draft

Once the preview looks correct, rerun the same command with:

```bash
--write
```

Example:

```bash
npm run world:new -- \
  --kind news \
  --date 13.12 \
  --title "Convention Committee Opens Freight Review" \
  --blurb "The Joint Committee on Transition Facts begins collecting transport-capacity records from Korda agencies." \
  --outlet "The Torenthian" \
  --arcs korda \
  --jurisdictions Korda \
  --provisions §15.5.a \
  --dossiers korda \
  --related torenthia-nrs-041.html \
  --write
```

The helper creates:

- the next available filename
- the next global `worldSeq`
- standard World front matter
- a minimal HTML shell
- commented metadata suggestions when suggestions were not explicitly accepted

The generated body is a draft shell. Replace it with the finished World content before publication.

The helper refuses to overwrite an existing file.

---

## 4. Metadata fields

Every World record requires:

```yaml
worldKind:
worldSeq:
worldDate:
worldTitle:
worldOutlet:
worldBlurb:
worldId:
worldArcs: []
worldJurisdictions: []
worldProvisions: []
worldRelated: []
```

Additional fields are used when appropriate:

```yaml
worldAuthor:
worldImage:
worldDossiers: []
worldMundane: true
worldSignalIgnore: []
```

`worldTitle`, `worldOutlet`, and `worldBlurb` supply card titles, source labels, and summaries; keep them consistent with the finished body. All four required list fields must be arrays, even when empty. Use a quoted string for dates and an unquoted integer for sequence numbers.

### worldKind

Record family:

- `news`
- `nrs`
- `sc`
- `dispatch`

### worldSeq

Global Torenthia chronology number. Rendering sorts by numeric fictional year, then month, then `worldSeq` within the month. Do not renumber existing records or move their dates to force placement.

This is unique across all World record types, not just within news or NRS files.

The authoring helper assigns the next value automatically.

### worldDate

Fictional date in quoted `YY.MM` format.

Example:

```yaml
worldDate: "13.12"
```

Month must be `01` through `12`.

The authoring helper rejects malformed dates before writing a file.

### worldId

Must match the filename without `.html`.

Example:

```text
torenthia-news-087.html
```

uses:

```yaml
worldId: "torenthia-news-087"
```

### worldArcs

Controls story-thread discovery.

Examples:

```yaml
worldArcs: ["korda"]
```

or:

```yaml
worldArcs: ["korda", "fiscal-equalization"]
```

A tag means the record is meaningfully related to that thread. It does not mean the record is a core dossier event.

### worldJurisdictions

States or Territories meaningfully involved in the record.

Example:

```yaml
worldJurisdictions: ["Korda", "Kelvant"]
```

These tags feed record filtering and jurisdiction-related discovery. Use the exact case-sensitive names in `_data/stats.json` (for example, `Korda`, not `korda`). Do not tag incidental mentions.

### worldProvisions

Constitutional provisions materially involved in the piece.

Example:

```yaml
worldProvisions: ["§15.5.a"]
```

The build validates these against `constitution_data.json`.

### worldRelated

Explicit related World records.

Use filenames including `.html`.

Example:

```yaml
worldRelated: ["torenthia-nrs-041.html", "torenthia-news-083.html"]
```

The build rejects references to missing World records.

---

## 5. Core dossier records versus supporting coverage

This distinction is important.

### Supporting coverage

A record related to Korda but not a core step in the Korda constitutional file uses:

```yaml
worldArcs: ["korda"]
```

It will appear in:

- Korda-filtered Record searches
- related World discovery
- other appropriate automatic surfaces

It will **not** enter the curated Korda “Key records” timeline.

### Core dossier record

A record that represents a core step in the active constitutional file uses:

```yaml
worldArcs: ["korda"]
worldDossiers: ["korda"]
```

The dossier tag automatically adds the record to the dossier timeline.

The dossier's **As of** date also advances automatically to the newest core dossier record.

A dossier cannot be assigned unless the same value appears in `worldArcs`. The authoring helper and build validation enforce this rule.

Valid arcs and dossier IDs both come from `_data/currentFiles.json`; arbitrary keywords are rejected by the build. Current active dossier IDs are:

- `korda`
- `lake-varda`
- `fiscal-equalization`
- `argent-ridge`

For the established examples: `torenthia-nrs-041.html` files the committee roster and is core Korda coverage. `torenthia-news-085.html` reports candidate reactions and remains arc-tagged supporting coverage. Core means a material procedural step, official decision, filed evidence, or development needed to understand the constitutional timeline; commentary and reactions generally remain supporting. A seed record remains core even without a dossier tag.

Existing historical dossier records remain preserved in `_data/currentFiles.json` as `seedRecords`. New core records should be added through their own `worldDossiers` metadata rather than by manually editing those arrays.

---

## 6. Ordinary-life / mundane records

Ordinary-world pieces should not be forced into constitutional story arcs merely to make them appear useful.

Mark an intentionally mundane World record with:

```yaml
worldMundane: true
```

The record remains in the complete Record, chronology, and the current homepage and Torenthia latest-four feeds. Map activity excludes mundane records. The available `worldHighlights` filter excludes them wherever a template explicitly uses it; the current latest feeds do not. Mundane is not a draft/private flag.

The authoring helper supports:

```bash
--mundane
```

---

## 7. Dispatches

Dispatch filenames use a descriptive slug instead of an incrementing number.

Example:

```bash
npm run world:new -- \
  --kind dispatch \
  --slug "Mara Iset" \
  --date 13.12 \
  --title "..." \
  --blurb "..."
```

This would produce a filename such as:

```text
torenthia-dispatch-mara-iset.html
```

Dispatches still receive the next global `worldSeq`.

---

## 8. Keyword-assisted metadata safety net

Every normal build runs:

```bash
node scripts/check-world-metadata.mjs
```

or equivalently:

```bash
npm run check:world-meta
```

The checker reviews newly published World records after the current automation baseline and looks for strong signals suggesting that metadata may be incomplete.

Examples of warnings:

```text
likely korda coverage, but "korda" is missing from worldArcs
```

```text
"Korda" appears central, but is missing from worldJurisdictions
```

```text
§15.5.a is materially referenced, but is missing from worldProvisions
```

The checker examines:

- title
- blurb
- body text

It uses signals such as known arc names, recurring jurisdiction names, and constitutional references.

These are **warnings only**. The checker does not rewrite metadata and does not decide canon.

---

## 9. Deliberate exceptions

Sometimes a record will repeatedly mention a place, arc, or provision without actually belonging to that metadata category.

Use `worldSignalIgnore` for a specific deliberate exception.

Example:

```yaml
worldSignalIgnore:
  - "arc:korda"
  - "jurisdiction:Korda"
```

Provision suppression is also supported:

```yaml
worldSignalIgnore:
  - "provision:§15.5.a"
```

Use this narrowly. The purpose is to document an intentional exception, not to silence the checker generally.

---

## 10. What becomes automatic after publication

On the next successful build/deployment:

| Surface | Source and behavior |
| --- | --- |
| Homepage and Torenthia Latest | Four newest World records, including mundane pieces. |
| Complete Record | Every World piece; date/sequence ordering and arc, jurisdiction, outlet, and kind filters derive from metadata. |
| Dossiers and Republic Now cards | Frozen `seedRecords` union explicit `worldDossiers`, deduplicated and ordered by date/sequence. As-of is the newest date in this core set, not the newest supporting article. Empty dossier timelines fail validation. |
| Map activity | Up to three newest non-mundane records per map dot. Matches explicit `worldPlaces` keys or dot aliases in title/blurb; `worldJurisdictions` alone does not drive map dots. Check keys/aliases in `_data/mapdots.js`. |
| Jurisdiction discovery | Record links filter exact `worldJurisdictions`; existing State profiles show six newest tagged records and Solara/Morantine profiles show four. Directory summaries and geographic boundaries are editorial. |
| Related World rails | Explicit `worldRelated` links, reverse links, and shared arcs qualify; direct outgoing links take priority, then newest first, capped at four. The rail also links applicable dossiers, jurisdictions, and provisions and supplies previous/next chronology links. |

For explicit map placement, use a space-separated string such as `worldPlaces: "korda-south"`, after confirming the key exists in `_data/mapdots.js`. This optional field is distinct from jurisdiction tags. A newly named location does not automatically create a dot or profile page.

Standalone story pages need `{% include "related-world.njk" %}` where the rail should appear; the authoring helper includes it. Copying an old page without the include will not acquire a rail merely by adding metadata.

Do not maintain a second chronological list. Dossier titles, summaries, questions, provisions, and affected-jurisdiction lists in `_data/currentFiles.json`, plus dossier introductory prose and descriptions, remain editorial. A derived date means the timeline is current; it does not certify that the editorial summary has been rewritten. Counts of filtered records derive from the archive; there is no new standalone per-arc analytics dashboard.

---

## 11. Editorial checks before publishing

Before writing or publishing a new World record:

1. Start with the preview-first helper when practical.
2. Read the relevant section of `docs/WORLD-STORY-BIBLE.md`.
3. Check `docs/WORLD-STORY-STATUS.md` for live threads, open questions, and constitutional clocks.
4. Check the latest relevant published World records and their front matter.
5. Check `constitution_data.json` for any constitutional mechanism the story relies on.
6. Search existing names before inventing a new character.
7. Decide the metadata deliberately:
   - `worldArcs`
   - `worldJurisdictions`
   - `worldProvisions`
   - `worldRelated`
   - `worldDossiers`, only for core dossier steps
8. For Korda or Living Crossroads material, confirm whether the piece belongs to real canon or the non-canon interactive track.
9. Confirm that Crossroads-only characters or outcomes have not leaked into real World canon.
10. Replace the generated draft shell with finished content.

In the same publishing change, update the affected operational status entry in `docs/WORLD-STORY-STATUS.md`. Do not recreate the chronological index there; the published front matter is the historical record. Update `docs/WORLD-STORY-BIBLE.md` only when a piece establishes or changes durable canon (institutions, settled geography, enduring character facts, or constitutional-world rules). Routine developments belong in Status. Metadata warnings do not automatically update or certify either document.

---

## 12. Validation commands

Run the complete release check with:

```bash
npm run world:publish-check
```

This runs publishing-guard, World, metadata, authoring, asset, Crossroads, and scenario tests; the guarded build; rendered discovery checks; and constitutional/scenario consistency checks. Any failed step stops the command with a nonzero exit status. `.github/workflows/world-publishing.yml` runs the same command on pull requests and main pushes. Repository branch protection must require **World publishing check** if merges must be prevented until it passes; merely adding a workflow does not enable branch protection.

Every `npm run build` now starts with `check:world-publish`, which blocks helper draft markers, explicit `draft: true` / `worldDraft: true`, missing or blank required text, invalid field types, filename/ID mismatches, nonpositive/duplicate sequences, invalid dates, broken related/provision references, and invalid arc/dossier assignments. Expected World filenames cannot bypass the check by omitting `worldKind`. This is a publication guard, not a private-draft rendering system.

`npm run test:world-publish` exercises these guards. `npm run check:world-publish` runs the lightweight guard without building. The guard cannot determine whether prose is editorially finished after a marker is removed; human review remains required.

Status frontier/date mismatches are warnings. A core record with a sequence beyond the Status frontier also prompts review of its dossier summary/question, Status section, and any durable Bible changes. These reminders neither block publication nor rewrite files. They do not detect every revision to older stories: review those manually. Updating the frontier acknowledges review; it is not proof that the summary is accurate.


From the repository root, install locked dependencies first with `npm ci`.

Normal build:

```bash
npm run build
```

World metadata check:

```bash
npm run check:world-meta
```

Audit the historical archive:

```bash
npm run audit:world-meta
```

World metadata tests:

```bash
npm run test:world-meta
```

World authoring-helper tests:

```bash
npm run test:world-authoring
```

World collection tests:

```bash
npm run test:world
```

Discovery/link checks:

```bash
npm run check:discovery
```

Additional release validation remains:

```bash
npm run test:assets
npm run test:crossroads
python3 scripts/check-consistency.py
python3 scripts/check-constitutional-site.py
python3 scripts/check-scenarios.py
```

---

## 13. Command reference

### News

```bash
npm run world:new -- \
  --kind news \
  --date 13.12 \
  --title "..." \
  --blurb "..." \
  --outlet "The Torenthian"
```

### NRS

```bash
npm run world:new -- \
  --kind nrs \
  --date 13.12 \
  --title "..." \
  --blurb "..."
```

Default outlet:

```text
National Record System
```

### Supreme Court

```bash
npm run world:new -- \
  --kind sc \
  --date 13.12 \
  --title "..." \
  --blurb "..."
```

Default outlet:

```text
Supreme Court
```

### Dispatch

```bash
npm run world:new -- \
  --kind dispatch \
  --slug "Name Here" \
  --date 13.12 \
  --title "..." \
  --blurb "..."
```

### Optional accepted metadata

```bash
--author "Petra Vend"
--arcs korda,lake-varda
--jurisdictions Korda,Kelvant
--provisions §15.5.a,§15.4
--dossiers korda
--related torenthia-nrs-041.html,torenthia-news-083.html
--mundane
--write
```

Comma-separated values are accepted for list fields.

---

## 14. Governing rule

Automation should reduce maintenance without replacing editorial judgment.

**Automatic:**

- sequencing
- filename selection
- chronology
- discovery
- dossier inclusion when explicitly marked
- dossier dates
- metadata warnings
- validation

**Human/editorial:**

- canon
- story significance
- which arc genuinely applies
- whether a record is a core dossier step
- constitutional interpretation
- continuity decisions
- character creation
- final prose

That division is intentional.


## 15. Release checklist

- [ ] Read Bible, Status, and the latest relevant records; choose the fictional date without changing established chronology.
- [ ] Preview the helper, review identifiers and tags, then write and finish the HTML. Recheck uniqueness if other work landed meanwhile.
- [ ] Fill every required field; explicitly choose core versus supporting coverage; leave frozen seeds unchanged.
- [ ] Review related links, jurisdiction spelling, provisions, mundane treatment, map placement, images, and the related rail.
- [ ] Update affected Status entries, durable Bible facts when applicable, and editorial dossier summaries/questions if needed.
- [ ] Run `npm run world:publish-check`. Review advisory warnings even when all checks pass.
- [ ] Inspect built Latest, Record, affected dossier, related rail, map activity, and relevant jurisdiction pages. Check supporting articles have not entered core timelines.
- [ ] Run the additional release checks above; inspect `git diff --check` and the final diff for accidental canon or chronology edits.
- [ ] Commit on a working branch, incorporate current main, validate the combined result, and merge/push to main under the project's publishing authorization.
- [ ] Wait for the Vercel Git deployment tied to the exact main commit to reach READY. Check the production alias and affected live pages; record commit SHA, deployment ID, and URL. A successful local build alone is not proof of deployment.

The keyword checker normally examines filenames in the supported World families with `worldSeq > 132`; `audit:world-meta` includes older records. Its suggestions never add tags, promote a dossier record, advance a constitutional clock, or establish canon. All World HTML at the site root is publishable, including unfinished helper output: do not merge a draft shell.
