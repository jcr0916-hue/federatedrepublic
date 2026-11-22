import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const read = require('../api/newsroom-read.js');

const TOKEN = 'T'.repeat(40);
const K1 = 'submissions/korda/2026-11-17/e2e5a8c9-e51d-4d91-905b-01e499ea0d7a.json';
const K2 = 'submissions/federal/2026-11-17/66f5812c-51a2-46ce-a0b4-5e32313648b0.json';

function mockRes() {
  const r = { code: 0, body: null, headers: {} };
  r.status = (c) => { r.code = c; return r; };
  r.setHeader = (k, v) => { r.headers[k] = v; return r; };
  r.send = (b) => { r.body = b; return r; };
  return r;
}
async function call(req, fetchImpl) {
  const res = mockRes();
  await read({ method: 'GET', headers: {}, query: {}, ...req }, res, fetchImpl || (async () => { throw new Error('inbox must not be called'); }));
  return res;
}
function withEnv(env, fn) {
  const old = { t: process.env.NEWSROOM_READ_TOKEN, k: process.env.NEWSROOM_EDITOR_KEY };
  process.env.NEWSROOM_EDITOR_KEY = 'editor-key';
  if (env.token === undefined) delete process.env.NEWSROOM_READ_TOKEN; else process.env.NEWSROOM_READ_TOKEN = env.token;
  return fn().finally(() => { if (old.t === undefined) delete process.env.NEWSROOM_READ_TOKEN; else process.env.NEWSROOM_READ_TOKEN = old.t; if (old.k === undefined) delete process.env.NEWSROOM_EDITOR_KEY; else process.env.NEWSROOM_EDITOR_KEY = old.k; });
}

test('without the right token every request is the same 404, and the inbox is never called', () => withEnv({ token: TOKEN }, async () => {
  const cases = [
    {},
    { headers: { authorization: 'Bearer wrong' } },
    { headers: { authorization: `Basic ${TOKEN}` } },
    { headers: { authorization: TOKEN } },
    { method: 'POST', headers: { authorization: `Bearer ${TOKEN}` } },
  ];
  for (const c of cases) {
    const res = await call({ query: { op: 'list' }, ...c });
    assert.equal(res.code, 404, JSON.stringify(c));
    assert.equal(res.body, '{"error":"Not found"}');
  }
}));

test('an unset or weak token disables the route, even for a caller that sends it', async () => {
  await withEnv({ token: undefined }, async () => assert.equal((await call({ query: { op: 'list' }, headers: { authorization: 'Bearer undefined' } })).code, 404));
  await withEnv({ token: 'short' }, async () => assert.equal((await call({ query: { op: 'list' }, headers: { authorization: 'Bearer short' } })).code, 404));
});

test('list, read and readmany relay to the Worker with the editor key and nothing else', () => withEnv({ token: TOKEN }, async () => {
  const seen = [];
  const fetchImpl = async (url, init) => {
    seen.push({ url: String(url), auth: init.headers.authorization, method: init.method || 'GET' });
    if (String(url).includes('/v1/list')) return { status: 200, text: async () => '{"items":[],"more":false}' };
    return { status: 200, text: async () => JSON.stringify({ key: decodeURIComponent(String(url).split('key=')[1]), body: 'B' }) };
  };
  const auth = { authorization: `Bearer ${TOKEN}` };
  const list = await call({ headers: auth, query: { op: 'list', desk: 'korda', limit: '50', cursor: 'abc', status: 'PROPOSED', evil: 'x' } }, fetchImpl);
  assert.equal(list.code, 200);
  assert.match(seen[0].url, /\/v1\/list\?desk=korda&limit=50&cursor=abc$/, 'only desk, limit and cursor pass through');
  assert.equal(seen[0].auth, 'Bearer editor-key');
  const one = await call({ headers: auth, query: { op: 'read', key: K1 } }, fetchImpl);
  assert.equal(JSON.parse(one.body).key, K1);
  const many = await call({ headers: auth, query: { op: 'readmany', keys: `${K1},${K2}` } }, fetchImpl);
  assert.equal(JSON.parse(many.body).items.length, 2);
  assert.ok(seen.every((s) => s.method === 'GET' && s.auth === 'Bearer editor-key'));
  assert.equal(many.code, 200);
}));

test('bad input is a 400 without touching the inbox; write ops do not exist here', () => withEnv({ token: TOKEN }, async () => {
  const auth = { authorization: `Bearer ${TOKEN}` };
  for (const query of [{ op: 'read', key: '../../etc/passwd' }, { op: 'read' }, { op: 'list', desk: 'Evil/../x' }, { op: 'readmany', keys: '' }, { op: 'readmany', keys: Array(11).fill(K1).join(',') }, { op: 'review', key: K1, status: 'ARCHIVED', note: 'n' }, { op: 'purge', key: K1 }, { op: 'reviewmany', items: '[]' }, {}]) {
    assert.equal((await call({ headers: auth, query })).code, 400, JSON.stringify(query));
  }
}));

test('a Worker error status passes through; an unreachable Worker is a 502', () => withEnv({ token: TOKEN }, async () => {
  const auth = { authorization: `Bearer ${TOKEN}` };
  const nf = await call({ headers: auth, query: { op: 'read', key: K1 } }, async () => ({ status: 404, text: async () => '{"error":"not found"}' }));
  assert.equal(nf.code, 404);
  const down = await call({ headers: auth, query: { op: 'list' } }, async () => { throw new Error('down'); });
  assert.equal(down.code, 502);
  const partial = await call({ headers: auth, query: { op: 'readmany', keys: `${K1},${K2}` } }, async (url) => (String(url).includes('66f5812c') ? { status: 404, text: async () => '{}' } : { status: 200, text: async () => '{"key":"k"}' }));
  assert.deepEqual(JSON.parse(partial.body).errors, [{ key: K2, status: 404 }]);
}));

test('vercel.json builds and routes the read endpoint', () => {
  const v = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  assert.ok(v.builds.some((b) => b.src === 'api/newsroom-read.js'));
  assert.ok(v.routes.some((r) => r.src === '/api/newsroom-read' && r.dest === '/api/newsroom-read.js'));
});
