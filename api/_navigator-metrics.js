const { navigatorEfficiencyFields } = require('./_ai-metrics.js');

function navigatorMetric(data = {}) {
  const payload = {
    route: data.route || 'unknown',
    aiCalls: Number.isInteger(data.aiCalls) ? data.aiCalls : 0,
    answerState: data.answerState || null,
    gateStatus: data.gateStatus || null,
    gateReason: data.gateReason || null,
    retrievalReason: data.retrievalReason || null,
    matchedCount: Number.isInteger(data.matchedCount) ? data.matchedCount : 0,
    resourceCount: Number.isInteger(data.resourceCount) ? data.resourceCount : 0,
    packetChars: Number.isInteger(data.packetChars) ? data.packetChars : 0,
    packetPrimaryCount: Number.isInteger(data.packetPrimaryCount) ? data.packetPrimaryCount : 0,
    packetRelatedCount: Number.isInteger(data.packetRelatedCount) ? data.packetRelatedCount : 0,
    shadowEnabled: Boolean(data.shadowEnabled),
    ...navigatorEfficiencyFields(data),
  };
  console.info('[navigator-route]', payload);
  return payload;
}

module.exports = { navigatorMetric };
