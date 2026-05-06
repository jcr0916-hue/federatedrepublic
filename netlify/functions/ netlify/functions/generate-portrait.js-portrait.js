// Netlify serverless function — calls Anthropic API to generate a state portrait
// Environment variable required: ANTHROPIC_API_KEY

exports.handler = async function(event) {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'API key not configured' }) };
  }

  let config;
  try {
    config = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  const {
    name, abbr, execType, legType, judType, econType,
    bnf, gateLevel, localLevel, compactPresent,
    days, seats, senats, jterm, party, area, regional, admittedYear
  } = config;

  const prompt = `You are a constitutional scholar and worldbuilder writing about a fictional federated republic. 
Generate a state portrait for a new state in this republic. The state profile is as follows:

- State name: ${name} (abbreviation: ${abbr})
- Executive model: ${execType === 'parliamentary' ? 'Parliamentary (Premier elected by Assembly)' : 'Presidential (Governor directly elected)'}
- Legislature: ${legType === 'unicameral' ? `Unicameral, ${seats} seats` : `Bicameral — Assembly (${seats} seats) + Senate (${senats} seats)`}
- Judiciary: ${judType === 'appointed' ? 'Appointed (commission + legislative confirmation)' : `Elected — ${party} ballot, ${jterm}-year terms`}
- Economy type: ${econType} (${econType === 'coastal' ? 'maritime and trade-oriented' : econType === 'landlocked' ? 'resource and agricultural' : econType === 'urban' ? 'services and finance' : 'mixed agricultural and industrial'})
- Basic Needs Floor (BNF): ${bnf.toFixed(1)}% of Gross National Revenue — ${bnf >= 7.5 ? 'generous, above-average welfare floor' : bnf >= 6.0 ? 'moderate, meeting minimums' : 'lean, at constitutional floor'}
- Gate 1 immigration posture: ${gateLevel >= 75 ? 'Highly Active (state-sponsored recruitment)' : gateLevel >= 50 ? 'Active' : gateLevel >= 25 ? 'Moderate' : 'Passive'}
- Local government authority: ${localLevel >= 75 ? 'Strong local (subsidiarity emphasis)' : localLevel >= 50 ? 'Mostly local' : localLevel >= 25 ? 'Balanced' : 'Centralized state government'}
- Indigenous compact: ${compactPresent ? 'Present — FPIC protocols apply, Article XIV compact in force' : 'Absent — no compact territory within state borders'}
- Founding convention: ${days} days, admitted as Year ${admittedYear} of the Republic
- Area: approximately ${area} km², ${regional} regional divisions

Write the portrait in four sections, returning ONLY valid JSON with these exact keys:
{
  "origin": "2-3 sentences on the state's history, founding context, and why it chose its particular institutional mix. Specific, textured, not generic.",
  "government": "2-3 sentences on how the executive-legislative-judicial structure actually works in practice — the dynamics, the pressures, what makes this arrangement distinctive.",
  "citizens": "2-3 sentences on life in the state — what residents experience regarding services, immigration, local governance. Concrete and grounded.",
  "tension": "2 sentences on a genuine constitutional tension or stress point this state will face — something specific to its configuration, not a platitude."
}

Write in a serious, scholarly-but-accessible register. Each section should feel like it belongs in a constitutional reference guide. Do not use the state name more than twice across all four sections. Do not start any section with the state name. Return ONLY the JSON object, no preamble, no markdown fences.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 900,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Anthropic API error:', err);
      return { statusCode: 502, body: JSON.stringify({ error: 'Upstream API error' }) };
    }

    const data = await response.json();
    const raw = data.content?.[0]?.text?.trim() || '';

    // Strip any accidental markdown fences
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/,'').trim();

    let portrait;
    try {
      portrait = JSON.parse(cleaned);
    } catch {
      console.error('Failed to parse model JSON:', cleaned);
      return { statusCode: 502, body: JSON.stringify({ error: 'Model returned invalid JSON' }) };
    }

    // Validate expected keys
    const required = ['origin', 'government', 'citizens', 'tension'];
    for (const key of required) {
      if (typeof portrait[key] !== 'string') {
        return { statusCode: 502, body: JSON.stringify({ error: `Missing key: ${key}` }) };
      }
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(portrait)
    };

  } catch (err) {
    console.error('Function error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal error' }) };
  }
};
