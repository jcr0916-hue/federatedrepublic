# AI Model Routing and Escalation Plan

Status: Planning / testing only
Last updated: 2026-10-04

## Purpose

The goal is no longer to find a single AI model capable of replacing the current Sonnet-class model across the Federated Republic website.
The preferred direction is a task-specific AI architecture in which inexpensive models handle bounded work and progressively more capable models are used only when necessary.
The objective is to reduce reliance on premium models without reducing source fidelity, constitutional accuracy, or canon discipline.

---

## Open scope question — decide before Phase 1

This plan currently benchmarks against constitutional lookup/citation-style questions ("What is the Civic Consul?", "Does acting service count toward the eight-year limit?"). That is a different target than the original motivation for this line of research, which was cutting cost on NRS background-content *generation* (see the earlier GLM-5.3-Flash cost-reduction discussion). The site currently has four live AI-backed features: Constitution Navigator, Provision Annotator, Constitution Questionnaire, and the Living Crossroads classifier. They have materially different risk profiles and should be routed and benchmarked separately.

Before Phase 1, decide explicitly which application this architecture is meant to serve:
- **A public constitutional lookup/Q&A tool** — not yet built or committed as a feature. Citation precision and the source-safety rule (below) matter enormously here; a wrong or invented citation shown to a site visitor is a real credibility problem.
- **NRS background-content generation** — the original cost-reduction target. Creative latitude within established canon is tolerable in a way that invented case citations are not; the discipline that matters most here is staying inside canon, not citation precision.
- **Both, with different tiering per application.** Plausible, but should be designed as two separate routing configurations rather than one shared benchmark, since "fatal error" means something different in each.

Don't let the choice of benchmark questions decide this by default.

---

## Core conclusion

Different website functions have different reasoning and retrieval requirements.
A model should not receive the entire Federated Republic knowledgebase merely because some other task requires broad access.

Examples:
- "What is the Civic Consul?"
  - Narrow constitutional lookup.
  - A small inexpensive model may be sufficient.
- "Does acting Civic Consul service count toward the eight-year limit?"
  - Direct constitutional rule.
  - Small model should normally answer.
- "How does the Civic Consul interact with the Assembly?"
  - Requires several constitutional provisions and synthesis.
  - May require a stronger model or multi-model pipeline.
- Complex constitutional ambiguity, broad canon research, or cross-domain analysis:
  - May require escalation to a premium model.

The system should therefore route by task rather than use one model for everything.

---

## GPT-OSS-120B testing

GPT-OSS-120B was manually tested against the current Constitution.

### Strengths

120B generally performed well when:
- the controlling rule was explicit;
- the relevant source was confined to one provision;
- the question involved straightforward application;
- the model was asked to interpret a bounded constitutional source set.

Examples of strong performance included:
- residual executive authority of the Civic Consul;
- acting service exclusion from the eight-year CC lifetime limit;
- repeat suspensive-veto prohibition;
- fiscal-notice mechanics;
- Senate review extensions;
- single-subject publication reset;
- optional-referendum exclusions.

### Recurring weaknesses

The principal problem was not basic comprehension. It was overextension after reaching a correct answer.

Observed failure patterns:
1. Correct answer followed by unnecessary incorrect detail.
2. Confusion between nearby but distinct constitutional mechanisms.
3. Incorrect subsection citations.
4. Converting reasonable inference into an asserted constitutional rule.
5. Failing to identify textual ambiguity and instead inventing a reconciliation.
6. Extending a provision beyond its stated trigger conditions.

Examples included:
- treating statutory compliance under §12.6 as if it established constitutional compliance while overlooking the "reasonably sufficient fiscal capacity" requirement;
- mishandling interaction between §2.6(5), §2.6.a, and the CC Assembly-membership requirement;
- using §2.5(6) incapacity succession for ordinary CC vacancies governed by §2.6.a;
- applying §2.16(7)'s prospective declination rule to incapacity of an already-serving acting officer;
- inventing a §4.4(b) citation where the rule was actually §4.4(4).

A useful general observation:
> The longer 120B continued explaining after it had correctly answered the question, the more likely it was to introduce an error.

This suggests tightly bounded output requirements may materially improve reliability.

---

## Broad-KB test

120B was also tested with access to the wider project knowledgebase.
This was not successful.

Observed problems:
- very long retrieval/reasoning time;
- timeout;
- substitution of generic real-world constitutional concepts for Federated Republic sources;
- hallucinated authority, including a nonexistent case styled "Terranova v. Federation."

A repository search found no project source for "Terranova."

**This is the single most load-bearing result in this plan.** It's a concrete demonstration, not a theoretical concern, of why retrieval and reasoning must be separate stages: a mid-size open model given the full knowledgebase both got slower and less grounded, not just slower.

Conclusion:
GPT-OSS-120B should not currently be trusted as an unconstrained autonomous librarian over the entire project knowledgebase.
This does not rule it out as a reasoning model after relevant sources have been retrieved.

---

## Retrieval is a separate task

