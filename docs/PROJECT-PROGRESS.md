# Project progress and working ideas

**Session closeout:** 2026-09-27  
**Purpose:** current project-wide implementation handoff and idea log. This file is not constitutional or Torenthia canon. Canon and source authority remain where `PROJECT-SOURCES.md` says they are.

## Current implementation state

### Republic ingest and publication tooling

The broader ingest work is live.

- Federal Constitution updates can preserve the prior generated Markdown outside the active repository before the canonical source is replaced.
- Federal snapshots live under `~/Downloads/Federated-Republic-Archive/constitution/` and do not recreate a live-repository archive.
- New State historical tests have a validated ingest path.
- Existing State Constitutions remain human-reviewed rather than automatically overwritten.
- State-test publication validates identity, fictional date, cited State provisions, canonical-history status, and draft/review exclusions.
- State tests are indexed in both directions: test to cited provisions and provision to tests.
- `npm run world:publish-check` includes the relevant State-test and State-Constitution presentation checks.

Operational details remain in `docs/operations/REPUBLIC-INGEST.md` and `docs/STATE-TEST-PUBLISHING.md`.

### State constitutional presentation

The prototype phase is complete enough for normal use.

Published State profiles with formatted State Constitutions:

- Harren
- Varek
- Norvane
- Kelvant
- Rhovane
- Corindal

The presentation remains generated from each authoritative Markdown State Constitution; the formatted pages are not a second constitutional source.

State profiles automatically surface published historical tests as compact text-first cards. Formatted Constitutions can display **Tested in practice** callouts beside cited provisions. Related-content cards handle text-only and media content without empty image frames.

Rhovane and Corindal now also have published State flags and State-page accents.

## State historical tests

Published canonical history:

- **Varek Test 01 — The 72-Hour Flood**
- **Harren Test 01 — The Order Neither Executive Could Give**
- **Rhovane Test 01 — The Harbor That Could Not Close**

Approved drafts awaiting weekday publication:

- **Norvane Test 01 — The Fourteenth Day**
  - tests the Governor's fourteen-day emergency period, positive Assembly extension, selective continuation, and automatic lapse
  - likely display provision: §6.2
- **Kelvant Test 01 — The Item the Governor Crossed Out**
  - tests the line-item appropriations veto and two-thirds restoration by both legislative houses
  - likely display provision: §2.4

These drafts should receive a final canon/metadata/formatting pass immediately before publication.

## Torenthia World content

The current published frontier remains Year 13, Month 12, with the Korda Convention as the main active narrative.

The Convention's Joint Committee on Transition Facts has begun producing evidence. Published material already establishes:

- the certified lake corridor is not economically uniform north to south;
- northern districts are more integrated with Kelvant;
- southern lake districts remain more connected to Korda's interior;
- meaningful southern Lake Varda access has cultural, family, Indigenous, and practical importance as well as economic value.

The next content phase should emphasize **evidence before political convergence**.

### Working Korda runway

**Week of September 28:**
- fiscal-transfer and transition-cost records;
- dry NRS/committee filings;
- reporting that interprets evidence without implying a predetermined Convention result;
- ordinary-life coverage to keep the Territory from becoming only a procedural story;
- Norvane and Kelvant State-test releases during the week.

**Following week:**
- gradual movement in Mire and Rell's public positions;
- preserve Dessa Orin's whole-Territory statehood goal while creating a path for her to support a compromise that protects that future;
- subtle, background indications of Elin Thoss's coalition work;
- additional Convention process and factual compilation before a substantive resolution.

**Working editorial target for the Convention resolution:** Monday, October 12, 2026.

This is an internal target only. No publication has promised that date, and it should move later if the evidence or political convergence does not yet feel earned. The constitutional Convention clock, not the editorial calendar, remains the real timing constraint.

Full live-thread detail remains in `docs/WORLD-STORY-STATUS.md`.

## Website AI direction

The public-site AI remains planned primarily as a **librarian**, not as an authority.

Its normal job would be to retrieve, explain, cite, and navigate the project's existing sources. A more demanding mode may support annotations on the annotated Constitution, but the model should remain grounded in canonical project data rather than inventing constitutional meaning.

Likely architecture:

1. inexpensive librarian/retrieval model for ordinary site questions;
2. stronger structured model for annotation and harder explanation;
3. rare escalation to a premium API model for genuinely difficult cases.

Current procurement preference:

- prefer open source;
- open-weight is acceptable when necessary;
- U.S. or European model developers are preferred;
- Ollama compatibility is useful but not required;
- GLM is outside the current procurement preference.

Candidate families for later benchmarking include Mistral, IBM Granite, Microsoft Phi, and Meta Llama. This is a working shortlist, not a deployment decision.

**AI work is intentionally parked until next weekend.** Do not bring it forward during the weekday content cycle unless deliberately reopened.

## Next likely work

No further constitutional fine-detail review is pending unless deliberately reopened.

Immediate weekday queue:

1. publish Norvane Test 01 after final verification;
2. publish Kelvant Test 01 after final verification;
3. continue Korda evidence through NRS and reporting;
4. advance Lake Varda conference scheduling when useful without forcing Sunderland to become suddenly communicative;
5. keep Argent Ridge, Fiscal Equalization, Judicial Pool, and the Monetary Authority in the background unless a natural trigger arises.

Further State-profile rollout is paused. The current rule remains: **publish a State profile when the reader has a reason to click on that State**, rather than filling every State page merely for completeness.
