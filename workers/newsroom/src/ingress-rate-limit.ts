/** Optional-at-build, mandatory-at-runtime local ingress rate-limit binding.
 * Cloudflare's binding is approximate and per-location; NOT a global abuse control.
 * Source identity relies on the edge-owned CF-Connecting-IP in direct requests;
 * upstream Worker subrequests require separate edge/WAF protections.
 */
export type IngressRateLimiter = { limit(input: { key: string }): Promise<{ success: boolean }> };

export async function requireIngressBudget(
  request: Request, limiter: IngressRateLimiter | undefined, route: "authorize" | "mcp" | "callback" | "consent" | "token" | "revoke",
): Promise<Response | null> {
  // Missing/failed deployment binding must never silently turn protection off.
  if (!limiter || typeof limiter.limit !== "function")
    return Response.json({ error: "ingress_limit_unavailable" }, { status: 503 });
  const address = request.headers.get("CF-Connecting-IP");
  // Never use caller-controlled X-Forwarded-For / X-Real-IP or raw token IDs.
  // Unknown source is a single conservative shared bucket, not an unlimited bypass.
  const source = address && address.length <= 64 && /^[0-9a-fA-F:.]+$/.test(address)
    ? address.toLowerCase() : "unattributed";
  try {
    const decision = await limiter.limit({ key: route + ":" + source });
    if (decision?.success === true) return null;
    if (decision?.success === false)
      return Response.json({ error: "rate_limited" },
        { status: 429, headers: { "Retry-After": "10", "Cache-Control": "no-store" } });
    return Response.json({ error: "ingress_limit_unavailable" }, { status: 503 });
  } catch {
    return Response.json({ error: "ingress_limit_unavailable" }, { status: 503 });
  }
}
