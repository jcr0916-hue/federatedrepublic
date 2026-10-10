# Constitutional Design Principles — Review Reference

**Status:** working reference, assembled 13.09, expanded 19.09, worked examples re-verified
against the live text 10.10. The twelve principles have been in active use across
scenarios, amendment rationales, and design sessions, but had never been written down in one place. This
document reconstructs them from actual usage in `scenario-the-ledger.html`,
`scenario-the-classification.html`, `constitutional-history-archive.html`, and prior design sessions.

**Re-verified 10.10.** The text-economy review (28,615 → 25,828 words) moved, merged, or deleted much of
the text the earlier examples cite. Provision numbers below are those of the live text on 10.10; where a
finding refers to text that has since moved, the old and new locations are both given. Rules set by John
during that review are marked **(added 10.10, John)** and are logged with their applications in
`docs/TEXT-ECONOMY-REVIEW.md`. For those rules, John's decision and the applications taken from the
review log are the content of record; the surrounding rationale, the "test question" lines, and the
cross-references between rules were drafted here on 10.10 and need his confirmation.

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
bundle was resolved at some point and the example no longer illustrates anything. A resolved instance
of the same defect is on record: §1.7 had bundled medical autonomy with the privacy-and-search rules,
and the bundle protected the home twice under two different standards (`constitutional-history.html`,
session 260720).*

*Live instances, 10.10.* The text-economy review ran this test across every article and found the
defect at scale — one rule stated in two or three places that could drift apart under later amendment:
- **Acting order during incapacity** — stated in then-§2.5(6), then-§2.9(6), and (with a third tie rule)
  §2.6.a(2). Now one statement in §2.16(1), covering both Consuls. (This is also the Process Symmetry catch below.)
- **Publication to the NRS** — restated provision by provision. Now a general rule: §10.1(2) publishes
  every constitutional act, order, finding, certification, designation, declaration, and determination as
  a permanent record, and "no provision need state this obligation individually." The 10.10 pass removed
  or shortened 61 clauses (about 330 words) **(added 10.10, John)**. It kept the phrase only where
  publication carries its own timing or is a condition of effect, or covers items outside §10.1(2)'s list
  (financial disclosures, minority reports, staff publications, private filings).
- **Institutional capacity** — "shall maintain a body capable of performing the function" was stated
  separately for legislative bodies (§3.8) and independent agencies (§3.9). One general sentence in §3.10
  now covers any institution the Constitution assigns a function to.
- **Expulsion** — stated three times (§3.2, §3.5, §3.4). Now once, in §3.4.
- **Non-derogable tags** — §1.3 and §1.4 each carried "This right is non-derogable under §1.19.a."
  §1.19.a lists the six rights and is the home; both sentences are deleted.

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

*Second catch in the same provision, 10.10.* The carve-out for "civic obligations lawfully required of
citizens by the Legislature — including …" was an open category: the examples did not bound it, so a
Legislature could add new compulsory civic duties and call them civic. The live text closes the list —
labor required of a person convicted of an offense by a court, jury service, military conscription, and
civil emergency duties lawfully required of citizens — and the Legislature cannot add to it.

**Pattern worth naming — self-defeating delegation.** Where this test meets Graceful Degradation: a
limit on the Legislature whose only activation is a statute the Legislature must pass. Absent the
statute the limit does not bite, and the body that would be constrained is the body that must act.
Two live instances found 19.09, resolved differently on 260926:

- **§7.10(4) — resolved.** The gift prohibition was keyed to a "de minimis threshold defined by
  statute" that might never exist. Fixed with the statute-primary-plus-floor pattern first used at the
  then-§2.5/§2.9 tiebreaker gaps (since replaced there by a direct rule in §2.16(1)): the threshold
  defaults to zero until a statute sets one — in the live text, "absent such statute, the threshold is
  zero." The following sentence already made official-capacity gifts Republic property regardless of
  statute, so the fix closes the remaining personal-gift gap.
