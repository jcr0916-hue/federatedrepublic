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
  'assembly-initiated':['removal','charges','articles of removal','senate trial','§7.5'],
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
  'asylum':['non-refoulement','refugee','certification','removal','independent adjudicative process'],
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
  'audit':['statehood','jmc','monitor','compliance','provisional','failure','biennial','annual'],
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
  'jmc':['joint monitor council','statehood audit','coordination','assigned function'],
  'amendment':['constitutional','entrenchment','ratification','popular ratification'],
  'emergency':['declaration','measures','restriction','crisis','§1.19'],
  'referendum':['citizen','petition','initiative','popular','vote'],
  'citizen':['civic life','participation','referendum','petition','initiative'],
  'treaty':['ratification','senate','international','foreign','trade agreement'],
  'trade agreement':['treaty','ratification','lc','§3.6','§2.4'],
  'monetary':['ma','monetary authority','currency','fiscal integrity'],
  'federalism':['state','devolution','federal','§3.10'],
  'indigenous':['nation','compact','article xvi','§16.1'],
  'native':['indigenous','nation','compact'],
};

function phrasePresent(text, phrase) {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\function expandQuery(raw) {
  const words = raw.toLowerCase().replace(/[^a-z0-9§.\s]/g, ' ').split(/\s+/).filter(w => w && !STOP.has(w));
  const expanded = new Set(words);
  const lc = raw.toLowerCase();
  for (const [phrase, syns] of Object.entries(SYNONYMS)) {
    if (lc.includes(phrase)) syns.forEach(s => s.split(' ').forEach(w => expanded.add(w)));
  }');
  return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, 'i').test(text);
}

function expandQuery(raw) {
  const words = raw.toLowerCase().replace(/[^a-z0-9§.\s]/g, ' ').split(/\s+/).filter(w => w && !STOP.has(w));
  const expanded = new Set(words);
  const lc = raw.toLowerCase();
  for (const [phrase, syns] of Object.entries(SYNONYMS)) {
    if (phrasePresent(lc, phrase)) syns.forEach(s => s.split(' ').forEach(w => expanded.add(w)));
  }
  for (const word of words) {
    if (SYNONYMS[word]) SYNONYMS[word].forEach(s => s.split(' ').forEach(w => expanded.add(w)));
  }
  return [...expanded].filter(w => w.length > 1);
}

function scoreProvision(prov, terms) {
  const nameL = prov.name.toLowerCase();
  const numL = prov.num.toLowerCase();
  const textL = prov.text.toLowerCase();
  let score = 0;
  for (const term of terms) {
    if (numL === term || numL === '§' + term) score += 20;
    if (nameL.includes(term)) score += 3;
    if (textL.includes(term)) score += 1;
  }
  return score;
}

function rankProvisions(provisions, terms, n = 5) {
  return provisions
    .map(p => ({ provision: p, score: scoreProvision(p, terms) }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score || a.provision.num.localeCompare(b.provision.num))
    .slice(0, n);
}

function explicitSectionRefs(question) {
  return [...String(question || '').matchAll(/§\s*(\d+(?:\.\d+)*(?:\.[a-z])?)/gi)]
    .map(m => '§' + m[1]);
}

function hasInteractionLanguage(question) {
  return /\b(interact|interaction|conflict|controls|overrides?|takes precedence|together|combined|both|between|versus|vs\.?|if .* while|what happens when|what happens if|relationship between)\b/i.test(question);
}

function hasInterpretiveLanguage(question) {
  return /\b(ambiguous|ambiguity|interpret|interpretation|imply|implicit|silence|unstated|not say|doesn't say|does not say|infer|inference)\b/i.test(question);
}

function retrievalGate(question, ranked) {
  if (!ranked.length) {
    return { status: 'NOT_ESTABLISHED', reason: 'NO_MATCH' };
  }

  const refs = explicitSectionRefs(question);
  const top = ranked[0].score;
  const strongExplicit = refs.length === 1 && ranked[0].provision.num === refs[0];
  const multiStrong = ranked.filter(x => x.score >= Math.max(4, top * 0.7)).length > 1;

  if (refs.length > 1 || hasInteractionLanguage(question) || hasInterpretiveLanguage(question)) {
    return { status: 'ESCALATE', reason: 'CROSS_PROVISION_OR_INTERPRETIVE' };
  }
  if (strongExplicit) {
    return { status: 'TIER_A_CANDIDATE', reason: 'EXPLICIT_SINGLE_SECTION' };
  }
  if (multiStrong) {
    return { status: 'ESCALATE', reason: 'MULTIPLE_STRONG_MATCHES' };
  }

  // Initial rollout is intentionally conservative: a lexical lead alone is not
  // sufficient to let a cheap model answer. Natural-language queries without an
  // explicit single-section anchor remain on the escalation path until benchmark
  // evidence establishes a safe threshold.
  return { status: 'ESCALATE', reason: 'UNANCHORED_RETRIEVAL' };
}

module.exports = {
  STOP,
  SYNONYMS,
  expandQuery,
  scoreProvision,
  rankProvisions,
  explicitSectionRefs,
  hasInteractionLanguage,
  hasInterpretiveLanguage,
  phrasePresent,
  retrievalGate,
};
