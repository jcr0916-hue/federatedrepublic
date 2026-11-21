// Vercel Serverless Function: Constitutional Annotation
// Serves the stored annotation for a provision when one matches its current source
// packet; otherwise Sonnet receives the deterministic packet and generates it live.

const { buildContextPacket } = require('./_annotator-core.js');
const { lookupStored, generateAnnotation } = require('./_annotator-run.js');

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

  const stored = lookupStored(num, context);
  if (stored) {
    console.info('[annotate-stored]', { num });
    return res.status(200).json({ annotation: stored.text, truncated: false, source: 'stored' });
  }

  try {
    const result = await generateAnnotation(context);
    if (!result.ok) {
      return res.status(502).json({ error: 'Upstream error', detail: result.detail });
    }
    return res.status(200).json({ annotation: result.annotation, truncated: result.truncated, source: 'live' });
  } catch (err) {
    return res.status(502).json({ error: 'Upstream error', detail: String(err) });
  }
};
