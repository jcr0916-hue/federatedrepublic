# Essay Outline — The Twelve Tests

Status: framing / structure notes for drafting, not a draft. Working title only.
Last updated: 2026-10-01

Source material: `docs/CONSTITUTIONAL-DESIGN-PRINCIPLES.md`, which explicitly identifies
itself as the source for this paper: *"The Twelve Tests are themselves the first paper
in the design-rationale series, and that paper is where the clustering should be settled
rather than assumed."* (closing lines). This outline is built to actually do that settling.

Site context: `.paper-title` / `.papers-header` CSS classes already exist on the site with
no page using them yet — this would be the first. The register target is the project's own
existing "design rationale" voice, already defined and running in production in
`api/annotate.js`'s system prompt — explanatory ("this is why"), not persuasive
("this is better than that").

---

## Thesis — the through-line every section should serve

Good constitutional review is neither pure intuition nor a mechanical checklist. It's a
structured set of questions, applied with judgment — and the record shows that judgment
being exercised differently on structurally similar facts, for stated reasons, not
mechanically. This paper is both the record of that methodology and the first real
exercise of it, including on itself.

**Drafting guardrail that applies to every section below:** if a section is just defining
terms, it's not done yet. Every family section needs to show the test catching something,
or correctly declining to catch something that looks similar.

---

## Scope — decided, resolves "principle vs. rule" in 1–2 sentences up front

**The problem:** "principle" standardly claims to travel to any case, not just the one at
hand (Dworkin's rules-vs-principles distinction turns on exactly this — a principle has
weight across many cases, which is what makes it a principle rather than a rule). The
Sunlight Test's canonical form — "no permanent withholding; temporary confidentiality
requires a ceiling" — doesn't just diagnose a provision's structure, it prescribes a
verdict. Someone who holds that the governed shouldn't know everything the government does
(a real, serious position, not a strawman) runs the identical diagnostic, gets the
identical finding, and correctly reads it as a feature rather than a defect. The verdict
doesn't travel to someone who doesn't share the underlying commitment. That's true, in
varying degrees of exposure, of most of the twelve — Bad-Faith and Graceful Degradation
sit close to universal (almost no sincere drafter wants their own text exploitable or
undefined-on-failure); Sunlight, Institution Test, and Democratic Legitimacy sit at the
exposed end, each resting on a real, contestable commitment.

**The fix:** a qualifier restores the word's legitimate weight, the same way "personal" does
in "personal principles" — it doesn't weaken the claim, it states the actual scope instead
of leaving it implicit and unbounded. Define the project once, up front, in 1–2 sentences,
and everything downstream is a principle *for that defined thing*, not an overclaim about
constitutional design as such.

**Proposed opening language (Section I), pulling from existing project copy rather than
inventing new self-description:**

> These are the twelve [principles / tests — pick one, see below] of the Federated
> Republic: a constitutional republic built on a dual executive, independent Monitors, a
> permanent public record, rights no majority can strip, and statehood earned by audit.
> [Attribution note for drafting: this phrase is the project's own existing self-description,
> already in production in `api/survey.js`'s system prompt — not new language, a citation
> of what the project already says about itself.]

**Effect on the rest of the outline:**
- "Principle" can now be used confidently throughout the paper without a running hedge —
  the scope was stated once, at the top.
