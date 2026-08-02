# Diagrams — Accuracy Audit & Keep/Cut Decision (queued 260718, John)

**Trigger:** John flagged the law-making diagram as showing an incorrect CC veto, asked to
replace "parliament" with "legislature," and asked the larger questions: *are the diagrams even
needed now that the quicksheets exist, and if we keep them, do a full accuracy check.*

Two safe fixes were made immediately. The rest is queued because a spot-fix pass on a file this
wrong is the wrong tool — and because the keep/cut question should be answered BEFORE spending
hours auditing something we might retire.

---

## DONE 260718 (committed)
- **Standalone column label `PARLIAMENT` → `LEGISLATURE`** in "How the Republic Works."
  (Only the standalone legislature label. The amendment diagram's "Parliamentary via State/Popular
  ratification" was LEFT ALONE — the constitution's own §17.1 uses "the parliamentary path," so
  the diagram is quoting the document correctly there. "parliamentary records" under NRS Integrity
  is a generic descriptor, also left.)
- **Law-making diagram, CC suspensive-veto override — CORRECTED.** Diagram said "2/3 both
  chambers to override." §2.7 says the SENATE overrides by 2/3 during the one-month tabling.
  Changed to "bill tabled one month; Senate may override by 2/3 during that month."

## FOUND, NOT YET FIXED — the LC domain-veto box (step 5 of "How a Law Is Made")
Checked against §2.3.a (Legat Consul Legislative Veto). The box has FOUR errors:
1. "2/3 both chambers to override" — §2.3.a says **Senate alone, 2/3** (same error as the CC box).
2. Cited "§2.3 Consular Intelligence and Veto" — the veto is **§2.3.a**; §2.3 is foreign-
   intelligence direction and contains **no veto power at all**. Miscitation.
3. "SC reviews within 7 days on petition" — §2.3.a routes the domain question to an **EM
   assessment under §9.1** (either Speaker may request), **not** the Supreme Court.
4. "SC must rule within 7 days" — there is **no 7-day clock** anywhere in §2.3.a. Fabricated.
This box was left untouched pending the full audit, because fixing 1 while 2–4 remain would make
it look verified when it isn't. The whole box needs rewriting from §2.3.a, not patching.

**Why this matters:** two boxes of ONE diagram, checked, produced SIX errors — including a
fabricated Supreme Court review with a fabricated deadline. This is the same failure mode as the
quickref (invented thresholds) and the Record (stale by construction). The diagrams assert
constitutional facts in a form nobody re-derives. Assume more are wrong until each is checked.

---

## THE PRIOR QUESTION (answer FIRST): keep the diagrams at all?

**Scope if we keep them:** 12 `<h2>` diagrams, **256 §-citations, 68 distinct** — every one a
claim to verify against constitution_data.json. That is a real audit, not a session's cleanup.

**The overlap with quicksheets is large.** 12 quicksheets already exist:
  amendments · article-2 · article-3 · elections · fiscal · immigration · judiciary · monitors ·
  nvs · recall-removal · rights · states
The diagrams cover: architecture, law-making, state pathways, residency, military authorization,
dual executive, amending, the three monitors, the social state, SC appointment, the pool, states.
**Most diagram topics have a matching quicksheet** (amendments, article-2/dual-executive,
judiciary/SC, monitors, states, immigration/residency). The quicksheets are DERIVED-adjacent and
were verified more recently; the diagrams are older, hand-built SVG/HTML and demonstrably drifted.

**Three honest options:**
1. **Cut the diagrams.** If the quicksheets carry the same load more accurately, the diagrams are
   a second surface that has already drifted — the exact redundancy pattern we keep retiring (the
   ticker, the World strip). Editorial policy is remove-don't-annotate. Cleanest.
2. **Keep a FEW.** Some diagrams do something a quicksheet can't — the law-making FLOW, the
   amendment PATHS, the SC appointment CHAIN are genuinely visual/sequential in a way a fact-sheet
   isn't. Keep those, audit only those, cut the rest.
3. **Keep all, audit all.** Only if the visual layer is considered core. 68 citations to verify.

**Claude's lean:** option 2. The diagrams that earn their place are the *flows and chains* (law-
making, amendment paths, SC appointment, state lifecycle, military authorization) — sequence and
branching are what a diagram does that a quicksheet can't. The ones that are just labelled boxes
of facts (the three monitors, the social state, what states cannot do) duplicate a quicksheet and
should go. Then the audit is ~5 diagrams, not 12, and every survivor is verified.

**Decide the keep/cut list FIRST. Then audit only survivors, box by box, against the JSON.**

## When activated
For each surviving diagram: list every §-citation, verify name + claim against
constitution_data.json (the JSON is authoritative; the DOCX is the tiebreaker), rewrite any box
that misstates the mechanism, fix any miscitation. Changelog only if a constitutional
CLAIM the site makes was wrong (diagram fixes are site fixes, not constitutional changes —
but a wrong claim being corrected is worth a note). No social post (not post-worthy).
