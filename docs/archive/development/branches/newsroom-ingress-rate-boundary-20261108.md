# Branch history — newsroom ingress rate boundary

**Original branch:** `feature/newsroom-ingress-rate-boundary-20261108`  
**Base:** `feature/newsroom-oauth-security-review-20261108` (draft PR #310) at `9076feb2391ffb4fa8f5fff5efb50e1ef7f4d4e0`  
**PR:** Pending new stacked draft  
**Status:** EXPERIMENTAL; release blocked, nothing shipped.

## Purpose
Reduce exposure of the hardened issuer's global budget to unauthenticated traffic as identified in PR #310 finding F5, without touching the original production Worker, test Verification 04 or Cloudflare resources.

## Implementation
- `workers/newsroom/src/ingress-rate-limit.ts`: fail-closed limiter helper. Requires a Cloudflare Rate Limiting binding; missing/throwing binding returns 503, rejected checks 429. Partition by route and Cloudflare edge-originated source IP, with an unattributed shared fallback. Do not trust `X-Forwarded-For`, arbitrary token strings or source-selected route keys.
- `workers/newsroom/src/issuer-candidate.ts`: require `ISSUER_INGRESS_LIMIT` at valid public `/authorize` requests *before* spending the authenticated client's shared authorization quota.
- `workers/newsroom/src/resource-candidate.ts`: require `RESOURCE_INGRESS_LIMIT` at syntactically valid public bearer MCP requests *before* expensive validator-authenticated introspection.
- `workers/newsroom/test/candidate-harness.ts`: local synthetic rate limiter bindings (high default to preserve prior tests; narrow configurable limits for adversarial cases).
- `workers/newsroom/test/ingress-rate-limit.test.ts`: fail closed, untrusted proxy forwarding, source key and local abuse limit regression.
- `workers/newsroom/release/readonly-production-boundary.json`, contract tests, and `PRODUCTION-READONLY-RELEASE.md`: new bindings mandatory, no deployment config/namespace assignments and explicit release blockers.

## Verification
Initial branch CI not yet recorded at time of handoff creation. Test by supported Node CI typecheck, full `npm test`, four candidate/legacy builds and world publishing checks. Check final head SHA/PR run; do not infer test success from code review alone.

## Residual risks
Cloudflare Rate Limiting bindings are **approximate** and **per-location**. They are not strict global caps. Cloudflare docs warn same-zone Worker subrequests may influence `CF-Connecting-IP`; treat it as a best-effort direct-edge source hint, not authenticated identity. Shared NAT/mobile/proxy IPs may deny legitimate ChatGPT requests. A distributed attack can still exhaust the authoritative issuer's `/introspect` and `/authorize` budgets. Separate edge/WAF rules and traffic baselines, verified source signals, global abuse modeling, worker subrequest exclusion, realistic ChatGPT bursts and multi-region tests are release blockers. No Cloudflare rate-limit binding or WAF rule has been provisioned.

Keep F5 open. The other PR #310 findings (R2 write-capable storage binding, global grant inventory/revocation, operational hardening and original KV adapter race) remain open. This patch is **not** an independent audit, production approval or hosted acceptance.

## Decisions and branch disposition
No secret, credential, R2 object, OAuth grant, Worker deployment or published canon was touched. Keep all open PR branches #304–#310 plus this one; no merge/main/branch deletion authorized. Branch cleanup and frozen SHA attestation remain pending, requiring AGENTS.md handoff, reachability, live dependencies and protection checks before any eventual cleanup.
