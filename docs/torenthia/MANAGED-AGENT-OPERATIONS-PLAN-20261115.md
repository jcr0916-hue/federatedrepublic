# Constitution 20 — Managed Agent Newsroom Operating Plan

**Status:** PROPOSED operational architecture and phased release plan, November 15, 2026. **Owner:** President (final policy, release, budget and canon decisions); VP/Central Editor (engineering coordination and editorial review). **Objective:** bring the first managed Federal agent into actual cloud-based production in the week of November 16–20, then expand desk by desk without needing a Mac on daily runs.

> This is the single coordination plan for the initial managed-agent rollout. Existing `PROJECT-SOURCES.md`, `AGENTS.md`, `NEWSROOM-OPERATIONS.md`, `FEDERAL-MANAGED-PILOT.md`, and `PUBLISHING.md` retain their own authority. This plan proposes an implementation and milestones, **not** permission to merge, deploy, provision credentials, run paid models, or publish canon.

## 1. What 'working' means

**Milestone P1 — first managed production:** An operator triggers one authorized **Federal** assignment in the cloud; the model actually runs through Vercel AI Gateway; a trusted submitter deposits a real `PROPOSED` Federal submission into the existing Cloudflare newsroom inbox; a receipt and cost record are verified; Central Editor can read and decide on the submission. No canonical publication required for P1. This is not a synthetic test, manually pasted TypingMind task, or a model response merely copied into a chat.

**Milestone P2 — functioning newsroom:** Federal completes multiple assignments through the same process on an approved schedule, with readable outcome/charge logs, reliable pause and at-most-once job claiming, editorial feedback, and human-approved website publication of a vetted story. A quiet queue is acceptable when no worthwhile assignment exists; do not invent events to meet a quota.

**Milestone P3 — multi-desk expansion:** Onboard and activate qualified state/territory desks and then specialist desks independently, preserving source scope, newsroom identity, budgets, cadence, and editorial independence. No desk is subordinate to the Federal agent.

## 2. Architecture: ownership and flow

```text
GitHub main (Constitution + approved World canon + per-desk work orders + roster)
          | (pin commit, retrieve bounded verified source packet)
          v
Trusted cloud dispatcher / runner (short-lived job identity, live switches,
  per-desk authorization, durable job claim, budget, retry/stop controls)
          |                  \
          |                   -> Vercel AI Gateway -> selected model (draft ONLY)
          |
          v
Trusted newsroom submitter (Federal or scoped desk credential; no key to model)
          |
          v
Existing Cloudflare Worker -> existing R2 newsroom bucket (original receipt)
          |
          v
Central Editor (read existing inbox -> disposition/revision/accept/hold)
          |
          v
GitHub editorial ledger + review PR -> President's approval/merge
          |
          v
Website release checks and deployment -> published canonical record
```

**One source of truth per concern:** GitHub protected `main` = constitutional, published World, approved desk roster/work orders and review history; Vercel Gateway = paid inference only; Cloudflare existing R2/Worker = submitted private drafts/receipts; Central Editor = editorial decisions; President = publication/activation/budget authority. Raw unpublished reports and secrets never belong in this public repo. ChatGPT/TypingMind can inspect and supervise, but are **not required** as an always-on runtime.

### Execution choice for P1 — reuse Node 24 instead of porting the system

**Recommended smallest practical path:** one **manually dispatched, tightly scoped GitHub Actions Node 24 job** as the temporary trusted cloud runner, with explicit job admission and no recurring trigger. This fits the existing Node 24 newsroom modules and already-passing tests, eliminates the Mac dependency, and avoids introducing a new application platform just to start one agent. Store dedicated runner credentials in a restricted GitHub Actions environment with appropriate manual release approval and the minimum secret permissions. The existing read-only `newsroom-workspaces.yml` check must **remain read-only**; create a **separate** managed-run workflow and do not reuse PR-triggered jobs for secret-bearing operations. Do not permit any pull-request-controlled code, arbitrary user-supplied prompts or untrusted fork code to run with secrets.

**Atomic claim/storage:** reuse the Cloudflare platform already present and add or adapt a separately reviewed durable claim service, preferably one namespaced Durable Object, for job-id deduplication and bounded daily/slot reservations. Existing deployed Durable Object namespaces were found for OAuth/security experiments; **none is confirmed suitable or authorized for the new model-budget ledger**. Do not attach to those namespaces without separate compatibility/security review. An alternate truly transactional backend is acceptable; an in-memory Map or read-then-write R2/KV record is not.

