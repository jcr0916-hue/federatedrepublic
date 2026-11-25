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
  assert.ok(prompt.includes('Ferry reply') && prompt.includes('Full text:') && !prompt.includes('Old') && !prompt.includes('TEST ONLY'));
  assert.ok(calls.gateway[0].messages[0].content.includes('## Source: docs/torenthia/STORY-STATUS.md'));
  const filed = calls.submit[0];
  assert.equal(filed.headers['x-newsroom-desk'], 'desk-editor');
  assert.match(filed.body.body, /## editor\n- #1 \*\*korda\*\*: Ferry reply/);
  assert.match(filed.body.body, /## records\n- \*\*varek-records\*\*: Culvert return — Routine\. ⚑ desk editor did not sort this filing; routed by the track its desk declared/, 'a record the model skipped follows its declared track and is not lost');
  assert.match(filed.body.body, /Note: the desk editor sorted 1 of 2 filings/, 'the report says how many the model sorted');
  assert.equal(calls.gateway.length, 2, 'a reply that leaves a filing out is retried once');
});

test('nothing new means no model call', async () => {
  const { impl, calls } = inbox([]);
  const out = await tri.runTriage({ env: { NEWSROOM_EDITOR_KEY: 'ed', NEWSROOM_RUNNER_KEY: 'run', AI_GATEWAY_API_KEY: 'gw' }, fetchImpl: impl, now: NOW });
  assert.equal(out.status, 'nothing-new');
  assert.equal(calls.gateway.length, 0);
});

