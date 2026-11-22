import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const relay = require('../api/newsroom-inbox.js');

function mockRes() {
  const r = { code: 0, body: null, headers: {} };
  r.status = (c) => { r.code = c; return r; };
  r.json = (b) => { r.body = b; return r; };
  r.setHeader = (k, v) => { r.headers[k] = v; return r; };
  r.send = (b) => { r.body = b; return r; };
  return r;
}

test('only GET list and GET read are relayed', () => {
  assert.match(relay.relayTarget('GET', 'list', { op: 'list', status: 'PROPOSED' }), /\/v1\/list\?status=PROPOSED$/);
  assert.match(relay.relayTarget('GET', 'read', { op: 'read', key: 'submissions/a/b.json' }), /\/v1\/read\?key=submissions%2Fa%2Fb\.json$/);
  for (const [m, op] of [['POST', 'review'], ['GET', 'review'], ['POST', 'submit'], ['POST', 'list'], ['GET', 'constructor']]) {
    assert.equal(relay.relayTarget(m, op, {}), null, `${m} ${op}`);
  }
});

test('answers only on protected *.vercel.app hosts', () => {
  assert.equal(relay.protectedHost('federatedrepublic.vercel.app'), true);
  assert.equal(relay.protectedHost('federatedrepublic-abc-the-federated-republic.vercel.app'), true);
  assert.equal(relay.protectedHost('thefederatedrepublic.org'), false);
  assert.equal(relay.protectedHost('www.thefederatedrepublic.org'), false);
  assert.equal(relay.protectedHost('evil.vercel.app.example.com'), false);
  assert.equal(relay.protectedHost(''), false);
});

test('refuses the public domain without calling the inbox', async () => {
  process.env.NEWSROOM_EDITOR_KEY = 'k';
  let called = false;
  const res = mockRes();
  await relay({ method: 'GET', headers: { host: 'thefederatedrepublic.org' }, query: { op: 'list' } }, res, async () => { called = true; });
  assert.equal(res.code, 404);
  assert.equal(called, false);
});

test('on a protected host, attaches the editor key itself and returns the inbox reply', async () => {
  process.env.NEWSROOM_EDITOR_KEY = 'k';
  let seen;
  const res = mockRes();
  await relay({ method: 'GET', headers: { host: 'federatedrepublic.vercel.app', authorization: 'Bearer caller' }, query: { op: 'list' } }, res,
    async (url, init) => { seen = init; return { status: 200, text: async () => '{"items":[]}' }; });
  assert.equal(seen.headers.authorization, 'Bearer k');
  assert.equal(res.code, 200);
  delete process.env.NEWSROOM_EDITOR_KEY;
});

test('review and purge are relayed as POSTs carrying only their own fields', () => {
  const r = relay.writeRequest('GET', 'review', { op: 'review', key: 'k', status: 'ARCHIVED', note: 'n', extra: 'x' });
  assert.match(r.url, /\/v1\/review$/);
  assert.deepEqual(r.body, { key: 'k', status: 'ARCHIVED', note: 'n' });
  const p = relay.writeRequest('GET', 'purge', { op: 'purge', key: 'k', etag: 'e', manifest: 'a'.repeat(40) });
  assert.deepEqual(p.body, { key: 'k', etag: 'e', manifest: 'a'.repeat(40) });
  assert.equal(relay.writeRequest('GET', 'review', { key: 'k', status: 'ARCHIVED' }), null, 'note required');
  assert.equal(relay.writeRequest('GET', 'purge', { key: 'k', etag: 'e' }), null, 'manifest required');
  for (const op of ['submit', 'list', 'read', 'constructor', '__proto__']) assert.equal(relay.writeRequest('GET', op, { key: 'k' }), null, op);
  assert.equal(relay.writeRequest('POST', 'review', { key: 'k', status: 'A', note: 'n' }), null);
});