Access to the full knowledgebase and placing the full knowledgebase into model context are different things.
Broad questions may require a retrieval system with access to all project sources, but the reasoning model should normally receive only the relevant results.

Possible architecture:

Question
→ search/retrieval
→ verified evidence bundle
→ reasoning model
→ final-answer model

**Prefer deterministic, structured lookup as the first-line retrieval method, not vector or BM25 search.** The Federated Republic's constitutional corpus is small and heavily addressable by explicit section numbers — most questions either name a section directly or map cleanly onto one via keyword-to-article/section matching against `constitution_data.json`'s own structure. A query parser that resolves an explicit or implied §-reference and pulls that JSON node directly will likely outperform embeddings on both accuracy and cost for the common case, and is far cheaper to build and validate. Reserve BM25/hybrid/embedding retrieval for genuinely fuzzy queries that don't resolve to a specific provision — it should be the fallback, not the default path.

The retrieval layer may use:
- deterministic keyword/§-reference lookup (preferred default);
- BM25/full-text search (fallback);
- embeddings/vector search (fallback for fuzzy queries);
- hybrid retrieval;
- limited model-assisted query expansion.

The retrieval system should follow the existing project source hierarchy.
For the federal Constitution:
1. `constitution_data.json`
2. `docs/constitution-current.md`
3. `docs/constitutional-quickref.md`
4. `annotated.html`

Historical/archive material must not override current constitutional authority.

---

## Model roles

### Tier A — inexpensive bounded model

Possible candidates:
- GPT-OSS-20B
- Haiku-class commercial model
- comparable low-cost commercial model

Appropriate work:
- definitions;
- direct lookup;
- explicit deadlines;
- one- or two-provision questions;
- formatting and concise explanation.

Examples:
- "What is the Civic Consul?"
- "How long may a person serve as Civic Consul?"
- "Does acting service count toward the eight-year limit?"

The model should answer only when the required evidence is explicit and internally consistent.

### Tier B — stronger bounded reasoning

Possible candidate:
- GPT-OSS-120B

**Revised scope, narrower than originally planned.** The observed failure mode for 120B is specifically *inventing a reconciliation instead of flagging ambiguity* and *overextending past a correct answer*. Assigning it open-ended "cross-provision reasoning" and "formulate a bounded constitutional interpretation" puts it directly in the failure mode the testing surfaced. Its role should be:

Appropriate work:
- annotation of a known provision;
- surfacing cross-provision references and naming where they interact;
- identifying that ambiguity or tension exists;
- preparation of a structured evidence/conflict packet for another model.

**Not appropriate for Tier B:** resolving a conflict, deciding which of two provisions controls, or producing a final interpretation. That is Tier C's job even when Tier B has correctly identified the conflict. Tier B's deliverable in an ambiguous case should be "these provisions interact and here is the tension," never "and here is how it resolves."

120B should not normally receive unrestricted responsibility for identifying everything relevant across the full project.

### Tier C — premium model

Possible candidates:
- Sonnet-class Claude model;
- comparable higher-tier OpenAI model.

Appropriate work:
- genuine constitutional ambiguity;
- complex cross-domain interpretation;
- difficult canon/research questions;
- conflicting evidence;
- broad research where narrower stages cannot resolve the question.

Premium models should become exception handlers rather than the default engine.

---

## Escalation architecture

The preferred design is a model cascade.

### Basic flow

Tier A
→ answer if requirements are satisfied
→ otherwise ESCALATE

Tier B
→ answer/analyze if requirements are satisfied
→ otherwise ESCALATE

Tier C
→ widest permitted analysis

This is essentially a controlled series of if/then gates.

**The escalation gate itself is the hardest unsolved part of this plan, not a secondary detail.** Gating correctly depends on a lower-tier model accurately recognizing when a question exceeds its own bounds — and self-assessment of competence is exactly the kind of judgment small models are worst at. Adding tiers doesn't eliminate the reliability question; it relocates it to "does this model know what it doesn't know?" Treat building and testing the gate logic itself as first-class engineering work, not boilerplate glue between tiers.

---

## Objective escalation criteria

A lower-tier model should not simply decide whether it "feels confident."
It should evaluate explicit conditions.

Tier A may answer only if:
- at least one controlling source was found;
- the question can be answered directly from the retrieved material;
- there is no unresolved conflict between provisions;
- no undefined term materially changes the answer;
- no unstated procedure, deadline, remedy, authority, or motive must be inferred;
- every substantive claim can be tied to the retrieved source.

Otherwise it should return a structured escalation response.

Example:

status: ESCALATE
reason: CROSS_PROVISION_REASONING_REQUIRED
sources:
- §2.5
- §2.6
- §2.6.a
issue:
- interaction cannot be resolved from a single explicit rule

Tier B may be allowed to:
- synthesize several provisions into a description of how they interact;
- follow cross-references;
- distinguish text from inference;
- identify tension or silence.

