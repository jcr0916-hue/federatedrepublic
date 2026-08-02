# Constitution Review — Open Findings

**Started 260731.** Systematic provision-by-provision review against the ten design principles in
`CONSTITUTIONAL-DESIGN-PRINCIPLES.md`.

**Progress:** Articles I, II, III complete. Working through the I-III backlog before starting IV.

**Standing filter:** constitutional language states the obligation and its floor; statute states the
machinery. A finding only counts if statute *couldn't* fix it. A conflict between two constitutional
provisions is always genuine; a missing implementation detail usually isn't.

---

## RESOLVED — incorporated 260801 (legislator lifetime caps corrected)

- **§3.2(4) / §3.5(3)** — both had drifted to "no cumulative lifetime restriction applies" after
  cooling-off, meaning unlimited return service — a real divergence from the 18-year symmetric design
  actually agreed on earlier in the design conversation, caught only when John compared the live text
  against that decision directly. Fixed: Assembly gets up to 3 additional terms after cooling-off (6
  consecutive + 3 = 9 terms x 2 years = 18-year max); Senate gets up to 1 additional term (2
  consecutive + 1 = 3 terms x 6 years = 18-year max). Both chambers converge on the same lifetime
  ceiling by design, despite different term lengths.

## RESOLVED — incorporated 260801 (LC term restructuring + general cooling-off rule)

Emerged organically during discussion, not originally a tracked finding — worth recording fully
since it's a substantial structural change.

- **§2.1** — LC's single non-renewable 6-year term (absolute lifetime bar, no re-election ever)
  restructured to 4-year terms, up to 2, 8-year lifetime maximum matching the CC's own cumulative
  cap. A former LC may not seek a second term at the NEXT election, but may at any election
  thereafter — a mandatory gap, not simple immediate re-eligibility. Deliberately NOT copying the
  CC's exact mechanic (CC's gap is open-ended/multi-stint, tied to Assembly cycles since CC is
  Assembly-selected; LC's is a clean 2-term cap given LC's fixed-length terms).
- **§7.2(1)** — "Consular elections every six years" updated to "every four years" to match. Checked
  and confirmed this is the ONLY other cross-reference to the old LC term length anywhere in the
  document (CC has no fixed election cycle at all, tied to Assembly confidence instead).
- **§7.4(9)** (NEW) — general rule: a cooling-off period from one office does not bar holding/seeking
  any OTHER office for which a person is otherwise eligible, unless expressly provided otherwise.
  Placed in §7.4 (Eligibility and Disclosure for Federal Office) since it's a general eligibility
  default, not something that belongs to any one office's own provision.
- **§2.17** (NEW) — the express exception to §7.4(9) for the executive branch: a person cooling off
  from CC or LC may not serve as a minister, domain officer, or in an acting executive capacity
  during that period. Closes a live loophole the general rule alone would have reopened: an outgoing
  LC serving as Director of Intelligence/Defense during their own gap, staying adjacent to the same
  military/intelligence apparatus the gap exists to create distance from. Legislature, judiciary, and
  other offices remain open. Appended as new provision (matches the §1.24 pattern — new provision,
  not inserted mid-sequence) rather than buried inside either Consul's own term provision, since it
  governs both.
- **§2.5(2)** — trimmed now-redundant "may hold an Assembly seat but may not be elected or designated
  Civic Consul" clause; covered twice over now by §7.4(9)'s general default and §2.17's confirmation
  that only the executive branch is restricted.

**Process note:** the annotated.html insertion for §2.17 went wrong twice before landing correctly —
first inserted in the wrong location entirely (after Article III's own header/intro instead of before
it, a semantic placement error not caught by div-balance checks alone), then a "removal" script that
computed the fix correctly but never wrote it to disk, leaving a duplicate. Both caught by re-running
full verification from scratch rather than trusting intermediate state, including a stack-based
open/close scan that pinpointed the exact unmatched tag. Final state fully verified: 170 provisions,
divs balanced via strict stack scan (not just count), all 21 intros and 16 qs-icons intact.

## RESOLVED — incorporated 260801 (§1.6)

