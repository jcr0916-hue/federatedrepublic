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
    `1. Rank every canon filing. Send the best ${slots} to the editor ("editor"); route the rest to "bank" (good, can wait) or "return" (not ready: say why in one line). Desks tend to rate their own work high, so judge importance yourself against what is going on now: does it move a live storyline, react to something recent, or bring a new viewpoint? A recap of something already published, with no development, is "return". Rank a filing higher when it adds the next ordinary step to a thread the story clock lists (and say which thread in the line); a filing that retells an open question without a new step ranks low.`,
    '2. Check that each filing\'s declared track fits it: an "idea" that states new facts as settled, or a "canon" piece with no notes ledger, gets a flag. (Length and article form of ideas is checked in code; you need not.) You read each canon filing in full: flag what the text actually says, such as an invented office, a new outlet or a person not in the story status, never that the text was cut short.',
    '3. Route each idea to "idea-board" with one plain line on what it proposes.',
    '4. Route records to "records". Flag only what looks wrong at a glance: the wrong level of government filing, anything that decides a vote, finding, certification or appointment, or an invented date.',
    '5. Flag anything that touches reserved continuity (the Rehn and Corindal matters, any national figure\'s future) or an open constitutional clock, whatever its rank.',
    'You have the story status and the story clock below for what is going on now. You do not have the full canon and do not need it: do not fact-check details beyond what the story status shows.',
    '',
    'Return only a JSON object: {"summary": "<two or three sentences on the day>", "items": [{"key": "<inbox key>", "desk": "...", "title": "...", "track": "canon|idea|record", "route": "editor|bank|return|idea-board|records", "rank": <1-based rank among canon filings, or null>, "flags": ["..."], "line": "<one line: what it is and why this route>"}]}. Include every filing exactly once.',
    '',
    status,
  ].join('\n');
  const user = [`Today (real-world UTC date): ${now.toISOString().slice(0, 10)}.`, '', `## Filings (${items.length})`];
  for (const it of items) {
    user.push('', `### ${it.key}`, `Desk: ${it.desk} · Kind: ${it.kind} · Track: ${trackOf(it)}`, `Title: ${it.title}`, `Summary: ${it.summary || ''}`);
    if (it.excerpt) user.push('Full text:', it.excerpt);
  }
  return [{ role: 'system', content: system }, { role: 'user', content: user.join('\n') }];
}