test('a write reaches the Worker as an editor POST', async () => {
  process.env.NEWSROOM_EDITOR_KEY = 'k';
  let seen;
  const res = mockRes();
  await relay({ method: 'GET', headers: { host: 'federatedrepublic.vercel.app' }, query: { op: 'review', key: 'submissions/a/2026-01-01/x.json', status: 'HOLD', note: 'n' } }, res,
    async (url, init) => { seen = { url, init }; return { status: 200, text: async () => '{}' }; });
  assert.match(seen.url, /\/v1\/review$/);
  assert.equal(seen.init.method, 'POST');
  assert.equal(seen.init.headers.authorization, 'Bearer k');
  assert.deepEqual(JSON.parse(seen.init.body), { key: 'submissions/a/2026-01-01/x.json', status: 'HOLD', note: 'n' });
  assert.equal(res.headers['cache-control'], 'no-store');
  delete process.env.NEWSROOM_EDITOR_KEY;
});

test('readmany returns several items in one call; reviewmany records each disposition as its own POST', async () => {
  process.env.NEWSROOM_EDITOR_KEY = 'k';
  const k1 = 'submissions/korda/2026-11-17/e2e5a8c9-e51d-4d91-905b-01e499ea0d7a.json';
  const k2 = 'submissions/federal/2026-11-17/66f5812c-51a2-46ce-a0b4-5e32313648b0.json';
  const calls = [];
  const fetchImpl = async (url, init = {}) => {
    calls.push({ url, method: init.method || 'GET', auth: init.headers.authorization, body: init.body });
    if (String(url).includes('/v1/read')) return String(url).includes('missing') ? { status: 404, text: async () => '{}' } : { status: 200, text: async () => JSON.stringify({ key: decodeURIComponent(String(url).split('key=')[1]), body: 'B' }) };
    return { status: 200, text: async () => '{}' };
  };
  const read = mockRes();
  await relay({ method: 'GET', headers: { host: 'federatedrepublic.vercel.app' }, query: { op: 'readmany', keys: `${k1},${k2}` } }, read, fetchImpl);
  assert.equal(read.code, 200);
  assert.deepEqual(read.body.items.map((i) => i.key).sort(), [k2, k1].sort());
  assert.equal(calls.filter((c) => c.url.includes('/v1/read')).length, 2);
  assert.ok(calls.every((c) => c.auth === 'Bearer k'));

  const bad = mockRes();
  await relay({ method: 'GET', headers: { host: 'federatedrepublic.vercel.app' }, query: { op: 'readmany', keys: '../../etc/passwd' } }, bad, fetchImpl);
  assert.equal(bad.code, 400);
  const tooMany = mockRes();
  await relay({ method: 'GET', headers: { host: 'federatedrepublic.vercel.app' }, query: { op: 'readmany', keys: Array(7).fill(k1).join(',') } }, tooMany, fetchImpl);
  assert.equal(tooMany.code, 400);

  calls.length = 0;
  const rev = mockRes();
  const items = JSON.stringify([{ key: k1, status: 'ARCHIVED', note: 'Published as news 139.', extra: 'dropped' }, { key: k2, status: 'HOLD', note: 'Held.' }]);
  await relay({ method: 'GET', headers: { host: 'federatedrepublic.vercel.app' }, query: { op: 'reviewmany', items } }, rev, fetchImpl);
  assert.equal(rev.code, 200);
  assert.deepEqual(rev.body.results.map((r) => r.ok), [true, true]);
  assert.equal(calls.length, 2);
  assert.deepEqual(JSON.parse(calls[0].body), { key: k1, status: 'ARCHIVED', note: 'Published as news 139.' });
  assert.equal(calls[0].method, 'POST');

  for (const items2 of ['not json', '[]', JSON.stringify([{ key: k1, status: 'ARCHIVED' }])]) {
    const r2 = mockRes();
    await relay({ method: 'GET', headers: { host: 'federatedrepublic.vercel.app' }, query: { op: 'reviewmany', items: items2 } }, r2, fetchImpl);
    assert.equal(r2.code, 400, items2);
  }
  const pub = mockRes();
  await relay({ method: 'GET', headers: { host: 'thefederatedrepublic.org' }, query: { op: 'readmany', keys: k1 } }, pub, fetchImpl);
  assert.equal(pub.code, 404);
  delete process.env.NEWSROOM_EDITOR_KEY;
});