test('tracker reports skip the model and lead the triage', async () => {
  // The mock model sorts items[0], so the story comes first in the list.
  const items = [
    { key: 'submissions/korda/a.json', desk: 'korda', kind: 'article', title: 'Ferry reply', summary: '[canon · high] A written reply.', submittedAt: '2026-11-23T16:10:00Z', status: 'PROPOSED' },
    { key: 'submissions/election-tracker/r.json', desk: 'election-tracker', kind: 'report', title: 'Election tracker update, Year 14 Month 2', summary: '[record · normal] Candidates unnamed in ten stories.', submittedAt: '2026-11-23T16:09:00Z', status: 'PROPOSED' },
  ];
  const { impl, calls } = inbox(items);
  const out = await tri.runTriage({ env: { NEWSROOM_EDITOR_KEY: 'ed', NEWSROOM_RUNNER_KEY: 'run', AI_GATEWAY_API_KEY: 'gw' }, fetchImpl: impl, now: new Date('2026-11-23T16:37:00Z') });
  assert.equal(out.status, 'submitted');
  assert.equal(out.filings, 2);
  assert.ok(!calls.gateway[0].messages[1].content.includes('Election tracker update'), 'the model never sees tracker reports');
  const body = calls.submit[0].body.body;
  assert.match(body, /## tracker\n- \*\*election-tracker\*\*: Election tracker update, Year 14 Month 2/);
  assert.ok(body.indexOf('## tracker') < body.indexOf('## editor'), 'tracker reports come first');
});

test('a day with only tracker reports files a triage without calling the model', async () => {
  const items = [{ key: 'submissions/election-tracker/r.json', desk: 'election-tracker', kind: 'report', title: 'Election tracker update', summary: '[record · normal] x', submittedAt: '2026-11-23T16:09:00Z', status: 'PROPOSED' }];
  const { impl, calls } = inbox(items);
  const out = await tri.runTriage({ env: { NEWSROOM_EDITOR_KEY: 'ed', NEWSROOM_RUNNER_KEY: 'run', AI_GATEWAY_API_KEY: 'gw' }, fetchImpl: impl, now: new Date('2026-11-23T16:37:00Z') });
  assert.equal(out.status, 'submitted');
  assert.equal(calls.gateway.length, 0);
  assert.match(calls.submit[0].body.body, /## tracker/);
});

test('the roster names the thread trackers as pass-through desks', () => {
  const roster = JSON.parse(fs.readFileSync(core.ROSTER_PATH, 'utf8'));
  assert.ok(roster.triage.passThroughDesks.includes('election-tracker'));
  assert.ok(roster.triage.passThroughDesks.includes('fiscal-tracker'));
  assert.ok(roster.triage.passThroughDesks.includes('story-clock'));
  const clock = roster.desks.find((d) => d.id === 'story-clock');
  assert.ok(clock && clock.enabled && clock.planner === null && /^\d{4}-\d{2}-\d{2}$/.test(clock.until));
  const fiscal = roster.desks.find((d) => d.id === 'fiscal-tracker');
  assert.ok(fiscal && fiscal.enabled && fiscal.planner === null && /^\d{4}-\d{2}-\d{2}$/.test(fiscal.until));
  const desk = roster.desks.find((d) => d.id === 'election-tracker');
  assert.ok(desk && desk.enabled && desk.planner === null && /^\d{4}-\d{2}-\d{2}$/.test(desk.until));
});

test('a filing is sorted once: the next run starts where the last report stopped', async () => {
  const items = [
    { key: 'submissions/desk-editor/prev.json', desk: 'desk-editor', kind: 'report', title: 'Desk editor triage — 2026-11-21', summary: '[triage] 7 filings sorted for the Central Editor. [through 2026-11-21T16:37:00.000Z]', submittedAt: '2026-11-21T16:51:00Z', status: 'PROPOSED' },
    { key: 'submissions/caldenmere-records/before.json', desk: 'caldenmere-records', kind: 'nrs-proposal', title: 'Already sorted', summary: '[record · low] Routine.', submittedAt: '2026-11-21T16:20:00Z', status: 'PROPOSED' },
    { key: 'submissions/korda/new.json', desk: 'korda', kind: 'article', title: 'Fresh piece', summary: '[canon · high] New.', submittedAt: '2026-11-22T16:09:00Z', status: 'PROPOSED' },
  ];
  assert.equal(tri.windowStart(items, new Date('2026-11-22T16:37:00Z')), Date.parse('2026-11-21T16:37:00.000Z'));
  const { impl, calls } = inbox(items);
  const out = await tri.runTriage({ env: { NEWSROOM_EDITOR_KEY: 'ed', NEWSROOM_RUNNER_KEY: 'run', AI_GATEWAY_API_KEY: 'gw' }, fetchImpl: impl, now: new Date('2026-11-22T16:37:00Z') });
  assert.equal(out.filings, 1);
  const prompt = calls.gateway[0].messages[1].content;
  assert.ok(prompt.includes('Fresh piece') && !prompt.includes('Already sorted'));
  assert.match(calls.submit[0].body.summary, /\[through 2026-11-22T16:37:00\.000Z\]$/, 'the report records when it listed the inbox');
});

test('an older report without the tag still bounds the window, with slack; a long gap is capped at a week', () => {
  const now = new Date('2026-11-22T16:37:00Z');
  const old = [{ desk: 'desk-editor', summary: '[triage] 7 filings sorted.', submittedAt: '2026-11-22T16:51:00Z' }];
  assert.equal(tri.windowStart(old, now), Date.parse('2026-11-22T16:31:00Z'));
  assert.equal(tri.windowStart([], now), now.getTime() - 26 * 3600 * 1000);
  const stale = [{ desk: 'desk-editor', summary: '[triage] x [through 2026-10-01T00:00:00.000Z]', submittedAt: '2026-10-01T00:10:00Z' }];
  assert.equal(tri.windowStart(stale, now), now.getTime() - 7 * 24 * 3600 * 1000);
});

test('ideas written as finished articles are flagged in code, and canon is read whole', async () => {
  const long = 'word '.repeat(900);
  const items = [
    { key: 'submissions/norvane/a.json', desk: 'norvane', kind: 'article', title: 'Equalization Ledger', summary: '[idea · normal] Pitch.', submittedAt: '2026-11-19T16:09:00Z', status: 'PROPOSED' },
    { key: 'submissions/selvane/b.json', desk: 'selvane', kind: 'pitch', title: 'Short pitch', summary: '[idea · normal] Pitch.', submittedAt: '2026-11-19T16:10:00Z', status: 'PROPOSED' },
    { key: 'submissions/korda/c.json', desk: 'korda', kind: 'article', title: 'Long canon', summary: '[canon · high] Story.', submittedAt: '2026-11-19T16:11:00Z', status: 'PROPOSED' },
  ];
  const { impl, calls } = inbox(items, { 'submissions/norvane/a.json': long, 'submissions/selvane/b.json': 'A short pitch of about nine words only.', 'submissions/korda/c.json': 'canon-start ' + 'x'.repeat(9000) + ' canon-end' });
  await tri.runTriage({ env: { NEWSROOM_EDITOR_KEY: 'ed', NEWSROOM_RUNNER_KEY: 'run', AI_GATEWAY_API_KEY: 'gw' }, fetchImpl: impl, now: NOW });
  const body = calls.submit[0].body.body;
  assert.match(body, /Equalization Ledger[^\n]*⚑ Filed as a finished article \(900 words\)/);
  assert.ok(!/Short pitch[^\n]*Filed as a finished article/.test(body));
  assert.ok(calls.gateway[0].messages[1].content.includes('canon-end'), 'canon text beyond the old 2,500-character excerpt reaches the desk editor');
});

test('assigned working reports from the Monitors and Corindal desks go straight to the editor', async () => {
  const items = [
    { key: 'submissions/monitors/m.json', desk: 'monitors', kind: 'report', title: 'Corindal audit record, Round 1', summary: '[idea · normal] Round 1 account.', submittedAt: '2026-11-22T16:10:00Z', status: 'PROPOSED' },
    { key: 'submissions/monitors/n.json', desk: 'monitors', kind: 'article', title: 'A Monitors column', summary: '[canon · normal] Story.', submittedAt: '2026-11-22T16:11:00Z', status: 'PROPOSED' },
  ];
  const { impl, calls } = inbox(items);
  const out = await tri.runTriage({ env: { NEWSROOM_EDITOR_KEY: 'ed', NEWSROOM_RUNNER_KEY: 'run', AI_GATEWAY_API_KEY: 'gw' }, fetchImpl: impl, now: new Date('2026-11-22T16:37:00Z') });
  assert.equal(out.filings, 2);
  assert.ok(!calls.gateway[0].messages[1].content.includes('Round 1 account'), 'the report never reaches the model');
  assert.ok(calls.gateway[0].messages[1].content.includes('A Monitors column'), 'other Monitors filings are still sorted');
  assert.match(calls.submit[0].body.body, /## tracker\n- \*\*monitors\*\*: Corindal audit record, Round 1/);
});


// A model whose per-filing list is shaped differently from what the code expects must not leave the day unsorted.
function replying(replies, items) {
  const base = inbox(items);
  const calls = { ...base.calls, gateway: [] };
  let n = 0;
  const impl = async (url, init = {}) => {
    if (String(url).includes('ai-gateway')) {
      calls.gateway.push(JSON.parse(init.body));
      const reply = replies[Math.min(n++, replies.length - 1)];
      return { ok: true, status: 200, json: async () => ({ choices: [{ message: { content: typeof reply === 'string' ? reply : JSON.stringify(reply) } }], usage: {} }) };
    }
    return base.impl(url, init);
  };
  return { impl, calls: { ...calls, submit: base.calls.submit } };
}
const ENV = { NEWSROOM_EDITOR_KEY: 'ed', NEWSROOM_RUNNER_KEY: 'run', AI_GATEWAY_API_KEY: 'gw' };
const DAY = [
  { key: 'submissions/korda/2026-11-24/3e7fd659-580e-4796-a87a-eda31b36c3b1.json', desk: 'korda', kind: 'article', title: 'The Written Criteria', summary: '[canon · high] A written reply.', submittedAt: '2026-11-24T16:10:00Z', status: 'PROPOSED' },
  { key: 'submissions/selvane-records/2026-11-24/5b6b0a51-0281-4e5e-9499-b3e2d152f9ad.json', desk: 'selvane-records', kind: 'nrs-proposal', title: 'Selvane batch', summary: '[record · low] Routine.', submittedAt: '2026-11-24T16:11:00Z', status: 'PROPOSED' },
  { key: 'submissions/kelvant/2026-11-24/b3fe57fc-d895-44f1-a9fd-77fcbf42b76d.json', desk: 'kelvant', kind: 'pitch', title: 'Who Speaks for Kelvant', summary: '[idea · normal] Pitch.', submittedAt: '2026-11-24T16:12:00Z', status: 'PROPOSED' },
];
const NOW2 = new Date('2026-11-24T16:37:00Z');
const row = (it, route, extra = {}) => ({ key: it.key, desk: it.desk, title: it.title, track: 'x', route, rank: null, flags: [], line: 'Because.', ...extra });

test('keys shortened to the filing id, a list under another name, and route spelling all still match', async () => {
  const reply = { summary: 'Fine day.', filings: [
    { ...row(DAY[0], 'Editor', { rank: 1 }), key: '3e7fd659-580e-4796-a87a-eda31b36c3b1' },
    { ...row(DAY[1], 'records'), key: '`5b6b0a51`' },
    { ...row(DAY[2], 'idea board'), key: 'b3fe57fc-d895-44f1-a9fd-77fcbf42b76d.json' },
  ] };
  const { impl, calls } = replying([reply], DAY);
  const out = await tri.runTriage({ env: ENV, fetchImpl: impl, now: NOW2 });
  assert.equal(out.status, 'submitted');
  assert.equal(calls.gateway.length, 1, 'no retry when everything matched');
  const body = calls.submit[0].body.body;
  assert.match(body, /## editor\n- #1 \*\*korda\*\*: The Written Criteria/);
  assert.match(body, /## idea-board\n- \*\*kelvant\*\*/);
  assert.match(body, /## records\n- \*\*selvane-records\*\*/);
  assert.ok(!/## unsorted|Note: the desk editor sorted/.test(body));
});

test('a title match rescues a key the model garbled; a duplicate title is not guessed', () => {
  const items = [DAY[0], { ...DAY[2], title: 'The Written Criteria' }];
  const { rows, missing } = tri.matchRows({ items: [{ key: 'nonsense', title: 'the written criteria', route: 'editor' }] }, [DAY[0], DAY[1]]);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].key, DAY[0].key);
  assert.deepEqual(missing.map((m) => m.desk), ['selvane-records']);
  assert.equal(tri.matchRows({ items: [{ key: 'nonsense', title: 'The Written Criteria', route: 'editor' }] }, items).rows.length, 0);
});

test('an empty list is retried once; the second reply is used', async () => {
  const good = { summary: 'Sorted.', items: [row(DAY[0], 'editor', { rank: 1 }), row(DAY[1], 'records'), row(DAY[2], 'idea-board')] };
  const { impl, calls } = replying([{ summary: 'Prose only.', items: [] }, good], DAY);
  const out = await tri.runTriage({ env: ENV, fetchImpl: impl, now: NOW2 });
  assert.equal(out.status, 'submitted');
  assert.equal(calls.gateway.length, 2);
  const retry = calls.gateway[1].messages;
  assert.equal(retry[retry.length - 1].role, 'user');
  assert.match(retry[retry.length - 1].content, /did not sort 3 of the 3 filings/);
  const body = calls.submit[0].body.body;
  assert.match(body, /## editor\n- #1 \*\*korda\*\*/);
  assert.ok(!/## unsorted/.test(body));
});

test('if both replies fail, records and ideas follow their declared track and only canon stays unsorted, with the stray keys named', async () => {
  const bad = { summary: 'Prose only.', items: [{ key: 'who-knows', route: 'editor' }] };
  const { impl, calls } = replying([bad, bad], DAY);
  const out = await tri.runTriage({ env: ENV, fetchImpl: impl, now: NOW2 });
  assert.equal(out.status, 'submitted');
  assert.equal(calls.gateway.length, 2, 'one retry, no more');
  const body = calls.submit[0].body.body;
  assert.match(body, /## idea-board\n- \*\*kelvant\*\*: Who Speaks for Kelvant — Pitch\./);
  assert.match(body, /## records\n- \*\*selvane-records\*\*: Selvane batch — Routine\./);
  assert.match(body, /## unsorted\n- \*\*korda\*\*: The Written Criteria — A written reply\. ⚑ desk editor did not rank this canon filing/);
  assert.match(body, /Note: the desk editor sorted 0 of 3 filings.*Keys it returned that matched no filing: who-knows\./);
});

test('a reply that is not JSON gets one retry, and a retry that throws keeps the first reply', async () => {
  const items = DAY;
  const base = replying(['not json at all'], items);
  let first = true;
  const impl = async (url, init) => { if (String(url).includes('ai-gateway') && !first) throw new Error('gateway down'); if (String(url).includes('ai-gateway')) first = false; return base.impl(url, init); };
  const out = await tri.runTriage({ env: ENV, fetchImpl: impl, now: NOW2 });
  assert.equal(out.status, 'submitted');
  const body = base.calls.submit[0].body.body;
  assert.match(body, /not JSON; filings follow the track their desk declared/);
  assert.match(body, /## records\n- \*\*selvane-records\*\*/);
});
