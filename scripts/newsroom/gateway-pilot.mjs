// Offline-first, single-attempt contract for a future managed Vercel AI Gateway pilot.
// Not wired to any production dispatcher, scheduler or credentials.
import { check, isInteger } from "./roster.mjs";

const endpoint = "https://ai-gateway.vercel.sh/v1/chat/completions";
const roles = new Set(["system", "user", "assistant"]);

function safeMessages(messages) {
  check(Array.isArray(messages) && messages.length > 0 && messages.length <= 12, "Invalid bounded messages");
  for (const message of messages) {
    check(message && Object.keys(message).sort().join(",") === "content,role"
      && roles.has(message.role) && typeof message.content === "string"
      && message.content.length > 0 && message.content.length <= 32_768,
    "Invalid message role or content");
  }
  const bytes = Buffer.byteLength(JSON.stringify(messages), "utf8");
  // Every byte is an upper bound on UTF-8 tokenized content, plus generous framing allowance.
  return { messages, inputUpperBound: bytes + 256 * messages.length };
}

function centsCeiling(inputTokens, outputTokens, pricing) {
  return Math.ceil((inputTokens * pricing.inputCentsPerMillion
    + outputTokens * pricing.outputCentsPerMillion) / 1_000_000);
}

function configCheck({ modelId, pricing, limits, policyRevision }) {
  check(typeof modelId === "string" && /^[a-zA-Z0-9][a-zA-Z0-9._:/-]{2,127}$/.test(modelId),
    "Explicit approved model ID required");
  check(typeof policyRevision === "string" && /^[a-f0-9]{40}$/.test(policyRevision),
    "Immutable model policy revision required");
  check(pricing && Number.isSafeInteger(pricing.inputCentsPerMillion) && pricing.inputCentsPerMillion > 0
    && Number.isSafeInteger(pricing.outputCentsPerMillion) && pricing.outputCentsPerMillion > 0,
  "Verified positive model pricing required");
  check(limits && isInteger(limits.maxInputTokens, 1, 16000)
    && isInteger(limits.maxOutputTokens, 1, 4096)
    && isInteger(limits.maxCostCents, 1, 100)
    && isInteger(limits.maxSeconds, 1, 120)
    && limits.maxCalls === 1,
  "Single-attempt pilot requires strict per-call limits");
}

// The caller must supply protected-policy authorization and atomic durable reservation.
// The adapter owns neither credentials nor a persistent state store.
export function createGatewayPilot({ transport, authorize, reserve, token, modelId, pricing, limits, policyRevision }) {
  check(typeof transport === "function" && typeof authorize === "function" && typeof reserve === "function",
    "Trusted transport, live authorization and durable reservation required");
  check(typeof token === "string" && token.length >= 16, "Server-side Gateway token required");
  configCheck({ modelId, pricing, limits, policyRevision });

  return async function invoke({ jobId, messages }) {
    check(typeof jobId === "string" && /^[a-zA-Z0-9/_:-]{8,160}$/.test(jobId), "Stable job ID required");
    const packet = safeMessages(messages);
    check(packet.inputUpperBound <= limits.maxInputTokens, "Input exceeds token reservation bound");
    const worstCents = centsCeiling(packet.inputUpperBound, limits.maxOutputTokens, pricing);
    check(worstCents <= limits.maxCostCents, "Worst-case model cost exceeds job ceiling");
    check(await authorize({ jobId, policyRevision, modelId }) === true, "Managed job is not authorized");
    // Reserve must atomically claim the job and its worst-case budget, declining duplicates.
    check(await reserve({ jobId, policyRevision, worstCents, maxCalls: 1 }) === true,
      "Job budget not reserved or job already claimed");
    check(await authorize({ jobId, policyRevision, modelId }) === true, "Managed job paused before invocation");

    let response;
    try {
      response = await transport(endpoint, {
        method: "POST",
        headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
        body: JSON.stringify({ model: modelId, messages: packet.messages, max_completion_tokens: limits.maxOutputTokens }),
        signal: AbortSignal.timeout(limits.maxSeconds * 1000),
      });
    } catch {
      throw new Error("Gateway transport failed; reconcile before any new request");
    }
    check(response && typeof response.status === "number", "Gateway transport returned invalid response");
    if (response.status === 402) throw new Error("Gateway budget exhausted; do not retry");
    if (response.status === 429) throw new Error("Gateway rate limited; do not retry automatically");
    check(response.status === 200, "Gateway request failed; reconcile before retrying");
    let data;
    try { data = await response.json(); }
    catch { throw new Error("Gateway response cannot be validated"); }
    const usage = data?.usage;
    const content = data?.choices?.[0]?.message?.content;
    check(isInteger(usage?.prompt_tokens, 0, limits.maxInputTokens)
      && isInteger(usage?.completion_tokens, 0, limits.maxOutputTokens)
      && typeof content === "string" && content.length > 0,
    "Gateway result or usage is missing or exceeds ceiling");
    const calculatedCents = centsCeiling(usage.prompt_tokens, usage.completion_tokens, pricing);
    check(calculatedCents <= worstCents && calculatedCents <= limits.maxCostCents,
      "Gateway reported usage exceeds reserved budget");
    return Object.freeze({
      content,
      usage: { inputTokens: usage.prompt_tokens, outputTokens: usage.completion_tokens },
      billingCeilingCents: worstCents,
      meteredCostCeilingCents: calculatedCents,
      modelId, policyRevision, jobId,
    });
  };
}
