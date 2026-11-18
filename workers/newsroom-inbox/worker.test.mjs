import test from 'node:test';
import assert from 'node:assert/strict';
import worker from './worker.js';

function bucket() {
  const m = new Map();
  return {
    m,
    put: async (k, v) => { m.set(k, v); },
    get: async (k) => (m.has(k) ? { etag: 'e:' + m.get(k).length, json: async () => JSON.parse(m.get(k)) } : null),
    delete: async (k) => { m.delete(k); },
    list: async ({ prefix }) => ({ objects: [...m.keys()].filter((k) => k.startsWith(prefix)).sort().map((key) => ({ key, etag: 'e:' + m.get(key).length })), truncated: false }),
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

const SHA = 'a'.repeat(40);
async function filed(e, body = draft) {
  return (await (await call(e, '/v1/submit', { key: 'fed', method: 'POST', body })).json()).key;
}
async function itemFor(e, key) {
  return (await (await call(e, '/v1/list', { key: 'ed' })).json()).items.find((i) => i.key === key);
}
function age(e, id, days) {
  const k = 'status/' + id + '.json', s = JSON.parse(e.NEWSROOM.m.get(k));
  s.reviewedAt = new Date(Date.now() - days * 86400000).toISOString();
  e.NEWSROOM.m.set(k, JSON.stringify(s));
}

test('editor list carries etag and status time; desks do not see etags', async () => {
  const e = env();
  const key = await filed(e);
  await call(e, '/v1/review', { key: 'ed', method: 'POST', body: { key, status: 'ARCHIVED', note: 'done' } });
  const it = await itemFor(e, key);
  assert.equal(it.status, 'ARCHIVED');
  assert.ok(it.etag && it.reviewedAt);
  const own = (await (await call(e, '/v1/list', { key: 'fed' })).json()).items[0];
  assert.equal(own.etag, undefined);
});

test('purge removes an archived item after 30 days and leaves a tombstone and review history', async () => {
  const e = env();
  const key = await filed(e);
  await call(e, '/v1/review', { key: 'ed', method: 'POST', body: { key, status: 'ARCHIVED', note: 'done' } });
  const it = await itemFor(e, key);
  age(e, it.id, 31);
  const r = await call(e, '/v1/purge', { key: 'ed', method: 'POST', body: { key, etag: it.etag, manifest: SHA } });
  assert.equal(r.status, 200);
  assert.equal(e.NEWSROOM.m.has(key), false);
  assert.equal(e.NEWSROOM.m.has('status/' + it.id + '.json'), false);
  assert.equal(JSON.parse(e.NEWSROOM.m.get('purged/' + it.id + '.json')).manifest, SHA);
  assert.ok([...e.NEWSROOM.m.keys()].some((k) => k.startsWith('reviews/' + it.id + '/')));
});

test('purge refuses: desk keys, wrong etag, no manifest, pending or held items, and a young archive', async () => {
  const e = env();
  const key = await filed(e);
  let it = await itemFor(e, key);
  const purge = (body, k = 'ed') => call(e, '/v1/purge', { key: k, method: 'POST', body: { key, etag: it.etag, manifest: SHA, ...body } });
  assert.equal((await purge({})).status, 400, 'no disposition');
  await call(e, '/v1/review', { key: 'ed', method: 'POST', body: { key, status: 'HOLD', note: 'held' } });
  age(e, it.id, 90);
  assert.equal((await purge({})).status, 400, 'held');
  await call(e, '/v1/review', { key: 'ed', method: 'POST', body: { key, status: 'ARCHIVED', note: 'done' } });
  assert.equal((await purge({})).status, 400, 'archived today');
  age(e, it.id, 31);
  assert.equal((await purge({}, 'fed')).status, 400, 'desk key');
  assert.equal((await purge({ etag: 'other' })).status, 400, 'changed object');
  assert.equal((await purge({ manifest: 'main' })).status, 400, 'manifest must be a commit');
  assert.equal(e.NEWSROOM.m.has(key), true);
  assert.equal((await purge({})).status, 200);
});

test('a rejected test item can be purged without waiting', async () => {
  const e = env();
  const key = await filed(e, { title: '[TEST ONLY] routing check', kind: 'other', body: 'x' });
  await call(e, '/v1/review', { key: 'ed', method: 'POST', body: { key, status: 'REJECTED', note: 'test item' } });
  const it = await itemFor(e, key);
  assert.equal((await call(e, '/v1/purge', { key: 'ed', method: 'POST', body: { key, etag: it.etag, manifest: SHA } })).status, 200);
});
