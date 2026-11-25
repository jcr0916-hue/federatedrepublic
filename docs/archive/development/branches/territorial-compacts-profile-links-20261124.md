# Branch history — Territory Compact references on territory pages

**Branch:** `feature/territorial-compacts-profile-links-20261124`  
**Status:** PROPOSED website changes; not merged or deployed until review  
**Dependency:** PR #391 merged 2026-11-24 (commit `4503e142d615c18630dfc3c44956366be1b19262`), which added approved Solara/Morantine/Verdmont source texts in `docs/**`. Korda source was already in main.

## Purpose and files

The President asked for the Territory Compacts to be accessible from their respective Territory pages like the State constitutions, with a substantive once-over. These sources have different legal status than published State constitutions: **editorially approved drafts/reconstruction, not enacted territorial law**. Therefore pages link to the complete repo source files with unequivocal status notices instead of presenting them as enacted codified constitutional text.

- `territory-solara.html` — adds approved Solara Compact v0.3 link and non-enactment notice.
- `territory-morantine.html` — adds Morantine Compact v0.2 link and non-enactment notice.
- `dossier-korda.html` — adds pre-existing Korda approved founding-Compact reconstruction link, explicitly not independently verified transcript or NRS publication.
- `territory-verdmont.html` (new) — light page using existing published statistics, constitutional links and record collection; links approved Verdmont Compact v0.2, with explicit constitutional-equality caveat.
- `republic-at-a-glance.html` — links the new Verdmont profile from directory and interactive map.
- This permanent handoff.

## Source review and findings

Compared source heading/operative provisions of all four Compacts against main's existing institutional data, the relevant agent qualification status and pages, and §15 references. No apparent fatal inconsistency requiring suppression of repository files was found. **Substantive caution:** Verdmont's council is an eight-person executive, elected two from each of four sections without reference to population weight. Even the approved v0.2 text says between-section voting weight disparity requires independent constitutional equality review; specific section boundaries/populations remain unknown. This is an unresolved design/rights gate, NOT a verified violation or enacted rule. Public profile states the caution.

**Other important status distinctions (not newly identified errors):**
- Solara v0.3 is explicitly a proposed standard statutory framework and does not prove any incorporation event, enactment or new Year 14 legal change. Its in-file heading still says working draft despite Presidential approval for editorial use.
- Morantine v0.2 says its 36-member Assembly and 19-vote Chief Minister rule are editorial designs, not previously published office history; one Statehood Audit has passed, second is pending.
- Verdmont has not begun Statehood Audits. Its 24-member People's Assembly and 8-member geographic executive are editorial designs, not current established legal government.
- Korda text is an approved editorial reconstruction of a founding-era compact and must not be represented as a verified literal historical document; its reconstruction status differs from the other three proposed standard statutory frameworks.
- All four documents remain complete and unmodified; no new NRS/World source or constitutional law is inferred.

## Verification and non-actions

- Read `AGENTS.md`, both existing territory pages, Korda dossier, State constitution layout, full approved files, `republic-at-a-glance.html`, `_data/stats.js`, relevant qualification notes.
- Repository source links point to confirmed paths merged to `main` by PR #391. No duplicated substantive Compact text, no new canon claims, no shared state-constitution template change.
- **Not established:** production build, full render on mobile/desktop, interactive map click inspection, editorial/legal definitive signoff of constitutional-equality issue, CI results until runs finish. Do not claim passed.
- **Deferred:** public full-text Compacts styled as enacted State constitutions; this would be misleading until legal/canon publication is separately approved. Publishing GitHub source links is a transparent editorial-reference substitute. Also deferred any changes to State constitutions or fictional dates/officeholders.
- **No self-merge** this branch without additional Presidential direction or explicit interpretation of initial request after safety review; PR #391 itself was specifically authorized and already merged.
- Keep open PR branch protected, preserve history and check automation/deployment deps and frozen tip before later branch cleanup according to `AGENTS.md`.
