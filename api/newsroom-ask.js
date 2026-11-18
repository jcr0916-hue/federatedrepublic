// Vercel Serverless Function: ask a desk a question and get its answer in its own voice.
// "What's going on in Korda? Who are the major players?" The desk answers from its brief,
// its sources, its notes and the shared canon, as the voice of its jurisdiction.
// Like the editor relay, it answers only on *.vercel.app hosts, which the project's
// Deployment Protection limits to John's Vercel account (the editor reaches them through
// the Vercel connector); on the public custom domain it returns 404. Nothing is filed.

const core = require('./_newsroom-core.js');

function protectedHost(host) {
  return /^[a-z0-9-]+\.vercel\.app$/i.test(String(host || '').split(':')[0]);
}

const TASK = [
  '## Your task: answer a question from the project owner',
  'Answer as the voice of your jurisdiction or institution: its government, institutions, officials, public, press and people, as they would see it.',
  'Be specific: name the people and bodies, what each wants, where they disagree, and what is pending. Give your own read of where things could go and what your realm cares about next.',
  'Keep four things apart and label them: **Established** (published canon, with its source), **Approved intention**, **Proposed** (your new people, ideas or storylines), and **Open** (unresolved or not established). Never present a proposal as fact, never decide an open matter, and never speculate about reserved continuity (say only that it needs central review).',
  'Write in American English, in plain markdown, normally 300–900 words unless the question needs more.',
  'Return only a JSON object: {"answer": "<markdown>"}.',
].join('\n');

async function handler(req, res, fetchImpl = fetch) {
  if (!protectedHost(req.headers.host) || req.method !== 'GET') {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  const q = req.query || {};
  const deskId = String(q.desk || '');
  const question = String(q.q || '').trim().slice(0, 2000);
  if (!deskId || !question) {
    res.status(400).json({ error: 'Use ?desk=<desk id>&q=<question>' });
    return;
  }
  const token = process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN;
  if (!token) {
    res.status(503).json({ error: 'No AI Gateway credential' });
    return;
  }
  try {
    const ref = await core.resolveCommit(fetchImpl);
    const roster = core.withRecordDesks(JSON.parse(await core.loadText(fetchImpl, core.ROSTER_PATH, undefined, ref)));
    const desk = (roster.desks || []).find((d) => d.id === deskId);
    if (!desk) {
      res.status(404).json({ error: `No desk "${deskId}"`, desks: (roster.desks || []).map((d) => d.id) });
      return;
    }
    const load = async (paths, max) => {
      const out = []; let used = 0;
      for (const path of paths) {
        let text = await core.loadOptional(fetchImpl, path, undefined, ref);
        if (!text) continue;
        if (used + text.length > max) text = text.slice(0, Math.max(0, max - used)) + '\n\n[truncated]';
        used += text.length; out.push({ path, text });
        if (used >= max) break;
      }
      return out;
    };
    const planner = roster.planner || {};
    const rules = await core.loadText(fetchImpl, roster.rulesPath, undefined, ref);
    const ctx = {
      desk,
      rules,
      brief: await core.loadText(fetchImpl, desk.briefPath, undefined, ref),
      assignments: await core.loadOptional(fetchImpl, desk.assignmentsPath, 20000, ref),
      notes: await core.loadOptional(fetchImpl, desk.notesPath, 20000, ref),
      deskSources: await load(desk.sources || [], 80000),
      sharedSources: await load(planner.sources || roster.sharedSources || [], planner.maxSourceChars || 160000),
      now: new Date(),
    };
    const parts = core.contextParts(ctx);
    parts.push('', TASK, '', '## The question', question);
    const messages = [{ role: 'system', content: core.systemPrompt(ctx) }, { role: 'user', content: parts.join('\n') }];
    const model = planner.model || roster.defaultModel;
    const out = await core.callModel(fetchImpl, { token, model, messages, maxTokens: 12000, timeoutMs: 240000, deskId: `${desk.id}:ask` });
    let answer = '';
    try { answer = String(JSON.parse(out.text).answer || ''); } catch { answer = out.text; }
    res.status(200).json({ desk: desk.id, name: desk.name, commit: ref, model, usage: out.usage, answer });
  } catch (e) {
    res.status(502).json({ error: String(e.message || e).slice(0, 300) });
  }
}

module.exports = handler;
module.exports.protectedHost = protectedHost;
