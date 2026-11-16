// Torenthia newsroom v1 — scheduled desk runs.
//
// Each run: read the desk roster and canon from GitHub `main`, ask one model
// (through Vercel AI Gateway) for one proposal, and file it in the existing
// Cloudflare newsroom inbox as PROPOSED. Nothing here writes to GitHub or
// publishes anything. The Central Editor reviews the inbox; John merges.

const REPO_RAW = 'https://raw.githubusercontent.com/jcr0916-hue/federatedrepublic/main/';
const ROSTER_PATH = 'docs/torenthia/agents/desks.json';
const DEFAULT_INBOX = 'https://federated-republic-newsroom.jcr0916.workers.dev';
const GATEWAY_URL = 'https://ai-gateway.vercel.sh/v1/chat/completions';
const KINDS = ['pitch', 'article', 'nrs-proposal', 'report', 'character', 'design', 'other'];
const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

function dueDesks(roster, now, only) {
  if (!roster || roster.paused) return [];
  const desks = Array.isArray(roster.desks) ? roster.desks : [];
  if (only) return desks.filter((d) => d.id === only && d.enabled);
  const today = DAYS[now.getUTCDay()];
  return desks.filter((d) => d.enabled && Array.isArray(d.days) && d.days.includes(today));
}

async function loadText(fetchImpl, path, maxChars) {
  const res = await fetchImpl(REPO_RAW + path);
  if (!res.ok) throw new Error(`could not read ${path} (${res.status})`);
  const text = await res.text();
  return maxChars && text.length > maxChars ? text.slice(0, maxChars) + '\n\n[truncated]' : text;
}

async function loadOptional(fetchImpl, path, maxChars) {
  if (!path) return '';
  try { return await loadText(fetchImpl, path, maxChars); } catch { return ''; }
}

function systemPrompt({ desk, rules, brief }) {
  return [rules.trim(), '', `# Your desk: ${desk.name}`, '', brief.trim()].join('\n');
}

function contextParts({ assignments, notes, sources, now }) {
  const parts = [
    `Today (real-world UTC date): ${now.toISOString().slice(0, 10)}. Do not advance the fictional date beyond what the story status shows.`,
    '',
    '## Your open assignments',
    assignments.trim() || '(none)',
    '',
    '## Notes from the editor and from your past runs',
    notes.trim() || '(none)',
  ];
  for (const s of sources) parts.push('', `## Source: ${s.path}`, s.text.trim());
  return parts;
}

// Step 1 (optional): a stronger model decides what to write and how.
function buildPlanMessages(ctx) {
  const parts = contextParts(ctx);
  parts.push('', '## Your task: plan, do not write',
    'If an open assignment exists, plan the first one. Otherwise choose one item of your own: a story, an official record proposal, a character, or a pitch.',
    'If nothing worthwhile exists, return {"skip": true, "reason": "..."}.',
    `Otherwise return only a JSON object with keys: "kind" (one of ${KINDS.join(', ')}), "workingTitle", "angle" (why this matters now, 2–3 sentences), "outline" (array of beats), "facts" (array of established facts to rely on, each with its source path), "newElements" (any new names, places or figures you propose), "cautions" (open clocks and things the writer must not decide).`);
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
      'If nothing worthwhile exists, return {"skip": true, "reason": "..."}.');
  }
  parts.push(
    `${plan ? 'Return' : 'Otherwise return'} only a JSON object with keys: "kind" (one of ${KINDS.join(', ')}), "title", "summary" (1–2 sentences), "body" (the full draft), "sourceRefs" (repo paths you relied on), and "notesForEditor" (new names, open questions, anything the editor must check).`);
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
    summary: String(p.summary || '').trim().slice(0, 600),
    body: (notes ? `${body}\n\n---\nNotes for the editor:\n${notes}` : body).slice(0, 40000),
    sourceRefs: Array.isArray(p.sourceRefs) ? p.sourceRefs.slice(0, 15).map((x) => String(x).slice(0, 400)) : [],
  };
}

async function callModel(fetchImpl, { token, model, messages, maxTokens, timeoutMs = 120000, deskId }) {
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
        response_format: { type: 'json_object' },
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
  } finally {
    clearTimeout(timer);
  }
}

async function submitProposal(fetchImpl, { inboxUrl, key, proposal }) {
  const res = await fetchImpl(inboxUrl.replace(/\/$/, '') + '/v1/submit', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(proposal),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`inbox ${res.status}: ${data?.error || 'error'}`);
  return data;
}

