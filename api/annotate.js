// Vercel Serverless Function: Constitutional Annotation
// Sonnet receives a deterministic constitutional context packet and generates design rationale.

const { anthropicMessage } = require('./_ai-transport.js');
const {
  SYSTEM,
  buildContextPacket,
  buildAnnotationUserPrompt,
} = require('./_annotator-core.js');

const MODEL = process.env.AI_MODEL_ANNOTATE || 'anthropic/claude-sonnet-5';

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
        content: buildAnnotationUserPrompt(context, retry),
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
