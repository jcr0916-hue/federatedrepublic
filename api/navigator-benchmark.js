const { anthropicMessage } = require('./_ai-transport.js');
const { expandQuery, rankProvisions, contextualSectionRefs } = require('./_navigator-core.js');
const { buildNavigatorContextPacket } = require('./_navigator-context.js');
const constitution = require('../constitution_data.json');

const CASES = [
["s01","Does judicial selection give the Civic Consul too much discretion?"],
["s02","What happens if a Judicial Pool nominee has a conflict with another provision?"],
["s05","Could the Assembly abuse the constructive vote of no confidence?"],
["s06","Does §2.6 imply any limit on political reasons for removing the Civic Consul?"],
["s07","What happens if statehood audit findings conflict?"],
["s08","How should §15.2 be interpreted if one Monitor changes its finding?"],
["s09","Can a State independence referendum be repeated strategically?"],
["s10","How do §15.9 and §15.4 interact?"],
["s12","Does treaty-based military authorization override §2.2?"],
["s13","Can an amendment change an entrenched provision indirectly?"],
["s14","How do §17.1 and §17.3 interact?"],
["s15","Can the NRS Panel hide a record for political embarrassment?"],
["s16","Does §10.1 imply publication is necessary before authority exists?"],
["s17","Could the Legislature indirectly control the Monetary Authority through its budget?"],
["s18","How should Monetary Authority independence be reconciled with statutory administration?"],
["s19","Can a citizen initiative do something the Legislature itself could not do?"],
["s20","How does §13.2 interact with entrenched constitutional rights?"],
["s21","Can a non-derogable right ever be limited by another constitutional provision?"],
["s22","What does non-derogable mean if two absolute rights conflict?"],
["s23","Does Supreme Court Selection imply a preferred judicial philosophy?"],
["s25","What happens when a constitutional deadline conflicts with continuity of government?"],
["s26","Does the Constitution imply a general anti-deadlock principle?"],
["s27","How should overlapping executive powers be interpreted?"],
["s28","Does the Constitution create implied powers for independent institutions?"]
];

const SYSTEM = `You are a plain language guide to the Federated Republic constitution. The application has already performed retrieval and assembled a verified SOURCE PACKET. Answer the user's question in the first sentence. Use only the supplied packet. Answer fully where the supplied text establishes the answer. If it establishes only part of the answer, answer that part and state clearly what the Constitution does not establish. If the user asks why a structure exists or asks for design rationale, distinguish what the constitutional text establishes from any motive or rationale it does not state; do not invent an authorial purpose. Do not add any unstated power, procedure, deadline, remedy, exception, historical fact, reconciliation, or mechanism for changing or avoiding a constitutional rule. Do not infer that a rule can be altered only by amendment, repeal, reassignment, statute, or any other mechanism unless the supplied provisions expressly state that. Preserve material qualifiers, thresholds, conditions, and distinctions. After answering directly, include every material consequence, exception, continuation rule, and fallback from the supplied provisions that is necessary to answer the question; do not omit a directly relevant downstream consequence merely for brevity. Where multiple supplied provisions govern different stages or mechanisms, distinguish them clearly. Treat PRIMARY provisions as the retrieval layer's best evidence; RELATED provisions expose structural siblings or explicit dependencies but are not automatically controlling. Do not create a general rule or remedy by stitching together separate provisions merely because they appear in the same packet. Only state a cross-provision consequence when the text itself establishes the connection or the connection follows directly without adding a new rule. Never transfer a trigger, deadline, fallback, override, funding rule, or consequence from one provision to another just because the mechanisms look similar or appear in the same Article. Never collapse different stages or different failure outcomes into one rule; preserve each stage's own consequence and any cooldown or reinitiation condition. Treat terms such as failed, rejected, void, lapsed, withdrawn, and not acted on as distinct outcomes unless the text expressly equates them. Do not assume process symmetry: a restriction stated for one actor or mechanism does not automatically bind another actor or mechanism. Do not invent a more specific factual scenario than the user supplied merely because another provision in the packet could apply to that hypothetical; answer the stated question and only introduce a specific scenario when the user names it or the constitutional text directly makes it part of the rule. If the user's wording is broader than the text's trigger — for example 'block,' 'delay,' or 'fail' — qualify the answer to the exact supported scenario rather than answering the broader category. Before saying the packet provides no rule, no limit, or only one outcome, check every supplied provision for a narrower explicit rule that directly bears on the question. If the packet does not establish a requested fact or reconciliation, say so. Write 3-4 concise sentences as needed, and always complete the final sentence. Plain text only — no headings, bullets, or formatting.`;

module.exports = async (req,res) => {
  if (req.method !== 'GET') return res.status(405).json({error:'GET only'});
  const batch = Math.max(0, Math.min(5, Number(req.query.batch || 0)));
  const modelKey = req.query.model === '5' ? '5' : '4.6';
  const model = modelKey === '5' ? 'anthropic/claude-sonnet-5' : 'anthropic/claude-sonnet-4.6';
  const provisions = constitution.flatMap(a => a.provisions);
  const byNum = new Map(provisions.map(p=>[p.num,p]));
  const selected = CASES.slice(batch*4,batch*4+4);
  const results = await Promise.all(selected.map(async ([id,question]) => {
    const terms = expandQuery(question);
    const lexicalRanked = rankProvisions(provisions, terms, 5);
    const contextualRefs = contextualSectionRefs(question);
    const contextualRanked = contextualRefs.map((num,index)=>byNum.get(num)?({provision:byNum.get(num),score:100-index,via:'context'}):null).filter(Boolean);
    const contextualNums = new Set(contextualRanked.map(x=>x.provision.num));
    const ranked = [...contextualRanked,...lexicalRanked.filter(x=>!contextualNums.has(x.provision.num))].slice(0,5);
    const context = buildNavigatorContextPacket(question, ranked, provisions);
    const {response} = await anthropicMessage({
      model, max_tokens:600, temperature:0, system:SYSTEM,
      messages:[{role:'user',content:context.packet}],
      tags:['feature:navigator-benchmark','role:comparison',`model:${modelKey}`]
    });
    const data = await response.json();
    return {
      id, question, model,
      status: response.status,
      stop_reason: data.stop_reason || null,
      input_tokens: data.usage?.input_tokens || null,
      output_tokens: data.usage?.output_tokens || null,
      primary: context.primary.map(p=>p.num),
      related: context.related.map(p=>p.num),
      packet: context.packet,
      answer: (data.content||[]).filter(b=>b.type==='text').map(b=>b.text).join('').trim(),
      error: data.error || null
    };
  }));
  res.setHeader('Cache-Control','no-store');
  return res.status(200).json({batch,model,results});
};