import assert from "node:assert/strict";
import test from "node:test";
import { generateKeyPairSync, sign } from "node:crypto";
import { createManagedDeskReader, MANAGED_DESK_AUDIENCE } from "./managed-desk-read.mjs";
import { ledgerPath, prepareLedgerChange } from "./ledger.mjs";
import { ROSTER_PATH } from "./roster.mjs";

const policyHead = "a".repeat(40);
const now = Date.parse("2026-11-15T20:00:00Z");
const issuedAt = now / 1000;
const receiptId = "10000000-0000-4000-8000-000000000001";
const decisionId = "20000000-0000-4000-8000-000000000001";
const { publicKey, privateKey } = generateKeyPairSync("ed25519");

function fixture(id = "korda") {
  const state = { reads: [], changed: false, now };
  const roster = {
    schemaVersion: 1, automationEnabled: true,
    dispatchLimits: { maxAgentsPerSlot: 1, maxCostCentsPerSlot: 5 },
    agents: ["federal", "korda", "varek", "corindal"].map((agent, i) => ({
      id: agent, jurisdiction: agent,
      inboxDesk: agent, workspacePath: `docs/torenthia/agents/${agent}/workspace`,
      allowedWrites: [`docs/torenthia/agents/${agent}/workspace/notes.md`],
      enabled: agent === id, cadence: { dayUtc: ["mon", "tue", "wed", "thu"][i], hourUtc: 16 },
      model: { providerRef: "litellm", aliasRefs: ["LITELLM_FLASH_MODEL"] },
      budget: { maxCalls: 2, maxInputTokens: 16000, maxOutputTokens: 4096, maxSeconds: 120, maxCostCents: 5 },
    })),
  };
  const receipt = {
    schemaVersion: 1, id: receiptId,
    key: `submissions/${id}/2026-11-15/${receiptId}.json`,
    desk: id, kind: "report", title: "Synthetic private heading", summary: "Fixture",
    body: "Private synthetic content", sourceRefs: [], submittedAt: "2026-11-15T19:00:00Z",
    status: "PROPOSED", nonCanonical: true,
  };
  const decision = {
    id: decisionId, previousId: null, recordedAt: "2026-11-15T19:01:00Z",
    editor: "fixture-editor", disposition: "REVISION_REQUESTED",
    note: "Synthetic editorial decision", followUp: { agentId: id, task: "Verify the reviewed public citation." },
  };
  const entry = prepareLedgerChange(roster, receipt, undefined, decision).entry;
  const claims = {
    audience: MANAGED_DESK_AUDIENCE, agentId: id, issuedAt, expiresAt: issuedAt + 120,
    policyHead, receiptId, decisionId,
  };
  const github = {
    readProtectedHead: async () => state.changed ? "b".repeat(40) : policyHead,
    readFile: async (commit, path) => {
      assert.equal(commit, policyHead);
      if (path === ROSTER_PATH) return JSON.stringify(roster);
      assert.equal(path, ledgerPath(receiptId));
      return JSON.stringify(entry);
    },
  };
  const readReceipt = async (key, desk) => {
    state.reads.push([key, desk]);
    return receipt;
  };
  const reader = createManagedDeskReader({ github, readReceipt, jobPublicKey: publicKey, now: () => state.now });
  const grant = (updates = {}) => {
    const encoded = Buffer.from(JSON.stringify({ ...claims, ...updates })).toString("base64url");
    return `${encoded}.${sign(null, Buffer.from(encoded, "ascii"), privateKey).toString("base64url")}`;
  };
  return { state, roster, receipt, entry, decision, readReceipt, reader, grant };
}

test("Korda and Corindal independently receive only reviewed public tasks", async () => {
  for (const agentId of ["korda", "corindal"]) {
    const { reader, grant, state, receipt } = fixture(agentId);
    const opened = await reader(grant());
    assert.deepEqual(opened, { agentId, assignment: {
      receiptId, decisionId, task: "Verify the reviewed public citation.",
    } });
    assert.deepEqual(state.reads, [[receipt.key, agentId]]);
    assert.ok(!JSON.stringify(opened).includes("Private synthetic"));
  }
});

test("refuses cross-desk grants, forged grant, disabled switch and stale policy", async () => {
  const { reader, grant, roster, state } = fixture();
  await assert.rejects(reader(grant({ agentId: "federal" })), /No current reviewed assignment|disabled or unregistered/);
  const signed = grant();
  const [encoded, signature] = signed.split(".");
  const forged = Buffer.from(JSON.stringify({ wrong: 1 })).toString("base64url");
  await assert.rejects(reader(`${forged}.${signature}`), /Invalid desk grant signature/);
  roster.automationEnabled = false;
  await assert.rejects(reader(grant()), /automation is off/);
  roster.automationEnabled = true;
  state.changed = true;
  await assert.rejects(reader(grant()), /Protected roster changed/);
  assert.equal(state.reads.length, 0);
});

test("rejects altered or stale editorial decisions and receipt body", async () => {
  const { reader, grant, entry, receipt, state } = fixture();
  entry.decisions[0].disposition = "HOLD";
  await assert.rejects(reader(grant()), /No current reviewed assignment/);
  entry.decisions[0].disposition = "REVISION_REQUESTED";
  receipt.body = "Tampered private body";
  await assert.rejects(reader(grant()), /receipt metadata is immutable/);
  assert.equal(state.reads.length, 1);
});

test("expired grants and protected policy change during receipt read fail closed", async () => {
  const { reader, grant, state, receipt } = fixture();
  await assert.rejects(reader(grant({ expiresAt: issuedAt })), /expired or mistimed/);
  const github = {
    readProtectedHead: async () => state.changed ? "b".repeat(40) : policyHead,
    readFile: async (commit, path) => {
      const { roster, entry } = fixture();
      return JSON.stringify(path === ROSTER_PATH ? roster : entry);
    },
  };
  const changingReader = createManagedDeskReader({
    github, readReceipt: async () => { state.changed = true; return receipt; },
    jobPublicKey: publicKey, now: () => now,
  });
  await assert.rejects(changingReader(grant()), /Protected roster changed/);
});