- Section III's job sharpens: each family's verdicts should visibly trace back to this
  opening sentence (Sunlight → "permanent public record"; Monitor selection → "independent
  Monitors"; etc.) — this is the paper demonstrating the scope-claim, not just asserting it.
- Section V's fourth question (does the four-family clustering hold) no longer needs to
  re-litigate universality from scratch — that's resolved by definition in Section I. V
  keeps a short callback instead of a full argument (see V below).
- **Still open: "principles" or "tests" in the title/running text?** The source doc uses
  both inconsistently (titled "Constitutional Design Principles," but every individual item
  is called a "Test" throughout the body). Worth deciding deliberately while drafting — the
  scope fix above makes either word defensible now, so this is a style choice, not a
  correctness one.

---

## Voice and register — decided

**Byline: unsigned, institutional voice.** No pseudonym.

**Register: builds from plain to dense as the paper progresses.**
- **I–II: plainest.** A reader with no prior exposure should be oriented by the end of II.
- **III: transitional**, density rising with the evidence as it goes (A → B → C → D).
- **IV: dense but short** — a single practical test deserves a tight register.
- **V: full density** — the paper's actual argument, and should read like it.
- **VI: pulls back down**, closer to I–II, so the paper lands rather than just stops.

---

## I. Framing

**Purpose:** establish what this paper is, why it exists now, and state its scope in the
first 1–2 sentences (see "Scope" above).

**Reference material:**
- Scope-defining sentence — see proposed language above.
- Provenance, quote directly: *"The twelve principles have been in active use across
  scenarios, amendment rationales, and design sessions, but had never been written down in
  one place."* (`CONSTITUTIONAL-DESIGN-PRINCIPLES.md`, Status line)
- Confidence-marking system, worth explaining briefly since it's an honesty mechanism the
  paper should model, not just mention:
  - **[ATTESTED]** — named and applied in existing published content.
  - **[CORE]** — a compressed canonical definition already existed in standing project
    notes; quoted verbatim, elaboration beyond it is not authority.
  - **[RECONSTRUCTED]** — no canonical definition existed; inferred, needs confirmation.
- The terminological tension, worth naming directly rather than smoothing over: the source
  document's own title is "Constitutional Design Principles," its own summary line calls
  them "the twelve principles," and every individual item is headed "— Test" throughout
  the body. The paper is the place this gets resolved on purpose (see "Scope" above).

**Guardrail:** don't oversell certainty. The honest opening is doing real work — consistent
with what the tests themselves demand of the constitution.

---

## II. The problem these tests solve

**Purpose:** motivate the methodology before presenting it, and establish the review order
that III relies on.

**Reference material — quote the suggested order directly:**
> "Suggested order per provision — Family A first, since a provision that shouldn't exist
> doesn't need its drafting scrutinized:
> 1. Level check — is this pitched at constitutional or statutory altitude?
> 2. Family A — should this exist here, in one place, as its own thing?
> 3. Family B — what does a bad-faith actor do with it, and what happens when it fails?
> 4. Family C — where does its legitimacy come from, and who can see it operate?
> 5. Family D — does its procedure match comparable functions and reuse familiar
>    constitutional machinery?
> 6. Internal consistency — does it contradict itself, or any other provision?"
> ("Using This In Review")

**Guardrail:** keep this specific to why *this order* is the design — not a generic "why
constitutions need review" essay.

---

## III. The four families, with evidence — the bulk of the essay

### III.A — Family A: "Does this need to exist at all?"
Tests: One Home Rule, Institution Test, Unique Function Test.

**Reference material:**
- One Home Rule, retired example — honest gap worth keeping as-is, quote directly:
  *"Retired 19.09: the standing example here was §1.9 bundling voting rights with marriage
  and family formation. Re-checked against the live text — §1.9 is now purely democratic
  participation, so the bundle was resolved at some point and the example no longer
  illustrates anything. No replacement example found."*
- Institution Test and Unique Function Test currently have no worked examples in the
  source doc at all — both marked [RECONSTRUCTED]. Say so plainly rather than inventing one
  to make the subsection feel complete.

**Guardrail:** resist manufacturing a replacement example. The source doc doesn't have one.

### III.B — Family B: "Assume bad faith. Then what?" — strongest evidence in the essay
Tests: Bad-Faith Test, Actor Test, Graceful Degradation Test.

**Reference material:**
- **§1.4 prison-labor fix** (Bad-Faith Test). Problem, quoted: *"the document declares it
  absolute and forbids derogating it in any emergency, then leaves the Legislature an
  unconditioned definitional exit: no compensation floor, no voluntariness requirement, no
  limit on hours or conditions, no bar on labor for private profit."* Resolution: *"now
  requires conviction by a court, and labor for the benefit of a private party requires the
  person's consent."*
- **Self-defeating delegation, named pattern** — quote the definition directly: *"a limit
  on the Legislature whose only activation is a statute the Legislature must pass. Absent
  the statute the limit does not bite, and the body that would be constrained is the body
  that must act."*
- **The central worked argument — five similar gaps, three different resolutions, each for
  a stated reason:**
  - §7.10(4) — **fixed.** Threshold defaults to zero until a statute sets one. Final text:
    *"Constitutional officers may not accept gifts above a de minimis threshold defined by
    statute; until such statute is enacted, the threshold is zero."*
  - §8.4 — **left open, by choice.** Reasoning, quoted: *"§8.4's own text... presumes the
    statute is already enacted and running, so the gap is theoretical rather than live:
    nothing is currently un-bitten. No constitutional floor was added; a floor here would
    mean inventing a fallback financing mechanism or deadline the Constitution doesn't
    otherwise need."*
  - §15.3(2) — **fixed**, reusing an existing figure rather than inventing one (Process
    Symmetry at work inside a Family B fix — worth a forward-pointer). Final text: *"...the
    period is 90 days"* — reusing §15.2(6)'s existing 90-day figure for the same kind of
    interim window.
  - §9.8 — **left as-is**, because it already has graceful degradation built in: *"the JM
    publishes a compliance breach immediately regardless of statute, and §9.8(5) gives the
    actual worst case... a separate, statute-independent automatic fallback."*
  - §11.1(8) — **fixed, but not with a deadline** — the gap was a missing actor, not a
    missing clock: *"until the statute exists, the panel may adopt such a measure by
    majority vote of its own seated members"* — reusing §11.1(9)'s existing majority-vote
    mechanism rather than inventing a new one.
- **Graceful Degradation attested catch** (§2.5(6)(iii)/§2.9(6)(iii) tiebreaker) — quote:
  *"§2.5(6)(iii) resolved a tie on equal continuous service by deferring entirely to
  statute, with no constitutional fallback, while the exactly parallel §2.9(6)(iii) resolved
  it self-executingly."* Both now state a floor. (Cross-reference to III.D — same facts also
  demonstrate Process Symmetry.)

