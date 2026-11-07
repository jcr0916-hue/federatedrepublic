# Isolated issuer/resource test and rollback plan — prepared, not executed

## Access and isolation checkpoint

On 2026-11-07 the Cloudflare connector successfully authenticated and listed one account, `5fa1569f8ddb79c8fcf2138a2ae3f090`. Its Worker inventory contained `federated-republic-newsroom` and `newsroom-oauth-isolated-test`. Neither was modified. No Worker settings, secret values, OAuth grant contents or production bucket data were read. GitHub connector access to draft #305 was verified and used for source/CI only.

The user authorized unattended tool work, including connected resources, while reserving anything requiring their physical interaction. That authorization removes routine branch-work approval stops; it is not evidence that technical release gates have passed. The concrete browser wall is a self-signed loopback TLS warning: Computer Use requires a human to handle that warning. No browser consent/cookie/CSP success is claimed.

## Required independent resources

Use new, uniquely named candidate issuer and resource Workers, new SQLite namespaces for `IssuerGrant` and `IssuerGuard`, a new synthetic R2 bucket and independently generated high-entropy client/resource secrets. Proposed names are `newsroom-strict-issuer-candidate`, `newsroom-strict-resource-candidate` and `newsroom-strict-synthetic`; these names are reservations in this document only, not created resources. Check for collisions before any provisioning and never overwrite an existing resource.

Create a separate GitHub sign-in app with an exact issuer `/oauth/callback` and no requested scopes. Do not copy/reuse the working ChatGPT connection's app, client registration, callback identifier, tokens or grants. A new real sign-in app has not been registered or configured here; the available GitHub repository tools do not expose that registration operation. Real GitHub/ChatGPT consent and connection setup remain interactive work unless a suitable authenticated tool flow is available later.

Do not deploy `prototype/*fixture.ts`, `test/*`, or `scripts/browser-candidate-harness.ts`. Those contain known synthetic identities or harness routes. Only independently reviewed candidate bundles are potential deployment inputs, and their explicit binding contract is in [ISSUER-CANDIDATE.md](ISSUER-CANDIDATE.md). The repository's existing `cloudflare.config.ts` deliberately remains empty and is not a deployment target.

## Execution sequence after the human and security gates

1. Run supported-Node clean-install CI and retain exact tested source SHA plus the two separate candidate bundle digests. Complete independent security review, including the shared-budget availability tradeoff and callback/refresh loss policy.
2. Verify target account/Worker names and create only the new isolated namespaces/bucket. Configure issuer, exact audience and registered callback consistently. Store new secrets through connector/secret mechanisms without printing values or placing them in source, logs, URLs or this archive. Bind the resource to the candidate issuer using a service binding and independent introspection credentials.
3. Configure query-string redaction and safe structured outcome metrics before a hosted authorization callback is exercised. Never log request bodies, Authorization, Cookie, code/state/verifier, upstream token or secret values. Restrict access to the isolated evaluation as appropriate; do not mistake an unfamiliar test hostname for access control.
4. Confirm anonymous resource access produces a challenge and correct protected-resource metadata; validate issuer metadata, registered-client method selection and `iss` checks. Complete a new editor sign-in and explicit read-only consent. Verify the exact client callback/resource and both PKCE legs, including cancellation.
5. Seed only synthetic R2 records. Confirm list/read succeed, submit/review/publish are denied, and no writes occur. Refresh from simultaneous independent regional callers: exactly one succeeds; old tokens fail. Revoke the current grant and verify the next resource request fails without a cached active decision.
6. Test timeouts, upstream redirects/error responses, stale browser state, lost code/refresh responses, expired-state cleanup and shared-budget exhaustion. Reauthorization must use a fresh grant. Treat hosted behavior as unverified until actual results and regions are recorded.

## Rollback and teardown

Keep production and the existing test connection outside this rollout. Rollback means disconnecting the new candidate resource/issuer evaluation and invalidating **only its** new credentials/grants; do not migrate or revoke existing grants. Returning a Worker to an older code version does not roll back Durable Object/R2 state. Preserve non-secret evidence before any teardown; follow review and resource ownership requirements before permanently deleting a bucket or namespace.

Retain draft #305 and its parent branch until the accepted completion/merge and AGENTS.md preservation/disposition checks are finished. No merge is implied by a successful isolated test. Record exact deployment IDs, namespace ownership, observed results, exceptions and eventual teardown in the permanent handoff; do not invent unavailable results.
