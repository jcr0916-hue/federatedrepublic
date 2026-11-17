// Vercel Serverless Function: editor relay to the newsroom inbox Worker.
// The Central Editor's workspace can reach this site but not workers.dev, so this
// passes three editor calls through unchanged: GET list, GET read, POST review.
// It holds no key of its own. The caller's Authorization header goes straight to
// the Worker, which decides whether it is the editor key; anything else is refused there.

const DEFAULT_INBOX = 'https://federated-republic-newsroom.jcr0916.workers.dev';
const ROUTES = { list: 'GET', read: 'GET', review: 'POST' };

function relayTarget(method, op, query, inbox = DEFAULT_INBOX) {
  if (!Object.prototype.hasOwnProperty.call(ROUTES, op) || ROUTES[op] !== method) return null;
  const url = new URL(`/v1/${op}`, inbox);
  for (const [k, v] of Object.entries(query || {})) {
    if (k !== 'op' && typeof v === 'string') url.searchParams.set(k, v);
  }
  return url.toString();
}

async function handler(req, res, fetchImpl = fetch) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const q = req.query || {};
  const target = relayTarget(req.method, String(q.op || ''), q, process.env.NEWSROOM_URL || DEFAULT_INBOX);
  if (!target) {
    res.status(404).json({ error: 'Use ?op=list or ?op=read (GET), or ?op=review (POST)' });
    return;
  }
  try {
    const init = { method: req.method, headers: { authorization: auth } };
    if (req.method === 'POST') {
      init.headers['content-type'] = 'application/json';
      init.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
    }
    const r = await fetchImpl(target, init);
    const text = await r.text();
    res.status(r.status).setHeader('content-type', 'application/json').send(text);
  } catch (e) {
    res.status(502).json({ error: 'Inbox unreachable' });
  }
}

module.exports = handler;
module.exports.relayTarget = relayTarget;
