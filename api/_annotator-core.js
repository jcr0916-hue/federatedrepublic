const SYSTEM = `You are a source-bound constitutional design analyst for the Federated Republic. When a user clicks on a provision, explain the structural rationale supported by the supplied current constitutional text and design principles — the why only to the extent the sources support it.

Your annotation should cover:
1. The constitutional principle this provision embodies
2. The design choice expressed in the current text and its practical effect; do not invent drafting history or rejected alternatives. Where the packet's RECORDED DESIGN HISTORY gives a reason or a rejected alternative for this provision, state it plainly as part of the explanation
3. How this provision connects to or depends on other provisions
4. What failure mode or abuse this provision is guarding against

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

These design principles are interpretive lenses, not evidence of drafting intent. You may say that a mechanism structurally aligns with a principle. Do not say the drafters chose, intended, anticipated, deliberately created, or preferred something unless the supplied constitutional text itself establishes that motive or the RECORDED DESIGN HISTORY records it.

The application has already performed constitutional retrieval. Treat the supplied SOURCE PACKET as the complete research basis for this annotation. Do not search for or assume rules outside the packet. The target provision is authoritative. Related provisions are exact current constitutional text supplied only because the application found a structural, citation, lexical, or backlink relationship; their presence does not make them controlling.

Distinguish interpretation from explicit requirements; acknowledge ambiguity instead of supplying missing rules. Do not invent enforcement mechanisms, appointment rules, audit powers, deadlines, standards, remedies, or cross-reference effects. Never invent a provision number or label. Do not state that information is public, reviewable, enforceable, or justiciable unless the supplied constitutional text actually provides that result. When a rationale is an inference from the text's structure, say what the mechanism does ("This keeps…", "The effect is…") rather than attributing a purpose to the drafters.

When comparing procedures, track each mechanism separately. Never transfer a trigger, deadline, duration, override, fallback, repeat-use rule, or consequence from one provision to another because the mechanisms look similar. In particular, distinguish an initial review/action window from the duration or legal effect of an instrument exercised during that window. Do not infer a reason for a procedural difference unless the text states one. Preserve the text's exact scope concepts when describing the guarded failure mode: do not substitute an adjacent concept that changes the rule (for example, do not turn consent into compensation, official capacity into all gifts, or inaction into rejection).

DEFINED TERMS: a related provision labeled \"defining provision of <term>\" is the provision that sets that office's or body's domain, term, or scope, and it may sit in another Article. Use it to explain how the target relies on that term. When the packet supplies a term's definition, use it directly, as part of the explanation.\n\nRECORDED DESIGN HISTORY: the packet may include dated entries from the project's own change log that cite the target provision's number. Section numbers in an entry are those in force on its date and may since have moved or been reused; use an entry only when its subject clearly matches the target text, and ignore one that does not. Use what an entry states and add no motive it does not state.

VOICE: Write as a knowledgeable colleague explaining the provision to an intelligent reader, in direct, plain prose. State what the provision does and why it works that way as settled fact, naming concrete actors and consequences. Work recorded history into the explanation itself ("The reason is…", "It replaced…") and never refer to the packet, the sources, the change log, log entries, labels, or dates. Say only what is there: do not remark on what the text, the history, or the sources leave unsaid, and do not end on a limitation or caveat. Where a question is left open, mention it only when it changes how the provision works, and then as a plain fact about the provision ("the Assembly sets the interval by statute"). Avoid scholarly apparatus such as "on the text's own terms," "the section's reach," "the supplied," "this must be read as," and stacked qualifiers.

TARGET-FIRST COVERAGE: Before writing, check every numbered subsection or material clause of the TARGET provision. Prioritize its actors, scope limits, thresholds, deadlines, defaults, exceptions, fallbacks, repeat-use rules, and consequences before spending space on related provisions. A related provision is useful only if it clarifies a direct dependency or comparison; do not let related material displace a material target rule.\n\nOUTPUT CONTRACT: Write exactly 3 prose paragraphs with no headings, bullets, numbering, markdown labels, or section titles. Use roughly 350–500 words and never exceed 525 words. Finish the final sentence. If the packet contains more material than fits, omit secondary comparisons before omitting a material target mechanic.`;

let cachedData = null;
let cachedHistory = null;

const STOP_WORDS = new Set([
  'about','after','again','against','also','among','because','before','being','between',
  'both','could','does','each','from','further','have','having','into','more','must',
  'only','other','over','same','shall','should','such','than','that','their','there',
  'these','they','this','through','under','until','upon','where','which','while','with',
  'within','would','constitution','constitutional','provision','section','republic',
]);

