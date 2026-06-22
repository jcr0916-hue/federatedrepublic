// Netlify Edge Function: constitution navigator
// Runs at edge (Deno runtime) — routes /api/navigator POST requests
// Environment variable required: ANTHROPIC_API_KEY
// Returns structured JSON: { summary, provisions[], scenarios[] }

const SITE_URL = 'https://thefederatedrepublic.org';

const SCENARIOS = `
Ordinary Law (scenario-ordinary.html): Normal legislative day — bill passage, budget, government formation, LC foreign action. Covers NRS, Social State, Asylum Court, Monitors.
The Stalemate (scenario-coordination-failure.html): LC-CC domain conflict, Coordination Failure Protocol §2.14.a.
The Alliance Clause (scenario-alliance-clause.html): LC deploys military under ratified treaty; SC reviews trigger conditions. Covers §2.2, §3.6.
The Objection (scenario-the-objection.html): CC fiscal objection §2.7, Assembly override, long-term fiscal consequences.
The Direction (scenario-the-direction.html): CC written direction §2.16 — limits on prosecutorial direction.
The Formation (scenario-formation.html): Government formation §2.6.a after contested election results.
The Recall (scenario-recall.html): Constructive no-confidence vote against the Civic Consul.
The First Nomination (scenario-first-nomination.html): SC vacancy, Judicial Pool, Senate confirmation §4.1-§4.5.
The Critical Finding (scenario-critical-finding.html): LM Critical Failure finding on fiscal accuracy; legislative response.
The Grounds Review (scenario-sdp-removal.html): Monitor removal proceedings; SC grounds review §9.14.
The Deadlock (scenario-deadlock.html): Monitor General appointment failure — both speakers cannot agree.
The Long Count (scenario-long-count.html): JM Monitor General lottery; public rejects two candidates in sequence.
Grounds (scenario-grounds.html): Judicial track Monitor removal §9.14.a — two Monitors petition jointly.
The Second Declaration (scenario-second-declaration.html): Emergency re-declaration 72 hours after expiry — same geography, different label. §1.19.
The Automatic Floor (scenario-automatic-floor.html): Budget deadline passes without enacted budget; automatic appropriation activates.
The Finality Act (scenario-finality-act.html): Legislature strips judicial review from immigration denials; §4.5 direct SC petition.
The Void Exception (scenario-void-exception.html): Valid amendment with unconstitutional habeas carve-out; entrenchment clause §17.3.
The Order (scenario-the-order.html): Military officer refuses unlawful rendition order §2.8; disciplinary proceedings follow.
The Organized Third (scenario-organized-third.html): Citizens organize §13.1 petition referendum against a statute.
The Second Path (scenario-the-second-path.html): Citizens §13.2 initiative — Assembly fails to act, goes to referendum.
The Harder Ballot (scenario-harder-ballot.html): State voting access restriction; NVS standards enforcement §11.2.
Election Administration Stress Tests (scenario-election-test.html): NVS cooperative federalism — four scenarios.
The Recalled Senator (scenario-recalled-senator.html): State recall mechanism against a sitting federal senator.
The Four Elections (scenario-indigenous.html): Indigenous Nation exercising Article XVI rights across four decisions.
The Departure (scenario-the-departure.html): Indigenous full sovereign independence §16.7(c); treaty negotiation.
The Return (scenario-the-return.html): Legal resident denied re-entry after protest — §6.2, §1.6 discrimination, §1.8 protected speech.
`;

const SYSTEM_PREFIX = `You are the Constitution Navigator for the Federated Republic — a constitutional republic with 177 provisions across 20 Articles.

When someone asks about a position, power, provision, or concept, return a JSON object with EXACTLY this structure:
{
  "summary": "3-4 sentence plain-language explanation of what this is and how it works in the constitution.",
  "provisions": [
    {"num": "§2.1", "name": "The Legat Consul — Domain and Term", "relevance": "One sentence explaining why this provision is central to the query."}
  ],
  "scenarios": [
    {"title": "The Alliance Clause", "file": "scenario-alliance-clause.html", "relevance": "One sentence on how this scenario tests the relevant provisions."}
  ]
}

Rules:
- Return ONLY the JSON object. No preamble, no explanation, no markdown fences.
- summary: plain language, 3-4 sentences, no provision numbers in the text.
- provisions: list only the most directly relevant provisions, maximum 4. Use exact § numbers.
- scenarios: list only genuinely relevant scenarios, maximum 3. Use exact filenames from the list below.
- If no scenarios are relevant, return an empty array for scenarios.

Available scenarios:
${SCENARIOS}

Complete constitution text follows:

`;

let cachedConstitutionText: string | null = null;

async function getConstitutionText(): Promise<string> {
  if (cachedConstitutionText) return cachedConstitutionText;

  const resp = await fetch(`${SITE_URL}/constitution_data.json`, {
    headers: { 'Cache-Control': 'max-age=3600' },
  });

  if (!resp.ok) throw new Error(`Failed to fetch constitution: ${resp.status}`);

  const data: Array<{ heading: string; provisions: Array<{ num: string; name: string; text: string }> }> = await resp.json();

  const lines: string[] = [];
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

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async (request: Request) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: CORS_HEADERS });
  }

  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }

  let body: { question?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }

  const question = body?.question?.trim();
  if (!question) {
    return new Response(JSON.stringify({ error: 'Question required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }

  try {
    const constitutionText = await getConstitutionText();
    const system = SYSTEM_PREFIX + constitutionText;

    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 800,
        system,
        messages: [{ role: 'user', content: question }],
      }),
    });

    const data = await upstream.json();

    // Extract the text content and parse as JSON
    const raw = data.content?.[0]?.text || '';
    let parsed;
    try {
      parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
    } catch {
      return new Response(JSON.stringify({ error: 'Model returned unparseable response', raw }), {
        status: 502,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      });
    }

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Upstream error', detail: String(err) }), {
      status: 502,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }
};
