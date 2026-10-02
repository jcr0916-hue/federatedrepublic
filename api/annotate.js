// Vercel Serverless Function: Constitutional Annotation
// Sonnet receives a deterministic constitutional context packet and generates design rationale.

const { anthropicMessage } = require('./_ai-transport.js');
const MODEL = process.env.AI_MODEL_ANNOTATE || 'anthropic/claude-sonnet-5';

const SYSTEM = `You are a source-bound constitutional design analyst for the Federated Republic. When a user clicks on a provision, explain the structural rationale supported by the supplied current constitutional text and design principles — the why only to the extent the sources support it.

Your annotation should cover:
1. The constitutional principle this provision embodies
2. The design choice expressed in the current text and its practical effect; do not invent drafting history or rejected alternatives
3. How this provision connects to or depends on other provisions
4. What failure mode or abuse this provision is guarding against

Be direct and substantive. Write 3 concise paragraphs, roughly 300–450 words, and always complete the final sentence within that limit. No bullet points. No headers. Plain prose, analytical tone. Assume the reader has already read the provision text — do not summarize it.

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

The application has already performed constitutional retrieval. Treat the supplied SOURCE PACKET as the complete research basis for this annotation. Do not search for or assume rules outside the packet. The target provision is authoritative; all other packet entries are exact current constitutional text supplied only for relationship and comparison analysis.

Distinguish interpretation from explicit requirements; acknowledge ambiguity instead of supplying missing rules. Do not attribute motives to the drafters, historical lessons, rejected alternatives, or deliberate purposes unless the current text itself establishes them. Do not invent enforcement mechanisms, appointment rules, audit powers, deadlines, standards, remedies, or cross-reference effects. Never invent a provision number or label. Do not state that information is public, reviewable, enforceable, or justiciable unless the supplied constitutional text actually provides that result. When a rationale is only a structural inference, say so plainly rather than presenting it as an explicit constitutional purpose. Prefer direct mechanics over speculative institutional storytelling.

When comparing procedures, track each stage separately. In particular, do not conflate an initial review/action window with the duration or legal effect of an instrument exercised during that window. Compare the actual trigger, action period, consequence, override, fallback, and repeat-use rule stated in the packet.`;

let cachedData = null;

function getConstitutionData() {
  if (!cachedData) cachedData = require('../constitution_data.json');
  return cachedData;
}

function extractRefs(text) {
  const refs = text.match(/§\d+(?:\.\d+)*(?:\.[a-z])?/gi) || [];
  return [...new Set(refs)];
}

function exactRefRegex(num) {
  const escaped = num.replace(/\./g, '\\.');
  return new RegExp(escaped + '(?![\\w.])');
}

function formatProvision(prov) {
  return `[${prov.num}] ${prov.name}: ${prov.text}`;
}

function buildContextPacket(num) {
  const data = getConstitutionData();
  const articles = data.filter((article) => Array.isArray(article.provisions));
  const all = articles.flatMap((article) =>
    article.provisions.map((prov) => ({ ...prov, article: article.heading }))
  );
  const target = all.find((prov) => prov.num === num);
  if (!target) return null;

  const sameArticle = all.filter(
    (prov) => prov.article === target.article && prov.num !== target.num
  );

  const refs = extractRefs(target.text).filter((ref) => ref !== target.num);
  const refSet = new Set(refs);
  const explicitCrossRefs = all.filter(
    (prov) => refSet.has(prov.num) && prov.article !== target.article
  );

  const targetRef = exactRefRegex(target.num);
  const backlinks = all.filter(
    (prov) =>
      prov.num !== target.num &&
      prov.article !== target.article &&
      !refSet.has(prov.num) &&
      targetRef.test(prov.text)
  );

  const sections = [
    'SOURCE PACKET — generated deterministically from constitution_data.json',
    '',
    'TARGET PROVISION',
    formatProvision(target),
    '',
    `SAME-ARTICLE CONTEXT — ${target.article}`,
    sameArticle.length
      ? sameArticle.map(formatProvision).join('\n\n')
      : '(none)',
    '',
    'EXPLICIT CROSS-REFERENCES OUTSIDE THE TARGET ARTICLE',
    explicitCrossRefs.length
      ? explicitCrossRefs.map(formatProvision).join('\n\n')
      : '(none)',
    '',
    'PROVISIONS OUTSIDE THE TARGET ARTICLE THAT EXPLICITLY CITE THE TARGET',
    backlinks.length
      ? backlinks.map(formatProvision).join('\n\n')
      : '(none)',
  ];

  return { target, packet: sections.join('\n') };
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

module.exports = async (req, res) => {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { num } = req.body || {};
  const context = buildContextPacket(num);
  if (!context) return res.status(400).json({ error: 'Unknown provision' });

  try {
    const request = (maxTokens, retry = false) => anthropicMessage({
      model: MODEL,
      max_tokens: maxTokens,
      temperature: 0,
      system: SYSTEM,
      messages: [{
        role: 'user',
        content: `Explain the design rationale for ${context.target.num} — ${context.target.name}. Use only the verified source packet below.${retry ? '\n\nYour previous response hit the output limit. Rewrite the full answer from the beginning in no more than 450 words and finish all three paragraphs.' : ''}\n\n${context.packet}`
      }],
      tags: ['feature:annotate', retry ? 'role:completion-retry' : 'role:primary', `env:${process.env.VERCEL_ENV || 'local'}`],
    });

    let { response: upstream, route, model } = await request(1600);
    console.info('[annotate-ai]', { route, model, attempt: 1 });
    let data = await upstream.json();

    if (upstream.ok && !data.error && data.stop_reason === 'max_tokens') {
      ({ response: upstream, route, model } = await request(2400, true));
      console.info('[annotate-ai]', { route, model, attempt: 2, reason: 'max_tokens' });
      data = await upstream.json();
    }

    if (!upstream.ok || data.error) {
      return res.status(502).json({
        error: 'Upstream error',
        detail: data.error?.message || `status ${upstream.status}`,
      });
    }

    const annotation = (data.content || [])
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('')
      .trim();

    const truncated = data.stop_reason === 'max_tokens';

    return res.status(200).json({ annotation, truncated });

  } catch (err) {
    return res.status(502).json({ error: 'Upstream error', detail: String(err) });
  }
};
