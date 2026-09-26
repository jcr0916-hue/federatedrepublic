# Federated Republic — Infrastructure Status and Next-Step Plan

**Date:** 2026-09-26  
**Project:** `jcr0916-hue/federatedrepublic`  
**Purpose:** Preserve the current state of the weekend infrastructure work, the completed review/validation results, the known reconciliation items, and the step-by-step plan for merging, deploying, and then cleaning up the repository.

---

## 1. Executive Status

The weekend infrastructure work has been implemented, pushed, reviewed, and fully validated on the `weekend-infrastructure` branch.

The review result was:

> **Recommendation: ready to merge.** No merge, deployment, or cold-storage cleanup was performed.

The remaining work is **not another review**. It is a narrow reconciliation-and-release sequence:

1. Reconcile `weekend-infrastructure` with current `main`.
2. Remove two accidental duplicate chronology files from `docs/`.
3. Remove the temporary Vercel branch-deployment block.
4. Add the missing `lake-varda` metadata tag to `torenthia-news-090.html`.
5. Run one final validation after reconciliation.
6. Merge to `main`.
7. Deploy and verify production.
8. Only after that, begin the cold-storage/archive cleanup.

Because weekly Work usage is nearly exhausted and resets on **2026-09-29**, the execution portion should wait until the reset unless there is a compelling reason to spend the remaining allowance.

---

## 2. What Was Implemented

### 2.1 Narrative and NRS publication streams

The World publishing model was changed so that NRS records no longer consume the normal narrative publication sequence.

Current behavior:

- News, Dispatches, and Supreme Court opinions remain in the narrative stream.
- NRS receives its own independent `nrsSeq`.
- NRS records also carry a distinct human-facing `nrsId`.
- Historical `worldSeq` values remain frozen.
- Existing NRS historical sequencing is preserved for compatibility.
- New NRS records do not allocate new narrative `worldSeq` values.
- The complete public archive/discovery surface still contains both streams.
- Homepage and Torenthia “Latest” surfaces use the narrative stream so routine NRS activity cannot swamp narrative content.
- Previous/Next navigation follows the record’s own stream.
- Dossiers remain cross-stream.

All 41 pre-existing NRS records received only the intended identity metadata additions.

### 2.2 Structured chronology

A structured chronology layer was added.

Key files include:

- `_data/worldChronology.json`
- `lib/world-chronology.mjs`
- chronology tests and publishing hooks

Design principles:

- Published history is derived from existing World front matter wherever possible.
- Explicit chronology events are added only when needed.
- `worldDay` is optional.
- Existing month-only historical records remain month-only.
- The system does not invent exact days retroactively.
- Planned editorial events do not become canon and do not advance the published frontier.

### 2.3 Constitutional and administrative clocks

A structured clock registry was added in `_data/worldClocks.json`.

The clock model supports deadlines, windows, relative durations, untimed/open processes, no-deadline processes, and reusable templates.

The initial seeded clocks include:

- Korda Convention active-day clock,
- Korda committee non-binding preliminary target,
- Argent Ridge repeal/signature period,
- LC election spring Year 14 window,
- Lake Varda conference,
- Varda Crossing §10.2 redaction petition,
- Fiscal Equalization,
- Supreme Court vacancy/term template,
- Monetary Authority reporting deadline,
- Judicial Pool notice deadline.

Important constraints were preserved:

- no fabricated exact Korda deadline,
- no fabricated exact Argent Ridge endpoint,
- no numbered-month definition for “spring” unless separately established,
- no invented Lake Varda conference date,
- no invented Fiscal Equalization deadline,
- no invented Supreme Court vacancy/class assignment,
- no invented statutory appointment periods beyond constitutional ceilings.

Clock warnings are advisory unless the underlying data itself is invalid.

### 2.4 Story Status dashboard

`docs/WORLD-STORY-STATUS.md` was updated so that:

- narrative and NRS frontiers are tracked separately,
- structured clocks can produce a generated dashboard,
- human editorial notes remain human-owned,
- the Story Bible remains the durable canon source rather than becoming a timeline dump.

The project now has a clearer separation between durable canon, current operational status, structured chronology/clocks, and editorial planning.

### 2.5 Republic ingest pipeline

The local ingest workflow was implemented and integrated.

Primary commands:

```bash
npm run republic:ingest
npm run republic:ingest -- --apply
npm run republic:ingest -- --apply --archive
```

