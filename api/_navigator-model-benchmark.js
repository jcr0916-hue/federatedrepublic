const { gatewayMessage, gatewayToken } = require('./_ai-transport.js');
const { expandQuery, rankProvisions, retrievalGate } = require('./_navigator-core.js');
const constitution = require('../constitution_data.json');
const cases = require('../scripts/fixtures/navigator-gate-cases.json');

const MODELS = [
  'openai/gpt-5.4-nano',
  'google/gemini-3.5-flash-lite',
  'anthropic/claude-haiku-4.5',
];

const SETS = {
  a: ['direct-01','direct-05','direct-16','cross-01','cross-06','interpret-02','none-01','none-06','none-09'],
  b: ['direct-12','direct-18','direct-23','cross-09','cross-12','interpret-07','none-03','none-08','none-10'],
};

const SYSTEM = `You are a bounded constitutional QA evaluator. Use only the supplied provisions.
Return ONLY valid JSON with keys: status, answer, sources.
status must be ANSWER, ESCALATE, or NOT_ESTABLISHED.
Use ANSWER only if the question can be answered directly from the supplied text without adding any unstated procedure, deadline, remedy, authority, or factual assumption.
Use ESCALATE if multiple provisions must be reconciled, the text is ambiguous, retrieval is insufficient, or interpretation beyond explicit text is required.
Use NOT_ESTABLISHED if the supplied text does not establish the requested fact.
sources must be an array containing only section numbers present in the supplied packet.
Keep answer under 90 words.`;

function expectedStatus(expectedGate) {
  if (expectedGate === 'TIER_A_CANDIDATE') return 'ANSWER';
  if (expectedGate === 'NOT_ESTABLISHED') return 'NOT_ESTABLISHED';
  return 'ESCALATE';
}

function textFrom(data) {
  return (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('').trim();
}

async function runOne(model, item, provisions) {
  const terms = expandQuery(item.question);
  const ranked = rankProvisions(provisions, terms, 5);
  const matched = ranked.slice(0, 3).map(x => x.provision);
  const gate = retrievalGate(item.question, ranked);
  const packet = matched.map(p => `[${p.num}] ${p.name}\n${p.text}`).join('\n\n');
  const started = Date.now();

  const { response } = await gatewayMessage({
    model,
    max_tokens: 260,
    system: SYSTEM,
    messages: [{
      role: 'user',
      content: `Question: ${item.question}\n\nDeterministic gate: ${gate.status} / ${gate.reason}\n\nProvisions:\n${packet || '(none)'}`,
    }],
    tags: ['feature:navigator-benchmark', `model:${model}`, `set:${item.id}`],
  });

  const latencyMs = Date.now() - started;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return {
      model, id: item.id, expected: expectedStatus(item.expectedGate),
      gate: gate.status, matched: matched.map(p => p.num), ok: false,
      httpStatus: response.status, latencyMs,
    };
  }

  let parsed = null;
  let parseOk = false;
  try {
    parsed = JSON.parse(textFrom(data).replace(/```json|```/g, '').trim());
    parseOk = true;
  } catch {}

  const available = new Set(matched.map(p => p.num));
  const returnedSources = Array.isArray(parsed?.sources) ? parsed.sources : [];
  const validSources = returnedSources.filter(s => available.has(s));
  const status = ['ANSWER','ESCALATE','NOT_ESTABLISHED'].includes(parsed?.status) ? parsed.status : 'INVALID';
  const expected = expectedStatus(item.expectedGate);

  return {
    model,
    id: item.id,
    expected,
    gate: gate.status,
    matched: [...available],
    ok: true,
    parseOk,
    status,
    dispositionCorrect: status === expected,
    falseNonEscalation: expected !== 'ANSWER' && status === 'ANSWER',
    invalidSourceCount: returnedSources.length - validSources.length,
    sources: validSources,
    latencyMs,
    usage: data.usage || null,
  };
}

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!gatewayToken()) return res.status(503).json({ error: 'Gateway credential unavailable' });

  const setName = req.query?.set === 'b' ? 'b' : 'a';
  const ids = SETS[setName];
  const byId = new Map(cases.map(x => [x.id, x]));
  const selected = ids.map(id => byId.get(id)).filter(Boolean);
  const provisions = constitution.flatMap(a => a.provisions);

  const tasks = [];
  for (const model of MODELS) {
    for (const item of selected) tasks.push(runOne(model, item, provisions));
  }

  const results = await Promise.all(tasks);
  const summary = MODELS.map(model => {
    const rows = results.filter(r => r.model === model);
    const good = rows.filter(r => r.ok);
    const latencies = good.map(r => r.latencyMs).sort((a,b) => a-b);
    const tokenSum = key => good.reduce((n,r) => n + Number(r.usage?.[key] || 0), 0);
    return {
      model,
      cases: rows.length,
      completed: good.length,
      dispositionCorrect: good.filter(r => r.dispositionCorrect).length,
      falseNonEscalations: good.filter(r => r.falseNonEscalation).length,
      parseFailures: good.filter(r => !r.parseOk).length,
      invalidSources: good.reduce((n,r) => n + r.invalidSourceCount, 0),
      medianLatencyMs: latencies.length ? latencies[Math.floor(latencies.length/2)] : null,
      inputTokens: tokenSum('input_tokens'),
      outputTokens: tokenSum('output_tokens'),
    };
  });

  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ set: setName, models: MODELS, summary, results });
};
