// Netlify Edge Function: constitutional advisor
// Runs at edge (Deno runtime) — routes /api/advisor POST requests
// Environment variable required: ANTHROPIC_API_KEY
// Constitution is fetched at runtime from constitution_data.json (not embedded)

const SITE_URL = 'https://thefederatedrepublic.org';

const SYSTEM_PREFIX = `You are a constitutional analyst for the Federated Republic, an original constitutional republic. You have the complete Federated Republic Constitution — 177 provisions across 20 Articles.

Analyze constitutional questions by identifying which provisions apply, how they interact, and what the constitution requires.

Rules:
- Cite provisions precisely as [§X.X.x] every time one is directly relevant.
- Explain how multiple provisions interact and their sequence.
- Name competing interpretations when a situation is genuinely ambiguous.
- Do not speculate beyond the constitutional text.
- Do not express political opinions about the constitution.
- Prose only — no bullet lists, no headers.
- Lead with the most important constitutional point.

Complete constitution:

`;

// Cache constitution text across requests within the same edge worker instance
let cachedConstitutionText: string | null = null;

async function getConstitutionText(): Promise<string> {
  if (cachedConstitutionText) return cachedConstitutionText;

  const resp = await fetch(`${SITE_URL}/constitution_data.json`, {
    headers: { 'Cache-Control': 'max-age=3600' },
  });

  if (!resp.ok) {
    throw new Error(`Failed to fetch constitution: ${resp.status}`);
  }

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
  // CORS preflight
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
        max_tokens: 1024,
        system,
        messages: [{ role: 'user', content: question }],
      }),
    });

    const data = await upstream.json();
    return new Response(JSON.stringify(data), {
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
