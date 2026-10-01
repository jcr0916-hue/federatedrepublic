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
  'detained':['habeas corpus','detention','court','72 hours'],
  'detention':['habeas corpus','detained','court','72 hours'],
  'persecution':['non-refoulement','asylum','protection','removal'],
  'returned':['non-refoulement','asylum','removal'],
  'retroactively':['retroactive punishment','retroactive criminal law'],
  'retroactive':['retroactive punishment','retroactive criminal law'],
  'discriminate':['non-discrimination','equality','benefit','burden'],
  'benefits':['non-discrimination','equality','governmental benefit'],
  'nomination':['judicial','supreme court','selection','confirmation','vacancy'],
  'refuses':['failure to act','bypass','fallback','deemed approval'],
  'stall':['failure to act','bypass','fallback'],
  'judges':['judicial','court','justice','appointment','independence'],
  'decisions':['judicial independence','court','review'],
  'cross-domain':['cross-domain emergency lead','council of ministers','§2.14.a'],
  'agree':['conflict','coordination','cross-domain emergency lead'],
  'order':['duty of refusal','unconstitutional order','executive'],
  'refuse':['duty of refusal','unconstitutional order'],
  'dies':['succession','death','legat consul','§2.9'],
  'incapacity':['executive incapacity','succession','temporary unable'],
  'pardon':['clemency','self-clemency'],
  'pardons':['clemency','self-clemency'],
  'subjects':['single subject','legislative standards'],
  'unrelated':['single subject','legislative standards'],
  'conflicts':['conflict of interest','ethics','financial disclosure'],
  'recuse':['recusal','conflict of interest','code of conduct'],
  'anonymous':['electoral finance','contribution','disclosure'],
  'contributions':['electoral finance','campaign','disclosure'],
  'classify':['classification criteria','record','nrs'],
  'classified':['classification criteria','record','nrs'],
  'noncompliance':['compliance standards','agency accountability','monitor'],
  'non-compliance':['compliance standards','agency accountability','monitor'],
  'other consul':['cross-domain assistance','§2.14.b'],
  "other's domain":['cross-domain assistance','§2.14.b'],
  'senate does nothing':['deemed approval','legislature','§3.1'],
  'fails to act':['failure to act','deemed approval','bypass'],
  'really a treaty':['classification dispute','§3.6.a'],
  'trade agreement':['treaty','ratification','lc','§3.6','§2.4','classification','§3.6.a'],
  'agency noncompliance':['agency accountability','§9.5.b','compliance standards'],
  'constitutional noncompliance':['agency accountability','§9.5.b','compliance standards'],
  'irreconcilable compromise':['institutional compromise protocol','§9.7.a'],
  'compromise failure':['institutional compromise protocol','§9.7.a'],
  'state election system':['state election non-compliance','§11.3','nvs','§11.2'],
  'temporary inability':['executive incapacity','temporary unable','§2.16'],
  'unable to exercise authority':['executive incapacity','temporary unable','§2.16'],
  'spy on citizens':['consular intelligence','judicial authorization','§2.3'],
  'spying on citizens':['consular intelligence','judicial authorization','§2.3'],
  'senate amend':['legislature','subject matter','§3.1'],
  'subject matter':['senate review','amend','§3.1'],
  'monitor generals':['monitor general selection','§9.3'],
  'selects monitor generals':['monitor general selection','§9.3'],
  'interstate commerce':['internal commerce','§12.5'],
  'split directly':['state immutability','territorial integrity','§15.7'],
  'split into two states':['state immutability','territorial integrity','§15.7'],
  'terminate its compact':['sovereign mobility','compact termination','§20.4'],
  'terminate compact':['sovereign mobility','compact termination','§20.4'],
  'two executives':['dual executive','legat consul','civic consul','council of ministers','cross-domain'],
  'dual executive':['legat consul','civic consul','council of ministers','cross-domain emergency lead'],
  'both consuls':['legat consul','civic consul','council of ministers','cross-domain'],
};

