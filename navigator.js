// Vercel Serverless Function: Constitution Navigator
// Node.js format — compatible with all Vercel project types

const path = require('path');

const STOP = new Set(['a','an','the','is','are','was','were','be','been','being',
  'have','has','had','do','does','did','will','would','could','should','may',
  'might','can','shall','in','on','at','to','for','of','with','by','from',
  'about','what','who','how','where','when','why','which','there','here',
  'tell','me','us','give','show','explain','describe','i','you','we','they',
  'this','that','these','those','and','or','but','if','not','no','any','all',
  'some','just','also','it','its','my','your','our','their','please','want',
  'need','find','get','know','think','say','see','make']);

const SYNONYMS = {
  'president':['legat consul','civic consul','executive','dual executive'],
  'prime minister':['civic consul','government formation','assembly confidence'],
  'foreign minister':['legat consul','foreign','defense'],
  'chancellor':['civic consul','legat consul','executive'],
  'lc':['legat consul','foreign','defense','border','intelligence'],
  'cc':['civic consul','domestic','assembly','budget','social'],
  'impeach':['removal','assembly-initiated removal','no-confidence','dereliction','grounds review','legat consul removal'],
  'fire':['removal','dismissal','no-confidence'],
  'recall':['removal','referendum','popular track','legat consul removal','§2.13'],
  'remove legat':['§2.13','recall','popular track','legislative track','consular removal'],
  'remove consul':['§2.13','no-confidence','consular removal','recall'],
  'assembly-initiated':['removal','charges','articles of removal','senate trial','§3.10'],
  'articles of removal':['assembly','senate','removal','charges'],
  'veto':['fiscal objection','written direction'],
  'law':['statute','legislation','assembly','legislative'],
  'parliament':['assembly','senate','legislature','chamber'],
  'congress':['assembly','senate','legislature','chamber'],
  'senate':['upper chamber','ratification','treaty','states'],
  'bill':['legislation','assembly','statute','passage'],
  'filibuster':['assembly','debate','passage','legislative'],
  'supreme court':['judicial','court','justice','pool'],
  'judge':['judicial','court','justice','pool','appointment'],
  'court':['judicial','sc','justice','appeal'],
  'vote':['election','nvs','electoral','suffrage','franchise'],
  'election':['voting','nvs','electoral','suffrage','elections panel'],
  'ballot':['election','nvs','voting','access','suffrage'],
  'franchise':['vote','election','access','suffrage'],
  'rights':['individual','sovereignty','floor','liberty'],
  'freedom':['expression','rights','individual','floor'],
  'speech':['expression','publication','broadcast'],
  'press':['expression','publication','media'],
  'religion':['faith','expression','belief','non-discrimination','equality'],
  'privacy':['personal','autonomy','information','data','surveillance'],
  'discrimination':['equality','non-discrimination','protected'],
  'property':['seizure','compensation','economic security'],
  'healthcare':['social state','health','universal','insurance'],
  'education':['social state','school','compulsory','universal'],
  'immigration':['certification','removal','non-refoulement','border','dual gate'],
  'asylum':['non-refoulement','refugee','certification','removal','asylum court'],
  'deportation':['removal','non-refoulement','certification'],
  'refugee':['asylum','non-refoulement','protection'],
  'resident':['legal resident','certification','sponsorship','dual gate'],
  'military':['defense','armed','legat consul','orders','treaty','authorized purposes'],
  'army':['military','defense','armed'],
  'war':['defense','military','emergency','treaty'],
  'intelligence':['legat consul','foreign','surveillance','warrant'],
  'security':['border','intelligence','military','emergency'],
  'budget':['fiscal','appropriation','assembly','spending','nrf'],
  'money':['fiscal','budget','appropriation','economic'],
  'tax':['fiscal','revenue','budget','nrf','taxing power'],
  'spending':['appropriation','budget','fiscal','nrf'],
  'state':['territory','devolution','statehood','provisional','senate','audit'],
  'territory':['provisional','statehood','devolution','state','incorporation'],
  'provisional':['provisional status','statehood','audit','devolution','senate seats','§15.1.a'],
  'devolution':['mandatory','voluntary','provisional','statehood','territory','audit failure','§15.3','§15.4'],
  'statehood':['territory','audit','provisional','qualification','senate','§15.2'],
  'audit':['statehood','jmc','monitor','compliance','provisional','failure','annual'],
  'independence':['§15.9','referendum','sovereignty','state','petition','stage one'],
  'secession':['independence','§15.9','referendum','state','voluntary'],
  'local government':['municipality','city','state','fiscal','§15.8'],
  'incorporation':['voluntary','territory','petition','§15.6','treaty'],
  'nrs':['national record','publication','transparency','permanent','§10.1'],
  'national record':['nrs','publication','transparency','permanent'],
  'publication':['nrs','transparency','record','permanent'],
  'monitor':['oversight','independent','lm','em','jm','jmc','ma'],
  'watchdog':['monitor','oversight','independent'],
  'transparency':['nrs','national record','publication'],
  'lm':['legislative monitor','audit','legislature','compliance'],
  'em':['executive monitor','audit','executive','compliance'],
  'jm':['judicial monitor','audit','court','compliance'],
  'jmc':['joint monitor committee','statehood audit','coordination','assigned function'],
  'amendment':['constitutional','entrenchment','ratification','popular ratification'],
  'emergency':['declaration','measures','restriction','crisis','§1.19'],
  'referendum':['citizen','petition','initiative','popular','vote'],
  'citizen':['civic life','participation','referendum','petition','initiative'],
  'treaty':['ratification','senate','international','foreign','trade agreement'],
  'trade agreement':['treaty','ratification','lc','§3.6','§2.4'],
  'monetary':['ma','monetary authority','currency','fiscal integrity'],
  'federalism':['state','devolution','federal','§3.14'],
  'indigenous':['nation','compact','article xvi','§16.1'],
  'native':['indigenous','nation','compact'],
};

