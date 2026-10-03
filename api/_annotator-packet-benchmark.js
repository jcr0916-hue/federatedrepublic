const { gatewayMessage, gatewayToken } = require('./_ai-transport.js');
const {
  SYSTEM,
  buildContextPacket,
  buildAnnotationUserPrompt,
} = require('./_annotator-core.js');
const cases = require('../scripts/fixtures/annotator-ai-cases.json');

const VERIFIER_MODEL = 'anthropic/claude-sonnet-5';
const ALLOWED_MODELS = new Set([
  'anthropic/claude-sonnet-5',
  'anthropic/claude-haiku-4.5',
]);
const BATCH_SIZE = 2;

const VERIFY_SYSTEM = `You are a strict source-grounding verifier for constitutional annotations.
You will receive:
- the exact SOURCE PACKET given to the candidate;
- a benchmark rubric with required points and prohibited claims;
- the candidate annotation.

Judge only against the supplied packet and rubric. Do not reward plausible constitutional theory that is not supported by the packet.

Return exactly one line:
PASS
or
UNSUPPORTED: <brief reason>
or
INCOMPLETE: <brief reason>
or
FORMAT: <brief reason>

UNSUPPORTED means the annotation materially invents, transfers, broadens, or misstates a rule, motive, trigger, deadline, consequence, remedy, or cross-reference effect.
INCOMPLETE means it misses a material rubric point needed for a reliable annotation.
FORMAT means the answer is visibly cut off, not three prose paragraphs, or otherwise violates the production output contract in a material way.
A clearly labeled structural inference is allowed only when it does not add a constitutional rule or unsupported historical/drafting motive.`;

function extractText(data) {
  return (data.content || [])
    .filter(x => x.type === 'text')
    .map(x => x.text)
    .join('')
    .trim();
}

function parseVerdict(raw) {
  const line = String(raw || '').trim().split(/\n+/)[0].trim();
  if (/^PASS$/i.test(line)) return { verdict:'PASS', reason:'' };
  const m = line.match(/^(UNSUPPORTED|INCOMPLETE|FORMAT)\s*:\s*(.*)$/i);
  if (m) return { verdict:m[1].toUpperCase(), reason:m[2].trim() };
  return { verdict:'INVALID', reason:line.slice(0,300) };
}

async function evaluate(item, model) {
  const context = buildContextPacket(item.num);
  if (!context) return { num:item.num, ok:false, error:'unknown provision' };

  const start = Date.now();
  let { response:candidateResponse } = await gatewayMessage({
    model,
    max_tokens:1600,
    temperature:0,
    system:SYSTEM,
    messages:[{ role:'user', content:buildAnnotationUserPrompt(context, false) }],
    tags:['feature:annotator-packet-benchmark','role:candidate',`case:${item.num}`,'attempt:1'],
  });
  let candidateData = await candidateResponse.json().catch(()=>({}));
  let completionRetried = false;
  let firstUsage = candidateData.usage || null;

  if (candidateResponse.ok && candidateData.stop_reason === 'max_tokens') {
    completionRetried = true;
    ({ response:candidateResponse } = await gatewayMessage({
      model,
      max_tokens:2400,
      temperature:0,
      system:SYSTEM,
      messages:[{ role:'user', content:buildAnnotationUserPrompt(context, true) }],
      tags:['feature:annotator-packet-benchmark','role:candidate',`case:${item.num}`,'attempt:2'],
    }));
    candidateData = await candidateResponse.json().catch(()=>({}));
  }

  const candidateLatencyMs = Date.now() - start;
  if (!candidateResponse.ok) {
    return {
      num:item.num,
      title:item.title,
      ok:false,
      error:'candidate request failed',
      status:candidateResponse.status,
      candidateLatencyMs,
    };
  }

  const annotation = extractText(candidateData);
  const rubric = [
    'MUST:',
    ...item.must.map(x => `- ${x}`),
    '',
    'MUST NOT:',
    ...item.mustNot.map(x => `- ${x}`),
  ].join('\n');

  const verifyStart = Date.now();
  const { response:verifyResponse } = await gatewayMessage({
    model:VERIFIER_MODEL,
    max_tokens:900,
    temperature:0,
    system:VERIFY_SYSTEM,
    messages:[{
      role:'user',
      content:`CASE: ${item.num} — ${item.title}\n\nRUBRIC:\n${rubric}\n\nSOURCE PACKET:\n${context.packet}\n\nCANDIDATE ANNOTATION:\n${annotation}`,
    }],
    tags:['feature:annotator-packet-benchmark','role:verifier',`case:${item.num}`],
  });
  const verifierLatencyMs = Date.now() - verifyStart;
  const verifierData = await verifyResponse.json().catch(()=>({}));
  const rawVerdict = verifyResponse.ok ? extractText(verifierData) : `INVALID: verifier HTTP ${verifyResponse.status}`;
  const verdict = parseVerdict(rawVerdict);

  return {
    num:item.num,
    title:item.title,
    ok:true,
    verdict:verdict.verdict,
    verifierReason:verdict.reason,
    annotation,
    packetChars:context.packet.length,
    sameArticleCount:context.sameArticle.length,
    crossRefCount:context.explicitCrossRefs.length,
    backlinkCount:context.backlinks.length,
    candidateLatencyMs,
    verifierLatencyMs,
    candidateStopReason:candidateData.stop_reason || null,
    completionRetried,
    firstUsage,
    candidateUsage:candidateData.usage || null,
    verifierUsage:verifierData.usage || null,
  };
}

module.exports = async (req,res) => {
  if (req.method !== 'GET') return res.status(405).json({error:'Method not allowed'});
  if (!gatewayToken()) return res.status(503).json({error:'Gateway credential unavailable'});

  const model = String(req.query?.model || 'anthropic/claude-sonnet-5');
  if (!ALLOWED_MODELS.has(model)) return res.status(400).json({error:'Model not allowed'});
  const batch = Math.min(Math.ceil(cases.length / BATCH_SIZE), Math.max(1, Number(req.query?.batch) || 1));
  const selected = cases.slice((batch - 1) * BATCH_SIZE, batch * BATCH_SIZE);

  const results = await Promise.all(selected.map(item => evaluate(item, model)));
  const completed = results.filter(r => r.ok);
  const counts = completed.reduce((acc,r) => {
    acc[r.verdict] = (acc[r.verdict] || 0) + 1;
    return acc;
  },{});
  const usage = (side,key) => completed.reduce((n,r) => n + Number(r[`${side}Usage`]?.[key] || 0), 0);
  const average = key => completed.length
    ? Math.round(completed.reduce((n,r)=>n+Number(r[key]||0),0)/completed.length)
    : 0;

  res.setHeader('Cache-Control','no-store');
  return res.status(200).json({
    summary:{
      model,
      verifierModel:VERIFIER_MODEL,
      batch,
      totalCases:cases.length,
      selected:selected.length,
      completed:completed.length,
      pass:counts.PASS || 0,
      unsupported:counts.UNSUPPORTED || 0,
      incomplete:counts.INCOMPLETE || 0,
      format:counts.FORMAT || 0,
      invalid:counts.INVALID || 0,
      candidateInputTokens:usage('candidate','input_tokens'),
      candidateOutputTokens:usage('candidate','output_tokens'),
      averagePacketChars:average('packetChars'),
      averageCandidateLatencyMs:average('candidateLatencyMs'),
    },
    results,
  });
};
