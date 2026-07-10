# Provision Renumbering Map — 260709
*Constitutional numbering made fully sequential (review Finding 24). Apply this map to every site file citing old numbers: annotated.html, search-index.js, advisor.ts, constitution-text.js, api/navigator.js, all 12 quick sheets, all 46 scenarios, glossary, diagrams, world content, and constitutional-history entries that cite provisions in running text (historical entries describing *what changed when* keep their original numbers with a dated-numbering note).*

| Old | New | Provision |
|---|---|---|
| §1.19.b | §1.19.a | Non-Derogable Rights ⚠ most-cited provision in the corpus |
| §1.19.e | §1.19.b | Emergency Declaration Lifecycle ⚠ collides with OLD §1.19.b — apply map simultaneously, never sequentially |
| §2.16 | §2.15 | Federal Prosecution |
| §4.3.b | §4.3.a | Supreme Court Justice Removal |
| §6.3.b | §6.3.a | Unresolvable and Security Cases |
| §7.2 | §7.1 | Consular Election System |
| §7.3 | §7.2 | Federal Elections |
| §7.3.a | §7.2.a | Special Elections and Postponements |
| §7.4 | §7.3 | Electoral Supermajority Threshold ⚠ cited in world content + scenarios |
| §9.4.b | §9.4.a | Judicial Pool — Eligibility Criteria |
| §9.6 | §9.5 | Monitor Operations |
| §9.6.a | §9.5.a | Compliance Standards and Findings |
| §9.6.b | §9.5.b | Agency Accountability |
| §9.10 | §9.6 | Monitor Minimum Funding Guarantee ⚠ new §9.6 = old §9.6's number — simultaneous application mandatory |
| §9.11 | §9.7 | Joint Monitor Council |
| §9.11.a | §9.7.a | Institutional Compromise Protocol |
| §9.12 | §9.8 | Constitutional Pool Framework |
| §9.14 | §9.9 | Constitutional Officer Removal — Standard Track |
| §10.3 | §10.2 | Classification Criteria |

**Unchanged but content-revised today (site text must be re-pulled from constitution_data.json, not patched):** §1.16, §1.17, §1.19, §2.1, §2.4, §2.5, §2.6.a, §2.9, §2.12, §3.2, §3.5, §3.8, §3.10 (renamed "Removal Pathways"), §3.11, §4.4, §4.4.a, §6.1, §9.3, §12.3, §12.4, §12.5, §12.8, §15.6, §15.7, §15.9, §18.4, §19.6, §19.7, §19.9, §20.1, §20.3, all of Article XVI (rewritten, 8→5 provisions), plus deletions inside §2.12, §9.9(old §9.14), §10.1, §9.8(old §9.12).

**§17.1 entrenchment list note:** the entrenched citations updated automatically (old §9.2–§9.4 range unchanged; old §9.10 → §9.6; §10.1, §11.1 unchanged). Verify the annotated edition's entrenchment badges match.

**Regex used (apply the same, longest-first, single pass):**
`(§1\.19\.b|§1\.19\.e|§9\.11\.a|§9\.4\.b|§9\.6\.a|§9\.6\.b|§7\.3\.a|§4\.3\.b|§6\.3\.b|§2\.16|§7\.2|§7\.3|§7\.4|§9\.6|§9\.10|§9\.11|§9\.12|§9\.14|§10\.3)(?!(?:\d|\.[\da-z]))` → dict lookup. Never run the map as sequential replaces — three entries collide.