const SCENARIOS = [
  {title:'Ordinary Law',file:'scenario-ordinary.html',kw:['assembly','budget','bill','formation','nrs','ordinary']},
  {title:'The Stalemate',file:'scenario-coordination-failure.html',kw:['lc','cc','domain','conflict','coordination','dual executive']},
  {title:'The Alliance Clause',file:'scenario-alliance-clause.html',kw:['military','treaty','lc','deploy','alliance','defense','foreign']},
  {title:'The Twenty-Four Hours',file:'scenario-the-twenty-four-hours.html',kw:['incapacity','council of ministers','restoration','succession','declination','acting','unable','2.16','executive incapacity','ministers']},
  {title:'The Objection',file:'scenario-the-objection.html',kw:['fiscal','objection','cc','budget','assembly','override']},
  {title:'The Direction',file:'scenario-the-direction.html',kw:['direction','cc','prosecution','solicitor','written']},
  {title:'The First Nomination',file:'scenario-first-nomination.html',kw:['nomination','judicial','pool','senate','confirmation','sc','vacancy']},
  {title:'The Finality Act',file:'scenario-finality-act.html',kw:['judicial','review','strip','immigration','court']},
  {title:'The Critical Finding',file:'scenario-critical-finding.html',kw:['lm','legislative monitor','critical','failure','fiscal']},
  {title:'The Grounds Review',file:'scenario-sdp-removal.html',kw:['removal','monitor','grounds','dereliction']},
  {title:'The Deadlock',file:'scenario-deadlock.html',kw:['monitor','appointment','speaker','deadlock','lottery']},
  {title:'The Second Declaration',file:'scenario-second-declaration.html',kw:['emergency','declaration','extension']},
  {title:'The Automatic Floor',file:'scenario-automatic-floor.html',kw:['budget','automatic','floor','appropriation']},
  {title:'The Void Exception',file:'scenario-void-exception.html',kw:['amendment','entrenchment','void','unconstitutional']},
  {title:'The Order',file:'scenario-the-order.html',kw:['military','order','refusal','lawful','soldier']},
  {title:'The Organized Third',file:'scenario-organized-third.html',kw:['citizen','referendum','petition','organized']},
  {title:'The Second Path',file:'scenario-the-second-path.html',kw:['initiative','citizen','referendum','assembly']},
  {title:'The Harder Ballot',file:'scenario-harder-ballot.html',kw:['voting','state','nvs','access','residency','ballot']},
  {title:'The Long Count',file:'scenario-long-count.html',kw:['election','count','certification','nvs','results','elections panel']},
  {title:'The Recalled Senator',file:'scenario-recalled-senator.html',kw:['senator','recall','state','senate']},
  {title:'The Map',file:'scenario-the-map.html',kw:['redistricting','district','map','lm','compactness','elections']},
  {title:'The Sponsoring State',file:'scenario-sponsoring-state.html',kw:['immigration','sponsorship','state','resident','credentials']},
  {title:'The Audit',file:'scenario-the-audit.html',kw:['statehood','territory','provisional','qualification','upgrade','audit']},
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
  {title:'The Formula',file:'scenario-the-formula.html',kw:['fiscal equalization','em','fiscal capacity','social state','90 days','§12.8','§12.1','monetary authority']},
  {title:'The Graduation',file:'scenario-the-graduation.html',kw:['voting','residency','nvs','student','ordinary','individual sovereignty','§1.2','§11.2','ballot']},
  {title:'The Holdout',file:'scenario-the-holdout.html',kw:['sc nomination','senate','refuses vote','day 120','judicial','confirmation','§4.4','holdout']},
  {title:'The Prior Claim',file:'scenario-the-prior-claim.html',kw:['indigenous','prior sovereignty','compact','federal mandate','state','§16.1','§16.2','§15.7','§4.5']},
  {title:'The Departure',file:'scenario-the-departure.html',kw:['indigenous','associated community','independence','sovereign','withdrawal','§20.4','exit','citizenship']},
  {title:'The Founding Choice',file:'scenario-the-founding-choice.html',kw:['indigenous','status election','associated community','territory','§16.2','founding','inducement','sovereignty']},
  {title:'The Referendum',file:'scenario-the-referendum.html',kw:['independence','referendum','irrevocable','state','elections panel','nrs','§15.9','§2.14']},
  {title:'The Restoration',file:'scenario-the-restoration.html',kw:['statehood','restoration','provisional','clean audit','automatic','devolution','§15.1','§15.2','§15.3']},
  {title:'The Vote',file:'scenario-the-vote.html',kw:['suspensive veto','cc','tabled','senate','2/3','override','bill lapses','§2.7','§2.6']},
  {title:'The Three Recusals',file:'scenario-the-three-recusals.html',kw:['conflict of interest','recusal','financial disclosure','ethics','monitor general','procurement','§12.4','§12.4.b','§12.4.c','§9.9','voidable','gift']},
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

function expandQuery(raw) {
  const words = raw.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w && !STOP.has(w));
  const expanded = new Set(words);
  const lc = raw.toLowerCase();
  for (const [phrase, syns] of Object.entries(SYNONYMS)) {
    if (lc.includes(phrase)) syns.forEach(s => s.split(' ').forEach(w => expanded.add(w)));
  }
  for (const word of words) {
    if (SYNONYMS[word]) SYNONYMS[word].forEach(s => s.split(' ').forEach(w => expanded.add(w)));
  }
  return [...expanded].filter(w => w.length > 1);
}

