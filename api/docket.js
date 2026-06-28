// Vercel Serverless Function: The Docket
// Adapted from netlify/edge-functions/docket.ts
// 5-minute timeout configured in vercel.json

const path = require('path');

const CASE_SYSTEM = `You are the clerk of the Supreme Court of the Federated Republic. Your role is to generate constitutional disputes for The Docket — a tool that lets users sit as justices and render verdicts on real constitutional tensions.

When asked to generate a case, produce a dispute that:
- Involves EXACTLY 2-4 provisions in GENUINE TENSION — not just related, but pulling in different directions in this specific situation
- Has a claimant with a LEGITIMATE constitutional argument (not a straw man)
- Has a respondent (usually the Republic or a government official) with an EQUALLY LEGITIMATE constitutional argument
- Does NOT telegraph the correct answer — both sides must have real merit
- Features a named individual as the claimant (give them a realistic name)
- Is grounded in a specific, concrete situation — not abstract hypotheticals
- Varies in subject matter: rights vs. security, executive power vs. legislative oversight, individual vs. collective, procedural vs. substantive

Return ONLY a JSON object with this exact structure — no preamble, no markdown fences:
{
  "title": "Two or three word evocative title",
  "situation": "Three paragraphs describing the facts. Who the claimant is, what happened, what they are claiming. Written as a neutral statement of facts — no legal argument yet.",
  "claimant_name": "Full name of the individual claimant",
  "claimant_position": "One sentence stating what they are claiming and why.",
  "claimant_argument": "Three paragraphs making the strongest possible constitutional case for the claimant. Cite specific provisions by number. Make this genuinely persuasive.",
  "respondent_name": "The Republic or name of the specific official",
  "respondent_position": "One sentence stating the government's position.",
  "respondent_argument": "Three paragraphs making the strongest possible constitutional case for the respondent. Cite specific provisions by number. Make this genuinely persuasive.",
  "provisions": [
    {"num": "§1.6", "name": "Equality and Non-Discrimination"},
    {"num": "§2.1", "name": "The Legat Consul — Domain and Term"}
  ]
}

Key constitutional tensions worth building cases around (choose combinations, not just one):
- §1.6 non-discrimination vs. §2.1 LC border/immigration authority
- §1.8 freedom of expression vs. §2.16 CC written direction
- §1.1 right to courts vs. legislation stripping judicial review (§4.5)
- §6.2 removal protections vs. §6.1 certification authority
- §9.14 Monitor removal grounds vs. §1.1 due process
- §1.19 emergency powers vs. Article I rights floor
- §2.7 fiscal objection vs. Assembly legislative authority
- §17.3 entrenchment clause vs. valid amendment process
- §3.6 Senate treaty ratification vs. §2.1 LC foreign domain
- §2.14 coordination failure vs. domain separation
- §13.1 citizen referendum vs. §3.1 legislative supremacy
- §1.21 non-refoulement vs. §2.1 LC immigration authority
- §4.3 SC quorum vs. §4.5 right to constitutional review
- §2.8 military orders vs. §1.1 right to courts
- §15.3 mandatory devolution vs. federal authority
- §16.x indigenous compact rights vs. Republic authority`;

const ANALYSIS_SYSTEM = `You are a Supreme Court justice of the Federated Republic delivering the court's opinion on a constitutional dispute.

The user has rendered a verdict. Now deliver the court's analysis.

Return ONLY a JSON object with this exact structure — no preamble, no markdown fences:
{
  "court_verdict": "claimant" or "respondent" or "split",
  "correct": true or false (whether the user's verdict matches the court's),
  "opinion": "Four paragraphs. First: restate the core tension precisely. Second: explain why one argument controls over the other — be specific about which provision prevails and why. Third: address the strongest point in the losing argument and explain why it ultimately fails. Fourth: what this case reveals about the constitutional design — what gap, tension, or unresolved question it exposes.",
  "design_note": "One or two sentences on what this case reveals about the constitution's design — a gap, a tension, or a deliberate choice that produces this outcome.",
  "provision_texts": [
    {"num": "§1.6", "name": "Equality and Non-Discrimination", "text": "Full exact text of this provision from the constitution."}
  ]
}

Be definitive. The court commits to an outcome. Do not hedge. If the case is genuinely ambiguous, say so in the opinion but still state which way the court rules and why.`;

let cachedConstitutionText = null;

function getConstitutionText() {
  if (cachedConstitutionText) return cachedConstitutionText;
  const dataPath = path.join(__dirname, '..', 'constitution_data.json');
  const data = require(dataPath);
  const lines = [];
  for (const article of data) {
    for (const prov of article.provisions) {
      lines.push(`[${prov.num}] ${prov.name}`);
      lines.push(prov.text);
      lines.push('');
    }
  }
  cachedConstitutionText = lines.join('\n').trim();
  return cachedConstitutionText;
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

  const body = req.body || {};
  const action = body.action;
  if (!action) return res.status(400).json({ error: 'Action required' });

  const constitutionText = getConstitutionText();

  try {
    if (action === 'generate') {
      const input = (body.input || '').trim() || 'surprise me';
      const userMessage = input.toLowerCase().includes('surprise') || input.length < 5
        ? 'Generate a case. Pick provisions in genuine tension. Choose from any area of the constitution.'
        : `Generate a case seeded by this user interest: "${input}". Build around provisions relevant to this topic, but ensure genuine constitutional tension.`;

      const upstream = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1200,
          system: CASE_SYSTEM + '\n\n' + constitutionText,
          messages: [{ role: 'user', content: userMessage }],
        }),
      });

      const data = await upstream.json();
      const raw = data.content?.[0]?.text || '';
      try {
        const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
        return res.status(200).json(parsed);
      } catch {
        return res.status(502).json({ error: 'Could not parse case', raw });
      }
    }

    if (action === 'analyze') {
      const caseData = body.case_data;
      const verdict = body.verdict;
      if (!caseData || !verdict) return res.status(400).json({ error: 'case_data and verdict required' });

      const userMessage = `Case: ${caseData.title}\nProvisions at issue: ${(caseData.provisions||[]).map(p=>`${p.num} ${p.name}`).join(', ')}\nClaimant (${caseData.claimant_name}): ${caseData.claimant_position}\nRespondent (${caseData.respondent_name}): ${caseData.respondent_position}\nUser ruled in favor of: ${verdict}\n\nDeliver the court's opinion.`;

      const upstream = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          system: ANALYSIS_SYSTEM + '\n\n' + constitutionText,
          messages: [{ role: 'user', content: userMessage }],
        }),
      });

      const data = await upstream.json();
      const raw = data.content?.[0]?.text || '';
      try {
        const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
        return res.status(200).json(parsed);
      } catch {
        return res.status(502).json({ error: 'Could not parse analysis', raw });
      }
    }

    return res.status(400).json({ error: 'Unknown action' });

  } catch (err) {
    return res.status(502).json({ error: 'Upstream error', detail: String(err) });
  }
};
