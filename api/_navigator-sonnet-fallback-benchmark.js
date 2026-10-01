const { gatewayMessage, gatewayToken } = require('./_ai-transport.js');
const { expandQuery, rankProvisions, retrievalSufficiency } = require('./_navigator-core.js');
const constitution = require('../constitution_data.json');
const cases = require('../scripts/fixtures/navigator-fallback-cases.json');

const CANDIDATE = process.env.AI_MODEL_NAVIGATOR || 'anthropic/claude-sonnet-4.6';
const VERIFIER = 'anthropic/claude-sonnet-5';
const BATCH_SIZE = 10;

const ANSWER_SYSTEM = `You are a plain language guide to the Federated Republic constitution. Answer the user's question in the first sentence. Use only the supplied constitutional provisions. Do not add any unstated power, procedure, deadline, remedy, exception, historical fact, reconciliation, or mechanism for changing or avoiding a constitutional rule. Do not infer that a rule can be altered only by amendment, repeal, reassignment, statute, or any other mechanism unless the supplied provisions expressly state that. If the supplied provisions do not establish the answer, say that directly rather than inferring. Preserve material qualifiers, thresholds, conditions, and distinctions. Write 3-4 concise sentences. Plain text only — no headings, bullets, or formatting.`;

const VERIFY_SYSTEM = `You are a strict constitutional answer verifier.
You will receive a user question, the exact constitutional evidence packet supplied to a candidate model, and the candidate answer.
Judge the candidate against ONLY that packet.

Return exactly one line in one of these forms:
PASS
UNSUPPORTED: <brief reason>
INCOMPLETE: <brief reason>
MISDIRECTED: <brief reason>

Use UNSUPPORTED if any material claim adds an unstated power, procedure, deadline, remedy, exception, factual assumption, or reconciliation.
Use INCOMPLETE if the answer omits a material part of the rule needed to answer the question from the supplied packet.
Use MISDIRECTED if it does not actually answer the question asked.
Faithful concise paraphrase is allowed. Preserve material qualifiers, thresholds, conditions, and distinctions.`;

function textFrom(data) {
  return (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('').trim();
}

function verdictFrom(raw) {
  const line = String(raw || '').trim().split(/\n+/)[0].trim();
  if (/^PASS\b/i.test(line)) return { verdict:'PASS', reason:'' };
  const m = line.match(/^(UNSUPPORTED|INCOMPLETE|MISDIRECTED)\s*:\s*(.*)$/i);
  if (m) return { verdict:m[1].toUpperCase(), reason:m[2].trim() };
  return { verdict:'INVALID', reason:line.slice(0,200) };
}

async function evaluate(item, provisions) {
  const ranked = rankProvisions(provisions, expandQuery(item.question), 5);
  const sufficiency = retrievalSufficiency(item.question, ranked);
  const matched = ranked.slice(0,5).map(x => x.provision);
  const packet = matched.map(p => `[${p.num}] ${p.name}\n${p.text}`).join('\n\n');

  if (!item.expectedSufficient || !sufficiency.sufficient) {
    return {
      id:item.id,
      ok:false,
      error:'benchmark case was not retrieval-sufficient',
      retrieval:sufficiency,
      matched:matched.map(p=>p.num),
    };
  }

  const answerStart = Date.now();
  const { response: candidateResponse } = await gatewayMessage({
    model:CANDIDATE,
    max_tokens:320,
    temperature:0,
    system:ANSWER_SYSTEM,
    messages:[{role:'user',content:`Question: ${item.question}\n\nProvisions:\n${packet}`}],
    tags:['feature:navigator-fallback-benchmark','role:candidate',`case:${item.id}`],
  });
  const candidateLatencyMs = Date.now() - answerStart;
  const candidateData = await candidateResponse.json().catch(()=>({}));
  if (!candidateResponse.ok) {
    return {
      id:item.id,ok:false,httpStatus:candidateResponse.status,
      error:'candidate request failed',candidateLatencyMs,
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
      content:`Question: ${item.question}\n\nEvidence packet:\n${packet}\n\nCandidate answer:\n${answer}`
    }],
    tags:['feature:navigator-fallback-benchmark','role:verifier',`case:${item.id}`],
  });
  const verifierLatencyMs = Date.now() - verifyStart;
  const verifierData = await verifierResponse.json().catch(()=>({}));
  const rawVerdict = verifierResponse.ok ? textFrom(verifierData) : `INVALID: verifier HTTP ${verifierResponse.status}`;
  const verdict = verdictFrom(rawVerdict);

  return {
    id:item.id,
    question:item.question,
    required:item.required,
    matched:matched.map(p=>p.num),
    retrievalReason:sufficiency.reason,
    retrievalCoverage:sufficiency.coverage,
    ok:true,
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

  const batch = Math.min(5, Math.max(1, Number(req.query?.batch) || 1));
  const eligible = cases.filter(c => c.expectedSufficient);
  const selected = eligible.slice((batch-1)*BATCH_SIZE, batch*BATCH_SIZE);
  const provisions = constitution.flatMap(a=>a.provisions);

  const results = [];
  for (const item of selected) {
    results.push(await evaluate(item, provisions));
  }

  const completed = results.filter(r=>r.ok);
  const counts = completed.reduce((m,r) => {
    m[r.verdict] = (m[r.verdict] || 0) + 1;
    return m;
  },{});

  const sumUsage = (key,side) => completed.reduce((n,r)=>n+Number(r[`${side}Usage`]?.[key]||0),0);

  const summary = {
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
    verifierInputTokens:sumUsage('input_tokens','verifier'),
    verifierOutputTokens:sumUsage('output_tokens','verifier'),
  };

  res.setHeader('Cache-Control','no-store');
  return res.status(200).json({summary,results});
};