function phrasePresent(text, phrase) {
  const escaped = phrase.replace(/[.*+?^$\{\}()|[\]\\]/g, '\\$&');
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

function extractSectionRefs(text) {
  return [...String(text || '').matchAll(/§\s*(\d+(?:\.\d+)*(?:\.[a-z])?)/gi)]
    .map(m => '§' + m[1]);
}

function rankProvisions(provisions, terms, n = 5) {
  const ranked = provisions
    .map(p => ({ provision: p, score: scoreProvision(p, terms) }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score || a.provision.num.localeCompare(b.provision.num));

  const selected = ranked.slice(0, Math.min(3, n));
  const selectedNums = new Set(selected.map(x => x.provision.num));
  const byNum = new Map(provisions.map(p => [p.num, p]));

  // Cross-references from the strongest retrieved provisions are evidence, not
  // model inference. Reserve packet space for them before lower-ranked lexical
  // matches are added.
  for (const source of ranked.slice(0, 3)) {
    for (const ref of extractSectionRefs(source.provision.text)) {
      if (selected.length >= n) break;
      if (selectedNums.has(ref)) continue;
      const provision = byNum.get(ref);
      if (!provision) continue;
      selected.push({ provision, score: Math.max(1, source.score - 1), via: source.provision.num });
      selectedNums.add(ref);
    }
    if (selected.length >= n) break;
  }

  for (const item of ranked) {
    if (selected.length >= n) break;
    if (selectedNums.has(item.provision.num)) continue;
    selected.push(item);
    selectedNums.add(item.provision.num);
  }

  return selected.slice(0, n);
}

function explicitSectionRefs(question) {
  return [...String(question || '').matchAll(/§\s*(\d+(?:\.\d+)*(?:\.[a-z])?)/gi)]
    .map(m => '§' + m[1]);
}

function hasInteractionLanguage(question) {
  return /\b(interact|interaction|conflict|controls|overrides?|takes precedence|together|combined|both|between|versus|vs\.?|if .* while|what happens when|what happens if|relationship between)\b/i.test(question);
}

function hasInterpretiveLanguage(question) {
  return /\b(ambiguous|ambiguity|interpret|interpretation|imply|implicit|silence|unstated|not say|doesn't say|does not say|infer|inference|could|should|abuse|abusive|reconcile|reconciled|reconciliation|indirect|indirectly|discretion|strategic|strategically|prefer|preferred)\b/i.test(question);
}


function normalizeTitleText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/^the\s+/, '');
}

function titleEligible(name) {
  const tokens = normalizeTitleText(name).split(' ').filter(Boolean);
  return tokens.length >= 2;
}

function uniqueTitleMatch(question, provisions) {
  if (hasInteractionLanguage(question) || hasInterpretiveLanguage(question)) return null;

  const q = ` ${normalizeTitleText(question)} `;
  const matches = provisions
    .filter(p => {
      if (!titleEligible(p.name)) return false;
      const title = normalizeTitleText(p.name);
      return q.includes(` ${title} `);
    })
    .map(p => ({ provision: p, title: normalizeTitleText(p.name) }))
    .sort((a, b) => b.title.length - a.title.length);

  if (!matches.length) return null;
  if (matches.length === 1) return matches[0].provision;

  const mostSpecific = matches[0];
  const nestedOnly = matches.slice(1).every(m =>
    ` ${mostSpecific.title} `.includes(` ${m.title} `)
  );

  return nestedOnly ? mostSpecific.provision : null;
}


function broadTopicMatch(question) {
  const q = normalizeTitleText(question)
    .replace(/^what is /, '')
    .replace(/^what are /, '')
    .replace(/^explain /, '')
    .replace(/^how does /, '')
    .replace(/^how do /, '')
    .trim();

  if (/^(judicial selection|judicial appointments?|judge selection|judicial appointment process)$/.test(q)) {
    return {
      topic: 'judicial-selection',
      sections: ['§4.2', '§4.4', '§4.4.a'],
    };
  }

  if (/^(how are judges selected|how are judges appointed)$/.test(normalizeTitleText(question))) {
    return {
      topic: 'judicial-selection',
      sections: ['§4.2', '§4.4', '§4.4.a'],
    };
  }

  return null;
}



function contextualSectionRefs(question) {
  const q = normalizeTitleText(question);
  const dualExecutive =
    /\b(two|dual) executives?\b/.test(q) ||
    /\bboth (?:the )?(?:consuls?|executives?)\b/.test(q) ||
    (/\bcivic consul\b/.test(q) && /\blegat consul\b/.test(q));

  if (dualExecutive) {
    return ['§2.1', '§2.5', '§2.14', '§2.14.a', '§2.14.b'];
  }

  return [];
}

function baseQueryTerms(raw) {
  return String(raw || '')
    .toLowerCase()
    .replace(/[^a-z0-9§.\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w && !STOP.has(w) && w.length > 2);
}

function provisionContainsTerm(provision, term) {
  const hay = `${provision.num} ${provision.name} ${provision.text}`.toLowerCase();
  return hay.includes(term);
}

const GENERIC_FALLBACK_TERMS = new Set([
  'happens','happen','system','process','fails','failed','failure','vote','voting',
  'government','they','them','someone','somebody','nobody','acts','act','acting',
  'decides','decide','decision','responsible','wrong','delay','delays','forever',
  'deadline','passes','challenge','overridden','override','conflict','emergency',
  'executive','legislature','state','court','agency','another','route','long',
  'last','final','automatically','automatic','reverse','sides','disagree'
]);

function subjectSpecificity(question) {
  const terms = baseQueryTerms(question);
  const specific = terms.filter(t => !GENERIC_FALLBACK_TERMS.has(t));
  return { terms, specific, score: specific.length };
}

function retrievalSufficiency(question, ranked) {
  if (!ranked.length) {
    return { sufficient: false, reason: 'NO_MATCH', coverage: 0 };
  }

  const specificity = subjectSpecificity(question);
  if (specificity.score < 2) {
    return { sufficient: false, reason: 'SUBJECT_UNDERSPECIFIED', coverage: 0, specificity: specificity.score };
  }

  const refs = explicitSectionRefs(question);
  const topFive = ranked.slice(0, 5);
  const topNums = new Set(topFive.map(x => x.provision.num));

  if (refs.length && refs.some(ref => !topNums.has(ref))) {
    return { sufficient: false, reason: 'EXPLICIT_SECTION_MISSING', coverage: 0 };
  }

  const rawTerms = baseQueryTerms(question);
  const covered = rawTerms.filter(term =>
    topFive.some(x => provisionContainsTerm(x.provision, term))
  );
  const coverage = rawTerms.length ? covered.length / rawTerms.length : 0;

  const top = topFive[0]?.score || 0;
  const second = topFive[1]?.score || 0;
  const strongCount = topFive.filter(x => x.score >= 4).length;
  const expanded = expandQuery(question);
  const topConceptHits = expanded.filter(term =>
    provisionContainsTerm(topFive[0].provision, term)
  ).length;

  if (hasInteractionLanguage(question)) {
    if (strongCount < 2 || second < 4 || coverage < 0.45) {
      return { sufficient: false, reason: 'INTERACTION_PACKET_WEAK', coverage };
    }
    return { sufficient: true, reason: 'INTERACTION_PACKET_SUPPORTED', coverage };
  }

  if (hasInterpretiveLanguage(question)) {
    if (top < 6 || coverage < 0.5) {
      return { sufficient: false, reason: 'INTERPRETIVE_PACKET_WEAK', coverage };
    }
    return { sufficient: true, reason: 'INTERPRETIVE_PACKET_SUPPORTED', coverage };
  }

  if (top < 6 || (coverage < 0.5 && topConceptHits < 3)) {
    return { sufficient: false, reason: 'UNANCHORED_PACKET_WEAK', coverage };
  }

  return { sufficient: true, reason: 'UNANCHORED_PACKET_SUPPORTED', coverage };
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
  extractSectionRefs,
  explicitSectionRefs,
  hasInteractionLanguage,
  hasInterpretiveLanguage,
  phrasePresent,
  normalizeTitleText,
  titleEligible,
  uniqueTitleMatch,
  broadTopicMatch,
  contextualSectionRefs,
  baseQueryTerms,
  subjectSpecificity,
  retrievalSufficiency,
  retrievalGate,
};
