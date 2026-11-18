import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const core = require('../api/_newsroom-core.js');
const tri = require('../api/_newsroom-triage.js');

const NOW = new Date('2026-11-19T16:37:00Z');

test('desks declare track and attention in a summary tag, with sensible defaults', () => {
  const draft = (extra) => JSON.stringify({ kind: 'article', title: 'T', summary: 'S.', body: 'B', ...extra });
  assert.match(core.parseProposal(draft({ track: 'canon', attention: { importance: 'high', timeSensitive: true, touches: ['federal authority'] } })).summary,
    /^\[canon · high · timely · touches: federal authority\] S\.$/);
  assert.match(core.parseProposal(draft({})).summary, /^\[canon · normal\] /);
  assert.match(core.parseProposal(JSON.stringify({ kind: 'pitch', title: 'T', body: 'B' })).summary, /^\[idea · normal\]/);
  assert.match(core.parseProposal(JSON.stringify({ kind: 'nrs-proposal', title: 'T', body: 'B' })).summary, /^\[record · low\]/);
});

test('records desks write with Flash alone', () => {
  const roster = core.withRecordDesks(JSON.parse(fs.readFileSync(core.ROSTER_PATH, 'utf8')));
  for (const d of roster.desks.filter((x) => x.id.endsWith('-records'))) assert.equal(d.planner, null, d.id);
});

function inbox(items, bodies = {}) {
  const calls = { gateway: [], submit: [] };
  const impl = async (url, init = {}) => {
    url = String(url);
    if (url.includes('api.github.com')) return { ok: true, status: 200, text: async () => 'abc' };
    const m = url.match(/githubusercontent\.com\/[^/]+\/[^/]+\/[^/]+\/(.*)$/);
    if (m) { const p = decodeURIComponent(m[1]); return fs.existsSync(p) ? { ok: true, status: 200, text: async () => fs.readFileSync(p, 'utf8') } : { ok: false, status: 404, text: async () => '' }; }
    if (url.includes('/v1/list')) return { ok: true, status: 200, json: async () => ({ items, more: false }) };
    if (url.includes('/v1/read')) { const k = decodeURIComponent(url.split('key=')[1]); return { ok: true, status: 200, json: async () => ({ key: k, body: bodies[k] || 'Body.' }) }; }
    if (url.includes('/v1/submit')) { calls.submit.push({ headers: init.headers, body: JSON.parse(init.body) }); return { ok: true, status: 200, json: async () => ({ id: 'x', key: 'submissions/desk-editor/x.json' }) }; }
    calls.gateway.push(JSON.parse(init.body));
    const reply = { summary: 'A quiet day.', items: [{ key: items[0].key, desk: items[0].desk, title: items[0].title, track: 'canon', route: 'editor', rank: 1, flags: [], line: 'Moves the settlement.' }] };
    return { ok: true, status: 200, json: async () => ({ choices: [{ message: { content: JSON.stringify(reply) } }], usage: {} }) };
  };
  return { impl, calls };
}

test('the desk editor ranks only new, non-test filings and files its triage', async () => {
  const items = [
    { key: 'submissions/korda/a.json', desk: 'korda', kind: 'article', title: 'Ferry reply', summary: '[canon · high] A written reply.', submittedAt: '2026-11-19T16:09:00Z', status: 'PROPOSED' },
    { key: 'submissions/varek-records/b.json', desk: 'varek-records', kind: 'nrs-proposal', title: 'Culvert return', summary: '[record · low] Routine.', submittedAt: '2026-11-19T16:10:00Z', status: 'PROPOSED' },
    { key: 'submissions/korda/old.json', desk: 'korda', kind: 'article', title: 'Old', summary: '[canon · normal] x', submittedAt: '2026-11-10T16:00:00Z', status: 'PROPOSED' },
    { key: 'submissions/federal/t.json', desk: 'federal', kind: 'other', title: '[TEST ONLY] check', summary: 'test', submittedAt: '2026-11-19T16:00:00Z', status: 'PROPOSED' },
  ];
  const { impl, calls } = inbox(items);
  const out = await tri.runTriage({ env: { NEWSROOM_EDITOR_KEY: 'ed', NEWSROOM_RUNNER_KEY: 'run', AI_GATEWAY_API_KEY: 'gw' }, fetchImpl: impl, now: NOW });
  assert.equal(out.status, 'submitted');
  assert.equal(out.filings, 2);
  assert.equal(calls.gateway[0].model, 'anthropic/claude-haiku-5.5');
  assert.equal(calls.gateway[0].response_format, undefined);
  const prompt = calls.gateway[0].messages[1].content;
  assert.ok(prompt.includes('Ferry reply') && prompt.includes('Excerpt:') && !prompt.includes('Old') && !prompt.includes('TEST ONLY'));
  assert.ok(calls.gateway[0].messages[0].content.includes('## Source: docs/torenthia/STORY-STATUS.md'));
  const filed = calls.submit[0];
  assert.equal(filed.headers['x-newsroom-desk'], 'desk-editor');
  assert.match(filed.body.body, /## editor\n- #1 \*\*korda\*\*: Ferry reply/);
  assert.match(filed.body.body, /## unsorted\n- \*\*varek-records\*\*: Culvert return/, 'filings the model skipped are listed, not lost');
});

test('nothing new means no model call', async () => {
  const { impl, calls } = inbox([]);
  const out = await tri.runTriage({ env: { NEWSROOM_EDITOR_KEY: 'ed', NEWSROOM_RUNNER_KEY: 'run', AI_GATEWAY_API_KEY: 'gw' }, fetchImpl: impl, now: NOW });
  assert.equal(out.status, 'nothing-new');
  assert.equal(calls.gateway.length, 0);
});
