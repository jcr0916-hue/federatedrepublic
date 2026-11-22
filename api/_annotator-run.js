// Shared annotation runner: stored-annotation lookup and live generation.
// Stored annotations (annotations.json) are written ahead of time and served
// without a model call. An entry is used only while its hash matches the hash of
// the provision's current source packet, so a change to the provision, its
// related provisions, its recorded history, or the packet logic makes the entry
// stale and sends that provision back through live generation until it is
// regenerated.

const crypto = require('node:crypto');
const { anthropicMessage } = require('./_ai-transport.js');
const {
  buildContextPacket,
  buildAnnotationUserPrompt,
  annotationContractIssues,
  SYSTEM,
} = require('./_annotator-core.js');
const { usageTotals, annotatorMetric } = require('./_ai-metrics.js');

const DEFAULT_MODEL = process.env.AI_MODEL_ANNOTATE || 'anthropic/claude-sonnet-5';

let cachedStore = null;
let storeOverride = null;

function packetHash(context) {
  return crypto.createHash('sha256').update(context.packet).digest('hex').slice(0, 16);
}

function loadStore() {
  if (storeOverride) return storeOverride;
  if (cachedStore) return cachedStore;
  try {
    cachedStore = require('../annotations.json');
  } catch (_) {
    cachedStore = { entries: {} };
  }
  return cachedStore;
}

// Tests inject a store; pass null to restore the file-backed one.
function setStoreForTests(store) {
  storeOverride = store;
}

function storedEnabled() {
  return String(process.env.ANNOTATE_STORED || 'on').toLowerCase() !== 'off';
}

function lookupStored(num, context, store = loadStore()) {
  if (!storedEnabled()) return null;
  const entry = (store.entries || {})[num];
  if (!entry || !entry.text || entry.hash !== packetHash(context)) return null;
  return entry;
}

