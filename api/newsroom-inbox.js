// Vercel Serverless Function: read-only editor relay to the newsroom inbox Worker.
// The Central Editor reads the inbox through Vercel's own access control instead of
// holding a key. This function answers only on *.vercel.app hosts, which the project's
// Deployment Protection (Vercel Authentication, "all except custom domains") limits to
// John's Vercel account; the editor reaches them through the Vercel connector.
// On the public custom domain it refuses everything. It attaches NEWSROOM_EDITOR_KEY
// (a Sensitive Production variable) itself, and only relays GET list and GET read.
// If Deployment Protection is ever turned off, delete NEWSROOM_EDITOR_KEY to close this.

const DEFAULT_INBOX = 'https://federated-republic-newsroom.jcr0916.workers.dev';
const OPS = new Set(['list', 'read']);

function protectedHost(host) {
  return /^[a-z0-9-]+\.vercel\.app$/i.test(String(host || '').split(':')[0]);
}

function relayTarget(method, op, query, inbox = DEFAULT_INBOX) {
  if (method !== 'GET' || !OPS.has(op)) return null;
  const url = new URL(`/v1/${op}`, inbox);
  for (const [k, v] of Object.entries(query || {})) {
    if (k !== 'op' && typeof v === 'string') url.searchParams.set(k, v);
  }
  return url.toString();
}

async function handler(req, res, fetchImpl = fetch) {
  const key = process.env.NEWSROOM_EDITOR_KEY;
  if (!key || !protectedHost(req.headers.host)) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  const q = req.query || {};
  const target = relayTarget(req.method, String(q.op || ''), q, process.env.NEWSROOM_URL || DEFAULT_INBOX);
  if (!target) {
    res.status(404).json({ error: 'Use GET ?op=list or ?op=read&key=<object key>' });
    return;
  }
  try {
    const r = await fetchImpl(target, { headers: { authorization: `Bearer ${key}` } });
    const text = await r.text();
    res.status(r.status).setHeader('content-type', 'application/json').send(text);
  } catch (e) {
    res.status(502).json({ error: 'Inbox unreachable' });
  }
}

module.exports = handler;
module.exports.relayTarget = relayTarget;
module.exports.protectedHost = protectedHost;
