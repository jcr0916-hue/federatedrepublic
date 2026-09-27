# Current project sources

Start here for AI sessions and contributor work on the Federated Republic.
Only files on `main` are current project authority. Other branches are proposals
or historical snapshots; a filename containing “current” does not confer authority.
Use the roles below: automated test fixtures and hypotheticals do not establish canon.

## Constitution

- Federal authority: [`constitution_data.json`](constitution_data.json).
- Generated current text: [`docs/constitution-current.md`](docs/constitution-current.md).
- Generated index: [`docs/constitutional-quickref.md`](docs/constitutional-quickref.md).
- State authority: existing sources under [`State Constitutions/`](State%20Constitutions/).
- Edit the appropriate source, then regenerate federal derivatives with `npm run sync`.
- Generated pages, search data, quick references, and downloads are derived surfaces.
- Design guidance: [`docs/CONSTITUTIONAL-DESIGN-PRINCIPLES.md`](docs/CONSTITUTIONAL-DESIGN-PRINCIPLES.md).

## Torenthia and published history

- Durable canon: [`docs/WORLD-STORY-BIBLE.md`](docs/WORLD-STORY-BIBLE.md).
- Current operational state: [`docs/WORLD-STORY-STATUS.md`](docs/WORLD-STORY-STATUS.md).
- Published World records and their front matter establish published events.
  Historical News, NRS, Court opinions, and Dispatches remain authoritative history.
- Published `state-tests/` records marked `canonical-history` establish State history;
  their cited provisions remain governed by the current State Constitution source.
- The Constitution controls constitutional mechanisms; the Bible supplies continuity.
- Dossiers and State/Territory pages remain active public references.
- Chronology: [`_data/worldChronology.json`](_data/worldChronology.json).
- Clocks: [`_data/worldClocks.json`](_data/worldClocks.json).
  Both are current infrastructure; planned entries do not establish events or dates.
- Scenario and Crossroads outcomes are hypothetical unless explicitly established
  by the current canon sources; test fixtures are never publication authority.

## Current workflows

- World publishing: [`docs/WORLD-PUBLISHING.md`](docs/WORLD-PUBLISHING.md).
- Stream compatibility: [`docs/WORLD-STREAM-MIGRATION.md`](docs/WORLD-STREAM-MIGRATION.md).
- Conservative import: [`docs/operations/REPUBLIC-INGEST.md`](docs/operations/REPUBLIC-INGEST.md).
- State historical tests: [`docs/STATE-TEST-PUBLISHING.md`](docs/STATE-TEST-PUBLISHING.md).
- Scenarios: [`docs/SCENARIO-PUBLISHING.md`](docs/SCENARIO-PUBLISHING.md).
- Crossroads: [`docs/operations/CROSSROADS.md`](docs/operations/CROSSROADS.md).
- Assets/deployment: [`docs/ASSET-DEPLOYMENT.md`](docs/ASSET-DEPLOYMENT.md).
- Run `npm run world:publish-check` and relevant additional tests before publishing.
- The documentation index is [`docs/README.md`](docs/README.md).
- Current project-wide progress and working ideas: [`docs/PROJECT-PROGRESS.md`](docs/PROJECT-PROGRESS.md). This is a non-authoritative implementation handoff, not constitutional or Torenthia canon.

## Cold storage

[`archive/legacy-project-material`](https://github.com/jcr0916-hue/federatedrepublic/tree/archive/legacy-project-material)
contains superseded internal material only, not current law, canon, or workflows.
Its inherited repository snapshot is historical context, not a second authority.
Do not periodically merge main into it or merge it back into main.
Add material only when it retires; preserve original bytes and provenance first.
Public historical canon, required fixtures, and compatibility URLs stay on main.
Git history remains the ultimate backup.
Federal ingest snapshots live outside the repository in `~/Downloads/Federated-Republic-Archive/constitution/`.
They preserve prior Markdown, confer no current authority, and require separate cold-storage housekeeping.
