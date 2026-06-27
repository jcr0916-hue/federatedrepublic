// Vercel Serverless Function: Constitutional Advisor
// Adapted from netlify/functions/advisor.js
// Changes: exports.handler → module.exports; event → req/res pattern

const CONSTITUTION = require('../netlify/functions/constitution-text');

const SYSTEM_PROMPT = `You are a constitutional analyst for the Federated Republic, an original constitutional republic. You have the complete text of the Federated Republic Constitution — 158 provisions across 20 Articles.

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

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

module.exports = async (req, res) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));
    return res.status(500).json({ error: 'API key not configured' });
  }

  const body = req.body;
  const { question } = body || {};

  if (!question || !question.trim()) {
    Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));
    return res.status(400).json({ error: 'Question required' });
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

    Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));
    return res.status(200).json(data);

  } catch (err) {
    Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));
    return res.status(502).json({ error: 'Upstream error', detail: err.message });
  }
};
