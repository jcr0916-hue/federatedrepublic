// Vercel Serverless Function: the desk editor's daily triage, called by the
// newsroom-triage schedule after the desks have filed. Bearer CRON_SECRET only.
const { runTriage } = require('./_newsroom-triage.js');

module.exports = async function handler(req, res) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.authorization !== `Bearer ${secret}`) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  try {
    const out = await runTriage({ dryRun: req.query?.dry === '1' });
    console.log(JSON.stringify({ triage: out }));
    res.status(out.status === 'failed' ? 500 : 200).json(out);
  } catch (e) {
    console.log(JSON.stringify({ triage: { status: 'failed', error: String(e.message || e).slice(0, 300) } }));
    res.status(500).json({ status: 'failed', error: String(e.message || e).slice(0, 300) });
  }
};