The ingest system is intentionally conservative. It previews without modifying files, refuses overwrites and collisions, blocks ambiguous routing, blocks draft markers and unsafe front matter, blocks symlink traversal, validates references/assets, requires manual review for Bible/Status/Constitution/State constitutional sources, requires manual review for core dossier placement, supports independent NRS sequencing, preserves inbox files if post-import checks fail, and archives only after successful post-import checks.

A failed post-import validation can leave imported files in the working tree for inspection while the source remains in the inbox. That behavior is deliberate and tested.

### 2.6 Related-content rail

The related-content rail was revised to eliminate clipped/sliced cards and make navigation predictable.

Current design:

- 3 complete cards on desktop,
- 2 complete cards on tablet,
- 1 complete card on mobile,
- whole-card arrow movement,
- keyboard arrow navigation,
- reduced-motion support,
- no partial next-card preview,
- retained touch and print behavior,
- related records prioritized ahead of lower-value contextual links,
- stream-specific sequence links kept separate.

### 2.7 Future registry hooks

Lightweight forward-compatible metadata hooks were added for future person IDs, office IDs, and chronology participation.

No character-profile popup UI or government org chart was built. That remains future work.

### 2.8 State constitutional history

The “How the Framers Tested It” concept remains roadmap-only.

No State historical test articles were authored as part of this infrastructure work.

Current intended future format:

- 300–500 words each,
- generally 6–8 per State,
- no more than about 10–12 per State,
- canonical Years 1–12 constitutional history,
- clearly separated from the actual State Constitution and from non-canonical hypotheticals.

---

## 3. Completed Review and Validation

The review concluded that the branch was ready to merge.

The final validation suite included chronology tests, related-rail tests, ingest tests, World publishing tests, World validation tests, metadata tests, authoring tests, asset tests, Crossroads tests, scenario tests, build, discovery validation, constitutional consistency checks, constitutional site checks, scenario consistency checks, and `git diff --check`.

Reported results:

- **75 tests passed**
- **0 test failures**
- **232 pages built**
- **137 World records validated**
- **176 constitutional provisions verified**
- **52 scenario references verified**
- complete dossier timelines verified
- narrative Latest feeds verified
- stream-specific Previous/Next links verified
- publishing validation reported no blocking errors

Browser checks confirmed complete-card rendering at representative mobile, tablet, and desktop widths.

---

## 4. Non-Blocking Validation Notes

### 4.1 `torenthia-news-090.html`

The metadata checker identified one suggestion. `torenthia-news-090.html` is explicitly about southern Lake Varda but currently has:

```yaml
worldArcs: ["korda"]
```

It should also include:

```yaml
"lake-varda"
```

This is an editorial metadata correction only. Do not change article prose, `worldSeq`, `worldDate`, `worldId`, title, or publication outcome.

### 4.2 Node package warning

The build emitted a Node module-type warning related to `_data/atlas.js`.

It did not cause a build or validation failure. This is not part of the weekend merge blocker set and should not be expanded into unrelated cleanup during the merge task.

---

## 5. Current Branch / Repository State

### `weekend-infrastructure`

The reviewed feature branch exists and contains the full implementation.

Latest observed feature-branch head:

`43ad28e2ea14ab6a446814d35b4f42f723d0aa81`

The branch was still divergent from `main` at the last check because `main` received newer commits after the feature branch was created.

### `main`

A newer `main` commit added two chronology files under the wrong directory:

- `docs/world-chronology.mjs`
- `docs/world-chronology.test.mjs`

These were checked directly and are byte-for-byte identical to:

- `lib/world-chronology.mjs`
- `scripts/world-chronology.test.mjs`

They share the same Git blob SHAs. Therefore the two `docs/` copies are accidental duplicates and should be removed during reconciliation.

---

## 6. Temporary Vercel Configuration

The feature branch currently contains:

```json
"git": {
  "deploymentEnabled": {
    "weekend-infrastructure": false
  }
}
```

This was useful to prevent automatic deployment of the temporary feature branch. It should be removed before the branch is merged to `main`.

Do not otherwise alter the Vercel configuration during this step.

---

# 7. Exact Merge / Release Plan

## Phase A — Reconcile the reviewed branch

After Work usage resets:

1. Fetch current `main`.
2. Fetch current `weekend-infrastructure`.
3. Reconcile the feature branch with `main` using the least disruptive method.
4. Preserve the reviewed weekend implementation.
5. Do not reopen architectural design questions.

During reconciliation:

### Remove accidental duplicates

Delete:

