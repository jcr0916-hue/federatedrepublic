# PR319 disposable acceptance — precise private Mac handoff

**INCOMPLETE / production NO-GO.** Only the new isolated disposable resources below are in scope. Preserve production, older Apps and working grants, existing AWS profiles, canon, chronology, main and all active branches.

## Current state — 2026-11-10 credential recovery

The user completed the new GitHub OAuth App and bucket-scoped Object Read-only S3 credential in the dashboards and privately installed their bindings. Management readback confirms the GitHub ID/secret bindings on **newsroom-current-issuer-20261109**, the S3 key-pair bindings on **newsroom-current-resource-20261109**, the exact synthetic bucket **newsroom-current-e2e-20261109**, and no misplaced S3 bindings on the issuer or native R2 binding on the resource. Secret presence does not independently prove secret values or effective S3 policy; real authenticated checks remain pending. Do not recreate the App or S3 credential.

The Mac worktree at `~/Documents/GitHub/federatedrepublic-pr319-acceptance` is detached at `b760fe62a6cecd014a1c71a37693080252c0e9f9`. Its receiver was present but `.private/current-credentials.json` was absent. The **original** mode-0600 client/validator file was recovered from the exact original task checkout and copied directly to that Mac worktree without chat disclosure. Its seven-field schema and fixed disposable identifiers were checked; the destination is byte-identical, mode 0600, inside mode 0700 `.private/`. Neither checkout has an unresolved grant marker. `/.private/` is now excluded by the repository's `.gitignore`, including in the Mac worktree; the earlier task-only Git exclusion did not travel with a new checkout.

No credentials were invented or rotated. This file contains only the confidential newsroom test client and validator credentials plus their fixed environment identifiers; the new GitHub App secret and S3 key pair stay on their respective Workers. Cloudflare does not return deployed secret values, including the issuer's secret-text hash bindings. Recovery relies on the retained original's provenance and exact private copy, **not** a new claim of runtime authentication or deployed-secret readback.

The recovery receipt `release/current-mac-setup-20261110.json` records the original disabled endpoints and both module hashes from frozen #318 `d7c65bea969be9bebe541a7bb1e069928e12c60c`. It remains evidence for that configuration. Before opening a new browser window, check the current disposable deployment recorded in the PR319 description.

## Local start-page fix after the first browser attempts

The first attempt found no listener on port 18765. After a receiver was started, the next attempt received local HTTP 400; there was still no replay report or pending-grant marker. All three temporarily opened disposable endpoints were closed immediately and closure read back after each reported error. A requested 12-minute pause then elapsed with ingress closed.

The old receiver consumed its only start on `GET /start`. With fake credentials and no cloud requests, a simulated preview GET returned 302 and the next GET returned 400. This reproduces a possible cause, **not proof of what the user's browser sent**. The revised receiver serves a repeatable local page and begins only after a same-origin, nonce-protected POST from its **Begin authorization** button. Start remains one-use; foreign/duplicate/malformed requests fail closed; Host validation, the fixed issuer/resource/redirect, state, PKCE, callback claim and 600-second lifetime remain intact. Errors now distinguish an expired receiver, wrong local address and already-started authorization. No deployed issuer/resource module or cloud credential changed.

The new loopback-only `acceptance/current-mac-receiver-check.py` passes **28 checks** with synthetic credentials, and CI now runs it without cloud credentials. The isolated Mac script was replaced directly only after these checks passed and the old listener had stopped; the detached worktree remains at its original commit with the receiver and ignore-rule changes locally. Nonsecret attempt/fix receipt: `release/current-receiver-start-fix-20261110.json`. Neither real browser exercise has succeeded.

## Browser Origin correction on resumption

The subsequent real-browser 403 was reproduced in the Codex in-app browser using only synthetic credentials and a loopback mock issuer. The start page's `Referrer-Policy: no-referrer` caused HTML form navigation to send `Origin: null`, which the strict receiver correctly rejected with 403. This is defined by the [Fetch Origin-header algorithm](https://fetch.spec.whatwg.org/#append-a-request-origin-header). The earlier manually supplied HTTP headers did not reproduce browser form behavior; the 28 synthetic checks were not proof of this path.

