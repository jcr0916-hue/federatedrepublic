import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const ask = require('../api/newsroom-ask.js');

function mockRes() {
  const r = { code: 0, body: null };
  r.status = (c) => { r.code = c; return r; };
  r.json = (b) => { r.body = b; return r; };
  return r;
}
function localFetch(reply) {
  const calls = [];
  const impl = async (url, init = {}) => {
    if (String(url).includes('api.github.com')) return { ok: true, status: 200, text: async () => 'abc123' };
    const m = String(url).match(/githubusercontent\.com\/[^/]+\/[^/]+\/[^/]+\/(.*)$/);
    if (m) {
      const p = decodeURIComponent(m[1]);
      return fs.existsSync(p) ? { ok: true, status: 200, text: async () => fs.readFileSync(p, 'utf8') } : { ok: false, status: 404, text: async () => '' };
    }
    calls.push({ url, body: JSON.parse(init.body) });
    return { ok: true, status: 200, json: async () => ({ choices: [{ message: { content: JSON.stringify(reply) } }], usage: { total_tokens: 1 } }) };
  };
  return { impl, calls };
}

test('refuses the public domain', async () => {
  const res = mockRes();
  await ask({ method: 'GET', headers: { host: 'thefederatedrepublic.org' }, query: { desk: 'korda', q: 'x' } }, res);
  assert.equal(res.code, 404);
});

test('a desk answers in its own voice with its brief, notes and canon', async () => {
  process.env.AI_GATEWAY_API_KEY = 'gw';
  const { impl, calls } = localFetch({ answer: '**Established:** the Convention adopted the settlement 28–5.' });
  const res = mockRes();
  await ask({ method: 'GET', headers: { host: 'federatedrepublic-x.vercel.app' }, query: { desk: 'korda', q: "What's going on in Korda?" } }, res, impl);
  assert.equal(res.code, 200, JSON.stringify(res.body));
  assert.match(res.body.answer, /28–5/);
  const msgs = calls[0].body.messages;
  assert.ok(msgs[0].content.startsWith('# Torenthia newsroom'));
  assert.ok(msgs[1].content.startsWith('# Your desk: Korda'));
  assert.ok(msgs[1].content.includes("What's going on in Korda?"));
  assert.ok(msgs[1].content.includes('## Notes from the editor'));
  delete process.env.AI_GATEWAY_API_KEY;
});

test('records desks can be asked too, and unknown desks list the roster', async () => {
  process.env.AI_GATEWAY_API_KEY = 'gw';
  const { impl } = localFetch({ answer: 'ok' });
  const res = mockRes();
  await ask({ method: 'GET', headers: { host: 'federatedrepublic-x.vercel.app' }, query: { desk: 'nowhere', q: 'hi' } }, res, impl);
  assert.equal(res.code, 404);
  assert.ok(res.body.desks.includes('korda') && res.body.desks.includes('varek-records'));
  delete process.env.AI_GATEWAY_API_KEY;
});