Tier B should escalate when:
- controlling sources conflict;
- the text contains unresolved ambiguity;
- retrieval appears incomplete;
- the question spans multiple major source domains;
- a material conclusion would require unsupported inference;
- evidence cannot support a reliable answer;
- **the question asks for resolution or interpretation, not just identification of the interaction** — this always escalates to Tier C regardless of how clearly Tier B has mapped the conflict.

---

## Multi-model stacking

Another promising architecture is:

retrieval
→ GPT-OSS-120B evidence/analysis (conflict identification only, not resolution)
→ low-tier commercial final answer

The purpose is not necessarily for OSS-120B to replace Sonnet directly.
Instead, 120B may perform enough difficult analysis that a cheaper commercial model can reliably perform the final-answer role.
This should be benchmarked against Sonnet-alone output.

Possible arrangements:
1. 120B evidence packet → Haiku final answer
2. 120B draft → Haiku verification/edit
3. retrieval → 120B reasoning → Haiku final answer
4. 20B retrieval assistance → 120B analysis → Haiku
5. automatic escalation to Sonnet only when earlier stages fail

The final model should preferably receive both:
- the intermediate analysis; and
- the retrieved source excerpts.

It should not be forced to trust an erroneous intermediate summary blindly.

---

## Important source-safety rule

No model may introduce a:
- case;
- provision;
- office;
- person;
- event;
- deadline;
- precedent;
- remedy;
- historical fact

unless it is supported by the retrieved project source set or explicitly identified as outside/general knowledge requested by the user.
If support cannot be found, the system should report that the available sources do not establish the claim.

This is the same discipline the project already applies to itself through the Bad-Faith Test and the no-invented-authority principle in `CONSTITUTIONAL-DESIGN-PRINCIPLES.md` — this plan is that discipline applied to model output rather than to drafting.

---

## Testing lessons

Do not benchmark only easy questions.

Tests should include:
- direct retrieval;
- cross-provision reasoning;
- constitutional silence;
- false-premise questions;
- similar neighboring procedures;
- citation precision;
- ambiguous drafting;
- unsupported-motive traps;
- canon versus planning separation;
- old terminology versus current terminology.

Fatal errors should be tracked separately from aggregate quality scores.

Examples of fatal errors:
- invented constitutional provision;
- invented case;
- invented deadline;
- invented office power;
- turning planning material into canon;
- claiming the source resolves an issue that it leaves open.

---

## Next steps when work resumes

### Phase 0 — scope decision

Settle which application this architecture serves (see "Open scope question" above) before inventorying tasks. This determines what counts as a fatal error and how strict the source-safety rule needs to be in practice.

### Phase 1 — task inventory (complete, 2026-09-29)

At the Phase 1 inventory, every live site AI feature ran on a Sonnet-class model. Direct code inspection (`api/*.js`) found four live features, and they were not equivalent in risk or readiness. This settled the scope question above by example: the site's AI usage is a mix, not a single application, so tiering decisions should be made per feature.

**`api/crossroads.js` — Living Crossroads move classifier.** Task: bounded classification — match free-text player input to one of a small offered set of fragment IDs, or `out_of_bounds`/`needs_detail`. It has strong guardrails: output is validated against the allowed ID set, a parse failure fails safe to `out_of_bounds`, and the feature has a manual fallback (player picks a move) if the classifier is unavailable at all. **Promoted 2026-10-01 to Claude Haiku 4.5 at temperature 0** after the hardened benchmark below; no always-on shadow model is enabled by default. `AI_MODEL_CROSSROADS` remains the rollback/override path and `AI_MODEL_CROSSROADS_SHADOW` can be set temporarily for observational comparison.

**`api/navigator.js` — Constitution Navigator (free-text Q&A).** Task: user Q&A / retrieval. This is the feature the rest of this plan was implicitly designed around, and its retrieval layer is already built and already matches the recommended approach above — deterministic synonym-expanded keyword scoring against `constitution_data.json`, no embeddings, no vector search. Deterministic topic/title/section routes answer without a model; only residual questions receive a verified packet for synthesis. **As of 2026-10-04 the residual synthesis model is Claude Sonnet 5**, promoted after the same 24-case residual corpus outperformed Sonnet 4.6 under cross-model verification (see the October 4 comparison below).
- **Recommendation: keep deterministic routing as the primary efficiency layer.** Do not add a cheaper answer tier unless production telemetry shows enough residual synthesis volume to justify it and a same-corpus benchmark clears the source-grounding bar.

**`api/annotate.js` — Constitutional annotation.** Task: annotation, bounded to one already-identified provision (the fuzzy part — which provision — is resolved server-side before the model is called). Asks for synthesis across the selected provision, related provisions, and the Twelve Tests. **Benchmark complete 2026-10-01: keep Claude Sonnet 5.** Haiku 4.5 repeatedly introduced unsupported decision rules, enforcement mechanisms, audit powers, cross-reference effects, and institutional details even under a stricter source-bound prompt. The production Annotator uses Sonnet 5 at temperature 0 with a 350–500 word target and explicit instructions not to invent motives, remedies, cross-reference effects, or public/justiciable consequences absent from the text. The later October 3 output-contract hardening raised the model budget to **1,600 tokens on the first attempt and 2,400 on a full rewrite** when the first response is truncated or violates the three-paragraph contract; the earlier 1,200-token note is therefore historical, not the current runtime setting.

