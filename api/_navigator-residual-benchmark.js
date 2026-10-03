const { gatewayMessage, gatewayToken } = require('./_ai-transport.js');
const {
  expandQuery,
  rankProvisions,
  retrievalSufficiency,
  contextualSectionRefs,
} = require('./_navigator-core.js');
const { buildNavigatorContextPacket } = require('./_navigator-context.js');
const constitution = require('../constitution_data.json');
const cases = require('../scripts/fixtures/navigator-natural-language-cases.json');

const VERIFIER = 'anthropic/claude-sonnet-5';
const BATCH_SIZE = 4;
const ALLOWED_MODELS = new Set([
  'anthropic/claude-haiku-4.5',
  'anthropic/claude-sonnet-4.6',
]);

const ANSWER_SYSTEM = `You are a plain language guide to the Federated Republic constitution. The application has already performed retrieval and assembled a verified SOURCE PACKET. Answer the user's question in the first sentence. Use only the supplied packet. Answer fully where the supplied text establishes the answer. If it establishes only part of the answer, answer that part and state clearly what the Constitution does not establish. If the user asks why a structure exists or asks for design rationale, distinguish what the constitutional text establishes from any motive or rationale it does not state; do not invent an authorial purpose. Do not add any unstated power, procedure, deadline, remedy, exception, historical fact, reconciliation, or mechanism for changing or avoiding a constitutional rule. Do not infer that a rule can be altered only by amendment, repeal, reassignment, statute, or any other mechanism unless the supplied provisions expressly state that. Preserve material qualifiers, thresholds, conditions, and distinctions. After answering directly, include every material consequence, exception, continuation rule, and fallback from the supplied provisions that is necessary to answer the question; do not omit a directly relevant downstream consequence merely for brevity. Where multiple supplied provisions govern different stages or mechanisms, distinguish them clearly. Treat PRIMARY provisions as the retrieval layer's best evidence; RELATED and BACKLINK provisions expose explicit dependencies but are not automatically controlling. If the packet does not establish a requested fact or reconciliation, say so. Write 3-5 concise sentences as needed. Plain text only — no headings, bullets, or formatting.`;

const VERIFY_SYSTEM = `You are a strict constitutional answer verifier.
You will receive a user question, the exact verified SOURCE PACKET supplied to a candidate model, and the candidate answer.
Judge the candidate against ONLY that packet.

Return exactly one line in one of these forms:
PASS
UNSUPPORTED: <brief reason>
INCOMPLETE: <brief reason>
MISDIRECTED: <brief reason>

Use UNSUPPORTED if any material claim adds an unstated power, procedure, deadline, remedy, exception, factual assumption, authorial motive, or reconciliation.
Use INCOMPLETE if the answer omits a material qualifier, threshold, exception, continuation rule, fallback, or other part of the supplied rule needed to answer the question.
Use MISDIRECTED if the answer does not actually answer the question asked.
Faithful concise paraphrase and clearly labeled structural inference are allowed. Preserve distinctions between primary, related, and backlink provisions.`;

