# Branch history — S3 read-only MCP candidate integration

**Original branch:** `feature/newsroom-s3-resource-integration-20261108`
**Base:** `feature/newsroom-r2-readonly-s3-20261108` at `aaa971852752e8f6da94a57871d37748aafb8ef5`, draft PR #312
**PR:** https://github.com/jcr0916-hue/federatedrepublic/pull/313 (draft)
**Status:** experimental; unmerged/unshipped; no deployment

## Purpose
Integrate the previously unbound S3 Get/List credential prototype into a separate full MCP resource candidate without altering Verification 04 or the existing release artifact. A new resource candidate must have **no native R2Bucket binding** and must use a bucket-scoped **Object Read only** S3 credential in a future approved isolated hosted test.

## Changes
- `src/resource-candidate.ts`: dependency-injected read storage factory; preserves existing default binding and authentication behavior.
- `src/resource-s3-candidate.ts`: new separate S3-only resource composition.
- `scripts/build-resource-s3-candidate.mjs`, package scripts, CI: fifth unbound build and review artifact, no deploy.
- `test/resource-s3-candidate.test.ts`: simulated issuer/S3 HTTP, legacy MCP list/read/status overlay, denied write tools, no native R2 binding.
- `R2-S3-RESOURCE-INTEGRATION.md`: exact contract, tests and remaining hosted/production gates.

## Evidence
**Verified implementation CI:** at commit `3250f375c4c3382e780856ee4f6a25dac40d2503`, [Newsroom OAuth checks run 42513466833](https://github.com/jcr0916-hue/federatedrepublic/actions/runs/42513466833) passed: **102 tests / 22 suites / zero failures**, TypeScript, legacy and hardened issuer/resource and S3 resource builds; all review artifacts, including separate S3 build, uploaded. [World publishing run 42513466814](https://github.com/jcr0916-hue/federatedrepublic/actions/runs/42513466814) status must be rechecked before release review. The following handoff-only commit must pass its own CI. Tests are synthetic local Miniflare and mocked HTTP only, not actual R2 S3 access or storage privilege proof. No real R2 credentials created and no Cloudflare Worker configuration changed. Do not represent successful source tests as a production security clearance.

## Decisions / blockers
Keep the original `resource-candidate.ts` entrypoint built separately and unchanged for the existing test deployment. Do not select S3 build as a release until actual hosted S3 interoperability and permission denial on isolated synthetic storage are proven. R2 Object Read only token scoping enforced by Cloudflare remains a required provisioning check. F5/F6/F7/F8 and independent security review remain unresolved.

## Branch disposition
Retain as active draft dependency. Preserve all open PR bases and handoffs, including #304–#312; no merge, deployment, canon edits, credential rotation or branch deletion. Later archival/cleanup follows AGENTS.md and checks live deployment/automation references and original history.
