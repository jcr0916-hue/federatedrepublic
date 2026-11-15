// Supervised model drafting coordinator. Returns a proposal to a human editor.
// Does not expose GitHub/R2 clients, commit notes, submit to inbox, or publish canon.
import { createHash } from "node:crypto";
import { check, isGitSha } from "./roster.mjs";

function evidenceBundle(bundle) {
  check(bundle && typeof bundle === "object" && !Array.isArray(bundle)
    && Object.keys(bundle).sort().join(",") === "policyHead,sources",
  "An explicitly approved, pinned evidence packet is required");
  check(isGitSha(bundle.policyHead) && Array.isArray(bundle.sources)
    && bundle.sources.length > 0 && bundle.sources.length <= 8,
  "Evidence packet must have an immutable source revision and bounded sources");
  const ids = new Set();
  for (const source of bundle.sources) {
    check(source && Object.keys(source).sort().join(",") === "id,text",
      "Evidence must contain only source ID and reviewed excerpt");
    check(typeof source.id === "string" && /^[a-zA-Z0-9._/-]{1,120}$/.test(source.id)
      && !ids.has(source.id), "Evidence source IDs must be unique");
    ids.add(source.id);
    check(typeof source.text === "string" && source.text.trim().length > 0
      && Buffer.byteLength(source.text, "utf8") <= 8192,
    "Evidence excerpt must be bounded and nonempty");
  }
  return Object.freeze({
    policyHead: bundle.policyHead,
    sources: bundle.sources.map(s => Object.freeze({ id: s.id, text: s.text })),
  });
}

// No auto-submission; output is always a *proposal*.
export function createSupervisedDraft({ openDeskJob, invokeGateway }) {
  check(typeof openDeskJob === "function" && typeof invokeGateway === "function",
    "Verified desk reader and controlled Gateway adapter are required");

  return async function draft({ grant, jobId, packet }) {
    const job = await openDeskJob(grant);
    check(job && typeof job.agentId === "string" && job.assignment
      && typeof job.assignment.task === "string"
      && job.assignment.task.trim() && typeof job.assignment.receiptId === "string"
      && typeof job.assignment.decisionId === "string",
    "Verified reviewed editorial assignment required");
    check(typeof jobId === "string" && jobId.startsWith(`${job.agentId}/`),
      "Model job must belong to the verified desk");
    const evidence = evidenceBundle(packet);
    // Caller still enforces the live protected-head check before model use.
    // An injected fake transport must make zero external calls for offline trials.
    const evidenceDigest = createHash("sha256")
      .update(JSON.stringify(evidence)).digest("hex");
    const messages = [
      { role: "system", content: [
        "You are a Torenthia newsroom drafting assistant.",
        "Produce only a PROPOSED revision for human Central Editor review.",
        "Use only the provided source excerpts; cite their IDs for all factual claims.",
        "If material support is missing, explicitly say NOT ESTABLISHED.",
        "Do not invent law, officers, people, events, motivations or canonical history.",
        "You cannot publish, alter GitHub/R2, or grant yourself permissions.",
      ].join(" ") },
      { role: "user", content: JSON.stringify({
        task: job.assignment.task,
        receiptId: job.assignment.receiptId,
        decisionId: job.assignment.decisionId,
        sources: evidence.sources,
      }) },
    ];
    const result = await invokeGateway({ jobId, messages });
    check(result && typeof result.content === "string" && result.content.trim().length > 0,
      "Gateway produced no reviewable draft");
    return Object.freeze({
      status: "PROPOSED",
      agentId: job.agentId,
      receiptId: job.assignment.receiptId,
      decisionId: job.assignment.decisionId,
      sourcePolicyHead: evidence.policyHead,
      sourcePacketSha256: evidenceDigest,
      draftText: result.content,
      usage: result.usage,
      modelId: result.modelId,
      jobId,
    });
  };
}
