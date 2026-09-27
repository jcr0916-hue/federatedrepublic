# Project progress and working ideas

**Session closeout:** 2026-09-26  
**Purpose:** current project-wide implementation handoff and idea log. This file is not constitutional or Torenthia canon. Canon and source authority remain where `PROJECT-SOURCES.md` says they are.

## Completed in this session

### Republic ingest expansion

The broader ingest work is live.

- Federal Constitution updates can preserve the prior generated Markdown outside the active repository before the canonical source is replaced.
- Federal snapshots live under `~/Downloads/Federated-Republic-Archive/constitution/` and do not recreate a live-repository archive.
- New State historical tests have a validated ingest path.
- Existing State Constitutions remain human-reviewed rather than automatically overwritten.
- State-test publication validates identity, fictional date, cited State provisions, canonical-history status, and draft/review exclusions.
- State tests are indexed in both directions: test to cited provisions and provision to tests.
- `npm run world:publish-check` includes the relevant State-test and State-Constitution presentation checks.

Operational details remain in `docs/operations/REPUBLIC-INGEST.md` and `docs/STATE-TEST-PUBLISHING.md`.

### Varek historical-test prototype

`state-tests/varek/varek-test-01-the-72-hour-flood.html` is the first published canonical State historical test.

The content was reviewed and left substantively unchanged in this session. Its role is now to serve as the prototype for how State constitutional history is displayed and connected to the underlying State Constitution.

State profiles now present historical tests as scalable cards rather than prose links. Each card can display:

- fictional date and test number;
- title;
- short summary;
- cited State provisions;
- direct link to the full historical test.

The cards are text-first. They do not require an image slot, so adding more State tests will not produce empty-looking media areas.

### State profile presentation

The Varek profile no longer carries a one-off sentence linking to the flood test.

The State-profile template now generates the historical-test section from the State-test index. This makes the pattern reusable as other States gain canonical historical tests.

Related-content cards were also adjusted so text-only cards can size independently from cards with media. An absent image should not create an empty visual frame.

Merged implementation:

- `67cd735` — **Improve State history cards and related rail layout**

### Polished Varek State Constitution

Varek now has a formatted State Constitution presentation at `state-constitution-varek.html`.

The page is generated from the authoritative Markdown in `State Constitutions/varek-state-constitution.md`; the presentation layer does not create a second constitutional source.

The prototype includes:

- title treatment and State flag;
- article navigation;
- stable provision anchors;
- formatted preamble, articles, provisions, paragraphs, and lists;
- links back to the Varek State profile and source Markdown;
- automatic **Tested in practice** callouts beside provisions cited by published State historical tests.

The parser was made tolerant of the heading and provision formats already used across the established State Constitutions so the shell can be reused later without normalizing constitutional source text merely for presentation.

The full publishing workflow passed before merge.

Merged implementation:

- `c26776f` — **Add polished Varek State Constitution presentation**

## Design direction now established

The State constitutional experience should follow this basic flow:

**State profile → formatted State Constitution → historical constitutional tests**

The same links should work in reverse:

**Historical test → cited provisions → State Constitution / State profile**

Historical-test cards should remain compact and text-first. Visual assets may be used where meaningful, but no card should imply that an image is missing simply because none was assigned.

The formatted State Constitution is a presentation layer only. The Markdown State Constitution remains the authority.

## Website AI direction

The public-site AI should primarily act as a **librarian**, not as an authority.

Its normal job would be to retrieve, explain, cite, and navigate the project's existing sources. A more demanding mode may support annotations on the annotated Constitution, but the model should still be grounded in canonical project data rather than inventing constitutional meaning.

A likely tiered architecture remains:

1. inexpensive librarian / retrieval model for ordinary site questions;
2. stronger structured model for annotation and harder explanation;
3. rare escalation to a premium API model for genuinely difficult cases.

Model choice should remain provider-agnostic at the application layer where practical.

Current procurement preference:

- prefer open source;
- open-weight is acceptable when necessary;
- U.S. or European model developers are preferred;
- Ollama compatibility is useful but not required;
- GLM has been removed from consideration under the project's procurement criteria.

Current model families worth benchmarking include Mistral, IBM Granite, Microsoft Phi, and Meta Llama. This is a working shortlist, not a deployment decision.

A useful future benchmark would use Federated Republic material directly and measure:

- factual grounding in retrieved sources;
- correct citation/navigation behavior;
- willingness to say when the sources do not establish an answer;
- structured-output reliability;
- annotation quality;
- latency and operating cost.

## Next likely work

No further constitutional fine-detail review is pending unless deliberately reopened.

Likely next work, when the project resumes:

- inspect the live Varek State profile and formatted Constitution as a visual prototype;
- make any small presentation corrections revealed by real deployment;
- decide whether the State Constitution shell is ready to roll out to the other States;
- add additional Varek historical tests gradually, with every proposed episode clearly separated from canon until published;
- continue evaluating a low-cost/open model for the public-site librarian and annotation features.

The Varek prototype should be allowed to prove the pattern before mass-converting every State page.