function getConstitutionData() {
  if (!cachedData) cachedData = require('../constitution_data.json');
  return cachedData;
}

function getAnnotationHistory() {
  if (!cachedHistory) cachedHistory = require('../annotation-history.json');
  return cachedHistory;
}

function extractRefs(text) {
  const refs = String(text || '').match(/§\d+(?:\.\d+)*(?:\.[a-z])?/gi) || [];
  return [...new Set(refs)];
}

function exactRefRegex(num) {
  const escaped = String(num).replace(/[.*+?^$()|[\]\\]/g, '\\$&');
  return new RegExp(escaped + '(?![\\w.])');
}

function familyBase(num) {
  const m = String(num || '').match(/^(§\d+(?:\.\d+)*)\.[a-z]$/i);
  return m ? m[1] : String(num || '');
}

function isLetteredSibling(candidateNum, base) {
  const escaped = base.replace(/[.*+?^$()|[\]\\]/g, '\\$&');
  return new RegExp(`^${escaped}\\.[a-z]$`, 'i').test(candidateNum);
}

function termsFor(text) {
  return new Set(
    String(text || '')
      .toLowerCase()
      .replace(/§\d+(?:\.\d+)*(?:\.[a-z])?/g, ' ')
      .match(/[a-z][a-z-]{3,}/g)
      ?.filter(word => !STOP_WORDS.has(word)) || []
  );
}

function similarityScore(a, b) {
  const aa = termsFor(`${a.name} ${a.text}`);
  const bb = termsFor(`${b.name} ${b.text}`);
  let shared = 0;
  for (const term of aa) if (bb.has(term)) shared++;
  if (!shared) return 0;
  return shared / Math.sqrt(Math.max(1, aa.size * bb.size));
}

function mechanicCues(text, limit = 3) {
  const normalized = String(text || '').replace(/\s+/g, ' ').trim();
  if (!normalized) return [];
  const clauses = normalized
    .split(/(?<=[.!?;])\s+(?=(?:\(\d+\)\s*)?(?:If|Where|When|Upon|Unless|After|Before|Until|Failing)\b)/g)
    .map(x => x.trim())
    .filter(Boolean);
  const cuePattern = /\b(?:if|where|when|upon|unless|failing|fails?|failure|lapses?|does not act|has not made|deadline|within \d+|automatically|automatic|may not|void|override|reintroduced|repeat)\b/i;
  const out = [];
  for (const clause of clauses) {
    if (!cuePattern.test(clause)) continue;
    const clipped = clause.length > 460 ? clause.slice(0, 457).replace(/\s+\S*$/, '') + '...' : clause;
    out.push(clipped);
    if (out.length >= limit) break;
  }
  return out;
}

function targetCoverageCues(text, limit = 10) {
  const normalized = String(text || '').replace(/\s+/g, ' ').trim();
  if (!normalized) return [];
  const sentences = normalized
    .split(/(?<=[.!?;])\s+/g)
    .map(x => x.trim())
    .filter(Boolean);
  const priority = /\b(?:must|shall|may not|cannot|only|except|unless|within \d+|not exceed|automatic|automatically|lapse|void|override|ratif|regardless|by operation of law|defined by statute|requires?)\b/i;
  const selected = sentences.filter(sentence => priority.test(sentence));
  const source = selected.length ? selected : sentences;
  const out = [];
  for (const sentence of source) {
    const clipped = sentence.length > 500
      ? sentence.slice(0, 497).replace(/\s+\S*$/, '') + '...'
      : sentence;
    if (!out.includes(clipped)) out.push(clipped);
    if (out.length >= limit) break;
  }
  return out;
}

function formatProvision(prov, label) {
  return `${label} [${prov.num}] ${prov.name}\n${prov.text}`;
}


// Defining-provision lookup. A provision often uses a term (an office or body
// such as "Legat Consul") whose scope is set by another provision, possibly in
// another Article. Terms are taken from provision names; the anchor for a term
// is the provision whose name opens with it ("The Legat Consul — Domain and
// Term"), else the lowest-numbered unlettered provision naming it.
let cachedAnchors = null;

function nameTerm(name) {
  const m = String(name || '').match(/^(?:The\s+)?([A-Z][A-Za-z'’-]*(?:\s+[A-Z][A-Za-z'’-]*)*)/);
  return m ? m[1].trim() : '';
}

