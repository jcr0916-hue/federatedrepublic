// Torenthia newsroom v1 — scheduled desk runs.
//
// Each run: read the desk roster and canon from one GitHub `main` commit, ask the models
// (through Vercel AI Gateway) for one proposal, and file it in the existing
// Cloudflare newsroom inbox as PROPOSED. Nothing here writes to GitHub or
// publishes anything. The Central Editor reviews the inbox; John merges.

const REPO = 'jcr0916-hue/federatedrepublic';
const RAW_BASE = `https://raw.githubusercontent.com/${REPO}/`;
const REPO_RAW = RAW_BASE + 'main/';
const ROSTER_PATH = 'docs/torenthia/agents/desks.json';
const DEFAULT_INBOX = 'https://federated-republic-newsroom.jcr0916.workers.dev';
const GATEWAY_URL = 'https://ai-gateway.vercel.sh/v1/chat/completions';
const KINDS = ['pitch', 'article', 'nrs-proposal', 'report', 'character', 'design', 'other'];
const TRACKS = ['canon', 'idea', 'record'];
const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

// A desk with "until": "YYYY-MM-DD" (temporary desks, such as the election tracker) stops
// running after that UTC day. Without it a desk runs for as long as it is enabled.
function withinTerm(d, now) {
  if (!d.until) return true;
  const end = Date.parse(String(d.until) + 'T23:59:59Z');
  return Number.isNaN(end) ? true : now.getTime() <= end;
}

function dueDesks(roster, now, only) {
  if (!roster || roster.paused) return [];
  const desks = Array.isArray(roster.desks) ? roster.desks : [];
  if (only) return desks.filter((d) => d.id === only && d.enabled && withinTerm(d, now));
  const today = DAYS[now.getUTCDay()];
  const week = Math.floor(now.getTime() / (7 * 86400000)); // whole weeks since 1970-01-01 (a Thursday)
  return desks.filter((d) => d.enabled && withinTerm(d, now) && Array.isArray(d.days) && d.days.includes(today)
    && (!(d.everyWeeks > 1) || (week + (d.weekOffset || 0)) % d.everyWeeks === 0));
}

// Desks on their weekday but in an off week of their cadence. They still run if tasked.
function offWeekDesks(roster, now) {
  if (!roster || roster.paused) return [];
  const desks = Array.isArray(roster.desks) ? roster.desks : [];
  const today = DAYS[now.getUTCDay()];
  const week = Math.floor(now.getTime() / (7 * 86400000));
  return desks.filter((d) => d.enabled && withinTerm(d, now) && Array.isArray(d.days) && d.days.includes(today)
    && d.everyWeeks > 1 && (week + (d.weekOffset || 0)) % d.everyWeeks !== 0);
}

