# §2.6.a Government Formation — Redesign (DECIDED 260712, HOLD publish until 260713 PM earliest)

**Status:** Fully decided in devil's-advocate discussion. NOT yet drafted into DOCX/JSON.
John's instruction: treat as decided, but publish nothing before tomorrow afternoon at the
earliest. Sleep on it. This file captures the decision so it survives compaction / a new chat;
tomorrow, draft the replacement text FROM this spec, get John's approval on wording, THEN touch
DOCX/JSON.

## What it replaces
The current §2.6.a is a FIVE-RUNG cascade: (1) Assembly elects by absolute majority → (2) Speaker
acts (caretaker) → (3) Senate 2/3 designates a member → (4) Legat Consul nominates + Senate
confirms → (5) most-senior-member backstop. Impressive but baroque, and it drags the Senate and
Legat Consul into the domestic executive — in tension with §2.6's "CC is accountable to the Assembly."

## The redesign (all John's, arrived at via devil's advocate)
1. Assembly elects the CC by absolute majority within the period defined by statute (21-day
   constitutional default). UNCHANGED.
2. On failure, the **Speaker acts as Acting CC** — caretaker authority (maintain existing policy
   only), RETAINS their Assembly seat — and the Speaker's acting duty is to **run a straw poll**
   in the Assembly to identify candidates.
3. The **top three** vote-getters in the straw poll advance to a national ballot. A tie for the
   final place extends the ballot, but **never past five**; a tie that would exceed five breaks by
   continuous service (reuse the existing §2.6.a seniority tiebreaker).
4. The **Elections Panel administers a national ranked-choice vote** within a window defined by
   statute, **45-day constitutional default**. Window kept deliberately tight so the caretaker-only
   period stays survivable (fixing the paralysis problem by SPEED, not by expanding Speaker power).
5. The **RCV winner** (plurality / RCV-winner is sufficient — no majority required) becomes CC with
   **full authority**, vacates their Assembly seat under §2.6; the Speaker steps down from acting.
6. A CC installed via this national fallback is **a CC like any other** — removable ONLY by §2.6
   constructive no confidence. NO public role in removal, ever. NO Senate, NO Legat Consul, NO recall.
7. Candidates must be **otherwise qualified** for CC — standard §2.5 / §7.4 eligibility, by
   cross-reference (don't restate).
8. **Reversion always available:** the Assembly electing a CC by absolute majority at any point
   before the national vote concludes terminates the fallback and returns to normal process.

## The design logic (why each choice, so the reasoning survives)
- **Embarrassment is the engine.** The national vote is NOT a mandate — it is the PENALTY for the
  Assembly failing to do its job. The public stepping in IS the rebuke. This is what makes it a
  forcing mechanism, not a bypass: no faction "wins" by stalling, because stalling throws the pick
  to a national electorate they don't control.
- **Why the Speaker-auto-becomes-CC idea was REJECTED:** it re-opened the stall-to-win exploit
  (control the Speakership, run out the clock, get the CC with no election). The straw-poll →
  national-vote path closes it.
- **Why NO Senate consent on the three:** violates John's core principle (no other chamber/branch
  in the CC's business); the straw poll already produces the three mechanically, so review only adds
  a chokepoint/exploit.
- **Why the nationally-installed CC is just a NORMAL CC (no symmetric popular recall):** the fallback
  election is a penalty, not a first-class mandate, so no symmetric removal is owed. If the Assembly
  later removes that CC via §2.6, that's the Assembly FINALLY doing its job (§2.6 forces them to name
  a successor) — the system healing, not a coup. John firmly does NOT want public removal (fractious;
  would only accept it at amendment-level difficulty, which would be a dead-letter provision — worse
  than none).
- **Why 45 days:** the public needs time to get acquainted with three candidates for an office they
  don't normally vote on; the Elections Panel needs lead time to stand up a national RCV. Tight enough
  that caretaker-only governance stays tolerable (fixes the 111-day paralysis nightmare).
- **Why full authority isn't granted to the acting Speaker during the window:** doing so is a smaller
  version of the stall-to-win exploit (rewards the staller with real power for ~45 days). Fixed by
  SPEED (tight window) not AUTHORITY. A month-ish of caretaker-only is fine; the danger was the LONG
  window, now removed.

## Implementation notes for tomorrow
- SUBSTANTIVE change, not a clarification → gets a changelog entry ("Session 260713 · Constitutional").
- When published: warrants an "Amendment:" social post (mind cadence).
- Check cross-references: anything pointing at the OLD cascade rungs (Senate designation, Legat
  Consul nomination, most-senior backstop) needs updating. Search JSON/DOCX/annotated/quickref/
  scenarios for references to the removed rungs. Note: scenario-the-fallback.html dramatizes the
  OLD four-stage cascade — it will likely go STALE and need rewrite or removal (editorial policy:
  remove-don't-annotate; but its formation-cascade teaching is the whole point, so this is a
  fresh-write candidate on the new model).
