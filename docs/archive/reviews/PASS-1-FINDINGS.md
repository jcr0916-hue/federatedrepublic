# Pass 1 — Recent-Amendment Redundancy Audit: Findings
*260918. Targets: §2.18, §14.5, §5.1.a, §15.10, plus the §2.5/§2.9 consolidation the changelog says was already attempted.*

**Tier check first:** §2.18, §14.5, §5.1.a and §15.10 are all **GREEN** — quoted nowhere on the site or in world content. The four newest amendments are also the four safest to edit. §2.5 and §2.16 are RED; §2.9 is AMBER.

---

## FINDING 1 — A real defect: the Civic Consul has no tiebreaker of last resort

**Severity: substantive. This is a deadlock hole in executive succession, not a wording problem.**

The document uses **three different conventions** for breaking a tie on equal continuous service:

| Convention | Where | Self-executing? |
|---|---|---|
| "the oldest by age holds the office / serves" | §2.9 (×2), §4.4, §9.8 | **Yes** |
| "the tiebreaker is determined by statute" | **§2.5(6)**, **§2.6.a**, §9.1.d | **No** |
| "determined by lot conducted by the JMC" | §11.1 | Yes |

The two executive succession provisions are exactly parallel in structure and opposite in this respect:

- **§2.9(6)(iii)** — Legat Consul: *"...the most senior Senator by continuous Senate service; where two or more Senators have equal continuous service, **the oldest by age holds the office**."*
- **§2.5(6)(iii)** — Civic Consul: *"...the most senior Assembly member by continuous service; where two or more members have equal continuous service, **the tiebreaker is determined by statute**."*

§2.16 does not fill the gap — it covers declination (§2.16(7)) and loss of chamber membership, not ties. Nothing else does either.

**Why this matters concretely.** §2.9(3) explicitly anticipates the statute not existing: *"Until such statute is enacted, the constitutional order under §2.9(6)(i) and (iii) applies."* The Legat side is deliberately drafted to work in a statutory vacuum. The Civic side is not. If two Assembly members hold equal continuous service and no tiebreaker statute has been enacted, **§2.5(6)(iii) cannot resolve, and acting Civic Consul authority is indeterminate at precisely the moment it is needed.** §2.6.a (Government Formation) carries the identical hole.

This also cuts against the document's own established habit of supplying a constitutional floor whenever statute is silent — §2.5(4) ("in the absence of a statutory interval, the constitutional default is 30 days"), §2.11 ("in the absence of a statutory definition, the constitutional floor is 30 consecutive days"), §9.8 (pool minimums).

**This is the RED-tier exception you described:** §2.5 is quoted in published world content, but the provision is wrong, so it has to be addressed.

**Recommended remedy (your call — it is a real rule choice):**
- **(a) Match §2.9 — "the oldest by age holds the office."** Cheapest, self-executing, and makes the two parallel provisions consistent. Precedent already dominant in the document (4 of 8 instances).
- **(b) Keep statute primary, add a floor** — "...the tiebreaker is determined by statute; until such statute is enacted, the oldest by age holds the office." Preserves legislative discretion, closes the hole. Mirrors §2.9(3)'s own drafting pattern.
- **(c) Lot, per §11.1.** Neutral, but introduces a third mechanism into executive succession for no clear gain.

I'd take **(b)** — it closes the gap without overriding a policy choice that may have been deliberate, and it is the pattern §2.9(3) already uses. Whatever is chosen should be applied to **both** §2.5(6) and §2.6.a, and it is worth deciding at the same time whether §9.1.d wants the same treatment.

---

## FINDING 2 — §2.18 is partly redundant, but less than it first appears

Your "recent changes are saying the same thing" instinct lands here, with a caveat worth keeping.

Of §2.18's 95 words:

