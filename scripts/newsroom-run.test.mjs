import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const core = require('../api/_newsroom-core.js');

const MONDAY = new Date('2026-11-16T16:07:00Z');
const TUESDAY = new Date('2026-11-17T16:07:00Z');

// Serve repository files from the working tree in place of raw.githubusercontent.com.
const SHA = 'a'.repeat(40);

function fakeFetch({ planReply, writeReply, inboxStatus = 201, keyOk = true, existing = [] } = {}) {
  const calls = { gateway: [], inbox: [], raw: [], refs: new Set() };
  const impl = async (url, init = {}) => {
    if (url.startsWith('https://api.github.com/')) return new Response(SHA, { status: 200 });
    if (url.startsWith(core.RAW_BASE)) {
      const rest = url.slice(core.RAW_BASE.length);
      const ref = rest.slice(0, rest.indexOf('/'));
      const path = rest.slice(ref.length + 1);
      calls.refs.add(ref);
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
    if (url.includes('/v1/list')) {
      calls.check = (calls.check || 0) + 1;
      calls.listHeaders = init.headers;
      return Response.json({ items: existing, more: false, cursor: null }, { status: keyOk ? 200 : 401 });
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

test('every roster desk, enabled or not, has its brief, notes, assignments and sources', () => {
  const roster = JSON.parse(fs.readFileSync(core.ROSTER_PATH, 'utf8'));
  const ids = new Set();
  for (const d of roster.desks) {
    assert.ok(!ids.has(d.id), `duplicate desk ${d.id}`); ids.add(d.id);
    for (const p of [d.briefPath, d.assignmentsPath, d.notesPath, ...d.sources]) assert.ok(fs.existsSync(p), `${d.id}: ${p}`);
    assert.ok(d.days.length > 0, d.id);
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
  const out = await core.runNewsroom({ env, fetchImpl: impl, now: MONDAY, only: 'federal' });
  assert.equal(out.results.length, 1);
  const r = out.results[0];
  assert.equal(r.status, 'submitted');
  assert.deepEqual(calls.gateway.map((g) => g.model), ['deepseek/deepseek-v4-pro-0813', 'deepseek/deepseek-v4-flash']);
  assert.ok(calls.gateway[1].messages[1].content.includes('"workingTitle": "T"'), 'writer receives the plan');
  assert.ok(!JSON.stringify(calls.gateway[0].messages).includes('## Source: docs/constitution-current.md'), 'planner skips the full constitution');
  assert.ok(calls.gateway[1].messages[0].content.includes('## Source: docs/constitution-current.md'), 'writer gets the constitution');
  assert.ok(calls.gateway[0].messages[0].content.startsWith('# Torenthia newsroom'), 'shared rules lead the prompt');
  assert.ok(calls.gateway[0].messages[1].content.startsWith('# Your desk: Federal'), 'desk material follows');
  assert.equal(calls.inbox.length, 1);
  assert.equal(calls.inbox[0].auth, 'Bearer fed-key');
  assert.match(calls.inbox[0].body.body, /Notes for the editor:\nNew name: Ilse Marr\./);
});

test('a rejected inbox key stops the desk before any model call', async () => {
  const { impl, calls } = fakeFetch({ planReply: plan, writeReply: draft, keyOk: false });
  const out = await core.runNewsroom({ env, fetchImpl: impl, now: MONDAY, only: 'federal' });
  assert.equal(out.results[0].status, 'failed');
  assert.match(out.results[0].error, /inbox key check failed \(401\)/);
  assert.equal(calls.gateway.length, 0);
});

test('vercel.json schedules the run once, as a GET, with no legacy cron', () => {
  const v = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  assert.equal(v.crons, undefined);
  assert.deepEqual(v.schedules['newsroom-daily'], { schedule: '7 16 * * *', path: '/api/newsroom-run', requestMethod: 'GET' });
});

test('every file in a run is read at one pinned commit, and the commit is recorded', async () => {
  const { impl, calls } = fakeFetch({ planReply: plan, writeReply: draft });
  const out = await core.runNewsroom({ env, fetchImpl: impl, now: MONDAY, only: 'federal' });
  assert.equal(out.commit, SHA);
  assert.deepEqual([...calls.refs], [SHA]);
  assert.equal(calls.inbox[0].body.sourceRefs[0], `commit:${SHA}`);
});

test('a desk that filed within the last six hours is skipped before any model call', async () => {
  const existing = [{ id: 'x1', submittedAt: '2026-11-16T15:58:00.000Z' }];
  const { impl, calls } = fakeFetch({ planReply: plan, writeReply: draft, existing });
  const out = await core.runNewsroom({ env, fetchImpl: impl, now: MONDAY, only: 'federal' });
  assert.equal(out.results[0].status, 'already-filed');
  assert.equal(calls.gateway.length, 0);
});

test('an earlier filing on the same UTC day, more than six hours ago, does not block a new run', async () => {
  const existing = [{ id: 'x2', submittedAt: '2026-11-16T06:23:21.206Z' }];
  const { impl, calls } = fakeFetch({ planReply: plan, writeReply: draft, existing });
  const out = await core.runNewsroom({ env, fetchImpl: impl, now: MONDAY, only: 'federal' });
  assert.equal(out.results[0].status, 'submitted');
  assert.equal(calls.inbox.length, 1);
});

test('a filing from an earlier day does not block today', async () => {
  const existing = [{ id: 'x0', submittedAt: '2026-11-13T16:20:00.000Z' }];
  const { impl, calls } = fakeFetch({ planReply: plan, writeReply: draft, existing });
  const out = await core.runNewsroom({ env, fetchImpl: impl, now: MONDAY, only: 'federal' });
  assert.equal(out.results[0].status, 'submitted');
  assert.equal(calls.inbox.length, 1);
});

test('the handler returns 500 when any desk fails and 200 otherwise', async () => {
  const handlerPath = new URL('../api/newsroom-run.js', import.meta.url).pathname;
  const src = fs.readFileSync(handlerPath, 'utf8');
  assert.match(src, /res\.status\(failed\.length \? 500 : 200\)/);
});

test('without a desk key, the runner key files for the desk and names it', async () => {
  const { impl, calls } = fakeFetch({ planReply: plan, writeReply: draft });
  const out = await core.runNewsroom({ env: { AI_GATEWAY_API_KEY: 'gw', NEWSROOM_RUNNER_KEY: 'run' }, fetchImpl: impl, now: MONDAY, only: 'federal' });
  assert.equal(out.results[0].status, 'submitted');
  assert.equal(calls.inbox[0].auth, 'Bearer run');
  assert.equal(calls.listHeaders['x-newsroom-desk'], 'federal');
});

test('a desk key, when configured, takes precedence over the runner key', async () => {
  const { impl, calls } = fakeFetch({ planReply: plan, writeReply: draft });
  await core.runNewsroom({ env: { ...env, NEWSROOM_RUNNER_KEY: 'run' }, fetchImpl: impl, now: MONDAY, only: 'federal' });
  assert.equal(calls.inbox[0].auth, 'Bearer fed-key');
  assert.equal(calls.listHeaders['x-newsroom-desk'], undefined);
});

test('a planner skip means no writer call and no submission', async () => {
  const { impl, calls } = fakeFetch({ planReply: { skip: true, reason: 'nothing new' } });
  const out = await core.runNewsroom({ env, fetchImpl: impl, now: MONDAY, only: 'federal' });
  assert.equal(out.results[0].status, 'no-submission');
  assert.equal(calls.gateway.length, 1);
  assert.equal(calls.inbox.length, 0);
});

test('missing inbox key skips the desk before any paid call', async () => {
  const { impl, calls } = fakeFetch({ planReply: plan, writeReply: draft });
  const out = await core.runNewsroom({ env: { AI_GATEWAY_API_KEY: 'gw' }, fetchImpl: impl, now: MONDAY, only: 'federal' });
  assert.equal(out.results[0].status, 'skipped');
  assert.equal(calls.gateway.length, 0);
});

test('a bad draft fails that desk without submitting', async () => {
  const { impl, calls } = fakeFetch({ planReply: plan, writeReply: { kind: 'poem', title: 'x', body: 'y' } });
  const out = await core.runNewsroom({ env, fetchImpl: impl, now: MONDAY, only: 'federal' });
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

test('every-few-weeks desks run only on their week', () => {
  const desk = { id: 'varek', enabled: true, days: ['mon'], everyWeeks: 3 };
  const mondays = [0, 1, 2, 3, 4, 5].map((i) => new Date(MONDAY.getTime() + i * 7 * 86400000));
  const runs = mondays.map((d) => core.dueDesks({ desks: [desk] }, d).length);
  assert.equal(runs.reduce((a, b) => a + b, 0), 2, `ran ${runs.join(',')}`);
  const shifted = mondays.map((d) => core.dueDesks({ desks: [{ ...desk, weekOffset: 1 }] }, d).length);
  assert.notDeepEqual(runs, shifted);
});

test('two desks share an identical, cacheable system prompt', () => {
  const common = { rules: 'R', sharedSources: [{ path: 'a.md', text: 'A' }], assignments: '', notes: '', now: MONDAY };
  const a = core.buildPlanMessages({ ...common, desk: { name: 'Federal desk' }, brief: 'F' });
  const b = core.buildPlanMessages({ ...common, desk: { name: 'Korda desk' }, brief: 'K' });
  assert.equal(a[0].content, b[0].content);
  assert.notEqual(a[1].content, b[1].content);
});

test('JSON wrapped in a code fence still parses', () => {
  const p = core.parseProposal('```json\n' + JSON.stringify(draft) + '\n```');
  assert.equal(p.title, 'A Federal Story');
});

test('an open assignment is detected only under ## Open', () => {
  assert.equal(core.hasOpenAssignment('# A\n\n## Open\n\n- Cover the ferry hearing.\n\n## Done\n'), true);
  assert.equal(core.hasOpenAssignment('# A\n\n## Open\n\n## Done\n\n- Old work.\n'), false);
  assert.equal(core.hasOpenAssignment('# A\n\n## Open\n- Last section item.\n'), true);
  assert.equal(core.hasOpenAssignment(''), false);
});

test('off-week desks are those on their weekday outside their cadence', () => {
  const roster = { desks: [
    { id: 'a', enabled: true, days: ['mon'], everyWeeks: 2, weekOffset: 0 },
    { id: 'b', enabled: true, days: ['mon'], everyWeeks: 2, weekOffset: 1 },
    { id: 'c', enabled: true, days: ['mon'] },
    { id: 'd', enabled: false, days: ['mon'], everyWeeks: 2, weekOffset: 1 },
  ] };
  const due = core.dueDesks(roster, MONDAY).map((d) => d.id);
  const off = core.offWeekDesks(roster, MONDAY).map((d) => d.id);
  assert.ok(due.includes('c'));
  assert.equal(due.length + off.length, 3, 'every enabled Monday desk is either due or off-week');
  assert.ok(!off.includes('c') && !off.includes('d'));
  assert.deepEqual(core.offWeekDesks(roster, TUESDAY), []);
});

test('a desk with a records block also gets a records desk on its own schedule and inbox', () => {
  const roster = { recordsBriefPath: 'docs/torenthia/agents/RECORDS-BRIEF.md', desks: [
    { id: 'varek', name: 'Varek State desk', jurisdiction: 'Varek', inboxDesk: 'varek', enabled: true, days: ['fri'], everyWeeks: 2,
      briefPath: 'docs/torenthia/agents/varek/BRIEF.md', sources: ['State Constitutions/varek-state-constitution.md'], records: { days: ['mon'] } },
    { id: 'federal', name: 'Federal Realm desk', enabled: true, days: ['mon'] },
  ] };
  const all = core.withRecordDesks(roster).desks;
  const r = all.find((d) => d.id === 'varek-records');
  assert.ok(r);
  assert.equal(r.inboxDesk, 'varek-records');
  assert.equal(r.briefPath, 'docs/torenthia/agents/RECORDS-BRIEF.md');
  assert.deepEqual(r.days, ['mon']);
  assert.equal(r.everyWeeks, 1);
  assert.equal(r.notesPath, 'docs/torenthia/agents/varek/RECORDS-NOTES.md');
  assert.deepEqual(r.sources.slice(0, 2), ['docs/torenthia/agents/varek/BRIEF.md', 'docs/torenthia/agents/varek/RECORDS-REGISTER.md']);
  assert.ok(/^[a-z][a-z-]{1,29}$/.test(r.inboxDesk), 'inbox name passes the Worker desk pattern');
  assert.deepEqual(core.dueDesks({ desks: all }, MONDAY).map((d) => d.id).sort(), ['federal', 'varek-records']);
});

test('every records desk on main has a valid inbox name and the shared records brief', () => {
  const roster = core.withRecordDesks(JSON.parse(fs.readFileSync(core.ROSTER_PATH, 'utf8')));
  assert.ok(fs.existsSync(roster.recordsBriefPath));
  for (const d of roster.desks.filter((x) => x.id.endsWith('-records') && x.briefPath === roster.recordsBriefPath)) {
    assert.ok(/^[a-z][a-z-]{1,29}$/.test(d.inboxDesk), d.inboxDesk);
  }
});

test('a desk with an until date stops after that UTC day, including a manual run', () => {
  const roster = { desks: [{ id: 'election-tracker', enabled: true, days: ['mon'], until: '2026-12-01' }, { id: 'federal', enabled: true, days: ['mon'] }] };
  const ids = (d, only) => core.dueDesks(roster, d, only).map((x) => x.id);
  assert.deepEqual(ids(new Date('2026-11-30T16:07:00Z')), ['election-tracker', 'federal']);
  assert.deepEqual(ids(new Date('2026-12-07T16:07:00Z')), ['federal']);
  assert.deepEqual(ids(new Date('2026-12-07T16:07:00Z'), 'election-tracker'), []);
  assert.deepEqual(core.offWeekDesks({ desks: [{ id: 't', enabled: true, days: ['mon'], everyWeeks: 2, until: '2026-11-01' }] }, new Date('2026-11-16T16:07:00Z')).map((x) => x.id), []);
});


test('each run files one report with every desk outcome and skip reason', async () => {
  const sent = [];
  const impl = async (url, init = {}) => { sent.push({ url: String(url), headers: init.headers, body: JSON.parse(init.body) }); return Response.json({ id: 'r1', key: 'submissions/newsroom-run/x.json' }); };
  const result = { paused: false, commit: SHA, results: [
    { desk: 'corindal', status: 'no-submission', reason: 'Nothing new since the last audit round.', usage: { planner: { completion_tokens: 300 } } },
    { desk: 'caldenmere', status: 'submitted', title: 'The Crane Operator', usage: { planner: { completion_tokens: 400 }, writer: { completion_tokens: 2500 } } },
    { desk: 'varek-records', status: 'failed', error: 'planner reply was not JSON' },
  ] };
  const out = await core.fileRunReport(impl, { env: { NEWSROOM_RUNNER_KEY: 'run' }, result, now: new Date('2026-11-19T16:07:00Z') });
  assert.equal(out.id, 'r1');
  assert.equal(sent[0].headers['x-newsroom-desk'], 'newsroom-run');
  assert.match(sent[0].body.body, /3 desks due \(1 no-submission, 1 submitted, 1 failed\)/);
  assert.match(sent[0].body.body, /\*\*corindal\*\*: no-submission — Nothing new since the last audit round\./);
  assert.match(sent[0].body.body, /\*\*varek-records\*\*: failed — planner reply was not JSON/);
  assert.equal(await core.fileRunReport(impl, { env: { NEWSROOM_RUNNER_KEY: 'run' }, result: { paused: true, results: [] } }), null);
  assert.equal(await core.fileRunReport(impl, { env: {}, result }), null);
});

test('a desk with an open assignment may skip only for a named blocker; others may rest', () => {
  const desk = { id: 'corindal', name: 'Corindal State desk' };
  const base = { rules: 'Rules.', brief: 'Brief.', desk, notes: '', now: new Date('2026-11-26T16:07:00Z'), sharedSources: [], deskSources: [] };
  const tasked = core.buildPlanMessages({ ...base, assignments: '## Open\n\n- **Joint audit history.** Work the round.\n\n## Done\n' })[1].content;
  assert.match(tasked, /You have an open assignment, so do the work/);
  assert.doesNotMatch(tasked, /Quiet weeks are acceptable/);
  const free = core.buildPlanMessages({ ...base, assignments: '## Open\n\n## Done\n' })[1].content;
  assert.match(free, /Quiet weeks are acceptable/);
  const writer = core.buildMessages({ ...base, plan: null, assignments: '## Open\n- **Work.**\n' })[1].content;
  assert.match(writer, /name the source, rule or missing fact that blocks it/);
});

test('a desk may ask for a longer writer timeout, within what the run can afford', () => {
  assert.equal(core.writerTimeoutMs({}, false), 105000, 'default is unchanged');
  assert.equal(core.writerTimeoutMs({ timeoutMs: 'soon' }, false), 105000, 'junk falls back to the default');
  assert.equal(core.writerTimeoutMs({ timeoutMs: 200000 }, false), 200000);
  assert.equal(core.writerTimeoutMs({ timeoutMs: 9999999 }, false), 270000, 'no planner: capped under the 300 s function limit');
  assert.equal(core.writerTimeoutMs({ timeoutMs: 9999999 }, true), 110000, 'a planner takes 175 s of the run first');
  assert.equal(core.writerTimeoutMs({ timeoutMs: 1000 }, false), 30000, 'floor');
});

test('the writer call uses the desk timeout, and a slow model fails the desk with that time named', async () => {
  const roster = JSON.parse(fs.readFileSync(core.ROSTER_PATH, 'utf8'));
  const tracker = roster.desks.find((d) => d.id === 'election-tracker');
  assert.equal(tracker.planner, null);
  assert.ok(tracker.timeoutMs > 105000 && tracker.timeoutMs <= 270000, 'the Election Tracker gets longer than the default');
  const seen = [];
  const realSetTimeout = globalThis.setTimeout;
  globalThis.setTimeout = (fn, ms, ...a) => { seen.push(ms); return realSetTimeout(fn, 1, ...a); };
  try {
    const slow = async (url, init) => {
      if (String(url).includes('ai-gateway')) return new Promise((_, rej) => init.signal.addEventListener('abort', () => rej(Object.assign(new Error('aborted'), { name: 'AbortError' }))));
      throw new Error('unexpected ' + url);
    };
    await assert.rejects(core.callModel(slow, { token: 't', model: 'm', messages: [], maxTokens: 10, deskId: 'x', timeoutMs: core.writerTimeoutMs(tracker, false) }), new RegExp(`did not finish within ${Math.round(tracker.timeoutMs / 1000)}s`));
  } finally { globalThis.setTimeout = realSetTimeout; }
  assert.ok(seen.includes(tracker.timeoutMs));
});