function sortKey(num) {
  return String(num).replace(/^§/, '').split('.').map(x => /^\d+$/.test(x) ? x.padStart(3, '0') : x).join('.');
}

function getTermAnchors(data = getConstitutionData()) {
  if (data === getConstitutionData() && cachedAnchors) return cachedAnchors;
  const all = data.flatMap(a => a.provisions.map(p => ({ ...p, article: a.heading })));
  const anchors = new Map(); // term -> provision
  const opener = new Map();  // provisions whose name is "<Term> — ..." or "The <Term>"
  for (const p of all) {
    const term = nameTerm(p.name);
    if (term.split(/\s+/).length < 2 && !/^The\s/.test(p.name)) continue;
    const full = /\s[—-]\s/.test(p.name) || new RegExp(`^(?:The\\s+)?${term}$`).test(p.name);
    if (full && !opener.has(term)) opener.set(term, p);
  }
  for (const [term, p] of opener) anchors.set(term, p);
  const result = { all, anchors };
  if (data === getConstitutionData()) cachedAnchors = result;
  return result;
}

function definingAnchors(target, data, exclude = new Set(), limit = 2) {
  const { all, anchors } = getTermAnchors(data);
  const N = all.length || 1;
  const scored = [];
  for (const [term, prov] of anchors) {
    if (prov.num === target.num || exclude.has(prov.num)) continue;
    const src = `\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`;
    const inTarget = (target.text.match(new RegExp(src, 'g')) || []).length;
    if (!inTarget) continue;
    const once = new RegExp(src);
    const df = all.filter(p => once.test(p.text)).length || 1;
    scored.push({ term, provision: prov, score: inTarget * Math.log(1 + N / df) });
  }
  return scored
    .sort((a, b) => b.score - a.score || sortKey(a.provision.num).localeCompare(sortKey(b.provision.num)))
    .slice(0, limit);
}

const HISTORY_LIMIT = 3;
const HISTORY_CLIP = 1100;

function clipAtSentence(text, max) {
  const t = String(text || '').trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const end = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('; '));
  return (end > max * 0.5 ? cut.slice(0, end + 1) : cut.replace(/\s+\S*$/, '')) + ' [clipped]';
}

// Dated change-log entries (annotation-history.json, built from the
// Constitutional History pages) that cite this exact section number.
function historyFor(num, limit = HISTORY_LIMIT) {
  const entries = (getAnnotationHistory().entries || []).filter(e => (e.refs || []).includes(num));
  return entries
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
    .slice(0, limit);
}

function formatHistory(entries) {
  if (!entries.length) return '(none)';
  return entries.map((e, i) =>
    `[HISTORY ${i + 1}] ${e.label} — ${e.title}\n${clipAtSentence(e.text, HISTORY_CLIP)}`
  ).join('\n\n');
}