function scoreProvision(prov, terms) {
  const nameL = prov.name.toLowerCase();
  const textL = prov.text.toLowerCase();
  let score = 0;
  for (const term of terms) {
    if (nameL.includes(term)) score += 3;
    if (textL.includes(term)) score += 1;
  }
  return score;
}

function topProvisions(provisions, terms, n = 3) {
  return provisions
    .map(p => ({ p, s: scoreProvision(p, terms) }))
    .filter(x => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, n)
    .map(x => x.p);
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

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

  const { question } = req.body || {};
  if (!question || !question.trim()) return res.status(400).json({ error: 'Question required' });

  try {
    const provisions = await getProvisions();
    const terms = expandQuery(question);
    const matched = topProvisions(provisions, terms, 3);
    const scenarios = topScenarios(terms, 2);

    if (matched.length === 0) {
      return res.status(200).json({
        summary: "That query didn't match any specific provisions. Try searching for a position (Legat Consul, Civic Consul), a right (expression, privacy), or a process (amendment, emergency, election, devolution).",
        provisions: [],
        scenarios: []
      });
    }

    const provisionContext = matched.map(p => `[${p.num}] ${p.name}\n${p.text}`).join('\n\n');

    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 320,
        system: `You are a plain language guide to the Federated Republic constitution. A user asked a question. You have been given the relevant constitutional provisions. Write 3-4 sentences that directly answer the question using only those provisions. If the user asks about something that doesn't exist in the constitution (like a "president" or "impeachment"), explain what the equivalent constitutional mechanism is. Be accurate, clear, and direct. Plain text only — no headings, bullets, or formatting.`,
        messages: [{ role: 'user', content: `Question: ${question.trim()}\n\nProvisions:\n${provisionContext}` }],
      }),
    });

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
