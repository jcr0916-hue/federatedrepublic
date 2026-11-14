import { createHash } from "node:crypto";
import { isDeepStrictEqual } from "node:util";
import { check, checkFields, isGitSha, isText, utcDate } from "./roster.mjs";

export const LEDGER_DIR = "docs/torenthia/editorial/inbox-ledger";
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/;
const kinds = ["pitch", "article", "nrs-proposal", "report", "character", "design", "other"];
const dispositions = ["UNDER_REVIEW", "REVISION_REQUESTED", "ASSIGN", "ACCEPTED", "WATCH", "HOLD", "ARCHIVED", "REJECTED"];
const receiptFields = ["schemaVersion", "id", "key", "desk", "kind", "title", "summary", "body",
  "sourceRefs", "submittedAt", "status", "nonCanonical"];
const entryFields = ["schemaVersion", "id", "key", "agentId", "submittedAt", "kind", "receiptSha256"];

function isUuid(value) {
  return typeof value === "string" && uuid.test(value);
}

function checkReceiptIdentity({ id, key, submittedAt, kind }, inboxDesk) {
  check(isUuid(id), "Invalid R2 submission id");
  const date = utcDate(submittedAt);
  check(inboxDesk !== null && key === `submissions/${inboxDesk}/${date.toISOString().slice(0, 10)}/${id}.json`,
    "R2 submission key does not match the desk, date and id");
  check(kinds.includes(kind), "Unsupported R2 submission kind");
  return date;
}

function readReceipt(roster, receipt) {
  checkFields(receipt, receiptFields, [], "R2 receipt");
  check(receipt.schemaVersion === 1 && receipt.status === "PROPOSED" && receipt.nonCanonical === true,
    "Use the original version 1 noncanonical R2 object");
  const agent = roster.agents.find(({ inboxDesk }) => inboxDesk !== null && inboxDesk === receipt.desk);
  check(agent, "R2 desk has no registered agent");
  checkReceiptIdentity(receipt, agent.inboxDesk);
  // The existing Worker truncates strings by code unit. Hash the decoded object as delivered.
  const fits = (value, max) => typeof value === "string" && value.length <= max;
  check(fits(receipt.title, 180) && receipt.title.length > 0 && fits(receipt.body, 40_000) && receipt.body.length > 0
    && fits(receipt.summary, 600),
    "R2 receipt has invalid text");
  check(Array.isArray(receipt.sourceRefs) && receipt.sourceRefs.length <= 15
    && receipt.sourceRefs.every((ref) => fits(ref, 400)), "R2 receipt has invalid source references");

  const canonical = Object.fromEntries(receiptFields.map((field) => [field, receipt[field]]));
  return {
    schemaVersion: 1, id: receipt.id, key: receipt.key, agentId: agent.id,
    submittedAt: receipt.submittedAt, kind: receipt.kind,
    receiptSha256: createHash("sha256").update(JSON.stringify(canonical)).digest("hex"),
  };
}

