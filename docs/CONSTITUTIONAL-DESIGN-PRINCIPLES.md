# Constitutional Design Principles — Review Reference

**Status:** working reference, assembled 13.09. The ten principles have been in active use across
scenarios and amendment rationales for months, but had never been written down in one place. This
document reconstructs them from actual usage in `scenario-the-ledger.html`,
`scenario-the-classification.html`, `constitutional-history-archive.html`, and prior design sessions.

**Confidence marking is deliberate:**
- **[ATTESTED]** — named and applied in existing published content; definition drawn from that usage.
- **[CORE]** — a compressed canonical definition already existed in standing project notes; that
  definition governs and is quoted verbatim. Anything beyond it here is elaboration, not authority.
- **[RECONSTRUCTED]** — no canonical definition exists; the definition here is inferred and needs
  John's confirmation.

The three-family clustering below is a **hypothesis**, not settled doctrine. It has never been run
through a structured analytic technique to confirm the groupings hold.

---

## FAMILY A — "Does this need to exist at all?"

Tests applied *before* asking whether a provision is well-drafted. They ask whether it should be in
the document.

### 1. One Home Rule  [RECONSTRUCTED]
**Asks:** does each subject live in exactly one place?
**Catches:** a provision covering two unrelated subjects; a subject scattered across several
provisions; duplicate treatment that can drift apart under later amendment.
**Review use:** if a provision needs "and also" to describe what it covers, it may be two provisions.
*Example flagged in Article I review: §1.9 bundles voting rights with marriage and family formation —
unrelated subjects sharing one home.*

### 2. Institution Test  [RECONSTRUCTED]
**Asks:** does this body need to exist as a distinct institution, or is it a function some existing
body could hold?
**Catches:** institutional proliferation — new offices created for problems an existing office
already covers.

### 3. Unique Function Test  [RECONSTRUCTED]
**Asks:** does this institution do something no other institution does?
**Catches:** overlapping mandates, which produce either turf conflict or mutual buck-passing. Closely
related to the Institution Test but distinct: an institution can be *needed* (Institution Test) while
its specific granted function duplicates another's.

---

## FAMILY B — "Assume bad faith. Then what?"

Tests that stop asking how a provision performs when everyone behaves well, and ask how it performs
when they don't.

### 4. Bad-Faith Test  [ATTESTED]
**Asks:** what does an actor who wants the wrong outcome do with this text?
**Catches:** provisions that work only on cooperative assumptions.
*Example flagged in Article I review: §1.4's prison-labor carve-out is unconditioned — assume a
legislature that wants cheap compulsory labor, and nothing in the provision prevents it.*

### 5. Actor Test  [CORE + ATTESTED]
**Canonical form: holder, check, consequence.**
**Asks:** for every actor this provision touches — who *holds* the power, what *checks* it, and what
*consequence* follows misuse? A provision that names a holder but no check, or a check with no
consequence, fails this test.
**Catches:** critical actors operating with no constitutional standing.
*Attested use: the Monetary Authority was found to be "a critical constitutional actor with no
constitutional actor profile," which drove anchoring the MA Director to the §3.9 independent-agency
framework — pool nomination, Senate 2/3 confirmation, for-cause removal.*

