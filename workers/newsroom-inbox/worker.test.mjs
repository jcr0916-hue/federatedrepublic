import test from 'node:test';
import assert from 'node:assert/strict';
import worker from './worker.js';

function bucket() {
  const m = new Map();
  return {
    m,
    put: async (k, v) => { m.set(k, v); },
    get: async (k) => (m.has(k) ? { json: async () => JSON.parse(m.get(k)) } : null),
    list: async ({ prefix }) => ({ objects: [...m.keys()].filter((k) => k.startsWith(prefix)).sort().map((key) => ({ key })), truncated: false }),
  };
}
const env = () => ({ NEWSROOM: bucket(), KEY_EDITOR: 'ed', KEY_FEDERAL: 'fed', KEY_RUNNER: 'run' });
const call = (e, path, { key, desk, method = 'GET', body } = {}) => worker.fetch(new Request('https://x' + path, {
  method,
  headers: { ...(key ? { Authorization: `Bearer ${key}` } : {}), ...(desk ? { 'x-newsroom-desk': desk } : {}), 'content-type': 'application/json' },
  body: body ? JSON.stringify(body) : undefined,
}), e);
const draft = { title: 'T', kind: 'article', body: 'B' };

test('runner key files under the desk it names', async () => {
  const e = env();
  const r = await call(e, '/v1/submit', { key: 'run', desk: 'arvane', method: 'POST', body: draft });
  assert.equal(r.status, 201);
  assert.match((await r.json()).key, /^submissions\/arvane\//);
});

test('runner key lists only the named desk and cannot review', async () => {
  const e = env();
  await call(e, '/v1/submit', { key: 'run', desk: 'arvane', method: 'POST', body: draft });
  await call(e, '/v1/submit', { key: 'fed', method: 'POST', body: draft });
  const l = await (await call(e, '/v1/list', { key: 'run', desk: 'arvane' })).json();
  assert.equal(l.items.length, 1);
  assert.equal(l.items[0].desk, 'arvane');
  const rv = await call(e, '/v1/review', { key: 'run', desk: 'arvane', method: 'POST', body: { key: l.items[0].key, status: 'ACCEPTED', note: 'x' } });
  assert.equal(rv.status, 400);
});

test('runner key needs a valid desk and cannot claim the editor', async () => {
  const e = env();
  for (const desk of [undefined, 'editorial', 'Bad Desk', '../x']) {
    const r = await call(e, '/v1/submit', { key: 'run', desk, method: 'POST', body: draft });
    assert.equal(r.status, 401, String(desk));
  }
});

test('existing desk and editor keys keep working; unknown keys are refused', async () => {
  const e = env();
  assert.equal((await call(e, '/v1/submit', { key: 'fed', method: 'POST', body: draft })).status, 201);
  assert.equal((await call(e, '/v1/list', { key: 'ed' })).status, 200);
  assert.equal((await call(e, '/v1/list', { key: 'nope' })).status, 401);
});

test('without KEY_RUNNER set, the runner path is off', async () => {
  const e = env(); delete e.KEY_RUNNER;
  assert.equal((await call(e, '/v1/submit', { key: 'run', desk: 'arvane', method: 'POST', body: draft })).status, 401);
});