- **§1.6** — economic status sat at strict scrutiny alongside race, religion, and the rest, which
  put §1.6 in tension with the Republic's own §12.1 social-state mandate: means-tested assistance
  only functions as a concept if eligibility/amount are calibrated to economic need, which is exactly
  the distinction §1.6 subjected to its highest bar. Fixed by direction, mirroring the age carve-out
  already in the same provision: distinctions that extend additional benefits/assistance/support to
  persons of lesser economic means (§12.1 named as the clearest example, not the only one) drop to
  rational basis review; distinctions that burden or restrict access based on wealth stay at strict
  scrutiny, undiminished. Confirmed via full-text check that §12.3's taxing power does NOT
  constitutionally mandate progressive rates — that potential collision is avoidable by statute and
  wasn't part of the actual fix needed.

## RESOLVED — incorporated 260801 (§1.3)

- **§1.3** — "within the Republic's jurisdiction" was a territorial test on the document's absolute,
  non-derogable torture prohibition, the exact ambiguity behind real-world offshore-detention and
  rendition controversy. Fixed: the test now runs on who is acting, not where the victim is — no
  person, wherever located, may be subjected to such treatment by a Republic agent or officer acting
  in that capacity, extended to anyone acting at the Republic's direction or with its acquiescence
  (closing the third-party outsourcing route). Mirrors §1.5's existing anti-jawboning pattern
  (intermediaries acting on the government's behalf). Non-derogable, so this now binds Republic
  military and intelligence personnel operating anywhere, with no emergency exception ever available.

## RESOLVED — incorporated 260801 (§1.4, §1.5)

- **§1.4** — confirmed no change needed. Original concern was three-part: safety, voluntariness,
  compensation. On review: safety is already §1.3's job (unsafe/dangerous conditions read as cruel or
  inhuman treatment); voluntariness was never actually missing — §1.4's entire function is carving
  prison labor out of the forced-labor prohibition, so compulsion is the deliberate point, not a gap;
  compensation is a genuine policy choice (John declined to mandate a figure, correctly noting any
  number would be arbitrary and belongs to statute if anywhere). Nothing left to fix once each piece
  is properly credited to where it actually lives.
