# Repository documentation map

Start with [PROJECT-SOURCES.md](../PROJECT-SOURCES.md), the authoritative guide
to current sources and their roles. Only `main` supplies current project authority.

For the latest project-wide implementation handoff and working ideas, see [Project progress](PROJECT-PROGRESS.md). It is operational/planning context, not constitutional or Torenthia canon.

## Current constitutional sources

- [Federal source](../constitution_data.json) — canonical structured Constitution.
- [Current text](constitution-current.md) and [quick reference](constitutional-quickref.md) — generated derivatives.
- [State Constitutions](../State%20Constitutions/) — current State source area.
- `../annotated.html`, `../search-index.js`, and `../pdf/constitution-current.pdf` — public derived surfaces.
- [Constitutional design principles](CONSTITUTIONAL-DESIGN-PRINCIPLES.md).

Edit canonical sources and regenerate derivatives rather than editing generated copies independently.

## World sources and publishing

- [Story Bible](WORLD-STORY-BIBLE.md) — durable canon and continuity constraints.
- [Story Status](WORLD-STORY-STATUS.md) — live threads, clocks, open decisions, and current frontier.
- Published World records and front matter — authoritative published history, including older records.
- [Chronology registry](../_data/worldChronology.json) and [clock registry](../_data/worldClocks.json) — current infrastructure.
- [World publishing](WORLD-PUBLISHING.md) and [stream migration](WORLD-STREAM-MIGRATION.md).
- [Republic ingest](operations/REPUBLIC-INGEST.md) — conservative import and review workflow.
- [State historical tests](STATE-TEST-PUBLISHING.md) — canonical State history, provision validation, and discovery.
- [Scenario publishing](SCENARIO-PUBLISHING.md).

## Operations and visual references

- [Public asset deployment](ASSET-DEPLOYMENT.md).
- [Living Crossroads operations](operations/CROSSROADS.md).
- [Kelvant flag](world/visual-identity/KELVANT-FLAG.md) and [Varek flag](world/visual-identity/VAREK-FLAG.md).

## Superseded internal material

The former archive tree, stale root quick reference, legacy Atlas implementation,
and completed planning/release records are preserved on
[`archive/legacy-project-material`](https://github.com/jcr0916-hue/federatedrepublic/tree/archive/legacy-project-material).
Its preservation manifest records original paths and hashes. Do not treat that
branch as current authority or merge it back into main. Public historical pages
and published Torenthia records remain on main; sealed Crossroads data remains
only as a [test fixture](../scripts/fixtures/README.md).
