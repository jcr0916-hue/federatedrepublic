# Torenthia newsroom — how it runs

Each desk speaks for one jurisdiction or institution. Desks propose; the Central Editor reviews; John decides what becomes canon.

## The flow

1. **Every day at about 16:07 UTC**, the Vercel schedule `newsroom-daily` calls `api/newsroom-run.js` on the website project. Vercel Schedules may start a run up to 15 minutes late on the Hobby plan, and in rare cases runs it twice. A duplicate costs a few cents and the editor discards the extra draft.
2. The function reads [`agents/desks.json`](agents/desks.json) from GitHub `main` and runs each enabled desk scheduled for that weekday.
3. For each desk, **DeepSeek V4 Pro (August 2026 release) plans** one item using the story status, the story bible, and the desk's brief, assignments and notes. **DeepSeek V4 Flash writes** it with the full Constitution added. Either step can decide nothing is worth writing.
4. The draft goes to the existing Cloudflare inbox as `PROPOSED`, under that desk's name.
5. **At about 16:37 UTC, the desk editor sorts the day.** The `newsroom-triage` schedule calls `api/newsroom-triage.js`, where Claude Haiku 5.5 reads each new filing's declared track and attention (the `[canon · high · timely · touches: …]` tag at the start of its summary), a short excerpt of each canon filing, and the story status. It ranks canon filings for the Central Editor's three daily slots (the rest go to bank or back to the desk), routes ideas to the weekly idea board and records through, flags anything that looks wrong at a glance, and files its triage to the inbox as desk `desk-editor`. It needs no canon; the desks have already checked their own work against it. It discards nothing.
6. **At about 17:05 UTC, the Central Editor reviews.** Starting from the triage, it checks and edits only the shortlisted canon filings and anything flagged, skims routine records, updates each desk's notes, and stages accepted items as draft PRs. On Mondays it also puts the week's ideas on the [idea board](IDEA-BOARD.md), a phone page where John taps GO, LATER or NO; each day it turns new GO taps into assignments. John merges.

Each run reads every file at one `main` commit, recorded as `commit:<sha>` in the submission's `sourceRefs`. Before any model call, each desk confirms its inbox key works and that it hasn't filed within the last six hours, so a duplicate delivery costs nothing. A run with any failed desk returns an error, so it shows in the schedule's history and error rate. Vercel doesn't retry failed runs.

Nothing runs on anyone's computer. Nothing an agent writes reaches GitHub or the website without the editor and John.

## Controls

| To do this | Change this on GitHub `main` |
| --- | --- |
| Pause every desk | `"paused": true` in `desks.json`, or disable `newsroom-daily` under Vercel → Schedules |
| Run now | Vercel → Schedules → `newsroom-daily` → Run Schedule (only desks due that weekday run) |
| Pause one desk | that desk's `"enabled": false` |
| Change how often a desk runs | its `"days"` (weekdays), plus `"everyWeeks": 2` or `3` to run only every second or third week; `"weekOffset"` staggers desks on the same interval |
| Give a desk work | add a line under **Open** in its `ASSIGNMENTS.md`. A desk with an open assignment runs every week on its days, even if its cadence is every second or third week, until the assignment moves to Done |
| End a temporary desk | `"until": "YYYY-MM-DD"` on the desk: it stops running after that UTC day (the election tracker has one) |
| Change models | `defaultModel`, `planner.model`, or a desk's own `model` |

Each change takes effect at the next run, with no redeploy needed.

## Cost

Each desk run costs about 3–5 cents at November 2026 Gateway prices; records desks write with Flash alone, at about 1.5 cents a batch, and the desk editor's daily triage costs under a cent. The planner reads about 24,000 tokens and the writer about 67,000.

- The planner uses `deepseek-v4-pro-0813`, which is billed at double rate from 00:00 to 14:00 UTC. Keep the schedule outside that window; it runs at 16:07 UTC.
- Rules and shared sources lead every prompt, so desks running at the same hour are billed for that shared material at cache rates.
- Vercel's free $5 of Gateway credit every 30 days covers about 100–150 runs. Buying Gateway credits ends that free grant.