**`api/survey.js` — "So You Want a Constitution?" survey evaluation.** Task: open-ended creative/interpretive synthesis — reads a full questionnaire transcript (including free-text answers) and writes a structured, voiced, multi-field JSON evaluation with specific tone constraints. **Cold storage as of 2026-10-01:** `survey.html` is omitted from the public build and `/api/survey` is not deployed, so Survey is not part of the active AI surface. Its source remains in the repository on `claude-sonnet-5`. If the feature is deliberately revived, Sonnet 5 remains the recommended default because this is voice-controlled creative/interpretive synthesis rather than bounded constitutional lookup; benchmark any cheaper replacement before changing that default.

The Questionnaire/Survey source is retained specifically so the feature can be restored later. Do not include it in active routing/model-optimization work unless it is deliberately reactivated.

**Net, updated 2026-10-04:** Crossroads runs on Haiku after benchmark validation; Navigator uses deterministic routing and Sonnet 5 only for residual synthesis; Annotator remains on a hardened Sonnet 5 configuration; Survey is in cold storage. There is no remaining planned model migration for the active public AI features.

### September 30, 2026 — live Gateway benchmark

A fixed 18-case Navigator benchmark was run through Vercel AI Gateway against the same retrieved constitutional packets for three lower-cost candidates. The benchmark included direct single-section questions, cross-provision questions, interpretive questions, true no-match questions, and false-premise questions.

| Model | Disposition correct | False non-escalations | Invalid returned source IDs | Typical batch median latency |
| --- | ---: | ---: | ---: | ---: |
| GPT-5.4 Nano | 12/18 (66.7%) | 3 | 7 | 1.59–1.76 s |
| Gemini 3.5 Flash Lite | 11/18 (61.1%) | 2 | 5 | 0.99–1.04 s |
| Claude Haiku 4.5 | 14/18 (77.8%) | 0 | 7 | 2.05–2.17 s |

Important interpretation:
- **False non-escalation remains the fatal metric.** Nano answered three cases that the benchmark required to escalate; Gemini did so twice. Neither should be promoted to Navigator Tier A on this evidence.
- Haiku produced **zero false non-escalations** in this run and correctly handled all six explicit single-section Tier-A cases. It therefore becomes the preferred Navigator shadow comparator for the next benchmark stage, but is **not yet promoted to user-visible Tier A**.
- Source-ID conformance still needs work across all candidates. The runtime validator must continue rejecting or filtering section IDs not present in the retrieved packet.
- The sample is deliberately small. Promotion requires a broader direct-rule corpus and repeated runs, not one favorable 18-case result.
- The Gateway key and cross-provider transport were verified in production. The temporary benchmark endpoint was removed immediately after measurement.

This result favors the simpler two-tier hypothesis—verified retrieval + Haiku-class bounded answering + Sonnet escalation—over adding a more complex middle tier before the gate is proven.

### September 30, 2026 — Haiku direct-rule benchmark

A broader direct-rule benchmark was run for the Constitution Navigator using 76 explicit-section questions spanning all 20 Articles. The intended Tier-A packet was progressively tightened during testing: one explicit controlling provision only, deterministic source attribution by the application, temperature 0, and a close-paraphrase prompt that forbids interpretive expansion.

Final hardened result:
- 76/76 returned the expected ANSWER disposition.
- 74/76 were fully grounded under strict source verification (97.4%).
- Two genuine precision failures remained:
  - §3.9: dropped a conditional qualifier and stated a conditional tenure/removal rule as universal.
  - §9.9: omitted an explicit exclusion from the standard removal track.
- Earlier iterations also exposed smaller but material failure modes such as converting an Assembly electoral-cycle wait into "one year," flattening distinct electoral-finance categories, and misstating a military-authorization wind-down rule.
- Deterministic source attribution is preferred over asking a model to reproduce section IDs.
- Temperature 0 and close-paraphrase prompting materially improved behavior but did not eliminate constitutional precision errors.

Decision: **do not promote Haiku to unattended public Tier A yet.** Sonnet remains the public Navigator answerer. Retain the 76-case corpus as a regression benchmark and continue using Haiku only for shadow evaluation until a bounded architecture can reach effectively zero material source-grounding errors on repeated runs.

### October 1, 2026 — Living Crossroads classifier benchmark and promotion

The Crossroads model-routing item is complete.

A first six-case smoke test used the exact production classifier prompt against Sonnet 5, Haiku 4.5, GPT-5.4 Nano, and Gemini 3.5 Flash Lite. All four scored 6/6, but GPT-5.4 Nano showed severe latency variance: the six-case batch took about 17.2 seconds because two calls ran roughly 15–17 seconds.

The corpus was then rebuilt from the live `korda-crossroads.json` game data so each benchmark request uses the same role-filtered fragment descriptors the browser would send. The hardened corpus contains 35 cases across Scenes 1–5, both delegate roles, bargaining/persuasion/confrontation/lapse choices, prompt injection, and out-of-bounds input. A consistency test now fails if a benchmark case points to a fragment unavailable for its role/state.

