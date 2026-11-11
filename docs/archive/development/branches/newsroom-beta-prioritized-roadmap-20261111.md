# Branch handoff — newsroom-beta-prioritized-roadmap-20261111

- **Branch:** `feature/newsroom-beta-prioritized-roadmap-20261111`
- **Purpose:** Establish a single noncanonical, dependency-aware editorial infrastructure roadmap, with the direct ChatGPT-to-live Editor connector mismatch as the top blocker.
- **Changes:** `docs/torenthia/newsroom/INFRASTRUCTURE-ROADMAP.md` (priorities, prerequisites, acceptance criteria, live-beta evidence limits, owner/stages, change control).
- **Experiments/tests:** Documentation-only; read existing `AGENTS.md` and repository editorial status. No credential access, live connector reconfiguration, integration test, Cloudflare deployment, canonical publication, or production change performed.
- **Decisions:** Preserve supervised four-desk beta; prefer repairing the current connector rather than designing a new authentication system; GitHub agent mailboxes depend on verified branch accessibility; scheduling depends on proven message delivery; context auto-clear depends on verified checkpoint recovery.
- **Unresolved:** Exact live connector URL/audience/identity mismatch, Editor write access via this ChatGPT connection, branch-read ability from TypingMind agents, scheduler execution environment, live budget observability.
- **Relationship:** Existing independent editorial PR #316 and draft infrastructure dependency chain #304–#319 remain unchanged; staged publication PR #320 remains separate.
- **Disposition:** DRAFT proposal only; no merge or branch cleanup authorized. Retain branch until PR reviewed; apply AGENTS.md branch-preservation rules.
- **Historical note:** Mac-local real four-agent acceptance was *reported by Work*; do not confuse this with independently verified ChatGPT live Editor access.
