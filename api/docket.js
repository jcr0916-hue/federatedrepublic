// Vercel Serverless Function: The Docket
// generate: Haiku creates a case on the fly (full constitution context)
// analyze: Sonnet delivers court opinion (only relevant provisions — faster)

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
  "situation": ["Paragraph one of the facts.", "Paragraph two of the facts.", "Paragraph three of the facts."],
  "claimant_name": "Full name of the individual claimant",
  "claimant_position": "One sentence stating what they are claiming and why.",
  "claimant_argument": ["Paragraph one of claimant argument.", "Paragraph two.", "Paragraph three."],
  "respondent_name": "The Republic or name of the specific official",
  "respondent_position": "One sentence stating the government's position.",
  "respondent_argument": ["Paragraph one of respondent argument.", "Paragraph two.", "Paragraph three."],
  "provisions": [
    {"num": "§1.6", "name": "Equality and Non-Discrimination"},
    {"num": "§2.1", "name": "The Legat Consul — Domain and Term"}
  ]
}

Key constitutional tensions worth building cases around:
- §1.6 non-discrimination vs. §2.1 LC border/immigration authority
- §1.5 freedom of expression vs. §2.7 CC legislative instruments
- §1.1 right to courts vs. legislation stripping judicial review (§4.5)
- §6.2 removal protections vs. §6.1 certification authority
- §9.14 Monitor removal grounds vs. §1.1 due process
- §1.19 emergency powers vs. Article I rights floor
- §2.7 fiscal objection vs. Assembly legislative authority
- §17.3 amendment consistency vs. valid amendment process
- §3.6 Senate treaty ratification vs. §2.1 LC foreign domain
- §2.14 coordination failure vs. domain separation
- §13.1 citizen referendum vs. §3.1 legislative supremacy
- §1.21 non-refoulement vs. §2.1 LC immigration authority
- §4.3 SC composition vs. §4.5 right to constitutional review
- §2.8 duty of refusal vs. §1.1 right to courts
- §15.3 mandatory devolution vs. federal authority
- §16.3 indigenous compact rights vs. Republic authority

Complete constitution text follows:
`;

const ANALYSIS_SYSTEM = `You are a Supreme Court justice of the Federated Republic delivering the court's opinion on a constitutional dispute.

The user has rendered a verdict. Now deliver the court's analysis.

Return ONLY a JSON object with this exact structure — no preamble, no markdown fences:
{
  "court_verdict": "claimant" or "respondent" or "split",
  "correct": true or false,
  "opinion": ["Paragraph one: restate the core tension precisely.", "Paragraph two: explain which provision controls and why.", "Paragraph three: address the strongest point in the losing argument and why it fails.", "Paragraph four: what this case reveals about the constitutional design."],
  "design_note": "One or two sentences on what this case reveals about the constitution's design.",
  "provision_texts": [
    {"num": "§1.6", "name": "Equality and Non-Discrimination", "text": "Full exact text of this provision."}
  ]
}

Be definitive. The court commits to an outcome. Do not hedge. If the case is genuinely ambiguous, say so in the opinion but still state which way the court rules and why.

Relevant constitutional provisions follow:
`;

let cachedData = null;

function getConstitutionData() {
  if (cachedData) return cachedData;
  const dataPath = path.join(__dirname, '..', 'constitution_data.json');
  cachedData = require(dataPath);
  return cachedData;
}

function getFullConstitutionText() {
  const data = getConstitutionData();
  const lines = [];
  for (const article of data) {
    for (const prov of article.provisions) {
      lines.push(`[${prov.num}] ${prov.name}`);
      lines.push(prov.text);
      lines.push('');
    }
  }
  return lines.join('\n').trim();
}

function getProvisionTexts(provisionNums) {
  const data = getConstitutionData();
  const allProvisions = data.flatMap(a => a.provisions);
  return provisionNums.map(num => {
    const prov = allProvisions.find(p => p.num === num);
    return prov ? `[${prov.num}] ${prov.name}\n${prov.text}` : `[${num}] (not found)`;
  }).join('\n\n');
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
          max_tokens: 1500,
          system: CASE_SYSTEM + getFullConstitutionText(),
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

      // Only send the specific provisions at issue — much faster than full constitution
      const provNums = (caseData.provisions || []).map(p => p.num);
      const relevantProvisions = getProvisionTexts(provNums);

      const userMessage = `Case: ${caseData.title}
Provisions at issue: ${provNums.join(', ')}
Claimant (${caseData.claimant_name}): ${caseData.claimant_position}
Respondent (${caseData.respondent_name}): ${caseData.respondent_position}
User ruled in favor of: ${verdict}

Deliver the court's opinion.`;

      const upstream = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          system: ANALYSIS_SYSTEM + relevantProvisions,
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