One initially expected `needs_detail` case was corrected after the first run. The move — wanting to keep Korda together while not yet being ready to put a resolution in writing — is directly covered by the authored `s5_tentative` fragment. This follows the production rule to choose the closest fragment when one clearly fits rather than ask for unnecessary clarification.

Corrected hardened results:

| Model | Hardened accuracy | Repeat | Median latency observed | Note |
| --- | ---: | ---: | ---: | --- |
| Claude Sonnet 5 | 35/35 | not repeated | ~1.74 s | Existing baseline |
| Claude Haiku 4.5 | 35/35 | 35/35 | ~1.07–1.18 s | Matches authored routing in both runs |
| Gemini 3.5 Flash Lite | 34/35 | 34/35 | ~0.79–0.84 s | Twice returned `needs_detail` where `s5_tentative` is the closer authored match |
| GPT-5.4 Nano | 6/6 smoke only | — | highly variable | Dropped from hardened round because interactive latency was erratic |

Decision: **promote Claude Haiku 4.5 to the public Crossroads classifier at temperature 0.** Crossroads is unusually suitable for this move because the model never writes public narrative, returned IDs are checked against the authored allowlist, invalid output fails safe, and the player can always use authored buttons if classification fails. The default shadow call is disabled so the migration actually reduces cost; Sonnet can be restored through the existing model override or enabled temporarily as a shadow comparator.

### October 1, 2026 — Provision Annotator benchmark and grounding hardening

The Annotator model-routing item is complete.

A source-linked 10-case benchmark was built from the current Constitution, covering §1.4, §2.14.a, §3.9, §4.4.a, §7.10, §8.4, §9.8, §10.2, §11.1, and §15.3. Each case records both required mechanics and prohibited inventions. The corpus is checked against the live `constitution_data.json` so it fails if a benchmark provision disappears or the fixture becomes structurally invalid.

The first Sonnet-vs-Haiku pass used the existing production prompt. Haiku was consistently fluent but too willing to complete the constitutional design from inference. Material examples included:
- §2.14.a: inventing a Supreme Court decision rule that the Court chooses which executive should coordinate the emergency, and broadening “operational coordination only” toward binding cross-domain command;
- §3.9: inventing audit/enforcement machinery and generalized appointment constraints not supplied by the provision;
- §7.10: broadening the Republic-property rule from official-capacity gifts to “any gift,” and inventing referral destinations;
- §8.4: inventing a specific justiciable fallback for legislative inaction;
- §11.1 and §15.3: adding institutional consequences and timing rationales not established by the text.

A second pass tested a stricter prompt against both models. The stronger instructions materially improved both, but Haiku still introduced unsupported structural rules in the same high-risk areas, especially §2.14.a and §3.9. It therefore does **not** meet the source-safety bar for public annotations.

The stricter prompt improved Sonnet in two useful ways: it stopped most speculative “drafting story” language and made unresolved gaps explicit instead of filling them. It also eliminated the response-length problem observed in the first pass, where two Sonnet annotations hit the prior 2,000-token ceiling. Production is therefore hardened rather than downgraded:
- model remains `anthropic/claude-sonnet-5`;
- temperature is fixed at 0;
- response target is three concise paragraphs, roughly 350–500 words;
- `max_tokens` is reduced to 1,200;
- the system prompt now forbids invented motives, historical lessons, enforcement mechanisms, appointment rules, audit powers, deadlines, remedies, cross-reference effects, and claims of publicity/reviewability/justiciability not established by the current text.

Decision: **keep the Annotator on Sonnet 5 and close the cheaper-model migration item.** Revisit only if a materially stronger low-cost model or a different annotation architecture becomes available.

### Phase 2 — model-to-task benchmark

Test models according to the job they might actually perform.

Suggested initial allocation:
- GPT-OSS-20B: simple lookup / bounded extraction
- GPT-OSS-120B: bounded reasoning / conflict identification (not resolution)
- Haiku-class model: final-answer generation and verification
- Sonnet-class model: escalation

Do not require every model to perform every task.

### Phase 3 — escalation benchmark

Build cases that should intentionally stop at different tiers.

Measure:
- percentage answered at Tier A;
- percentage escalated to Tier B;
- percentage requiring Tier C;
- false non-escalations;
- unnecessary escalations;
- final factual accuracy;
- unsupported claims;
- citation accuracy;
- latency;
- cost.

False non-escalation is especially important: a cheap model confidently giving a wrong answer is worse than escalating unnecessarily.

### Phase 4 — retrieval testing

Test retrieval independently from model reasoning.

Questions should measure whether the system finds:
- controlling provision;
- necessary cross-references;
- current rather than historical text;
- relevant Torenthia canon;
- relevant constitutional history when terminology changed.

Test deterministic §-reference lookup first; only bring in BM25/embeddings for the queries it can't resolve. The retrieval layer should return a compact verified evidence set rather than the entire KB.

