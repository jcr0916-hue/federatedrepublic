# Current PR318 disposable acceptance — precise private Mac handoff

**INCOMPLETE / production NO-GO.** Everything below targets newly created disposable resources. Do not reuse, edit or revoke the older lifecycle App, existing AWS profiles, working ChatGPT grants or production.

## Completed centrally

Frozen source `d7c65bea969be9bebe541a7bb1e069928e12c60c`, unchanged issuer/S3 resource modules, fresh separate SQLite grants/guard, rate namespaces `43180901` / `43180902`, independent client/validator/session/admission credentials, new widget and a new synthetic-only bucket. Secret values were never displayed. Deployed-module hashes were read back and exactly matched the local builds. All 16 real hosted HTTP checks passed; the widget secret independently passed real Siteverify dummy-token rejection. These are negative/preflight checks, not real GitHub consent or successful S3 access.

All four `newsroom-current-*-20261109` workers.dev/preview endpoints are currently **off** and all schedules empty. The runner is deny-only with zero bindings. No test is awaiting an open endpoint. Coordinate a new active browser window before reopening only issuer/resource/client; leave the runner closed.

## Why private setup remains necessary

The connected Cloudflare OAuth session rejects `POST /accounts/.../tokens` with HTTP 403 because it lacks `account-api-tokens.write`; the user-token endpoint does not accept OAuth sessions. No new S3 credential was created. The GitHub connector cannot create an OAuth App or obtain its private secret. A new dedicated App/secret has not been supplied. The old App and its working grants were deliberately preserved.

The narrow path is to create the bucket-scoped credential and new OAuth App in their dashboards and bind their values directly to the new Workers. This does not require OneDrive, Apple Music, broad personal-file access, or secret disclosure in chat. Alternatively an explicitly reconnected Cloudflare session with Account API Tokens Write would allow central creation of the scoped S3 credential; no such scope expansion is assumed or requested automatically.

## Minimum private setup

1. At [GitHub new OAuth App](https://github.com/settings/applications/new), create **Torenthia Newsroom PR318 Disposable Test**, with homepage `https://newsroom-current-issuer-20261109.jcr0916.workers.dev` and exact authorization callback `https://newsroom-current-issuer-20261109.jcr0916.workers.dev/oauth/callback`. Create a new secret for that App. Do not edit an existing App. The current source requests no repository scope and accepts only configured numeric Editor `279336870`.
2. In [Cloudflare Workers](https://dash.cloudflare.com/5fa1569f8ddb79c8fcf2138a2ae3f090/workers-and-pages), select **newsroom-current-issuer-20261109**, then its Variables and Secrets. Replace only `ISSUER_GITHUB_CLIENT_ID` with the new App's public Client ID; add `ISSUER_GITHUB_CLIENT_SECRET` as a secret. Do not change cookies, PKCE, Turnstile, other bindings, ingress or existing Workers. The temporary unusable GitHub secret sentinel used for HTTP-only preflight was removed at cleanup; GitHub remains unconfigured until these two fields are installed.
3. In [R2](https://dash.cloudflare.com/5fa1569f8ddb79c8fcf2138a2ae3f090/r2/overview), create a **new Object Read only** S3 API credential restricted to **only `newsroom-current-e2e-20261109`**. Use a short expiry if supported; record the expiry or plan to revoke only this new token after the test. Add its Access Key ID as secret `R2_READ_ACCESS_KEY_ID` and Secret Access Key as secret `R2_READ_SECRET_ACCESS_KEY` on **newsroom-current-resource-20261109**. Never attach native R2, desk keys or other buckets to this resource. Do not reuse a saved working AWS credential. Actual Put/Delete/cross-bucket-denial proof is still required; configuration alone is not proof.
4. Report only **“new App and four private bindings ready”**, never the values. Work should verify binding names, current source hashes and fixture scope, arrange the active browser window, then enable only the three named disposable endpoints with previews off. No additional general access is needed for the browser consent itself.

## One Mac command per fresh consent

From this task checkout run:

```sh
python3 workers/newsroom/acceptance/current-mac-receiver.py --exercise replay
```

Open the printed `http://127.0.0.1:18765/start` address in one top-level browser tab. Complete the real Turnstile check, GitHub approval and newsroom consent promptly; then click **Finish authorization on this Mac** at the HTTPS callback relay. Do not copy callback URLs, authorization codes, browser cookies or token files into chat. The receiver requires the task's mode-0600 `.private/current-credentials.json`; it does not use the older home-directory lifecycle credentials or tokens.

The receiver automatically validates issuer/state/PKCE, exchanges the code, checks validator introspection, real synthetic S3 list/exact noncanonical read, write-tool denial, refresh rotation, spent-refresh replay and family invalidation. It saves a result containing only booleans/status categories under `workers/newsroom/release/`. A second fresh invocation with `--exercise revoke` checks voluntary revocation. Actual execution of either command is **not yet established**.

An unresolved `.private/current-grant-pending.json` blocks a fresh retry. Keep ingress closed and ask Work to inspect/invalidate only the new isolated client's guard; do not delete an uncertainty marker merely to retry. The receiver retains raw known tokens only in that mode-0600 private file when cleanup is unresolved. Do not send that file to chat or commit it. Completed known-grant revocation removes it after access and refresh are verified inactive.

Positive Turnstile one-use/replay, real S3 policy denial, expiry, new-client credential rotation, regional recovery, alert delivery/privacy export and independent approval remain separate checks. No old hosted results should be relabeled as current-candidate success. At the end of each coordinated session, Work must disable issuer/resource/client workers.dev and preview URLs, verify all schedules empty and runner bindings absent, and revoke/expire only newly created test credentials when no further authorized test needs them.

## Preserved boundaries

No main merge, production deploy, production credential change, existing grant revocation, branch deletion, canonical publication or chronology change is authorized. Main, all #304–#318 branch heads/bases, and independent editorial #316 are retained. Analytics Engine was unavailable; it was not enabled account-wide, and no alert delivery or ingestion proof is claimed.
