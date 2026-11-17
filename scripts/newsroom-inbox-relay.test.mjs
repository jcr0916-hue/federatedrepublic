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
