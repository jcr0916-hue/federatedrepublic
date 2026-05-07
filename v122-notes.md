# v122 — Scenario Testing Fixes
# Prepared: Session following v121 push
# Status: PENDING — noted and tested, apply at next build

## Source
Six scenario tests run against v121. Five gaps identified. One provision (§1.25.e
emergency/election collision) confirmed airtight — no action needed.

---

## Fix 1 — Dual Executive Conflict Resolution (§2.1 / §2.5)

**Gap:** No mechanism exists to resolve conflicting valid orders from both executives
affecting the same civil servants or institutions during active Tier 1/2/3 operations.
The Emergency Panel under §4.2.d covers scope challenges TO the President's Tier 1
authority, not disputes BETWEEN the two executives operating in parallel domains.

**Add as new §2.1.h or §2.5.b:**

  "Where both executives issue conflicting orders affecting the same civil servants,
   institutions, or infrastructure during an active Tier 1, Tier 2, or Tier 3 military
   operation, the following resolution mechanism applies:
   (a) The President must provide a specific written objection within 6 hours of the PM's
       order, published to the National Record System, identifying the precise national
       security nexus and the specific operational harm the PM's order creates.
   (b) The dispute is immediately referred to the Emergency Panel under §4.2.d, which
       must rule within 24 hours on whether the President's objection constitutes a
       credible and specific national security concern.
   (c) Pending the Emergency Panel's ruling, PM domestic orders remain operative unless
       the Panel certifies the President's concern as credible and specific, in which case
       the conflicting portion of the PM's order is suspended pending full resolution.
   (d) A President who fails to file the written objection within 6 hours waives the
       conflict claim for that order; the PM's order stands.
   (e) This mechanism does not limit the PM's authority to issue domestic orders — it
       provides a structured process for resolving the narrow category of genuine
       operational conflicts."

---

## Fix 2 — MA Director Veto Must Be Accompanied by Judicial Challenge (§10.4.d)

**Gap:** A Director can veto a board certification on methodology grounds without
filing a judicial review proceeding, using the veto as an indefinite delay while
§10.4.d's removal protection is not yet triggered (since no review is pending).
This creates a window for politically-motivated delay without accountability.

**Add to §10.4.d:**

  "A Director who vetoes a board certification on methodology grounds must simultaneously
   file a methodology challenge before the Supreme Court within 48 hours of the veto,
   or the veto lapses automatically and the board's certification stands.
   The board override proceeds regardless of any pending judicial challenge —
   the override and the judicial challenge are parallel tracks.
   The Director's removal protection under this section applies from the date the
   judicial challenge is filed, not from the date of the veto."

---

## Fix 3 — §2.10.a Statement of Grounds Required (§2.10)

**Gap:** §2.10.a requires a 2/3 House vote to initiate presidential removal but does not
require a Statement of Grounds specifying the basis for removal. §3.5.c provides the
Senate trial mechanics but the trial has no defined subject matter unless grounds are
stated. The Senate cannot conduct a meaningful trial without knowing what conduct
is being alleged.

**Add to §2.10.a:**

  "The House vote under this section must be accompanied by a Statement of Grounds —
   a written document specifying the basis for removal in plain language, published to
   the National Record System simultaneously with the vote. The Statement of Grounds
   serves the function of Articles of Impeachment for purposes of the §3.5.c Senate trial
   mechanics. The Statement must identify specific conduct, decisions, or failures
   constituting the basis for removal; a general vote of no confidence without specific
   stated grounds is not sufficient.
   The Senate trial is limited to the grounds stated — the Senate may not convict on
   grounds not included in the Statement."

---

## Fix 4 — CLT Administrator Explicit Eligibility Criteria (§5.4.b)

**Gap:** The CLT Administrator has no explicit constitutional eligibility criteria.
§5.4.b references the EI reviewing "constitutional eligibility criteria" but those
criteria are not defined anywhere in the constitution — the section relied on
"the same mechanism as §10.4.a" which has now been removed. The EI cannot apply
eligibility criteria that don't exist.

**Add explicit criteria to §5.4.b:**

  "CLT Administrator eligibility criteria: candidates must meet all three requirements:
   (1) no elected or appointed government position in the prior 5 years;
   (2) no current financial interest in any entity administering educational testing,
       citizenship assessment, or civic credentialing services;
   (3) demonstrated expertise in at least one of: psychometrics and assessment design,
       constitutional law, educational policy, or civic literacy research.
   These criteria are the constitutional eligibility floor; Parliament may by statute
   establish additional qualification requirements consistent with this floor.
   The Executive Inspectorate applies these criteria when reviewing submitted disclosure
   records under §5.4.b's assessment process."

---

## Fix 5 — §4.1.b Deemed Confirmed Window Cannot Exceed 180-Day Ceiling

**Gap:** The Legislature-defined confirmation period for inferior court nominees could,
if set too long, push the Deemed Confirmation date past the 180-day constitutional
ceiling from the date of vacancy — creating a conflict between the statutory timeline
and the constitutional maximum.

**Add constraint to §4.1.b:**

  "The Legislature-defined confirmation period for inferior court judge nominations
   may not be set at a duration that, when combined with the time elapsed between the
   vacancy arising and the nomination being submitted, would cause Deemed Confirmation
   to occur after the 180-day constitutional ceiling from the date of vacancy.
   Where a nomination is submitted late — whether by the PM after the 90-day trigger
   or by the Supreme Court after PM failure — the confirmation period is automatically
   shortened to the remaining time within the 180-day ceiling, with Deemed Confirmation
   occurring at the ceiling date if no vote is held."

---

## What These Fixes Do NOT Change

- The dual executive domain separation itself — unchanged
- The MA board/Director veto-override architecture — unchanged
- The §2.10.a 2/3 House threshold — unchanged
- The CLT testing standards or administration — unchanged (Legislature-defined)
- The 180-day inferior court vacancy ceiling — unchanged
- The §1.25.e emergency/election prohibition — confirmed sound, no change

---

## Testing Notes

These fixes were tested conceptually through six scenario runs against v121:

Test 1 (Dual Executive Cyberattack) → Fix 1 closes the gap
Test 2 (MA Board Veto Under Pressure) → Fix 2 closes the gap
Test 3 (Legislative Removal of Popular President) → Fix 3 closes the gap
Test 4 (Inspectorate Disclosure Record Challenge) → Fix 4 closes the gap
Test 5 (Inferior Court 180-Day Vacancy) → Fix 5 closes the gap
Test 6 (Emergency/Election Collision) → No fix needed; §1.25.e confirmed airtight

All five fixes are targeted additions to existing provisions.
No existing provision text needs to be removed or replaced.