// An assignment is open when a list item sits under "## Open" in the desk's ASSIGNMENTS.md.
function hasOpenAssignment(text) {
  const m = String(text || '').match(/^## Open[^\n]*\n([\s\S]*?)(?=^## |$(?![\s\S]))/m);
  return !!m && /^\s*[-*] +\S/m.test(m[1]);
}

// Every file in a run is read at the same commit, so a merge mid-run cannot mix versions.
async function resolveCommit(fetchImpl) {
  try {
    const res = await fetchImpl(`https://api.github.com/repos/${REPO}/commits/main`, {
      headers: { Accept: 'application/vnd.github.sha', 'User-Agent': 'federatedrepublic-newsroom' },
    });
    const sha = res.ok ? (await res.text()).trim() : '';
    return /^[0-9a-f]{40}$/.test(sha) ? sha : 'main';
  } catch { return 'main'; }
}

async function loadText(fetchImpl, path, maxChars, ref = 'main') {
  const res = await fetchImpl(RAW_BASE + ref + '/' + path);
  if (!res.ok) throw new Error(`could not read ${path} (${res.status})`);
  const text = await res.text();
  return maxChars && text.length > maxChars ? text.slice(0, maxChars) + '\n\n[truncated]' : text;
}

async function loadOptional(fetchImpl, path, maxChars, ref) {
  if (!path) return '';
  try { return await loadText(fetchImpl, path, maxChars, ref); } catch { return ''; }
}

// Prompt layout for caching: everything identical across desks (rules, then the
// shared sources) goes first in the system message; desk-specific material
// follows in the user message. Providers bill a repeated prefix at cache rates.
function systemPrompt({ rules, sharedSources = [] }) {
  const parts = [rules.trim()];
  for (const s of sharedSources) parts.push('', `## Source: ${s.path}`, s.text.trim());
  return parts.join('\n');
}

function contextParts({ desk, brief, deskSources = [], assignments, notes, now }) {
  const parts = [`# Your desk: ${desk.name}`, '', brief.trim()];
  for (const s of deskSources) parts.push('', `## Source: ${s.path}`, s.text.trim());
  parts.push('',
    `Today (real-world UTC date): ${now.toISOString().slice(0, 10)}. Do not advance the fictional date beyond what the story status shows.`,
    '',
    '## Your open assignments',
    assignments.trim() || '(none)',
    '',
    '## Notes from the editor and from your past runs',
    notes.trim() || '(none)');
  return parts;
}

// A desk with an open assignment does not get to find "nothing worthwhile": the editor already decided
// the work is worth doing. It may skip only when its sources cannot support the assignment, and the reason
// must name what blocks it, so the editor can repair the assignment. (The Corindal desk filed nothing on
// its first assignment day and left no reason behind.)
function skipLine(ctx) {
  if (hasOpenAssignment(ctx.assignments)) {
    return 'You have an open assignment, so do the work: the editor has already judged it worth doing. Return {"skip": true, "reason": "..."} only if the sources in this prompt cannot support the assignment, and then make the reason specific: name the source, rule or missing fact that blocks it and say what would unblock it.';
  }
  return 'If nothing worthwhile exists, return {"skip": true, "reason": "..."}. Quiet weeks are acceptable; say in the reason what you checked.';
}

// Step 1 (optional): a stronger model decides what to write and how.
function buildPlanMessages(ctx) {
  const parts = contextParts(ctx);
  parts.push('', '## Your task: plan, do not write',
    'If an open assignment exists, plan the first one. Otherwise choose one item of your own: a story, an official record proposal, a character, or a pitch.',
    skipLine(ctx),
    `Otherwise return only a JSON object with keys: "kind" (one of ${KINDS.join(', ')}), "workingTitle", "angle" (why this matters now, 2–3 sentences), "outline" (array of beats), "facts" (array of established facts to rely on, each with its source path), "newElements" (any new names, places or figures you propose), "cautions" (open clocks and things the writer must not decide), "track" (one of ${TRACKS.join(', ')}).`);
  return [{ role: 'system', content: systemPrompt(ctx) }, { role: 'user', content: parts.join('\n') }];
}

function buildMessages(ctx) {
  const { plan } = ctx;
  const system = systemPrompt(ctx);
  const parts = contextParts(ctx);
  if (plan) {
    parts.push('', '## Your plan (from the desk planner)', JSON.stringify(plan, null, 2), '',
      '## Your task',
      'Write the item described in the plan. Follow its outline and cautions, check every fact against the sources above, and drop anything the sources do not support.');
  } else {
    parts.push('', '## Your task',
      'If an open assignment exists, complete the first one. Otherwise propose one item of your own choosing: a story, an official record proposal, a character, or a pitch.',
      skipLine(ctx));
  }
  parts.push(
    `${plan ? 'Return' : 'Otherwise return'} only a JSON object with keys: "kind" (one of ${KINDS.join(', ')}), "title", "summary" (1–2 sentences), "body" (the full draft), "sourceRefs" (repo paths you relied on), "notesForEditor" (a short ledger: established facts with their source paths; new names, places and figures you propose; unresolved points; affected jurisdictions and dependencies; anything the editor must check; your recommendation: USE, HOLD, REVISE or DISCARD), "track" (one of ${TRACKS.join(', ')}: see "Declare what you are submitting" in the rules), and "attention" (an object: "importance" high, normal or low; "timeSensitive" true or false; "touches" an array naming any of: other jurisdictions, federal authority, reserved continuity, an open clock; "why" one sentence on why it matters now).`);
  return [
    { role: 'system', content: system },
    { role: 'user', content: parts.join('\n') },
  ];
}

function extractJson(text) {
  const t = String(text || '').replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
  try { return JSON.parse(t); } catch { /* fall through */ }
  const a = t.indexOf('{'), b = t.lastIndexOf('}');
  if (a >= 0 && b > a) return JSON.parse(t.slice(a, b + 1));
  throw new Error('model did not return JSON');
}

// The desk's own declaration of what it is submitting and how much attention it needs,
// carried as a short tag at the start of the summary so the inbox list shows it:
// "[canon · high · timely · touches: federal authority]".
function attentionTag(kind, p) {
  let track = String(p.track || '').toLowerCase().trim();
  if (!TRACKS.includes(track)) track = kind === 'nrs-proposal' ? 'record' : ['pitch', 'character', 'other', 'design'].includes(kind) ? 'idea' : 'canon';
  const a = p.attention && typeof p.attention === 'object' ? p.attention : {};
  let importance = String(a.importance || '').toLowerCase().trim();
  if (!['high', 'normal', 'low'].includes(importance)) importance = track === 'record' ? 'low' : 'normal';
  const bits = [track, importance];
  if (a.timeSensitive === true || a.timeSensitive === 'true') bits.push('timely');
  const touches = (Array.isArray(a.touches) ? a.touches : []).map((x) => String(x).trim()).filter(Boolean).slice(0, 4);
  if (touches.length) bits.push('touches: ' + touches.join(', ').slice(0, 120));
  return `[${bits.join(' · ')}]`;
}

function parseProposal(text) {
  const p = extractJson(text);
  if (p && p.skip) return { skip: true, reason: String(p.reason || '').slice(0, 600) };
  const kind = String(p.kind || '').toLowerCase().trim();
  const title = String(p.title || '').trim();
  const body = String(p.body || '').trim();
  if (!KINDS.includes(kind)) throw new Error(`invalid kind: ${kind || '(missing)'}`);
  if (!title || !body) throw new Error('title and body required');
  const notes = String(p.notesForEditor || '').trim();
  return {
    kind,
    title: title.slice(0, 180),
    summary: (attentionTag(kind, p) + ' ' + String(p.summary || '').trim()).slice(0, 600),
    body: (notes ? `${body}\n\n---\nNotes for the editor:\n${notes}` : body).slice(0, 40000),
    sourceRefs: Array.isArray(p.sourceRefs) ? p.sourceRefs.slice(0, 15).map((x) => String(x).slice(0, 400)) : [],
  };
}

async function callModel(fetchImpl, { token, model, messages, maxTokens, timeoutMs = 120000, deskId, json = true }) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetchImpl(GATEWAY_URL, {
      method: 'POST',
      signal: ctrl.signal,
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: maxTokens,
        ...(json ? { response_format: { type: 'json_object' } } : {}),
        providerOptions: { gateway: { tags: ['site:federated-republic', 'newsroom', `desk:${deskId}`] } },
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(`gateway ${res.status}: ${data?.error?.message || 'error'}`);
    const choice = data?.choices?.[0] || {};
    const text = choice.message?.content || '';
    if (!text.trim()) {
      throw new Error(`empty reply from ${model} (finish_reason=${choice.finish_reason || 'unknown'}, completion_tokens=${data?.usage?.completion_tokens ?? '?'})`);
    }
    return { text, usage: data?.usage || null };
  } catch (e) {
    if (e?.name === 'AbortError' || /aborted/i.test(String(e?.message))) {
      throw new Error(`${model} did not finish within ${Math.round(timeoutMs / 1000)}s`);
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

// The writer call's time limit. Default 105 s. A desk may ask for longer with `timeoutMs` in
// desks.json. The cap keeps the whole run inside the function's 300 s limit: a planner takes up to
// 175 s, so a desk with one can't stretch past what is left; a desk with no planner may use up to 270 s.
const WRITER_TIMEOUT_DEFAULT_MS = 105000;
const WRITER_TIMEOUT_MIN_MS = 30000;
const PLANNER_TIMEOUT_MS = 175000;
const RUN_BUDGET_MS = 285000;
function writerTimeoutMs(desk, hasPlanner) {
  const asked = Number(desk && desk.timeoutMs);
  if (!Number.isFinite(asked) || asked <= 0) return WRITER_TIMEOUT_DEFAULT_MS;
  const cap = hasPlanner ? RUN_BUDGET_MS - PLANNER_TIMEOUT_MS : 270000;
  return Math.max(WRITER_TIMEOUT_MIN_MS, Math.min(Math.round(asked), Math.max(cap, WRITER_TIMEOUT_DEFAULT_MS)));
}

async function submitProposal(fetchImpl, { inboxUrl, key, proposal, authHeaders }) {
  const res = await fetchImpl(inboxUrl.replace(/\/$/, '') + '/v1/submit', {
    method: 'POST',
    headers: { ...(authHeaders || { Authorization: `Bearer ${key}` }), 'Content-Type': 'application/json' },
    body: JSON.stringify(proposal),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`inbox ${res.status}: ${data?.error || 'error'}`);
  return data;
}

// Before any paid call: confirm the desk's inbox key works, and find whether
// the desk filed within the last few hours. Vercel Schedules can deliver a run
// twice, minutes apart; a separate run earlier the same day still counts as new.
const RECENT_MS = 6 * 3600 * 1000;
async function filedRecently(fetchImpl, { inboxUrl, key, now, authHeaders }) {
  const since = now.getTime() - RECENT_MS;
  let cursor = '';
  for (let page = 0; page < 20; page++) {
    const url = inboxUrl.replace(/\/$/, '') + '/v1/list?limit=100' + (cursor ? `&cursor=${encodeURIComponent(cursor)}` : '');
    const res = await fetchImpl(url, { headers: authHeaders || { Authorization: `Bearer ${key}` } });
    if (!res.ok) throw new Error(`inbox key check failed (${res.status}); no model was called`);
    const data = await res.json().catch(() => ({}));
    const hit = (data.items || []).find((i) => {
      const t = Date.parse(i.submittedAt || '');
      return Number.isFinite(t) && t >= since && t <= now.getTime() + 60000;
    });
    if (hit) return hit;
    if (!data.more || !data.cursor) return null;
    cursor = data.cursor;
  }
  return null;
}

async function runDesk(desk, { roster, env, fetchImpl, now, dryRun, ref = 'main' }) {
  // A desk's own inbox key is used when one is configured. Otherwise the shared
  // runner key files on the desk's behalf, naming the desk in x-newsroom-desk.
  const deskKey = env[`NEWSROOM_KEY_${String(desk.inboxDesk || '').toUpperCase().replace(/-/g, '_')}`];
  const key = deskKey || env.NEWSROOM_RUNNER_KEY;
  const authHeaders = deskKey ? { Authorization: `Bearer ${deskKey}` } : { Authorization: `Bearer ${key}`, 'x-newsroom-desk': String(desk.inboxDesk || '') };
  const token = env.AI_GATEWAY_API_KEY || env.VERCEL_OIDC_TOKEN;
  if (!dryRun && !key) return { desk: desk.id, status: 'skipped', reason: 'no inbox key configured' };
  if (!dryRun && !token) return { desk: desk.id, status: 'skipped', reason: 'no AI Gateway credential' };

  const limit = roster.maxSourceChars || 360000;
  const cache = new Map();
  const load = async (paths, max) => {
    const out = [];
    let used = 0;
    for (const path of paths) {
      if (!cache.has(path)) cache.set(path, await loadOptional(fetchImpl, path, undefined, ref));
      let text = cache.get(path);
      if (!text) continue;
      if (used + text.length > max) text = text.slice(0, Math.max(0, max - used)) + '\n\n[truncated]';
      used += text.length;
      out.push({ path, text });
      if (used >= max) break;
    }
    return out;
  };
  const rules = await loadText(fetchImpl, roster.rulesPath, undefined, ref);
  const brief = await loadText(fetchImpl, desk.briefPath, undefined, ref);
  const assignments = await loadOptional(fetchImpl, desk.assignmentsPath, 20000, ref);
  const notes = await loadOptional(fetchImpl, desk.notesPath, 20000, ref);
  const deskSources = await load(desk.sources || [], 80000);
  const base = { desk, rules, brief, assignments, notes, now, deskSources };
  const writerSources = await load(roster.sharedSources || [], limit);
  const planner = desk.planner === null ? null : (desk.planner || roster.planner || null);
  const plannerSources = planner ? await load(planner.sources || [], planner.maxSourceChars || 160000) : [];
  const chars = (m) => m.reduce((n, x) => n + x.content.length, 0);

  if (dryRun) {
    return {
      desk: desk.id,
      status: 'dry-run',
      plannerChars: planner ? chars(buildPlanMessages({ ...base, sharedSources: plannerSources })) : 0,
      writerChars: chars(buildMessages({ ...base, sharedSources: writerSources, plan: planner ? {} : null })),
      plannerSources: plannerSources.map((s) => s.path),
      deskSources: deskSources.map((s) => s.path),
      writerSources: writerSources.map((s) => s.path),
    };
  }

  const inboxUrl = env.NEWSROOM_URL || DEFAULT_INBOX;
  const already = await filedRecently(fetchImpl, { inboxUrl, key, now, authHeaders });
  if (already) return { desk: desk.id, status: 'already-filed', id: already.id, reason: 'this desk filed within the last 6 hours' };
  const usage = {};
  let plan = null;
  if (planner) {
    const r = await callModel(fetchImpl, {
      token, model: planner.model, messages: buildPlanMessages({ ...base, sharedSources: plannerSources }),
      maxTokens: planner.maxOutputTokens || 3000, deskId: desk.id, timeoutMs: 175000,
    });
    usage.planner = { model: planner.model, ...(r.usage || {}) };
    try { plan = extractJson(r.text); } catch { throw new Error(`planner reply was not JSON: ${r.text.slice(0, 200)}`); }
    if (plan && plan.skip) return { desk: desk.id, status: 'no-submission', reason: String(plan.reason || '').slice(0, 600), usage };
  }
  const model = desk.model || roster.defaultModel;
  const maxTokens = desk.maxOutputTokens || roster.maxOutputTokens || 8000;
  const w = await callModel(fetchImpl, {
    token, model, messages: buildMessages({ ...base, sharedSources: writerSources, plan }), maxTokens, deskId: desk.id, timeoutMs: writerTimeoutMs(desk, !!planner),
  });
  usage.writer = { model, ...(w.usage || {}) };
  let proposal;
  try { proposal = parseProposal(w.text); } catch (e) { throw new Error(`writer: ${e.message}: ${w.text.slice(0, 200)}`); }
  if (proposal.skip) return { desk: desk.id, status: 'no-submission', reason: proposal.reason, usage };
  if (ref !== 'main') proposal.sourceRefs = [`commit:${ref}`, ...proposal.sourceRefs].slice(0, 15);
  const receipt = await submitProposal(fetchImpl, { inboxUrl, key, proposal, authHeaders });
  return { desk: desk.id, status: 'submitted', id: receipt.id, key: receipt.key, title: proposal.title, kind: proposal.kind, usage };
}

// A desk with a "records" block also runs a records desk for its jurisdiction's own record
// system: id "<id>-records", its own inbox name, the shared records brief, and the desk's
// brief and sources as context. Its cadence comes from the records block.
function withRecordDesks(roster) {
  const desks = Array.isArray(roster.desks) ? roster.desks : [];
  const extra = desks.filter((d) => d.records && typeof d.records === 'object').map((d) => {
    const dir = String(d.briefPath || '').replace(/[^/]*$/, '');
    return {
      id: `${d.id}-records`,
      name: `${d.name.replace(/ desk$/, '')} records desk`,
      jurisdiction: d.jurisdiction,
      inboxDesk: `${d.inboxDesk || d.id}-records`,
      enabled: d.enabled && d.records.enabled !== false,
      days: d.records.days || d.days,
      everyWeeks: d.records.everyWeeks || 1,
      weekOffset: d.records.weekOffset || 0,
      briefPath: roster.recordsBriefPath,
      assignmentsPath: `${dir}RECORDS-ASSIGNMENTS.md`,
      notesPath: `${dir}RECORDS-NOTES.md`,
      sources: [d.briefPath, `${dir}RECORDS-REGISTER.md`, ...(d.sources || [])],
      planner: d.records.planner === undefined ? null : d.records.planner,
      ...(d.records.model ? { model: d.records.model } : {}),
    };
  });
  return { ...roster, desks: [...desks, ...extra] };
}

async function runNewsroom({ env = process.env, fetchImpl = fetch, now = new Date(), only = '', dryRun = false } = {}) {
  const ref = await resolveCommit(fetchImpl);
  const roster = withRecordDesks(JSON.parse(await loadText(fetchImpl, ROSTER_PATH, undefined, ref)));
  if (roster.paused) return { paused: true, commit: ref, results: [] };
  const desks = dueDesks(roster, now, only);
  // A tasked desk (an open assignment) runs every week on its days, whatever its cadence.
  if (!only) {
    for (const d of offWeekDesks(roster, now)) {
      try {
        if (d.assignmentsPath && hasOpenAssignment(await loadText(fetchImpl, d.assignmentsPath, undefined, ref))) desks.push(d);
      } catch { /* unreadable assignments: keep the cadence */ }
    }
  }
  const results = await Promise.all(desks.map((d) =>
    runDesk(d, { roster, env, fetchImpl, now, dryRun, ref })
      .catch((e) => ({ desk: d.id, status: 'failed', error: String(e.message || e).slice(0, 300) }))));
  return { paused: false, date: now.toISOString(), commit: ref, results };
}

// The run log on Vercel keeps only an hour, so "why did this desk file nothing?" had no answer
// two days later. Each scheduled run files one short report from the pseudo-desk "newsroom-run"
// with every desk's outcome and reason. The triage ignores it; the Central Editor reads it.
const RUN_DESK = 'newsroom-run';

function renderRunReport(result, now) {
  const rows = Array.isArray(result.results) ? result.results : [];
  const tally = {};
  for (const r of rows) tally[r.status] = (tally[r.status] || 0) + 1;
  const head = Object.entries(tally).map(([k, v]) => `${v} ${k}`).join(', ') || 'no desks due';
  const lines = [`Newsroom run for ${now.toISOString().slice(0, 10)}: ${rows.length} desk${rows.length === 1 ? '' : 's'} due (${head}).`, ''];
  for (const r of [...rows].sort((a, b) => String(a.desk).localeCompare(String(b.desk)))) {
    const why = String(r.reason || r.error || '').replace(/\s+/g, ' ').slice(0, 500);
    const tokens = r.usage ? Object.values(r.usage).reduce((n, u) => n + (u && (u.completion_tokens || 0)), 0) : 0;
    lines.push(`- **${r.desk}**: ${r.status}${r.title ? ` — ${r.title}` : ''}${why ? ` — ${why}` : ''}${tokens ? ` (${tokens} output tokens)` : ''}`);
  }
  return lines.join('\n');
}

async function fileRunReport(fetchImpl, { env = process.env, result, now = new Date() }) {
  const runnerKey = env.NEWSROOM_RUNNER_KEY;
  if (!runnerKey || !result || result.paused || !Array.isArray(result.results) || !result.results.length) return null;
  const proposal = {
    kind: 'report',
    title: `Newsroom run — ${now.toISOString().slice(0, 10)}`,
    summary: `[run] ${result.results.length} desks due; outcomes and skip reasons.`,
    body: renderRunReport(result, now).slice(0, 20000),
    sourceRefs: result.commit ? [`commit:${result.commit}`] : [],
  };
  return submitProposal(fetchImpl, { inboxUrl: env.NEWSROOM_URL || DEFAULT_INBOX, proposal, authHeaders: { Authorization: `Bearer ${runnerKey}`, 'x-newsroom-desk': RUN_DESK } });
}

module.exports = { writerTimeoutMs, RUN_DESK, renderRunReport, fileRunReport, TRACKS, attentionTag, filedRecently, submitProposal, DEFAULT_INBOX, RAW_BASE, dueDesks, offWeekDesks, hasOpenAssignment, withRecordDesks, resolveCommit, loadText, loadOptional, callModel, systemPrompt, contextParts, buildMessages, buildPlanMessages, parseProposal, extractJson, runDesk, runNewsroom, REPO_RAW, ROSTER_PATH };
