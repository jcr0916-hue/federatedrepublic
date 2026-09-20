# The Federated Republic Website Review
## Consolidated findings and recommendations

**Review completed:** September 19, 2026  
**Scope:** Information architecture, visual hierarchy, page roles, content discovery, shared components, maintainability, and visitor experience across the main site.

---

## Executive summary

The Federated Republic has a strong problem: it contains more good material than its current navigation and page hierarchy can comfortably explain.

The site already has unusual depth:

- a complete annotated constitutional framework;
- diagrams and one-page reference guides;
- a large scenario library;
- Torenthia, a living constitutional world with news, records, Court decisions, dispatches, states, and territories;
- interactive features including the questionnaire, Constitution Navigator, and Living Crossroads;
- a documented constitutional-development history and sources archive.

The site’s core challenge is **not content scarcity**. It is that a first-time visitor is asked to choose among many valid destinations before the project has made clear what it is, how its parts relate, or where to begin.

The recommended direction is not a full rewrite and not a reduction in intellectual ambition. It is a clearer system:

> **Read the rule. See the mechanism. Experience it in a story. Follow it in a living republic.**

That four-part promise is already true. The website should make it obvious.

---

# 1. Core diagnosis

## 1.1 The site currently has too many apparent front doors

The homepage currently presents, in quick succession:

- a constitutional project;
- a Constitution question/search tool;
- Living Crossroads;
- an introductory scenario;
- a questionnaire;
- a large latest-content stream;
- multiple exploration cards;
- and a broad top-level navigation menu.

Each component has value. The accumulated effect is choice overload.

A visitor may reasonably ask:

- Is this a proposed Constitution?
- Is it a learning tool?
- Is it a fictional world?
- Is it an AI site?
- Is it an interactive game?
- Is it a public archive?

The answer is “all of these,” but the hierarchy should be:

1. **The Constitution is the foundation.**
2. **Scenarios, diagrams, and Quick Sheets make it understandable.**
3. **Torenthia shows it operating in a living fictional republic.**
4. **Interactive tools are optional ways into the material.**

## 1.2 The visual system is coherent but too even

The existing navy, gold, and cream palette; Cormorant Garamond headings; Jost body text; and JetBrains Mono labels are strong house elements. They should remain.

The issue is visual sameness:

- many cards have similar borders, backgrounds, labels, and text density;
- several unrelated experiences receive the same visual weight;
- landing pages often resemble well-designed catalogues rather than editorially directed journeys;
- dynamic content is sometimes represented by horizontal carousels rather than by meaningful current-state signals.

The site needs a stronger visual ladder:

- one dominant action;
- two or three secondary paths;
- quiet reference tools below them.

## 1.3 The site has valuable distinct modes that need clearer boundaries

The site should distinguish these modes at every level:

| Mode | Primary purpose | Primary page family |
|---|---|---|
| Read | Operative constitutional text | Constitution |
| Understand | Mechanisms and summaries | Diagrams and Quick Sheets |
| Experience | Stories and stress tests | Scenarios |
| Follow | Living constitutional consequences | Torenthia |
| Investigate | Full public archive | The Record |
| Participate | Optional interactive entry | Questionnaire, Navigator, Crossroads |
| Research | Development history and sources | Utility / research pages |

These modes should link together constantly, but should not look or behave identically.

---

# 2. Recommended top-level information architecture

## 2.1 Primary navigation

Reduce the visible global navigation to five primary destinations:

```text
Start Here | Constitution | Learn | Torenthia | Explore
```

### Start Here
A guided orientation route, either a compact page or a prominent homepage section.

### Constitution
- Read the Constitution
- Browse by article
- Explore by topic
- Download formal PDF
- Design History & Change Log

### Learn
- Scenario Library
- Diagrams
- Quick Sheets
- Living Crossroads
- Constitution Questionnaire

### Torenthia
- The Republic Now
- The Record
- Atlas
- States and Territories
- Dispatches / Voices
- Current story dossiers

### Explore
- Sources & Inspiration
- AI Features & Privacy
- Contact
- Project repository / report an issue

