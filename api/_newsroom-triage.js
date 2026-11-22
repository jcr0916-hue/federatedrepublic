// The desk editor: a small, fast model that reads the day's new filings and ranks them.
// It needs no canon: each desk has already declared its track and the attention its work
// needs ("[canon · high · timely · touches: …]" at the start of the summary). The desk
// editor knows what is going on now (the story status) and spends the Central Editor's
// few daily slots. It decides nothing and discards nothing.

const core = require('./_newsroom-core.js');

const WINDOW_MS = 26 * 3600 * 1000; // first-run fallback only
const MAX_LOOKBACK_MS = 7 * 24 * 3600 * 1000; // after missed days, never reach further back than a week
const REPORT_SLACK_MS = 20 * 60 * 1000; // for an older report with no "[through …]" tag: assume it listed up to 20 minutes before it was filed
const CANON_BODY_CHARS = 14000; // the desk editor reads whole canon filings, not an excerpt
const PITCH_WORDS = 700; // an idea longer than this is an article in disguise
const TRIAGE_DESK = 'desk-editor';
const NOT_FILINGS = new Set([TRIAGE_DESK, 'newsroom-run']); // reports about the newsroom itself, never sorted as filings

function isTest(item) {
  return /\bTEST\b|\[TEST ONLY\]|DO NOT PUBLISH/i.test(`${item.title || ''} ${item.summary || ''}`);
}

function trackOf(item) {
  const m = String(item.summary || '').match(/^\[(canon|idea|record)\b/);
  if (m) return m[1];
  return item.kind === 'nrs-proposal' ? 'record' : ['pitch', 'character', 'other', 'design'].includes(item.kind) ? 'idea' : 'canon';
}

// Every inbox item the desk editor might care about, across all pages.
async function listInbox(fetchImpl, { inboxUrl, editorKey }) {
  const items = [];
  let cursor = '';
  for (let page = 0; page < 20; page++) {
    const url = inboxUrl.replace(/\/$/, '') + '/v1/list?limit=100' + (cursor ? `&cursor=${encodeURIComponent(cursor)}` : '');
    const res = await fetchImpl(url, { headers: { Authorization: `Bearer ${editorKey}` } });
    if (!res.ok) throw new Error(`inbox list failed (${res.status})`);
    const data = await res.json().catch(() => ({}));
    for (const it of data.items || []) items.push(it);
    if (!data.more || !data.cursor) break;
    cursor = data.cursor;
  }
  return items;
}

// Each triage report ends its summary with "[through <ISO time>]": the moment it listed the inbox.
// The next run starts there, so a filing is sorted once. (A fixed 26-hour window re-sorted anything
// filed in the last two hours before the previous run, and anything the Central Editor had not yet
// moved out of PROPOSED.)
function windowStart(all, now) {
  const floor = now.getTime() - MAX_LOOKBACK_MS;
  let best = null;
  for (const it of all) {
    if (it.desk !== TRIAGE_DESK) continue;
    const tag = String(it.summary || '').match(/\[through (\d{4}-\d{2}-\d{2}T[^\]]+)\]/);
    const at = tag ? Date.parse(tag[1]) : Date.parse(it.submittedAt) - REPORT_SLACK_MS;
    if (Number.isFinite(at) && (best === null || at > best)) best = at;
  }
  const since = best === null ? now.getTime() - WINDOW_MS : best;
  return Math.max(since, floor);
}

function newFilings(all, since) {
  return all.filter((it) => it.status === 'PROPOSED' && !NOT_FILINGS.has(it.desk) && !isTest(it) && Date.parse(it.submittedAt) >= since);
}

function wordCount(text) {
  return String(text || '').split(/\s+/).filter(Boolean).length;
}

async function readItem(fetchImpl, { inboxUrl, editorKey, key }) {
  const res = await fetchImpl(inboxUrl.replace(/\/$/, '') + '/v1/read?key=' + encodeURIComponent(key), { headers: { Authorization: `Bearer ${editorKey}` } });
  if (!res.ok) return null;
  return res.json().catch(() => null);
}