- `docs/world-chronology.mjs`
- `docs/world-chronology.test.mjs`

The authoritative locations are:

- `lib/world-chronology.mjs`
- `scripts/world-chronology.test.mjs`

### Remove temporary Vercel branch block

Remove only:

```json
"git": {
  "deploymentEnabled": {
    "weekend-infrastructure": false
  }
}
```

Preserve all other Vercel settings.

### Correct news-090 metadata

Change only:

```yaml
worldArcs: ["korda"]
```

to:

```yaml
worldArcs: ["korda", "lake-varda"]
```

No prose or canonical-event changes.

## Phase B — Final validation

Run one final post-reconciliation validation, not another review cycle.

At minimum:

```bash
npm run world:publish-check
git diff --check
```

The full project-native validation should still cover World chronology, related rail, ingest, publishing, metadata, authoring, assets, Crossroads, scenarios, build, discovery, constitutional consistency, and constitutional site checks.

Do not continue if there is a genuine regression.

## Phase C — Merge

If validation passes:

1. Merge `weekend-infrastructure` into `main`.
2. Push `main`.
3. Record the final merge commit SHA.

No cold-storage cleanup should be mixed into this merge.

## Phase D — Deploy

Use the repository’s normal production/Vercel path.

Verify production after deployment.

Minimum production checks:

- Homepage “Latest from Torenthia” shows the narrative stream and routine NRS does not displace news/SC/Dispatch content.
- Torenthia page latest feed also uses the narrative stream.
- NRS remains present and discoverable in the complete public record/archive.
- NRS Previous/Next stays inside the NRS stream.
- News/Dispatch/SC Previous/Next stays inside the narrative stream.
- Related rails show no clipped cards or page overflow at representative mobile, tablet, and desktop widths.

Only after production verification should the weekend infrastructure task be considered fully closed.

---

# 8. Cold-Storage Repository Cleanup — Next Major Phase

Do this **only after** the weekend infrastructure is safely merged and verified in production.

## 8.1 Branch model

Create:

`archive/legacy-project-material`

Purpose:

- cold storage only,
- not a development branch,
- not a working copy,
- not periodically merged from `main`.

Long-term branch policy:

- `main` = current truth / current authority / current public project
- `archive/legacy-project-material` = superseded internal history
- temporary feature branches = short-lived active work only

Git history remains the ultimate backup.

## 8.2 First-pass cold-storage migration

Move all current `docs/archive/**` material off `main` after preserving it on the archive branch.

Current archive categories include old Constitution snapshots, completed constitutional review material, old World planning, old project/migration plans, retired Crossroads material, and resolved design decisions.

These are historically useful but unsafe to treat as current project authority.

## 8.3 Known dependencies to resolve before removing `docs/archive`

### Crossroads

`scripts/crossroads.test.cjs` currently reads:

`docs/archive/crossroads/thoss-crossroads.json`

and verifies its content hash.

Before removing the archive tree from `main`, replace this dependency with an appropriate fixture or compatibility strategy.

Do not retain the entire active archive tree merely to satisfy one test.

### TypingMind tagging

Update:

- `scripts/typingmind-tag-plan.mjs`
- `scripts/typingmind-tag-plan.test.mjs`
- `docs/TYPINGMIND-KB.md`

They currently assume `docs/archive/` exists on `main`.

Once archive material moves to the cold-storage branch, active GitHub knowledge sync should no longer ingest those files.

### World documentation

Update references in:

- `docs/WORLD-STORY-BIBLE.md`
- `docs/WORLD-STORY-STATUS.md`

Replace statements like “historical planning notes remain under `docs/archive/world/`” with language identifying the cold-storage branch.

### Asset tests

`scripts/public-assets.test.mjs` uses synthetic `docs/archive/...` paths as test fixtures.

Those synthetic paths do not require the real archive directory to remain. Retain the test behavior unless there is another reason to change it.

## 8.4 Stale root constitutional quick reference

There are two files:

- `/constitutional-quickref.md`
- `/docs/constitutional-quickref.md`

They are not identical.

The active constitutional tooling consistently uses `docs/constitutional-quickref.md`.

The root copy is stale and creates retrieval ambiguity.

Plan:

1. verify no remaining live dependency,
2. preserve the stale root copy in cold storage,
3. remove it from `main`.

## 8.5 Legacy public URLs

Do not blindly delete old public pages.

Example: `torenthia-atlas.html` versus current `atlas.html`.

The old Torenthia Atlas URL should likely become a minimal compatibility/redirect page rather than disappearing.