The current project has enough destinations to warrant grouped navigation. It does not benefit from exposing every utility page as a first-level decision.

## 2.2 Footer and utility navigation

Move the following out of the primary navigation and into a footer or utility group:

- Contact
- Sources
- Constitutional History
- AI Features & Privacy
- Download PDF

These pages remain important, but they do not need to compete with the reader’s first journey into the Constitution or Torenthia.

---

# 3. Homepage

## 3.1 Proposed homepage job

The homepage should do three things:

1. explain what the project is;
2. state why it is interesting;
3. offer an obvious first route.

Suggested explanatory copy:

> **The Federated Republic is a living constitutional-design project.**  
> Read a complete proposed constitution, see how its institutions work under pressure, and follow the fictional republic that lives under it.

## 3.2 Above-the-fold hierarchy

Keep the dark navy hero and the seal. They give the project identity and authority.

Revise the action hierarchy:

```text
What would a better republic look like?

A living constitutional-design project:
read the framework, see it under pressure,
and follow the fictional republic it governs.

[Start with a story]   [Read the Constitution]

Ask the Constitution [secondary search tool]
```

The Constitution Navigator should remain available, but it should not be the implied first action for a visitor who does not yet know what to ask.

## 3.3 Main homepage structure

```text
1. Dark identity hero
2. Permanent “Start Here” feature: Ordinary Law
3. Time-limited “Featured Now” module: current live feature / Korda
4. Three gateways: Read | Understand | Follow
5. Latest from the Republic: one lead item + three compact updates
6. Reference and tools: quiet links
7. Footer / research utilities
```

## 3.4 Card and imagery rules

### Keep
- the seal;
- the large editorial featured-card pattern;
- real Torenthian maps, portraits, flags, document details, and diagram fragments;
- restrained high-contrast feature areas.

### Change
- reserve the large split-feature card for one permanent onboarding experience;
- give Living Crossroads its own current-feature treatment;
- make the questionnaire visibly secondary;
- replace or greatly reduce the homepage update carousel;
- make the lower Explore area quiet and reference-oriented.

### Avoid
- an image for every feature;
- generic stock government imagery;
- auto-rotating carousels;
- motion that exists only to look busy.

---

# 4. Torenthia: the living world

## 4.1 Page role

Torenthia should be the site’s **living-world newsroom and orientation page**, not its full map, full archive, state directory, and national statistics dashboard all at once.

Suggested framing:

> **Torenthia is the fictional republic where this Constitution is put into practice.**  
> Elections proceed, courts decide, territories seek statehood, neighbors apply pressure, and every major act leaves a public record.

Use the word **fictional** clearly and early. This reduces confusion while preserving immersion.

## 4.2 Keep the map, change its job

The map is valuable visual infrastructure. It gives the Republic place, scale, pressure, and atmosphere.

Do not remove it.

Change its role from an interface-first task to a visual anchor:

- place it beside or behind Torenthia’s introductory framing;
- highlight only two or three current pressure points;
- use optional click interaction rather than “Click any dot” as the first instruction;
- move full geographic inspection and activity exploration to the Atlas.

The map should say:

> “This is a country in a real region, with active pressure points.”

It should not demand that a new visitor operate an interface before understanding the page.

## 4.3 Add “The Republic Now”

Before the general latest-record list, add a curated current-briefing module.

Recommended active-file pattern:

```text
Korda: One Territory, Competing Futures
Lake Varda: Diplomacy After the Crisis
Fiscal Equalization: The Domestic Test
Argent Ridge: Consent, Housing, and the National Trust
```

Each file should have a one- or two-sentence explanation and routes to:

- a story dossier;
- relevant public records;
- related provisions;
- a relevant state or territory page;
- an optional interactive feature where appropriate.

## 4.4 Move or compress lower-priority material

### Move to Atlas / Republic at a Glance
- full map inspector;
- activity legend and “click any dot” instruction;
- full States and Territories table;
- broad neighboring-sovereignties directory.

### Keep in condensed form
- executive support;
- one live constitutional question;
- core federal structure facts;
- a few current dispatches or voices.