- **§8.4 — left open, by choice.** Public campaign financing "shall" be established by statute, with
  no deadline and no consequence for never acting — the same shape as §7.10(4). But §8.4's own text
  ("the Elections Panel administers the system and publishes annual compliance findings") presumes the
  statute is already enacted and running, so the gap is theoretical rather than live: nothing is
  currently un-bitten. No constitutional floor was added; a floor here would mean inventing a fallback
  financing mechanism or deadline the Constitution doesn't otherwise need. Recorded so it isn't
  rediscovered as a fresh finding. Unchanged by the 10.10 review.

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
*Attested catch, 19.09 — this test found and fixed a real gap. The then-§2.5(6)(iii) resolved a tie on
equal continuous service by deferring entirely to statute, with no constitutional fallback, while the
exactly parallel then-§2.9(6)(iii) resolved it self-executingly ("the oldest by age holds the office").
With no tiebreaker statute enacted, acting Civic Consul authority was indeterminate at the moment the
office needed filling. §2.6.a(2) carried the identical gap. Both were given a floor on 19.09.*
*Resolved at the root, 10.10. The three acting-order provisions were collapsed into one rule in
§2.16(1) — acting authority vests in the Speaker of the Consul's chamber, then in statutory successors,
then in "the most senior member of that chamber by continuous service, ties resolved by age" — so the
floor is now the rule rather than a patch behind a statute. §2.6.a(2) reads the same way. A related tie
in §2.6.a(4) (a tie that would put more than four candidates on the national ballot) is now settled
directly: "greater continuous service controls." The case where votes and continuous service are both
tied remains second-order and bounded, and was not raised in the 10.10 review.*
*Scan note, 19.09: all 129 statutory delegations were checked for this. Most are correctly pitched and
need nothing. §10.1(4) supplies a global fallback for publication timing — "Otherwise a constitutionally
required record is published as soon as possible" — which alone rescues roughly twenty delegations that
look exposed in isolation. Since 10.10 it has a companion in §10.1(2), which publishes every
constitutional act without any provision needing to say so; the 10.10 NRS pass relied on that pairing
and kept any clause that carried its own timing or condition of effect. The genuinely exposed remainder
on 19.09 was small: §15.3(2) (Remediation Plan clock on the devolution ladder), §9.8 (pool restoration
clock), §11.1 (no deadline to establish the emergency procedure). Resolved differently on 260926:*

- **§15.3(2) — fixed.** The Remediation Plan clock sits inside the mandatory-devolution ladder, which is
  already live once a State fails an audit — not a hypothetical delegation. Given a floor: 90 days until
  statute defines the period, reusing §15.2(6)'s existing 90-day figure for the same kind of interim
  window rather than inventing a new number (Process Symmetry).
- **§9.8 — left as-is on 260926; the clause itself deleted 10.10.** Unlike the other two, this one
  already had graceful degradation built in: the responsible Monitor publishes a compliance breach as
  soon as a pool falls below five (§9.8(4)), regardless of statute, and §9.8(5) gives the actual worst
  case a separate, statute-independent fallback — the Elections Panel conducts an expedited eligibility
  review to restore the pool. A missing restoration "period" degraded to sustained public findings, not
  silence or collapse. On 10.10 the exposed clause was removed outright: it told the nominating bodies to
  restore the minimum "within the period defined by statute," but nominating bodies do not add pool
  members — the Elections Panel does, under (5). The statute-dependent clock is gone and nothing
  depended on it.
- **§11.1(6) (then §11.1(8)) — fixed, but not with a deadline.** The gap here wasn't a missing clock, it
  was a missing actor: the substantive safety rails (no changes to electoral rules, timelines, or NRS
  permanence; 72-hour expiration) were already written into the sentence, but nothing let a panel act
  on them before the Legislature built the procedure. An imminent security threat doesn't wait for
  legislative convenience, so this was the Bad-Faith Test's "assume the thing you're worried about
  actually happens," not a Graceful Degradation clock question. Fix: until the statute exists, the panel
  may adopt such a measure by majority vote of its own seated members — reusing the same majority-vote
  mechanism §11.1(7) (then (9)) already uses for Acting-member designation, not a new decision
  procedure. 10.10 tightened it further: the ratification clause was replaced with "a panel may adopt a
  further measure only on a fresh published determination of an imminent threat," the same
  fresh-determination pattern §2.11 uses for renewal.