function buildContextPacket(num, data = getConstitutionData(), relatedLimit = 4) {
  const articles = data.filter((article) => Array.isArray(article.provisions));
  const all = articles.flatMap((article) =>
    article.provisions.map((prov) => ({ ...prov, article: article.heading }))
  );
  const byNum = new Map(all.map(p => [p.num, p]));
  const target = byNum.get(num);
  if (!target) return null;

  const sameArticle = all.filter(
    (prov) => prov.article === target.article && prov.num !== target.num
  );

  const related = [];
  const seen = new Set([target.num]);
  const add = (prov, relation) => {
    if (!prov || seen.has(prov.num) || related.length >= relatedLimit) return;
    seen.add(prov.num);
    related.push({ provision:prov, relation });
  };

  // Keep numbered mechanism families together first.
  const base = familyBase(target.num);
  if (base !== target.num) add(byNum.get(base), 'structural parent');
  for (const candidate of sameArticle) {
    if (isLetteredSibling(candidate.num, base)) add(candidate, 'structural sibling');
  }

  // Exact citations from the target are high-confidence relationships.
  for (const ref of extractRefs(target.text)) add(byNum.get(ref), 'explicit citation');

  // Defining provisions for terms the target relies on, across Articles.
  for (const item of definingAnchors(target, data, seen, 2)) {
    add(item.provision, `defining provision of "${item.term}"`);
  }

  // Add the most textually similar provisions from the same Article. This
  // captures parallel mechanisms such as §2.3.a and §2.7 without sending the
  // model the entire Article.
  const lexical = sameArticle
    .filter(p => !seen.has(p.num))
    .map(p => ({ provision:p, score:similarityScore(target, p) }))
    .filter(x => x.score > 0)
    .sort((a,b) => b.score - a.score || a.provision.num.localeCompare(b.provision.num));
  for (const item of lexical.slice(0, 2)) add(item.provision, 'same-article lexical relative');

  const cueSources = [target, ...related.map(x => x.provision)];
  const cueLines = [];
  for (const provision of cueSources) {
    const cues = mechanicCues(provision.text, 3);
    if (!cues.length) continue;
    cueLines.push(`[${provision.num}] ${provision.name}`);
    cues.forEach(cue => cueLines.push(`- ${cue}`));
    if (cueLines.length >= 24) break;
  }

  const articleIndex = sameArticle
    .map(p => `[${p.num}] ${p.name}`)
    .join('\n');
  const targetCues = targetCoverageCues(target.text, 10);

  const sections = [
    'SOURCE PACKET — generated deterministically from constitution_data.json',
    '',
    'TARGET PROVISION',
    formatProvision(target, 'TARGET'),
    '',
    'TARGET COVERAGE CUES — verbatim target sentences selected mechanically for thresholds, limits, defaults, exceptions, fallbacks, and consequences; material cues should not be displaced by related-provision discussion',
    targetCues.length ? targetCues.map(cue => `- ${cue}`).join('\n') : '(none)',
    '',
    'RELATED EXACT-TEXT PROVISIONS',
    related.length
      ? related.map((item, index) =>
          formatProvision(item.provision, `RELATED ${index + 1} — ${item.relation}`)
        ).join('\n\n')
      : '(none)',
    '',
    'PROCEDURAL CUES — verbatim excerpts extracted mechanically to keep triggers, deadlines, durations, and fallback consequences attached to the provision that states them',
    cueLines.length ? cueLines.join('\n') : '(none)',
    '',
    `ARTICLE INDEX — ${target.article} (names only; not authority for mechanics)`,
    articleIndex || '(none)',
    '',
    'RECORDED DESIGN HISTORY — dated entries from the project\'s own Constitutional History change log that cite this provision\'s number (most recent first). Section numbers are as of each entry\'s date and may since have moved; use an entry only when its subject matches the target text above',
    formatHistory(historyFor(target.num)),
    '',
    'PACKET RULE',
    'The target provision is the controlling subject. Related provisions are included only to illuminate a structural, explicit-citation, defining-provision, or same-article lexical relationship. Downstream backlinks are intentionally excluded because they often distract from the target mechanics. Never transfer a trigger, deadline, duration, override, fallback, repeat-use rule, or consequence from a related provision to the target. The Article index supplies names only and cannot support a claim about mechanics.',
  ];

  return {
    target,
    packet: sections.join('\n'),
    related,
    sameArticle,
    explicitCrossRefs: related.filter(x => x.relation === 'explicit citation').map(x => x.provision),
    backlinks: [],
  };
}

function buildAnnotationUserPrompt(context, retryReason = null) {
  const retry = retryReason
    ? `\n\nREWRITE REQUIRED: ${retryReason}. Rewrite the full annotation from the beginning. Obey the three-paragraph, no-heading, no-bullet, 525-word hard limit and preserve source accuracy.`
    : '';
  return `Explain the design rationale for ${context.target.num} — ${context.target.name}. Use only the verified source packet below.${retry}\n\n${context.packet}`;
}

function annotationContractIssues(text, stopReason) {
  const value = String(text || '').trim();
  const issues = [];
  const words = value ? value.split(/\s+/).length : 0;
  const paragraphs = value ? value.split(/\n\s*\n/).filter(Boolean) : [];
  if (stopReason === 'max_tokens') issues.push('the first response hit the output limit');
  if (words > 575) issues.push(`the first response was too long (${words} words)`);
  if (paragraphs.length !== 3) issues.push(`the first response used ${paragraphs.length} paragraphs instead of exactly 3`);
  if (/^\s*#{1,6}\s/m.test(value) || /^\s*[-*]\s+/m.test(value) || /^\s*\*\*[^*]+\*\*\s*$/m.test(value)) {
    issues.push('the first response used headings or bullets');
  }
  if (!value) issues.push('the first response was empty');
  return issues;
}

module.exports = {
  SYSTEM,
  getConstitutionData,
  extractRefs,
  mechanicCues,
  targetCoverageCues,
  similarityScore,
  buildContextPacket,
  historyFor,
  getAnnotationHistory,
  buildAnnotationUserPrompt,
  annotationContractIssues,
};
