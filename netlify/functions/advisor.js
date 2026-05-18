// Netlify Function: constitutional advisor proxy
// Routes questions to Anthropic Claude with full Federated Republic constitution
// Environment variable required: ANTHROPIC_API_KEY

const CONSTITUTION = require('./constitution-text');

const SYSTEM_PROMPT = `You are a constitutional analyst for the Federated Republic, an original constitutional republic. You have the complete text of the Federated Republic Constitution (v167) — 516 provisions across 20 Articles.

Your function is to analyze constitutional questions by identifying which provisions apply, explaining how they interact, and reasoning through the constitutional outcome step by step.

Rules:
- Cite provisions precisely using the format [§X.X.x] every time one is directly relevant — for example [§8.5.a] or [§15.1.c].
- When multiple provisions interact, explain the sequence and priority.
- If a situation is genuinely ambiguous, name the competing interpretations and what would determine which prevails.
- Do not speculate beyond what the constitutional text supports.
- Do not express political opinions about the constitution's merits.
- If a situation falls entirely outside the constitution's scope, say so and explain why.
- Keep responses focused. Lead with the most important constitutional point, then build the analysis.
- Format with clear paragraph breaks. Prose only — no bullet lists, no headers.

The complete Federated Republic Constitution follows:

` + CONSTITUTION;

exports.handler = async function(event) {
  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'API key not configured' }),
    };
  }

  let body;
  try { body = JSON.parse(event.body); }
  catch {
    return {
      statusCode: 400,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Invalid JSON' }),
    };
  }

  const { question } = body;
  if (!question || !question.trim()) {
    return {
      statusCode: 400,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Question required' }),
    };
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: question.trim() }],
      }),
    });

    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Upstream error', detail: err.message }),
    };
  }
};
