# PR319 disposable acceptance — precise private Mac handoff

**INCOMPLETE / production NO-GO.** Only the new isolated disposable resources below are in scope. Preserve production, older Apps and working grants, existing AWS profiles, canon, chronology, main and all active branches.

## Current state — 2026-11-10 credential recovery

The user completed the new GitHub OAuth App and bucket-scoped Object Read-only S3 credential in the dashboards and privately installed their bindings. Management readback confirms the GitHub ID/secret bindings on **newsroom-current-issuer-20261109**, the S3 key-pair bindings on **newsroom-current-resource-20261109**, the exact synthetic bucket **newsroom-current-e2e-20261109**, and no misplaced S3 bindings on the issuer or native R2 binding on the resource. Secret presence does not independently prove secret values or effective S3 policy; real authenticated checks remain pending. Do not recreate the App or S3 credential.

The Mac worktree at `~/Documents/GitHub/federatedrepublic-pr319-acceptance` is detached at `b760fe62a6cecd014a1c71a37693080252c0e9f9`. Its receiver was present but `.private/current-credentials.json` was absent. The **original** mode-0600 client/validator file was recovered from the exact original task checkout and copied directly to that Mac worktree without chat disclosure. Its seven-field schema and fixed disposable identifiers were checked; the destination is byte-identical, mode 0600, inside mode 0700 `.private/`. Neither checkout has an unresolved grant marker. `/.private/` is now excluded by the repository's `.gitignore`, including in the Mac worktree; the earlier task-only Git exclusion did not travel with a new checkout.

No credentials were invented or rotated. This file contains only the confidential newsroom test client and validator credentials plus their fixed environment identifiers; the new GitHub App secret and S3 key pair stay on their respective Workers. Cloudflare does not return deployed secret values, including the issuer's secret-text hash bindings. Recovery relies on the retained original's provenance and exact private copy, **not** a new claim of runtime authentication or deployed-secret readback.

All four `newsroom-current-{issuer,resource,client,runner}-20261109` workers.dev **and preview** endpoints remain disabled; every schedule is empty; the deny-only runner has zero bindings. No browser test is active. Both deployed module hashes still match frozen #318 `d7c65bea969be9bebe541a7bb1e069928e12c60c`: issuer `ba87e19507ca90cd2069d46309a02c2325863cc9f7727be61d860ddc2a30a7ac`, resource `59733af158fe5b8aed45ac9043e17630c89898f250b205debd06dc76dfaef6e9`. Nonsecret recovery receipt: `release/current-mac-setup-20261110.json`.

## Exact next Mac step — one command

At the existing `federatedrepublic-pr319-acceptance` Terminal prompt, run only:

```sh
ls -ld .private .private/current-credentials.json
```

Expect `drwx------` for the directory and `-rw-------` for the file. Only that permissions listing may be shared. Do not display, paste, attach or commit the file's contents. Do not start the receiver or open the issuer yet. After the listing is confirmed, coordinate an **active human consent window** before Work enables only issuer/resource/client with previews off; leave runner disabled. A missing file, unexpected permission or `.private/current-grant-pending.json` means stop this sequence and inspect only the exact task-private paths.

## Browser session — only after the active window is agreed

From the isolated Mac worktree, run one fresh consent exercise:

```sh
python3 workers/newsroom/acceptance/current-mac-receiver.py --exercise replay
```

Open the printed `http://127.0.0.1:18765/start` in one top-level browser tab. Complete real Turnstile, GitHub approval and newsroom consent promptly, then click **Finish authorization on this Mac** at the HTTPS relay. Never copy callback URLs, authorization codes, cookies or token files into chat. The receiver uses only this task's mode-0600 file, not old home-directory lifecycle credentials or tokens. A second separately coordinated fresh invocation with `--exercise revoke` checks voluntary revocation.

The receiver checks issuer/state/PKCE, code exchange, validator introspection, synthetic S3 list/exact noncanonical read, write-tool denial, refresh rotation, spent-refresh replay and family invalidation. It writes only booleans/status categories to `workers/newsroom/release/`. **Neither browser exercise has been executed.** The earlier 16 hosted HTTP preflight checks and real dummy-token rejection are negative checks; they are not positive GitHub/Turnstile/S3 lifecycle proof.

An unresolved `.private/current-grant-pending.json` blocks retries. Keep ingress closed and inspect/invalidate only the new isolated client's guard; never delete an uncertainty marker merely to retry. Known raw tokens remain only in that mode-0600 file until cleanup is verified. Successful known-grant revocation removes it after access and refresh are confirmed inactive. Close issuer/resource/client workers.dev and preview ingress immediately at session end or timeout, confirm all schedules empty and runner bindings absent, and revoke/expire only newly created test credentials once no further authorized test needs them.

## If the original private file is unavailable in a later environment

Hashes cannot recreate raw secrets. Do not invent a replacement Mac file or reuse older credentials. With ingress closed and unresolved grants contained, prepare a disposable-only synchronization: generate new independent client/validator secrets privately, replace **only** issuer `ISSUER_CLIENT_SECRET_SHA256` and `ISSUER_RESOURCE_SECRET_SHA256` with their SHA-256 hashes, replace **only** resource `RESOURCE_VALIDATOR_SECRET` with the new raw validator secret, and install the matching mode-0600 Mac file inside mode 0700 `.private/`. Keep the fixed identifiers, source, bindings and ingress settings intact; verify all three destinations before allowing a later consent window. Secret updates deploy new disposable versions, so snapshot/read back their code, environment and disabled ingress, and do not treat rollback of only one destination as synchronization. Do not rotate the GitHub App, S3 pair, admission/session keys or any production/legacy credential for this recovery. This fallback was **not needed or executed** on November 10.

## Preserved limits

Positive Turnstile one-use/replay, real S3 Put/Delete/cross-bucket denial, expiry, credential rotation/regional recovery, delivered alerts/privacy export and independent approval remain open gates. The Cloudflare connection still lacks account-token creation permission; completed dashboard setup resolves the earlier provisioning blocker without expanding that permission. Analytics Engine remains unavailable and was not enabled account-wide.

No merge, production deployment, production credential change, old grant/App revocation, canonical publication, chronology change or branch deletion is authorized. Main, all #304–#318 active heads/bases and independent editorial #316 remain retained. Use only the exact task checkout/private paths; no OneDrive, Apple Music or broad personal-folder search is necessary.
