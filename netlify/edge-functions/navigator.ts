// Netlify Edge Function: Constitution Navigator
// Architecture: JS keyword matching → Claude summarizes matched provisions only
// Claude never picks provisions, never writes provision names — just the summary

const SITE_URL = 'https://thefederatedrepublic.org';

const STOP = new Set(['a','an','the','is','are','was','were','be','been','being',
  'have','has','had','do','does','did','will','would','could','should','may',
  'might','can','shall','in','on','at','to','for','of','with','by','from',
  'about','what','who','how','where','when','why','which','there','here',
  'tell','me','us','give','show','explain','describe','i','you','we','they',
  'this','that','these','those','and','or','but','if','not','no','any','all',
  'some','just','also','it','its','my','your','our','their','please','want',
  'need','find','get','know','think','say','see','make']);

const SYNONYMS = {
  'president':        ['legat consul','civic consul','executive','dual executive'],
  'prime minister':   ['civic consul','government formation','assembly confidence'],
  'foreign minister': ['legat consul','foreign','defense'],
  'chancellor':       ['civic consul','legat consul','executive'],
  'impeach':          ['removal','assembly-initiated removal','no-confidence','dereliction','grounds review','legat consul removal'],
  'fire':             ['removal','dismissal','no-confidence'],
  'recall':           ['removal','referendum','popular track','legat consul removal','§2.13'],
  'remove legat':     ['§2.13','recall','popular track','legislative track','consular removal'],
  'remove consul':    ['§2.13','no-confidence','consular removal','recall'],
  'veto':             ['fiscal objection','written direction'],
  'supreme court':    ['judicial','court','justice','pool'],
  'judge':            ['judicial','court','justice','pool','appointment'],
  'law':              ['statute','legislation','assembly','legislative'],
  'vote':             ['election','assembly','nvs','suffrage','electoral'],
  'rights':           ['individual','sovereignty','floor','liberty'],
  'freedom':          ['expression','rights','individual','floor'],
  'speech':           ['expression','publication','broadcast'],
  'press':            ['expression','publication','media'],
  'religion':         ['faith','expression','belief','non-discrimination','equality'],
  'privacy':          ['personal','autonomy','information','data'],
  'discrimination':   ['equality','non-discrimination','protected'],
  'immigration':      ['certification','removal','non-refoulement','border'],
  'asylum':           ['non-refoulement','refugee','certification','removal'],
  'deportation':      ['removal','non-refoulement','certification'],
  'military':         ['defense','armed','legat consul','orders','treaty'],
  'army':             ['military','defense','armed'],
  'war':              ['defense','military','emergency','treaty'],
  'budget':           ['fiscal','appropriation','assembly','spending'],
  'money':            ['fiscal','budget','appropriation','economic'],
  'tax':              ['fiscal','revenue','budget'],
  'amendment':        ['constitutional','entrenchment','ratification'],
  'emergency':        ['declaration','measures','restriction','crisis'],
  'senate':           ['upper chamber','ratification','treaty'],
  'parliament':       ['assembly','senate','legislature','chamber'],
  'congress':         ['assembly','senate','legislature','chamber'],
  'monitor':          ['oversight','independent','lm','em','jm','ma'],
  'watchdog':         ['monitor','oversight','independent'],
  'transparency':     ['nrs','national record','publication'],
  'federalism':       ['state','devolution','federal'],
  'indigenous':       ['nation','compact','article xvi'],
  'native':           ['indigenous','nation','compact'],
  'election':         ['voting','nvs','electoral','suffrage'],
  'treaty':           ['ratification','senate','international','foreign'],
  'property':         ['seizure','compensation','economic security'],
  'healthcare':       ['social state','health','universal','insurance'],
  'education':        ['social state','school','compulsory','universal'],
  'citizen':          ['civic life','participation','referendum','petition'],
  'referendum':       ['citizen','petition','initiative','popular'],
  'lc':               ['legat consul','foreign','defense','border'],
  'cc':               ['civic consul','domestic','assembly','budget'],
};

let cachedProvisions = null;