Changed only the local start page to `Referrer-Policy: same-origin`. The outgoing 303 issuer redirect and callback still use `no-referrer`; exact Host/Origin checks, private nonce, one-use start and state/PKCE remain enforced. **Null/missing/foreign origins remain rejected.** A second real browser click now produced matching local Origin and 303, reached the loopback mock issuer and sent no cross-origin Referer. Both temporary synthetic fixtures were stopped. No real credential, cloud request or OAuth grant was used in these browser tests.

Expanded local regression checks to **30**, all passing. The corrected receiver was copied byte-identically to the Mac worktree while its listener was stopped and no pending marker existed; credentials are unchanged. All disposable ingress stayed closed. Current-head CI must be read separately from prior 28-check evidence. Nonsecret proof: `release/current-receiver-origin-fix-20261110.json`. Start a fresh receiver before the next real attempt and verify the local page before coordinating a new active consent window. This corrects the local 403; it is not successful real GitHub/Turnstile/S3 acceptance.

## Issuer browser check

The issuer form had the same header conflict as the Mac start form. Its `no-referrer` policy caused form navigation to send `Origin: null`, which the exact-origin check rejected before Turnstile validation. The PR319 issuer page now uses `same-origin` so the browser can send the required Origin while keeping referrers on the issuer. The GitHub redirect uses `no-referrer`. The focused synthetic test checks the page policy, null and foreign Origin rejection, successful redirect to GitHub, and one-use challenge proof. [Fetch Origin-header rules](https://fetch.spec.whatwg.org/#append-a-request-origin-header)

This change revises the issuer used for PR319 acceptance. The original #318 issuer hash is `ba87e19507ca90cd2069d46309a02c2325863cc9f7727be61d860ddc2a30a7ac`. The corrected issuer build hash is `1429bba9bc89433b6aa070bcef3251d03722dd696c482b47dbb9f792fc72b47b`. The resource build hash is `59733af158fe5b8aed45ac9043e17630c89898f250b205debd06dc76dfaef6e9`. Use the deployment readback and CI links on [PR319](https://github.com/jcr0916-hue/federatedrepublic/pull/319).

## Live replay and pending grant cleanup

The corrected GitHub Client ID and the user-supplied matching secret were deployed on the disposable issuer as version `5d8c88bf-5538-4e3b-a981-dafff64bba57`. The live browser run completed Turnstile, GitHub approval, newsroom consent, code exchange, S3 list and exact synthetic read, write-tool denial, refresh rotation and replay rejection. The old and successor access checks and the successor refresh denial passed. The last cleanup check failed because the receiver tried to parse the issuer’s successful empty revocation response as JSON. The original report preserves the 11 passing checks and the cleanup failure. Its source field records the frozen base. The live issuer used PR319’s corrected module and the credential version above. [Replay report](release/current-mac-replay-20261111T044228Z.json)

The revised receiver accepts an empty HTTP 200 at the revoke endpoint. It requires a Boolean introspection result and retains the private pending marker when cleanup cannot confirm inactivity. A refresh probe that unexpectedly succeeds records the returned pair in the same protected marker. The 34 local checks include empty revocation responses and both pending-marker outcomes.

For a pending grant with recorded pairs, use `python3 workers/newsroom/acceptance/current-mac-receiver.py --exercise cleanup` during the next coordinated window with only the disposable issuer open. This rechecks the recorded pairs and clears the marker after revocation, inactive access and refresh denial all succeed. A failed check leaves the marker available for containment. Once cleanup passes, start `--exercise revoke` for a fresh browser consent and voluntary revocation. Open resource and client for that browser run, then close the three endpoints at completion, error or expiry.

## Exact next Mac step — one command, services closed

At the existing `federatedrepublic-pr319-acceptance` Terminal prompt, run only:

```sh
python3 workers/newsroom/acceptance/current-mac-receiver.py --exercise replay
```

Keep Terminal running and report only its startup message or error. The listener expires after ten minutes; no credential file content, callback URL, code, cookie or token may be shared. If the command reports a pending grant, stop and contain only that disposable grant before another attempt.

## Browser session — prepare locally, then coordinate ingress

In the Mac browser where GitHub sign-in will happen, manually type `http://127.0.0.1:18765/start` into the address bar. This must display **Begin authorization**. Opening or previewing that page does not contact the issuer or consume the start. Leave the button unclicked while Work confirms an active human consent window and enables only issuer/resource/client, with previews and runner still disabled.

Once that window is open, click **Begin authorization** once. On **Continue to newsroom sign-in**, wait for the Cloudflare box above **Continue** to finish. Select **Verify you are human** if a checkbox appears, then click **Continue**. Complete GitHub approval and newsroom consent, then click **Finish authorization on this Mac** at the HTTPS relay. If the start page reports 409, use the authorization tab where the flow began. If that flow is lost, close ingress and inspect pending-grant status before restarting the receiver. A new listener starts a fresh state/PKCE and consent attempt.

A second separately coordinated fresh invocation with `--exercise revoke` checks voluntary revocation. Use only this task's mode-0600 private file, not old home-directory lifecycle credentials or tokens.

The receiver checks issuer/state/PKCE, code exchange, validator introspection, synthetic S3 list/exact noncanonical read, write-tool denial, refresh rotation, spent-refresh replay and family invalidation. It writes only booleans/status categories to `workers/newsroom/release/`. **The browser attempts have produced no successful lifecycle result.** The earlier 16 hosted HTTP preflight checks and real dummy-token rejection are negative checks; they are not positive GitHub/Turnstile/S3 lifecycle proof.

An unresolved `.private/current-grant-pending.json` blocks retries. Keep ingress closed and inspect/invalidate only the new isolated client's guard; never delete an uncertainty marker merely to retry. Known raw tokens remain only in that mode-0600 file until cleanup is verified. Successful known-grant revocation removes it after access and refresh are confirmed inactive. Close issuer/resource/client workers.dev and preview ingress immediately at session end or timeout, confirm all schedules empty and runner bindings absent, and revoke/expire only newly created test credentials once no further authorized test needs them.

## If the original private file is unavailable in a later environment

Hashes cannot recreate raw secrets. Do not invent a replacement Mac file or reuse older credentials. With ingress closed and unresolved grants contained, prepare a disposable-only synchronization: generate new independent client/validator secrets privately, replace **only** issuer `ISSUER_CLIENT_SECRET_SHA256` and `ISSUER_RESOURCE_SECRET_SHA256` with their SHA-256 hashes, replace **only** resource `RESOURCE_VALIDATOR_SECRET` with the new raw validator secret, and install the matching mode-0600 Mac file inside mode 0700 `.private/`. Keep the fixed identifiers, source, bindings and ingress settings intact; verify all three destinations before allowing a later consent window. Secret updates deploy new disposable versions, so snapshot/read back their code, environment and disabled ingress, and do not treat rollback of only one destination as synchronization. Do not rotate the GitHub App, S3 pair, admission/session keys or any production/legacy credential for this recovery. This fallback was **not needed or executed** on November 10.

## Preserved limits

Positive Turnstile one-use/replay, real S3 Put/Delete/cross-bucket denial, expiry, credential rotation/regional recovery, delivered alerts/privacy export and independent approval remain open gates. The Cloudflare connection still lacks account-token creation permission; completed dashboard setup resolves the earlier provisioning blocker without expanding that permission. Analytics Engine remains unavailable and was not enabled account-wide.

No merge, production deployment, production credential change, old grant/App revocation, canonical publication, chronology change or branch deletion is authorized. Main, all #304–#318 active heads/bases and independent editorial #316 remain retained. Use only the exact task checkout/private paths; no OneDrive, Apple Music or broad personal-folder search is necessary.
