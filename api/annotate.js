// Vercel Serverless Function: Constitutional Annotation
// Sonnet generates design rationale for any provision on demand

const path = require('path');

const SYSTEM = `You are a constitutional design analyst for the Federated Republic. When a user clicks on a provision, you explain the design rationale behind it — the why, not just the what.

Your annotation should cover:
1. The constitutional principle this provision embodies
2. The specific design choice made and why (what alternatives were considered and rejected)
3. How this provision connects to or depends on other provisions
4. What failure mode or abuse this provision is guarding against

Be direct and substantive. Write 3-4 short paragraphs. No bullet points. No headers. Plain prose, analytical tone. Assume the reader has already read the provision text — do not summarize it.

The ten design principles underlying this constitution:
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

The complete constitution text follows, for cross-reference awareness:
`;

let cachedData = null;
let cachedText = null;

function getConstitutionText() {
  if (cachedText) return cachedText;
  const dataPath = path.join(__dirname, '..', 'constitution_data.json');
  cachedData = require(dataPath);
  const lines = [];
  for (const article of cachedData) {
    for (const prov of article.provisions) {
      lines.push(`[${prov.num}] ${prov.name}: ${prov.text}`);
    }
  }
  cachedText = lines.join('\n\n');
  return cachedText;
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

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

  const { num, name, text } = req.body || {};
  if (!num || !text) return res.status(400).json({ error: 'num and text required' });

  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 700,
        system: SYSTEM + getConstitutionText(),
        messages: [{
          role: 'user',
          content: `Explain the design rationale for this provision:\n\n${num} — ${name}\n\n"${text}"`
        }],
      }),
    });

    const data = await upstream.json();
    const annotation = data.content?.[0]?.text?.trim() || '';
    return res.status(200).json({ annotation });

  } catch (err) {
    return res.status(502).json({ error: 'Upstream error', detail: String(err) });
  }
};
