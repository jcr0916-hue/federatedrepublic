// Vercel Serverless Function: Constitution Navigator
// Node.js format — compatible with all Vercel project types

const path = require('path');
const { anthropicMessage, gatewayMessage, gatewayToken } = require('./_ai-transport.js');
const MODEL = process.env.AI_MODEL_NAVIGATOR || 'anthropic/claude-sonnet-4.6';
const SHADOW_MODEL = process.env.AI_MODEL_NAVIGATOR_SHADOW || 'anthropic/claude-haiku-4.5';

const { expandQuery, rankProvisions, retrievalGate } = require('./_navigator-core.js');

const SCENARIOS = [
  {title:'The First Twelve Years',file:'scenario-the-first-twelve-years.html',kw:['transition','ratification','day zero','article xix','merger','founding','caretaker','predecessor','union','§19.1','§19.2','§19.3','§19.5','§19.6','§19.9']},
  {title:'Ordinary Law',file:'scenario-ordinary.html',kw:['assembly','budget','bill','formation','nrs','ordinary']},
  {title:'The Stalemate',file:'scenario-coordination-failure.html',kw:['lc','cc','domain','conflict','coordination','dual executive']},
  {title:'The Alliance Clause',file:'scenario-alliance-clause.html',kw:['military','treaty','lc','deploy','alliance','defense','foreign']},
  {title:'The Twenty-Four Hours',file:'scenario-the-twenty-four-hours.html',kw:['incapacity','council of ministers','restoration','succession','declination','acting','unable','2.16','executive incapacity','ministers']},
  {title:'The Objection',file:'scenario-the-objection.html',kw:['fiscal','objection','cc','budget','assembly','override']},
  {title:'The Direction',file:'scenario-the-direction.html',kw:['direction','cc','prosecution','solicitor','written']},
  {title:'The First Nomination',file:'scenario-first-nomination.html',kw:['nomination','judicial','pool','senate','confirmation','sc','vacancy']},
  {title:'The Finality Act',file:'scenario-finality-act.html',kw:['judicial','review','strip','immigration','court']},
  {title:'The Critical Finding',file:'scenario-critical-finding.html',kw:['lm','legislative monitor','critical','failure','fiscal']},
  {title:'The Deadlock',file:'scenario-deadlock.html',kw:['monitor','appointment','speaker','deadlock','lottery']},
  {title:'The Suspension',file:'scenario-the-suspension.html',kw:['removal','monitor','suspension','referendum','independence']},
  {title:'The Redaction',file:'scenario-the-redaction.html',kw:['classification','declassification','redaction','secrecy','petition']},
  {title:'The Severed Clause',file:'scenario-the-severed-clause.html',kw:['initiative','direct democracy','referendum','severability','judicial review']},
  {title:'The Formation',file:'scenario-the-formation.html',kw:['formation','civic consul','assembly','cascade','snap election']},
  {title:'The Second Declaration',file:'scenario-second-declaration.html',kw:['emergency','declaration','extension']},
  {title:'The Automatic Floor',file:'scenario-automatic-floor.html',kw:['budget','automatic','floor','appropriation']},
  {title:'The Void Exception',file:'scenario-void-exception.html',kw:['amendment','entrenchment','void','unconstitutional']},
  {title:'The Order',file:'scenario-the-order.html',kw:['military','order','refusal','lawful','soldier']},
  {title:'The Organized Third',file:'scenario-organized-third.html',kw:['citizen','referendum','petition','organized']},
  {title:'The Second Path',file:'scenario-the-second-path.html',kw:['initiative','citizen','referendum','assembly','appropriation','matching fund','§13.2']},
  {title:'The Harder Ballot',file:'scenario-harder-ballot.html',kw:['voting','state','nvs','access','residency','ballot']},
  {title:'The Long Count',file:'scenario-long-count.html',kw:['election','count','certification','nvs','results','elections panel']},
  {title:'The Recalled Senator',file:'scenario-recalled-senator.html',kw:['senator','recall','state','senate']},
  {title:'The Map',file:'scenario-the-map.html',kw:['redistricting','district','map','lm','compactness','elections']},
  {title:'The Sponsoring State',file:'scenario-sponsoring-state.html',kw:['immigration','sponsorship','state','resident','credentials']},
  {title:'The Audit',file:'scenario-the-audit.html',kw:['statehood','territory','immediate statehood','qualification','audit','three monitors']},
  {title:'The Petition',file:'scenario-the-petition.html',kw:['voluntary devolution','state','territory','petition','referendum','devolution']},
  {title:'The Sixty Percent',file:'scenario-the-sixty-percent.html',kw:['national trust','land','amendment','referendum','supermajority','sixty']},
  {title:'The Third Strike',file:'scenario-the-third-strike.html',kw:['mandatory devolution','provisional','audit failure','state','statehood','devolution','three','strike']},
  {title:'The Administrator',file:'scenario-the-administrator.html',kw:['election','state','nvs','compliance','elections panel','§11.3','administrator']},
  {title:'The Return',file:'scenario-the-return.html',kw:['immigration','return','resident','re-entry','discrimination']},
  {title:'The Classification',file:'scenario-the-classification.html',kw:['classification','secrecy','nrs','void','em','audit','transparency']},
  {title:'The Ledger',file:'scenario-the-ledger.html',kw:['electoral finance','contribution','disclosure','corporate','campaign','elections panel','straw donor']},
  {title:'The Contraction',file:'scenario-the-contraction.html',kw:['endowment','monetary authority','ma','revenue','social state','recession','backstop']},
  {title:'The Waiver',file:'scenario-the-waiver.html',kw:['consular','election','rcv','waiver','state plurality','60','runoff']},
  {title:'The Unremovable',file:'scenario-the-unremovable.html',kw:['removal order','detention','asylum','refoulement','stateless','security','judicial review']},
  {title:'The Second Renewal',file:'scenario-the-second-renewal.html',kw:['military','authorization','renewal','transition','reconstruction','withdrawal','senate']},
  {title:'The Coalition',file:'scenario-the-coalition.html',kw:['no confidence','constructive','removal','civic consul','successor','majority','accountability','§2.6','§2.6.a']},
  {title:'The Formula',file:'scenario-the-formula.html',kw:['fiscal equalization','em','fiscal capacity','social state','90 days','§12.6','§12.1','monetary authority']},
  {title:'The Graduation',file:'scenario-the-graduation.html',kw:['voting','residency','nvs','student','ordinary','franchise','§1.9','§11.2','ballot']},
  {title:'The Holdout',file:'scenario-the-holdout.html',kw:['sc nomination','senate','refuses vote','day 120','judicial','confirmation','§4.4','holdout']},
  {title:'The Prior Claim',file:'scenario-the-prior-claim.html',kw:['indigenous','prior sovereignty','compact','federal mandate','state','§16.1','§16.2','§15.7','§4.5']},
  {title:'The Departure',file:'scenario-the-departure.html',kw:['indigenous','associated community','independence','sovereign','withdrawal','§20.4','exit','citizenship']},
  {title:'The Founding Choice',file:'scenario-the-founding-choice.html',kw:['indigenous','status election','associated community','territory','§16.2','founding','inducement','sovereignty']},
  {title:'The Referendum',file:'scenario-the-referendum.html',kw:['independence','referendum','three stages','national vote','state','elections panel','nrs','§15.9']},
  {title:'The Restoration',file:'scenario-the-restoration.html',kw:['statehood','restoration','provisional','clean audit','automatic','devolution','§15.1','§15.2','§15.3']},
  {title:'The Vote',file:'scenario-the-vote.html',kw:['suspensive veto','cc','tabled','senate','2/3','override','bill lapses','§2.7','§2.6']},
  {title:'The Three Recusals',file:'scenario-the-three-recusals.html',kw:['conflict of interest','recusal','financial disclosure','ethics','monitor general','procurement','§7.10','§7.11','§9.9.a','§7.13','§9.9','voidable','gift']},
];

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

