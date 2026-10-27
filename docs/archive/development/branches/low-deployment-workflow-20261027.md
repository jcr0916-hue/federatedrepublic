# Branch history — maintenance/low-deployment-workflow-20261027

**Original branch:** `maintenance/low-deployment-workflow-20261027`  
**PR:** [#263](https://github.com/jcr0916-hue/federatedrepublic/pull/263)  
**Implementation commit:** `e49a626d52b9363b06d42a6a09c6b3fbdbdc44d7`  
**Status:** implementation validated; final documentation revision and release outcomes are recorded in the PR.

## Purpose and changes
Run development tests without a preview per commit, then deploy the completed
work when merged to `main`.

- `vercel.json`: `{"**": false, "main": true}` for automatic Git deployments.
- `.github/workflows/world-publishing.yml`: the unchanged full publishing suite
  also runs on all branch pushes; existing PR/main tests and archival gates stay.
- [Permanent workflow](../../../operations/LOW-DEPLOYMENT-WORKFLOW.md), linked
  from the documentation map: merge checks, manual previews and verification.
- Applied project setting: Preview Branch Tracking disabled. Git remains
  connected; Production tracks `main` with automatic domain assignment.

## Results and evidence — 27 October 2026
- Baseline: `4f4d59e39385df96571936f5adfad0f990b6d3f5` (PR #262).
  GitHub reports `main` unprotected, required checks off/empty, rulesets empty.
  Protection administration endpoint returns 403 for the integration. No branch
  rules were changed; there is no required Vercel status to deadlock this PR.
- Inspected Vercel's correct Git connection, Production/Preview settings and
  absence of deploy hooks. Recent ordinary-branch previews established the
  previous behavior. Applied `previewDeploymentsDisabled: true`; a reloaded
  dashboard shows Branch Tracking **off** and explicitly permits CLI/API previews.
- `npm run world:publish-check`: PASS locally: 169 Node tests, 35 Python archival
  tests, 392 built pages, 261 public records, local links/anchors/assets,
  constitutional consistency, 55 scenario references, compatibility.
- Full-history archival validation against the base and implementation commit:
  PASS. A shallow checkout initially lacked required history; fetching history
  resolved it. YAML, nine-branch minimatch matrix (including nested slash names),
  documentation destinations and whitespace validation: PASS.
- Implementation SHA: GitHub [branch-push publishing](https://github.com/jcr0916-hue/federatedrepublic/actions/runs/40543294428),
  [PR publishing](https://github.com/jcr0916-hue/federatedrepublic/actions/runs/40543364128)
  and [PR Constitution archival](https://github.com/jcr0916-hue/federatedrepublic/actions/runs/40543364145)
  all **PASS**. Vercel branch and implementation-SHA queries returned zero
  deployments, including after those checks completed.
- Final documentation revision is another PR iteration. Its final CI outcomes,
  preview count, merge SHA, production READY deployment and domain verification
  belong in the PR description after verification; no post-merge documentation
  commit should create an extra production deployment.

## Decisions, limitations and reuse
- Reuse the independent publishing suite and archival diff gate unchanged. Keep
  both the repository branch policy and disabled project Preview Branch Tracking;
  the latter also covers stale branches without the new configuration.
- Rejected: ignored-build commands (can leave canceled deployment records),
  disconnecting Git (stops production), fake Vercel statuses, and duplicate deploy
  workflows. `**` covers slash names; a single `*` is insufficient.
- No experimental content or manual preview was deployed. Manual CLI/API preview
  capability is documented and supported by the dashboard, but execution is
  **not established**. Runtime-specific work may still require a requested preview.
- Unresolved enforcement limitation: `main` is unprotected; maintainers must wait
  for World publishing and Constitution archival. Each separate merge/main push
  can deploy, including archival recovery. This policy does not shrink existing
  retained deployments. Future work should update old branches from current main.

## Preservation and branch disposition
The workflow and this handoff are retained in the same PR. Only configuration,
validation triggers and development documentation change; canonical Constitution,
Torenthia, archival source and substantive test commands are preserved unchanged.
Use a merge commit to preserve branch history. Keep this branch; its deployment
policy and project controls were checked, and no branch-specific deployment was
found during validation. **Deletion approval: not granted.** Separate preservation
review remains required.
