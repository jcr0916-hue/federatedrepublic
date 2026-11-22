// Vercel Serverless Function: editor relay to the newsroom inbox Worker.
// The Central Editor reads the inbox through Vercel's own access control instead of
// holding a key. This function answers only on *.vercel.app hosts, which the project's
// Deployment Protection (Vercel Authentication, "all except custom domains") limits to
// John's Vercel account; the editor reaches them through the Vercel connector.
// On the public custom domain it refuses everything. It attaches NEWSROOM_EDITOR_KEY
// (a Sensitive Production variable) itself. It relays GET list and GET read, plus two
// editor writes the Vercel connector can only send as GET: op=review (record a
// disposition: key, status, note) and op=purge (remove one approved item: key, etag,
// manifest). Each write is forwarded as a POST with only those fields; the Worker
// enforces who may write and every cleanup check.
// Two batch ops save the editor many connector calls per run: readmany (up to 6 keys, comma-separated)
// returns the items together, and reviewmany (items = a JSON array of {key,status,note}, up to 25) records
// each disposition as its own review POST, exactly as op=review would.
// If Deployment Protection is ever turned off, delete NEWSROOM_EDITOR_KEY to close this.

const DEFAULT_INBOX = 'https://federated-republic-newsroom.jcr0916.workers.dev';
const OPS = new Set(['list', 'read']);
const WRITES = { review: ['key', 'status', 'note'], purge: ['key', 'etag', 'manifest'] };

const KEY_RE = /^submissions\/[a-z-]+\/\d{4}-\d\d-\d\d\/[a-f\d-]+\.json$/;
const MAX_READ = 6;
const MAX_REVIEW = 25;

function readManyKeys(query) {
  const keys = String((query || {}).keys || '').split(',').map((k) => k.trim()).filter(Boolean);
  if (!keys.length || keys.length > MAX_READ || !keys.every((k) => KEY_RE.test(k))) return null;
  return keys;
}

function reviewManyItems(query) {
  let items;
  try { items = JSON.parse(String((query || {}).items || '')); } catch { return null; }
  if (!Array.isArray(items) || !items.length || items.length > MAX_REVIEW) return null;
  const out = [];
  for (const it of items) {
    if (!it || typeof it !== 'object') return null;
    const body = {};
    for (const k of WRITES.review) {
      if (typeof it[k] !== 'string' || !it[k]) return null;
      body[k] = it[k];
    }
    out.push(body);
  }
  return out;
}

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

function writeRequest(method, op, query, inbox = DEFAULT_INBOX) {
  if (method !== 'GET' || !Object.hasOwn(WRITES, op)) return null;
  const body = {};
  for (const k of WRITES[op]) {
    const v = (query || {})[k];
    if (typeof v !== 'string' || !v) return null;
    body[k] = v;
  }
  return { url: new URL(`/v1/${op}`, inbox).toString(), body };
}

async function handler(req, res, fetchImpl = fetch) {
  const key = process.env.NEWSROOM_EDITOR_KEY;
  if (!key || !protectedHost(req.headers.host)) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  const q = req.query || {};
  const inbox = process.env.NEWSROOM_URL || DEFAULT_INBOX;
  const op = String(q.op || '');
  if (req.method === 'GET' && (op === 'readmany' || op === 'reviewmany')) {
    try {
      if (op === 'readmany') {
        const keys = readManyKeys(q);
        if (!keys) { res.status(400).json({ error: `readmany takes 1–${MAX_READ} comma-separated submission keys` }); return; }
        const got = await Promise.all(keys.map(async (k) => {
          const r = await fetchImpl(new URL(`/v1/read?key=${encodeURIComponent(k)}`, inbox).toString(), { headers: { authorization: `Bearer ${key}` } });
          const text = await r.text();
          try { return r.status === 200 ? { item: JSON.parse(text) } : { error: { key: k, status: r.status } }; } catch { return { error: { key: k, status: 502 } }; }
        }));
        res.status(200).setHeader('content-type', 'application/json').setHeader('cache-control', 'no-store').json({ items: got.filter((g) => g.item).map((g) => g.item), errors: got.filter((g) => g.error).map((g) => g.error) });
        return;
      }
      const items = reviewManyItems(q);
      if (!items) { res.status(400).json({ error: `reviewmany takes items=[{"key","status","note"}…] (1–${MAX_REVIEW})` }); return; }
      const results = [];
      for (const body of items) {
        const r = await fetchImpl(new URL('/v1/review', inbox).toString(), { method: 'POST', headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' }, body: JSON.stringify(body) });
        results.push({ key: body.key, status: r.status, ok: r.status >= 200 && r.status < 300 });
      }
      res.status(200).setHeader('content-type', 'application/json').setHeader('cache-control', 'no-store').json({ results });
    } catch (e) {
      res.status(502).json({ error: 'Inbox unreachable' });
    }
    return;
  }
  const target = relayTarget(req.method, op, q, inbox);
  const write = target ? null : writeRequest(req.method, op, q, inbox);
  if (!target && !write) {
    res.status(404).json({ error: 'Use GET ?op=list, ?op=read&key=…, ?op=review&key=…&status=…&note=… or ?op=purge&key=…&etag=…&manifest=…' });
    return;
  }
  try {
    const r = target
      ? await fetchImpl(target, { headers: { authorization: `Bearer ${key}` } })
      : await fetchImpl(write.url, { method: 'POST', headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' }, body: JSON.stringify(write.body) });
    const text = await r.text();
    res.status(r.status).setHeader('content-type', 'application/json').setHeader('cache-control', 'no-store').send(text);
  } catch (e) {
    res.status(502).json({ error: 'Inbox unreachable' });
  }
}

module.exports = handler;
module.exports.relayTarget = relayTarget;
module.exports.writeRequest = writeRequest;
module.exports.protectedHost = protectedHost;
module.exports.readManyKeys = readManyKeys;
module.exports.reviewManyItems = reviewManyItems;