// The model's list comes back keyed by inbox key, but a model may shorten or reformat a key, wrap the
// list under another name, or capitalize a route. Match leniently so one slip doesn't sink the day's
// sort: by exact key, then by the filing's id (the last path segment, or any uuid or 8-hex prefix in
// the key), then by an unambiguous title. A row that matches nothing is ignored.
const ROUTES = ['editor', 'bank', 'return', 'idea-board', 'records'];
const idOf = (key) => String(key || '').split('/').pop().replace(/\.json$/i, '').toLowerCase();
const normTitle = (t) => String(t || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const normRoute = (r) => String(r || '').toLowerCase().trim().replace(/[\s_]+/g, '-');

function listOf(result) {
  if (Array.isArray(result)) return result;
  for (const name of ['items', 'filings', 'sorted', 'results', 'routes']) if (Array.isArray(result && result[name])) return result[name];
  return [];
}

function makeResolver(items) {
  const byKey = new Map(items.map((i) => [i.key, i]));
  const byId = new Map(), byTitle = new Map();
  for (const it of items) {
    byId.set(idOf(it.key), it);
    const t = normTitle(it.title);
    byTitle.set(t, byTitle.has(t) ? null : it);
  }
  return (row) => {
    const raw = String((row && row.key) || '').trim().replace(/^[`'"]+|[`'"]+$/g, '');
    if (byKey.has(raw)) return byKey.get(raw);
    const id = idOf(raw);
    if (id && byId.has(id)) return byId.get(id);
    const uuid = raw.match(/[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}/i);
    if (uuid && byId.has(uuid[0].toLowerCase())) return byId.get(uuid[0].toLowerCase());
    if (/^[0-9a-f]{8}$/i.test(id)) {
      const hits = items.filter((it) => idOf(it.key).startsWith(id));
      if (hits.length === 1) return hits[0];
    }
    const t = normTitle(row && row.title);
    return (t && byTitle.get(t)) || null;
  };
}

// Sort the model's reply against the filings it was given. Returns the matched rows (keys corrected,
// first row for a filing wins), the filings it didn't sort, and any keys it returned that matched nothing.
function matchRows(result, items) {
  const resolve = makeResolver(items);
  const rows = [], seen = new Set(), stray = [];
  for (const r of listOf(result)) {
    if (!r || typeof r !== 'object') continue;
    const it = resolve(r);
    const route = normRoute(r.route);
    if (!it) { if (r.key) stray.push(String(r.key).slice(0, 120)); continue; }
    if (seen.has(it.key) || !ROUTES.includes(route)) continue;
    seen.add(it.key);
    rows.push({ ...r, key: it.key, desk: it.desk, title: it.title, track: trackOf(it), route });
  }
  return { rows, missing: items.filter((it) => !seen.has(it.key)), stray };
}

// A filing the model didn't sort still has the track its desk declared. Records and ideas go where
// that track sends them: nothing is decided, only the desk's own declaration is followed. A canon
// filing needs a ranking, which only the model or the Central Editor can give, so it stays unsorted.
const FALLBACK_ROUTE = { record: 'records', idea: 'idea-board', canon: 'unsorted' };
function declaredRoute(it) {
  const track = trackOf(it);
  const line = String(it.summary || '').replace(/^\[[^\]]*\]\s*/, '').slice(0, 200);
  return {
    key: it.key, desk: it.desk, title: it.title, track, route: FALLBACK_ROUTE[track] || 'unsorted', rank: null,
    flags: [...(it.formFlag ? [it.formFlag] : []), track === 'canon' ? 'desk editor did not rank this canon filing' : 'desk editor did not sort this filing; routed by the track its desk declared'],
    line,
  };
}

// Filings from "pass-through" desks (the election tracker and any later thread trackers) are
// reports for the Central Editor to read, not competing stories. They skip the model and
// appear first in the triage as route "tracker".
function renderTriage(result, items, now, direct = [], since = null, meta = {}) {
  const { rows, missing, stray } = matchRows(result, items);
  for (const r of rows) {
    const it = items.find((i) => i.key === r.key);
    r.flags = [...(it && it.formFlag ? [it.formFlag] : []), ...(Array.isArray(r.flags) ? r.flags : [])];
  }
  for (const it of missing) rows.push(declaredRoute(it));
  for (const it of direct) rows.push({ key: it.key, desk: it.desk, title: it.title, track: trackOf(it), route: 'tracker', flags: [], line: String(it.summary || '').slice(0, 200) });
  const order = { tracker: -1, editor: 0, bank: 1, return: 2, 'idea-board': 3, records: 4, unsorted: 5 };
  rows.sort((a, b) => (order[a.route] ?? 9) - (order[b.route] ?? 9) || (a.rank ?? 99) - (b.rank ?? 99));
  const out = [`Desk editor triage for ${now.toISOString().slice(0, 10)}: ${items.length + direct.length} new filings${since ? ` since ${new Date(since).toISOString().slice(0, 16)}Z` : ''}.`, '', String(result && result.summary || '').trim(), ''];
  if (missing.length) {
    out.push(`Note: the desk editor sorted ${items.length - missing.length} of ${items.length} filings${meta.retried ? ' (after a second try)' : ''}; the other ${missing.length} follow the track their desk declared${missing.some((i) => trackOf(i) === 'canon') ? ', and canon filings stay unsorted for the Central Editor to rank' : ''}.${stray.length ? ` Keys it returned that matched no filing: ${stray.slice(0, 3).join(', ')}.` : ''}`, '');
  }
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
  for (const path of cfg.sources || ['docs/torenthia/STORY-STATUS.md']) {
    const text = await core.loadOptional(fetchImpl, path, undefined, ref);
    if (text) status += `${status ? '\n\n' : ''}## Source: ${path}\n${text}`;
  }
  status = status.slice(0, cfg.maxSourceChars || 120000);
  const messages = buildTriageMessages({ status, items, slots: cfg.editorSlots || 3, now });
  if (dryRun) return { status: 'dry-run', commit: ref, since: new Date(since).toISOString(), filings: items.length, tracker: direct.length, chars: messages.reduce((n, m) => n + m.content.length, 0) };

  let r = { usage: null };
  let retried = false;
  let result = { summary: '', items: [] };
  if (items.length) {
    const ask = (msgs) => core.callModel(fetchImpl, { token, model: cfg.model || 'anthropic/claude-haiku-5.5', messages: msgs, maxTokens: cfg.maxOutputTokens || 6000, timeoutMs: 120000, deskId: TRIAGE_DESK, json: false });
    const parse = (text) => { try { return core.extractJson(text); } catch { return { summary: 'The desk editor reply was not JSON; filings follow the track their desk declared.', items: [] }; } };
    r = await ask(messages);
    result = parse(r.text);
    // If the reply left filings out (or its keys matched none), ask once more for the whole set, naming
    // the keys exactly. Keep whichever reply sorted more. A failed retry never loses the first reply.
    const gaps = matchRows(result, items).missing;
    if (gaps.length) {
      const again = [...messages, { role: 'assistant', content: r.text.slice(0, 20000) }, { role: 'user', content: `Your reply did not sort ${gaps.length} of the ${items.length} filings (${gaps.map((g) => g.desk).join(', ')}). Return the complete JSON object again with every filing exactly once, copying each "key" exactly as it appears after "###".` }];
      try {
        const r2 = await ask(again);
        const result2 = parse(r2.text);
        if (matchRows(result2, items).missing.length < gaps.length) { r = r2; result = result2; retried = true; }
      } catch { /* keep the first reply */ }
    }
  }
  const body = renderTriage(result, items, now, direct, since, { retried });
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

module.exports = { runTriage, matchRows, declaredRoute, buildTriageMessages, renderTriage, listInbox, windowStart, newFilings, trackOf, isTest, TRIAGE_DESK };
