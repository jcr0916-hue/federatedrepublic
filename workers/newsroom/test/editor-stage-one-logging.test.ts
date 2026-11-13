import assert from "node:assert/strict";
import { it } from "node:test";
import { assertObservabilitySettings, verifyStageOneLogging } from "../acceptance/editor-stage-one-logging.ts";

const accountId = "test-account";
const workerName = "newsroom-editor-isolated-issuer-20261111";
const path = `/accounts/${accountId}/workers/workers/${workerName}`;
const settings = {
  enabled: true,
  redact_query_string: true,
  head_sampling_rate: 1,
  logs: { enabled: true, invocation_logs: false, head_sampling_rate: 1, persist: true, destinations: [] },
  traces: { enabled: false, head_sampling_rate: 1, persist: true, destinations: [] },
};
const { destinations: _logs, ...logsWithoutDestinations } = settings.logs;
const { destinations: _traces, ...tracesWithoutDestinations } = settings.traces;
const withoutDestinations = { ...settings, logs: logsWithoutDestinations, traces: tracesWithoutDestinations };

function result(observability: unknown, subdomain: unknown = { enabled: false, previews_enabled: false }) {
  return { success: true, result: { name: workerName, subdomain, observability } };
}

function mockRequests(...responses: unknown[]) {
  const calls: Parameters<Parameters<typeof verifyStageOneLogging>[0]>[0][] = [];
  const request: Parameters<typeof verifyStageOneLogging>[0] = async options => {
    assert.ok(calls.length < responses.length, "unexpected Cloudflare request");
    calls.push(options);
    return responses[calls.length - 1];
  };
  return { request, calls };
}

it("accepts a PATCH with omitted destinations and independently reads the effective controls", async () => {
  const { request, calls } = mockRequests(result(null), result(withoutDestinations), result(settings));
  await verifyStageOneLogging(request, accountId, "issuer", "apply");
  assert.deepEqual(calls, [
    { method: "GET", path },
    {
      method: "PATCH", path, contentType: "application/merge-patch+json",
      body: { observability: settings },
    },
    { method: "GET", path },
  ]);
});

it("accepts omitted or explicitly empty destinations independently on a GET", async () => {
  for (const observability of [
    settings,
    withoutDestinations,
    { ...settings, logs: logsWithoutDestinations },
    { ...settings, traces: tracesWithoutDestinations },
  ]) {
    const { request, calls } = mockRequests(result(observability));
    await verifyStageOneLogging(request, accountId, "issuer");
    assert.deepEqual(calls, [{ method: "GET", path }]);
  }
});

it("rejects nonempty and malformed destinations in either section", () => {
  for (const section of ["logs", "traces"] as const) {
    for (const destinations of [["external"], [null], null, undefined, false, "", {}]) {
      const observability = { ...settings, [section]: { ...settings[section], destinations } };
      assert.throws(() => assertObservabilitySettings(observability, settings, "GET"), /GET observability settings mismatch/);
    }
  }
});

it("rejects missing, malformed or inconsistent controls on the independent GET", async () => {
  const { enabled: _enabled, ...missingEnabled } = withoutDestinations;
  const { redact_query_string: _redact, ...missingRedaction } = withoutDestinations;
  const { enabled: _logsEnabled, ...missingLogsEnabled } = logsWithoutDestinations;
  const { invocation_logs: _invocation, ...missingInvocation } = logsWithoutDestinations;
  const { enabled: _tracesEnabled, ...missingTracesEnabled } = tracesWithoutDestinations;
  for (const observability of [
    null, missingEnabled, missingRedaction,
    { ...withoutDestinations, enabled: false },
    { ...withoutDestinations, redact_query_string: false },
    { ...withoutDestinations, redact_query_string: "true" },
    { ...withoutDestinations, logs: null },
    { ...withoutDestinations, logs: missingLogsEnabled },
    { ...withoutDestinations, logs: missingInvocation },
    { ...withoutDestinations, logs: { ...logsWithoutDestinations, enabled: false } },
    { ...withoutDestinations, logs: { ...logsWithoutDestinations, invocation_logs: true } },
    { ...withoutDestinations, logs: { ...logsWithoutDestinations, invocation_logs: "false" } },
    { ...withoutDestinations, logs: { ...logsWithoutDestinations, persist: false } },
    { ...withoutDestinations, traces: missingTracesEnabled },
    { ...withoutDestinations, traces: { ...tracesWithoutDestinations, enabled: true } },
    { ...withoutDestinations, head_sampling_rate: 0 },
    { ...withoutDestinations, agents: { enabled: true } },
  ]) {
    const { request, calls } = mockRequests(result(null), result(withoutDestinations), result(observability));
    await assert.rejects(verifyStageOneLogging(request, accountId, "issuer", "apply"), /GET observability settings mismatch/);
    assert.deepEqual(calls.map(call => call.method), ["GET", "PATCH", "GET"]);
  }
});

it("rejects a successful PATCH carrying inconsistent controls", async () => {
  const { request } = mockRequests(result(null), result({ ...settings, redact_query_string: false }));
  await assert.rejects(verifyStageOneLogging(request, accountId, "issuer", "apply"), /PATCH observability settings mismatch/);
});

it("requires successful API results and explicit closed ingress before and after a PATCH", async () => {
  for (const response of [
    { ...result(settings), success: false },
    result(settings, { enabled: true, previews_enabled: false }),
    result(settings, { enabled: false, previews_enabled: true }),
    result(settings, { enabled: false }),
  ]) {
    const before = mockRequests(response);
    await assert.rejects(verifyStageOneLogging(before.request, accountId, "issuer", "apply"), /GET did not confirm/);
    assert.deepEqual(before.calls.map(call => call.method), ["GET"]);

    const after = mockRequests(result(null), result(settings), response);
    await assert.rejects(verifyStageOneLogging(after.request, accountId, "issuer", "apply"), /GET did not confirm/);
    assert.deepEqual(after.calls.map(call => call.method), ["GET", "PATCH", "GET"]);
  }
});
