# Articles I and II Trim — Session Record (14 October 2026)

Status at end of session: PR #157 (`trim-articles-1-2-2026-10-14`, head 9ef362f) is open as a **draft**, pushed, with all checks passing. It has not been merged. Constitution: 20 articles, 178 provisions (was 182).

---

## 1. Housekeeping done first

- Answered where to run the PDF regeneration command and how to install Playwright (`npm install --no-save playwright`, `npx playwright install chromium`, Eleventy build and local server on 8765, then `node scripts/build-quicksheet-pdfs.cjs`). Regenerating PDFs is optional, not required.
- Reviewed what was pushed, reverted noise (stray PDFs, lockfile), and merged PRs #121 (displaced judges), #122 (continuity) and #117 (world) to main.
- The Torenthia world batch was started and abandoned. No world files were written. Korda ratification content is deferred a few days; non-Korda candidates were a Fenn news piece on the Northern Arrival Housing bill / Norvane refusal, a committee hearing notice, and a routine filing.

## 2. Article I — settled design decisions

Base: John's trimmed Article I, with only what is necessary added back.

| Provision | Decision |
|---|---|
| §1.3 | Restored "wherever located". |
| §1.4 | Restored "required by law" on civil emergency duties. |
| §1.7 Bodily Sovereignty | **Cut.** The medical-autonomy sentence is covered by §1.2. The cross-State shield moves to new §1.15.a. |
| §1.8 Privacy, Property, Home | Restored and shortened (§4.5.a cites it; it is the only search, privacy, encryption and takings protection). |
| §1.9 | Restored "subject to constitutional eligibility requirements". "Consistent with electoral security" left out. |
| §1.12 | Restored "at public expense if unable to afford representation" and "systematic or" before automated methodology. |
| §1.13 Public Trial | Restored, shortened: sealing may not be indefinite; 10 years from final judgment, one extension up to five years on published findings; NRS Panel then publishes automatically. Consent-to-earlier-publication sentence cut. §1.19.a lists it as non-derogable. |
| §1.14 | Restored "otherwise" and "to the disadvantage of the accused" so a more lenient law can still apply to pending cases. |
| §1.15 Double Jeopardy | Cross-State sentence kept: State and Republic may each prosecute, sentences run concurrently, only the greater term served, time served credited to both. |
| **§1.15.a (new)** | "No State or Territory may impose criminal or civil liability on a person for conduct that was lawful where it occurred in another State or Territory, or for assisting such conduct or providing information about it." Binds States and Territories only. Where conduct "occurred" is left to the courts. |
| §1.16, §1.17, §1.17.a | **Cut.** Social rights move to §12.1. |
| §1.18 | Restored "this provision does not guarantee a particular environmental outcome". |
| §1.19 / §1.19.a | Trimmed text: "scope" replaces "geographic scope"; no "court designated by statute"; "enacted through the ordinary legislative process" dropped. Three-paragraph structure kept. Six non-derogable rights still resolve. |
| §1.20 Asylum | Restored (§6.1 and §6.3 depend on it). |
| §1.21 Non-Refoulement | Restored and tightened (§1.19.a, §6.3(2), §6.3(7) depend on it). |
| §1.22 Family | **Cut.** Nothing depends on it. |

Result: Article I is §1.1–§1.6, §1.8–§1.15, §1.15.a, §1.18, §1.19, §1.19.a, §1.20, §1.21 (20 provisions).

## 3. Article II — settled design decisions

All 24 provisions were replaced with John's trimmed text, plus these restores:

- §2.9.a(6): "If the Council and Designee have not ended within six months of the Designee taking office, they end at that time and §15.7.a applies."
- §2.11: "Any member of either chamber or any Monitor may seek expedited SC review." (the standing question: "the Who" restored.)
- §2.14.b: assistance is non-coercive support only; it may not compel, detain, surveil or collect intelligence on persons, or commandeer civilian resources, except as §1.19 or another express constitutional source allows; 90-day cap without a fresh request.
- §2.6(1): the "grounds are stated with the vote" requirement stays out (decided).

## 4. Cross-article edits (Article XII)

- **§12.1** now reads: "The Legislature establishes the framework and adequacy standards for each by statute, and the EM assesses those standards annually. A standard may be reduced only during a certified Severe Revenue Contraction under §12.4. Parents may direct their children's education within public standards."
- **§12.4**: reference changed from §1.17.a to §12.1.

## 5. Tooling fix

`scripts/sync-annotated.py` was patched to (1) insert a new provision after its predecessor in source order, and (2) remove annotated blocks for provisions no longer in the JSON. Before this, annotated.html showed 183 provisions against 178 in the JSON.

## 6. Downstream pass

Clarification from John: the older trim and text-economy references in the repo are from a different instance and are to be ignored. The rule applied was that no page may keep wording the Constitution no longer has.

- **quicksheet-rights**: removed "geographic scope" and "court designated by statute".
- **scenario-second-declaration**: rewritten to the current §1.19. It had claimed an EM assessment within 14 days that §1.19 never contained and a 60-day first declaration. It now runs on the 14-day cap, the 60-day bar and 48-hour judicial review (second declaration Day 17, ruling Day 19). The scenarios index was refreshed through the site build.
- **quicksheet-article-2**: removed "(§9.1) — informational only" and "(including elections)" from §2.11; "enacted through ordinary legislation" became "enacted by statute"; Council of Ministers described as a standing forum with no executive authority; cooling-off note now matches §2.17.
- **glossary**: continuity-emergency entry matches §2.11; social-state entry now describes the §12.1 adequacy-standard mechanism.
- **scenario-the-formula**: the line about "emergency reduction of social state access" now says an adequacy standard may be reduced only during a certified Severe Revenue Contraction.
- **constitutional-history**: new entry "Articles I and II Rewritten in Concise Form" (Session 261014).
- **Footers**: rights, Article II and fiscal quicksheets now read "Verified against the current Constitution · 14 October 2026".
- **PDFs regenerated** (cloud render, subset fonts): quicksheet-rights, quicksheet-article-2, quicksheet-fiscal, and pdf/constitution-current.pdf (60 pages, 178 provisions verified).
- **Not touched**: docs/CONSTITUTIONAL-DESIGN-PRINCIPLES.md (its §1.7 mention is historical); the State Constitutions (they cite only their own sections); archive files.

## 7. Checks run (all passing)

`check-consistency.py`, `check-constitutional-site.py`, `check-scenarios.py` (after rebuilding `_site`), `check-constitution-pdf.py`, `check-pdf-accessibility.py`.

## 8. PR state

- PR #157 "Trim Articles I and II", draft, head 9ef362f (f613b12 = text and sync tooling, 9ef362f = pages and PDFs).
- Merge only on John's say-so.

## 9. Open items

- The glossary's emergency-derogation entry says "elections cannot be affected", which is not in §1.19 (it was not in the old text either). Left alone; remove if wanted.
- Cloud-rendered PDFs may differ slightly from Mac output; regenerate on the Mac for an exact match.
- Torenthia world batch (non-Korda content) not written. Canon decision to confirm: Korda ratification electorate = eligible voters of the three transferring districts per §15.4 "defined portion".
- Superseded local `stash@{0}` (acting-scope draft) still in the local checkout.
- Earlier small items: TEXT-ECONOMY-REVIEW reference, essay-outline sync, §1.8 exigent-circumstances flag, reconsideration-notice history entry, Executive Monitor succession open items.

## 10. Next

Article III.
