# Branch history — fix/newsroom-github-iss-20261107

**Original branch:** `fix/newsroom-github-iss-20261107`  
**PR:** not yet opened  
**Frozen parent:** PR #305, `4fda7e342b70f3ea59b151d89a7e8976572d7f39`  
**Status:** experimental isolated callback compatibility fix; not merged or production deployed

## Purpose and scope

The first real GitHub return included an `iss` field. The candidate's strict query allowlist rejected it with `invalid_callback` before identity exchange. No live authorization code or state value is retained here. The frozen parent checkout and PR #305 are preserved; this child branch contains only the necessary issuer parser change, regression coverage and this note.

## Change and security policy

- `workers/newsroom/src/issuer-candidate.ts` accepts the optional upstream issuer only when its decoded string is exactly `https://github.com/login/oauth`, for success and denial callbacks. Duplicate, empty, mismatched and other unknown parameters remain invalid before state consumption or provider I/O.
- Legacy responses without `iss` remain accepted for this one statically configured GitHub provider. No metadata discovery, request-selected endpoint, configurable provider or broader trust is introduced. The expected identifier is pinned from the observed dedicated-provider response, not used to choose an endpoint. No authoritative GitHub issuer metadata was established; the attempted root metadata URL returned 404. [RFC 9207 section 2.4](https://www.rfc-editor.org/rfc/rfc9207.html#section-2.4) permits local policy for absent identifiers and requires exact validation of supplied identifiers.
- `workers/newsroom/test/issuer-candidate.test.ts` covers accepted issuer/consent, mismatches and duplicates with no provider call or state consumption, one-use replay refusal, and denial with no code issuance. The downstream response keeps the candidate's own issuer identifier.
- Cookie/state/CSRF, both PKCE legs, immutable editor identity, read scope, fixed endpoints, credential handling and redaction are preserved.

## Results

The three new targeted regressions reproduced the original defect: **0 passed / 3 failed**, all at the expected valid-callback acceptance checks. They then passed with the narrow fix. The complete local typecheck, **76 tests / 0 failures**, and four release/fixture/issuer/resource builds passed. Local Node 24.15.0 is below the supported engine range, so supported-Node CI remains the authoritative clean-install check.

A separate read-only review agent independently computed the delta, inspected the source/tests/bundle and reported **no actionable security findings**. Reviewed issuer bundle SHA-256: `98657a65570f3927a283bdfa137fd43f6c57750ee5b2fefcec6685205f1dcd1a`. The resource bundle remains `57026b456d1807c6a62cb2b0081f939964ae02a8f95cbd9ddcecfbbe958b79a3`. This is an agent code review with no independent test execution or cloud inspection, not a human/external audit. Supported-Node CI and candidate-only redeployment are pending at this commit's preparation; actual results are recorded in the PR and session evidence. No hosted success is claimed here.

## Preservation and disposition

Retain this unfinished child branch and its frozen #305/#304 dependencies. No merge, main change, production deployment, existing grant mutation or branch deletion is authorized by this fix. Candidate deployment will preserve the already-installed Secret bindings and SQLite namespaces; the initial namespace migration must not be repeated. A fresh browser authorization is required after the old five-minute state expires. Final deployment/automation dependency review and preservation/disposition gates remain pending before any future merge or cleanup.