async function getProvisions() {
  if (cachedProvisions) return cachedProvisions;
  const resp = await fetch(`${SITE_URL}/constitution_data.json`, { headers: { 'Cache-Control': 'max-age=3600' } });
  if (!resp.ok) throw new Error(`Failed to fetch constitution: ${resp.status}`);
  const data = await resp.json();
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

const SCENARIOS = [
  {title:'Ordinary Law',file:'scenario-ordinary.html',kw:['assembly','budget','bill','formation','nrs']},
  {title:'The Stalemate',file:'scenario-coordination-failure.html',kw:['lc','cc','domain','conflict','coordination','dual executive']},
  {title:'The Alliance Clause',file:'scenario-alliance-clause.html',kw:['military','treaty','lc','deploy','alliance','defense','foreign']},
  {title:'The Objection',file:'scenario-the-objection.html',kw:['fiscal','objection','cc','budget','assembly','override']},
  {title:'The Direction',file:'scenario-the-direction.html',kw:['direction','cc','prosecution','solicitor','written']},
  {title:'The Formation',file:'scenario-formation.html',kw:['formation','government','election','assembly','confidence','coalition']},
  {title:'The Recall',file:'scenario-recall.html',kw:['no-confidence','recall','cc','assembly','successor']},
  {title:'The First Nomination',file:'scenario-first-nomination.html',kw:['nomination','judicial','pool','senate','confirmation','sc','vacancy']},
  {title:'The Critical Finding',file:'scenario-critical-finding.html',kw:['lm','legislative monitor','critical','failure','fiscal']},
  {title:'The Grounds Review',file:'scenario-sdp-removal.html',kw:['removal','monitor','grounds','dereliction']},
  {title:'The Deadlock',file:'scenario-deadlock.html',kw:['monitor','appointment','speaker','deadlock','lottery']},
  {title:'The Second Declaration',file:'scenario-second-declaration.html',kw:['emergency','declaration','extension']},
  {title:'The Automatic Floor',file:'scenario-automatic-floor.html',kw:['budget','automatic','floor','appropriation']},
  {title:'The Finality Act',file:'scenario-finality-act.html',kw:['judicial','review','strip','immigration','court']},
  {title:'The Void Exception',file:'scenario-void-exception.html',kw:['amendment','entrenchment','void','unconstitutional']},
  {title:'The Order',file:'scenario-the-order.html',kw:['military','order','refusal','lawful','soldier']},
  {title:'The Organized Third',file:'scenario-organized-third.html',kw:['citizen','referendum','petition','organized']},
  {title:'The Second Path',file:'scenario-the-second-path.html',kw:['initiative','citizen','referendum','assembly']},
  {title:'The Harder Ballot',file:'scenario-harder-ballot.html',kw:['voting','state','nvs','access','residency','ballot']},
  {title:'The Recalled Senator',file:'scenario-recalled-senator.html',kw:['senator','recall','state','senate']},
  {title:'The Four Elections',file:'scenario-indigenous.html',kw:['indigenous','nation','election','compact']},
  {title:'The Departure',file:'scenario-the-departure.html',kw:['indigenous','independence','sovereign','compact']},
  {title:'The Return',file:'scenario-the-return.html',kw:['immigration','return','resident','re-entry','discrimination']},
];

function topScenarios(terms, n = 2) {
  return SCENARIOS
    .map(s => ({ s, score: s.kw.reduce((acc, kw) => acc + (terms.some(t => kw.includes(t) || t.includes(kw)) ? 1 : 0), 0) }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .map(x => ({ title: x.s.title, file: x.s.file }));
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function jsonResp(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', ...CORS } });
}

export default async (request) => {
  if (request.method === 'OPTIONS') return new Response(null, { status: 200, headers: CORS });
  if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) return jsonResp({ error: 'API key not configured' }, 500);

  let body;
  try { body = await request.json(); } catch { return jsonResp({ error: 'Invalid JSON' }, 400); }

  const question = body?.question?.trim();
  if (!question) return jsonResp({ error: 'Question required' }, 400);

  try {
    const provisions = await getProvisions();
    const terms = expandQuery(question);
    const matched = topProvisions(provisions, terms, 3);
    const scenarios = topScenarios(terms, 2);

    if (matched.length === 0) {
      return jsonResp({
        summary: "That query didn't match any specific provisions. Try searching for a position (Legat Consul, Civic Consul), a right (expression, privacy), or a process (amendment, emergency, election).",
        provisions: [],
        scenarios: []
      });
    }

    const provisionContext = matched.map(p => `[${p.num}] ${p.name}\n${p.text}`).join('\n\n');

    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 280,
        system: `You are a plain language guide to the Federated Republic constitution. A user asked a question. You have been given the relevant constitutional provisions. Write 3-4 sentences that directly answer the question using only those provisions. If the user asks about something that doesn't exist in the constitution (like a "president"), explain what the equivalent constitutional mechanism is. Be accurate, clear, and direct. Plain text only — no headings, bullets, or formatting.`,
        messages: [{ role: 'user', content: `Question: ${question}\n\nProvisions:\n${provisionContext}` }],
      }),
    });

    const data = await upstream.json();
    const summary = data.content?.[0]?.text?.trim() || '';

    return jsonResp({
      summary,
      provisions: matched.map(p => ({ num: p.num, name: p.name })),
      scenarios
    });

  } catch (err) {
    return jsonResp({ error: 'Error', detail: String(err) }, 502);
  }
};
