# Design Paper Publishing

Design papers explain the Constitution's principles, architecture, tradeoffs, and recurring design constraints. They are separate from Torenthia: Torenthia tests the Constitution; the papers explain the design.

## Start a draft

Use the preview-first helper:

```bash
npm run paper:new -- \
  --title "Constitutional Principles as Design Constraints" \
  --topic principles \
  --summary "How recurring constitutional principles were used to test, simplify, and refine the framework."
```

Add `--write` only after reviewing the proposed ID and filename.

Drafts are created with:

- `paperStatus: draft`
- `paperDate: null`
- `permalink: false`

so they do not enter the public paper library.

## Metadata

```yaml
designPaper: true
paperId: "constitutional-principles-as-design-constraints"
paperTitle: "Constitutional Principles as Design Constraints"
paperSummary: "..."
paperTopic: "principles"
paperStatus: draft
paperDate: null
paperProvisions: []
paperRelated: []
permalink: false
```

`paperProvisions` must contain valid constitutional provision numbers. `paperRelated` contains other `paperId` values.

## Publish

When a paper is finished:

1. Remove the draft marker from the body.
2. Change `paperStatus` to `published`.
3. Set `paperDate` to an ISO date such as `2026-09-22`.
4. Remove `permalink: false`.
5. Run `npm run test:papers` and the normal build.

Published papers automatically appear on `papers.html`, newest first.

## Suggested topic vocabulary

The topic field is intentionally flexible, but useful starting values are:

- `principles`
- `executive`
- `legislature`
- `judiciary`
- `oversight`
- `federalism`
- `democracy`
- `continuity`
- `rights`
- `transition`

The library can later group these automatically if the paper collection becomes large enough.
