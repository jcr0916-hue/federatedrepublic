// Vercel Serverless Function: read-only view of the newsroom inbox for the Central Editor's shell.
// The editor's workspace can reach the public domain but not workers.dev or *.vercel.app, so it cannot
// script against the inbox through the protected relay (api/newsroom-inbox.js). This route answers on any
// host, but only to a caller that sends the secret read token (NEWSROOM_READ_TOKEN). It relays list, read
// and readmany to the inbox Worker with NEWSROOM_EDITOR_KEY, which never leaves Vercel, and it has no
// write path: dispositions and purges stay on the protected relay. Anything else, including a missing or
// wrong token or an unset one, is an identical 404. Rotating the token is one Vercel variable.
//
//   GET ?op=list[&desk=<id>][&limit=<n>][&cursor=<c>]
//   GET ?op=read&key=<submission key>
//   GET ?op=readmany&keys=<up to 10 keys, comma-separated>

const crypto = require('node:crypto');

const DEFAULT_INBOX = 'https://federated-republic-newsroom.jcr0916.workers.dev';
const KEY_RE = /^submissions\/[a-z-]+\/\d{4}-\d\d-\d\d\/[a-f\d-]+\.json$/;
const DESK_RE = /^[a-z][a-z-]{1,29}$/;
const MAX_MANY = 10;

function digest(s) {
  return crypto.createHash('sha256').update(String(s)).digest();
}

// Constant-time comparison of SHA-256 digests, so neither length nor content leaks through timing.
function tokenOk(header, token) {
  if (!token || String(token).length < 24) return false; // an unset or weak token disables the route
  const m = String(header || '').match(/^Bearer (.+)$/);
  return !!m && crypto.timingSafeEqual(digest(m[1]), digest(token));
}

function listUrl(query, inbox) {
  const url = new URL('/v1/list', inbox);
  const q = query || {};
  if (typeof q.desk === 'string' && q.desk && q.desk !== 'all') {
    if (!DESK_RE.test(q.desk)) return null;
    url.searchParams.set('desk', q.desk);
  }
  if (typeof q.limit === 'string' && /^\d{1,3}$/.test(q.limit)) url.searchParams.set('limit', q.limit);
  if (typeof q.cursor === 'string' && q.cursor && q.cursor.length < 400) url.searchParams.set('cursor', q.cursor);
  return url.toString();
}

function readUrl(key, inbox) {
  return KEY_RE.test(String(key || '')) ? new URL(`/v1/read?key=${encodeURIComponent(key)}`, inbox).toString() : null;
}

function manyKeys(query) {
  const keys = String((query || {}).keys || '').split(',').map((k) => k.trim()).filter(Boolean);
  return keys.length && keys.length <= MAX_MANY && keys.every((k) => KEY_RE.test(k)) ? keys : null;
}

async function handler(req, res, fetchImpl = fetch) {
  const editorKey = process.env.NEWSROOM_EDITOR_KEY;
  const send = (code, body) => { res.status(code).setHeader('content-type', 'application/json').setHeader('cache-control', 'no-store').setHeader('x-robots-tag', 'noindex').send(typeof body === 'string' ? body : JSON.stringify(body)); };
  if (req.method !== 'GET' || !editorKey || !tokenOk((req.headers || {}).authorization, process.env.NEWSROOM_READ_TOKEN)) {
    send(404, { error: 'Not found' });
    return;
  }
  const q = req.query || {};
  const inbox = process.env.NEWSROOM_URL || DEFAULT_INBOX;
  const get = (url) => fetchImpl(url, { headers: { authorization: `Bearer ${editorKey}` } });
  try {
    if (q.op === 'list') {
      const url = listUrl(q, inbox);
      if (!url) { send(400, { error: 'bad desk' }); return; }
      const r = await get(url);
      send(r.status, await r.text());
      return;
    }
    if (q.op === 'read') {
      const url = readUrl(q.key, inbox);
      if (!url) { send(400, { error: 'bad key' }); return; }
      const r = await get(url);
      send(r.status, await r.text());
      return;
    }
    if (q.op === 'readmany') {
      const keys = manyKeys(q);
      if (!keys) { send(400, { error: `readmany takes 1–${MAX_MANY} comma-separated submission keys` }); return; }
      const got = await Promise.all(keys.map(async (k) => {
        const r = await get(readUrl(k, inbox));
        const text = await r.text();
        try { return r.status === 200 ? { item: JSON.parse(text) } : { error: { key: k, status: r.status } }; } catch { return { error: { key: k, status: 502 } }; }
      }));
      send(200, { items: got.filter((g) => g.item).map((g) => g.item), errors: got.filter((g) => g.error).map((g) => g.error) });
      return;
    }
    send(400, { error: 'Use ?op=list, ?op=read&key=… or ?op=readmany&keys=…' });
  } catch {
    send(502, { error: 'Inbox unreachable' });
  }
}

module.exports = handler;
module.exports.tokenOk = tokenOk;
module.exports.listUrl = listUrl;
module.exports.readUrl = readUrl;
module.exports.manyKeys = manyKeys;
