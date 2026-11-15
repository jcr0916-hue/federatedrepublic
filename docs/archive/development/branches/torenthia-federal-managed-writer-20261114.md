# Branch handoff — Managed Federal writer and inbox

- **Original branch** `feature/torenthia-federal-managed-writer-20261114`
- **PR** [Draft #325](https://github.com/jcr0916-hue/federatedrepublic/pull/325)
- **Base** [Draft #324](https://github.com/jcr0916-hue/federatedrepublic/pull/324) at `ca513f19431af1837aacd8b208da9d713d4c7f16`, stacked on [draft #323](https://github.com/jcr0916-hue/federatedrepublic/pull/323) at `c4da1959bd3fa7d3ce9c7cb42f7096efaf7b9bd0`
- **Status** Proposed. An authenticated writer and inbox bridge were exercised with synthetic fixtures.

## Changes and decisions

- [Managed runner](../../../../scripts/newsroom/managed-federal.mjs) verifies a signed Federal job, reads policy from protected `main`, then opens the one linked revision assignment. The [read-only inbox bridge](../../../../scripts/newsroom/federal-inbox.mjs) verifies the original receipt through the existing ledger validation. The assignment contains only the public task and IDs.
- [GitHub adapter](../../../../scripts/newsroom/github-writer.mjs) checks PR review rules, draft state, pinned base and head, exact notes path and file mode. It uses GitHub's atomic expected-head operation and checks the result. Exact replay and recovery after an ambiguous response reuse the original commit.
- A human stages the notes-only draft. This keeps Pull requests permission read-only on the future App. The model gets no GitHub clients or credentials. The newsroom workflow runs on stacked PRs with matching paths and exercises the fixture with read-only permission.

## Evidence

- All 28 newsroom tests passed locally on Node 24.15.0, including expiry, identity, both switches, inbox identity and hash, file scope, stale refs, draft review state, and replay. The dry run simulated one verified receipt, one notes commit, and one replay. It made zero network requests and zero model calls.
- The existing validator accepted four workspaces and one editorial ledger entry. The checked-in planner returned zero runs and zero reserved spend. The local World publishing suite passed through site build, discovery and release compatibility. [Hosted checks](https://github.com/jcr0916-hue/federatedrepublic/pull/325/checks)

## Follow-up and preservation

- [Operating and provisioning specification](../../../torenthia/FEDERAL-MANAGED-PILOT.md) records the required review rules, writer-only GitHub App and read-only inbox access. Provisioning, external App authentication, hosted writes and paid model limits have not been exercised. Constitution 19 still supplies the final aliases. There is no dependency on the separate OAuth work in #322.
- Preserve #323 and #324 as the workspace and editorial trial records. Keep this branch while its draft is open. After a future approved merge, verify the exact tip and deployment, automation and PR dependencies before applying the [reviewed branch lifecycle](../BRANCH-LIFECYCLE.md).
