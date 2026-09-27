# State historical tests

State tests are published canonical history demonstrating a State Constitution's
operation. They are distinct from hypothetical federal scenarios and automated
test fixtures. Editorial approval establishes the story; validators check its
metadata and cited provisions, not the truth or constitutional interpretation of prose.

## Source and metadata

Store finished HTML at `state-tests/<state>/<state>-test-NN-<slug>.html`:

```yaml
---
stateTest: true
state: varek
testNumber: 1
testId: varek-test-01
title: "The 72-Hour Flood"
date: "6.09"
stateProvisions:
  - "3.5"
  - "12.1"
  - "12.2"
  - "12.3"
  - "12.10"
  - "12.11"
status: canonical-history
---
```

Use the lowercase State slug from an established file in `State Constitutions/`.
The positive integer number is unique within that State. Pad it to at least two
digits in both filename and `testId`; use a lowercase hyphenated filename slug.
The directory, filename, State and number must agree, and `testId` must be unique.
Titles must be nonblank. Quote dates as fictional `Year.MM`, with a positive year
and a two-digit month from 01 to 12; `6.09` means Year 6, Month 9, not a real date.
No historical day is inferred. Eleventy's filesystem page date is not canon.

`stateProvisions` must be an array of quoted provision numbers. Each citation
must match a definition in that State's constitutional Markdown source; incidental
mentions elsewhere in its prose do not create provisions. Draft/review flags,
TODO/TBD/FIXME/placeholder text, World/NRS metadata and template/routing overrides
are rejected. Use root-relative public links/assets because these pages are nested.

## Import and validation

Drop the named HTML into the inbox, flat or under its exact `state-tests/<state>/`
subpath, and follow [Republic ingest](operations/REPUBLIC-INGEST.md): preview,
inspect the plan, then apply. New validated files can import automatically.
Existing files never auto-overwrite; replacements require manual review. Broken
local references block preview or post-import validation, and failed validation
leaves the incoming source in the inbox. No Bible/Status changes are automatic.

Run `npm run check:state-tests`, `npm run test:state-tests`, and the complete
`npm run world:publish-check` before publication. The build validates all State
tests, and discovery checks the rendered citation links in both directions.

## Discovery and current prototype

`lib/state-tests.mjs` supplies `_data/stateTests.js` and the `stateTests` Eleventy
collection. The data exposes `entries`, `byId`, `byProvision` (keys such as
`varek:12.1`), and State provision definitions with their citing tests. State
tests consume neither World nor NRS sequence numbers.

The small public `state-tests.html` index displays cited current provisions and
links back to their historical tests. Each test receives generated citation links.
The Varek profile links to Test 01, **The 72-Hour Flood**, published as approved
canonical history at `state-tests/varek/varek-test-01-the-72-hour-flood.html`.
Its names and places are intentional historical additions. A polished State
Constitution presentation can reuse these data without changing the schema.
