# Branch history — newsroom/v1-scheduled-desks

**Original branch:** `newsroom/v1-scheduled-desks`
**PR:** [#332](https://github.com/jcr0916-hue/federatedrepublic/pull/332)
**Status:** proposed (shipped only once the PR merges)

## Purpose
First working version of the agent newsroom: a daily Vercel Cron function plans with DeepSeek V4 Pro, writes with DeepSeek V4 Flash, and files one proposal per due desk in the existing Cloudflare inbox.

## Changes
- `api/newsroom-run.js`, `api/_newsroom-core.js`; `vercel.json` build, route and daily cron.
- `docs/torenthia/agents/desks.json`, `NEWSROOM-RULES.md`, and the `federal/` brief, assignments and notes.
- `docs/torenthia/NEWSROOM.md` operating guide; `scripts/newsroom-run.test.mjs`.

## Verification
- 8 offline tests pass; `npm run build` and `npm run world:publish-check` pass.
- A dry run against the real files measured planner and writer prompts at about 87,000 and 240,000 characters, for an estimated 5 cents per run.

## Decisions
- John asked for the simplest functional setup with no dependence on his computer. Version 1 relies on the free Gateway credit cap and the editor's review, and drops the durable job claims and signed grants designed in #323–#331.
- The planner gets the story summary only; the writer also gets the full Constitution.
- Raw drafts stay in R2; GitHub receives only accepted work through normal PRs.

## Open follow-ups
- Central Editor access to the inbox: the editor's cloud workspace can't reach `workers.dev`.
- An inbox Worker change to accept desks beyond Federal, Korda, Varek and Corindal.
- Close or retire #300–#331 and the experimental Workers once v1 is running.

## Preservation and branch disposition
- Results live on `main` once merged.
- **Deletion approval:** not granted by this note.
