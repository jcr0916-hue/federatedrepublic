// Desk-agnostic, READ-ONLY preparation for a future managed newsroom runner.
// No model calls, notes commits, submissions, or credential provisioning.
import { verify } from "node:crypto";
import { check, checkFields, isGitSha, isInteger, validateRoster, authorizeSubmission, ROSTER_PATH } from "./roster.mjs";
import { isUuid, ledgerPath, validateEntry, prepareLedgerChange } from "./ledger.mjs";

export const MANAGED_DESK_AUDIENCE = "jcr0916-hue/federatedrepublic:managed-desk-read:v1";
const fields = [
  "audience", "agentId", "issuedAt", "expiresAt", "policyHead", "receiptId", "decisionId",
];
const maxJsonBytes = 65_536;

function parseJson(text) {
  check(typeof text === "string" && Buffer.byteLength(text, "utf8") <= maxJsonBytes,
    "Verified GitHub file exceeds read-only boundary");
  try { return JSON.parse(text); }
  catch { throw new Error("Invalid verified JSON"); }
}

function checkGrant(grant, publicKey, now) {
  check(typeof grant === "string" && grant.length <= 2048 && /^[\w-]+\.[\w-]{86}$/.test(grant),
    "Signed desk grant required");
  const [encoded, signature] = grant.split(".");
  check(verify(null, Buffer.from(encoded, "ascii"), publicKey, Buffer.from(signature, "base64url")),
    "Invalid desk grant signature");
  const claims = parseJson(Buffer.from(encoded, "base64url").toString("utf8"));
  checkFields(claims, fields, [], "Desk grant");
  const seconds = Math.floor(now() / 1000);
  check(claims.audience === MANAGED_DESK_AUDIENCE
    && typeof claims.agentId === "string" && /^[a-z][a-z0-9-]{0,29}$/.test(claims.agentId)
    && isGitSha(claims.policyHead) && isUuid(claims.receiptId) && isUuid(claims.decisionId),
    "Desk grant identity or pins invalid");
  check(isInteger(claims.issuedAt, 0, seconds)
    && isInteger(claims.expiresAt, seconds + 1, claims.issuedAt + 300),
    "Desk grant expired or mistimed");
  return claims;
}

// This is a read-only adapter; inject a protected-branch GitHub client and an
// R2 object bridge. Neither client is passed to any agent/model.
export function createManagedDeskReader({ github, readReceipt, jobPublicKey, now = Date.now }) {
  check(github && typeof github.readProtectedHead === "function"
    && typeof github.readFile === "function" && typeof readReceipt === "function",
    "Trusted read-only GitHub and inbox clients required");
  check(jobPublicKey?.type === "public" && jobPublicKey.asymmetricKeyType === "ed25519",
    "Ed25519 public grant verification key required");

  return async function openDeskJob(grant) {
    const job = checkGrant(grant, jobPublicKey, now);
    const confirm = async () => {
      check(Math.floor(now() / 1000) < job.expiresAt, "Desk grant expired during read");
      check(await github.readProtectedHead() === job.policyHead,
        "Protected roster changed; obtain a new desk grant");
    };
    await confirm();
    const roster = validateRoster(parseJson(await github.readFile(job.policyHead, ROSTER_PATH, 32_768)));
    const desk = authorizeSubmission(roster, job.agentId);
    const entry = parseJson(await github.readFile(job.policyHead, ledgerPath(job.receiptId), maxJsonBytes));
    validateEntry(roster, entry, `${job.receiptId}.json`);
    const decision = entry.decisions.at(-1);
    check(entry.agentId === job.agentId && decision?.id === job.decisionId
      && decision.disposition === "REVISION_REQUESTED"
      && decision.followUp?.agentId === job.agentId,
      "No current reviewed assignment for authenticated desk");
    check(entry.key.startsWith(`submissions/${desk}/`),
      "Receipt key does not match authenticated desk");
    await confirm();
    const original = await readReceipt(entry.key, desk);
    // Proves immutable original receipt (key, UUID, desk and hash). Never return
    // the private object to the model; only editor-reviewed task and IDs.
    prepareLedgerChange(roster, original, entry);
    await confirm();
    return Object.freeze({
      agentId: job.agentId,
      assignment: Object.freeze({
        receiptId: entry.id, decisionId: decision.id, task: decision.followUp.task,
      }),
    });
  };
}