**Model integration:** keep the reviewed Gateway adapter server-side. Approve one actual model ID and its effective per-token/token-family and provider prices, then enforce a single paid attempt and a bounded token/time/cost envelope. An existing `AI_GATEWAY_API_KEY` was observed on the Vercel site project; that does not grant permission to expose or copy that key to GitHub Actions. Provision a dedicated, restricted credential for the runner after approval. Avoid requiring LiteLLM or the user's Mac in this path.

**Direct R2 read:** not a prerequisite for an initial *new* Federal assignment fetched from approved GitHub work orders. For later `REVISION_REQUESTED` decisions, bind read-only R2 access to retrieve/validate the exact existing receipt and decision (as already designed in #325). For the first submission, use the existing newsroom Worker's Federal authenticated submit route via a trusted client. Verify actual endpoint, request/response schema, desk authentication and ambiguous-response handling **before** the first live submit. An R2 object write directly from the runner is unnecessary and should not be added.

**GitHub writer:** the existing Federal `notes.md` writer in #325 is a reviewed synthetic capability; it is useful for shareable checkpoints, not required to submit a proposed draft to R2 at P1. Keep it out of the first paid run unless already verified and provisioned. A GitHub App with limited Contents-write/Pull-requests-read and protected-branch rules is needed before permitting runtime notes commits. The model never receives GitHub credentials. No agent merges or publishes.

## 3. Current evidence (as checked November 15)

| Component | Evidence | Meaning |
| --- | --- | --- |
| Workspaces/roster + editorial ledger | Draft [#323](https://github.com/jcr0916-hue/federatedrepublic/pull/323) | Four desks listed, both global/desk switches parked |
| Revision assignment | Draft [#324](https://github.com/jcr0916-hue/federatedrepublic/pull/324) | Synthetic Federal editorial trial; not a real managed production run |
| Federal signed writer/inbox read | Draft [#325](https://github.com/jcr0916-hue/federatedrepublic/pull/325) | Tests with fake GitHub/R2; no live App or paid call |
| Gateway contract, adapter and claim policy | Drafts [#326](https://github.com/jcr0916-hue/federatedrepublic/pull/326), [#327](https://github.com/jcr0916-hue/federatedrepublic/pull/327), [#328](https://github.com/jcr0916-hue/federatedrepublic/pull/328) | Specification, fake-transport model adapter, durable-*store interface*; no persistent backend |
| Desk reader and supervised draft composer | Drafts [#329](https://github.com/jcr0916-hue/federatedrepublic/pull/329), [#330](https://github.com/jcr0916-hue/federatedrepublic/pull/330) | Scoped offline source/assignment reading, draft-only composition; not a live job |
| CI | Hosted Newsroom/World checks observed successful on #330 head | Does not prove credentials, cloud runtime, model API, or real submission |
| Cloudflare | Existing `federated-republic-newsroom` Worker, `federated-republic-newsroom` R2 bucket, Federal/Korda/Varek/Corindal/Editor secret **bindings**; no cron triggers on the production newsroom Worker | Existing ingress can be reused; never expose secret values |
| Other Cloudflare Workers | Several isolated OAuth/security Workers and Durable Object namespaces from previous experiments | Historical infrastructure, not proof of a production agent dispatcher or cost ledger |
| Vercel | Existing `federatedrepublic` project; AI Gateway key **configured** for website; site deployment from `main` only in `vercel.json` | Reuse Gateway infrastructure, but isolate runner credentials and do not deploy from feature branches |
| Qualifications | `EDITORIAL-CURRENT-STATUS.md` records several qualified geographic desks and a supervised Federal agent | Agent editorial qualification is separate from managed cloud activation |

## 4. The shortest path to first production — ordered release gates

Do these **in order**; stop adding generalized infrastructure in parallel. Each gate needs a named owner, verifiable artifact, and a clear pass/fail condition.

### Gate 0 — freeze scope and branch dependency review (VP/engineer; phone-friendly)

- Decide P1 is **one Federal job, one paid model attempt, one proposed R2 submission, zero automated publication**. Select one approved public Federal assignment that is NOT a synthetic qualification test and pin its protected `main` sources. Editorial work order names the task and expected output, without secrets or invented facts.
- Review dependency stack #323 → #324 → #325 → #326 → #327 → #328 → #329 → #330. Before merging, check each diff/PR base, expected GitHub rules, source/canon safety, and the permanent branch handoffs. To minimize main changes, extract or land only launch-critical code through a reviewed sequence, retaining dependency history; do not blindly merge all eight PRs because their CI is green.
- **Pass:** approved minimal launch diff and a real work order identified. **No-Go:** merge would introduce unreviewed active schedules, secret exposure, or website changes.

### Gate 1 — trusted dispatcher and provider policy (engineer; cloud actions)

- Implement separate manual `workflow_dispatch` **managed-run** Action on protected trusted code with Node 24. Scope to a single fixed Federal identity/approved work order; require restricted GitHub Actions environment approval, concurrency = 1, timeout, and read-only default GitHub token. Don't run secrets on `pull_request`.
- Connect protected GitHub `main` source packet extraction, the reviewed `supervised-draft` composer, and Gateway adapter. Verify actual API response and usage semantics and input/output ceilings; select/review model and price. Before paying, stop on missing authorization, unknown pricing, disabled switch, stale protected head, or unavailable budgeting.
- **Pass:** successful hosted end-to-end *fake transport* with zero calls to the paid model and no external writes plus authenticated live preflight. **No-Go:** model sees a secret or can select its own file/desk/authority.

### Gate 2 — spend/identity/stop control (engineer and President for credential provisioning)

- Use a dedicated restricted Gateway API key, Federal-only Worker submit credential, and optionally an independently scoped GitHub App only if notes writing is in P1. Verify names/scopes, never paste secrets in chat or PR. Keep stored values in restricted cloud secrets.
- Claim a stable Federal job ID atomically in a durable service **before** calling Gateway; enforce session maximum, one paid attempt, spend/day cap, no paid retry on ambiguous failure, plus provider-side defensive budget. A permanent multi-desk billing service can follow, but **at-most-once** live paid dispatch and enforceable bounded exposure cannot.
- Two independent stop mechanisms: prevent new job dispatch (disabled workflow or protected policy/agent switch) **and** revoke/cancel live execution/credentials. Review legacy TypingMind credentials separately; `automationEnabled=false` does not revoke them.
- **Pass:** simulated duplicate trigger cannot charge twice; paused/stale job cannot call Gateway or submit; costs and status independently recorded. **No-Go:** duplicate or unauthenticated paid calls possible.

### Gate 3 — existing newsroom delivery and editorial receipt (engineer + Central Editor)

- Confirm the actual production Worker's Federal submission API from source/current deployed interface and return schema. Authenticate only the trusted submit client. Submit **one** proposal, confirm returned UUID/key/hash/desk and that Central Editor can list/read it. Keep the full draft private in R2. Do **not** blindly retry after an unknown response; reconcile inbox first.
- Central Editor records an append-only decision in GitHub on a review branch (hold/revise/accept/reject); shareable notes only, no raw unpublished article. President remains final publication decision. Publishing uses existing World metadata, chronology, tests and protected merge/deploy.
- **Pass:** real authenticated Federal receipt visible and correct to Editor. **No-Go:** duplicate/uncertain receipt, leaked private content, or direct canon write.

### Gate 4 — authorized staffed launch (President + operator; phone possible for review)

- Record pinned work order, model, policy SHA, exact spending limit, allowed credential scope, incident contact/stop action and execution window. Obtain separate explicit authorization for any production provisioning, actual paid call, merge, deployment and agent toggle. Run **one** job, review resulting draft/receipt/usage, then park the runner.
- **P1 success:** real model call + actual reviewed-source output + exactly one correct R2 `PROPOSED` submission + verified usage + accessible Central Editor queue, with no site publication or canon change. **If any check fails, stop, reconcile and repair.**

## 5. P1 to P2: routine production

- Once the staffed pilot passes, approve a small event-driven or fixed UTC schedule for **Federal only**. Each job selects an editor-approved assignment; no task means no paid run. Start at low frequency and measure actual usefulness, charges, retries, and editor turnaround.
- Introduce explicit job states: `PLANNED -> CLAIMED -> RUNNING -> SUBMITTED -> IN_REVIEW -> (REVISION_REQUESTED | ACCEPTED | HOLD | REJECTED) -> (PUBLISHED | ARCHIVED)`; distinguish article state from compute state and do not fake publication when merely accepted.
- Maintain run ID, UTC slot, desk, source commit, model/policy revision, request attempt, token usage, cost upper bound, receipt UUID, editor decision, PR link and failure class. Log **identifiers and aggregate metrics only**. Keep the content in appropriate private inbox/GitHub-publicly-shareable places.
- Model-generated text must be checked by Central Editor for constitutional citations, World continuity, factual attribution and metadata. Website stays quiet when publication has not been approved; agents producing drafts alone do not update the site.
- Add routine operator review of failed jobs, stale work orders, duplicate-receipt reconciliations, actual provider spend, gateway key budget, and open editorial queue. Keep the global stop switch functional and test it.

## 6. Adding each new State/Territory or specialist agent

1. **Eligibility:** confirm the existing desk's qualification from current `EDITORIAL-CURRENT-STATUS.md` and its actual current approved constitution/compact. Do **not** repeat completed tests merely for onboarding. Source hierarchy: `PROJECT-SOURCES.md`; relevant Federal + local constitution, published local World and story Bible; editorial notes identified as non-canon.
2. **Workspace & registry:** add or update the exact `docs/torenthia/agents/<id>/workspace/{desk.md,notes.md}` and a disabled roster entry. Assign unique `agentId`, jurisdiction, editor-owned work-order source, exact `allowedWrites` path, cadence and capped model/budget. Preserve desk independence; identity must not be inferred from task text.
3. **Inbox registration:** bind a unique server-authenticated `inboxDesk` to a corresponding credential/ingress identity. The **current production Worker recognizes four** desks (Federal, Korda, Varek, Corindal). New agents beyond those four require a separately approved ingress/credential change; never reuse Federal or another state's key. Keep `inboxDesk:null` and `enabled:false` until server-side registration is verified.
4. **Runtime isolation:** enable one desk only in an approved window, after proving that wrong agent grants, cross-desk R2 reads, cross-desk submission, out-of-scope notes paths, stale work orders and disabled switches are all rejected. Implement desk-specific writer mappings as a separate approved step; existing Federal writer is fixed to Federal.
5. **First assignment:** one genuine published-source-grounded article or report through Gateway -> R2 -> Central Editor. Inspect actual charge, source citations, exact receipt, editorial usefulness and no fabricated official acts. Approval of a draft is not permission to publish it.
6. **Go live independently:** set a staggered UTC cadence and small per-desk/total budget, monitor two or more successful operating cycles, then consider increasing cadence. Pausing one agent must not stop others. Explicitly reconcile whether legacy TypingMind desk credentials remain usable.

**Suggested order:** Federal; then a previously qualified, already registered desk (Korda, Varek or Corindal, chosen by current editorial need), **not** automatically Corindal or any unverified Ashbridge jurisdiction; then other qualified desks after new ingress registration. A specialist such as Monitors or Partisan Media uses the same structure but stricter institutional source/attribution rules.

## 7. Post-release infrastructure backlog (do not block P1 unless prerequisite fails)

| Priority | Improvement | Why/trigger |
| --- | --- | --- |
| **P1 essentials** | Guarded credential custody, protected-policy admission, one-attempt limits, at-most-once durable claim, observable receipt and stop | Required before a real paid run |
| **P2 immediate** | Managed recurring scheduler, editor assignment queue, failure/recovery dashboard, operational alerts, charge reconciliation | After the supervised Federal run proves useful |
| **P2 immediate** | Verified Github App notes writer, immutable audit events, revised assignment loop with read-only R2 bridge | When editors need agent checkpoints/revisions without manual intervention |
| **P2 scaling** | General desk-scoped writer, new newsroom server desk registrations, per-agent quotas, concurrency and priority queues | Before activating independent state/specialist desks beyond existing scopes |
| **P3 resilience** | Automatic safe retries for *non-paid* stages, dead-letter recovery, provider fallback under shared max charge, key rotation, backup/restore drills, incident runbooks | After repeatable operations establish actual failure modes |
| **P3 governance** | Retention after `ARCHIVED` audit, privacy-preserving monitoring, attribution/provenance checks, source cache refresh on Constitution changes, branch cleanup | Continuously; don't delete unarchived R2 originals |
| **Later** | Fully autonomous editorial assignment selection or publishing | Separate policy decision; no presumption of authorization |

## 8. Working rhythm: phone first; Mac only when actually necessary

- **President:** phone review/approvals and cloud configuration whenever supported. Budget at most **one hour of Mac/Terminal per weekday**, with longer weekend access. Only ask for Terminal after verifying the action cannot be done by connected GitHub/Vercel/Cloudflare tools or web UI.
- **VP:** prepare and review branches, tests, role-scoped cloud configuration, editorial plan and checklists; perform available nonproduction reads/writes immediately; group any unavoidable local steps into **one clear command/action at a time**. Never promise background execution without a scheduled automation.
- **Central Editor:** own editorial queue and assignments, decide hold/revise/accept/reject, stage review branches and check publication candidates. Agents are independent peers.
- **Escalations:** President approves each merge, credential provisioning and production activation, any paid pilot budget, and all canon publication. Routine branch preparation and synthetic tests remain delegated. Avoid distracting the President with already-answered questions or repeat qualification work.

## 9. Operational decisions and unresolved questions

**Selected direction (proposed):** supervised Federal production first; existing Cloudflare Worker + R2; Vercel AI Gateway; GitHub protected `main`/review; Node 24 cloud manual runner before scheduler; separate durable job claim; no self-publication. Roster switches remain **OFF** in this planning PR. No changes to existing website deploy settings.

**Must be verified before implementation/prod approval:** exact deployed Worker submit endpoint and auth format; GitHub effective branch protection/App bypass actors; dedicated runner Gateway credential and provider price/routing; actual durable claim service placement and authorization; source-packet generation for the first work order; trustworthy model response usage including hidden/provider-specific tokens; hosted environment approvals; first real receipt path; live incident stop/reconciliation.

**Important distinction:** Cloudflare OAuth/security Workers and Durable Objects were found in the account, but no existing worker has been proven to be the managed agent production runner. Vercel's current website AI Gateway key is not automatically a runner credential. All #323–#330 work is still in open draft PRs. Do not overstate readiness.

## 10. Release tracker and evidence

Create a dated launch matrix at each decision using `PASS`, `FAIL`, or `NOT VERIFIED` for: PR/dependency review; protected `main` and runtime revision; source packet; scoped credentials; single live budget reservation; gateway routing/model/price; stop/cancel; inbox submit/readback; editor disposition; publication check; rollback. Include GitHub commit/Actions run, Cloudflare Worker version, Vercel model/policy, receipt UUID and actual charge when available. A critical `FAIL` or `NOT VERIFIED` means **NO-GO for that exact scope**, not a requirement to finish all later infrastructure.

**First next engineering task, after approval of this plan:** create a dedicated `workflow_dispatch` prototype for the Node24 managed runner with only fake transport, protected source admission and zero secrets; concurrently validate the *read-only* production Worker API contract. Then implement the durable claim bridge and dedicated credential setup. Return to the President with **one specific approval action** and one exact scoped run, not another unrelated PR chain.

## Source links

- [Project source hierarchy](../../PROJECT-SOURCES.md); [Operations](NEWSROOM-OPERATIONS.md); [Federal pilot](FEDERAL-MANAGED-PILOT.md); [World publishing](PUBLISHING.md).
- [November 16 launch gate](NEWSROOM-RELEASE-GATE-20261116.md); [Constitution 20 integration contract](CONSTITUTION20-GATEWAY-INTEGRATION.md).
- Draft dependency chain: [#323](https://github.com/jcr0916-hue/federatedrepublic/pull/323), [#324](https://github.com/jcr0916-hue/federatedrepublic/pull/324), [#325](https://github.com/jcr0916-hue/federatedrepublic/pull/325), [#326](https://github.com/jcr0916-hue/federatedrepublic/pull/326), [#327](https://github.com/jcr0916-hue/federatedrepublic/pull/327), [#328](https://github.com/jcr0916-hue/federatedrepublic/pull/328), [#329](https://github.com/jcr0916-hue/federatedrepublic/pull/329), [#330](https://github.com/jcr0916-hue/federatedrepublic/pull/330).