**Limit — a fallback needs no fallback of its own  (added 10.10, John).** The test asks that every
provision define its failure state. It does not ask that the failure state define *its* failure state.
Where a mechanism already exists to catch the failure of a primary process, keep the mechanism and its
outer limit, and trust the officials who run it. Without this stop the test recurses — every backup
acquires a backup, then a backup to the backup — and the added machinery becomes the largest body of
text that is never exercised. Applications from the 10.10 review:
- **§2.6.a(5) — sole-candidate failure state, declined.** §2.6.a (Acting Civic Consul, nominating ballot,
  national ranked-choice election) is already the backup for the Assembly's failure to elect. A further
  failure state for the backup was proposed and declined. Instead (5) was cut to its core: the Elections
  Panel administers the national election within the period defined by statute, with a constitutional
  default of 45 days and an absolute maximum of 90.
- **§15.5.a(2) — the JMC's missed deadline.** The 90-day assessment with one 30-day extension was
  followed by a same-week individual-vote procedure for the case where even that lapsed. Replaced by a
  default: where the JMC does not publish within the period, "the remaining portion is treated as not
  satisfying those conditions." Same outcome as the old all-abstain case, without the procedure.
- **Former §10.1(8) — NRS restoration.** A requirement that the Legislature establish permanent
  restoration obligations by statute within 90 days of the parallel-system threshold was deleted. The JM's
  parallel authentication system (now §10.1(7)) is the fallback for NRS failure; it does not get one too.

What the limit does not touch: a primary mechanism still needs its failure state. §4.4.a's public
confirmation route (Senate fails to vote → public confirmation) and §2.6.a's formation cascade remain
exactly what the test asks for.

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
**Standing default (added 10.10, John): publication is a general rule, not a per-provision duty.**
§10.1(2) publishes every constitutional act, order, finding, certification, designation, declaration, and
determination as a permanent record, and "no provision need state this obligation individually." In
review, ask the Transparency question only about what falls outside that list — financial disclosures,
minority reports, staff publications, private filings — or where publication carries its own timing or
is a condition of effect. For everything on the list the answer is already yes, and restating it
provision by provision is a One Home defect, not an added safeguard.

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
*Live-text note, 10.10: the ceiling is now stated once — 25 years from original classification, with a
single 5-year extension on a published justification — and the separate "30 years under any
circumstances" sentence is deleted as the arithmetic of the two (the same cut made to §1.13's 15-year
sealing limit). The effective ceilings, and automatic publication on expiry within 30 days with no
further government act, are unchanged.*

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
*Live instance found 19.09, in exactly that place; resolved 10.10.* The then-§2.5(6)(iii) and
then-§2.9(6)(iii) reached the same outcome on the same problem — a tie on equal continuous service
resolves to the oldest by age — but by two different architectures. §2.9 stated the rule directly and
self-executingly; §2.5 routed through statute, with the age rule as a floor behind it. Same function,
same result, two procedural shapes. The divergence was an artifact of the order they were drafted and
amended in, not a difference in role or risk, which is precisely what this test is for. The 10.10 review
made them match by giving the rule one home: the Civic and Legat acting orders are now a single
statement in §2.16(1), "ties resolved by age."
*The same sweep made age the Constitution's one seniority tiebreak.* "Ties are resolved by age" now
appears in §2.6.a(2), §2.9(2), §2.16(1), §4.4(4) (Temporary Associate Justice), and §11.1(5) (panel
Chair). Two further provisions were brought into line on 10.10: §9.1.d's pool-tenure tie, previously
"defined by statute," now "resolved by age"; and the panel Chair tie, previously "by lot conducted by the
JMC," now by age. Each change is a Process Symmetry fix — the same kind of tie, the same answer — not a
policy change.
*Pass example, same review.* The three Monitor Generals are selected three different ways — the LM
nominated by the SC, the EM jointly by the two Speakers, the JM by public lottery (§9.3). That
divergence is principled rather than arbitrary: §9.2 requires each Monitor General be selected through a
process that "excludes the institution subject to that Monitor's oversight from controlling the
selection," and each method is what that constraint produces for its branch. A textbook case of
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
- §1.8 — "no exigent-circumstances exception." **Retired 13.09; reason no longer in the text, 10.10.**
  The flag was retired because the provision then said the Legislature establishes the warrant
  framework by statute — a sentence that delegated the detail. The live §1.8 has no such sentence. It
  states the rule directly: no entry, search, surveillance, or collection "without consent or prior
  independent judicial authorization based on specific, articulable grounds." So the stated reason for
  retiring the flag no longer matches the text. **Open for John:** keep it retired on other grounds
  (for instance, that "judicial authorization" already accommodates emergency procedures), or restore a
  delegation sentence.
