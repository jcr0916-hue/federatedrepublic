const { gatewayMessage, gatewayToken } = require('./_ai-transport.js');
const { expandQuery, rankProvisions, retrievalGate } = require('./_navigator-core.js');
const constitution = require('../constitution_data.json');
const cases = require('../scripts/fixtures/navigator-haiku-direct-cases.json');

const HAIKU = 'anthropic/claude-haiku-4.5';
const VERIFIER = 'anthropic/claude-sonnet-5';
const BATCH_SIZE = 10;

const ANSWER_SYSTEM = `You are a bounded constitutional QA assistant. Use only the supplied provisions.
Return ONLY valid JSON with keys: status, answer, sources.
status must be ANSWER, ESCALATE, or NOT_ESTABLISHED.
Use ANSWER only when the question is directly answered by the supplied text without adding any unstated procedure, deadline, remedy, authority, exception, or factual assumption.
sources must contain only section numbers present in the supplied packet.
Keep answer under 90 words.`;

const VERIFY_SYSTEM = `You are a strict constitutional-grounding verifier.
Given a question, a retrieved source packet, and a candidate answer, decide whether EVERY material legal or factual claim in the candidate answer is explicitly supported by the supplied provisions.
Do not reward plausible inference. Any invented power, procedure, deadline, remedy, exception, institution, threshold, historical fact, or reconciliation is unsupported.
Ordinary faithful paraphrase is allowed.
Return ONLY valid JSON: {"supported":true|false,"reason":"brief explanation"}.`;

function textFrom(data) {
  return (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('').trim();
}

async function evaluate(item, provisions) {
  const ranked = rankProvisions(provisions, expandQuery(item.question), 5);
  const matched = ranked.slice(0,3).map(x=>x.provision);
  const gate = retrievalGate(item.question, ranked);
  const packet = matched.map(p => `[${p.num}] ${p.name}\n${p.text}`).join('\n\n');
  const started = Date.now();

  const { response } = await gatewayMessage({
    model: HAIKU,
    max_tokens: 260,
    system: ANSWER_SYSTEM,
    messages:[{role:'user',content:`Question: ${item.question}\n\nDeterministic gate: ${gate.status} / ${gate.reason}\n\nProvisions:\n${packet}`}],
    tags:['feature:navigator-direct-benchmark','role:candidate',`case:${item.id}`],
  });

  const answerLatencyMs = Date.now()-started;
  const data = await response.json().catch(()=>({}));
  if (!response.ok) return {id:item.id,requiredSource:item.requiredSource,ok:false,httpStatus:response.status,answerLatencyMs};

  let parsed=null;
  try { parsed=JSON.parse(textFrom(data).replace(/```json|```/g,'').trim()); } catch {}
  const available=new Set(matched.map(p=>p.num));
  const returnedSources=Array.isArray(parsed?.sources)?parsed.sources:[];
  const validSources=returnedSources.filter(s=>available.has(s));
  const invalidSourceCount=returnedSources.length-validSources.length;
  const sourcePass=validSources.includes(item.requiredSource) && invalidSourceCount===0;
  const dispositionPass=parsed?.status==='ANSWER';
  const answer=typeof parsed?.answer==='string'?parsed.answer.trim():'';

  let verifier={supported:false,reason:'candidate parse failure'};
  let verifierLatencyMs=null;
  if (parsed && answer) {
    const verifyStart=Date.now();
    const { response:vr }=await gatewayMessage({
      model: VERIFIER,
      max_tokens: 180,
      system: VERIFY_SYSTEM,
      messages:[{role:'user',content:`Question: ${item.question}\n\nSource packet:\n${packet}\n\nCandidate answer:\n${answer}`}],
      tags:['feature:navigator-direct-benchmark','role:verifier',`case:${item.id}`],
    });
    verifierLatencyMs=Date.now()-verifyStart;
    const vd=await vr.json().catch(()=>({}));
    if (vr.ok) {
      try { verifier=JSON.parse(textFrom(vd).replace(/```json|```/g,'').trim()); } catch { verifier={supported:false,reason:'verifier parse failure'}; }
    } else verifier={supported:false,reason:`verifier HTTP ${vr.status}`};
  }

  return {
    id:item.id,
    question:item.question,
    requiredSource:item.requiredSource,
    matched:[...available],
    ok:true,
    disposition:parsed?.status||'INVALID',
    dispositionPass,
    sourcePass,
    invalidSourceCount,
    sources:validSources,
    supported:verifier?.supported===true,
    verifierReason:verifier?.reason||'',
    answer,
    answerLatencyMs,
    verifierLatencyMs,
    candidateUsage:data.usage||null,
  };
}

module.exports=async(req,res)=>{
  if(req.method!=='GET') return res.status(405).json({error:'Method not allowed'});
  if(!gatewayToken()) return res.status(503).json({error:'Gateway credential unavailable'});
  const batch=Math.min(8,Math.max(1,Number(req.query?.batch)||1));
  const start=(batch-1)*BATCH_SIZE;
  const selected=cases.slice(start,start+BATCH_SIZE);
  const provisions=constitution.flatMap(a=>a.provisions);
  const results=await Promise.all(selected.map(item=>evaluate(item,provisions)));
  const completed=results.filter(r=>r.ok);
  const summary={
    batch,
    cases:selected.length,
    completed:completed.length,
    dispositionPass:completed.filter(r=>r.dispositionPass).length,
    sourcePass:completed.filter(r=>r.sourcePass).length,
    supported:completed.filter(r=>r.supported).length,
    fullyPass:completed.filter(r=>r.dispositionPass&&r.sourcePass&&r.supported).length,
    invalidSources:completed.reduce((n,r)=>n+r.invalidSourceCount,0),
    candidateInputTokens:completed.reduce((n,r)=>n+Number(r.candidateUsage?.input_tokens||0),0),
    candidateOutputTokens:completed.reduce((n,r)=>n+Number(r.candidateUsage?.output_tokens||0),0),
  };
  res.setHeader('Cache-Control','no-store');
  return res.status(200).json({summary,results});
};
