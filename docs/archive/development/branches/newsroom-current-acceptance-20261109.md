# Current hardened newsroom disposable acceptance — permanent handoff

**Original branch:** `feature/newsroom-current-acceptance-20261109`  
**Parent:** draft [#318](https://github.com/jcr0916-hue/federatedrepublic/pull/318), frozen `d7c65bea969be9bebe541a7bb1e069928e12c60c`.  
**Status:** experimental, unmerged; **INCOMPLETE / NO-GO / NOT APPROVED FOR PRODUCTION**.  
**Continuation PR:** pending creation; link in PR metadata once assigned.

## Purpose and scope

Execute the President's explicit permission for **only new isolated disposable** Turnstile/OAuth/S3 acceptance infrastructure. Read repository AGENTS.md, the #318 handoff and RELEASE-PACKAGE-20261109.md, dependency histories #304–#315/#317 and independent #316 metadata. Preserve every open PR head/base and production. Synced sources remain read-only.

## Changes and artifacts

- Four new closed test Workers: `newsroom-current-{issuer,resource,client,runner}-20261109`; fresh grant/guard SQLite namespaces, distinct ingress namespaces, private random independent client/validator/session/admission credentials. No old grant/namespace/secret was reused or changed.
- Dedicated managed Turnstile sitekey `0x4AAAAAAF6ssiEhk1gj8QlU`, restricted to the new issuer hostname, secret privately bound to issuer. New R2 bucket `newsroom-current-e2e-20261109`, exactly two synthetic noncanonical fixture/status objects, public bucket domain off. **S3 token creation denied; no successful S3 credential provisioning claimed.**
- `workers/newsroom/acceptance/current-http-validation.py`: repeatable nonsecret current-source HTTP preflight. `current-hosted-validation.ts` and build script: explicitly synthetic binding-only scheduled test, deny-all HTTP, redacted KV results, bounded cleanup alarm; no hosted pass is claimed for its timed-out attempt.
- `current-callback-relay.js` and `current-mac-receiver.py`: fixed HTTPS-to-loopback user-click callback, private mode-0600 credentials, exact issuer/state/PKCE, one-use callback claim, real S3 read and refresh/replay/revoke checks, uncertainty lock and verified known-token cleanup. Prepared but not exercised with real browser consent.
- [Precise Mac handoff](../../../../workers/newsroom/CURRENT-CANDIDATE-MAC-20261109.md). Permanent nonsecret management/source evidence: `release/current-infrastructure-20261109.json`, `release/current-http-validation-20261109.json`, `release/current-stack-20261109.json`.
- Existing issuer/resource/prototype/legacy source files are byte-unchanged. CI gains only the separate disposable runner build; no deployment job or cloud credential is added.

## Actual results

- Current #318 exact-head real GitHub OAuth and World publishing runs `42721696737` / `42721696515` re-read successful. The inherited 130 tests/52 synthetic recovery checks remain parent evidence, not new real GitHub/S3/browser acceptance.
- Both newly deployed module bytes were downloaded and independently hashed. Issuer SHA-256 `ba87e19507ca90cd2069d46309a02c2325863cc9f7727be61d860ddc2a30a7ac`; S3 resource `59733af158fe5b8aed45ac9043e17630c89898f250b205debd06dc76dfaef6e9`. Both exactly match builds from frozen #318.
- **16/16 real hosted HTTP checks PASS**, on the current code in the new Workers: issuer/resource discovery, missing/forged bearer, forged callback, foreign provider issuer, malformed authorize, actual widget page, secure host-only admission cookie, CSP, no-store/no-referrer, backend dummy Turnstile rejection, foreign Origin, unauthenticated token/introspect/revoke denial. GitHub had explicit unusable setup sentinels only to reach these preflight paths; no actual GitHub identity or grant was simulated as real evidence. The dummy GitHub secret was removed after tests so missing real App setup fails closed.
- Real Siteverify HTTP 200 confirms **the new secret rejects a dummy token as invalid-input-response**, with no invalid-input-secret. No positive solve or Turnstile replay is asserted.
- Callback relay passes valid-link/header checks plus six malformed/foreign request denials. Typecheck and runner builds pass locally on Node 24.15.0, below supported engines. Supported clean-install continuation CI is pending until the draft is opened; inspect actual exact-head results before integration.
- The management runtime could not call Siteverify directly; a task-local encrypted secret envelope was decrypted in memory for the successful scoped network probe, displaying booleans only. Initial restricted-network HTTP probe failed DNS; approved network-only retry passed all 16. No secrets were printed, committed or put in command arguments.

## Rejected attempts and cleanup

Initial upload with Analytics Engine was rejected by Cloudflare HTTP 403 because the account feature is not enabled. Test bindings omitted it; no account-wide service activation occurred. This does not clear production monitoring requirements. Both account/user S3 token-create attempts were denied (missing account token scope / user endpoint has no OAuth scope), so the resource has no native R2 and no S3 secret pair.

Automatic approval review rejected an every-minute cron proposal as persistent. A safer **single dated invocation** with enforced 210-second window and finally cleanup was accepted, but no result appeared before its deadline. No hosted synthetic lifecycle pass is inferred. The dated schedule was removed; runner code replaced with deny-only and every service/storage/DO/secret binding explicitly removed. Immediate API readback lagged; a later independent read confirmed empty schedules and zero runner bindings. No need to approve recurring cron remains.

All four workers.dev and preview flags are false; all schedules are empty; no custom domain/zone route was added; bucket public access is off. Only closed resource → closed issuer service binding remains. No browser test is currently active. Original production deployment remains `7a53aadb-d87e-46e5-b7b8-831970590373`, version `08a99769-3618-488e-adbd-30a8be38a788` at 100%. Existing working grants/Apps/AWS profiles were untouched.

A file-location search was inadvertently broader than the project and touched protected personal folders. It completed without any file change; the user was told OneDrive/Apple Music access is unnecessary and to deny those prompts. No further broad home-folder search was performed. Future continuation must use only this checkout and the exact task-private files.

## Unresolved and next exact action

Create a **new** GitHub OAuth App with the exact new issuer callback and privately bind its ID/secret; create/bind a new Object Read-only S3 credential scoped only to the new bucket, or explicitly reconnect Cloudflare with the missing token-create scope. The precise narrow dashboard alternative and single Mac receiver command are in the handoff above. Do not ask for any raw secret in chat. Work should verify private binding names and source hashes, then reopen only issuer/resource/client during a coordinated real browser consent window and close them after tests.

No positive current GitHub/browser/Turnstile/S3 grant lifecycle, new-credential read-only policy denial, hosted refresh/replay/revoke on a real grant, rotation/regional rehearsal, delivered alerts/export privacy canary, or independent security/operations approval is established. Keep production NO-GO. No general file access, extra cloud account access or production permission is required to finish the pending private setup.

## Preservation and branch disposition

**Shipped:** nothing to main/production. **Experimental:** new isolated infrastructure/harness and narrow preflight evidence. **Rejected:** persistent cron, account feature activation, existing-grant reuse and production deployment. **Historically preserved:** parent source/stack/handoffs and older operator evidence remain distinct. **Unresolved:** gates above.

Retain this new unfinished branch, every #304–#318 active dependency and independent editorial #316; no branch deletion or merge. Live head/base snapshot is preserved in `current-stack-20261109.json`. Historical differences between a parent's latest documentation tip and a child's frozen base are recorded rather than rewritten. Final cleanup eligibility is not established; later authorized integration must perform AGENTS.md history/protection/automation checks and preserve original tips. No cleanup attestation or independent sign-off is implied by this implementer-led work.
