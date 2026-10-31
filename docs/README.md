# Repository documentation map

Start with [PROJECT-SOURCES.md](../PROJECT-SOURCES.md), the authoritative guide
to current sources and their roles. Only `main` supplies current project authority.

## Current constitutional sources

- [Federal source](../constitution_data.json) — canonical structured Constitution.
- [Current text](constitution-current.md) and [quick reference](constitutional-quickref.md) — generated derivatives.
- [State Constitutions](../State%20Constitutions/) — current State source area.
- `../annotated.html`, `../search-index.js`, and `../pdf/constitution-current.pdf` — public derived surfaces.
- [Constitutional design principles](CONSTITUTIONAL-DESIGN-PRINCIPLES.md).
- [23 October constitutional compatibility release](operations/CONSTITUTIONAL-COMPATIBILITY-261023.md) — decisions, complete per-file register, validation and rollback record.
- [Previous Constitution pairs](archive/constitution/) and [automated archival](operations/CONSTITUTION-ARCHIVAL.md) — append-only historical JSON/Markdown snapshots on `main`.

Edit canonical sources and regenerate derivatives rather than editing generated copies independently.

## World sources and publishing

- [Torenthia documentation hub](torenthia/README.md) — grouped navigation and staged organization plan.

- [Story Bible](torenthia/STORY-BIBLE.md) — durable canon and continuity constraints.
- [Story Status](torenthia/STORY-STATUS.md) — live threads, clocks, open decisions, and current frontier.
- [Political and character planning](torenthia/POLITICAL-CHARACTER-PLANNING.md) — internal editorial intentions and possibilities, **not published canon**.
- [State-story pilot](torenthia/STATE-STORY-PILOT.md) — proposed source packets, local autonomy and central review; no agents deployed.
- Published World records and front matter — authoritative published history, including older records.
- [Chronology registry](../_data/worldChronology.json) and [clock registry](../_data/worldClocks.json) — current infrastructure.
- [World publishing](torenthia/PUBLISHING.md).
- [Republic ingest](operations/REPUBLIC-INGEST.md) — conservative import and review workflow.
- [State historical tests](STATE-TEST-PUBLISHING.md) — canonical State history, provision validation, and discovery.
- [Scenario publishing](SCENARIO-PUBLISHING.md).
- [Torenthia constitutional citation audit register](archive/torenthia-citation-audit/README.md) — dated per-article reference maintenance; completed-text audit of all twenty articles prepared for review.

## Research design

- [Constitutional paper framework](research/CONSTITUTION-PAPER-FRAMEWORK.md) — proposed methods and source hierarchy; fictional State cases are illustrations, not empirical validation.

## Operations and visual references

- [Development checks and release workflow](operations/LOW-DEPLOYMENT-WORKFLOW.md) — work on branches, validate in GitHub Actions, merge once to deploy; occasional previews are manual.
- [Public asset deployment](ASSET-DEPLOYMENT.md).
- [Living Crossroads operations](operations/CROSSROADS.md).
- [Kelvant flag](world/visual-identity/KELVANT-FLAG.md) and [Varek flag](world/visual-identity/VAREK-FLAG.md).
- [Caldenmere flag](world/visual-identity/CALDENMERE-FLAG.md).

## Superseded internal material

The dated constitutional text-economy review, project progress diary, and completed World-stream migration note were removed from current documentation in October 2026. Their Git history remains available; use the current source, operational guides, and structured World registries instead.


The former archive tree, stale root quick reference, legacy Atlas implementation,
and completed planning/release records are preserved on
[`archive/legacy-project-material`](https://github.com/jcr0916-hue/federatedrepublic/tree/archive/legacy-project-material).
Its preservation manifest records original paths and hashes. Do not treat that
branch as current authority or merge it back into main. Public historical pages
and published Torenthia records remain on main; sealed Crossroads data remains
only as a [test fixture](../scripts/fixtures/README.md).