### Reduce
- visible latest-record cards to four or five;
- inactive dispatch cards;
- duplicate promotion of a current feature.

---

# 5. Atlas, states, and territories

## 5.1 Atlas

The Atlas should be a visual orientation and regional-context page.

### Recommended structure

```text
1. World-map hero
2. Regional pressures: four current geographic files
3. Neighboring-sovereignty cards
4. Solara as a Republic / external-world bridge card
5. “Beyond the Edge” closing section
```

The “Beyond the Edge” material is excellent and should remain. It gives the world limits and stops the atlas from feeling exhaustively invented.

### Neighbor cards should show
- directional relationship;
- concise political identity;
- current status;
- mini-map marker or geographic cue;
- one related story route.

Do not turn every neighboring sovereignty into a full fictional encyclopedia unless the record gives it a real reason to become one.

## 5.2 State profiles

The current Harren, Varek, Norvane, and Kelvant profiles have strong substantive identity. The flags are especially valuable visual assets.

Each state profile should include:

```text
Flag
State name and regional descriptor
Population / federal representation / constitutional status
Small Republic-map crop
State Now or State Position panel
“How this state works” mechanism strip
Long-form constitutional profile
Short grouped related record
Links to Constitution and complete related archive
```

### Add restrained state accent colors
Use colors derived from flags only for small details:

- top rule;
- map highlight;
- status border;
- active-file panel;
- hover accent.

Federal navy, gold, and cream remain the dominant system.

### Do not force every state to have a crisis
Harren’s quieter “founding influence” status is legitimate. A living federation needs jurisdictions that are stable, quiet, or relevant mainly through institutional inheritance.

## 5.3 Territories need a distinct template

Territories should not be treated as incomplete States.

A territory profile should emphasize:

- constitutional relationship;
- federal Assembly representation;
- no Senate representation;
- current statehood / incorporation / territorial process;
- governing compact or current procedure;
- map and affected geography;
- process graphic where relevant.

### Priority territory pages
1. **Korda dossier** — highest priority; an active constitutional file, not a generic territory profile.
2. **Solara** — visually and politically distinctive island territory.
3. **Morantine** — statehood-audit path and Valedon context.
4. **Verdmont** — map summary unless a substantive arc develops.

### Korda dossier should contain
- map crop: interior, corridor, Kelvant boundary, Varenne Station;
- competing petitions;
- JMC determination;
- Supreme Court decision;
- current Convention status;
- chronological timeline;
- key records;
- relevant Article XV links;
- Living Crossroads as explicitly non-canon companion content.

---

# 6. Constitution reader

## 6.1 Preserve the reader’s seriousness

The Constitution is the site’s intellectual center. It should remain calm, durable, formal, and readable.

Do not turn every provision into a card or attempt to make the full text “exciting.”

The needed improvement is orientation.

## 6.2 Add three ways into the text

### Read by article
The canonical reading route.

### Read by question
Curated paths such as:

- How are rights protected?
- Who controls military force?
- How is a law made?
- What happens in an emergency?
- How are judges selected?
- How do States and Territories change status?

### Read through the Republic
Routes from live Torenthian files to provisions:

- Korda → Article XV;
- Argent Ridge → Article XVIII;
- Lake Varda → Articles II, XIV, and X;
- fiscal equalization → Article XII.

## 6.3 Reader interface

Add a compact top navigator:

```text
The Constitution
176 provisions · 20 articles · Annotated edition

[Browse articles] [Explore by topic] [Search] [Download PDF]
```

On desktop, use a sticky article rail. On mobile, use a compact accessible article menu.

## 6.4 Article opening panels

Each article should open with:

- article number;
- article title;
- one plain-language sentence;
- a small diagram fragment or structural visual;
- selected routes to diagram, Quick Sheet, scenario, and Torenthia.

Example:

```text
ARTICLE XV — TERRITORIAL STRUCTURE AND STATEHOOD

How a place joins, rises, restructures, or leaves the Republic.

[See the process] [Open Quick Sheet] [Read Korda dossier]
```