- Mechanical specifics to finalize in the draft: exact straw-poll wording; how the 45-day national
  window interacts with the 21-day Assembly window; naming the Elections Panel; the tie-extends-to-5
  rule wording; the reversion clause.
- Workflow: draft replacement text → John approves WORDING → unpack.py/pack.py DOCX edit → JSON →
  parity → annotated.html + search-index.js → new dated DOCX → changelog entry → package.

---

## STRESS TEST + HARDENING (added 260712, same session — all resolved by John)

Ran an adversarial stress test on the proposed fallback (exploits / edge cases /
collisions / failure states). Core design held — the big stall-to-win exploit is
genuinely closed — but the test surfaced gaps in rare states. All resolved below.
These resolutions are PART OF THE DECIDED SPEC; draft must implement them.

### Resolved gaps (fold into the draft)

**G1 — Degenerate straw poll (candidate count).**
- Floor is TWO candidates, ceiling is FOUR (was "top three; cap 5" — now top-two-to-four).
- Ties extend the advancing set within that band; a tie that would exceed FOUR breaks by
  continuous service (existing §2.6.a seniority tiebreaker), statutory tie-break if equally senior.
- **One-candidate case (G1a): if only one person receives straw-poll votes, that single
  candidate goes to the public as a RATIFICATION vote (yes/no on the one name).** Still routes
  the decision to the people; still embarrasses the Assembly.

**G2 — No Speaker (the dead-end John flagged first).**
- If there is no sitting Speaker, the MOST SENIOR Assembly member by continuous service both
  (a) serves as Acting Civic Consul (caretaker, maintain-existing-policy only) AND
  (b) administers the straw poll. One person covers both roles.
- The Senate stays OUT entirely — the earlier "Senate Speaker could administer" idea is REJECTED
  because it reintroduces another chamber into CC formation, violating the redesign's core principle.
- Seniority uses "most senior by continuous service," statutory tie-break if equal.

**G3 — Elections Panel can't deliver / paralysis returns.**
- The national-vote window has a FLOOR and a CEILING.
- Default: 45 days. Hard ceiling: 90 days absolute maximum, even with extension.
- The Elections Panel may extend beyond the default ONLY with justification PUBLISHED TO THE NRS
  (same shape as the §3.1 Senate extension: stated cause, published, reviewable) — never a
  unilateral silent extension. The 90-day wall cannot be exceeded regardless.
- This kills the "caretaker forever" failure: worst case is bounded at ~3 months, not indefinite.

### The Speaker/administrator role is PURELY ADMINISTRATIVE
- Whoever runs the straw poll (Speaker, or senior member if no Speaker) ADMINISTERS a fixed
  mechanical procedure and nothing more — no discretion over candidate order, timing, or what
  counts. This closes the "partisan Speaker shapes the outcome" exploit. Draft must make the
  straw-poll procedure mechanical and Speaker-proof.
- No quorum/turnout requirement on the straw poll: it produces its result regardless of turnout,
  so a boycott cannot veto it (boycotters simply forfeit influence over which candidates advance).

### Conscious design choices CONFIRMED (not gaps — accepted with eyes open)
- **Deterrent is not universal:** a nationally-popular-but-Assembly-minority faction may COURT the
  fallback rather than fear it. ACCEPTED as a feature — it routes around an Assembly out of step
  with the country. The embarrassment engine deters factions that would lose nationally; that's fine.
- **No turnout floor on the national vote:** plurality/RCV-winner is sufficient, no minimum turnout.
  ACCEPTED — the fallback is the penalty outcome; no mandate is claimed for it.
- **Reversion cutoff:** the Assembly may reclaim the process by electing a CC by absolute majority
  only UP TO THE START of the national vote. Once the public is voting, the vote finishes — the
  Assembly cannot snatch it back mid-count. (Draft must define "start of the national vote" as the
  cutoff, not "conclusion.")
- **Acting Speaker/senior-member CC is NOT removable via §2.6** — they are Acting, temporary by
  construction, not "the Civic Consul." Draft should be explicit so no one tries a §2.6 motion
  against the caretaker.
- **Backfill:** if a top-N candidate becomes disqualified between the straw poll and the national
  vote, the ballot proceeds with those who remain qualified (next-highest does not auto-backfill
  unless the set would drop below two, in which case re-run is a draft-detail to settle).

### Draft checklist now includes (in addition to the earlier notes)
- Straw-poll: mechanical procedure, no quorum, top-two-to-four, one-candidate→ratification.
- No-Speaker branch: senior member does both roles; Senate excluded.
- Window: 45 default / 90 ceiling / NRS-justified extension only.
- Reversion cutoff = start of national vote.
- Acting caretaker explicitly not §2.6-removable.
- Disqualification-before-vote: ballot proceeds with remaining qualified.
