import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const core = require('../api/_newsroom-core.js');

const MONDAY = new Date('2026-11-16T16:07:00Z');
const TUESDAY = new Date('2026-11-17T16:07:00Z');

// Serve repository files from the working tree in place of raw.githubusercontent.com.
function fakeFetch({ planReply, writeReply, inboxStatus = 201 } = {}) {
  const calls = { gateway: [], inbox: [], raw: [] };
  const impl = async (url, init = {}) => {
    if (url.startsWith(core.REPO_RAW)) {
      const path = url.slice(core.REPO_RAW.length);
      calls.raw.push(path);
      if (!fs.existsSync(path)) return new Response('missing', { status: 404 });
      return new Response(fs.readFileSync(path, 'utf8'), { status: 200 });
    }
    if (url.startsWith('https://ai-gateway.vercel.sh/')) {
      const body = JSON.parse(init.body);
      calls.gateway.push(body);
      const isPlan = body.messages[1].content.includes('## Your task: plan, do not write');
      const reply = isPlan ? planReply : writeReply;
      return Response.json({ choices: [{ message: { content: JSON.stringify(reply) } }], usage: { prompt_tokens: 10, completion_tokens: 5 } });
    }
    if (url.endsWith('/v1/submit')) {
      calls.inbox.push({ auth: init.headers.Authorization, body: JSON.parse(init.body) });
      return Response.json({ id: 'abc', key: 'submissions/federal/2026-11-16/abc.json', status: 'PROPOSED' }, { status: inboxStatus });
    }
    throw new Error(`unexpected fetch ${url}`);
  };
  return { impl, calls };
}

const env = { AI_GATEWAY_API_KEY: 'gw', NEWSROOM_KEY_FEDERAL: 'fed-key' };
const plan = { kind: 'article', workingTitle: 'T', angle: 'A', outline: ['one'], facts: [], newElements: [], cautions: [] };
const draft = { kind: 'article', title: 'A Federal Story', summary: 'S', body: 'Body text.', sourceRefs: ['docs/torenthia/STORY-STATUS.md'], notesForEditor: 'New name: Ilse Marr.' };

test('roster on main parses and every enabled desk has its files', () => {
  const roster = JSON.parse(fs.readFileSync(core.ROSTER_PATH, 'utf8'));
  assert.ok(fs.existsSync(roster.rulesPath));
  for (const d of roster.desks.filter((x) => x.enabled)) {
    assert.ok(fs.existsSync(d.briefPath), d.briefPath);
    for (const p of [...roster.sharedSources, ...d.sources]) assert.ok(fs.existsSync(p), p);
  }
});

test('only desks scheduled for today run', () => {
  const roster = { desks: [{ id: 'federal', enabled: true, days: ['mon'] }, { id: 'korda', enabled: false, days: ['mon'] }] };
  assert.deepEqual(core.dueDesks(roster, MONDAY).map((d) => d.id), ['federal']);
  assert.deepEqual(core.dueDesks(roster, TUESDAY), []);
  assert.deepEqual(core.dueDesks({ ...roster, paused: true }, MONDAY), []);
  assert.deepEqual(core.dueDesks(roster, TUESDAY, 'federal').map((d) => d.id), ['federal']);
  assert.deepEqual(core.dueDesks(roster, TUESDAY, 'korda'), []);
});

test('Pro plans, Flash writes, and one proposal reaches the federal inbox', async () => {
  const { impl, calls } = fakeFetch({ planReply: plan, writeReply: draft });
  const out = await core.runNewsroom({ env, fetchImpl: impl, now: MONDAY });
  assert.equal(out.results.length, 1);
  const r = out.results[0];
  assert.equal(r.status, 'submitted');
  assert.deepEqual(calls.gateway.map((g) => g.model), ['deepseek/deepseek-v4-pro', 'deepseek/deepseek-v4-flash']);
  assert.ok(calls.gateway[1].messages[1].content.includes('"workingTitle": "T"'), 'writer receives the plan');
  assert.ok(!calls.gateway[0].messages[1].content.includes('docs/constitution-current.md'), 'planner skips the full constitution');
  assert.ok(calls.gateway[1].messages[1].content.includes('## Source: docs/constitution-current.md'), 'writer gets the constitution');
  assert.equal(calls.inbox.length, 1);
  assert.equal(calls.inbox[0].auth, 'Bearer fed-key');
  assert.match(calls.inbox[0].body.body, /Notes for the editor:\nNew name: Ilse Marr\./);
});

test('a planner skip means no writer call and no submission', async () => {
  const { impl, calls } = fakeFetch({ planReply: { skip: true, reason: 'nothing new' } });
  const out = await core.runNewsroom({ env, fetchImpl: impl, now: MONDAY });
  assert.equal(out.results[0].status, 'no-submission');
  assert.equal(calls.gateway.length, 1);
  assert.equal(calls.inbox.length, 0);
});

test('missing inbox key skips the desk before any paid call', async () => {
  const { impl, calls } = fakeFetch({ planReply: plan, writeReply: draft });
  const out = await core.runNewsroom({ env: { AI_GATEWAY_API_KEY: 'gw' }, fetchImpl: impl, now: MONDAY });
  assert.equal(out.results[0].status, 'skipped');
  assert.equal(calls.gateway.length, 0);
});

test('a bad draft fails that desk without submitting', async () => {
  const { impl, calls } = fakeFetch({ planReply: plan, writeReply: { kind: 'poem', title: 'x', body: 'y' } });
  const out = await core.runNewsroom({ env, fetchImpl: impl, now: MONDAY });
  assert.equal(out.results[0].status, 'failed');
  assert.match(out.results[0].error, /invalid kind/);
  assert.equal(calls.inbox.length, 0);
});

test('dry run reads sources and calls nothing paid', async () => {
  const { impl, calls } = fakeFetch();
  const out = await core.runNewsroom({ env: {}, fetchImpl: impl, now: MONDAY, dryRun: true });
  const r = out.results[0];
  assert.equal(r.status, 'dry-run');
  assert.equal(calls.gateway.length + calls.inbox.length, 0);
  assert.ok(r.writerChars > r.plannerChars && r.writerChars <= 400000, `writer ${r.writerChars}, planner ${r.plannerChars}`);
});

test('JSON wrapped in a code fence still parses', () => {
  const p = core.parseProposal('```json\n' + JSON.stringify(draft) + '\n```');
  assert.equal(p.title, 'A Federal Story');
});
