# AI experiment decisions — avoid repeating completed work

**Updated:** 2026-10-13. This is a results-and-decisions index, not merely a branch inventory. It distinguishes measured outcomes, implementation decisions, and exploratory work. Use the original PRs and committed benchmarks for full experimental methods and data.

## Constitution Navigator: direct-rule Haiku trial

**Question:** Could Haiku 4.5 answer explicit constitutional-section queries safely in a cheaper unattended Tier A path?

- [PR #46](https://github.com/jcr0916-hue/federatedrepublic/pull/46) established a fixed 76-case corpus spanning all 20 articles, verifying deterministic lookup and testing Haiku against Sonnet grounding review.
- [#47](https://github.com/jcr0916-hue/federatedrepublic/pull/47) switched to one controlling provision per query and a strict verifier verdict.
- [#48](https://github.com/jcr0916-hue/federatedrepublic/pull/48) removed model-generated citations from the task; citations would be attached deterministically.
- [#49](https://github.com/jcr0916-hue/federatedrepublic/pull/49) tried temperature zero; [#50](https://github.com/jcr0916-hue/federatedrepublic/pull/50) required close paraphrase and escalation for material qualifications.
- **Result and decision ([#51](https://github.com/jcr0916-hue/federatedrepublic/pull/51)):** 74/76 fully grounded (97.4%) on the final hardened run, with **two material precision errors**. **Do not promote Haiku to unattended public direct-rule answers** on the basis of this test. Sonnet remained the visible Navigator answerer; the temporary endpoint was removed and regression fixtures retained.

**Avoid redoing:** Changing prompts, temperature, or packet size alone was already tested. Reconsider only with a genuinely changed model, architecture or test evidence showing elimination of material errors, and compare against the same 76-case baseline plus new edge cases.

## Navigator residual synthesis model

**Question:** Should residual synthesis use Sonnet 5 rather than Sonnet 4.6?

- **Result and decision ([#94](https://github.com/jcr0916-hue/federatedrepublic/pull/94)):** Same 24-case corpus; Sonnet 5 achieved 23/24 (95.8%) under the recorded verification method, versus Sonnet 4.6 at 21/24 (87.5%). **Sonnet 5 was promoted**; deterministic routing and packet architecture were retained.
- [#41](https://github.com/jcr0916-hue/federatedrepublic/pull/41) created an earlier fixed Navigator comparison endpoint; [#45](https://github.com/jcr0916-hue/federatedrepublic/pull/45) recorded a live benchmark and changed the non-user-facing shadow model to Haiku. Those earlier experiments should not be mistaken for a decision to change public answers.

**Avoid redoing:** Do not treat an earlier model comparison as an unresolved selection question. Benchmark a replacement only against the current Sonnet 5 residual baseline with the original corpus and documented verification criteria.

## Provision Annotator model and safeguards

**Question:** Could Haiku 4.5 safely replace Sonnet 5 for constitutional explanatory annotations?

- [#72](https://github.com/jcr0916-hue/federatedrepublic/pull/72) established a 10-case source-linked benchmark; [#73](https://github.com/jcr0916-hue/federatedrepublic/pull/73) tested a stricter grounding prompt, shorter output and temperature zero.
- **Decision ([#74](https://github.com/jcr0916-hue/federatedrepublic/pull/74)):** **Retain Sonnet 5**. Haiku still invented constitutional machinery, including unsupported Court rules, auditing/enforcement consequences and remedies. Hardened production prompts forbade those claims and retained the tests.
- **Follow-up ([#85](https://github.com/jcr0916-hue/federatedrepublic/pull/85)):** Expanded to 16 target-linked cases; bounded target-first packets, tighter scope constraints and completion safeguards led to **16/16 verifier PASS** on the recorded hardened Sonnet 5 run. The temporary benchmark route was removed.

**Avoid redoing:** Prior “just harden the prompt” approaches did not make Haiku acceptable. Any new model proposal must test invention of constitutional machinery, scope transfers and incomplete output using the expanded 16-case suite.

## Living Crossroads model experiments — historical, not an active feature decision

- [#67](https://github.com/jcr0916-hue/federatedrepublic/pull/67) introduced a restricted temporary six-case model smoke test; [#68](https://github.com/jcr0916-hue/federatedrepublic/pull/68) removed the benchmark endpoint.
- [#69](https://github.com/jcr0916-hue/federatedrepublic/pull/69) expanded the corpus to 35 cases spanning Scenes 1–5, including injection, out-of-bounds and underspecified moves.
- [#70](https://github.com/jcr0916-hue/federatedrepublic/pull/70) used a temporary fixed Sonnet/Haiku/Gemini comparison route. The PR description **does not establish numerical results**, so this register does not invent them.
- This experimental feature was subsequently retired from the active website; see [#112](https://github.com/jcr0916-hue/federatedrepublic/pull/112).

**Avoid redoing:** Do not rebuild a retired feature or repeat its classifier benchmarks without an explicit decision to reactivate it. If revived, inspect the 35-case corpus and original measured results first.

## Temporary benchmark endpoint policy

Temporary API routes were repeatedly added only to measure controlled fixtures and subsequently removed ([#51](https://github.com/jcr0916-hue/federatedrepublic/pull/51), [#68](https://github.com/jcr0916-hue/federatedrepublic/pull/68), [#74](https://github.com/jcr0916-hue/federatedrepublic/pull/74)). Retain benchmark corpora and decision records, **not unattended public comparison endpoints**.

## Future experiment entry requirement

Before running another AI comparison, record: **question; existing baseline and completed prior experiments; exact candidate/model version; fixed corpus; primary accuracy/safety failures; latency/token costs when measured; decision threshold; actual result; deployment decision; retirement of any temporary endpoint**. Mark missing results *not recorded* rather than assuming success. Update this register as part of the deciding PR.