**Guardrail:** don't flatten the self-defeating-delegation cases into "five examples of the
same fix." The reasoning for *why* each was resolved differently is the actual point.

### III.C — Family C: legitimacy and visibility
Tests: Democratic Legitimacy, Transparency, Informational Power, Sunlight.

**Reference material:**
- **Sunlight attested example, §10.2** — quote: *"no permanent secrecy, temporary secrecy
  only on stated statutory grounds, hard ceilings of 25 and 30 years, and automatic
  publication on expiry requiring no further government act."* And: *"the void rule means
  'abuse fails retroactively, not just prospectively.'"* — this is the section that should
  visibly trace back to the opening scope sentence's "permanent public record" clause.
- **Informational Power attested use** — quote: *"the same transparency that binds
  officials binds the money that seeks them"* — the test running in the citizen's favor.
- **Democratic Legitimacy / Popular Sovereignty connection** — the source doc names the
  concrete illustrations directly: §13.1, §13.2, §17.1/§17.2, §2.13, §9.2/§9.3,
  §15.4/§15.6/§15.7/§15.9, §18.4. This is also flagged as a *future* paper candidate in the
  series — a light forward-pointer here is enough, don't develop it.

**Guardrail:** keep Transparency and Sunlight visibly distinct even though V resolves
whether they should collapse — don't pre-resolve it here by blurring the definitions.

### III.D — Family D: procedural coherence
Tests: Process Symmetry, Procedural Familiarity.

**Reference material — the contrast pair is the point, use both together:**
- **The catch:** §2.5(6)(iii)/§2.9(6)(iii) — *"Same function, same result, two procedural
  shapes. The divergence is an artifact of the order they were drafted and amended in, not
  a difference in role or risk."*
- **The correct non-catch:** the three Monitor Generals — LM nominated by the SC, EM
  jointly by the two Speakers, JM by public lottery. Quote the governing constraint: §9.1
  requires each Monitor be *"selected by bodies other than those it oversees"* — three
  different methods, one principled reason, explicitly called *"a textbook case of
  difference reflecting constitutional purpose"* in the source doc.

**Guardrail:** a test that never declines to flag something isn't demonstrated as a real
test, just an alarm. Use the pass example, not only the catch.

---

## IV. The Drafting-Level Principle, kept separate