The **Federal Records desk** (`federal-records`) files a batch of three to five routine federal NRS records on Tuesdays, Wednesdays and Fridays, continuing the series in its [`REGISTER.md`](agents/federal-records/REGISTER.md). The editor stages accepted records as `worldMundane` NRS entries with no jurisdiction or arc tags, so they stay in the NRS archive and off the front pages, and updates the register. Routine records run in the background: they aren't announced or posted and don't count toward the daily cap. An occasional record may carry a quiet thread toward a possible future storyline; the register tracks them.

Every State and Territory desk also has a **records desk** (`<id>-records`), set by the `records` block on its roster entry. Once a week it files two to four routine entries for that jurisdiction's own record system (the Arvane State Record, the Caldenmere Registry and so on), using the shared [`RECORDS-BRIEF.md`](agents/RECORDS-BRIEF.md) with the desk's own brief and constitution as context. Each jurisdiction may keep a `RECORDS-REGISTER.md`, `RECORDS-NOTES.md` and `RECORDS-ASSIGNMENTS.md` in its folder; the editor creates them as entries publish. Like federal records, these run in the background.

Desks report even when nothing is planned for them: a desk may react to events elsewhere or bring an idea of its own, and the editor banks good material that isn't used right away.

Cadence follows the story: the Federal desk reports regularly, desks with a heated storyline report more often, and quiet desks drop to every few weeks.

## Continuity: registry, coverage and trackers

Three pieces keep the cast and the storylines consistent without the Central Editor checking by hand.

- **Cast registry** (`_data/worldRegistry.json`). People, outlets, avoided names, name-collision groups and the live threads. `npm run check:world-registry` (also part of `world:publish-check`) reads records changed on a branch and flags avoided names, a byline at the wrong outlet, an unregistered byline or outlet (with a note when its first name is one letter from an existing one), a bare surname when both members of a collision group appear, and pronouns that contradict a locked pronoun. Every result is a warning; fix the text, or update the registry if it is out of date. `--all` audits every record and `--evidence` prints pronoun counts for review. Pronoun locks were seeded from the published text and are open to John's correction.
- **Coverage report** (`docs/torenthia/COVERAGE.md`). `npm run world:coverage -- --write` counts the last 20 stories and 40 NRS records by outlet, byline, jurisdiction, arc and thread, how recently each thread's people were named, and flags concentration (over 35% from one outlet or byline) and quiet arcs, jurisdictions and candidates. It is exact, not model-written. The Central Editor regenerates it in any PR that publishes World records, so it is current at merge.
- **Thread trackers.** A tracker desk keeps a living file for one thread and reports weekly. It files kind `report`; the desk editor's triage lists reports from the desks in `triage.passThroughDesks` first, under `tracker`, without a model call, and the Central Editor reads them directly. The Election Tracker desk (`agents/election-tracker/`, Mondays, until 2027-02-28) keeps `ELECTION-TRACKER.md`, checks the candidates for drift, and recommends beats. The Fiscal Equalization Tracker desk (`agents/fiscal-tracker/`, Wednesdays, until 2027-02-28) keeps `FISCAL-TRACKER.md` for the §12.6 review: it records what is published, tracks the ladder from the correction window to a vote as proposals, and never decides an outcome. Add another thread by adding it to the registry's `threads` and, if it needs a file, a tracker desk; the Central Editor folds each report into the tracker file in the notes PR.

## Adding a desk

1. Add an entry to `desks.json` with `"enabled": false`, plus `agents/<id>/BRIEF.md`, `ASSIGNMENTS.md` and `NOTES.md`.
2. Set `"enabled": true`.

Once the runner key is configured, no new key is needed: the scheduled function files for any roster desk with the shared runner key, naming the desk in an `x-newsroom-desk` header. A desk with its own `NEWSROOM_KEY_<ID>` in Vercel uses that key instead (Federal does).

## One-time setup (Vercel dashboard → federatedrepublic → Settings → Environment Variables, Production)

