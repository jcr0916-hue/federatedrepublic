// The desk editor: a small, fast model that reads the day's new filings and ranks them.
// It needs no canon: each desk has already declared its track and the attention its work
// needs ("[canon · high · timely · touches: …]" at the start of the summary). The desk
// editor knows what is going on now (the story status) and spends the Central Editor's
// few daily slots. It decides nothing and discards nothing.

const core = require('./_newsroom-core.js');

const WINDOW_MS = 26 * 3600 * 1000;
const TRIAGE_DESK = 'desk-editor';

function isTest(item) {
  return /\bTEST\b|\[TEST ONLY\]|DO NOT PUBLISH/i.test(`${item.title || ''} ${item.summary || ''}`);
}

function trackOf(item) {
  const m = String(item.summary || '').match(/^\[(canon|idea|record)\b/);
  if (m) return m[1];
  return item.kind === 'nrs-proposal' ? 'record' : ['pitch', 'character', 'other', 'design'].includes(item.kind) ? 'idea' : 'canon';
}

async function listRecent(fetchImpl, { inboxUrl, editorKey, now }) {
  const since = now.getTime() - WINDOW_MS;
  const items = [];
  let cursor = '';
  for (let page = 0; page < 20; page++) {
    const url = inboxUrl.replace(/\/$/, '') + '/v1/list?limit=100' + (cursor ? `&cursor=${encodeURIComponent(cursor)}` : '');
    const res = await fetchImpl(url, { headers: { Authorization: `Bearer ${editorKey}` } });
    if (!res.ok) throw new Error(`inbox list failed (${res.status})`);
    const data = await res.json().catch(() => ({}));
    for (const it of data.items || []) {
      if (it.status === 'PROPOSED' && it.desk !== TRIAGE_DESK && !isTest(it) && Date.parse(it.submittedAt) >= since) items.push(it);
    }
    if (!data.more || !data.cursor) break;
    cursor = data.cursor;
  }
  return items;
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
    '2. Check that each filing\'s declared track fits it: an "idea" written as a finished article stating new facts as settled, or a "canon" piece with no notes ledger, gets a flag.',
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
    if (it.excerpt) user.push('Excerpt:', it.excerpt);
  }
  return [{ role: 'system', content: system }, { role: 'user', content: user.join('\n') }];
}

function renderTriage(result, items, now) {
  const byKey = new Map(items.map((i) => [i.key, i]));
  const rows = (Array.isArray(result.items) ? result.items : []).filter((r) => byKey.has(r.key));
  const seen = new Set(rows.map((r) => r.key));
  for (const it of items) if (!seen.has(it.key)) rows.push({ key: it.key, desk: it.desk, title: it.title, track: trackOf(it), route: 'unsorted', flags: ['desk editor did not sort this filing'], line: '' });
  const order = { editor: 0, bank: 1, return: 2, 'idea-board': 3, records: 4, unsorted: 5 };
  rows.sort((a, b) => (order[a.route] ?? 9) - (order[b.route] ?? 9) || (a.rank ?? 99) - (b.rank ?? 99));
  const out = [`Desk editor triage for ${now.toISOString().slice(0, 10)}: ${items.length} new filings.`, '', String(result.summary || '').trim(), ''];
  for (const route of ['editor', 'bank', 'return', 'idea-board', 'records', 'unsorted']) {
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
  const items = await listRecent(fetchImpl, { inboxUrl, editorKey, now });
  if (!items.length) return { status: 'nothing-new', commit: ref };

  // Canon filings get a short excerpt so the desk editor can judge them; ideas and records go by their summaries.
  for (const it of items) {
    if (trackOf(it) !== 'canon') continue;
    const full = await readItem(fetchImpl, { inboxUrl, editorKey, key: it.key });
    if (full && full.body) it.excerpt = String(full.body).slice(0, 2500);
  }
  let status = '';
  for (const path of cfg.sources || ['docs/torenthia/STORY-STATUS.md']) status += (await core.loadOptional(fetchImpl, path, undefined, ref)) || '';
  status = status.slice(0, cfg.maxSourceChars || 120000);
  const messages = buildTriageMessages({ status, items, slots: cfg.editorSlots || 3, now });
  if (dryRun) return { status: 'dry-run', commit: ref, filings: items.length, chars: messages.reduce((n, m) => n + m.content.length, 0) };

  const r = await core.callModel(fetchImpl, { token, model: cfg.model || 'anthropic/claude-haiku-5.5', messages, maxTokens: cfg.maxOutputTokens || 6000, timeoutMs: 120000, deskId: TRIAGE_DESK, json: false });
  let result;
  try { result = core.extractJson(r.text); } catch { result = { summary: 'The desk editor reply was not JSON; every filing is unsorted.', items: [] }; }
  const body = renderTriage(result, items, now);
  const proposal = {
    kind: 'report',
    title: `Desk editor triage — ${now.toISOString().slice(0, 10)}`,
    summary: `[triage] ${items.length} filings sorted for the Central Editor.`,
    body: body.slice(0, 40000),
    sourceRefs: [`commit:${ref}`, ...(cfg.sources || ['docs/torenthia/STORY-STATUS.md'])],
  };
  const filed = await core.submitProposal(fetchImpl, { inboxUrl, proposal, authHeaders: { Authorization: `Bearer ${runnerKey}`, 'x-newsroom-desk': TRIAGE_DESK } });
  return { status: 'submitted', commit: ref, filings: items.length, id: filed.id, key: filed.key, usage: r.usage || null };
}

module.exports = { runTriage, buildTriageMessages, renderTriage, listRecent, trackOf, isTest, TRIAGE_DESK };