## 6.5 AI rationale

Make the rationale affordance explicit beside provision titles, but keep it secondary.

The hierarchy should remain:

1. constitutional text;
2. article explanation;
3. curated human-authored learning routes;
4. optional AI rationale.

---

# 7. Scenarios

## 7.1 Scenario Library role

The Scenario Library should promise:

> **Find the constitutional situation you want to test.**

Its preferred hierarchy:

```text
Start Here
Featured Now
Browse by constitutional question
Browse the full library
```

The current library contains a large number of scenarios and categories. It should not expose multiple competing browse systems before the visitor can choose a route.

## 7.2 Card design

Scenario cards should show:

- read time;
- scenario intensity or type;
- provisions/mechanisms in focus;
- central subject;
- a brief “Use this if…” explanation.

Example:

```text
ORDINARY LAW
12 min · Ordinary governance
NRS · Social State · Asylum · Monitors

Use this if: you want to see the Constitution operating
in a normal week rather than a crisis.

[Read the scenario →]
```

## 7.3 Visual language

Use category-level visual textures rather than an image for every scenario.

Examples:
- dual executive: split linework;
- rights and emergency: warning-rule treatment;
- territorial structure: boundary / map contour;
- public record: document-number grid;
- fiscal system: ledger or measurement motif.

Reserve full imagery for:
- the permanent onboarding scenario;
- current featured scenarios;
- major multi-part narratives;
- stories anchored in a particular person or place.

## 7.4 Individual scenario pages

Keep them literary.

Use:
- clear scene dividers;
- a small reading-progress indicator;
- character/time markers;
- occasional “constitutional mechanism” pullouts;
- a consistent closing bridge.

### Standard ending module

```text
WHAT THIS TESTED
• National Record System
• Social State floor
• Independent monitoring
• Asylum protection

GO DEEPER
[Read the provisions]
[See the mechanism]
[Browse related scenarios]
[Follow it in Torenthia]
```

---

# 8. Diagrams and Quick Sheets

## 8.1 Diagrams

Diagrams should be treated as a visual laboratory, not decorative illustration.

At the top, provide a short “start with” selection:

```text
The whole government
How a law passes
The dual executive
Rights in an emergency
States and territories
```

Then emphasize one selected diagram at a time, with full explanations still available below or through a deliberate “open full explainer” action.

## 8.2 Shared diagram language

Standardize:

| Element | Visual rule |
|---|---|
| Institutions | Navy rectangular nodes |
| Democratic/public inputs | Cream nodes with gold border |
| Constitutional constraints | Gold rules / framing |
| Independent oversight | Distinct slate outline |
| Active path | Gold |
| Ordinary relationship | Navy |
| Valid outcome | Green plus label/icon |
| Invalid/failure outcome | Red plus label/icon |

Do not use color alone to convey legal consequence.

Replace emoji-style institutional icons with a small house SVG icon set.

## 8.3 Reuse diagram fragments

Reuse cropped static diagram fragments across the site:

- homepage learning gateway;
- Constitution article covers;
- Quick Sheet previews;
- Korda procedural dossier;
- state/territory profiles;
- related-content modules.

This provides visual continuity without requiring a large new image library.

## 8.4 Quick Sheets

Quick Sheets should consistently be called:

> **One-page constitutional reference guides**

Add:
- preview fragments;
- print/download affordances;
- a “Start here” recommended sheet;
- a short “Use this if…” line per sheet;
- visible links to related article, diagram, scenario, and world file.

Quick Sheets should feel like practical tools readers can keep.

---

# 9. Living Crossroads and interactive features

## 9.1 Living Crossroads

Living Crossroads should be framed as:

> **A non-canon interactive perspective on an unfolding constitutional dispute.**

The player’s choices may affect:

- which role they inhabit;
- which conversations and authored fragments they see;
- their delegate’s approach and private reflection;
- which political risks are visible;
- a playthrough’s interpretive meter state.

The player’s choices must not affect:

- Torenthian canon;
- the real public storyline;
- future NRS records, Court decisions, news reports, state pages, or dossiers;
- the actual Korda Convention outcome;
- persistent site data.

The ending should distinguish:

1. **What your delegate’s path through the Convention suggests**, and
2. **What the public record ultimately says**, when canon has published it.

Do not use player meter logic to select a canonical Korda outcome.

## 9.2 Questionnaire

The questionnaire should be the site’s warmest, most reflective interactive space.

Recommendations:
- use exact and consistent question-count language;
- provide a concise privacy notice near free-text input;
- use one uncluttered question per screen;
- keep “curious librarian, not a pundit” as the guiding voice;
- route results into relevant Constitution, Quick Sheet, diagram, scenario, and Torenthia pathways.

## 9.3 AI Features and Privacy

The substance is strong. Improve presentation with four concise feature cards:

- what it does;
- what it does not do;
- what is sent;
- what non-AI alternative exists.

Maintain the current precise Living Crossroads disclosures.

---

# 10. The Record, news, NRS, and Court pages

## 10.1 The Record

The Record should be the searchable public archive, not a second Torenthia landing page.

### Immediate quality-control correction
The current Record header presents **Year 12** while the newest content is Year 13, Month 12. Correct this immediately.

### Recommended structure

```text
The Record
Search the archive
Filter by type
Filter by active file
Filter by place
Current files strip
Chronological results
Load more / month archive
```

Document types:
- News;
- NRS;
- Court;
- Dispatch;
- Civic Life / Ordinary Republic;
- Feature or reference, where applicable.

Mundane civic reporting should remain. It is an important part of the world’s credibility.

## 10.2 Shared content manifest

A structured manifest should drive:

- homepage latest items;
- Torenthia latest items;
- The Record;
- state and territory pages;
- story dossiers;
- related-document modules;
- chronology;
- filters;
- automatic previous/next navigation.

Core metadata:

```text
id
type
title
date
author / authority
publication
url
blurb
jurisdictions
story arcs
constitutional provisions
people
related documents
image
featured flag
```

This is the highest-value maintenance improvement available.

## 10.3 News templates

News pages should make visible:

- outlet;
- author;
- date/place;
- live file or story arc;
- related legal or official record;
- context module;
- follow-the-file navigation.

Use portraits selectively for recurring correspondents, public figures, dispatch writers, and feature profiles. Do not make every report image-heavy.

## 10.4 NRS templates

NRS pages should lean into authoritative document design:

- prominent record number;
- issuing authority;
- constitutional basis;
- related record links;
- structured identification fields;
- a high-contrast “Effect” conclusion box.

NRS pages should not need photographs.

## 10.5 Court templates

Court pages should use reusable front matter:

- docket;
- date;
- vote;
- author and dissent;
- constitutional question;
- holding;
- links to opinion, dissent, case history, related records, and current dossier.

Long opinions benefit from a sticky table of contents.

## 10.6 Relational navigation

Every world-content page should show what it connects to.

Examples:

```text
Follow this file
Previous reporting
Official record
Court decision
Related jurisdiction
Relevant constitutional provision
Current dossier
```

This is much more effective than making readers repeatedly return to a large chronological archive.

---

# 11. Research, history, sources, and contact

## 11.1 Constitutional History

Reposition as:

> **Design History & Change Log**

It is valuable to serious readers, auditors, and constitutional-design researchers, but should be grouped under Constitution or Research rather than top-level navigation.

Add:
- revision summary at top;
- current document count/date;
- filters by change type;
- short expandable entries;
- links to current operative text;
- a clear distinction from in-world NRS records.

## 11.2 Sources & Inspiration

Give the page a clear title and explanatory introduction.

Use three visible sections:
- Foundational Documents;
- Political and Philosophical Tradition;
- Suggested Reading.

Use expandable source cards for the long explanatory notes.

Give negative examples, such as the Confederate Constitution, a clear label such as:

```text
NEGATIVE DESIGN CASE
```

Keep the transparent AI-origins statement as a dedicated concluding section linking to operational AI privacy information.

## 11.3 Contact

Keep it direct, but organize by purpose:

| Visitor need | Route |
|---|---|
| Report an error or broken link | GitHub issue |
| Ask a project question | Email |
| Follow updates | Social channels |
| Discuss the design in depth | Email / repository discussion |

Contact belongs in the footer or utility navigation, not primary navigation.

## 11.4 PDF

Label consistently:

> **Download the Constitution (PDF)**  
> Formal edition · current revision · print-ready

Place it:
- in the Constitution reader;
- in Constitution navigation;
- in the footer;
- in selected reference pathways.

---

# 12. Cross-site visual system

## 12.1 Keep the current house style

Retain:
- Cormorant Garamond for headings;
- Jost for body and interface;
- JetBrains Mono for labels and constitutional references;
- navy, gold, cream, and restrained semantic status colors;
- rectangular, editorial card design;
- clear rules and structured whitespace.

Do not introduce Playfair or generic government-dashboard aesthetics.

## 12.2 Define page families

| Page family | Visual feeling | Examples |
|---|---|---|
| Landing | editorial, directional, high contrast | Homepage, Torenthia, Atlas |
| Formal document | calm, durable, authoritative | Constitution, NRS, Court |
| Literary | paced, human, immersive | Scenario pages, dispatches |
| Visual explainer | active, mechanical, responsive | Diagrams, Quick Sheets |
| Archive | structured, filterable, investigative | The Record, history |
| Interactive | focused, uncluttered, privacy-aware | Questionnaire, Crossroads |
| Utility | concise, trustworthy, low competition | Sources, AI, Contact |

## 12.3 Component rules

Create shared components for:

- page hero;
- eyebrow labels;
- primary and secondary calls to action;
- type badges;
- story-arc chips;
- jurisdiction chips;
- status panels;
- feature cards;
- record cards;
- related-content modules;
- article/dossier headers;
- section dividers;
- print/download actions.

Shared components matter more than a broad cosmetic redesign. They make future pages feel intentional and reduce maintenance cost.

---

# 13. Mobile, accessibility, and interaction requirements

## 13.1 Mobile

Every major feature should be tested as a primary experience, not merely compressed desktop.

Priorities:
- no hover-only definitions, instructions, or controls;
- visible tap targets of adequate size;
- readable provision and record text;
- compact article navigation;
- maps that offer an accessible non-map route;
- diagrams that can be explored without horizontal dead ends;
- tables that reflow or provide an alternate card view;
- cards that do not require side-by-side layout to make sense;
- a mobile visual treatment for heroes where large seals or maps are hidden.

## 13.2 Accessibility

Keep and extend:
- skip navigation;
- meaningful alt text;
- semantic headings;
- visible keyboard focus;
- labeled form controls;
- sufficient contrast;
- non-color-only status communication;
- reduced-motion support;
- accessible accordion semantics;
- focus management for overlays, panels, and dialogs.

The Constitution, Court, NRS, and Record pages are especially important because they are long-form information surfaces. Accessibility here is part of the project’s constitutional ethic, not merely compliance work.

## 13.3 Motion

Use motion only where it explains changing state or interaction:

Good:
- current map marker pulse;
- active story transition after intentional user input;
- diagram-node response;
- subtle panel opening;
- status changes tied to actual content.

Avoid:
- auto-advancing carousels;
- decorative looping animation;
- parallax;
- animated counters with no informational purpose;
- bouncing calls to action.

---

# 14. Maintainability architecture

## 14.1 Shared navigation and CSS

Use one shared navigation source and shared page-family/component CSS.

The project has enough pages that duplicated markup and inline style variants will otherwise make every visual correction expensive and risky.

Prioritize:
- shared global navigation;
- shared footer;
- shared card and badge components;
- document-type templates;
- page-family CSS;
- site-wide design tokens.

## 14.2 Content manifest

Implement the world-content manifest before adding more manually maintained ticker surfaces.

One published item should update:
- homepage latest;
- Torenthia latest;
- The Record;
- relevant state/territory profile;
- related story dossier;
- previous/next item logic.

## 14.3 Incremental delivery