- `CRON_SECRET`: any random string of 32 or more characters. Vercel sends it with each scheduled call, and every other caller is refused.
- `NEWSROOM_KEY_FEDERAL`: the Federal desk's inbox key, which is `KEY_FEDERAL` on the Cloudflare Worker `federated-republic-newsroom`.
- `AI_GATEWAY_API_KEY` is already set for the site and is reused.
- **Runner key (one-time):** deploy `workers/newsroom-inbox/worker.js` to the `federated-republic-newsroom` Worker (Cloudflare → Workers & Pages → Edit code, paste, Deploy), add a `KEY_RUNNER` secret there, and add the same value in Vercel as `NEWSROOM_RUNNER_KEY`. Generate the value with `openssl rand -hex 32 | tr -d '\n'` so there is no trailing newline.

## Asking a desk

John can ask any desk a question through the editor: "What's going on in Korda? Who are the major players?" The editor calls `api/newsroom-ask.js` (`GET /api/newsroom-ask?desk=<id>&q=<question>` on the protected `vercel.app` address, through the Vercel connector), and the desk answers in its own voice from its brief, sources, notes and the shared canon, labeling what is established, approved, proposed and open. It uses the planner model. Nothing is filed or published; useful ideas go to the desk's notes or assignments. Records desks (`<id>-records`) can be asked too.

## Editor relay

`api/newsroom-inbox.js` lets the Central Editor reach the inbox from its cloud workspace, which can't reach workers.dev. It relays `GET ?op=list` and `GET ?op=read&key=…`, plus two editor writes that the Vercel connector can only send as GET: `?op=review&key=…&status=…&note=…` and `?op=purge&key=…&etag=…&manifest=…` (see [Inbox cleanup](#inbox-cleanup)). It forwards each write to the Worker as a POST with only those fields, and attaches the editor key from `NEWSROOM_EDITOR_KEY` (a Sensitive Production variable) itself. It answers only on `*.vercel.app` hosts, which the project's Deployment Protection (Vercel Authentication, all except custom domains) limits to John's Vercel account; the editor reaches them through the Vercel connector. On thefederatedrepublic.org it returns 404. **If Deployment Protection is ever turned off, delete `NEWSROOM_EDITOR_KEY` in Vercel to close the relay.**

## Inbox cleanup

The inbox (R2 bucket bound as `NEWSROOM` on the Worker) keeps every submission until it is cleaned up. Storage is not the concern (a submission is at most about 48 KB); a long list of finished items is. Cleanup never touches anything that is pending, held or unverified, and nothing is deleted without a manifest John has merged.

1. **Dispositions (every editor run).** For each inbox item whose decision is recorded in a desk's `NOTES.md` on `main` but whose inbox status is still `PROPOSED`, the editor sets the status with `op=review` and a note citing the NOTES entry: `ARCHIVED` once published or otherwise finished, `REJECTED` for discards and test items, `HOLD` or `REVISION_REQUESTED` as decided. A staged story stays `PROPOSED` until John merges it. Each change appends a permanent record under `reviews/`.
2. **Manifest (Mondays).** The editor lists candidates: status `ARCHIVED` or `REJECTED`, set at least 30 days ago (test items: any age), with the decision on `main`. It writes them to `docs/torenthia/agents/inbox-cleanup/<date>.json` (id, key, desk, title, status, status time, NOTES path, etag) in that day's editorial PR, or a small draft PR of its own. Nothing is deleted at this step.
3. **Removal (after John merges).** On its next run the editor calls `op=purge` for each manifest entry, passing the entry's etag and the merge commit that brought the manifest to `main`. The Worker rechecks every condition: editor key, unchanged object (etag), status still `ARCHIVED` or `REJECTED`, 30 days elapsed unless the title begins with TEST. It then writes a tombstone to `purged/<id>.json`, deletes the submission and its current status, and keeps `reviews/`. A refusal leaves the item in place; "not found" means it is already gone. The editor records the results in `docs/torenthia/agents/inbox-cleanup/LEDGER.md` in its next PR.

`op=purge` needs the Worker version in `workers/newsroom-inbox/worker.js` from November 17, 2026 or later; until John pastes it into the Cloudflare dashboard, the Worker answers 404 and nothing is removed. `op=review` works with the deployed Worker as soon as the relay change is live.

## Run log

Each run logs the desks, their outcomes and their token usage in the Vercel function logs for `/api/newsroom-run`.