### 6. Graceful Degradation Test  [CORE + ATTESTED]
**Canonical form: every provision must define its failure state.**
**Asks:** when the normal mechanism fails, what happens? Not "is failure unlikely" — what is the
*defined* path when it occurs?
**Catches:** provisions with no answer for their own failure — deadlock, vacancy, missed deadline,
refusal to act.
*Attested pattern: §2.6.a's formation cascade (Assembly fails to elect → Speaker becomes Acting CC),
§4.4.a's Senate bypass (Senate fails to vote → public confirmation route opens), §2.14.a's
coordination failure (executives can't agree → SC petition). Each names its own failure and routes
around it.*
*Example flagged in Article I review: §1.1 does this well — Legislature doesn't fund legal aid →
courts appoint anyway.*

---

## FAMILY C — "Where do legitimacy and visibility come from?"

Tests about the relationship between power and the people it acts on.

### 7. Democratic Legitimacy Test  [CORE]
**Canonical form: pre-political only.**
**Asks:** is direct democratic legitimation being required for a *pre-political* question — one about
the fundamental shape of the polity — rather than for ordinary policy?
**The qualifier is the whole point.** This is not a general "is it accountable?" test. Routing
ordinary policy through direct popular consent is a design error, not a virtue; the test applies
specifically where a decision is irreversible or alters what the polity fundamentally is.
**Catches, in both directions:** pre-political decisions made without direct consent, *and* ordinary
policy over-routed into referenda.
*Connects to the Popular Sovereignty paper candidate — §13.1, §13.2, §17.1/§17.2, §2.13, §9.2/§9.3,
§15.4/§15.6/§15.7/§15.9, §18.4 are the concrete illustrations of this test in action.*

### 8. Transparency Test  [CORE]
**Canonical form: NRS record.**
**Asks:** does exercising this power create a record in the National Record System?
**Catches:** powers exercisable with no contemporaneous published trace. Distinct from the Sunlight
Test: transparency asks whether a record *exists now*, sunlight asks whether concealment *ever ends*.

### 9. Informational Power Test  [CORE + ATTESTED]
**Canonical form: informational authority IS constitutional power — bound it.**
**Asks:** does this provision grant authority over information (collection, classification, access,
publication)? If so, it has granted constitutional power and must be bounded like any other power.
**Catches:** information authority treated as merely administrative and therefore left unbounded.
*Attested use: "the same transparency that binds officials binds the money that seeks them" — the
test running in the citizen's favor.*

### 10. Sunlight Test  [CORE + ATTESTED]
**Canonical form: no permanent withholding; temporary confidentiality requires a ceiling.**
**Asks:** does secrecy have a hard end, reached automatically, without requiring further government
action?
**Catches:** indefinite classification; disclosure that depends on the discretion of the party that
benefits from concealment.
*Attested use, §10.2: "no permanent secrecy, temporary secrecy only on stated statutory grounds, hard
ceilings of 25 and 30 years, and automatic publication on expiry requiring no further government act."
The void rule means "abuse fails retroactively, not just prospectively."*

---

## DRAFTING-LEVEL PRINCIPLE  (added 13.09, John)

**Not one of the ten** — this operates on a different axis. The ten ask whether a provision is
*designed* correctly. This asks whether it is *pitched* at the right level.

**Constitutional language specifies the obligation and its floor. Statute specifies the machinery.**

> "We should specify that it must be provided, not how they provide funding, for instance."

**Catches (in review):** the reviewer asking for statute-level completeness — implementation detail,
exception handling, procedural specifics — and mistaking its absence for a constitutional gap.

**Worked examples from the Article I review, where this principle retired flags I had raised:**
- §1.1 — "where does the money come from?" **Not a constitutional question.** The document says
  courts appoint counsel at public expense; funding mechanics are legislative.
- §1.8 — "no exigent-circumstances exception." **Not a gap.** The provision requires prior judicial
  authorization and says the Legislature establishes the warrant framework by statute. That sentence
  already delegates the detail.
- §1.11 — "72 hours may be operationally hard." **Not a constitutional flaw.** Setting the outer
  limit is exactly what constitutional language should do; meeting it is administration.

**The distinction that survives:** a conflict *between two constitutional provisions* can never be
fixed by statute, so it is always a genuine constitutional finding. A missing implementation detail
usually is not.

**Test question:** if the Legislature could fix this with a well-drafted statute tomorrow, without
amending anything, it is probably not a constitutional defect.

---

## USING THIS IN REVIEW

Suggested order per provision — Family A first, since a provision that shouldn't exist doesn't need
its drafting scrutinized:

1. **Level check** — is this pitched at constitutional or statutory altitude?
2. **Family A** — should this exist here, in one place, as its own thing?
3. **Family B** — what does a bad-faith actor do with it, and what happens when it fails?
4. **Family C** — where does its legitimacy come from, and who can see it operate?
5. **Internal consistency** — does it contradict itself, or any other provision?

**Open boundary questions — already flagged in standing notes, still unresolved:**
1. **Actor Test vs Institution Test** may be *sequential* rather than parallel — Institution Test
   asks whether the body should exist, Actor Test asks whether its power is bounded. That may be one
   pipeline, not two tests in different families.
2. **Sunlight Test vs Transparency Test** may collapse into a single test. Current working split:
   transparency = a record exists now (NRS); sunlight = concealment eventually ends.
3. **Bad-Faith Test may be a subspecies of Graceful Degradation** — bad-faith exploitation is
   arguably just one category of failure state.

None of this has been run through a structured analytic technique. The Ten Tests are themselves the
first paper in the design-rationale series, and that paper is where the clustering should be settled
rather than assumed.
