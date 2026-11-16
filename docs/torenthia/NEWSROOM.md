# Torenthia newsroom — how it runs

Each desk speaks for one jurisdiction or institution. Desks propose; the Central Editor reviews; John decides what becomes canon.

## The flow

1. **Every day at about 16:07 UTC**, the Vercel schedule `newsroom-daily` calls `api/newsroom-run.js` on the website project. Vercel Schedules may start a run up to 15 minutes late on the Hobby plan, and in rare cases runs it twice. A duplicate costs a few cents and the editor discards the extra draft.
2. The function reads [`agents/desks.json`](agents/desks.json) from GitHub `main` and runs each enabled desk scheduled for that weekday.
3. For each desk, **DeepSeek V4 Pro (August 2026 release) plans** one item using the story status, the story bible, and the desk's brief, assignments and notes. **DeepSeek V4 Flash writes** it with the full Constitution added. Either step can decide nothing is worth writing.
4. The draft goes to the existing Cloudflare inbox as `PROPOSED`, under that desk's name.
5. The Central Editor reviews the inbox, updates each desk's `NOTES.md` and `ASSIGNMENTS.md`, and stages accepted items as a normal draft PR. John merges.

Each run reads every file at one `main` commit, recorded as `commit:<sha>` in the submission's `sourceRefs`. Before any model call, each desk confirms its inbox key works and that it hasn't filed within the last six hours, so a duplicate delivery costs nothing. A run with any failed desk returns an error, so it shows in the schedule's history and error rate. Vercel doesn't retry failed runs.

Nothing runs on anyone's computer. Nothing an agent writes reaches GitHub or the website without the editor and John.

## Controls

| To do this | Change this on GitHub `main` |
| --- | --- |
| Pause every desk | `"paused": true` in `desks.json`, or disable `newsroom-daily` under Vercel → Schedules |
| Run now | Vercel → Schedules → `newsroom-daily` → Run Schedule (only desks due that weekday run) |
| Pause one desk | that desk's `"enabled": false` |
| Change how often a desk runs | its `"days"` (weekdays), plus `"everyWeeks": 2` or `3` to run only every second or third week; `"weekOffset"` staggers desks on the same interval |
| Give a desk work | add a line under **Open** in its `ASSIGNMENTS.md` |
| Change models | `defaultModel`, `planner.model`, or a desk's own `model` |

Each change takes effect at the next run, with no redeploy needed.

## Cost

Each desk run costs about 3–5 cents at November 2026 Gateway prices. The planner reads about 24,000 tokens and the writer about 67,000.

- The planner uses `deepseek-v4-pro-0813`, which is billed at double rate from 00:00 to 14:00 UTC. Keep the schedule outside that window; it runs at 16:07 UTC.
- Rules and shared sources lead every prompt, so desks running at the same hour are billed for that shared material at cache rates.
- Vercel's free $5 of Gateway credit every 30 days covers about 100–150 runs. Buying Gateway credits ends that free grant.

Cadence follows the story: the Federal desk reports regularly, desks with a heated storyline report more often, and quiet desks drop to every few weeks.

## Adding a desk

1. Add an entry to `desks.json` with `"enabled": false`, plus `agents/<id>/BRIEF.md`, `ASSIGNMENTS.md` and `NOTES.md`.
2. Set `"enabled": true`.

Once the runner key is configured, no new key is needed: the scheduled function files for any roster desk with the shared runner key, naming the desk in an `x-newsroom-desk` header. A desk with its own `NEWSROOM_KEY_<ID>` in Vercel uses that key instead (Federal does).

## One-time setup (Vercel dashboard → federatedrepublic → Settings → Environment Variables, Production)

- `CRON_SECRET`: any random string of 32 or more characters. Vercel sends it with each scheduled call, and every other caller is refused.
- `NEWSROOM_KEY_FEDERAL`: the Federal desk's inbox key, which is `KEY_FEDERAL` on the Cloudflare Worker `federated-republic-newsroom`.
- `AI_GATEWAY_API_KEY` is already set for the site and is reused.
- **Runner key (one-time):** deploy `workers/newsroom-inbox/worker.js` to the `federated-republic-newsroom` Worker (Cloudflare → Workers & Pages → Edit code, paste, Deploy), add a `KEY_RUNNER` secret there, and add the same value in Vercel as `NEWSROOM_RUNNER_KEY`. Generate the value with `openssl rand -hex 32 | tr -d '\n'` so there is no trailing newline.

## Run log

Each run logs the desks, their outcomes and their token usage in the Vercel function logs for `/api/newsroom-run`.
