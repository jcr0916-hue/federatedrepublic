const { gatewayMessage } = require('./_ai-transport.js');
const constitution = require('../constitution_data.json');
const cases = require('../scripts/fixtures/annotator-ai-cases.json');

const MODELS = {
  sonnet: 'anthropic/claude-sonnet-5',
  haiku: 'anthropic/claude-haiku-4.5',
};

const SYSTEM = `You are a constitutional design analyst for the Federated Republic. When a user clicks on a provision, you explain the design rationale behind it — the why, not just the what.

Your annotation should cover:
1. The constitutional principle this provision embodies
2. The design choice expressed in the current text and its practical effect; do not invent drafting history or rejected alternatives
3. How this provision connects to or depends on other provisions
4. What failure mode or abuse this provision is guarding against

Be direct and substantive. Write 3-4 short paragraphs. No bullet points. No headers. Plain prose, analytical tone. Assume the reader has already read the provision text — do not summarize it.

The twelve design principles underlying this constitution:
1. One Home Rule — no repeated protections; each protection lives in exactly one place
2. Institution Test — use existing constitutional bodies before creating new ones
3. Bad-Faith Test — read every provision as if someone is trying to circumvent it
4. Actor Test — every provision must name a holder, a check, and a consequence of inaction
5. Unique Function Test — if removed, what specific failure mode does it expose?
6. Democratic Legitimacy Test — constitutional restrictions must be pre-political, not policy preference
7. Transparency Test — every exercise of authority must produce a public NRS record
8. Informational Power Test — informational authority is constitutional power; it must be bounded
9. Graceful Degradation Test — every provision must define its failure state
10. Sunlight Test — no permanent withholding; temporary confidentiality requires a ceiling
11. Process Symmetry — materially similar constitutional functions should use materially similar procedures unless a meaningful difference in role, legitimacy, consequence, or risk requires divergence
12. Procedural Familiarity — constitutional procedures should reuse familiar actors, thresholds, stages, and failure mechanisms unless a meaningful difference requires a new process

Use only the current Constitution below as constitutional authority. Distinguish interpretation from explicit requirements; acknowledge ambiguity instead of supplying missing rules.

The complete constitution text follows:
`;

const constitutionText = constitution
  .flatMap(article => article.provisions)
  .map(prov => `[${prov.num}] ${prov.name}: ${prov.text}`)
  .join('\n\n');

module.exports = async (req,res) => {
  if (req.method !== 'GET') return res.status(405).json({error:'GET only'});
  const alias = String(req.query?.m || '').trim();
  const num = String(req.query?.num || '').trim();
  const model = MODELS[alias];
  if (!model) return res.status(400).json({error:'m must be sonnet or haiku'});

  const rubric = cases.find(x => x.num === num);
  if (!rubric) return res.status(400).json({error:'unknown benchmark provision'});
  const provision = constitution.flatMap(a=>a.provisions).find(p=>p.num===num);
  if (!provision) return res.status(400).json({error:'provision not found'});

  try {
    const started=Date.now();
    const {response}=await gatewayMessage({
      model,
      max_tokens:2000,
      system:SYSTEM + constitutionText,
      messages:[{role:'user',content:`Explain the design rationale for this provision:\n\n${provision.num} — ${provision.name}\n\n"${provision.text}"`}],
      tags:['feature:annotator-benchmark','model:'+alias],
    });
    if (!response.ok) {
      const detail=await response.text().catch(()=> '');
      return res.status(502).json({error:'upstream',status:response.status,detail:detail.slice(0,200)});
    }
    const data=await response.json();
    const annotation=(data.content||[]).filter(b=>b.type==='text').map(b=>b.text).join('').trim();
    return res.status(200).json({
      alias,model,num,title:rubric.title,
      must:rubric.must,mustNot:rubric.mustNot,
      annotation,
      truncated:data.stop_reason==='max_tokens',
      latencyMs:Date.now()-started,
    });
  } catch(e) {
    return res.status(500).json({error:String(e).slice(0,300)});
  }
};