Keep reader-facing historical pages that are intentionally public, such as `constitutional-history-archive.html`.

Historical public content is not the same thing as stale internal planning.

## 8.6 Add root authority file

Create `PROJECT-SOURCES.md`.

Keep it short and explicitly identify current authority.

Suggested hierarchy:

### Federal Constitution

1. `constitution_data.json`
2. `docs/constitution-current.md`
3. `docs/constitutional-quickref.md`
4. `annotated.html`

### Torenthia

- durable canon: `docs/WORLD-STORY-BIBLE.md`
- operational state: `docs/WORLD-STORY-STATUS.md`
- structured chronology/clocks: active `_data/` registries
- published historical canon: published World records/front matter

### State constitutions

- `State Constitutions/`

### Publishing

- `docs/WORLD-PUBLISHING.md`
- current operations documentation

Prominent rule:

> Only `main` is current authority. The cold-storage branch contains superseded historical reference and must not be used to establish current law, canon, project state, or workflow unless specifically requested.

## 8.7 Update `docs/README.md`

After migration:

- remove instructions implying the active archive lives under `docs/archive/`,
- point to `PROJECT-SOURCES.md`,
- explain that superseded internal material is stored on `archive/legacy-project-material`.

## 8.8 Reassess active-looking old documents

After the weekend architecture is on `main`, review documents such as `docs/WEBSITE-REFRESH.md`.

If they describe superseded architecture—such as one global World sequence—they should move to cold storage rather than remain active merely because they were recently accurate.

Use this test:

> If a new AI session read this file without historical context, could it safely treat the file as current?

If the answer is no, it generally should not remain on `main`.

---

# 9. Old Feature Branch Cleanup

Do this separately from archive migration.

After verifying branches are merged or obsolete, prune old branches.

Long-term target:

```text
main
archive/legacy-project-material
<only genuinely active temporary work branches>
```

Do not combine branch deletion with the main archive-migration commit.

---

# 10. Future Torenthia Work After Repository Cleanup

Once infrastructure and repository authority are stable, return to content.

Important live threads include Korda Convention, Thoss government, spring Year 14 LC election, Supreme Court future seat cycle, Lake Varda conference, Argent Ridge, Fiscal Equalization, Toren River, Corindal Industrial Partners, and Maren Sollis.

NRS should increasingly function as the high-volume institutional record, with news remaining selective narrative coverage.

Target pattern:

- multiple NRS records per in-world day when appropriate,
- much lower news/story frequency,
- mundane records that may become meaningful later,
- no need for every NRS item to be memorable on first publication.

---

# 11. Work-Usage Strategy

Weekly Work usage is currently below 5% and resets on **2026-09-29**.

Until reset:

- avoid new Work sessions,
- continue read-only GitHub inspection,
- make editorial decisions,
- refine migration instructions,
- prepare exact execution briefs.

After reset:

### First Work task

Merge/deploy the already-reviewed weekend infrastructure.

### Second Work task

Perform the cold-storage migration and `main` authority cleanup.

### Third Work task, if needed

Prune obsolete branches and verify all knowledge/retrieval workflows use current authority only.

This ordering minimizes repeated discovery and avoids spending Work capacity on work that has already been reviewed.

---

# 12. Definition of Done

The current infrastructure phase is fully complete when:

- `weekend-infrastructure` is merged to `main`,
- production is deployed,
- narrative/NRS behavior is verified live,
- the two accidental `docs/world-chronology*` duplicates are gone,
- the temporary Vercel feature-branch block is gone,
- `torenthia-news-090` includes `lake-varda`,
- final validation passes,
- no unrelated cleanup is mixed into the release.

The repository-cleanup phase is fully complete when:

- `archive/legacy-project-material` exists as cold storage,
- superseded `docs/archive/**` material is removed from `main`,
- live dependencies on the archive tree are replaced,
- stale root `constitutional-quickref.md` is removed from `main`,
- legacy public URLs are preserved through intentional compatibility pages where appropriate,
- `PROJECT-SOURCES.md` defines active authority,
- `docs/README.md` reflects the new model,
- active documentation no longer describes superseded architecture,
- obsolete feature branches are pruned separately,
- full validation passes again.

---

## Bottom line

The expensive design/review phase is finished.

The next session should execute a **small, controlled merge-and-deploy operation**, followed by a separate **repository authority/cold-storage cleanup**.

No further weekend-infrastructure review is required unless the final reconciliation itself introduces a regression.
