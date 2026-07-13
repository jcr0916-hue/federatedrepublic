# Succession Eligibility Principle — DESIGN FINDING (captured 260713, NOT yet drafted)

**Status:** Design finding from a devil's-advocate + mirror-test discussion. NOT yet
an amendment. Needs the full deliberate treatment (stress test → draft → approve →
implement with changelog + "Amendment:" post). Do NOT fold into a readability push —
readability pushes are provably lossless (zero words changed); this is substantive.

## The hole John found (LC / Senate Speaker)
- §2.1: the Legat Consul serves "a single, non-renewable term of six years" — ABSOLUTE bar,
  one term ever, never again by election.
- §2.9(1): the Senate Speaker succeeds to the office of LC automatically, "instantaneous and
  self-executing by constitutional operation" — NO eligibility check at the moment of succession.
- THE EXPLOIT (John's Putin scenario): a former LC (barred forever) wins an easy Senate seat in
  a favorable state, their faction (Senate majority) makes them Speaker, the sitting same-faction
  LC steps down, and the former LC succeeds back into FULL LC authority for the remainder of the
  term — flouting §2.1's non-renewable limit through the succession back-door. Unlikely, but a
  textbook authoritarian term-limit-circumvention move (cf. loyalty/fear capture of one chamber).
- "Otherwise qualified" does NOT carry the water: §2.9 has no such clause; succession is
  unconditional on Speaker status. Nothing mediates §2.1 vs §2.9.

## The US precedent (John's analogy — the right frame)
12th Amendment: "no person constitutionally ineligible to the office of President shall be
eligible to that of Vice President." The succession office (VP) inherits the destination office's
(President) eligibility bar. A two-term former President cannot be VP, precisely because VP's
purpose is succession to the Presidency. Same structural logic applies here — and the danger is
SHARPER, because the Senate Speakership is a legislative office in another branch, cheaply captured
by one faction in one chamber (vs. a national VP nomination).

## The mirror test (CC / Assembly Speaker) — WHY THE PRINCIPLE IS SOUND
Tested whether the same fix mirrors to the CC side. It does NOT bite the same way — and that's
the concept validating itself as correctly specific, not blindly universal:
- CC limit (§2.5(2)) is NOT absolute: 6 consecutive / 8 cumulative (lifetime), WITH an explicit
  return path ("may be elected or designated Civic Consul" again after cooling-off). The CC office
  was DESIGNED to be re-holdable. The "barred forever sneaking back" premise doesn't exist.
- The Assembly Speaker only ever becomes ACTING CC (§2.5(6), §2.6.a(2)) — "authority limited to
  maintaining existing policy," "may not exercise any legislative function," ends when a CC is
  elected. NEVER full CC authority. There is no CC analog to §2.9(1)'s full instantaneous succession.
- §2.5(2) already guards the back-door: "may not be elected OR DESIGNATED" reaches beyond election;
  the 8-year cap is a lifetime maximum counting "all periods of service."
- CONCLUSION: the LC hole is real (absolute bar + full succession); the CC "mirror" is mostly not a
  hole (re-holdable office + acting-only Speaker + "designated" language + lifetime cap). Only edge:
  a former CC who has hit the 8-YEAR LIFETIME CAP acquiring even Acting CC authority via the Assembly
  Speakership — tiny exposure, likely already covered, worth confirming not overhauling.

## The principle to adopt (the correct universalization)
NOT "bar term-limited people from stepping-stone offices" (over-restricts; wrongly bars eligible
former CCs from the Assembly Speakership). NOT redefining "otherwise qualified" (muddies a clean,
widely-used term with hidden transitive baggage).
INSTEAD — the 12th-Amendment framing, keyed to INELIGIBILITY, not to specific offices:

  "Where this constitution renders a person ineligible to hold an office, no election, succession,
   elevation, designation, or automatic assumption may place that person in the office or in an
   acting exercise of its authority; the role passes to the next eligible person in the applicable
   order."

This self-adjusts: bites hard where the destination bar is ABSOLUTE (LC), stays quiet where the
office is legitimately re-holdable (CC). Keyed to ineligibility, so it extends to ANY future
term-limited office with no further drafting. Likely home: §7.4 (already houses universal
office-holding bars) or a standalone principle; plus confirm §2.9's skip-to-next-Senator fallback
(§2.9(2)) handles the LC case operationally.

## OPEN QUESTIONS FOR THE STRESS TEST (before drafting — do NOT skip)
1. Does "or in an acting exercise of its authority" ever create a GAP — a moment where the barred
   Speaker can't act and there's no defined next-in-line for the ACTING role? §2.9(2) gives the
   Senate order for full LC succession; does the CC/Assembly acting role (§2.5(6)/§2.6.a) have an
   equivalent order to pass to, or would the bar create a vacuum? (§2.6.a already has "no Speaker ->
   most senior member" — check if that covers an INELIGIBLE Speaker too.)
2. What exactly does "next eligible person in the applicable order" resolve to in EACH chain? Confirm
   each succession/acting chain HAS a defined order this can reference.
3. Interaction with §7.4's existing bars (4 convictions + removal cooling-off): this clause would
   also govern those. Intended and clean, or does it double up with existing §7.4 language?
4. Does barring the LC-ineligible person from SERVING AS Senate Speaker (vs. just skipping them in
   succession) matter? John's lean (correct): the political-capture risk means skip-and-pass-down
   may be insufficient — a former LC sitting in the Speaker's chair with a captured chamber has too
   many moves. Consider whether the cleaner fix is a TARGETED bar on holding the Speakership itself
   when ineligible for LC (direct 12th-Amendment style: "A person ineligible to hold the office of
   Legat Consul under §2.1 may not serve as Senate Speaker"), vs. the general skip-in-succession
   clause, vs. BOTH. Decide consciously.
5. Symmetry decision: do we add a parallel targeted bar on the Assembly Speakership for a former CC
   who has hit the 8-year LIFETIME cap (destination-ineligible), or does the general clause + acting-
   only nature make that unnecessary? Confirm, don't assume.

## Workflow when activated
Devil's advocate → adversarial stress test (answer Q1-5) → draft language → John approves WORDING →
DOCX/JSON/annotated/search-index/parity → changelog entry ("Constitutional") → "Amendment:" social
post (mind cadence) → verify landed against fresh clone.

---

## UPDATE (260713, same session) — the fallback order ALREADY EXISTS; fix is cleaner than feared

John's observation: the line of succession beyond the Speakers is already left to the chambers/
statute, AND there should always be a Speaker. Checked against text — this resolves most of the
gap worry and points to the elegant fix:

- **§2.9(2) already provides a constitutional floor beyond the Speaker:** "Where the Senate Speaker
  is simultaneously unable to serve, the most senior Senator by continuous Senate service holds the
  office" (oldest by age breaks ties). §2.9(3) lets statute/standing order extend the line further.
  So "the next eligible person in the applicable order" EXISTS for the LC side — open Q2 answered.

- **The subtle point (this shapes the fix):** §2.9(2) currently triggers on the Speaker being
  "unable to serve." An INELIGIBLE former-LC Speaker is NOT "unable to serve as Speaker" — they
  serve as Speaker fine; they're only barred from SUCCEEDING TO LC. So the fix must add: when the
  Speaker is ineligible to hold the LC office, succession passes AS IF the Speaker were unable to
  serve — routing to the §2.9(2) senior-Senator floor.

- **This resolves the bar-the-Speakership tension (both John's earlier lean and Claude's pushback):**
  DO NOT bar a former LC from being Senate Speaker. Let them hold it (lead the chamber, legislative
  job intact). They are simply PASSED OVER in LC succession — exactly as §2.9(2) already passes over
  a Speaker "unable to serve." No new machinery; connect the ineligibility bar to the existing floor.
  No governance vacuum (open Q1 largely resolved: the fallback order is constitutional, not dependent
  on the Speakership being empty; and there's always a Speaker).

- **Preferred fix shape now:** the universal ineligibility clause + a targeted hook in §2.9 so that an
  LC-ineligible Speaker is skipped and succession passes under §2.9(2). Likely NO separate "can't be
  Speaker" bar needed. (Still confirm at stress-test whether a targeted Speaker bar adds anything, but
  lean is: skip-and-pass-down is sufficient and less restrictive.)

- **Residual question John should decide consciously (stress test):** skip-and-pass-down stops the
  FORMER LC PERSONALLY from returning (closes the Putin "same person, longer" move — the actual fear).
  It does NOT stop a loyal FACTION from installing a pliable successor (senior Senator may be a
  factionmate). That broader "faction control" worry is different, arguably unsolvable by any
  succession rule, and partially addressed already by the LC single-term design. Claude's read: John's
  real target is the former-LC-personally circumvention, which skip-and-pass-down fully solves. Confirm.

---

## SCOPE DECISION (260713, John) — the faction problem is OUT OF SCOPE, by design

John's ruling on the residual "faction control" question: "The faction problem is not something
this constitution can fix. If the institutional hold is that bad it's a failed or at least failing
document."

This is the correct constitutional-realism boundary and it SETTLES the scope of this amendment:

- **What the succession-eligibility principle targets (bounded, text-enforceable):** the FORMER
  OFFICEHOLDER PERSONALLY circumventing their own term limit — the Putin "same person, longer" move
  via the Speakership → succession back-door. Skip-and-pass-down (route around the ineligible person
  to the §2.9(2) floor) fully closes this. THIS is the fix.

- **What it does NOT target, deliberately:** a loyal FACTION installing a pliable successor. That is
  total institutional capture, not a procedural defect. A constitution constrains PROCEDURES, not
  LOYALTIES. If one faction holds the Senate majority + Speakership + sitting LC + succession line
  simultaneously, the document has ALREADY failed — no clause saves you, because the actors who'd
  enforce the clause are the captured ones. Writing a clause to "fix" this would be a dead-letter /
  impossible-threshold provision — the exact pathology John already rejected (cf. the amendment-level
  popular-recall he called "impossible to the point of being unnecessary").

- **Where the anti-capture defense ACTUALLY lives (not in a succession clause):** the electorate; the
  permanent public NRS record (§10.1) and mandatory disclosure regime (§8.1) — sunlight defeats capture
  by making it VISIBLE, not by procedurally blocking it; the Monitors; independent judiciary; free
  press. These work by exposure and friction, not by a "thou shalt not capture" rule.

- **Governing principle for THIS and FUTURE amendments:** constitutions are parchment barriers against
  ORDINARY bad faith (opportunists, norm-eroders, marginal rule-benders), NOT against TOTAL capture.
  Don't write clauses that only work if the thing they guard against hasn't already happened. Aim
  procedural rules at procedural targets. This disciplines scope: the succession fix stays narrow and
  clean, aimed only at individual circumvention.