function textOf(data) {
  return (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('').trim();
}

// One annotation from the model, with the output-contract rewrite pass.
async function generateAnnotation(context, { model = DEFAULT_MODEL, feature = 'annotate', role = 'primary', retryReason: priorReason = null, maxTokens = 1600 } = {}) {
  const startedAt = Date.now();
  const request = (maxTokens, retryReason = null) => anthropicMessage({
    model,
    max_tokens: maxTokens,
    temperature: 0,
    system: SYSTEM,
    messages: [{ role: 'user', content: buildAnnotationUserPrompt(context, retryReason) }],
    tags: [`feature:${feature}`, retryReason ? 'role:completion-retry' : `role:${role}`, `env:${process.env.VERCEL_ENV || 'local'}`],
  });

  let { response: upstream, route, model: usedModel } = await request(maxTokens, priorReason);
  console.info('[annotate-ai]', { route, model: usedModel, attempt: 1 });
  let data = await upstream.json();
  const usages = [data.usage || null];
  let retried = false;
  let retryKind = null;

  if (upstream.ok && !data.error) {
    const issues = annotationContractIssues(textOf(data), data.stop_reason);
    if (issues.length) {
      const retryReason = issues.join('; ');
      retried = true;
      retryKind = data.stop_reason === 'max_tokens' ? 'max_tokens' : 'output_contract';
      ({ response: upstream, route, model: usedModel } = await request(2400, retryReason));
      console.info('[annotate-ai]', { route, model: usedModel, attempt: 2, reason: retryReason });
      data = await upstream.json();
      usages.push(data.usage || null);
    }
  }

  if (!upstream.ok || data.error) {
    return { ok: false, status: upstream.status, detail: data.error?.message || `status ${upstream.status}` };
  }

  const annotation = textOf(data);
  const usage = usageTotals(...usages);
  annotatorMetric({
    model: usedModel,
    route,
    aiCalls: retried ? 2 : 1,
    durationMs: Date.now() - startedAt,
    packetChars: context.packet.length,
    relatedCount: context.related.length,
    inputTokens: usage.inputTokens,
    outputTokens: usage.outputTokens,
    retried,
    retryKind,
    stopReason: data.stop_reason || null,
  });
  return {
    ok: true,
    annotation,
    truncated: data.stop_reason === 'max_tokens',
    model: usedModel,
    usage,
  };
}

// Quality gate for a finished annotation: the output contract plus the voice
// rules (no talk about sources or absences) and provision-number validity.
const VOICE_PATTERNS = [
  [/\b(?:source )?packet\b/i, 'mentions the packet'],
  [/\bsupplied\b/i, 'says "supplied"'],
  [/\b(?:change[- ]?log|the log|log entr(?:y|ies)|recorded (?:design )?history)\b/i, 'cites the log'],
  [/\b(?:Log|HISTORY)\s+\d\b/, 'cites a log label'],
  [/\b26\d{4}[a-z]?\b/, 'cites a log date'],
  [/\b(?:does not|doesn't|did not|never)\s+(?:itself\s+)?(?:state|say|specify|record|explain|provide)\b/i, 'narrates an absence'],
  [/\b(?:no|not any)\s+(?:further\s+|stated\s+|recorded\s+)?(?:rationale|explanation|reason)\b/i, 'narrates an absence'],
  [/\bsources?\s+(?:record|do not|don't|state|supply)\b/i, 'talks about sources'],
  [/\b(?:presumably|presumed to be defined|defined (?:somewhere|elsewhere))\b/i, 'presumes a definition elsewhere'],
  [/\bon the (?:text's|record's) own terms\b/i, 'scholarly apparatus'],
  [/\b(?:lexical relative|structural (?:parent|sibling)|explicit citation|defining provision)\b/i, 'uses packet vocabulary'],
  [/\bhistory[- ]record|\bthe (?:project's )?history (?:records|shows|notes|states)\b|\b(?:is|was|are|were) (?:also )?recorded(?! (?:to|in|on|by|as)\b)|\bdocumented (?:restructuring|change|history)\b/i, 'talks about the record'],
];

function annotationLint(text, validNums = null) {
  const value = String(text || '').trim();
  const issues = annotationContractIssues(value, null).map(x => x.replace(/^the first response /, ''));
  const words = value ? value.split(/\s+/).length : 0;
  if (words > 575) issues.push(`over the 575-word limit (${words})`);
  for (const [re, label] of VOICE_PATTERNS) if (re.test(value)) issues.push(label);
  if (validNums) {
    const bad = (value.match(/§\d+(?:\.\d+)*(?:\.[a-z])?/gi) || []).filter(r => !validNums.has(r));
    if (bad.length) issues.push(`unknown provision number ${[...new Set(bad)].join(', ')}`);
  }
  return { words, issues };
}

// Stored-annotation generation: regenerate until the output passes the quality gate
// (up to three attempts, with a larger budget after the first). The last attempt is
// returned with its remaining issues so the editor can see what is left.
const VOICE_REWRITE = 'Rewrite from the beginning as plain explanatory prose in exactly three paragraphs of at most 500 words: never mention a packet, supplied material, a change log, log labels or dates, or anything the text or sources do not say or record; use only provision numbers that appear in the packet; finish the final sentence';

async function generateChecked(context, validNums, { model = DEFAULT_MODEL, feature = 'annotate-stored', role = 'stored', attempts = 3 } = {}) {
  let reason = null;
  let budget = 1600;
  let last = null;
  for (let i = 1; i <= attempts; i++) {
    const result = await generateAnnotation(context, { model, feature, role, retryReason: reason, maxTokens: budget });
    if (!result.ok) return { ...result, attempts: i };
    const lint = annotationLint(result.annotation, validNums);
    const issues = result.truncated ? [...lint.issues, 'hit the output limit'] : lint.issues;
    last = { ...result, words: lint.words, issues, attempts: i };
    if (!issues.length) return last;
    reason = `${issues.join('; ')}. ${VOICE_REWRITE}`;
    budget = 3000;
  }
  return last;
}

module.exports = {
  generateChecked,
  annotationLint,
  DEFAULT_MODEL,
  packetHash,
  loadStore,
  setStoreForTests,
  storedEnabled,
  lookupStored,
  generateAnnotation,
  buildContextPacket,
};
