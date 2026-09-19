# Constitutional Design Principles — Review Reference

**Status:** working reference, assembled 13.09, expanded 19.09, worked examples re-verified
against the live text 19.09. The twelve principles have been in active use across
scenarios, amendment rationales, and design sessions, but had never been written down in one place. This
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
*Retired 19.09: the standing example here was §1.9 bundling voting rights with marriage and family
formation. Re-checked against the live text — §1.9 is now purely democratic participation, so the
bundle was resolved at some point and the example no longer illustrates anything. No replacement
example found; the current text did not surface another instance.*

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
**Resolved 19.09.** The carve-out now requires conviction by a court, and labor for the benefit of a
private party requires the person's consent. Recorded here because the finding, not just the fix, is
what this test is for. As it stood: §1.4 is one of the six
non-derogable rights under §1.19.a. The document declares it absolute and forbids derogating it in any
emergency, then leaves the Legislature an unconditioned definitional exit: no compensation floor, no
voluntariness requirement, no limit on hours or conditions, no bar on labor for private profit. The
neighbouring carve-outs are bounded by enumeration; this one is bounded by nothing. An emergency cannot
touch this right, but an ordinary statute can hollow it out — which makes it a conflict between two
constitutional provisions rather than a missing implementation detail.

**Pattern worth naming — self-defeating delegation.** Where this test meets Graceful Degradation: a
limit on the Legislature whose only activation is a statute the Legislature must pass. Absent the
statute the limit does not bite, and the body that would be constrained is the body that must act.
Live instances found 19.09: §8.4 (public campaign financing "shall" be established by statute, with no
deadline and no consequence for never acting) and §7.10(4) (gift prohibition keyed to a "de minimis
threshold defined by statute" that may never exist; partly mitigated by the following sentence, which
makes official-capacity gifts Republic property regardless of statute).*

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
*Attested catch, 19.09 — this test found and fixed a real gap. §2.5(6)(iii) resolved a tie on equal
continuous service by deferring entirely to statute, with no constitutional fallback, while the exactly
parallel §2.9(6)(iii) resolved it self-executingly ("the oldest by age holds the office"). With no
tiebreaker statute enacted, acting Civic Consul authority was indeterminate at the moment the office
needed filling. §2.6.a(2) carried the identical gap. Both now state a floor. A related tie in §2.6.a(4)
was reviewed and deliberately left to statute: it is second-order, reachable only where vote counts and
continuous service are both tied, and its consequence is bounded.*
*Scan note, 19.09: all 129 statutory delegations were checked for this. Most are correctly pitched and
need nothing. §10.1(4) supplies a global fallback for publication timing — "Otherwise a constitutionally
required record is published as soon as possible" — which alone rescues roughly twenty delegations that
look exposed in isolation. The genuinely exposed remainder is small: §15.3(2) (Remediation Plan clock on
the devolution ladder), §9.8 (pool restoration clock), §11.1 (no deadline to establish the emergency
procedure).*

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

## FAMILY D — "Does this process feel like it belongs to the same Constitution?"

Tests for procedural coherence across the document. They do not require every mechanism to be identical;
they require differences to be deliberate rather than accidental.

### 11. Process Symmetry  [CORE]
**Canonical form:** where constitutional functions are materially similar, their procedures should be
materially similar unless a meaningful difference in role, legitimacy, consequence, or risk requires
divergence.
**Asks:** if two constitutional mechanisms perform the same kind of function, do they follow the same
basic architecture unless there is a real constitutional reason not to?
**Catches:** arbitrary procedural divergence; parallel offices governed by unrelated rules; hidden
policy choices created simply because one process was drafted at a different time from another.
*Standing example: Civic Consul and Legat Consul incapacity procedures should mirror one another where
the constitutional problem is the same, with differences only where the offices' roles or succession
structures actually require them.*
*Live instance found 19.09, in exactly that place.* §2.5(6)(iii) and §2.9(6)(iii) now reach the same
outcome on the same problem — a tie on equal continuous service resolves to the oldest by age — but by
two different architectures. §2.9 states the rule directly and self-executingly; §2.5 routes through
statute, with the age rule as a floor behind it. Same function, same result, two procedural shapes. The
divergence is an artifact of the order they were drafted and amended in, not a difference in role or
risk, which is precisely what this test is for. Worth deciding whether they should be made to match.
*Pass example, same review.* The three Monitor Generals are selected three different ways — the LM
nominated by the SC, the EM jointly by the two Speakers, the JM by public lottery. That divergence is
principled rather than arbitrary: §9.1 requires each Monitor be "selected by bodies other than those it
oversees," and each method is what that constraint produces for its branch. A textbook case of
difference reflecting constitutional purpose.

### 12. Procedural Familiarity  [CORE]
**Canonical form:** constitutional procedures should reuse familiar actors, thresholds, stages, and
failure mechanisms so that citizens can recognize the structure of a process even where its application
differs.
**Asks:** does this process use the Constitution's established procedural grammar, or invent a new one
without a meaningful reason?
**Catches:** one-off machinery; unnecessary new thresholds; unfamiliar decision stages; bespoke
fallbacks where an established constitutional mechanism would do the same work.
**Review rule:** differences should reflect constitutional purpose, consequence, legitimacy, or risk —
not novelty for its own sake.

**Shared test question:** *Does this process feel like it belongs to the same Constitution?*

**Working distinction:** Process Symmetry compares two materially similar functions to each other.
Procedural Familiarity asks whether any process, even a unique one, is built from recognizable pieces of
the Constitution's existing procedural language. In shorthand: **similar function, familiar process;
different process only for a meaningful reason.**

---

## DRAFTING-LEVEL PRINCIPLE  (added 13.09, John)

**Not one of the twelve** — this operates on a different axis. The twelve ask whether a provision is
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
5. **Family D** — does its procedure match comparable functions and reuse familiar constitutional machinery?
6. **Internal consistency** — does it contradict itself, or any other provision?

**Open boundary questions — already flagged in standing notes, still unresolved:**
1. **Actor Test vs Institution Test** may be *sequential* rather than parallel — Institution Test
   asks whether the body should exist, Actor Test asks whether its power is bounded. That may be one
   pipeline, not two tests in different families.
2. **Sunlight Test vs Transparency Test** may collapse into a single test. Current working split:
   transparency = a record exists now (NRS); sunlight = concealment eventually ends.
3. **Bad-Faith Test may be a subspecies of Graceful Degradation** — bad-faith exploitation is
   arguably just one category of failure state.

None of this has been run through a structured analytic technique. The Twelve Tests are themselves the
first paper in the design-rationale series, and that paper is where the clustering should be settled
rather than assumed.