Do not attempt a big-bang rebuild.

Use:
1. shared foundation;
2. homepage and global navigation;
3. Torenthia and Record;
4. state/territory and Korda dossier;
5. Constitution / scenarios / diagrams;
6. utility pages;
7. iterative content cleanup.

Each phase should be independently deployable and reversible.

---

# 15. Prioritized implementation roadmap

## Phase 0 — Accuracy and small trust repairs

1. Correct the Record header’s Year 12 / Year 13 mismatch.
2. Correct or clarify the questionnaire’s “9 questions” versus “1 / 8” count.
3. Review all live feature descriptions for canon/non-canon accuracy.
4. Ensure current content dates, record labels, and “latest” ordering match the public archive.
5. Verify visible navigation labels match actual page roles.

## Phase 1 — Highest impact, lowest conceptual risk

1. Simplify primary navigation into five grouped destinations.
2. Rewrite homepage hero explanation and calls to action.
3. Make Ordinary Law the stable onboarding feature.
4. Separate Living Crossroads into a distinct Featured Now module.
5. Reduce homepage updates to one lead item plus three or four compact items.
6. Add utility/research grouping for History, Sources, AI, Contact, and PDF.
7. Establish shared badges, card hierarchy, and call-to-action styles.

## Phase 2 — Content discovery foundation

1. Build the world-content manifest.
2. Make homepage, Torenthia, and Record draw from the manifest.
3. Add document metadata for type, arc, jurisdiction, provision, and relationships.
4. Build generated related-record modules.
5. Add a simple Korda current-file / dossier page.

## Phase 3 — Torenthia visual reorganization

1. Reframe Torenthia around The Republic Now.
2. Keep the map as visual orientation; move deep inspector functions to Atlas.
3. Shorten latest-record display.
4. Move large state table to Republic at a Glance / Atlas.
5. Add active-file panels and direct routes to dossiers.

## Phase 4 — State, territory, and Atlas system

1. Recompose state-profile template.
2. Add map crops and restrained state accents.
3. Replace long manual record lists with generated grouped records.
4. Replace selective state-page navigation with a jurisdiction directory.
5. Build Korda as a territory dossier.
6. Add Solara and Morantine when story and design value justify them.

## Phase 5 — Learning-system integration

1. Add Constitution article navigator and entry modes.
2. Add article-opening panels with diagram, Quick Sheet, scenario, and Torenthia routes.
3. Simplify Scenario Library browse hierarchy.
4. Add scenario metadata and end modules.
5. Rework Diagrams around a selected visual stage.
6. Create reusable diagram fragments and SVG icon set.
7. Add Quick Sheet previews and print affordances.

## Phase 6 — Utility, refinement, and accessibility

1. Rework questionnaire flow and result routes.
2. Convert AI Features table into feature transparency cards.
3. Add History filters and expandable entries.
4. Add Sources section navigation and source cards.
5. Reframe Contact by purpose.
6. Complete mobile, focus, reduced-motion, contrast, and print testing.

---

# 16. Guardrails

## Preserve

- the seriousness of the Constitution;
- the literary quality of scenarios;
- the documentary authority of NRS and Court records;
- Torenthia’s ordinary-life material;
- flags, maps, and local constitutional distinctions;
- current typography and base palette;
- transparent AI disclosures;
- strict separation of canon from interactive play.

## Do not do

- do not turn every page into a card grid;
- do not illustrate every scenario;
- do not add imagery solely to fill space;
- do not use generic stock political imagery;
- do not make AI the primary visual identity of the project;
- do not use auto-rotating carousels as a substitute for current content;
- do not make player interaction alter Torenthian canon;
- do not redesign every page simultaneously;
- do not sacrifice the formal-document experience in pursuit of visual novelty.

---

# Closing recommendation

The project does not need to become louder. It needs to become more legible.

Its strongest promise is already present:

> **Read the constitutional rule. See the institutional mechanism. Experience it through people. Follow the consequences in a living republic.**

The redesign should make that path simple for a first-time visitor, rewarding for a returning reader, and maintainable for the project over time.
