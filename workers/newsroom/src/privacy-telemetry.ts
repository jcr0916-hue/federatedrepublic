/** Fixed-schema privacy-safe operational counters. No request data, IDs,
 * credential digests, cookies, contents, URLs or IPs are accepted.
 * Wiring requires an explicit Analytics Engine dataset in the reviewed release
 * contract. A missing binding is visible to release preflight, not an excuse
 * to enable unredacted Worker invocation logs.
 */
export type TelemetryCategory =
  | "authentication_denied" | "rate_limit_denied"
  | "issuer_unavailable" | "resource_unavailable"
  | "refresh_denied" | "revocation_failed"
  | "storage_failed" | "containment_epoch_changed";
export type TelemetrySurface = "issuer" | "resource" | "operator";
const CATEGORIES = new Set<TelemetryCategory>([
  "authentication_denied", "rate_limit_denied", "issuer_unavailable",
  "resource_unavailable", "refresh_denied", "revocation_failed",
  "storage_failed", "containment_epoch_changed",
]);
const SURFACES = new Set<TelemetrySurface>(["issuer", "resource", "operator"]);
export interface PrivacyCounterSink {
  writeDataPoint(point: { blobs: string[]; doubles: number[] }): void;
}
export interface TelemetryEnv { NEWSROOM_METRICS?: PrivacyCounterSink; }
/** Fail closed on unrecognized values; telemetry failure never authorizes work.
 * Static low-cardinality values are the entirety of the event payload.
 */
export function observe(env: TelemetryEnv, category: TelemetryCategory, surface: TelemetrySurface): void {
  if (!CATEGORIES.has(category) || !SURFACES.has(surface)) return;
  try {
    env.NEWSROOM_METRICS?.writeDataPoint({
      blobs: [category, surface], doubles: [1],
    });
  } catch { /* metrics outage must not expose request context or mutate auth */ }
}
