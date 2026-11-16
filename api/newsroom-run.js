// Vercel Serverless Function: scheduled Torenthia newsroom desk runs.
// Triggered by the Vercel schedule `newsroom-daily` (see vercel.json). Vercel sends
// `Authorization: Bearer $CRON_SECRET`; any other caller is refused.
// Optional query: ?desk=<id> runs one enabled desk regardless of day;
// ?dry=1 builds the prompts without calling the model or the inbox.

const { runNewsroom } = require('./_newsroom-core.js');

module.exports = async (req, res) => {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.authorization !== `Bearer ${secret}`) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const q = req.query || {};
  const only = typeof q.desk === 'string' ? q.desk.slice(0, 40) : '';
  const dryRun = q.dry === '1';
  try {
    const result = await runNewsroom({ only, dryRun });
    const failed = result.results.filter((r) => r.status === 'failed');
    console.log(JSON.stringify({ newsroom: result.results.map(({ desk, status, id, reason, error, usage }) => ({ desk, status, id, reason, error, usage })), commit: result.commit }));
    // Any failed desk marks the whole run as an error, so it shows in the schedule's error rate and history.
    res.status(failed.length ? 500 : 200).json(result);
  } catch (e) {
    console.error('newsroom run failed', e);
    res.status(500).json({ error: String(e.message || e).slice(0, 300) });
  }
};
