# Text Economy Review — Article by Article

**Started:** 2026-10-10. **Baseline:** 28,615 words, 180 provisions (`constitution_data.json` at e652cf7).

**Questions asked of every provision**
1. Is this constitutional text, or explanation, justification, example, implementation detail, or commentary?
2. Can the same rule be stated materially shorter without losing a safeguard, allocation of authority, fallback, threshold, or enforceable standard?
3. Can the provision (or a group) be reduced to a general principle, and is that appropriate?
4. Does it pass the Twelve Tests (docs/CONSTITUTIONAL-DESIGN-PRINCIPLES.md)?

**Where the words are:** IX 4,064 · II 3,295 · XV 3,142 · XIX 2,438 · III 1,687 · I 1,607 · IV 1,508 · VII 1,457. The first four hold 45% of the text.

**Trend:** 31,267 words on Oct 5 → 28,615 now (−8.5%).

Process (10.10, John): simple fixes (deleting unnecessary sentences, consolidating language without changing meaning) are applied without detailed review and logged here. Anything that changes meaning or needs a decision is taken up one item at a time in conversation.

Review rule (10.10, John): a fallback mechanism doesn't need its own fallback. Keep the concept and its outer limit, and trust the officials to run it.

Scope (added 10.10, John): also flag anything clearly wrong, inconsistent, or that could use refinement or change.

Status per article: PROPOSED → APPROVED / REVISED / DECLINED. No edits are applied to `constitution_data.json` until John approves an article.

---

## Article I — Individual Sovereignty and Rights (1,607 words) — APPROVED 2026-10-10

Approved as proposed, including deletion of the §1.9 holiday sentence and the §1.19 EM assessment. The two questions below remain open.

Overall: already pitched at principle level. Modest savings (~175 words, ~11%). The main value is two conflicts and one bad-faith exit, not length.

