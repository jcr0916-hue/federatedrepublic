# Federal Constitution — Editorial Review Plan
*Readability, comprehension, brevity. Drafted 260918. Nothing executed yet — this is the method to approve before any provision is touched.*

**Scope guardrail (John, 260918):** no changes to basic structure or function. Illogical, inconsistent, wrong, or incoherent material gets addressed when found, but this is an editorial pass, not a redesign.

---

## 1. WHAT THE DOCUMENT ACTUALLY LOOKS LIKE (measured, not assumed)

30,556 words · 20 articles · 176 provisions · median provision 144 words.

Bulk is concentrated: **Article II (4,735w), Article IX (3,602w), and Article XV (2,711w) are 36% of the entire constitution.** Article I, despite having the most provisions (24), is one of the leanest per provision (95w avg) — the rights article is already tight. The executive and monitor articles are where the weight is.

### Your "saying the same thing multiple times" instinct — confirmed, but smaller than it feels

Near-verbatim duplication totals **~568 words (1.9% of the document)**, concentrated in five parallel-structure clusters:

| Cluster | Dup sentences | ~Words | What it is |
|---|---|---|---|
| §3.2 ↔ §3.5 | 7 | 134 | Assembly/Senate — recall + expulsion machinery written twice |
| §13.1 ↔ §13.2 | 6 | 132 | Referendum/Initiative — **identical two-phase machinery, differs only in numbers** |
| §2.5 ↔ §2.9 | 4 | 66 | Civic/Legat succession, acting service, tiebreakers |
| §1.16 ↔ §1.17 | 3 | 58 | — |
| §1.13 ↔ §10.2 | 3 | 42 | Rights-side and NRS-side statements of the same records rule |

Every one is the same phenomenon: **symmetric institutions described twice in full.** That's a legitimate drafting style, not automatically a defect — worth deciding deliberately rather than by default.

### The larger source of bulk is repetition of *convention*, not of rules

| Pattern | Provisions affected |
|---|---|
| "published to the NRS" — in at least **6 different phrasings** | 23 |
| "within the period defined by statute" / "not to exceed N days" | 22 |
| Belt-and-braces ("in all circumstances", "at any time", "whether or not") | 31 |
| Negative-scope disclaimers ("confers no authority beyond", "nothing in this section") | 22 |
| Restating another section rather than citing it | 16 |
| Long inline enumerations | 13 |
| "on the same or substantially similar grounds" | 7 |

The NRS one is the clearest defect: *six different phrasings of the same requirement* invites a reader to assume they mean different things. That's a comprehension bug, not just verbosity.

### Comprehension load

- 10 provisions exceed 440 words (§2.6.a is 579).
- Longest single sentences: 75w (§15.5.a), 72w (§2.11, §15.1), 56w, 55w×3.
- 283 cross-references, avg 1.6 per provision; §15.5.a and §16.2 each force the reader to chase **10**.
- 71 of 176 provisions are fully self-contained (zero cross-refs) — the document is not uniformly tangled, the tangle is localized.

---

## 2. THE CONSTRAINT THAT SHAPES EVERYTHING — edit blast radius

**82 pages on the site quote constitutional text verbatim.** This is not an ordinary document where prose can be freely improved.

| Tier | Provisions | Meaning |
|---|---|---|
| 🔴 **RED** | 22 | Quoted in **published in-world fiction** — news, NRS records, SC opinions. Rewording retroactively falsifies published record. |
| 🟠 **AMBER** | 64 | Quoted in quicksheets/scenarios — ours to edit, but each reword means chasing every quoting page. |
| 🟢 **GREEN** | 90 | Quoted nowhere. Free to edit. |

**The collision that matters:** §13.1 and §13.2 are simultaneously the **strongest consolidation candidate** (132 duplicated words) and the **two most-quoted provisions in the project** — §13.2 on 14 pages, §13.1 on 11, including published NRS records and news pieces. Consolidating them ripples into ~25 pages, several of which are in-world documents that cannot be quietly rewritten.

Same trap on §15.5.a: 469 words, 10 outbound refs, the longest sentence in the document — and quoted on 6 pages including `torenthia-sc-002.html`, the Supreme Court opinion whose entire reasoning turns on the exact words "different defined portion." §10.1 is quoted verbatim inside sc-001's majority opinion.

**Consequence: the worst-written provisions and the least-editable provisions are substantially the same provisions.** Any plan that ignores this produces either wasted work or broken canon. Hence Pass 0.

