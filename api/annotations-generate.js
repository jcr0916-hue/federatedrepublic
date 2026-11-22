// Vercel Serverless Function: editor relay for generating stored annotations.
// Like newsroom-inbox, it answers only on *.vercel.app hosts, which the project's
// Deployment Protection limits to John's Vercel account (the editor reaches them
// through the Vercel connector). On the public custom domain it refuses everything.
// It never writes anything: it returns generated annotations for the editor to review
// and commit to annotations.json.
//   GET ?op=status                       -> counts and the list of provisions needing generation
//   GET ?op=generate&nums=2.5,2.6[&force=1] -> up to 8 annotations, each with its packet hash and lint result

const { buildContextPacket, getConstitutionData } = require('./_annotator-core.js');
const { packetHash, loadStore, generateChecked, DEFAULT_MODEL } = require('./_annotator-run.js');

const MAX_BATCH = 8;

function protectedHost(host) {
  return /^[a-z0-9-]+\.vercel\.app$/i.test(String(host || '').split(':')[0]);
}

function allNums() {
  return getConstitutionData().flatMap(a => a.provisions.map(p => p.num));
}

function normalizeNum(value) {
  const v = String(value || '').trim().replace(/^§/, '');
  return /^\d+(?:\.\d+)*(?:\.[a-z])?$/i.test(v) ? `§${v}` : null;
}

function status() {
  const store = loadStore();
  const stale = [];
  let fresh = 0;
  for (const num of allNums()) {
    const entry = (store.entries || {})[num];
    const context = buildContextPacket(num);
    if (entry && entry.text && entry.hash === packetHash(context)) fresh++;
    else stale.push(num);
  }
  return { total: allNums().length, fresh, staleCount: stale.length, stale };
}

async function generateOne(num, validNums, model) {
  const context = buildContextPacket(num);
  if (!context) return { num, error: 'Unknown provision' };
  try {
    const result = await generateChecked(context, validNums, { model });
    if (!result.ok) return { num, error: result.detail };
    return {
      num,
      hash: packetHash(context),
      text: result.annotation,
      model: result.model,
      generatedAt: new Date().toISOString(),
      words: result.words,
      issues: result.issues,
      attempts: result.attempts,
      truncated: result.truncated,
    };
  } catch (err) {
    return { num, error: String(err) };
  }
}

async function handler(req, res) {
  if (!protectedHost(req.headers.host)) return res.status(404).json({ error: 'Not found' });
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });
  const { op, nums, model } = req.query || {};

  if (op === 'status') return res.status(200).json(status());

  if (op === 'generate') {
    const list = [...new Set(String(nums || '').split(',').map(normalizeNum).filter(Boolean))];
    if (!list.length || list.length > MAX_BATCH) {
      return res.status(400).json({ error: `Pass 1-${MAX_BATCH} provision numbers in nums` });
    }
    const validNums = new Set(allNums());
    const results = await Promise.all(list.map(num => generateOne(num, validNums, model || DEFAULT_MODEL)));
    return res.status(200).json({ model: model || DEFAULT_MODEL, results });
  }

  return res.status(404).json({ error: 'Use GET ?op=status or ?op=generate&nums=2.5,2.6' });
}

module.exports = handler;
module.exports.protectedHost = protectedHost;
module.exports.normalizeNum = normalizeNum;