async function runDesk(desk, { roster, env, fetchImpl, now, dryRun }) {
  const key = env[`NEWSROOM_KEY_${String(desk.inboxDesk || '').toUpperCase()}`];
  const token = env.AI_GATEWAY_API_KEY || env.VERCEL_OIDC_TOKEN;
  if (!dryRun && !key) return { desk: desk.id, status: 'skipped', reason: 'no inbox key configured' };
  if (!dryRun && !token) return { desk: desk.id, status: 'skipped', reason: 'no AI Gateway credential' };

  const limit = roster.maxSourceChars || 360000;
  const cache = new Map();
  const load = async (paths, max) => {
    const out = [];
    let used = 0;
    for (const path of paths) {
      if (!cache.has(path)) cache.set(path, await loadOptional(fetchImpl, path));
      let text = cache.get(path);
      if (!text) continue;
      if (used + text.length > max) text = text.slice(0, Math.max(0, max - used)) + '\n\n[truncated]';
      used += text.length;
      out.push({ path, text });
      if (used >= max) break;
    }
    return out;
  };
  const rules = await loadText(fetchImpl, roster.rulesPath);
  const brief = await loadText(fetchImpl, desk.briefPath);
  const assignments = await loadOptional(fetchImpl, desk.assignmentsPath, 20000);
  const notes = await loadOptional(fetchImpl, desk.notesPath, 20000);
  const base = { desk, rules, brief, assignments, notes, now };
  const writerSources = await load([...(roster.sharedSources || []), ...(desk.sources || [])], limit);
  const planner = desk.planner === null ? null : (desk.planner || roster.planner || null);
  const plannerSources = planner
    ? await load([...(planner.sources || []), ...(desk.sources || [])], planner.maxSourceChars || 160000)
    : [];
  const chars = (m) => m.reduce((n, x) => n + x.content.length, 0);

  if (dryRun) {
    return {
      desk: desk.id,
      status: 'dry-run',
      plannerChars: planner ? chars(buildPlanMessages({ ...base, sources: plannerSources })) : 0,
      writerChars: chars(buildMessages({ ...base, sources: writerSources, plan: planner ? {} : null })),
      plannerSources: plannerSources.map((s) => s.path),
      writerSources: writerSources.map((s) => s.path),
    };
  }

  const usage = {};
  let plan = null;
  if (planner) {
    const r = await callModel(fetchImpl, {
      token, model: planner.model, messages: buildPlanMessages({ ...base, sources: plannerSources }),
      maxTokens: planner.maxOutputTokens || 3000, deskId: desk.id, timeoutMs: 110000,
    });
    usage.planner = { model: planner.model, ...(r.usage || {}) };
    try { plan = extractJson(r.text); } catch { throw new Error(`planner reply was not JSON: ${r.text.slice(0, 200)}`); }
    if (plan && plan.skip) return { desk: desk.id, status: 'no-submission', reason: String(plan.reason || '').slice(0, 600), usage };
  }
  const model = desk.model || roster.defaultModel;
  const maxTokens = desk.maxOutputTokens || roster.maxOutputTokens || 8000;
  const w = await callModel(fetchImpl, {
    token, model, messages: buildMessages({ ...base, sources: writerSources, plan }), maxTokens, deskId: desk.id, timeoutMs: 150000,
  });
  usage.writer = { model, ...(w.usage || {}) };
  let proposal;
  try { proposal = parseProposal(w.text); } catch (e) { throw new Error(`writer: ${e.message}: ${w.text.slice(0, 200)}`); }
  if (proposal.skip) return { desk: desk.id, status: 'no-submission', reason: proposal.reason, usage };
  const receipt = await submitProposal(fetchImpl, { inboxUrl: env.NEWSROOM_URL || DEFAULT_INBOX, key, proposal });
  return { desk: desk.id, status: 'submitted', id: receipt.id, key: receipt.key, title: proposal.title, kind: proposal.kind, usage };
}

async function runNewsroom({ env = process.env, fetchImpl = fetch, now = new Date(), only = '', dryRun = false } = {}) {
  const roster = JSON.parse(await loadText(fetchImpl, ROSTER_PATH));
  if (roster.paused) return { paused: true, results: [] };
  const desks = dueDesks(roster, now, only);
  const results = await Promise.all(desks.map((d) =>
    runDesk(d, { roster, env, fetchImpl, now, dryRun })
      .catch((e) => ({ desk: d.id, status: 'failed', error: String(e.message || e).slice(0, 300) }))));
  return { paused: false, date: now.toISOString(), results };
}

module.exports = { dueDesks, buildMessages, buildPlanMessages, parseProposal, extractJson, runDesk, runNewsroom, REPO_RAW, ROSTER_PATH };