### Phase 5 — compare against baselines

Compare at least three configurations, not two:
1. Sonnet alone (current baseline)
2. Retrieval + Haiku, escalate straight to Sonnet (two-tier, no OSS layer)
3. Full task routing: retrieval + OSS tiers + lower-tier commercial model + Sonnet escalation

The three-way comparison matters because the OSS middle tier is the most expensive piece to build and maintain. If configuration 2 captures most of the cost savings, the added complexity of configuration 3 may not be worth it for a project at this traffic scale — this should be decided by measurement, not assumed.

The full architecture succeeds if final reliability is comparable to Sonnet-alone while premium-model usage and total cost fall substantially, *and* the two-tier alternative doesn't already capture most of that gain on its own.

---

## Current working hypothesis

The likely sustainable architecture is not:

one cheap model replaces Sonnet.

It is:

> inexpensive models handle simple work, OSS models perform bounded heavier reasoning (identification, not resolution), and premium models are invoked only when the cheaper layers determine that the question exceeds their permitted scope.

The principal engineering problem is therefore not choosing one model.
It is designing reliable retrieval, task routing, and escalation gates — and the escalation gate is likely the hardest of the three. Phase 5's three-way comparison should determine whether the added OSS tier earns its complexity relative to a simpler two-tier system, before committing to the full cascade.


---

## Implemented update — 2026-10-02

The source-packet architecture is now applied beyond the Provision Annotator.

- **Provision Annotator:** deterministic provision-centered packet from `constitution_data.json`; exact target, same-article context, explicit cross-references, and backlinks are assembled before Sonnet is called.
- **Constitution Navigator:** the model path now receives a verified question-centered packet containing primary retrieved provisions plus bounded structural parent/sibling provisions and explicit cross-references. Downstream backlinks are intentionally excluded because they added noisy context. Direct deterministic lookup/topic routes remain model-free.
- **Torenthia authoring:** `npm run world:packet -- --arc <arc>` generates an internal story-state packet from current World metadata, clocks, chronology, the relevant Story Bible and Story Status sections, recent published records, and exact referenced constitutional provisions.

The operating rule is now: **canonical data → deterministic feature-specific packet → AI synthesis only where needed**.


### October 2, 2026 — Navigator shadow cost cleanup

Navigator's Haiku shadow evaluator is now **opt-in** rather than automatically running whenever AI Gateway credentials are present.

Production behavior:
- Sonnet remains the user-visible model for Navigator questions that require synthesis.
- Deterministic direct lookups and topic-registry answers remain model-free.
- Haiku shadow evaluation runs only when `AI_NAVIGATOR_SHADOW_ENABLED=1` is explicitly set for a measurement period.
- The shadow result never controls the public answer.

Rationale: the shadow benchmark has already established Haiku's current limits, so paying for a second model call on every Sonnet request no longer improves the user-facing product. The opt-in switch preserves the benchmark path without carrying its cost during normal operation.


### October 2, 2026 — Navigator routing measurement

Navigator now emits a privacy-safe structured route record for each successful answer. The log records only routing metadata — deterministic route, AI-call count, gate/retrieval reason, matched/resource counts, and for Sonnet requests the source-packet character count plus primary/related provision counts. It does **not** log the user's question.

A deterministic benchmark report is available with:

```bash
npm run navigator:routing-report
```

It reports route distributions separately for the natural-language, gate, and explicit-direct benchmark corpora. These percentages are benchmark distributions, **not production traffic estimates**. Production route shares should be measured from the `[navigator-route]` records after sufficient real usage accumulates.

Decision rule for any additional cheap-model tier: do not add it merely because a model is cheaper. First measure how much traffic still reaches `sonnet-synthesis`, how large those verified packets are, and whether those remaining questions form a bounded class that a cheaper model can answer at effectively zero material grounding error. If Sonnet volume is already small, the simpler architecture wins.


### October 2, 2026 — Residual Navigator packet benchmark

After deterministic routing, source-packet retrieval, companion-resource selection, and shadow-cost cleanup were in place, the remaining natural-language synthesis cases were benchmarked again using the **actual production-style verified packet** rather than broad constitutional context.

Corpus:
- 28 cases previously classified as `SONNET` in the natural-language benchmark;
- 4 of those no longer reached synthesis under the current retrieval/sufficiency rules;
- 24 remained genuine synthesis cases.

A full hardened-packet pass produced:
- **Claude Haiku 4.5:** 16/24 verifier PASS (66.7%), with material unsupported and incomplete answers still present.
- **Claude Sonnet 4.6:** 19/24 verifier PASS (79.2%) in the same pass. The remaining failures exposed packet/prompt weaknesses rather than a reason to downgrade the model.

The benchmark was intentionally used diagnostically, not as a product SLA. Repeated runs showed some verifier/model variance, but the qualitative result was stable: **Haiku is not safe for the residual synthesis tier.** Its failures continued to include transferring a trigger or consequence between similar procedures, collapsing distinct failure states, omitting controlling qualifiers, and inferring symmetry between actors or mechanisms.

