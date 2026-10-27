# Development checks and release workflow

Develop related work on one branch from current `main`. Commit and iterate there,
open a PR, and merge the finished, validated work once. Keep the permanent branch
handoff in the same PR; follow [the branch lifecycle](../archive/development/BRANCH-LIFECYCLE.md).
Retain the development branch after merge unless a separate preservation review
authorizes cleanup.

## Automatic behavior

- **Branch pushes and PR updates:** GitHub Actions runs `World publishing check`,
  including its existing unit tests, Constitution checks, site build, local links
  and anchors, assets, scenarios, and compatibility checks. Pushes to a branch
  with an open PR may run both push and PR checks. No deployment credentials or
  Vercel deployment step are part of this workflow.
- **PRs to `main`:** `Constitution archival check` additionally checks the diff
  against the PR base with full Git history. Its historical archive protection
  and the existing main-branch recovery workflow remain intact.
- **Vercel Git integration:** `vercel.json` sets `git.deploymentEnabled` to
  `{"**": false, "main": true}`. `**` covers branch names containing slashes;
  Vercel enables a deployment when any matching rule is true, so only `main`
  is enabled. See [Vercel Git configuration](https://vercel.com/docs/project-configuration/git-configuration).
- **Project setting:** disable Branch Tracking under Vercel **Settings →
  Environments → Preview** (`previewDeploymentsDisabled: true`). This also
  suppresses automatic previews from older branches that lack the new config.
  Keep the Git repository connected, Production tracking `main`, and automatic
  assignment of production domains enabled.
- **Merge to `main`:** the existing Git integration creates the production
  deployment and assigns the production domain. GitHub Actions also checks
  `main`; it does not create a second deployment. Do not add a parallel automatic
  Vercel deployment job or deploy hook.

This reduces deployment frequency, not the size of each build or the storage
already occupied by retained deployments. Every later push to `main` can create
another production deployment, including archival recovery commits. There is no
promise of one deployment across several separate merges or manual deployments.

## Merge checks and safe rollout

Wait for **World publishing check** and **Constitution archival check** to pass
on the final PR revision before merging. Keep all other applicable substantive
checks. A missing Vercel preview or deployment status is expected and must not be
a required merge check.

At inspection on 27 October 2026, GitHub reported `main` as unprotected, with no
required status checks and no repository rulesets. No protection was removed or
weakened for this rollout; these merge gates currently depend on maintainer
discipline. The connected GitHub app cannot administer branch protection. If
protection is added later, require the two always-emitted PR check names above
from GitHub Actions; do not require `Vercel` or the conditional archival recovery
job. Preserve review requirements and other independent test requirements.
Before disabling previews on any differently configured repository, inspect and
replace any required Vercel status with the independent checks first, so the
configuration PR cannot wait forever for an intentionally absent preview.

Before merging an older PR, update it from current `main`, retain the deployment
policy, and rerun checks. Do not merge the permanent legacy archive into `main`.
Use a merge commit when branch history must remain directly reachable.

After merge, verify Vercel's deployment for the exact merge SHA is **Production /
READY** and that the production domain serves it. Check deployment history for
unexpected previews or duplicates; do not infer zero deployments from a missing
PR comment. This rollout's observed evidence belongs in
[the permanent handoff](../archive/development/branches/low-deployment-workflow-20261027.md).

## Occasional manual preview

Request a preview explicitly when reviewing browser behavior, runtime APIs, or
Vercel-specific behavior that local checks cannot establish. Choose a tested
commit and create one **Preview** deployment with the authenticated Vercel API
or CLI; keep automatic Preview Branch Tracking disabled.

For the CLI, use a clean checkout at that commit. If it is not linked, deliberately
link it to the existing project, then verify the resolved team and project:

```sh
vercel link --project federatedrepublic --scope the-federated-republic
vercel project inspect --non-interactive
vercel deploy --target=preview --scope the-federated-republic
```

The intended project is `federatedrepublic`
(`prj_ayI3VUTkMQC7VQ01XCb8AdJSXysE`) in `the-federated-republic`
(`team_1kqG0k2PIXvDT5ZP0JLX3WS3`). Stop if the resolved project differs.
Use normal Vercel authentication; never commit credentials, `.vercel` environment
files, or `.env` files. Do not use `--prod`, promote the preview, or temporarily
turn on automatic previews. The disabled Preview Branch Tracking control
explicitly permits CLI/API deployments. Record the requested commit, deployment
URL/ID, Preview target, and actual READY/error result in the PR/handoff.

Manual preview execution is not part of this rollout's acceptance test. It costs
an additional deployment and should occur only when requested. Production still
comes from the eventual validated merge to `main`.
