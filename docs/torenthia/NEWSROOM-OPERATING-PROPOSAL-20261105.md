# Federated Republic Newsroom — weekend implementation brief (2026-11-05)

**Status:** PRESIDENTIAL PROJECT DIRECTION / IMPLEMENTATION PROPOSAL. **No scheduler, TypingMind run, webhook, automated publication or autonomous canonical action has been activated.**

## Operating purpose

All 12 State agents and four Territory desks are the **editorial owners of their jurisdiction**: independent correspondents, local institution/character designers, and regional voices. The Federal, Monitors, partisan/opinion and social-media desks own their respective beats. Agents read the shared **published** chronology and Constitution, develop original local ideas, and report independently, including disagreement with federal and neighboring perspectives. No desk has authority to create published fact by asserting a proposal.

**President:** strategic authority and final approval of content, canon, publication and deployments.

**VP / managing editor:** protects the global calendar and continuity, assigns and prioritizes leads, checks duplication/cross-jurisdiction conflicts, and submits reviewable publication packages.

**Agents:** create leads, personalities, long-term local arcs, proposed governmental actions, candidate NRS/public records, photographs/design concepts, and fully sourced story drafts when commissioned. "No story" is a valid report.

## Weekday Presidential editorial briefing

At the user's first daily Torenthia/Federated Republic work discussion, the VP should provide: date and verified main SHA; fictional frontier worldSeq/nrsSeq; since-yesterday publications; current clocks and due dates; recommended **today** release(s); proposed **tomorrow** assignments; open approval dependencies; website/Constitution release changes; social-media suggestion (Federated Republic-wide). Do not imply the first-chat trigger is a reliable autonomous system; scheduled morning delivery, if desired, is a separate user-approved automation.

## Reporting contract

Each correspondent report is short and structured:
- Source commit, observed fictional month and last prior report identifier.
- **Verified newly published facts**, with links.
- Up to **three leads** with local relevance, evidence, possible interviewees/characters, and national cross-effects.
- At least one **self-generated local lead** where justified, not an NRS echo.
- Government/character/setting design proposals, separately labeled **PROPOSED**.
- Existing arc updates, unknowns, legal/continuity review needs.
- Recommendation: **PUBLISH CANDIDATE / ASSIGN / DEVELOP / WATCH / HOLD / ARCHIVE / NO ACTION**.
- Requested frequency and specific justification, or return to routine.

No automatic World/NRS allocations, official-record entries, fictional-time advancement, factual assertions of proposed acts, or direct GitHub publishing by agents.

## Cadence and escalation

**Routine:** weekly per desk, staggered across working days to avoid 16 simultaneous reports.

**Active:** every 2–3 days only after VP authorization when a published development or approaching obligation materially affects the beat.

**Breaking:** event-triggered *request for editorial review*, not permission to manufacture fictional news or independently publish. If no external event listener exists, use the next scheduled review to detect changes; do not claim real-time monitoring.

Cap per desk on reports, runtime, tokens/spend, and queued work; require a cool-down before re-escalation and reversion to routine when quiet. Cross-desk coordination is through published facts and the VP, not private plot leaks.

## Intake: single editorial queue

Persistent per-item metadata:
- UUID/unique lead ID; owner jurisdiction/desk; title; type (news, NRS proposal, character, institutional design, visual/website feature); initial and latest source SHAs;
- public evidence/citations; canon classification (published / approved planning / unverified / new proposal);
- dependencies and affected jurisdictions; timeline/constitutional clock constraints; revision and cross-desk duplication links;
- priority, decision, owner, next check, last reviewed; publication PR and final published URL when approved.

Do not conflate **approved editorial canon** with publicly released fictional events.

## Four-desk pilot

**Corindal** — watch current political canon PR #300; no promotion of approved planning as published government acts.

**Korda** — follow electorate verification, jurisdiction, existing public articles without inventing referendum or border outcome.

**Varek** — county river works and local institutions; no conversion of works logs into NRS findings.

**Federal** — verify constitutional clocks, election progress, Executive Monitor succession and equalization without assuming outcomes.

Start with **manual intake or a test scheduler**, demonstrate one round-trip report per desk, duplicates filtering and total cost. Expand only after review. Preserve local agent initialization files outside the repository unless specifically approved.

## Weekend build/checklist (not yet performed)

1. Confirm TypingMind's supported execution model, remote invocation, authentication and scheduling capabilities; do not assume a hosted scheduler merely because agent tooling exists.
2. Choose a secure scheduled trigger and ingest route; secrets out of source control.
3. Define versioned JSON/report schema, approval queue and history/idempotency keys.
4. Bind agent-specific Constitution and published GitHub source packets; strictly read-only.
5. Implement once-per-period reporting with quiet, active and urgent categories, rate limit and retry limits.
6. Test four pilots with mocked/known published updates, review costs and report quality.
7. Add weekly summary to VP brief and backlog of planned next-day assignments.
8. Expand deliberately; no unattended publishing or clock advancement.

## Other project-wide social media

Social Media Agent covers **Federated Republic project in full**: Constitution, educational website features and Torenthia; **Constitution-Lab is separate**. Prioritize current changes, useful catch-up entry points, occasional evergreen topics. Confirm deploy and best reader destination. Prepare separately validated Facebook / X / Bluesky posts inclusive of actual URLs, all subject to Presidential approval.

## Conservation and dependencies

Never add automatically generated government activity to published canon. Honor approved local constitutions, Korda territorial editorial Compact, and the public Story Bible/Status chronology. Retain independent agent voices. Check all open PRs and current main before implementation. No source-code integration for TypingMind has been selected.

**Follow-up:** Weekend discussion should begin with this proposal, the President's direction, and a fresh capabilities check. This is a specification, not a claim that scheduled work is operating.
