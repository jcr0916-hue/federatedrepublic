# Branch history — fix/newsroom-github-iss-20261107

**Original branch:** `fix/newsroom-github-iss-20261107`  
**PR:** [#306](https://github.com/jcr0916-hue/federatedrepublic/pull/306)  
**Frozen parent:** PR #305, `4fda7e342b70f3ea59b151d89a7e8976572d7f39`  
**Status:** experimental; candidate-only deployment and local-client acceptance passed; evaluation closed; not merged or production deployed

## Purpose and scope

The first real GitHub return included an `iss` field. The candidate's strict query allowlist rejected it with `invalid_callback` before identity exchange. No live authorization code or state value is retained here. The frozen parent checkout and PR #305 are preserved; this child branch contains only the necessary issuer parser change, regression coverage and this note.

## Change and security policy

- `workers/newsroom/src/issuer-candidate.ts` accepts the optional upstream issuer only when its decoded string is exactly `https://github.com/login/oauth`, for success and denial callbacks. Duplicate, empty, mismatched and other unknown parameters remain invalid before state consumption or provider I/O.
- Legacy responses without `iss` remain accepted for this one statically configured GitHub provider. No metadata discovery, request-selected endpoint, configurable provider or broader trust is introduced. The expected identifier is pinned from the observed dedicated-provider response, not used to choose an endpoint. No authoritative GitHub issuer metadata was established; the attempted root metadata URL returned 404. [RFC 9207 section 2.4](https://www.rfc-editor.org/rfc/rfc9207.html#section-2.4) permits local policy for absent identifiers and requires exact validation of supplied identifiers.
- `workers/newsroom/test/issuer-candidate.test.ts` covers accepted issuer/consent, mismatches and duplicates with no provider call or state consumption, one-use replay refusal, and denial with no code issuance. The downstream response keeps the candidate's own issuer identifier.
- Cookie/state/CSRF, both PKCE legs, immutable editor identity, read scope, fixed endpoints, credential handling and redaction are preserved.

## Results

The three new targeted regressions reproduced the original defect: **0 passed / 3 failed**, all at the expected valid-callback acceptance checks. They then passed with the narrow fix. The complete local typecheck, **76 tests / 0 failures**, and four release/fixture/issuer/resource builds passed. Local Node 24.15.0 is below the supported engine range, so supported-Node CI remains the authoritative clean-install check.

A separate read-only review agent independently computed the delta, inspected the source/tests/bundle and reported **no actionable security findings**. Reviewed issuer bundle SHA-256: `98657a65570f3927a283bdfa137fd43f6c57750ee5b2fefcec6685205f1dcd1a`. The resource bundle remains `57026b456d1807c6a62cb2b0081f939964ae02a8f95cbd9ddcecfbbe958b79a3`. This is an agent code review with no independent test execution or cloud inspection, not a human/external audit.

Supported clean-install [CI run 42413533266](https://github.com/jcr0916-hue/federatedrepublic/actions/runs/42413533266), job 128526562908, passed on source [3300d737](https://github.com/jcr0916-hue/federatedrepublic/commit/3300d737c33ce5cf3960d2dad33c1e577a76aa77), using Node **24.22.2**: typecheck, **76 tests / zero failures**, and four builds. World publishing run 42413533320 also passed. Downloaded issuer artifact 13590761626 and resource artifact 13590337694 matched the reviewed module hashes exactly; their ZIP digests matched GitHub's artifact metadata.

At 21:00 UTC on November 7, only `newsroom-strict-issuer-candidate` was updated, while both candidate public URLs were closed. Deployment `62377e37-e379-447d-92f7-297e5e287264`, version `5b3f6ec8-cace-4c0c-b5b5-0c39531aa917`, serves the reviewed issuer bytes. Post-upload download verified that hash. All three encrypted issuer secrets, existing public bindings, SQLite namespace IDs and query redaction were retained. No migration was sent. The resource deployment and bundle were unchanged; it remains bound only to the candidate issuer and private synthetic bucket. Secret values were never retrieved or printed.

Three live, nonsecret callback checks passed: pinned issuer with no browser session reaches the expected 403; wrong issuer and duplicate issuer each fail with 400. The saved local-client and independent validator credential pairs were then rechecked successfully without minting a grant. Both candidate URLs were reopened at 21:02 UTC for a fresh human authorization; previews stay disabled, query redaction stays enabled, traces/exports stay disabled. The earlier runtime redaction canaries remain the logging evidence; this parser-only patch adds no logging.

The first real isolated approval subsequently completed: the local client verified the downstream issuer/state and exchanged its code, and authenticated discovery returned exactly `newsroom_list` and `newsroom_read`. This establishes that the deployed immutable editor-ID gate and private GitHub app secret were accepted in this flow; the raw GitHub identity/token response was not exposed. At 21:14 UTC, discovery confirmed the grant active immediately before revocation, then the first following resource request returned 401. Both candidate URLs were closed while further probes were prepared.

The private synthetic bucket was empty and had no public domain. One clearly synthetic, noncanonical fixture was seeded through the control plane and read back exactly: `submissions/korda/2026-11-07/11111111-1111-4111-8111-111111111111.json` (460 bytes, ETag `afe3c7973c2bee630ba83c06887fd3ad`). No production bucket was accessed. This control-plane readback established setup; authenticated resource-tool read evidence is recorded below.

The separate local test client now has read/write-denial, refresh-race/replay and revocation/refresh-denial controls. **15 synthetic helper tests pass locally.** This helper is task-local, outside the candidate Worker source/bundles. A scoped read-only agent review identified cleanup gaps after interrupted or nonconforming refresh responses; the helper now retains known successors for best-effort revocation, marks uncertain outcomes before issuance probes and forbids a fresh sign-in or full revocation claim while the outcome is uncertain. Regression tests cover the review findings; the final correction was tested by the implementing agent, without claiming an independent re-review.

Only candidate URL switches changed in that preparation phase; Worker code, encrypted secrets, namespace bindings and the existing connection were unchanged. Both candidate URLs reopened at 21:25 UTC with query redaction enabled and previews/traces/exports disabled.

### Hosted local-client acceptance — passed, evaluation closed

The next human approval and code exchange succeeded. On November 7 at 22:19 UTC, the expanded client completed four live stages against the hosted candidates:

1. Authenticated discovery exposed exactly the two read tools. List/read returned the expected synthetic record, including its exact body. Submit, review, publish and unknown tools were denied with 403; forged arguments returned 400 and the unsupported method returned 403.
2. Two concurrent refresh requests from this one local process produced exactly one 200 successor and one 400 `invalid_grant`. The previous access credential was denied with 401, and a further replay of the previous refresh credential returned 400 `invalid_grant`.
3. Discovery and exact synthetic list/read passed again with the successor. The same forbidden-operation probes were denied.
4. Revocation succeeded; the first subsequent resource request returned 401, and the revoked refresh credential returned 400 `invalid_grant`. No ambiguous outcome occurred and no token value was exposed.

Both candidate URLs were closed at **22:19:43 UTC** and independently read back disabled, with previews disabled and query redaction preserved. At 22:20 UTC, the synthetic bucket still contained exactly the same one object: unchanged key, ETag, size, last-modified timestamp and content. Public bucket access remains off, no custom domains are attached, and exact Worker public/SQLite/service/R2 bindings and secret names were unchanged. The task-owned local helper was stopped and its loopback listener closure verified.

This completes the bounded **local-client isolated acceptance**, not a production release. Multiple-region refresh races and hosted outage/recovery/lost-response behavior remain unverified, along with broader abuse controls, credential-rotation operations and ownership. Actual ChatGPT interoperability was not tested because the user chose the separate local client; the working connection is untouched. The two observed test grants were revoked. Candidate resources, encrypted secrets, private local setup and one synthetic fixture are retained for controlled further evaluation, with public candidate URLs closed. No Worker source deployment or migration occurred in this acceptance phase; no real callback code, state or token is retained in this note.

## Preservation and disposition

Retain this unfinished child branch and its frozen #305/#304 dependencies. No merge, main change, production deployment, existing grant mutation or branch deletion is authorized by this fix. The candidate update preserved the already-installed Secret bindings and SQLite namespaces; the initial namespace migration must not be repeated. A fresh browser authorization is required after the old five-minute state expires. Final deployment/automation dependency review and preservation/disposition gates remain pending before any future merge or cleanup.