function checkDecision(roster, decision, previous, submittedAt) {
  checkFields(decision, ["id", "previousId", "recordedAt", "editor", "disposition", "note"],
    ["followUp", "relatedReceiptId", "publication", "archive"], "Editorial decision");
  check(isUuid(decision.id) && decision.previousId === (previous?.id ?? null), "Invalid or stale decision sequence");
  check(utcDate(decision.recordedAt) >= (previous ? utcDate(previous.recordedAt) : submittedAt),
    "Decision time must follow receipt and earlier decisions");
  check(typeof decision.editor === "string" && /^[a-z0-9][a-z0-9-]{0,38}$/i.test(decision.editor),
    "Editor must be a GitHub login");
  check(dispositions.includes(decision.disposition) && isText(decision.note, 2_000), "A disposition and editor note are required");
  if (Object.hasOwn(decision, "followUp")) {
    checkFields(decision.followUp, ["agentId", "task"], [], "Follow-up");
    check(roster.agents.some(({ id }) => id === decision.followUp.agentId) && isText(decision.followUp.task, 1_000),
      "Follow-up needs a roster agent and a task");
  }
  if (Object.hasOwn(decision, "relatedReceiptId")) {
    check(isUuid(decision.relatedReceiptId), "Invalid related R2 submission id");
  }
  if (Object.hasOwn(decision, "publication")) {
    checkFields(decision.publication, ["pullRequest"], ["mergeCommit", "url"], "Publication reference");
    const { pullRequest, mergeCommit, url } = decision.publication;
    check(Number.isSafeInteger(pullRequest) && pullRequest > 0, "Invalid publication PR number");
    if (Object.hasOwn(decision.publication, "mergeCommit") || Object.hasOwn(decision.publication, "url")) {
      check(isGitSha(mergeCommit) && typeof url === "string"
        && /^https:\/\/thefederatedrepublic\.org\/[a-z0-9-]+\.html$/.test(url),
      "A published reference needs the merge commit and the live record URL");
    }
  }
  if (Object.hasOwn(decision, "archive")) {
    check(decision.disposition === "ARCHIVED", "An archive reference belongs on an ARCHIVED decision");
    checkFields(decision.archive, ["repository", "commit", "path"], [], "Archive reference");
    const { repository, commit, path } = decision.archive;
    check(typeof repository === "string" && /^[\w-]+\/[\w-][\w.-]*$/.test(repository) && isGitSha(commit)
      && typeof path === "string" && /^(?:[\w-][\w.-]*\/)*[\w-][\w.-]*\.json$/.test(path),
    "Archive reference needs a GitHub repository, commit and JSON path");
  }
}

export function validateEntry(roster, entry, fileName) {
  checkFields(entry, [...entryFields, "decisions"], [], "Ledger entry");
  check(entry.schemaVersion === 1 && typeof entry.receiptSha256 === "string"
    && /^[a-f0-9]{64}$/.test(entry.receiptSha256), "Invalid ledger version or receipt hash");
  check(fileName === `${entry.id}.json`, "Ledger filename must match the R2 submission id");
  const agent = roster.agents.find(({ id }) => id === entry.agentId);
  check(agent, "Ledger entry has an unregistered agent");
  const submittedAt = checkReceiptIdentity(entry, agent.inboxDesk);
  check(Array.isArray(entry.decisions), "Ledger entry needs a decisions array");
  const ids = new Set();
  let previous;
  for (const decision of entry.decisions) {
    checkDecision(roster, decision, previous, submittedAt);
    check(!ids.has(decision.id), "Duplicate editorial decision id");
    check(decision.relatedReceiptId !== entry.id, "A receipt cannot reference itself");
    ids.add(decision.id);
    previous = decision;
  }
}

export function checkAppendOnly(before, after) {
  check(after, "Keep the existing ledger entry");
  check(entryFields.every((field) => before[field] === after[field]), "Ledger receipt metadata is immutable");
  check(before.decisions.every((decision, index) => isDeepStrictEqual(decision, after.decisions[index])),
    "Preserve existing ledger decisions and append new events");
}

export function appendDecision(roster, entry, decision) {
  const fileName = `${entry.id}.json`;
  validateEntry(roster, entry, fileName);
  const path = `${LEDGER_DIR}/${fileName}`;
  const existing = entry.decisions.find(({ id }) => id === decision?.id);
  if (existing) {
    check(isDeepStrictEqual(existing, decision), "Editorial decision id already has different content");
    return { path, entry, changed: false };
  }
  const updated = { ...entry, decisions: [...entry.decisions, decision] };
  validateEntry(roster, updated, fileName);
  return { path, entry: updated, changed: true };
}

export function ledgerPath(id) {
  check(isUuid(id), "Invalid R2 submission id");
  return `${LEDGER_DIR}/${id}.json`;
}

export function prepareLedgerChange(roster, receipt, before, decision) {
  const source = readReceipt(roster, receipt);
  const fileName = `${source.id}.json`;
  if (before) {
    validateEntry(roster, before, fileName);
    checkAppendOnly(before, { ...source, decisions: before.decisions });
  }
  const entry = before ?? { ...source, decisions: [] };
  if (decision !== undefined) return appendDecision(roster, entry, decision);
  return { path: ledgerPath(entry.id), entry, changed: !before };
}