- §1.11 — "72 hours may be operationally hard." **Not a constitutional flaw.** Setting the outer
  limit is exactly what constitutional language should do; meeting it is administration. (Live text:
  "within the period established by statute, not to exceed 72 hours.")

**The distinction that survives:** a conflict *between two constitutional provisions* can never be
fixed by statute, so it is always a genuine constitutional finding. A missing implementation detail
usually is not.

**Test question:** if the Legislature could fix this with a well-drafted statute tomorrow, without
amending anything, it is probably not a constitutional defect.

### Two corollaries  (added 10.10, John)

Both were set during the text-economy review and are applications of the same altitude principle: what
the Constitution fixes, and what it leaves with the people who run the system.

**1. The Constitution states outcomes, not technology.**
Constitutional language fixes the property a system must have. How the system achieves it belongs to
the body that runs it and can change as technology does. §11.2 is the worked case. It now names three
required properties — ballot secrecy, public auditability, resilience — together with the data-sharing
bar and "Eligibility verification may not store or expose voter identity within the NVS," and says
nothing about the mechanism. The Citizen Voting Credential and cryptographic-matching sentences were
deleted, and the two-channel delivery sentence became an outcome: "The Elections Panel shall inform
every eligible citizen of their federal races and how to vote before each federal election." The
knock-on edits to §13.1, §13.2, §15.2, and §15.4, which had named the credential, now read
"authenticated through the NVS."
*Test question:* if the technology named here were replaced next decade, would the Constitution need
amending? If so, the provision is naming a mechanism rather than stating an outcome.

**2. Trust elected officials with operating details.**
Where an operating line cannot be drawn in advance without freezing it, keep the concept and its outer
limit and leave the line to the elected officials who must draw it as conditions change. External
intelligence is the worked case (§2.1, §2.3, §2.3.a). The Legat Consul directs *external* intelligence;
no operation may be conducted against citizens inside Republic territory on that authority without
independent judicial authorization (the outer limit). "External" is deliberately left undefined,
because the Civic Consul holds internal intelligence with law enforcement under residual authority and
the government draws the operating line as threats evolve. A definition here would be machinery that
goes stale. §2.11 (Emergency Governance) is logged on the same footing — "deliberately open" (10.09),
passed unchanged in the 10.10 review.
What stays fixed is the power's boundary and who checks it (the Actor Test), not the day-to-day line.
This is the companion to the fallback limit under the Graceful Degradation Test: both stop the reviewer
from asking the text to do the officials' job.

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

*Standing rules applied at each step, added 10.10 (John):* at step 1, does the provision state an outcome
rather than a technology, and does it leave the operating line to the officials who must draw it? At step
2, is this a publication duty that §10.1(2) already covers? At step 3, stop at one fallback — a fallback
does not need its own.

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