function textFrom(data) {
  return (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('').trim();
}

function verdictFrom(raw) {
  const line = String(raw || '').trim().split(/\n+/)[0].trim();
  if (/^PASS\b/i.test(line)) return { verdict:'PASS', reason:'' };
  const m = line.match(/^(UNSUPPORTED|INCOMPLETE|MISDIRECTED)\s*:\s*(.*)$/i);
  if (m) return { verdict:m[1].toUpperCase(), reason:m[2].trim() };
  return { verdict:'INVALID', reason:line.slice(0,240) };
}

function productionRank(question, provisions) {
  const terms = expandQuery(question);
  const lexicalRanked = rankProvisions(provisions, terms, 5);
  const contextualRefs = contextualSectionRefs(question);
  const byNum = new Map(provisions.map(p => [p.num, p]));
  const contextualRanked = contextualRefs
    .map((num, index) => byNum.get(num) ? ({ provision:byNum.get(num), score:100-index, via:'context' }) : null)
    .filter(Boolean);
  const contextualNums = new Set(contextualRanked.map(x => x.provision.num));
  return {
    contextualRefs,
    ranked:[...contextualRanked, ...lexicalRanked.filter(x => !contextualNums.has(x.provision.num))].slice(0, 5),
  };
}

async function evaluate(item, model, provisions) {
  const { contextualRefs, ranked } = productionRank(item.question, provisions);
  const sufficiency = contextualRefs.length
    ? { sufficient:true, reason:'VERIFIED_CONTEXT_PACKET', coverage:1 }
    : retrievalSufficiency(item.question, ranked);

  if (!sufficiency.sufficient) {
    return {
      id:item.id,
      ok:false,
      error:'case no longer reaches synthesis under current routing',
      retrieval:sufficiency,
      matched:ranked.map(x => x.provision.num),
    };
  }

  const context = buildNavigatorContextPacket(item.question, ranked, provisions);
  const packet = context.packet;

  const answerStart = Date.now();
  const { response: candidateResponse } = await gatewayMessage({
    model,
    max_tokens:420,
    temperature:0,
    system:ANSWER_SYSTEM,
    messages:[{role:'user',content:packet}],
    tags:['feature:navigator-residual-benchmark','role:candidate',`case:${item.id}`],
  });
  const candidateLatencyMs = Date.now() - answerStart;
  const candidateData = await candidateResponse.json().catch(()=>({}));

  if (!candidateResponse.ok) {
    return {
      id:item.id,
      ok:false,
      error:'candidate request failed',
      httpStatus:candidateResponse.status,
      candidateLatencyMs,
    };
  }

  const answer = textFrom(candidateData);

  const verifyStart = Date.now();
  const { response: verifierResponse } = await gatewayMessage({
    model:VERIFIER,
    max_tokens:500,
    temperature:0,
    system:VERIFY_SYSTEM,
    messages:[{
      role:'user',
      content:`Question: ${item.question}\n\nSOURCE PACKET:\n${packet}\n\nCandidate answer:\n${answer}`
    }],
    tags:['feature:navigator-residual-benchmark','role:verifier',`case:${item.id}`],
  });
  const verifierLatencyMs = Date.now() - verifyStart;
  const verifierData = await verifierResponse.json().catch(()=>({}));
  const rawVerdict = verifierResponse.ok ? textFrom(verifierData) : `INVALID: verifier HTTP ${verifierResponse.status}`;
  const verdict = verdictFrom(rawVerdict);

  return {
    id:item.id,
    question:item.question,
    ok:true,
    matched:ranked.map(x=>x.provision.num),
    packetChars:packet.length,
    primaryCount:context.primary.length,
    relatedCount:context.related.length,
    retrievalReason:sufficiency.reason,
    retrievalCoverage:sufficiency.coverage,
    answer,
    verdict:verdict.verdict,
    verifierReason:verdict.reason,
    candidateLatencyMs,
    verifierLatencyMs,
    candidateUsage:candidateData.usage || null,
    verifierUsage:verifierData.usage || null,
  };
}

module.exports = async (req,res) => {
  if (req.method !== 'GET') return res.status(405).json({error:'Method not allowed'});
  if (!gatewayToken()) return res.status(503).json({error:'Gateway credential unavailable'});

  const model = String(req.query?.model || 'anthropic/claude-haiku-4.5');
  if (!ALLOWED_MODELS.has(model)) return res.status(400).json({error:'Model not allowed'});

  const batch = Math.min(7, Math.max(1, Number(req.query?.batch) || 1));
  const eligible = cases.filter(c => c.expected === 'SONNET');
  const selected = eligible.slice((batch-1)*BATCH_SIZE, batch*BATCH_SIZE);
  const provisions = constitution.flatMap(a => a.provisions);

  const results = [];
  for (const item of selected) {
    results.push(await evaluate(item, model, provisions));
  }

  const completed = results.filter(r => r.ok);
  const counts = completed.reduce((m,r) => {
    m[r.verdict] = (m[r.verdict] || 0) + 1;
    return m;
  },{});
  const sumUsage = (key, side) => completed.reduce((n,r) => n + Number(r[`${side}Usage`]?.[key] || 0), 0);
  const avg = (key) => completed.length
    ? Math.round(completed.reduce((n,r)=>n+Number(r[key]||0),0)/completed.length)
    : 0;

  res.setHeader('Cache-Control','no-store');
  return res.status(200).json({
    summary:{
      model,
      batch,
      cases:selected.length,
      completed:completed.length,
      pass:counts.PASS||0,
      unsupported:counts.UNSUPPORTED||0,
      incomplete:counts.INCOMPLETE||0,
      misdirected:counts.MISDIRECTED||0,
      invalid:counts.INVALID||0,
      candidateInputTokens:sumUsage('input_tokens','candidate'),
      candidateOutputTokens:sumUsage('output_tokens','candidate'),
      avgCandidateLatencyMs:avg('candidateLatencyMs'),
      avgPacketChars:avg('packetChars'),
    },
    results,
  });
};
