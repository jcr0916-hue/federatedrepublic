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

test('only list, read (GET) and review (POST) are relayed', () => {
  assert.match(relay.relayTarget('GET', 'list', { op: 'list', status: 'PROPOSED' }), /\/v1\/list\?status=PROPOSED$/);
  assert.match(relay.relayTarget('GET', 'read', { op: 'read', key: 'submissions/a/b.json' }), /\/v1\/read\?key=submissions%2Fa%2Fb\.json$/);
  assert.match(relay.relayTarget('POST', 'review', { op: 'review' }), /\/v1\/review$/);
  assert.equal(relay.relayTarget('POST', 'submit', {}), null);
  assert.equal(relay.relayTarget('GET', 'review', {}), null);
  assert.equal(relay.relayTarget('GET', 'constructor', {}), null);
});

test('refuses callers without a bearer token and never calls the inbox', async () => {
  let called = false;
  const res = mockRes();
  await relay({ method: 'GET', headers: {}, query: { op: 'list' } }, res, async () => { called = true; });
  assert.equal(res.code, 401);
  assert.equal(called, false);
});

test('passes the caller\'s authorization through and returns the inbox status', async () => {
  let seen;
  const res = mockRes();
  await relay({ method: 'GET', headers: { authorization: 'Bearer x' }, query: { op: 'list' } }, res,
    async (url, init) => { seen = { url, init }; return { status: 401, text: async () => '{"error":"Unauthorized"}' }; });
  assert.equal(seen.init.headers.authorization, 'Bearer x');
  assert.equal(res.code, 401);
});