function buildTriageMessages({ status, items, slots, now }) {
  const system = [
    '# Torenthia newsroom: desk editor',
    'You are the desk editor of a newsroom covering the Federated Republic of Torenthia, a fictional constitutional democracy. Desks for each jurisdiction file work every day. You sort it; you never rewrite it and you never decide what becomes canon.',
    '',
    'Each filing declares its track and attention in a tag at the start of its summary, for example "[canon · high · timely · touches: federal authority]".',
    '- canon: meant for publication. These compete for the Central Editor\'s ' + slots + ' daily slots.',
    '- idea: pitches, storylines, characters, reactions. They go to John\'s weekly idea board.',
    '- record: routine records that run in the background.',
    '',
    'Your job:',
    `1. Rank every canon filing. Send the best ${slots} to the editor ("editor"); route the rest to "bank" (good, can wait) or "return" (not ready: say why in one line). Desks tend to rate their own work high, so judge importance yourself against what is going on now: does it move a live storyline, react to something recent, or bring a new viewpoint? A recap of something already published, with no development, is "return".`,
    '2. Check that each filing\'s declared track fits it: an "idea" that states new facts as settled, or a "canon" piece with no notes ledger, gets a flag. (Length and article form of ideas is checked in code; you need not.) You read each canon filing in full: flag what the text actually says, such as an invented office, a new outlet or a person not in the story status, never that the text was cut short.',
    '3. Route each idea to "idea-board" with one plain line on what it proposes.',
    '4. Route records to "records". Flag only what looks wrong at a glance: the wrong level of government filing, anything that decides a vote, finding, certification or appointment, or an invented date.',
    '5. Flag anything that touches reserved continuity (the Rehn and Corindal matters, any national figure\'s future) or an open constitutional clock, whatever its rank.',
    'You have the story status below for what is going on now. You do not have the full canon and do not need it: do not fact-check details beyond what the story status shows.',
    '',
    'Return only a JSON object: {"summary": "<two or three sentences on the day>", "items": [{"key": "<inbox key>", "desk": "...", "title": "...", "track": "canon|idea|record", "route": "editor|bank|return|idea-board|records", "rank": <1-based rank among canon filings, or null>, "flags": ["..."], "line": "<one line: what it is and why this route>"}]}. Include every filing exactly once.',
    '',
    '## Source: docs/torenthia/STORY-STATUS.md',
    status,
  ].join('\n');
  const user = [`Today (real-world UTC date): ${now.toISOString().slice(0, 10)}.`, '', `## Filings (${items.length})`];
  for (const it of items) {
    user.push('', `### ${it.key}`, `Desk: ${it.desk} · Kind: ${it.kind} · Track: ${trackOf(it)}`, `Title: ${it.title}`, `Summary: ${it.summary || ''}`);
    if (it.excerpt) user.push('Full text:', it.excerpt);
  }
  return [{ role: 'system', content: system }, { role: 'user', content: user.join('\n') }];
}

