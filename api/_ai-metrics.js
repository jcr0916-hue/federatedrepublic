function int(value) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : 0;
}

function usageTotals(...usages) {
  return usages.filter(Boolean).reduce((out, usage) => {
    out.inputTokens += int(usage.input_tokens);
    out.outputTokens += int(usage.output_tokens);
    return out;
  }, { inputTokens:0, outputTokens:0 });
}

function annotatorMetric(data = {}) {
  const payload = {
    model: data.model || null,
    route: data.route || null,
    aiCalls: int(data.aiCalls),
    durationMs: int(data.durationMs),
    packetChars: int(data.packetChars),
    relatedCount: int(data.relatedCount),
    inputTokens: int(data.inputTokens),
    outputTokens: int(data.outputTokens),
    retried: Boolean(data.retried),
    retryKind: data.retryKind || null,
    stopReason: data.stopReason || null,
  };
  console.info('[annotator-metric]', payload);
  return payload;
}

function navigatorEfficiencyFields(data = {}) {
  return {
    durationMs: int(data.durationMs),
    inputTokens: int(data.inputTokens),
    outputTokens: int(data.outputTokens),
    completionRetried: Boolean(data.completionRetried),
  };
}

module.exports = { usageTotals, annotatorMetric, navigatorEfficiencyFields };
