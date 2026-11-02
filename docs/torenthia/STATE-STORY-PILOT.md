# State-storytelling pilot — editorial architecture

**Status:** Corindal supervised editorial pilot tested and configured; broader federal/State network planned, not yet deployed. Internal editorial planning only, not published World/NRS canon.

## At-a-glance progress — 2026-11-01 (real-world)

| Workstream | Status | Evidence / next action |
| --- | --- | --- |
| Corindal agent source packet and constitutional boundaries | **Completed** | Pilot kit pinned at source commit `ed68a7aa62fe4c36f3376cc3f7199d7980b15ce7`; refresh when published main advances. |
| Corindal DeepSeek V4 Pro editorial evaluation | **Completed (supervised pilot accepted)** | Readiness, local story/revision, Commission feature, GitHub-based federal-to-State review assessed by central editor; outputs remain **unpublished proposals**. |
| Corindal agent instructions and GitHub read access | **Configured by author (reported)** | v2.0 plus independent-perspective refinement; verify current access and permitted directory scope during operational use. |
| First real Corindal response to national content | **Next** | Agent independently recommends draft / monitor / no action; central editor reviews. |
| Federal editorial agent | **Planned** | Independent Republic-wide perspective; not a supervisor of State agents. |
| Additional State agents | **As needed** | Create from reusable standards plus each State's Constitution and published context. |
| Cross-jurisdiction coordination and website presentation | **Planned** | One shared canon, tracked impacts, one canonical article with links on multiple views. |

**Mobile progress routine:** Update this table and dated decision log when milestones change; link PRs and source commits. Do not mark tests, deployment, or publication complete on assumption. This `docs/**` planning file is not an in-world publication.

## Operating model — independent perspectives and central review

- **President (author):** sets vision and priorities and holds final strategic and publication approval.
- **Vice President (ChatGPT):** delegates, defines standards, checks submitted work, coordinates chronology and arcs, manages editorial revisions, website work, and GitHub workflow. Preserve the author's discovery experience for reserved storylines: no future plot details in State/federal agent packets or routine progress reports.
- **Federal editorial agent (future):** acts independently from the perspective of the **Republic as a whole**, considering national constitutional obligations, collective interests, State developments, and diverse federal constituencies. It does **not** supervise or dictate State agents or automatically equate the federal government's position with the Republic's interest.
- **State editorial agents:** act independently from the interests and circumstances of their respective **States**, informed by federal developments and activities of other States. They do not automatically adopt federal or neighboring positions, nor assume that State government speaks for every community. Different local interests and perspectives must be credible.
- **Reciprocity:** Federal, State, and cross-State stories can each originate independently. When one is published, other agents assess it for relevant local/republic-wide consequences and may propose reactions or decide no response is warranted. Distinguish reported facts, potential effects, and proposed actions.
- **Common safeguards:** All agents work from current constitutions and verified published canon, record source commit/frontier, label proposals, protect spoiler-sensitive editorial plans, and submit for central review. No agent independently advances the clock, allocates official sequences, publishes, or alters established canon. A new story creates shared canon only through approved publication.
- **Workflow:** discovery → source/authority check → perspective-specific pitch or draft → internal self-review → VP continuity and cross-jurisdiction review → President's approval where required → controlled publication with metadata, chronology and website updates.

## Objective

Develop independently motivated State stories that can intersect federal developments without making State officials mere extensions of national plots. The public website must remain navigable and coherent.

## Pilot boundaries

- Test **one State first**, then compare with an additional State when continuity and publishing review prove manageable.
- Keep a maintained source packet for the pilot: versioned State Constitution, profile and historical tests, published local history, political context, established characters, unresolved matters, and applicable federal provisions and clocks. Record source paths/versions and separate published facts from proposals; refresh the packet before each batch rather than creating a competing story record.
- Existing State Constitution, profile and published historical tests control local canon; current federal Constitution and published World stories control cross-jurisdiction facts.
- A State editorial agent may propose local characters, events, opinions and stories but **may not write directly to main**, modify federal canon, alter a constitutional clock or independently publish.
- A single editorial review coordinates State-to-State effects, validates constitutional citations, checks chronology and either accepts, revises or rejects the proposal.
- Distinguish public news, official register items, historical tests, and private plot ideas. No future spoilers in ordinary author updates.
- Characters emerge when local stories need them; do not invent exhaustive official or party-leader rosters. Local institutions and communities retain their own interests, including in Corindal; they do not exist merely to advance Thoss's story.
- No State requires daily coverage. Evaluate the first pilot before considering contrasting States such as Varek, Merath or Arvane. Corindal has been tested as a supervised agent; the larger multi-State system remains planned.

## Minimal structured story proposal

Every draft should state State, fictional date, article type, proposed outlet and author (reuse established identities where appropriate), source references, affected constitutional provisions, new persons and places, arcs touched, federal consequences, unresolved hooks and whether anything is intended to become canonical.

Label claims as **published fact**, **approved editorial intention**, or **unresolved possibility**. The central editor checks the [Story Bible](STORY-BIBLE.md), [Status](STORY-STATUS.md) and [internal political/character planning](POLITICAL-CHARACTER-PLANNING.md), including polling and spoiler boundaries, before any publication decision. A rejected or unreviewed proposal creates no canon.

## Website presentation

Preserve a single canonical article source. State pages, national pages, topic/dossier pages and publication feeds may each surface links to it without duplicating the article. Existing State-test discovery already links cases to State profiles and cited constitutional provisions. Additional cross-links should use established metadata and existing styles; no autonomous State-specific site design.

Allow distinctive local voices within the common navigation and design. Public pages present the republic and its sources, not agent packets, production machinery or internal plans. Editorial documents remain under `docs/`, excluded by the existing website build.

## Decision log

- **2026-10-31:** Corindal source packet established from published main snapshot and constrained to non-spoiler records.
- **2026-11-01:** DeepSeek V4 Pro Corindal trials reviewed: constitutional readiness, local feature and revision, Development Commission conflict feature, and independent repository review; sufficient to continue supervised use, not approval for independent publication.
- **2026-11-01:** Confirmed organization: President sets vision; VP leads delegation, quality control, arc/timeline continuity and website; federal and State agents operate as **peers in editorial perspective**, each independent within one Republic and one published canon.
- **2026-11-01:** Progress tracking belongs in this GitHub Markdown, accessible on desktop or mobile; next update after first operational Corindal proposal.

## Evaluation before expansion

Review a small batch for (1) distinctive State viewpoint, (2) factual and constitutional continuity, (3) sufficient local stakes, (4) discoverability on the State page and relevant topical views, (5) editorial maintenance cost and (6) whether federal interconnections develop without forced plot convergence. Only expand beyond the pilot if these are demonstrated.