The benchmark directly produced additional production hardening:
- Navigator related context is capped and now prioritizes **structural parent/lettered-sibling provisions** (for example §4.4 with §4.4.a) and then exact citations.
- General backlinks are excluded from synthesis packets because they frequently introduced downstream-but-irrelevant rules.
- Packets include mechanically extracted **verbatim procedural cues** so triggers, deadlines, lapse rules, and fallback consequences remain attached to the provision that actually states them.
- The synthesis prompt now explicitly forbids transferring triggers, deadlines, fallbacks, funding rules, cooldowns, or actor-specific restrictions between superficially similar mechanisms; it also treats failed, rejected, void, lapsed, withdrawn, and not-acted-on outcomes as distinct unless the text equates them.
- Navigator's normal completion budget is 600 tokens. A `max_tokens` stop triggers one full rewrite with a 900-token budget rather than returning a cut-off answer.
- The model is instructed not to invent a more specific factual scenario than the user supplied merely because another provision in the packet could apply to that hypothetical.

Targeted reruns showed these changes resolving several benchmark defects, including stage-collapse errors in statehood/devolution, MA budget overreach, omission of the active-military Legat rule, and initiative-vs-Legislature symmetry errors. A Supreme Court vacancy/Senate-blocking question still showed occasional cross-trigger overreach across repeated runs, so common high-risk procedural paths remain candidates for further deterministic topic coverage if production traffic justifies it.

Decision at that stage: **retain Sonnet 4.6 as Navigator's residual synthesis model and do not add a Haiku answer tier.** The simpler architecture remained preferred:
`deterministic routing → bounded verified packet → Sonnet only when synthesis is genuinely required`.

That model pin was superseded by the October 4 same-corpus Sonnet 5 comparison below.

The temporary benchmark endpoints used for this measurement are removed after testing; benchmark code is not part of the public production API.


### October 4, 2026 — Sonnet 5 vs Sonnet 4.6 residual comparison

Navigator's **same 24 genuine residual synthesis cases** were rerun through the current production-style deterministic packet and current synthesis prompt at temperature 0. Both candidates used the normal 600-token budget with the same one-time 900-token full-rewrite fallback.

To avoid letting Sonnet 5 grade itself, the primary comparison used **Sonnet 4.6 as the strict verifier** against the exact packet supplied to each candidate:

- **Claude Sonnet 4.6:** 21/24 verifier PASS (87.5%); 3 answers were incomplete.
- **Claude Sonnet 5:** 23/24 verifier PASS (95.8%); 1 answer was incomplete.

The 4.6 misses were material to Navigator's risk model: one answer stopped short on a changed-Monitor-finding interpretation, one hedged away from the initiative-versus-Legislature distinction, and one omitted the appropriation/revenue restriction from §13.2. Sonnet 5 passed all three of those cases. Its single flagged answer concerned indirect budgetary control of the Monetary Authority: it stated the independence rule and the absence of a specific funding mechanism, but did not state strongly enough that any budget mechanism that compromises the MA's constitutional functions would itself violate §12.1.a.

A reverse verifier check pointed in the same qualitative direction but was noisier because the Sonnet 5 verifier sometimes consumed its verdict budget before emitting the required one-line disposition. The cross-model 4.6-verifier result is therefore the cleaner decision basis.

Provider-reported token usage also showed that lower Sonnet 5 unit pricing does **not** automatically mean a cheaper Navigator request. In one complete 24-case run, Sonnet 4.6 used 119,132 input / 7,592 output tokens (about $0.471 at then-current rates), while Sonnet 5 used 186,118 input / 10,017 output tokens (about $0.472). For this workload the measured cost was effectively neutral because Sonnet 5 reported more tokens, so the promotion is justified on **capability**, not an assumed 33% request-cost reduction.

Decision: **promote Navigator residual synthesis to Claude Sonnet 5.** Keep the existing architecture unchanged otherwise:
`deterministic routing → bounded verified packet → Sonnet 5 only when synthesis is genuinely required`.

The comparison endpoint was temporary and is not part of the production API.

### October 2, 2026 — Deterministic coverage for repeated high-risk procedures

The residual packet benchmark identified four common constitutional questions where the underlying rule is explicit but model synthesis repeatedly created avoidable risk. Those paths are now covered by narrow deterministic topics instead of Sonnet:

- Senate failure to vote on a Supreme Court nomination, including the distinction between §4.4's ordinary/no-nomination mechanisms and the separate §4.4.a Senate-inaction bypass;
- interaction of §4.4 and §4.4.a when the Senate delays;
- executive military-domain disputes, including suspension of the disputed action and the explicit active-military-operations rule;
- failure to complete Statehood, preserving the distinction between ordinary §15.2 lapse/reinitiation and the §15.5.a Territory Convention three-year cooldown.

This moves four cases from the 80-case natural-language corpus from `SONNET` to `TOPIC`, changing the benchmark mix from 42 deterministic topics / 28 Sonnet / 10 no-match to **46 deterministic topics / 24 Sonnet / 10 no-match**.