// Filings from "pass-through" desks (the election tracker and any later thread trackers) are
// reports for the Central Editor to read, not competing stories. They skip the model and
// appear first in the triage as route "tracker".
function renderTriage(result, items, now, direct = [], since = null) {
  const byKey = new Map(items.map((i) => [i.key, i]));
  const rows = (Array.isArray(result.items) ? result.items : []).filter((r) => byKey.has(r.key));
  for (const r of rows) {
    const it = byKey.get(r.key);
    if (it && it.formFlag) r.flags = [it.formFlag, ...(Array.isArray(r.flags) ? r.flags : [])];
  }
  const seen = new Set(rows.map((r) => r.key));
  for (const it of items) if (!seen.has(it.key)) rows.push({ key: it.key, desk: it.desk, title: it.title, track: trackOf(it), route: 'unsorted', flags: [...(it.formFlag ? [it.formFlag] : []), 'desk editor did not sort this filing'], line: '' });
  for (const it of direct) rows.push({ key: it.key, desk: it.desk, title: it.title, track: trackOf(it), route: 'tracker', flags: [], line: String(it.summary || '').slice(0, 200) });
  const order = { tracker: -1, editor: 0, bank: 1, return: 2, 'idea-board': 3, records: 4, unsorted: 5 };
  rows.sort((a, b) => (order[a.route] ?? 9) - (order[b.route] ?? 9) || (a.rank ?? 99) - (b.rank ?? 99));
  const out = [`Desk editor triage for ${now.toISOString().slice(0, 10)}: ${items.length + direct.length} new filings${since ? ` since ${new Date(since).toISOString().slice(0, 16)}Z` : ''}.`, '', String(result.summary || '').trim(), ''];
  for (const route of ['tracker', 'editor', 'bank', 'return', 'idea-board', 'records', 'unsorted']) {
    const group = rows.filter((r) => r.route === route);
    if (!group.length) continue;
    out.push(`## ${route}`);
    for (const r of group) {
      const flags = (r.flags || []).filter(Boolean);
      out.push(`- ${r.rank ? `#${r.rank} ` : ''}**${r.desk}**: ${r.title} — ${r.line || ''}${flags.length ? ` ⚑ ${flags.join('; ')}` : ''}  \n  \`${r.key}\``);
    }
    out.push('');
  }
  out.push('```json', JSON.stringify(rows), '```');
  return out.join('\n');
}

async function runTriage({ env = process.env, fetchImpl = fetch, now = new Date(), dryRun = false } = {}) {
  const editorKey = env.NEWSROOM_EDITOR_KEY;
  const runnerKey = env.NEWSROOM_RUNNER_KEY;
  const token = env.AI_GATEWAY_API_KEY || env.VERCEL_OIDC_TOKEN;
  const inboxUrl = env.NEWSROOM_URL || core.DEFAULT_INBOX;
  if (!editorKey) return { status: 'skipped', reason: 'no editor key' };
  if (!dryRun && (!runnerKey || !token)) return { status: 'skipped', reason: 'no runner key or AI Gateway credential' };

  const ref = await core.resolveCommit(fetchImpl);
  const roster = JSON.parse(await core.loadText(fetchImpl, core.ROSTER_PATH, undefined, ref));
  const cfg = roster.triage || {};
  const inbox = await listInbox(fetchImpl, { inboxUrl, editorKey });
  const since = windowStart(inbox, now);
  const all = newFilings(inbox, since);
  const pass = Array.isArray(cfg.passThroughDesks) ? cfg.passThroughDesks : [];
  // Assigned working reports (the joint Corindal audit reconstruction) are for the Central Editor to read
  // directly; the desk editor once sent one to the idea board. Only filings of kind "report" go direct.
  const passReports = Array.isArray(cfg.passThroughReports) ? cfg.passThroughReports : [];
  const goesDirect = (it) => pass.includes(it.desk) || (it.kind === 'report' && passReports.includes(it.desk));
  const direct = all.filter(goesDirect);
  const items = all.filter((it) => !goesDirect(it));
  if (!items.length && !direct.length) return { status: 'nothing-new', commit: ref };

  // Canon filings are read whole, so the desk editor judges the piece and not a stub. Ideas are read
  // only to measure them: a "pitch" that runs as long as an article is flagged by code, not by the model.
  for (const it of items) {
    const track = trackOf(it);
    if (track !== 'canon' && track !== 'idea') continue;
    const full = await readItem(fetchImpl, { inboxUrl, editorKey, key: it.key });
    if (!full || !full.body) continue;
    it.words = wordCount(full.body);
    if (track === 'canon') it.excerpt = String(full.body).slice(0, CANON_BODY_CHARS);
    if (track === 'idea' && (it.kind === 'article' || it.words > PITCH_WORDS)) {
      it.formFlag = `Filed as a finished article (${it.words} words); an idea is a short pitch. Ask the desk to resend it as a pitch, or the Central Editor may treat the draft as a reading of the premise only`;
    }
  }
  let status = '';
  for (const path of cfg.sources || ['docs/torenthia/STORY-STATUS.md']) status += (await core.loadOptional(fetchImpl, path, undefined, ref)) || '';
  status = status.slice(0, cfg.maxSourceChars || 120000);
  const messages = buildTriageMessages({ status, items, slots: cfg.editorSlots || 3, now });
  if (dryRun) return { status: 'dry-run', commit: ref, since: new Date(since).toISOString(), filings: items.length, tracker: direct.length, chars: messages.reduce((n, m) => n + m.content.length, 0) };

  let r = { usage: null };
  let result = { summary: '', items: [] };
  if (items.length) {
    r = await core.callModel(fetchImpl, { token, model: cfg.model || 'anthropic/claude-haiku-5.5', messages, maxTokens: cfg.maxOutputTokens || 6000, timeoutMs: 120000, deskId: TRIAGE_DESK, json: false });
    try { result = core.extractJson(r.text); } catch { result = { summary: 'The desk editor reply was not JSON; every filing is unsorted.', items: [] }; }
  }
  const body = renderTriage(result, items, now, direct, since);
  const proposal = {
    kind: 'report',
    title: `Desk editor triage — ${now.toISOString().slice(0, 10)}`,
    summary: `[triage] ${items.length + direct.length} filings sorted for the Central Editor. [through ${now.toISOString()}]`,
    body: body.slice(0, 40000),
    sourceRefs: [`commit:${ref}`, ...(cfg.sources || ['docs/torenthia/STORY-STATUS.md'])],
  };
  const filed = await core.submitProposal(fetchImpl, { inboxUrl, proposal, authHeaders: { Authorization: `Bearer ${runnerKey}`, 'x-newsroom-desk': TRIAGE_DESK } });
  return { status: 'submitted', commit: ref, since: new Date(since).toISOString(), filings: items.length + direct.length, id: filed.id, key: filed.key, usage: r.usage || null };
}

module.exports = { runTriage, buildTriageMessages, renderTriage, listInbox, windowStart, newFilings, trackOf, isTest, TRIAGE_DESK };