---

## 3. THE METHOD — six passes, concept-first

Article-by-article is rejected for the reason you suspected: duplicated rules live in *different* articles (§1.13↔§10.2 are nine articles apart), so a sequential read structurally cannot see them, and it forces the same convention judgment to be re-litigated twenty times.

### Pass 0 — Blast-radius map *(mechanical, no judgment)*
Generate the per-provision RED/AMBER/GREEN table and attach it to every later pass, so no edit is ever proposed without its ripple cost visible. Already prototyped; output exists.

### Pass 1 — Recent-amendment redundancy audit *(small, first, because it may moot other work)*
Tests your actual hypothesis directly. The recent additions — **§14.5, §2.18, §5.1.a, §15.10, §2.16** — get read against their neighbors specifically for restatement. §2.18 already carries the line "This section confers no authority beyond that already held under §2.1 and §2.5," which is a disclaimer admitting it overlaps two other provisions. That is exactly the smell you described. If a recent addition turns out to be substantially absorbed by an existing provision, that is a finding worth having **before** spending effort polishing its prose.

### Pass 2 — Conventions sweep *(highest leverage: ~5 decisions → ~60 provisions)*
One ruling each, applied document-wide:
1. **NRS publication.** Is there a general rule in Article X that makes local restatement unnecessary? Where a local mention does real work (specifying timing, content, or who publishes), standardize to one phrasing.
2. **"defined by statute / not to exceed N."** One canonical form.
3. **"same or substantially similar grounds."** One canonical form.
4. **Negative-scope disclaimers.** A house rule for when one earns its place versus when it is noise. (Real test: does removing it change any outcome?)
5. **Belt-and-braces phrases.** Same test.

Deliverable is a one-page conventions sheet plus the mechanical list of provisions each ruling touches. Every later pass applies the sheet rather than re-deciding.

### Pass 3 — Parallel-structure clusters *(5 decisions, blast radius attached)*
Per cluster, one judgment: keep the symmetry (readable, conventional, and safe) or consolidate. My going-in view: **keep §13.1/§13.2 as they are** — the consolidation gain is 132 words against a ~25-page ripple into published fiction, which is a bad trade. §2.5↔§2.9 and §1.13↔§10.2 are better candidates. This is the one pass that edges toward structural change, so each is yours to call.

### Pass 4 — Heavy-provision surgery *(sentence-level only)*
The 10 provisions over 440 words and the 10 longest sentences. No rule changes — splitting a 75-word sentence and cutting throat-clearing. GREEN provisions first, so progress is real before touching anything with a ripple.

### Pass 5 — Coherence and integrity sweep *(last, because editing moves the target)*
The "illogical, inconsistent, wrong, incoherent" mandate. Focus on the hub provisions everything else leans on — **§1.19 (14 inbound), §15.2 (14), §9.1 (13), §4.5 (11), §1.6 (10)** — checking that each still says what its referrers assume, plus full cross-reference integrity via `check-consistency.py`.

---

## 4. DECISIONS I NEED FROM YOU

1. **Pass order.** Proposed 0→1→2→3→4→5. Pass 1 is deliberately first because it tests your stated hypothesis and could shrink the rest.
2. **RED-tier policy.** Three options: (a) freeze RED provisions entirely this pass; (b) allow edits only where every quoting in-world piece still reads true; (c) allow edits and accept retconning published pieces. I'd recommend (b).
3. **Changelog policy.** `constitutional-history.html` documents every change publicly. An editorial pass touching ~60 provisions either floods that record or needs a single summary entry. My recommendation: one combined entry framed as an editorial consolidation, with substantive changes (anything from Pass 1 or 5) getting their own entries as usual.
4. **Session shape.** This is roughly 4–6 working sessions. Worth deciding whether it runs on weekends only, like the backend work, or displaces content days.

---

## 5. MECHANICS (unchanged from established workflow)

`constitution_data.json` is source of truth → `npm run sync` regenerates `docs/constitution-current.md`, `docs/constitutional-quickref.md`, `search-index.js` → `annotated.html` needs matching manual edits (anchor convention `s<article>-<section>`, letter suffix with **no** hyphen) → `scripts/check-consistency.py` must return "All consistent. Safe to push." → changelog entry per policy decided above.

**Added requirement for this pass:** after any provision edit, re-run the verbatim-quote scan so a reworded provision never silently orphans a quicksheet, scenario, or in-world quotation. That scan is the thing standing between an editorial pass and a canon break.