The governing principle is intentionally conservative: promote a question to deterministic handling only when the current text supplies a stable, bounded answer and repeated model synthesis adds more risk than value.


### October 3, 2026 — Provision Annotator packet benchmark

The Provision Annotator benchmark was rerun against the **current production-style deterministic source packet**, rather than the older broad-context prompt. The corpus was expanded from 10 to 16 provisions, adding observed or analogous packet-era failure modes around §2.3.a, §2.7, §4.4, §12.1.a, §13.2, and §15.5.a.

The benchmark was used diagnostically. The first packet-era pass exposed two different problems: output-contract failures (cut-off or headed responses) and source-grounding failures caused by too much neighboring Article context. Production hardening followed directly from those results:

- the Annotator packet now keeps the target provision dominant and caps related exact-text provisions;
- structural parent/sibling provisions and exact citations are preferred over broad same-Article context;
- downstream backlinks are excluded from the default packet because they can encourage backward transfer of rules;
- mechanically selected **TARGET COVERAGE CUES** keep thresholds, limits, defaults, exceptions, fallbacks, and consequences salient;
- the prompt explicitly treats the twelve design principles as interpretive lenses rather than evidence of drafting intent;
- scope qualifiers must be preserved rather than broadened (for example, official-capacity gifts cannot become all gifts, consent cannot become compensation, and inaction cannot become rejection);
- target mechanics must be covered before secondary comparisons;
- the output contract requires three plain-prose paragraphs and the server retries a full rewrite not only for `max_tokens`, but also for an empty, headed/bulleted, or wrong-paragraph-count response.

Final hardened benchmark result with **Claude Sonnet 5: 16/16 verifier PASS** on the expanded corpus. The run required six format/completion rewrites; those retries are a product safeguard rather than evidence that the first draft is always publication-ready. The temporary benchmark API route is removed after measurement.

Decision: **keep Sonnet 5 for Provision Annotator and retain the deterministic target-first packet architecture.** The next efficiency work should measure actual production retry frequency and packet size before changing model tier or further reducing context.


### October 3, 2026 — Torenthia packet-first authoring and validation

Torenthia authoring now uses a packet-first workflow rather than relying on broad project context during drafting.

For new records created with `world:new` and at least one `worldArcs` value, the tool writes an ignored local source packet under `.world-authoring/` for each selected arc. The packet is generated from the current published World inventory, structured clocks and chronology, the mapped Story Bible/Story Status sections, recent relevant narrative/NRS records, exact referenced constitutional text, and active structured **still-open canon guardrails**.

A deterministic draft validator is available with:

```bash
npm run world:validate-draft -- --file torenthia-news-098.html
```

The validator checks stream sequencing, fictional month placement, constitutional references in both front matter and body text, clock crossings/review conditions, and active unresolved-canon guardrails. Publication checks also enforce those active guardrails for records after each guardrail's activation frontier.

The initial structured guardrails cover the live Korda Convention, Lake Varda conference, Fiscal Equalization review, and Argent Ridge signature period. They intentionally block only narrow positive assertions that would resolve facts currently marked open. If a new story deliberately advances one of those facts, the guardrail must be amended or retired in the same reviewed publication change; this makes canon advancement explicit rather than accidental.

The intended flow is now:

`current canon → deterministic arc packet → draft → deterministic draft validation → ordinary publishing checks → publication`

The validator does not decide narrative quality or invent canon. Semantic guardrails are deliberately narrow; editorial review remains responsible for subtler continuity and characterization.


### October 3, 2026 — Cross-feature AI efficiency audit

The packet architecture now has a single repository audit command:

```bash
npm run ai:efficiency-report
```

The report measures the current architecture without making paid model calls. It compares Annotator packet sizes with the full constitutional corpus, reports the Navigator natural-language benchmark routing split and residual synthesis-packet sizes, and measures the four active Torenthia authoring packets. Character-derived token figures are explicitly labeled as rough size proxies rather than provider billing.

Production telemetry is also standardized for the two public AI endpoints. Annotator emits `[annotator-metric]` records with model/transport route, packet size, related-provision count, model-call count, rewrite reason, provider-reported input/output tokens, and total request latency. Navigator's existing `[navigator-route]` record now also includes provider-reported input/output tokens, synthesis latency, and whether a max-token rewrite occurred. Neither metric contains the user's question, clicked provision text, generated answer, source packet, or other user-entered prose.

Torenthia authoring makes no repository/public-API model call: its cost driver is the size of the deterministic packet handed to the external/editorial drafting step, followed by deterministic validation.

At the time this telemetry was added, Vercel contained no production `[navigator-route]` or `[annotator-metric]` records in the preceding 24-hour query window. Therefore no production traffic share, retry rate, token total, latency percentile, or dollar-cost claim is made yet. Those values should be calculated only after real usage accumulates.

Decision rule: **do not optimize from static token proxies alone.** Use the static report to catch architectural regressions, and use provider-reported runtime token/latency data to decide whether further packet reduction, caching, deterministic promotion, or model changes are worth the complexity.