**Genuinely new, keep:**
- *"the Council of Ministers convenes and remains in session for the duration"* — §2.14 makes the Council **standing** (permanently existing), which is not the same as continuously sitting. Real addition.
- *"The Civic Consul reports to the Assembly at intervals defined by statute..."* — §14.2 creates only the Legat→Senate duty. This is the mirror, and it did not exist.
- *"No report under this section may be omitted on grounds that the response is ongoing."* — real anti-evasion rule.

**Cuttable:**
- *"both Consuls act within their respective domains"* — always true under §2.1/§2.5. Adds nothing on this occasion.
- *"This section confers no authority beyond that already held under §2.1 and §2.5."* — a pure disclaimer, and effectively a confession that the section overlaps two others. Removing it changes no outcome.

**Do NOT cut, despite looking redundant:**
- *"Neither Consul may direct the other's domain."* — this looks like restatement, but it is the document's **only general statement of that principle.** Elsewhere it exists only piecemeal: §2.12 for clemency, §2.5 for domestic emergencies, and §2.14.b's formal cross-domain request mechanism only implies it. Cutting it removes the general rule entirely.

Net: roughly **35 of 95 words** come out, no functional change.

**One open question worth your view.** §2.18's occasion — armed insurrection — is the scenario where the domain line is *least* clear, since it is simultaneously military (Legat, §2.1) and domestic (Civic, §2.5 residual and §2.5(4)). The section responds by affirming the line exists rather than saying where it falls. That may be deliberate, leaving it to §2.1's domain-dispute mechanism and SC referral. But if the intent was that insurrection does not collapse the dual executive into a single commander, the section would say that more usefully than it currently does. Not a defect — a question about what those sentences are for.

---

## FINDING 3 — §14.5, §5.1.a, §15.10 are clean

- **§14.5 (184w).** No redundancy found. Its domestic prohibitions ("against the constitutional order... against another State... obstruct a federal constitutional function") are **not** covered by §14.1, whose prohibitions are foreign-facing (installing governments abroad, resource extraction, ideological imposition). "In all circumstances" reads as belt-and-braces but is load-bearing — it blocks an argument that federal service suspends Article I.
- **§15.10 (89w).** The §14.5 command sentence does real work: §14.5 assigns command to federal (in service) or State (otherwise), and §15.10 resolves the third case §14.5 alone would leave dangling — no competent State authority to hold command or to give the consent §14.5 requires. Complementary, not duplicative.
- **§5.1.a (84w).** Fills a genuine gap; §5.1 covers acquisition of citizenship and says nothing about voting domicile. Only nit: the closing sentence ("Recognition... terminates any prior recognition in another") is largely implied by "exactly one State or Territory" in the opening. ~15 words, optional.

---

## FINDING 4 — The §2.5/§2.9 consolidation was started and left unfinished

The changelog entry *"§2.5(6) / §2.9(6) — Extracting the Shared, Preserving the Different"* moved the shared declination and conduct-of-acting-service rules into §2.16(7) and §2.16(9) — both provisions now cite them rather than restate them. That worked.

But **66 words of near-verbatim duplication remain** in the succession order itself: clause (ii) ("persons holding offices designated by statute for this purpose, in the order so established"), the senior-member rule, and the tiebreaker clause.

**Recommendation: leave it.** §2.5 is RED, and duplication alone is not the "wrong" exception. The genuinely parallel structure is also readable on its own terms. The only thing that should be touched here is the Finding 1 tiebreaker gap, which is a narrow insertion rather than a consolidation.

---

## WHAT I'D DO NEXT

1. **You pick a tiebreaker remedy (a/b/c)** — that is a rule choice, not an editorial one, so it is yours.
2. I apply it to §2.5(6) and §2.6.a, decide with you on §9.1.d, and log it as its own changelog entry (substantive, not editorial).
3. I trim §2.18 per Finding 2 (GREEN, no ripple).
4. Then Pass 2 — the conventions sweep, starting with the six phrasings of the NRS publication rule.
