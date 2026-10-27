# Branch history — maintenance/low-deployment-workflow-20261027

**Original branch:** `maintenance/low-deployment-workflow-20261027`  
**PR:** not yet opened  
**Head commit at handoff:** pending  
**Status:** proposed

## Purpose
Run ordinary development tests without creating a Vercel preview for each
commit; deploy the completed work once when merged to `main`.

## Changes and artifacts
- `vercel.json`: disable automatic Git deployments for all branches except `main`.
- `.github/workflows/world-publishing.yml`: run the unchanged full publishing
  suite for every branch push as well as PRs and `main`.
- [Permanent workflow](../../../operations/LOW-DEPLOYMENT-WORKFLOW.md), linked
  from the documentation map: merge discipline, required-check guidance, manual
  previews, and verification steps.
- Project setting applied: disable Preview Branch Tracking, keeping Production
  tracking `main` and automatic production domain assignment enabled.

## Results and verification
- Baseline `main`: `4f4d59e39385df96571936f5adfad0f990b6d3f5` (PR #262).
- GitHub branch endpoint: unprotected, required checks off/empty; rulesets empty.
  Direct protection endpoint returns 403 for this integration. No branch-rule
  mutation is needed to avoid a missing-preview deadlock.
- Vercel dashboard: correct Git repository connected; Production tracks `main`,
  auto-assigns domains; Preview Branch Tracking initially enabled; no deploy hooks.
  Recent history includes multiple ordinary-branch previews and a READY
  production deployment for the baseline SHA.
- `npm run world:publish-check`: PASS locally (169 Node tests, 35 Python archival
  tests, 392 built pages, 261 public World records, local links/anchors/assets,
  constitutional consistency, 55 scenario references, release compatibility).
- Parsed workflow YAML; full test command retained. Minimatch branch matrix:
  `main` enabled; eight development/archive examples, including nested slash
  names, disabled. `git diff --check`: PASS.
- `previewDeploymentsDisabled: true` applied through Vercel's project API;
  reloaded Preview settings confirms Branch Tracking **off**. The dashboard
  explicitly states manual CLI/API deployments remain possible.
- PR checks, observed branch/PR deployment counts, merge and production
  verification: **not established yet**. Record release verification in the PR
  description after merge, without another documentation-only production push.

## Decisions and lessons
- Reuse the independent World publishing suite and archival diff gate unchanged.
- Use `**`, not a single `*`, for the slash-containing development branch names.
- Disable Preview Branch Tracking as well as committing the branch policy so
  stale branches cannot keep creating previews with an older `vercel.json`.
- Rejected: ignored-build commands (can create canceled deployment records),
  disconnecting Git (would stop production), fake passing Vercel statuses, and a
  second automatic deployment workflow.
- Manual CLI/API previews remain opt-in; executing one is not established by this
  handoff. Runtime behavior still needs a requested manual preview when relevant.

## Open follow-ups
- Complete actual validation and update this note before merge.
- `main` has no enforced merge gates; maintainers must wait for substantive checks.
- Production deployment count and status must be checked after merging; the
  rollout must not claim zero previews solely from the committed policy.

## Preservation and branch disposition
Keep the handoff and workflow on `main` through the same PR. No canonical
Constitution, Torenthia, archival source, test commands, or historical archive
files are changed. Original branch remains; no destructive branch operations are
authorized. Deployment/automation dependencies: automatic Git policy and project
preview control inspected; exact branch-specific deployments not established yet.
**Deletion approval:** not granted; separate preservation review required.
