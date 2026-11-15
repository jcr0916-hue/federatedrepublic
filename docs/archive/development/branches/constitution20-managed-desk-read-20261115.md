# Constitution 20 — Read-only managed desk admission handoff

- **Branch:** `feature/constitution20-managed-desk-read-20261115`. Based on draft #328 (stacked on #327 → #326 → #325 → #324 → #323).
- **Purpose:** move toward safe multiple desks without modifying the existing Federal writing pipeline.
- **Files:** `scripts/newsroom/managed-desk-read.mjs`, `scripts/newsroom/managed-desk-read.test.mjs`, \`docs/torenthia/NEWSROOM-RELEASE-GATE-20261116.md\`, and this handoff.
- **Proposed behavior:** Ed25519 grant verification with strict versioned audience, desk identity, 5-minute-or-shorter expiry, protected policy-head pin, receipt and decision UUID pins; protected roster checks; exact desk-bound ledger, original receipt integrity, and latest `REVISION_REQUESTED` assignment; model receives only public reviewed assignment and IDs.
- **Experimental tests:** Korda/Corindal scope, cross-desk denial, forgery, switches, policy movement, altered ledger/receipt, expiry. Synthetic only, with all network dependencies injected.
- **Verification:** test execution not yet established in this handoff. GitHub newsroom check will be reviewed. No claim of production correctness.
- **Safety and rejected approaches:** no generic writer, OAuth changes, model call, R2 write, GitHub write, canon, publishing, merge or deployment. No widening existing Federal grant.
- **Release decision:** the November 16 gate document marks unattended launch NO-GO until permissions, actual model costs, durable store, and end-to-end proof are verified. Staffed Federal pilot remains a separately approved possibility.\n- **Unresolved:** generic notes writer and reviewed PR staging, durable budget implementation, agent source-packet builder and Ashbridge jurisdiction verification, real grant issuer, production credential and signed model policy, test and monitoring evidence.
- **Disposition:** retain while PR and bases open; later approved merge is separate from branch retirement, which follows `AGENTS.md`.