**Purpose:** explain why this isn't a thirteenth test — different axis (altitude, not
design correctness).

**Reference material:**
- Canonical quote, attributed in the source doc to John directly (13.09): *"We should
  specify that it must be provided, not how they provide funding, for instance."*
- Worked examples, all three retired flags from the Article I review:
  - §1.1 — *"where does the money come from?"* Not constitutional — courts appoint counsel
    at public expense; funding mechanics are legislative.
  - §1.8 — *"no exigent-circumstances exception."* Not a gap — the Legislature establishes
    the warrant framework by statute; that sentence already delegates the detail.
  - §1.11 — *"72 hours may be operationally hard."* Not a flaw — setting the outer limit is
    exactly what constitutional language should do; meeting it is administration.
- Closing test, quote directly: *"if the Legislature could fix this with a well-drafted
  statute tomorrow, without amending anything, it is probably not a constitutional
  defect."*

**Guardrail:** should read as a check on the other twelve, not a thirteenth member — say
explicitly it's a different kind of question (pitch, not design).

---

## V. Where this paper does its actual work

**Purpose:** commit to real positions on the three open boundary questions. The fourth
question (does the clustering hold) is now a short callback to Section I's scope sentence,
not a full argument — that's the one structural change from the previous draft of this
outline.

**1. Actor Test vs. Institution Test — sequential, and the review order already encodes
it.** Institution Test asks whether a body should exist; Actor Test asks whether its power
is bounded once it does — two sequential questions about the same actor. The "Using This In
Review" order already runs Family A before Family B. The fix is making the dependency
explicit in prose, not restructuring anything.

**2. Sunlight vs. Transparency — stay separate.** Transparency catches "no contemporaneous
trace exists at all." Sunlight catches "a trace exists but is permanently suppressed." A
record can exist and never surface — satisfying one, violating the other — which is exactly
what §10.2's hard ceilings guard against. Different failure modes, different attested
examples already doing different work.

**3. Bad-Faith vs. Graceful Degradation — related, not nested.** Graceful Degradation is a
mechanism that breaks down or goes silent (deadlock, vacancy, missed deadline) — no answer
even under universal good faith. Bad-Faith is a mechanism that runs exactly as designed and
is still weaponizable — §1.4 worked exactly as written, and that was the problem. The
self-defeating-delegation pattern — the source doc's own phrase, *"where this test meets
Graceful Degradation"* — is the genuine overlap case, which is better evidence for
"related, not identical" than for collapsing or separating them cleanly.

**4. Meta-question, now a callback, not an argument:** the four-family clustering holds,
and resolving 1–3 shows why — each apparent threat turned out to be a more precise internal
relationship, not a reason to restructure. One line gesturing back to Section I's scope
sentence is enough: these are the Federated Republic's principles, stated as such from the
opening, not a claim about constitutional design as such.

**Guardrail:** this section is the essay's actual payoff. If time runs short while drafting,
cut III's examples down before cutting this section's argument down.

---

## VI. Conclusion

**Purpose:** state what the methodology buys the project, and point forward.

**Reference material:**
- Popular Sovereignty as the named next-paper candidate (see III.C).
- Closing citation, quote the source doc's own last lines directly — a clean way to end,
  since it states the mandate this paper was written to fulfill: *"None of this has been
  run through a structured analytic technique. The Twelve Tests are themselves the first
  paper in the design-rationale series, and that paper is where the clustering should be
  settled rather than assumed."*

**Guardrail:** don't re-summarize all twelve tests here. Point forward, don't rewind back.

---

## Framing decisions — settled

1. **Byline:** unsigned, institutional voice.
2. **Register:** builds from plain (I–II) to full density (V), pulling back down for VI.
3. **Section V ambition:** commits to real positions on all three open questions; the
   fourth (clustering) is now a callback to Section I, not a standalone argument.
4. **"Principle" vs. "rule":** resolved by scoping — a 1–2 sentence project definition up
   front (Section I) makes "principle" accurate throughout, since it then claims only to
   hold within that stated scope. Still open: whether running text prefers "principles" or
   keeps the source doc's "tests" — a style choice now, not a correctness one.

No open framing decisions remain that block drafting.
