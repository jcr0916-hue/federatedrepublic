const workers = {
  issuer: "newsroom-editor-isolated-issuer-20261111",
  gateway: "newsroom-editor-isolated-gateway-20261111",
} as const;

const stageOneObservability = {
  enabled: true,
  head_sampling_rate: 1,
  redact_query_string: true,
  logs: { enabled: true, head_sampling_rate: 1, invocation_logs: false, persist: true, destinations: [] },
  traces: { enabled: false, head_sampling_rate: 1, persist: true, destinations: [] },
} as const;

type CloudflareRequest = (options: {
  method: "GET" | "PATCH";
  path: string;
  contentType?: "application/merge-patch+json";
  body?: { observability: typeof stageOneObservability };
}) => Promise<unknown>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeDestinations(observability: unknown): unknown {
  if (!isRecord(observability)) return observability;
  const normalized = { ...observability };
  for (const section of ["logs", "traces"]) {
    const settings = observability[section];
    // Cloudflare can omit these two arrays when they are empty.
    if (isRecord(settings) && !Object.hasOwn(settings, "destinations")) {
      normalized[section] = { ...settings, destinations: [] };
    }
  }
  return normalized;
}

function settingsJson(value: unknown): string | undefined {
  return JSON.stringify(normalizeDestinations(value), (_key, item: unknown) =>
    isRecord(item) ? Object.fromEntries(Object.keys(item).sort().map(key => [key, item[key]])) : item);
}

export function assertObservabilitySettings(actual: unknown, expected: unknown, source: string): void {
  if (settingsJson(actual) !== settingsJson(expected)) {
    throw new Error(`${source} observability settings mismatch`);
  }
}

function workerResult(response: unknown, name: string, method: "GET" | "PATCH") {
  if (!isRecord(response) || response.success !== true ||
      !isRecord(response.result) || response.result.name !== name) {
    throw new Error(`${method} did not confirm Worker ${name}`);
  }
  return response.result;
}

export async function verifyStageOneLogging(
  request: CloudflareRequest,
  accountId: string,
  role: keyof typeof workers,
  mode: "verify" | "apply" = "verify",
): Promise<void> {
  if (!Object.hasOwn(workers, role)) throw new Error("Expected an isolated Stage 1 issuer or gateway");
  const name = workers[role];
  const path = `/accounts/${encodeURIComponent(accountId)}/workers/workers/${name}`;
  const readClosedWorker = async () => {
    const worker = workerResult(await request({ method: "GET", path }), name, "GET");
    const ingress = worker.subdomain;
    if (!isRecord(ingress) || ingress.enabled !== false || ingress.previews_enabled !== false) {
      throw new Error(`GET did not confirm closed public and preview ingress for ${name}`);
    }
    return worker;
  };

  if (mode === "apply") {
    await readClosedWorker();
    const updated = workerResult(await request({
      method: "PATCH",
      path,
      contentType: "application/merge-patch+json",
      body: { observability: stageOneObservability },
    }), name, "PATCH");
    assertObservabilitySettings(updated.observability, stageOneObservability, `${name} PATCH`);
  }
  const effective = await readClosedWorker();
  assertObservabilitySettings(effective.observability, stageOneObservability, `${name} GET`);
}
