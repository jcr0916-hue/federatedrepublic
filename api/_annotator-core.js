const SYSTEM = `You are a source-bound constitutional design analyst for the Federated Republic. When a user clicks on a provision, explain the structural rationale supported by the supplied current constitutional text and design principles — the why only to the extent the sources support it.

Your annotation should cover:
1. The constitutional principle this provision embodies
2. The design choice expressed in the current text and its practical effect; do not invent drafting history or rejected alternatives
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

These design principles are interpretive lenses, not evidence of drafting intent. You may say that a mechanism structurally aligns with a principle. Do not say the drafters chose, intended, anticipated, deliberately created, or preferred something unless the supplied constitutional text itself establishes that motive.

The application has already performed constitutional retrieval. Treat the supplied SOURCE PACKET as the complete research basis for this annotation. Do not search for or assume rules outside the packet. The target provision is authoritative. Related provisions are exact current constitutional text supplied only because the application found a structural, citation, lexical, or backlink relationship; their presence does not make them controlling.

Distinguish interpretation from explicit requirements; acknowledge ambiguity instead of supplying missing rules. Do not invent enforcement mechanisms, appointment rules, audit powers, deadlines, standards, remedies, or cross-reference effects. Never invent a provision number or label. Do not state that information is public, reviewable, enforceable, or justiciable unless the supplied constitutional text actually provides that result. When a rationale is only a structural inference, label it as a structural inference rather than presenting it as an explicit constitutional purpose.

When comparing procedures, track each mechanism separately. Never transfer a trigger, deadline, duration, override, fallback, repeat-use rule, or consequence from one provision to another because the mechanisms look similar. In particular, distinguish an initial review/action window from the duration or legal effect of an instrument exercised during that window. Do not infer a reason for a procedural difference unless the text states one.

OUTPUT CONTRACT: Write exactly 3 prose paragraphs with no headings, bullets, numbering, markdown labels, or section titles. Use roughly 300–425 words and never exceed 450 words. Finish the final sentence. If the packet contains more material than fits, prioritize the target provision's exact mechanics, the most direct constitutional relationships, and the clearest failure modes; omit secondary comparisons rather than exceeding the limit.`;

let cachedData = null;

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

function formatProvision(prov, label) {
  return `${label} [${prov.num}] ${prov.name}\n${prov.text}`;
}

function buildContextPacket(num, data = getConstitutionData(), relatedLimit = 6) {
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

  const sections = [
    'SOURCE PACKET — generated deterministically from constitution_data.json',
    '',
    'TARGET PROVISION',
    formatProvision(target, 'TARGET'),
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
    'PACKET RULE',
    'The target provision is the controlling subject. Related provisions are included only to illuminate a structural, explicit-citation, or same-article lexical relationship. Downstream backlinks are intentionally excluded because they often distract from the target mechanics. Never transfer a trigger, deadline, duration, override, fallback, repeat-use rule, or consequence from a related provision to the target. The Article index supplies names only and cannot support a claim about mechanics.',
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
    ? `\n\nREWRITE REQUIRED: ${retryReason}. Rewrite the full annotation from the beginning. Obey the three-paragraph, no-heading, no-bullet, 450-word hard limit and preserve source accuracy.`
    : '';
  return `Explain the design rationale for ${context.target.num} — ${context.target.name}. Use only the verified source packet below.${retry}\n\n${context.packet}`;
}

function annotationContractIssues(text, stopReason) {
  const value = String(text || '').trim();
  const issues = [];
  const words = value ? value.split(/\s+/).length : 0;
  const paragraphs = value ? value.split(/\n\s*\n/).filter(Boolean) : [];
  if (stopReason === 'max_tokens') issues.push('the first response hit the output limit');
  if (words > 500) issues.push(`the first response was too long (${words} words)`);
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
  similarityScore,
  buildContextPacket,
  buildAnnotationUserPrompt,
  annotationContractIssues,
};
