import { createHash, verify } from "node:crypto";
import { isUuid, ledgerPath, prepareLedgerChange, validateEntry } from "./ledger.mjs";
import {
  authorizeSubmission, check, checkFields, isGitSha, isInteger, prepareNoteChange, ROSTER_PATH, validateRoster,
} from "./roster.mjs";

export const FEDERAL_JOB_AUDIENCE = "jcr0916-hue/federatedrepublic:managed-federal:v1";
const jobFields = [
  "audience", "agentId", "issuedAt", "expiresAt", "policyHead", "expectedHead", "pullRequest", "receiptId", "decisionId",
];
const maxJobSeconds = 300;
const maxNotesBytes = 16_384;

function readJson(text, label) {
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Invalid ${label} JSON`);
  }
}

function checkJobTime(job, now) {
  const seconds = Math.floor(now() / 1000);
  check(isInteger(job.issuedAt, 0, seconds)
    && isInteger(job.expiresAt, seconds + 1, job.issuedAt + maxJobSeconds), "Federal job grant is expired or mistimed");
}

function verifyJob(grant, key, now) {
  check(typeof grant === "string" && grant.length <= 2048 && /^[\w-]+\.[\w-]{86}$/.test(grant),
    "A signed Federal job grant is required");
  const [encoded, signature] = grant.split(".");
  check(verify(null, Buffer.from(encoded, "ascii"), key, Buffer.from(signature, "base64url")),
    "Invalid Federal job signature");
  const job = readJson(Buffer.from(encoded, "base64url").toString("utf8"), "job grant");
  checkFields(job, jobFields, [], "Federal job grant");
  check(job.audience === FEDERAL_JOB_AUDIENCE && job.agentId === "federal",
    "The Federal pilot requires an authenticated Federal job");
  check(isGitSha(job.policyHead) && isGitSha(job.expectedHead) && job.policyHead !== job.expectedHead
    && isInteger(job.pullRequest, 1) && isUuid(job.receiptId) && isUuid(job.decisionId),
    "Federal job grant has invalid review pins");
  checkJobTime(job, now);
  return job;
}

function noteCommitMessage(job, content) {
  const scope = [job.audience, job.agentId, job.policyHead, job.expectedHead, job.pullRequest,
    job.receiptId, job.decisionId];
  const digest = createHash("sha256").update(JSON.stringify(scope)).update("\0").update(content).digest("hex");
  return { headline: "Update Federal workspace notes", body: `Managed Federal job: ${digest}` };
}

// The trusted runner owns this factory and the job grant. The model gets only assignment data.
export function createManagedFederalPilot({ github, inbox, jobPublicKey, now = Date.now }) {
  check(jobPublicKey?.type === "public" && jobPublicKey.asymmetricKeyType === "ed25519",
    "An Ed25519 public key is required for Federal job grants");

  async function confirmPolicy(job) {
    checkJobTime(job, now);
    check(await github.readProtectedHead() === job.policyHead, "Protected roster changed. Obtain a new job grant");
    checkJobTime(job, now);
  }

  return async function openFederalJob(grant) {
    const job = verifyJob(grant, jobPublicKey, now);
    await confirmPolicy(job);
    const roster = validateRoster(readJson(await github.readFile(job.policyHead, ROSTER_PATH, 32_768), "roster"));
    check(authorizeSubmission(roster, job.agentId) === "federal", "Federal inbox identity is required");

    const path = ledgerPath(job.receiptId);
    const entry = readJson(await github.readFile(job.policyHead, path, 65_536), "ledger");
    validateEntry(roster, entry, `${job.receiptId}.json`);
    const decision = entry.decisions.at(-1);
    check(entry.agentId === job.agentId && decision?.id === job.decisionId
      && decision.disposition === "REVISION_REQUESTED" && decision.followUp?.agentId === job.agentId,
    "No current, reviewed Federal revision assignment matches this job");

    await confirmPolicy(job);
    prepareLedgerChange(roster, await inbox.readReceipt(entry.key), entry);
    await confirmPolicy(job);

    const assignment = Object.freeze({ receiptId: entry.id, decisionId: decision.id, task: decision.followUp.task });

    async function saveNotes(request) {
      const change = prepareNoteChange(roster, job.agentId, job.expectedHead, request);
      const message = noteCommitMessage(job, change.content);
      await confirmPolicy(job);

      const head = await github.readDraftHead(job.pullRequest, job.policyHead);
      await github.checkNotesDiff(job.policyHead, head);
      const base = await github.readFile(job.policyHead, change.path, maxNotesBytes);
      const current = await github.readFile(head, change.path, maxNotesBytes);
      check(change.content !== base, "The Federal note must leave a change for review");

      async function confirmDraft(expected) {
        check(await github.readDraftHead(job.pullRequest, job.policyHead) === expected, "Federal draft head changed");
        await confirmPolicy(job);
      }

      if (head !== change.expectedHead) {
        check(current === change.content && await github.isNoteCommit(head, change.expectedHead, message),
          "Federal draft head changed. Reconcile before retrying");
        await confirmDraft(head);
        return { status: "already-applied", head };
      }
      if (current === change.content) {
        await confirmDraft(head);
        return { status: "unchanged", head };
      }

      await confirmDraft(head);
      const updatedHead = await github.commitNote(change, message);
      await github.checkNotesDiff(job.policyHead, updatedHead);
      check(await github.isNoteCommit(updatedHead, head, message)
        && await github.readFile(updatedHead, change.path, maxNotesBytes) === change.content,
      "Federal note commit could not be verified. Reconcile the draft");
      await confirmDraft(updatedHead);
      return { status: "committed", head: updatedHead };
    }

    return Object.freeze({ assignment, saveNotes });
  };
}
