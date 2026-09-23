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

### worldKind

Record family:

- `news`
- `nrs`
- `sc`
- `dispatch`

### worldSeq

Global Torenthia chronology number.

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

These tags feed record filtering and jurisdiction-related discovery.

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

Current active dossier IDs are:

- `korda`
- `lake-varda`
- `fiscal-equalization`
- `argent-ridge`

Existing historical dossier records remain preserved in `_data/currentFiles.json` as `seedRecords`. New core records should be added through their own `worldDossiers` metadata rather than by manually editing those arrays.

---

## 6. Ordinary-life / mundane records

Ordinary-world pieces should not be forced into constitutional story arcs merely to make them appear useful.

Mark an intentionally mundane World record with:

```yaml
worldMundane: true
```

The record remains part of the complete public Record and chronology, while promotional/highlight surfaces can treat it differently.

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

Once a valid World file is added, the existing metadata drives automatic placement.

Depending on the record's metadata, it can automatically enter:

- global World chronology
- Torenthia “Latest” feed
- homepage “Latest from Torenthia”
- complete public Record
- arc-filtered Record views
- jurisdiction-filtered Record views
- related-record rails
- State/Territory coverage
- map/activity surfaces
- core dossier timelines
- dossier “As of” dates

The publishing principle is:

> The content file is the source of truth. Indexes and discovery surfaces are views of that file.

Do not manually maintain a second chronology unless a surface is intentionally editorial.

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

After publishing, update only the affected operational status entry in `docs/WORLD-STORY-STATUS.md`. Do not recreate the chronological index there; the published front matter is the historical record.

---

## 12. Validation commands

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
