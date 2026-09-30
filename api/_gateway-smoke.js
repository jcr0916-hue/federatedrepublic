const { anthropicMessage } = require('./_ai-transport.js');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (process.env.VERCEL_ENV === 'production') return res.status(404).json({ error: 'Not found' });

  try {
    const { response, route, model } = await anthropicMessage({
      model: process.env.AI_MODEL_CROSSROADS || 'anthropic/claude-sonnet-5',
      max_tokens: 60,
      system: 'Return only the JSON object requested by the user.',
      messages: [{
        role: 'user',
        content: 'Return exactly this JSON object and nothing else: {"smoke":"ok"}',
      }],
      tags: ['feature:gateway-smoke', `env:${process.env.VERCEL_ENV || 'local'}`],
    });

    const data = await response.json().catch(() => ({}));
    const raw = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('').trim();
    return res.status(response.ok ? 200 : 502).json({
      ok: response.ok,
      route,
      model,
      providerModel: data.model || null,
      text: raw.slice(0, 80),
    });
  } catch (error) {
    return res.status(500).json({ error: String(error).slice(0, 200) });
  }
};