| § | Finding | Test | Proposed |
|---|---|---|---|
| 1.3, 1.4 | "This right is non-derogable under §1.19.a." tags two of the six listed rights; §1.19.a is the home | One Home | Delete both sentences |
| 1.4 | "civic obligations lawfully required of citizens by the Legislature — including …" is an open category; the examples don't bound it | Bad-Faith | "Labor required of a person convicted of an offense by a court, and jury service, military conscription, and civil emergency duties lawfully required of citizens, do not constitute forced labor under this provision." (Closes the list. The Legislature can't add new compulsory civic duties.) |
| 1.5 | "compelling public-order purposes, subject to intermediate scrutiny" mixes two scrutiny tiers and imports doctrine by name | Internal consistency; Level | "…may regulate the time, place, and manner of expression and assembly only as necessary for public order and without discriminating on the basis of viewpoint." |
| 1.5 | Intermediaries sentence is convoluted | Shorter | "No government may compel expression, or suppress it directly or through intermediaries it controls or directs." |
| 1.5 | Final sentence (statutory framework that doesn't burden the right) restates the right | Level | Delete |
| 1.6 | Last sentence duplicates the rule: economic status is already a listed characteristic requiring compelling justification | One Home | Delete |
| 1.9 | "Federal election periods are public holidays." Statute-level, and "periods" is ambiguous | Level | Delete (access mandate already covers it), or keep as a deliberate floor and say "election days" |
| 1.10 | Licensing and regulation are stated twice; "may not prohibit generally" is implied by the proviso | Shorter | "Every person holds the right to keep and bear arms for lawful purposes, including self-defense. The Legislature and States may regulate the licensing, safety, type, transfer, and carry of arms, provided lawful ownership for self-defense remains available." |
| 1.13 | "No record may remain sealed beyond 15 years under any circumstances" is the arithmetic of 10 + one 5-year extension | Shorter | Delete |
| 1.14 | Two sentences; the greater-penalty clause is covered by "otherwise" | Shorter | "No person may be convicted for conduct that was not criminal when committed, and no criminal law may otherwise be applied retroactively to the disadvantage of the accused." |
| 1.15 | "A judgment in one jurisdiction does not bar prosecution in the other" restates the prior sentence; "Statute may provide greater protection" is true of every right | Shorter; Commentary | Delete both |
| 1.18 | Second clause (no systematic harm to defined communities) is mostly inside the first | One Home | "Government may not itself cause, or systematically permit through licensing, material environmental harm to persons or communities within its jurisdiction. The Legislature shall establish environmental protections. Government shall take reasonable measures proportionate to harms known or reasonably capable of identification; this provision does not guarantee a particular environmental outcome." |
| 1.19 | "Continuation … requires a statute … with a fixed expiration date. No derogation may be extended or renewed." reads as self-contradictory | Internal consistency | "…a statute enacted through the ordinary legislative process with a fixed expiration date, which may not be extended or renewed." |
| 1.19 | EM assessment of overlapping declarations within 60 days: the 60-day bar, the 2/3 re-declaration rule, judicial review, and the EM's general audit of executives already cover evasion | Shorter; Familiarity | Delete (moderate confidence) |
| 1.19.a | "No emergency declaration, executive order, or legislative act may derogate any of these rights" restates "absolute" | Shorter | Delete |

**Questions for John (not edits)**
- §1.19.a: the emergency non-discrimination list (race, ethnicity, religion, national origin) is narrower than §1.6. Deliberate?
- §1.17: "The state shall ensure…" — lowercase "state" when the document uses State for subnational units. Who owes education: the Republic, the States, or both?

**Pass:** §1.1, 1.2, 1.7, 1.8, 1.11, 1.12, 1.16, 1.17.a, 1.20, 1.21, 1.22.

---

## Article II — The Dual Executive (3,295 words) — APPROVED 2026-10-10

Simple fixes approved under the 10.10 process; decisions as marked below.

Overall: the largest gains come from four consolidations, each giving one home to a rule now stated two or three times. Estimated savings ~500 words (~15%). Four substantive findings.

### A. Consolidations (principle level)

| Rule | Now stated in | Proposed home |
|---|---|---|
| Acting order during incapacity (Speaker → statutory successors → most senior member; ties by age) | §2.5(6), §2.9(6), plus a third tie rule in §2.6.a(2) | §2.16, once: "acting authority vests in the Speaker of the Consul's chamber — the Assembly for the Civic Consul, the Senate for the Legat Consul — then in any successors designated by statute, then in the most senior member of that chamber by continuous service, ties resolved by age." Also closes the Process Symmetry gap flagged 19.09 (§2.5 routes ties through statute; §2.9 states age directly). |
| Acting service doesn't count toward service limits | §2.1, §2.5(2), §2.9(6) | §2.16(9), once, covering both Consuls |
| Bill not vetoed in time becomes law; both executives review concurrently | §2.3.a ("enacted by operation of law"), §2.7 ("becomes law by constitutional operation"; "Both executives review concurrently") | §2.7, one sentence covering both vetoes |
| No-consecutive-term rule | §2.1 (completed elected term) and §2.9(5) (successor sits out a full term) | §2.1: "A person who serves any portion of a term, by election or succession, may not seek election at the next election for that office." |

### B. Substantive findings

1. **§2.2 renewal ceiling — APPROVED (John, 10.10, after reconsidering):** "Legislative authorization expires unless affirmatively renewed at intervals defined by statute, not exceeding 12 months; expiration requires cessation of operations." Framed as a shelf life on legislative permission, not a constraint on LC operations; Process Symmetry with §1.19, §2.5(4), §2.11, §9.1.e. Also approved: §14.2 Senate questioning "at intervals defined by statute, and at least annually."
2. **§2.14.b: wrong cross-reference.** "Disputes are resolved under §2.14.a." §2.14.a is the emergency-lead designation, while §2.14 is the dispute route (to the SC under §4.5). Should read §2.14.
3. ~~§2.6.a(5) sole-candidate failure state~~ — **DECLINED (John, 10.10):** §2.6.a is already the backup; don't build fallbacks for fallbacks. Instead, reduce (5) to its core sentence: "The Elections Panel administers a national ranked-choice election among the advancing candidates within the period defined by statute, with a constitutional default of 45 days and an absolute maximum of 90 days from the close of the nominating ballot." The cause-extension, single-candidate (already in (4)), and ineligibility sentences are deleted.
4. **§2.5(4) vs §2.14.b.** "The Legat Consul has no role in domestic emergencies," yet §2.14.b lets the Civic Consul request the Legat Consul's disaster, medical, and search-and-rescue assistance. Proposed: "…no authority in domestic emergencies except assistance under §2.14.b."

### C. Refinements

- **§2.1/§2.3/§2.3.a intelligence — APPROVED (John, 10.10):** use "external intelligence" in all three (§2.1 "external intelligence under §2.3"; §2.3 "The Legat Consul directs external intelligence."; §2.3.a domain list). No definition: the CC holds internal intelligence with law enforcement under residual authority, and the government draws the operating line as threats evolve.
- **§2.6.a(3) — APPROVED (John, 10.10):** "(3) Bills passed during acting service are presented to the Acting Civic Consul, who may not exercise the §2.7 veto but may issue a reconsideration notice under §2.7. The notice suspends the review period for 10 business days without further action, during which the Assembly may withdraw the bill by simple majority." No Speaker decision needed; the Assembly organizes its own vote or the pause times out.
- **§2.18:** "Neither Consul may exercise authority assigned to the other" is stated only for insurrection, which invites the inference that it doesn't hold otherwise. Delete it here. Domain allocation makes it true at all times.
- **§2.7 fiscal notice → reconsideration notice (John, 10.10, revised):** replace the fiscal-notice paragraph with: "Within the same review period, the Civic Consul may publish to the NRS a reconsideration notice identifying provisions recommended for revision or deletion, with reasons. Before the review period expires, the Assembly Speaker may suspend it for up to 10 business days, during which the Assembly may withdraw the bill by simple majority. If the bill is not withdrawn, the review period resumes. A reconsideration notice may be issued once on any bill." The Speaker's act only pauses the clock; the Assembly decides; inaction leaves the bill with the CC. **APPROVED (John, 10.10):** available for the annual budget; unavailable only for emergency legislation — add: "A reconsideration notice is unavailable for emergency legislation."
- **§2.6.a(3):** "staying enactment for the remainder of that period": which period? Also, the exclusion list (budget, constitutional obligation, emergency) duplicates §2.7. Replace with "legislation excluded from the veto under §2.7."
- **§2.9(3):** "The Legislature shall by statute establish an order of succession beyond…" carries a "shall" with no consequence, and "Until such statute is enacted, the constitutional order applies" is tautological. Proposed: "Statute may extend the order of succession beyond subsection (2) and designate successors between the Senate Speaker and the senior-Senator fallback."

### D. Deletions (duplication, pointers, commentary)

- §2.1, §2.5(1): "Eligibility and disclosure requirements … are established in §7.4." §7.4 applies by its own terms.
- §2.1: "The outgoing Legat Consul retains no authority after transfer" restates the sentence before it.
- §2.5(1): "must be a serving member of the Assembly … as required by §2.6" and "serves at the confidence of the Assembly, subject to removal under §2.6" both restate §2.6(1)–(2).
- §2.5(5) last sentence: move into §2.4, which becomes one consultation rule: "The Legat Consul shall consult the Civic Consul on trade agreements, and on treaties and compacts with recognized indigenous nations, where their terms bear on domestic interests; the Civic Consul's response is advisory and published to the NRS."
- §2.6(3): "Future eligibility is governed by §2.5 and §7.4."
- §2.6.a(2): "and retains their Assembly seat" and "The Acting Civic Consul is not subject to removal under §2.6" duplicate §2.6(4).
- §2.6.a(4): "Only members otherwise qualified under §2.5 and §7.4 may advance" (§7.4(4) already bars ineligible persons).
- §2.6.a(5): second "never beyond 90 days."
- §2.6.a(6): restates §2.6. Becomes "The winner becomes Civic Consul under §2.6; acting service ends upon installation."
- §2.2: "Military expenditure is governed by §14.2."
- §2.3.a: "A general or speculative security connection is insufficient" restates "genuine."
- §2.9(1): "including removal for demonstrated permanent incapacity under §2.13"; and merge (1)'s NRS sentence with (4)'s "authoritative evidence … does not create the authority."
- §2.14: "Operational procedures are defined by statute."
- §2.14.b: the permission list (logistical, transport, materiel…) is illustrative. The prohibition list is the safeguard. Becomes "Assistance may provide non-coercive support but may not…". Also collapse the three statements of "the responder decides" into one.

**Pass:** §2.3, 2.4.a, 2.8, 2.10, 2.11 (deliberately open, 10.09), 2.12, 2.13, 2.14.a, 2.15, 2.16 (beyond receiving the consolidated acting order), 2.17.

---

## Article III — The Legislature (1,687 words) — IN REVIEW

### Simple fixes (approved under the 10.10 process)

- **Expulsion stated three times** (§3.2(6), §3.5(6), §3.4 "Removal requires 2/3"): one home in §3.4: "Each chamber may expel a member by 2/3 of full seated membership, effective immediately and published to the NRS, and may request an LM assessment."
- **Recall stated twice** (§3.2(7), §3.5(7)): one provision covering Assembly members and senators.
- **Early departure deemed a full term** (§3.2(5), §3.5(4)): delete both; §7.4(3) already states the general rule for constitutional office.
- **"Shall maintain a body capable of performing the function"** stated in §3.8 (legislative bodies) and §3.9 (independent agencies): one general sentence in §3.10 covering any institution this Constitution assigns a function to.
- §3.1: "within the period defined by statute, not exceeding 90 days; absent such statute, the period is 90 days" becomes "within 90 days or any shorter period defined by statute."
- §3.2(1): delete "States and Territories each elect voting members" (implied by the minimum-seat guarantee) and the Territorial-district clause (stated in §3.3).
- §3.2(3): delete "and its holder serves as Acting Civic Consul under §2.5 and §2.6.a" (Article II is the home).
- §3.4: "any member or approval body" becomes "any member or either chamber" ("approval body" is undefined).
- §3.4 ¶2 compressed: "Each chamber operates as a full-time legislative body. Its sitting schedule for each electoral cycle, and every revision, is published to the NRS." Keep "No recess may be used to defeat or delay a constitutional duty or deadline" (stronger than §3.1's "indefinitely delay").
- §3.5(2): delete the §19.10 founding-cohort pointer.
- §3.5(8): last item aligned with §2.11: "in the absence of a functioning Elections Panel, administration of federal elections under §2.11" (it said "the consular election" while §2.11 says federal elections).
- §3.5(9): delete (restates §3.1).
- §3.6.a: delete "jurisdiction and procedure are defined by statute."

### Decisions
1. **§3.4 emergency sessions — APPROVED (John, 10.10):** "Emergency sessions may be called by either Consul or by petition of one-third of either chamber."
2. **§3.11 delegation — APPROVED (John, 10.10):** "The Legislature may by statute delegate defined authority within federal legislative competence to either Consul or to an independent agency under §3.9. A delegation shall state its scope, conditions, and duration. Delegation does not divest the Legislature of that authority; statute prevails over any conflicting exercise of delegated authority. The Legislature may unilaterally rescind a delegation at any time. Exercises of delegated authority shall be attributable in the NRS to both the legislative grant and the exercising authority. The EM shall audit delegated executive authority and publish its findings." Term-of-Legislature sunset removed (agencies outlive cycles); "unilaterally" takes rescission outside both vetoes; §3.7 default threshold applies.
3. **§3.3 map failure — APPROVED (John, 10.10):** replace the LM-review and map-failure sentences with: "The LM reviews all maps for compliance and publishes findings to the NRS. The Elections Panel shall address each finding of non-compliance by a published determination. Where the Panel determines a map non-compliant and an election will occur before the State adopts a compliant map, the Panel draws an interim compliant map for that election, which is retired when the State adopts a compliant map." LM finds; Panel decides; SC reviews on challenge.

**Article III — APPROVED 2026-10-10.**

---

## Article IV — The Judicial Architecture (1,508 words) — IN REVIEW

### Simple fixes (approved under the 10.10 process)

- §4.2(1): delete "Any citizen meeting the eligibility criteria … may apply" and "the JM's ongoing audit encompasses the Judicial Pool" (both restate §9.4.a; the JM audit is stated a third time in §9.4(1)). The remaining sentence, statutory exceptions, is Decision 4.
- §4.4(3): delete "The Senate may consider published JM findings on the nominee" (the Senate may consider anything).
- §4.4(6): "A confirmed justice serves a single non-renewable 12-year term" restates §4.3. Becomes "A justice's term runs from confirmation; a justice filling a mid-term vacancy serves only the remainder of the original term."
- §4.4(7): delete the §19.10 founding-classes pointer.
- §4.5(1): delete "The SC identifies the constitutional defect; the Legislature may respond through legislation consistent with the ruling" (always true; commentary).
- §4.5(6): delete "The SC establishes its own procedures for this expedited review."
- §4.5.a: delete "The Legislature may establish implementing procedures by statute."

### Decisions
1. **§4.3.a pre-election SC review — APPROVED delete (John, 10.10):** delete "A removal vote within 180 days of a major national election requires prior SC review under §4.5, with a ruling within 48 hours." (Advisory; the Court judging its own colleague.) The narrow grounds, the 2/3 threshold, and published grounds carry the protection; a removed justice can challenge afterward as an ordinary case.
2. **§4.4(5) + §4.4.a public confirmation — APPROVED unify (John, 10.10):** one route replacing §4.4(5) and the first two paragraphs of §4.4.a: "If the Civic Consul fails to nominate, or the Senate fails to vote, within the applicable period, the Temporary Associate Justice is submitted for public confirmation at the next federal electoral period. Confirmation requires 60% of votes cast under §7.3. An ordinary nomination and Senate confirmation completed before Elections Panel certification of the ballot ends the public route. If confirmed, the justice serves the remainder of the original term; if rejected, the next eligible Appellate Court judge becomes Temporary Associate Justice and the vacancy process restarts." Both Assembly gates removed. Keep §4.4(4)'s bar on nominating the sitting TAJ and §4.4.a's advocacy/§8.1 paragraph.
3. **Judicial removal assessment — APPROVED JM (John, 10.10):** §4.2(4) "EM assessment under §9.1" and §4.3.a "a Monitor assessment under §9.1" both become "a JM assessment."
4. **§4.2(1) statutory exceptions — APPROVED delete (John, 10.10):** delete "Exceptions to pool eligibility are defined by statute." With the simple-fix deletions, §4.2(1) is now empty; renumber §4.2.
5. **§4.2(2) nomination deadline — APPROVED ceiling (John, 10.10):** "The Civic Consul must nominate within 90 days of a vacancy or any shorter period defined by statute."

**Article IV — APPROVED 2026-10-10.**

---

## Article V — Citizenship and National Identity (358 words) — APPROVED 2026-10-10 (simple fixes only)

- §5.2: delete "As Inhabitants, they hold all Article I rights" (Article I applies to every person).
- §5.2 last sentence (no deportation of a citizen's or resident's child for its own documentation status) moves to §5.3 (One Home: children).
- §5.3: compress; the second sentence restates the first: "Where removal of a parent or guardian would deprive a citizen or Inhabitant child of their primary caregiver, the Republic shall ensure the child's care, housing, and connection to remaining family, and the removal order is stayed until custodial arrangements are resolved."

## Article VI — Immigration and Residency (758 words) — APPROVED 2026-10-10 (simple fixes only)

- **Wrong cross-references:** §6.1 "Asylum claims under §1.21" and §6.3(1) "asylum claim under §1.21" become §1.20 (§1.21 is non-refoulement). §6.3(2) and §6.3(7) correctly cite §1.21.
- §6.2(1): delete "The Republic may remove a person or take other actions as established by statute and consistent with this Constitution" (no content).
- §6.2(5): compress to "…retain the protections of Article I, including counsel appointed at public expense where they cannot afford representation."
- §6.3(1): delete the first sentence (§1.20 already makes the claimant an Inhabitant holding all Article I rights); keep the shelter/subsistence/medical-care duty.
- §6.3(4): delete the first sentence (restates §1.20); keep the no-penalty-for-irregular-entry rule.
- §6.3(5): delete "regardless of point of entry."

---

## Article VII — Elections and Federal Office (1,457 words) — IN REVIEW

### Simple fixes (approved under the 10.10 process)

- **§7.5 + §7.9 merged** (both: tenure ends only by a constitutional mechanism): "A federal officeholder whose tenure is governed by this Constitution, including the holder of an elected mandate, may be removed, suspended, or have their tenure shortened only through a mechanism established or expressly authorized by this Constitution. No statute may add such a mechanism, including popular recall. Criminal liability remains unaffected."
- §7.6: delete the second sentence (acting service requires qualifications); §7.4(4) already bars ineligible persons from acting service.
- §7.1(5): delete "The Elections Panel certifies State-by-State first-preference results as part of overall election certification."
- §7.2(2): delete the §3.2/§7.1 pointers.
- §7.2(6): delete "The Legislature shall establish the assistance framework by statute"; keep "subject to Elections Panel oversight."
- §7.4(6): delete "The Legislature shall establish reasonable election-preparation deadlines by statute."
- §7.7: delete "Nothing in this provision restricts judicial review…" (the protection already excludes constitutional violations).
- §7.10(1): delete "Statute may define categories and thresholds consistent with this standard."
- §7.10(3): delete the §7.11 pointer.
- §7.11: delete "nor establish additional removal mechanisms, except where expressly authorized" (merged §7.5 covers it) and "Statute may establish additional standards and procedures consistent with this obligation."

### Knock-on simplifications in Article II (general rules in Article VII make these redundant)

- §7.15 (authority vests by constitutional operation without oath; NRS records but doesn't confer) makes §2.9(1)'s "no oath, publication, or implementing act is required. The transfer is recorded to the NRS as soon as possible" and §2.9(4)'s "The NRS record is authoritative evidence of the change and does not create the authority" redundant. Delete both; keep the chain-of-command recognition and the void-orders rule.
- §7.8 (acting officer retains original office but exercises none of its authority) makes §2.16(9)'s first sentence redundant; keep its second sentence (mandate neither extended nor suspended). In §2.6(4), keep only "is not removable under this section."

### Decisions
1. **§7.1(3) runoff — APPROVED (John, 10.10):** "(3) Where no candidate wins outright, a runoff is conducted between the national RCV winner and the candidate, other than that winner, who received first-preference pluralities in the most States. The runoff is decided by national majority without a State plurality requirement." Ties fall to lot under §7.1(4).

**Article VII — APPROVED 2026-10-10.**

---

## Article VIII — Electoral Finance and Campaign Conduct (698 words) — IN REVIEW

### Simple fixes (approved under the 10.10 process)

- **The foreign-money prohibition is stated four times** (§8.1 ¶2 twice, §8.1 ¶3, §8.2 ¶2). One sentence in §8.1: "Contributions from foreign governments, foreign nationals other than lawful residents, and foreign-controlled entities are prohibited. No person may make, receive, or fund an electoral contribution or independent expenditure on behalf of, at the direction of, or with funds from such a source, directly or through an intermediary." This also defines "prohibited foreign source," which the current text uses without defining. §8.2 ¶2 keeps the conduct prohibitions (covert operations, impersonation, manipulation) and the disqualification rule.
- **"Independent political expression remains protected under §1.5"** stated in §8.1 ¶4 and §8.2 ¶2: keep §8.1 only.
- **The Elections Panel's limits** stated in §8.2 ¶1 and ¶4 (and the list of violations repeated): one sentence: "The Elections Panel may investigate objectively identifiable violations of this section and establish technical and administrative standards, but may not create substantive restrictions on political expression or judge the truthfulness, political merits, or opinions expressed in campaign communications."
- §8.1: delete "The Legislature shall establish procedures to identify and prevent indirect prohibited contributions."
- §8.2: delete "Candidates for constitutional office must comply with the prohibitions in this section and additional lawful conduct requirements established by the Legislature by statute" and "Private civil litigation arising from campaign communications is not barred by this section."
- §8.4: delete "The system exists to make candidacy possible for those without existing access to private funding; it is not intended to fund a campaign in full" (justification; the next sentence states the floor).

### Decisions
1. **§8.2 disqualification — APPROVED (John, 10.10):** "A candidate who knowingly accepts prohibited foreign electoral assistance is disqualified from that election cycle by determination of the Elections Panel after notice and an opportunity to respond, subject to appeal under §7.4(6)."

**Article VIII — APPROVED 2026-10-10.**

---

## Article IX — The Monitors (4,064 words) — IN REVIEW

Note: Article IX completed its own checkpoint 10.09 (PR #103). This pass doesn't relitigate those decisions except where a principle conflict surfaced (Decisions below).

### Simple fixes (approved under the 10.10 process)

**Structure**
- **§9.2 merged into §9.1:** §9.1's first sentence already states the principle. It becomes "…each selected through a process that the institution it oversees does not control." Delete §9.2 (its second sentence is a pointer). Update §17.1(4)'s entrenchment reference accordingly; the principle stays entrenched through §9.1.
- **JM mandate moves into §9.1.c** (parallel to the LM's §9.1.a and the EM's §9.1.b): §9.4(1)–(2) become §9.1.c's text. This fixes the double "and" (confirmed defect 10.09) and drops "Its audit mandate is information-only" (§9.1 states it for all three). §9.4 becomes the JM Candidate Pool only.
- **§9.5.b deleted:** the first sentence is trivially true. The second becomes one sentence in §9.1: "Monitor findings do not relieve any body of its own duty to act."

**Duplicates removed**
- §9.1: "with a constitutionally protected funding floor" (§9.6 is the home).
- §9.1.b: "intelligence warrant requirement" becomes "judicial authorization requirement" (confirmed defect 10.09), and the §2.3 term is updated per the external-intelligence decision.
- §9.1.d: the pool-tenure tie "defined by statute" becomes "resolved by age" (Process Symmetry with the Article II tie rule); delete "Pool membership satisfies the eligibility requirement of §7.6" (§7.6 sentence removed; pool membership is the qualification); "neither record nor notice conditions the designation's effectiveness" (§7.15).
- §9.1.e(7): delete (§9.1.d's final sentence already covers every suspension).
- §9.1.e(3) last sentence: delete (duplicates (5)'s no-circumvention rule).
- §9.1.e(6): delete "In the absence of approval or judicial relief, the suspension lasts until its approved end date" (restates (5)) and "This Assembly requirement does not apply to purely voluntary incapacity" (extensions exist only for joint determinations).
- §9.3: delete the first "serves only the remainder of the original term" sentence (stated again later in the same provision).
- §9.4(6): delete "conducts the JM Candidate Pool lottery in a public session" (§9.8(3)) and "The pool is publicly accessible at all times" (§9.8(1)); keep the outgoing-JM exclusion.
- §9.4.a: delete "The Elections Panel maintains the standing Judicial Pool…" (§9.8(1)), the JM and EM audit sentences (§9.1.b/c), the §9.8(7) pointer, and "publicly accessible" (§9.8(1)). Keep the criteria, EP entry, and the re-nomination rules.
- §9.5: "published permanently / exempt from classification" stated three times; one statement: "Every Monitor finding and report is published to the NRS permanently and free of charge and is exempt from classification, but must protect information whose disclosure would violate constitutional rights or compromise lawful security interests."
- §9.5.a: delete the last three sentences (adoption under §9.7 rules, dissent under §9.7, no Pass/Fail without a standard); §9.7(7), §9.7(5), and the second sentence of §9.5.a already state them.
- §9.7(2): delete "A function expressly assigned elsewhere remains with the body to which it is assigned."
- §9.7(5): delete the §9.7.a pointer for "sustained non-participation." §9.7.a now requires demonstrable bad faith, and the two-member quorum already keeps non-participation from blocking anything.
- §9.7(6): delete "The joint annual NRS audit is published to both chambers" (§9.5's delivery rule).
- §9.8(3): delete "This subsection does not displace a lottery expressly assigned elsewhere."
- §9.8(4): delete "and the relevant nominating bodies must act to restore the minimum within the period defined by statute." Nominating bodies don't add pool members; the EP does under (5).
- §9.8(5): delete the Article IV / §9.1.d pointers.
- §9.8(7): compress the expedited-restoration sentences to "Appeals arising from expedited restoration receive expedited consideration without diminishing notice, stated grounds, or appeal."
- §9.9(3): delete "Until certification of removal, the Monitor General remains in office, subject to any separate lawful suspension" (restates (2)).
- §9.9(4): delete "Any separate suspension remains governed by its own constitutional provisions."
- §9.9(6): delete "Judicial review remains available for constitutional challenges to the proceedings."
- §9.9.a: delete "Recusal is governed by §7.11."

### Decisions
1. **Assembly early restoration — APPROVED remove (John, 10.10):** delete §9.1.e(6) entirely, and in §9.7.a delete "The affected Monitor General may request early restoration during a publicly approved extension by a simple majority of the Assembly's full seated membership." Keep §9.7.a's "a unilateral declaration of recovery does not end a suspension for demonstrable bad faith." Suspensions end automatically at the voter-approved end date; §9.1.e(3)'s joint restoration and §9.1.e(4)'s SC review remain. Resolves the §9.2 conflict (the Assembly restoring the LM, its own auditor).
2. **Extension vote threshold — APPROVED align (John, 10.10):** §9.1.e(5) "An extension requires a simple majority of votes cast with participation by at least 60% of eligible citizens" becomes "An extension requires 60% of votes cast under §7.3 with participation by at least 55% of eligible citizens." Matches §9.9(3) removal and §2.13 recall.
3. **§9.9(2) EM removal initiator — APPROVED (John, 10.10):** "for the Executive Monitor General, by the Legislature by concurrent resolution of both chambers." Removes the SC's non-adjudicative filing role and the recusal problem; the referendum still decides.

**Article IX — APPROVED 2026-10-10.**

---

## Article X — The National Record System (803 words) — IN REVIEW

### Simple fixes (approved under the 10.10 process)

- §10.1(7): delete; it restates §7.15. Also delete §10.1(4)'s last sentence ("Publication does not condition legal effect…") for the same reason. Knock-on: delete §2.10's "Late publication does not itself invalidate the underlying act" (§10.1(4)/§7.15).
- §10.1(9): delete "Monitor reports are permanently exempt from classification" (§9.5). Move "Classification used to conceal a constitutional violation or illegal order is a constitutional offense" into §10.2, merged with its "prohibited and void" sentence.
- §10.1(8): delete "the Legislature must establish permanent restoration obligations by statute within 90 days of that threshold" (fallback-of-fallback rule).
- §10.2: delete "No material may remain classified beyond 30 years under any circumstances" (arithmetic of 25 + one 5-year extension, as at §1.13); "All other classification periods, procedures, and review mechanisms are defined by statute within this ceiling"; "Any EM finding published under this section is admissible" (§4.5(3)); the duplicate "The applicable court is designated by statute"; and the closing electoral-records sentences (§10.1(3) is the home).
- §10.2 petitions: the redacted-release test already covers full release (if no portion satisfies the statutory ground, all of it is released). The two petition routes merge into one: "Any person with standing may at any time petition the applicable court for release of a classified record. The court orders release of every portion whose disclosure would not itself satisfy the statutory ground under which the record was classified; any redactions, and the statutory ground for each, are published with the released portion." This removes the limitation of full-declassification petitions to the extension period.

### Decisions
1. **Document-wide NRS publication pass — APPROVED (John, 10.10):** at apply time, remove "…published to the NRS" wherever §10.1(2) already covers the item (constitutional acts, orders, findings, certifications, designations, declarations, determinations). Keep: content requirements (grounds, reasons, evidence) minus the NRS phrase; timing or condition-of-effect requirements; and items outside §10.1(2)'s list (financial disclosures, minority reports, staff publications, private filings). The annotated edition carries the transparency reminder as commentary. Est. 400–600 words.

**Article X — APPROVED 2026-10-10.**

---

## Article XI — NRS Panel and Elections Panel (788 words) — IN REVIEW

### Simple fixes (approved under the 10.10 process)

- §11.1(2): delete ("The NRS Panel operates the National Record System" restates (1)).
- §11.1(4) (withholding certification) moves into §11.3, since (4) says it is exercised only through §11.3's process. Its "does not affect the validity of votes cast" merges with §11.3's identical sentence.
- §11.1(7): Chair tie "by lot conducted by the JMC" becomes "by age" (Process Symmetry with the other seniority ties).
- §11.3: delete "the process and timeline are defined by statute" and "the Elections Panel's administration obligation is to ensure constitutional standards are met going forward" (commentary).

### Decisions
1. **§11.1(8) emergency technical measures — APPROVED (John, 10.10):** replace the ratification clause with "…and expire after 72 hours; a panel may adopt a further measure only on a fresh published determination of an imminent threat." Same pattern as §2.11's fresh-certification renewal. Compress the statute-or-default sentence: "Under any procedure statute establishes, or absent statute by majority vote of its seated members, each panel may adopt temporary technical measures in response to imminent security threats or system failures within its domain."
2. **§11.2 outcomes over mechanics — APPROVED (John, 10.10):** delete the Citizen Voting Credential and cryptographic-matching sentences; add "Eligibility verification may not store or expose voter identity within the NVS." Replace the two-channel delivery sentence with "The Elections Panel shall inform every eligible citizen of their federal races and how to vote before each federal election." Keep secrecy, auditability, resilience, data non-sharing, and the no-State-burden rule.

**Article XI — APPROVED 2026-10-10.**

---

## Article XII — Social State and Economic Rights (1,154 words) — IN REVIEW

### Simple fixes (approved under the 10.10 process)

- §12.1 heading "The Social State and Monetary Authority" becomes "The Social State" (no MA content; the MA is §12.1.a).
- §12.1.a: open with "The Monetary Authority is an independent institution governed by §3.9 except as this section provides," then keep only the MA-specific rules: functions, exclusive currency issuance, 2/3 Senate confirmation, no single appointing majority, staggered terms, "disagreement over monetary policy, economic judgment, or a lawful certification is not cause," and the vacancy rule. Delete the restated statutory-organization sentences (two), the generic for-cause clause (§3.9), and "The EM audits MA operations and independence annually" (§9.1.b).
- §12.1.b: delete "The Monetary Authority may publish additional reports at any time…" and "further action is a matter for the Legislature."
- §12.2(2): "gives the Consuls' proposals due consideration … and is not bound by them" becomes "is not bound by the Consuls' proposals."
- §12.3: delete "no other federal body may impose a tax, duty, or levy of any kind" ("exclusive" already says it) and "No tax may discriminate on the basis of the characteristics listed in §1.6" (§1.6 and this provision's own earlier clause).
- §12.4: delete "The EM audits the Monetary Authority's management of the Endowment annually…" (§9.1.b).
- §12.6: delete "The mechanism is reviewed at intervals the Legislature defines by statute" (the EM certifies annually).

### Decisions
1. **§12.2(8) legislator pay — APPROVED fix (John, 10.10):** "(8) Where no budget is enacted when the interim appropriation takes effect, the pay of all members of both chambers is withheld from that date and released only upon budget enactment." (Old trigger never fired because §12.2(6) continues civil service pay.)
2. **§12.2(6) budget deadline — APPROVED (John, 10.10, taken as approved on moving to apply):** "Where no budget is enacted by the start of the fiscal year, or any earlier deadline defined by statute, an interim automatic appropriation takes effect by constitutional operation covering: …"

**Article XII — APPROVED 2026-10-10.**

---

## Implementation record — Articles I–XII applied 2026-10-10 (branch text-economy-review-2026-10-10)

**Result:** 28,615 → 25,828 words (−2,787, −9.7%); 180 provisions unchanged in number. `npm run world:publish-check` passes in full.

**Deviations from the logged plan (to avoid renumbering ripple across site, navigator, and State constitutions):**
- §9.2 kept as the home of the selection-independence principle; the duplicate clause in §9.1 now points to it ("each selected under §9.2"). Entrenchment in §17.1(4) is unchanged.
- §9.5.b kept as a provision, reduced to its operative sentence, instead of being folded into §9.1.
- JM audit mandate left in §9.4 (double "and" fixed, info-only duplicate removed); §9.1.c remains a pointer. The move to §9.1.c was dropped because many site pages cite §9.4 for the JM mandate.
- §7.5/§7.9 merge not applied: the overlap is partial (removal vs. mandate shortening), and both numbers are widely cited.
- Unified public confirmation lives in §4.4.a (retitled "Public Confirmation"); §4.4(5)–(7) became a single §4.4(5).

**Consequential edits found during application:**
- "Citizen Voting Credentials" was also used in §13.1, §13.2, §15.2, §15.4; those now read "authenticated through the NVS" to match the §11.2 outcome-standard decision.
- NRS pass: 61 clauses removed or shortened (~330 words), fewer than the 400–600 estimate. Kept wherever publication carried timing, condition of effect, or applied to items outside §10.1(2)'s list.
- Subsection renumbering: §2.5, §3.2, §3.5, §4.2, §4.4, §9.1.e, §10.1, §11.1.

**Site and test updates in the same batch:** glossary (Reconsideration Notice, Public Confirmation, runoff, SC removal, acting succession, §10.1 anchor), quicksheets (judiciary, fiscal, NVS, recall-removal, elections), diagrams, navigator topic answer, scenario-the-three-recusals, scenario-the-twenty-four-hours (citations), torenthia-nrs-012 and -045 (citations), three test assertions tied to replaced text, changelog entry 261010.

**Left for John (editorial policy — update or remove at discretion):** scenarios and world records describing superseded rules: fiscal notice (scenario-the-objection, scenario-the-vote, _data/scenarioBridges.json); Assembly-consent Senate bypass (scenario-first-nomination, scenario-the-holdout, torenthia-news-069, torenthia-state-varek); Citizen Voting Credential (torenthia-nrs-016/020/024/027, scenario-the-severed-clause); "warrant requirement" (scenario-the-order); "foreign intelligence" (torenthia-nrs-004); Monitor early restoration (scenario-the-twenty-four-hours).

---

## Article XIII — Direct Democracy (547 words) — IN REVIEW

### Simple fixes (approved under the 10.10 process)

- **§13.2 petition phases** duplicate §13.1's structure word for word except durations and the Phase Two threshold. Becomes "(1) Citizens may propose legislation directly to the Legislature through the two-phase petition process of §13.1, except that each phase lasts up to 10 months and Phase Two requires signatures from 10% of eligible voters nationally." (Same pattern §17.1(3) already uses.)
- **The three-year re-initiation bar and the "functionally prohibitive" clause** are stated in both §13.1(7) and §13.2(6). State once in §13.1(7) for "a petition, referendum, or initiative under this Article"; delete §13.2(6).
- §13.1(5): delete "the LM's ongoing audit of legislative compliance encompasses published findings on the character of enacted laws, which the Elections Panel and any party may reference" (Monitor findings are admissible under §4.5(3)).

## Article XIV — Military Authorization and Accountability (847 words) — IN REVIEW

### Simple fixes (approved under the 10.10 process)

- §14.2: delete "The published Monitor findings and reports remain unclassified under Article X; underlying operational records remain subject to Article X classification standards" (§9.5 and Article X already govern both).
- §14.3: "following legislative military authorization being renewed for a second time" becomes "following the second renewal of a legislative military authorization."

### Decisions (XIII–XIV)
1. **§13.2(4) veto gap — APPROVED (John, 10.10):** "(4) Once the threshold is met, if the Legislature does not enact the proposal within 90 days, it proceeds to a direct citizen referendum; passage requires 60% of votes cast with at least 50% citizen participation."
2. **§13.2(5) initiative review — APPROVED (John, 10.10):** "(5) An initiative enacted under this section is subject to this Constitution as any statute is, and may not narrow a right under Article I or appropriate funds or alter revenue; an initiative that does so is void to the extent of the conflict. Disputes are resolved by the SC under §4.5 on petition of any person with standing." Closes the back door around Article XVII's amendment thresholds.
3. **§14.4 treaty operations — APPROVED (John, 10.10):** add "Treaty-based authorization for an operation continues for up to 12 months from the moment of action; continuation thereafter requires renewal under §2.2, and §14.3 applies on the same terms as any other authorized operation."

**Articles XIII–XIV — APPROVED 2026-10-10.**

---

## Article XV — Territorial Structure and Statehood (3,142 words) — IN REVIEW

### Simple fixes (approved under the 10.10 process)

- §15.1: delete "A Territory has federal protections under Article I, accesses social state systems under §12.1, and may begin the Statehood pathway under §15.2" (Article I and §12.1 apply by their own terms; §15.2 states the pathway) and "Territories hold Assembly seats proportional to their population and participate as full voting members. Territories do not hold Senate seats; Senate representation is reserved for States" (§3.2(1) and §3.5(1)).
- §15.1.a: delete "Further transition support, fiscal coordination, and administrative assistance during Provisional status are defined by statute."
- **Judicial review of Statehood Audit findings** stated in both §15.2(7) and §15.3(10): keep the general rule in §15.2(7) ("Judicial review of any Statehood Audit finding is available for legality, process, jurisdiction, and application of the stated criteria; a court may not substitute its policy judgment for a Monitor's domain assessment"). §15.3(10) keeps only its own additions: the certification and entry into Provisional status are reviewable on the same grounds, and the Senate's political judgment under (5) is not.
- §15.3(3): delete the advisory-cooperation subsection (a "shall" with no content and, by its own terms, no authority).
- §15.3(4): delete "The certification does not itself alter the State's constitutional status" ((7) states when status changes).
- §15.3(6): delete "A passing audit ends the consecutive-failure sequence" (restates (2)).
- §15.3(7): delete "The State remains a State as provided in §15.1.a."
- §15.4: delete "Social-state protections and Article I rights continue through the transition."
- §15.5.a(2): the JMC's missed-deadline individual-vote procedure is a fallback for a fallback (10.10 rule). Becomes "Where the JMC does not publish its assessment within that period, including any extension, the remaining portion is treated as not satisfying those conditions." (Same default outcome as the current all-abstain case.)
- §15.5.a(4): delete "This Constitution does not prescribe the Convention's terms."
- §15.6: delete the "Under §9.1," pointer.
- §15.7: the three "constitutes the consent mechanism" sentences become one: "A founding status election under §16.2 during the Transition Window, or a completed process under §15.9 including its national referendum, satisfies the consent required by this section without further amendment or Popular Ratification. Recognition under §16.4 effects no territorial change; post-founding indigenous territorial transitions proceed under Article XVII."
- §15.10: delete "Procedures are established by statute."

**Pass:** §15.10's outcome-limiting design (the 19.09 worked example); §15.8, §15.8.a.

### Decisions
1. **§15.9 independence thresholds — APPROVED raise (John, 10.10):** Stage Two: "2/3 of the remaining seated members of each chamber" (recusal of the State's members unchanged). Stage Three: "2/3 of votes cast with at least 55% citizen participation" (the Popular Ratification standard). Stage One unchanged. Independence now clears every national bar an amendment would, plus the State's own vote.

**Article XV — APPROVED 2026-10-10.**

---

## Article XVI — Indigenous Sovereignty (1,065 words) — APPROVED 2026-10-10 (simple fixes only)

- §16.1: delete "The founding register is compiled and published under §19.7" (pointer).
- §16.2(6): delete "and the extension and interim protective-order provisions of §4.5 apply" (§4.5(8) applies to every SC deadline by its own terms).
- §16.2(7): delete "consistent with §5.1."
- §16.4: delete "The investigation is information-only: the JMC's findings bind no constitutional actor and compel no governmental act" (§9.1 already makes all Monitor findings non-binding); "or pursue any legal remedy available under Article I" (always true); and "Recognition under this section confers no territorial rights and effects no change to the Republic's territorial extent; any such change proceeds only under Article XVII, consistent with §15.7" (stated in §16.1 and §15.7).
- §16.5: delete "Citizenship arrangements follow §5.1 throughout."

## Article XVII — Constitutional Amendments (661 words) — IN REVIEW

### Simple fixes (approved under the 10.10 process)

- **No executive role** is stated in §17.1(1) and twice more in §17.2. One statement in §17.2: "Neither Consul has any role in the constitutional amendment process, and no signature or veto applies." Delete the duplicate from §17.1(1).
- §17.1(3): delete "Citizen initiative amendments are subject to §17.3 consistency analysis by the JM, advisory only" (§17.3(2)).
- §17.2 effect sentence becomes "An amendment takes effect upon certification of its ratification — by the LM for State Ratification, otherwise by the Elections Panel — and NRS publication, with no implementation delay or executive discretion over timing."
- §17.3(2): delete ", but a permanent public record of what the amendment changes."
- §17.3(4): "from the date of ratification" becomes "from the date they take effect" (aligns with §17.2's effect rule).

### Decisions
1. **§17.3(1)/(5) conflict rules — APPROVED (John, 10.10):** "(1) An amendment inconsistent with an existing provision is void to the extent of the inconsistency unless it expressly repeals or amends that provision." and "(5) Two amendments may be in the ratification process at the same time. Where both are ratified and conflict, subsection (1) applies to the later one, and where they are ratified simultaneously, the LM determines precedence from NRS records."
- Simple fix added: §17.3(3) compressed (states the jurisdiction phrase once): "(3) The SC resolves disputes over a ratified amendment's consistency under §4.5 on petition of any person with standing. It may not refuse to apply an amendment that has met its procedural thresholds, except that an amendment extinguishing a right designated non-derogable under §1.19.a is void to the extent of the extinguishment."

**Article XVII — APPROVED 2026-10-10.**

---

## Article XVIII — Federal Property and National Trust (620 words) — APPROVED 2026-10-10 (simple fixes only)

- §18.2: delete "Residents of the federal footprint retain full Article I rights" (Article I applies to every person).
- §18.4: delete "The Legislature shall provide by statute for the National Trust's internal organization, staffing, administration, and operational procedures"; keep the "No statute may reduce…" safeguard.

## Article XIX — Transition and Ratification (2,438 words) — APPROVED 2026-10-10 (simple fixes only)

Transition provisions are necessarily detailed and were recently reworked (§19.3.a, §19.9); this pass is light.
- §19.2: delete "The Republic exists the moment the Elections Panel certifies the threshold" (restates the Day Zero definition).
- §19.5(4): "the Legislature must pass a Veterans and National Service Benefits Act within the first budget cycle following Phase 4" becomes "the Legislature must provide for their administration by statute within the first budget cycle following Phase 4" (unnamed-statute rule).
- §19.8: "no amendment may expand the scope" becomes "no amending statute may expand the scope" (avoids confusion with constitutional amendment).

## Article XX — Associated Communities (750 words) — APPROVED 2026-10-10 (simple fixes only)

- §20.2: "Equal parties; neither constitutionally superior." is a fragment. Becomes "The Republic and an Associated Community are equal parties to the compact; neither is constitutionally superior."
- §20.6: "requires Senate ratification by 2/3 of full seated membership, consistent with the treaty ratification threshold under §3.6" becomes "requires Senate ratification under §3.6" (§3.6 already sets 2/3 for compacts); delete "Under §9.1, either chamber may request a JM assessment of compact compliance before proceeding to ratification" (§9.1 lets any chamber request any assessment).

---

## Implementation record — Articles XIII–XX applied 2026-10-10

**Result:** 25,828 → 25,189 words. Whole review: 28,615 → 25,189 (−3,426, −12.0%). 180 provisions. `npm run world:publish-check` passes.

**Renumbering:** §13.2 (now (1)–(3)); §15.3 (now (1)–(9)). §15.5.a numbering is unchanged, so the live Korda Convention references to §15.5.a(1) and (4) remain valid.

**Site updates in this batch:** scenario-the-severed-clause (its analysis rested on the old initiative near-immunity; now explains initiatives as ordinary statutes and contrasts them with amendments; citations updated) and scenario-the-second-path (citations). §2.7 "pause the review period" wording fix plus the glossary entry. Changelog entry 261010 (XIII–XX).

**Added to John's list:** scenario-the-third-strike and _data/scenarioBridges.json describe the deleted §15.3 advisory-cooperation subsection.
