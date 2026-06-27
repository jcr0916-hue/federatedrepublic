module.exports = async (req, res) => {
  res.status(200).json({
    ok: true,
    hasApiKey: !!process.env.ANTHROPIC_API_KEY,
    keyPrefix: process.env.ANTHROPIC_API_KEY
      ? process.env.ANTHROPIC_API_KEY.substring(0, 12) + '...'
      : 'NOT SET',
    node: process.version,
    method: req.method,
  });
};
