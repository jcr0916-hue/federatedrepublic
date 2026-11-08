import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { requireIngressBudget, type IngressRateLimiter } from "../src/ingress-rate-limit.ts";
import { pairedRuntime, RESOURCE } from "./candidate-harness.ts";

const req = (ip?: string, extra: Record<string, string> = {}) => new Request(RESOURCE, {
  headers: { ...(ip ? { "CF-Connecting-IP": ip } : {}), ...extra },
});

describe("fail-closed ingress rate-limit behavior", () => {
  it("rejects missing or broken bindings before expensive issuer introspection", async () => {
    assert.equal((await requireIngressBudget(req(), undefined, "mcp"))?.status, 503);
    assert.equal((await requireIngressBudget(req(), { limit: async () => { throw new Error("down"); } }, "mcp"))?.status, 503);
    assert.equal((await requireIngressBudget(req(), { limit: async () => ({ success: false }) }, "mcp"))?.status, 429);
  });

  it("keys by canonical source/route, not caller-controlled forwarding headers or bearer identity", async () => {
    const keys: string[] = [];
    const limiter: IngressRateLimiter = { limit: async ({ key }) => { keys.push(key); return { success: true }; } };
    assert.equal(await requireIngressBudget(req("2001:DB8::1", { "X-Forwarded-For": "6.6.6.6" }), limiter, "mcp"), null);
    assert.equal(await requireIngressBudget(req("2001:db8::1", { "X-Real-IP": "7.7.7.7" }), limiter, "mcp"), null);
    assert.equal(await requireIngressBudget(req(), limiter, "mcp"), null);
    assert.equal(await requireIngressBudget(req("not-a-trusted-ip"), limiter, "authorize"), null);
    assert.deepEqual(keys, ["mcp:2001:db8::1", "mcp:2001:db8::1", "mcp:unattributed", "authorize:unattributed"]);
  });

  it("prevents local excessive MCP traffic from spending the global introspection quota", async () => {
    const f = await pairedRuntime({ resourceIngressLimit: 2 });
    try {
      const token = await f.tokens();
      const forged = "nr1a." + "a".repeat(64) + "." + "b".repeat(64);
      const statuses: number[] = [];
      for (let i = 0; i < 30; i++) {
        const response = await f.rpc(forged, "ping");
        statuses.push(response.status);
        await response.arrayBuffer();
        if (response.status === 429) break;
      }
      assert.ok(statuses.includes(429), "local rate binding must reject abusive traffic");
      assert.ok(statuses.every(s => [401, 429].includes(s)), "forged tokens cannot authorize");
      // The limiter intentionally also protects legitimate callers sharing an
      // IP; operational WAF and routing policy must account for this tradeoff.
      const response = await f.rpc(token.access_token, "ping");
      assert.equal(response.status, 429);
    } finally { await f.mf.dispose(); }
  });
});