- **§1.5** — the only scrutiny standard in the provision (governing time/place/manner regulation of
  expression and assembly) was strict scrutiny outright, an unusually high bar for routine, content-
  neutral regulation like permits and noise ordinances. Fixed: that clause now requires intermediate
  scrutiny specifically; every other protection (viewpoint non-discrimination, the anti-jawboning
  clause, religion's belief/practice split) is unchanged. Note: an earlier verbal "reminder" of this
  provision's text was inaccurate — the actual JSON text was checked and confirmed before any edit
  was made, and the fix was re-confirmed against the real text before incorporation.

## RESOLVED — incorporated 260801 (§1.15)

- **§1.15** — silent on dual State/Republic prosecution for the same conduct. Now explicit: both may
  prosecute independently, but where both convict, sentences run concurrently and the person serves
  only the greater term. Acquittal or conviction in one doesn't affect the other's case, symmetric in
  both directions. Deliberately excludes Territories and local governments — §15.1's local-concern-only
  authority and §15.8's fiscal-protection-without-sovereignty mean neither is a genuine second sovereign;
  both stay governed by the original same-offense bar. Cross-checked against real dual-sovereignty
  doctrine (Gamble v. United States; Puerto Rico v. Sánchez Valle for the Territory-exclusion logic
  specifically) — the concurrent/greater-term cap is a genuine improvement over the real-world doctrine,
  which has no such safeguard and has drawn sustained scholarly criticism for exactly that gap.

## RESOLVED — incorporated 260801 (§1.9 split)

- **§1.9 internal contradiction** — absolute bar on any action making voting "more difficult, less
  accessible, or less secure" collided with a separate "consistent with security" balancing clause.
  Fixed: the bar now turns on purpose or substantial effect of suppressing access, so a genuine
  security measure no longer competes with an absolute rule that caught everything.
- **§1.9 two-subject bundling** — voting and marriage/family shared one provision, and the provision's
  own name ("Democratic Participation and Family") named both. Split: §1.9 is voting only, renamed
  Democratic Participation; family right moved to new §1.24 ("Every person holds the right to found
  a family"), appended rather than inserted so nothing renumbered.

## RESOLVED — incorporated 260801 (batch two)

- **§3.4** — no floor on statutory minimum sitting days. Inverted the default: regular session on every
  business day, recess capped at 45 days/year, reserved for constituent engagement specifically (not
  general leave), each period scheduled in advance and published to the NRS 30 days ahead.
- **§3.7** — non-compliance mechanism had a response but no trigger point. Now runs from 1 year after
  the obligation arises.
- **§2.4** — domain officer framework was hidden inside "International Agreements." Split into §2.4
  (treaties/trade only) and new §2.4.a (Domain Officers). §3.10's citation repointed.
- **§3.5(9)** — restated §3.1's origination rule instead of cross-referencing it. Now defers to §3.1.
- **§2.16(2)(a)** — five-member floor for Council incapacity determination had no fallback. Added:
  where fewer than five are in office, the other Consul and Chief Justice may determine jointly.
- **§12.6 confirmed already covers recess travel** — "benefits reflect the functional requirements of
  the office" already reaches constituent-engagement travel; no new text needed, just confirmed.

**Set aside, not forced through:** §2.5(6)/§2.9(6) looked like a simple duplication but isn't — shared
procedural machinery, genuinely different succession chains and tiebreakers by chamber. A real fix
needs extracting the shared mechanics into §2.16, not a cross-reference swap. Moved back to open findings
below rather than incorrectly closed.

## RESOLVED — incorporated 260731

- **§1.13** — sealed proceedings had no ceiling (Sunlight Test). Now 10 years from final judgment,
  one 5-year extension with JM review, absolute at 15, automatic publication on expiry, plus a
  consent clause letting the accused publish early absent third-party harm.
- **§1.16** — cited "adequacy standards certified under §12.1"; **§12.1 contains no certification
  mechanism at all.** Broken since drafting. Now honestly states the standard is statutory, with EM
  annual assessment.
- **§1.17** — same EM assessment added, so education and social assistance are finally parallel.
- **§9.5** — Monitor findings now delivered to the responsible officer and both chamber Speakers.
  "Imposes no obligation to act" keeps it inside the observe-and-report mandate.
- **Preamble** — revised to include consent of the governed, self-government of constituent
  communities, and prior indigenous sovereignty; restraints enumerated inside the existing argument.

---

## SELF-INFLICTED — introduced by Claude, needs correction

### §15.4 signature threshold — 25%, hardcoded, justified with a fabricated precedent
**Priority: fix during Article XV review, or sooner.**

During the §15.5.a design session I proposed a 25% signature threshold for a portion-of-Territory
merger referendum, and justified it by telling John that §13.1/§13.2 use 15%. **They do not. There
is no 15% figure anywhere in the document.** I invented the comparator.

**What the real petition thresholds are:**

| Provision | Phase One | Phase Two | Form |
|---|---|---|---|
| §13.1 Optional Referendum | 0.5%–3%, across ≥1/3 of States and Territories | 5% nationally | range, statute picks figure |
| §13.2 Citizen Legislative Initiative | 0.5%–3%, across ≥1/3 of States and Territories | 10% nationally | range, statute picks figure |
| §15.4 (as I wrote it) | **25%, single phase** | — | **fixed number in constitutional text** |

**Three distinct problems:**
1. **Hardcoded figure where the document uses range-plus-delegation.** §13.1/§13.2 say "not less than
   X nor more than Y — defined by statute." That is the drafting-level principle exactly. I put a
   single hard number into constitutional text.
2. **Fabricated precedent.** The 15% claim was invented, and John had no reason to doubt it since
   everything else was being checked against the JSON.
3. **No time limit.** §13.1 bounds collection at 8 months, §13.2 at 10. §15.4 has none — a petition
   could collect indefinitely.

**The one legitimate argument for a higher figure, which I owed John at the time instead of a fake
citation:** §13.1/§13.2 percentages are of the *national* electorate, so 10% is millions of
signatures. §15.4's pool is a defined portion of one Territory — possibly a few thousand people, all
directly affected. A higher percentage of a much smaller, concentrated pool is defensible.

**Proposed correction (John to set the range):**
> "...is triggered by a petition signed by citizens equal to a percentage of eligible voters within
> the defined portion — defined by statute at not less than 5% nor more than 15% — authenticated
> through the NVS using Citizen Voting Credentials, and certified by the Elections Panel. The
> petition period may not exceed 12 months."

**Note:** world content (nrs-016) describes this as a certified petition threshold without naming a
figure, so correcting the constitutional text does not create a canon conflict. nrs-020's reference
to an LC ballot-access "signature threshold established by statute" is a *different* matter and is
fine as written — that is ordinary delegation, not an invented constitutional number.

---

## TIER 2 — clean fix available, but the design question needs John's call first

### §2.11 — expedited emergency activation bypasses its own trigger
Section requires the Assembly be unable to reach quorum for **30 consecutive days**. Final sentence
then allows "expedited activation" on joint certification by the Acting Civic Consul and the Chief
Justice, with **"catastrophic circumstances" undefined and no time floor at all.** Two people can
certify the Senate into emergency legislative authority immediately, making the 30-day safeguard
optional whenever they agree it is. Signatories are well-chosen (cross-branch, neither gains the
power) — the gap is that nothing bounds *when* it may be invoked or how long it lasts.
**Fix:** hard duration on expedited activation (14 days, matching §1.19), lapsing unless the ordinary
30-day trigger is independently met. **Open question:** should "catastrophic circumstances" be
defined, or is certifier judgment deliberate?

### §1.18 — environmental obligation is self-administered (Bad-Faith Test)
Requires action "proportionate to identified harms" — but nothing says who identifies them or
requires anyone to look. A government that never identifies a harm owes proportionate action to
nothing. Compare §12.8 (EM certifies annually) and §15.2 (JMC audits on schedule), both of which put
identification in an external actor's hands.
**Open question:** does naming an identifier belong at constitutional level, or in the statutory
framework §1.18 already delegates? This may be the level filter biting.

### §2.7 vs §2.3.a — asymmetric veto safeguards
LC veto (§2.3.a) requires the concern be genuine and within the security domain, says "a general or
speculative security connection is insufficient," and lets either Speaker request an **EM assessment**.
CC suspensive veto (§2.7) requires only "written grounds" — no substantive standard, no external
review. **Open question:** is the asymmetry justified by the CC holding residual authority, or should
§2.7 come to parity?

### §3.3 — "primary criteria" / "intentional dilution" may gut the redistricting ban (Bad-Faith Test)
"Maps may not be drawn using [banned data] **as primary criteria**" and "no **intentional** dilution."
Both bans turn on the mapmaker's internal reasoning — nearly unprovable, and both words permit
secondary/incidental use of exactly the data being banned. The rest of §3.3 is objective and testable
(population equality, contiguity, compactness, LM review, standing to challenge before the SC) —
the intent-based softeners sit oddly against that.
**Open question:** deliberate softening, or should these be effects-based instead?
**Note:** this entry was accidentally dropped from the tracker during the 260801 batch-two edit and
has been restored from the original Article III review findings.

---

## TIER 3 — genuine design questions, not drafting errors

### §2.13 — popular removal track
Legislative removal requires 2/3 of both chambers **and stated grounds**. Popular track requires a
simple Senate majority to refer, **no grounds at all**, then 60% referendum. The asymmetry may be
correct — recall is a political judgment. But **the Speaker takes Acting Consular Authority from the
moment of referral**, before any vote, and that Speaker is the officer who benefits. A bare majority
displaces the Legat Consul with no grounds requirement; the referendum may then fail.
**Options:** delay assumption until the referendum succeeds · raise the referral threshold · accept
as intended.

### §1.22 — immunity may have no threshold effect
Protection doesn't extend to "acts that violate any provision of this constitution" — but
establishing that violation is usually the entire point of the suit. Immunity can therefore only be
resolved *after* the merits, protecting nobody at the pleading stage. Either that is intended
(protection only against liability for lawful acts — real but narrow), or it needs a different
standard to have threshold effect.

### §2.5(6) / §2.9(6) — near-identical duplication (One Home Rule)
The two temporary-incapacity succession provisions run in close parallel, differing only in chamber
and tiebreaker, both depending on §2.16 for the trigger. Parallelism aids readability, but it is the
same rule stated twice — amend one, forget the other.

---

## TIER 4 — probably resolve as "no change," but John should confirm

- **§1.7** — "may not compel medical decisions" is unqualified, apparently foreclosing vaccination
  requirements outside emergencies (§1.7 is derogable, so the epidemic case is covered).
- **§1.10** — confirmed, leave as-is: "every person" (not "every citizen") for arms rights is
  consistent with the document's own pattern — "citizen" gates political rights, "person" gates rights
  treated as inherent. Working correctly, not an inconsistency.
- **§2.15** — confirmed, leave as-is: the funding-floor/shape-alterable asymmetry is the right design.
  Definancing is the classic way to neuter an independent prosecutor without touching formal
  independence, so that's exactly the lever worth constitutional protection; ordinary restructuring by
  simple majority is legitimate flexibility.
- **§1.15** — resolved, see above.
