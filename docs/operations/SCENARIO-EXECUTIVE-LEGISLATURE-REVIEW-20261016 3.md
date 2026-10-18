# Scenario substantive review — dual executive and legislature (16 October 2026)

**Authority:** merged `constitution_data.json` at review time. This is the next bounded batch after `SCENARIO-SUBSTANTIVE-REVIEW-20261016.md`, not a blanket certification of every paragraph or all 54 scenarios.

## Examined
- `scenario-the-formation.html` — Assembly Civic Consul election, acting succession, nominating fallback and legislative review (§§2.6, 2.6.a, 2.7).
- `scenario-the-coalition.html` — constructive no-confidence (§2.6).
- `scenario-the-vote.html` — Civic Consul suspensive veto, Senate override, reconsideration notice and repassage (§2.7).
- `scenario-the-objection.html` — reconsideration notice and Speaker review pause (§2.7).
- `scenario-the-direction.html` — prosecution-direction transparency, conflict disclosures and judicial review (§§2.15, 7.10–7.11, 4.5).
- `scenario-coordination-failure.html` — coordination without transfer of executive domain (§§2.14, 2.14.a, 4.5).

## Confirmed mismatch and correction

**The Formation:** The old text described a one-candidate yes/no national ratification pathway that current §2.6.a(4)–(5) does not establish; the required nomination field is **two to four**. It also portrayed the acting Civic Consul's reconsideration notice as a discretionary notice within a ten-business-day window, subject to the ordinary §2.7 exclusions. Current §2.6.a(3) instead provides a ten-business-day **pause triggered by the acting reconsideration notice**, with Assembly withdrawal possible by simple majority and review resuming otherwise. Corrected the explanatory text. The story's actual four-candidate ballot and result remain unchanged.

## Other selection observations

- **The Coalition** tests the constructive-confidence safeguard rather than the formation fallback; retain both.
- **The Vote** and **The Objection** illuminate different uses of §2.7: suspensive veto with Senate override and the advisory reconsideration pathway. Retain both, though they can be cross-linked in a future navigation improvement.
- **The Direction** tests the interaction between lawful prosecution-policy authority, individual legal conflicts, independent review and political accountability; retain.
- **Coordination Failure** tests treaty implementation where neither Consul can unilaterally acquire the other's competence. It distinguishes an ordinary domain dispute from the emergency operational lead in §2.14.a; retain.

## Pending / caution

These six stories have been examined for the core mechanisms described above, but a full legal line audit of every collateral claim—including named internal offices, non-constitutional statutory processes and historical chronology—remains outside this batch. No local Node build or scenario link tests ran through the GitHub file-editing connector; check PR CI before merge. Other scenarios touching these same articles remain for later review. All established story outcomes are preserved.
