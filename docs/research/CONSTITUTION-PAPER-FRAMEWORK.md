# Constitutional research paper framework — working outline

**Status:** research design, not a completed paper or a claim of empirical validation.

## Purpose and boundary

The Federated Republic Constitution is a general constitutional design, distinct from the fictional Republic of Torenthia. Torenthia and its State constitutional history are **fictional mechanism illustrations**, not evidence that the Constitution has been deployed successfully in a real country. The papers should examine why mechanisms were designed, how textual versions changed, what failure modes were contemplated, and what simulated cases reveal or fail to reveal.

## Proposed paper families

1. **Textual evolution and design rationale.** Trace selected provisions across dated, preserved Constitution MD/JSON versions; document differences, the contemporaneous rationale when actually recorded, and open interpretive questions. Avoid describing a rationale as contemporaneous when inferred retrospectively.
2. **Institutional mechanism analysis.** Separate rule text, formal incentives, boundary conditions, anticipated failure modes, and real-world comparative literature. Illustrative Torenthian scenarios may be labeled and discussed separately from empirical evidence.
3. **Federalism and State diversity.** Contrast Torenthia's authored State constitutional provisions within the common federal framework; examine State historical tests as authored fictional case studies, clearly distinguished from real-world constitutional performance.
4. **Publication and version integrity.** Explain the dated document archive, provenance of changes, correspondence between markdown and JSON, and limits of automated validation. Distinguish a validator's consistency checks from proof of constitutional adequacy.

## Repeatable structure for each paper

- Research question and explicit scope
- Source corpus with precise file versions, archival identifiers, dates and citations
- Constitutional mechanism or change examined
- Methods and interpretive assumptions
- Evidence table: observed text changes, scenario premises, outputs and their provenance
- Alternative explanations, known objections, limitations and unresolved questions
- Conclusions restricted to what the sources justify
- Reproducibility appendix with version paths, scripts and checks

## Source hierarchy and verification

1. Dated archived Constitution text and current Constitution for exact language at each date
2. Preserved change records, PR decisions and associated tests for contemporaneous development history
3. Published fictional Torenthia and State tests, explicitly marked **fictional**
4. External scholarly literature, identified as outside scholarship and independently cited

Do not use a current explanation as proof of why an earlier revision occurred. Treat archives as evidence of text, not automatically of motive. A failed fictional test may demonstrate a modeled tension but cannot measure actual-world institutional performance.

Use the [archival policy](../operations/CONSTITUTION-ARCHIVAL.md) and the [October 31 integrity repair](../operations/CONSTITUTION-ARCHIVE-INTEGRITY-20261031.md) when selecting the corpus. The repair's hash-pinned duplicate aliases preserve historical bytes; they are not additional constitutional revisions or independent evidence. Identify the canonical version, source commit and content hash rather than counting filenames as separate observations.

## Next decisions

Choose the first paper's narrow research question, intended audience, citation convention and publication venue. Inventory the archived versions needed for that question before drafting results. Do not invent an empirical finding, source, or validation outcome.
