/** Allowlisted low-cardinality telemetry. Never pass requests, errors, IDs,
 * headers, URL strings, tokens, content, or arbitrary labels to a sink. */
const SERVICES = ["issuer", "resource", "guard"] as const;
const EVENTS = ["authentication_failure", "request_rejected", "rate_limit_exhausted", "service_failure",
  "challenge_rejected", "refresh_failed", "refresh_succeeded", "revocation_failed", "revocation_succeeded",
  "storage_failure", "containment_changed", "containment_stale"] as const;
const ROUTES = ["authorize", "callback", "consent", "token", "introspect", "revoke", "mcp", "other", "internal"] as const;
type Service = typeof SERVICES[number];
type Event = typeof EVENTS[number];
type Route = typeof ROUTES[number];
export function securityEvent(service: Service, event: Event, route: Route, status: number, sampleRate = 1): void {
  // Runtime allowlist also protects against a future untyped/JavaScript caller.
  if (!SERVICES.includes(service) || !EVENTS.includes(event) || !ROUTES.includes(route) ||
      !Number.isInteger(status) || status < 100 || status > 599 || ![1, 0.01].includes(sampleRate)) return;
  if (sampleRate < 1 && crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32 >= sampleRate) return;
  console.log(JSON.stringify({ schema: "newsroom.security.v1", service, event, route, status, sampleRate }));
}
export function observeResponse(service: "issuer" | "resource", path: string, status: number): void {
  if (status < 400) return;
  const route: Route = ({ "/authorize": "authorize", "/oauth/callback": "callback", "/consent": "consent",
    "/token": "token", "/introspect": "introspect", "/revoke": "revoke", "/mcp": "mcp" } as Record<string, Route>)[path] ?? "other";
  const event: Event = status === 429 ? "rate_limit_exhausted" : status >= 500 ? "service_failure"
    : status === 401 ? "authentication_failure" : "request_rejected";
  securityEvent(service, event, route, status, status < 500 ? 0.01 : 1);
  if (route === "revoke") securityEvent(service, "revocation_failed", route, status, status < 500 ? 0.01 : 1);
}