let cachedProvisions = null;

async function getProvisions() {
  if (cachedProvisions) return cachedProvisions;
  const data = require('../constitution_data.json');
  cachedProvisions = data.flatMap(a => a.provisions);
  return cachedProvisions;
}

function topScenarios(terms, n = 2) {
  return SCENARIOS
    .map(s => ({ s, score: s.kw.reduce((acc, kw) => acc + (terms.some(t => kw.includes(t) || t.includes(kw)) ? 1 : 0), 0) }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .map(x => ({ title: x.s.title, file: x.s.file }));
}

module.exports = async (req, res) => {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { question } = req.body || {};
  if (!question || !question.trim()) return res.status(400).json({ error: 'Question required' });

  try {
    const provisions = await getProvisions();
    const terms = expandQuery(question);
    const ranked = rankProvisions(provisions, terms, 5);
    const matched = ranked.slice(0, 3).map(x => x.provision);
    const gate = retrievalGate(question, ranked);
    const scenarios = topScenarios(terms, 2);

    if (matched.length === 0) {
      return res.status(200).json({
        summary: "That query didn't match any specific provisions. Try searching for a position (Legat Consul, Civic Consul), a right (expression, privacy), or a process (amendment, emergency, election, devolution).",
        provisions: [],
        scenarios: []
      });
    }

    const provisionContext = matched.map(p => `[${p.num}] ${p.name}\n${p.text}`).join('\n\n');

    const envTag = `env:${process.env.VERCEL_ENV || 'local'}`;
    const primaryPromise = anthropicMessage({
      model: MODEL,
      max_tokens: 320,
      system: `You are a plain language guide to the Federated Republic constitution. A user asked a question. You have been given the relevant constitutional provisions. Write 3-4 sentences that directly answer the question using only those provisions. If the user asks about something that doesn't exist in the constitution (like a "president" or "impeachment"), explain what the equivalent constitutional mechanism is. Be accurate, clear, and direct. Plain text only — no headings, bullets, or formatting.`,
      messages: [{ role: 'user', content: `Question: ${question.trim()}\n\nProvisions:\n${provisionContext}` }],
      tags: ['feature:navigator', 'role:primary', envTag],
    });

    const shadowPromise = gatewayToken()
      ? gatewayMessage({
          model: SHADOW_MODEL,
          max_tokens: 260,
          system: `You are a bounded constitutional QA evaluator. Use only the supplied provisions. Return ONLY valid JSON with keys: status, answer, sources. status must be ANSWER, ESCALATE, or NOT_ESTABLISHED. Use ANSWER only if the question can be answered directly from the supplied text without adding any unstated procedure, deadline, remedy, authority, or factual assumption. Use ESCALATE if multiple provisions must be reconciled, the text is ambiguous, or interpretation beyond explicit text is required. Use NOT_ESTABLISHED if the supplied text does not establish the requested fact. sources must contain only section numbers present in the supplied packet.`,
          messages: [{ role: 'user', content: `Question: ${question.trim()}\n\nDeterministic gate: ${gate.status} / ${gate.reason}\n\nProvisions:\n${provisionContext}` }],
          tags: ['feature:navigator', 'role:shadow', envTag],
        }).catch(error => ({ error }))
      : Promise.resolve(null);

    const [{ response: upstream, route, model }, shadowResult] = await Promise.all([
      primaryPromise,
      shadowPromise,
    ]);

    if (!upstream.ok) {
      const detail = await upstream.text().catch(() => '');
      return res.status(502).json({ error: 'Upstream error', detail: detail.slice(0, 200) });
    }

    console.info('[navigator-ai]', { route, model, gateStatus: gate.status, gateReason: gate.reason, matched: matched.map(p => p.num) });

    if (shadowResult?.response) {
      try {
        if (shadowResult.response.ok) {
          const shadowData = await shadowResult.response.json();
          const raw = (shadowData.content || []).filter(b => b.type === 'text').map(b => b.text).join('').trim();
          const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
          const validStatus = ['ANSWER','ESCALATE','NOT_ESTABLISHED'].includes(parsed.status) ? parsed.status : 'INVALID';
          const available = new Set(matched.map(p => p.num));
          const sources = Array.isArray(parsed.sources) ? parsed.sources.filter(s => available.has(s)) : [];
          console.info('[navigator-shadow]', {
            shadowModel: shadowResult.model,
            deterministicGate: gate.status,
            deterministicReason: gate.reason,
            shadowStatus: validStatus,
            shadowSources: sources,
            invalidSourceCount: Array.isArray(parsed.sources) ? parsed.sources.length - sources.length : 0,
          });
        } else {
          console.warn('[navigator-shadow]', { shadowModel: shadowResult.model, status: shadowResult.response.status, error: 'upstream-non-ok' });
        }
      } catch {
        console.warn('[navigator-shadow]', { shadowModel: shadowResult.model, error: 'parse-or-request-failure' });
      }
    } else if (shadowResult?.error) {
      console.warn('[navigator-shadow]', { shadowModel: SHADOW_MODEL, error: 'request-failure' });
    }

    const data = await upstream.json();
    const summary = data.content?.[0]?.text?.trim() || '';

    return res.status(200).json({
      summary,
      provisions: matched.map(p => ({ num: p.num, name: p.name })),
      scenarios
    });

  } catch (err) {
    return res.status(502).json({ error: 'Error', detail: String(err) });
  }
};
