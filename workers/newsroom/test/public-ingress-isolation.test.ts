import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { pairedRuntime, CLIENT, CLIENT_SECRET, basic, ISSUER } from "./candidate-harness.ts";

describe("OAuth public ingress isolation", () => {
  it("keeps authenticated token and revoke budgets separate; invalid credentials cannot spend them", async () => {
    const f = await pairedRuntime({ issuerIngressLimit: 2 });
    try {
      const initial = await f.tokens(); // consumes one token route admission
      for (let i = 0; i < 4; i++) {
        const response = await f.clientPost("/token", {
          grant_type: "refresh_token", refresh_token: initial.refresh_token,
        }, basic(CLIENT, "incorrect-client-secret-01234567890123456789"));
        assert.equal(response.status, 401);
      }
      const first = await f.clientPost("/token", {
        grant_type: "refresh_token", refresh_token: initial.refresh_token,
      });
      assert.equal(first.status, 200);
      const refreshed = await first.json() as typeof initial;
      const denied = await f.clientPost("/token", {
        grant_type: "refresh_token", refresh_token: refreshed.refresh_token,
      });
      assert.equal(denied.status, 429);
      assert.equal(denied.headers.get("Retry-After"), "10");
      assert.equal((await f.clientPost("/revoke", { token: refreshed.refresh_token })).status, 200,
        "a token flood must not prevent emergency disconnect on the separate revoke budget");
      // Resource checking is an independent, authenticated internal route.
      assert.equal((await f.rpc(refreshed.access_token, "ping")).status, 401);
    } finally { await f.mf.dispose(); }
  });

  it("bounds callbacks before provider requests and without allowing cookie/CSRF bypass", async () => {
    const f = await pairedRuntime({ issuerIngressLimit: 2 });
    try {
      const pending = await f.start();
      for (const expected of [403, 403, 429]) {
        const response = await f.issuer.fetch(ISSUER + "/oauth/callback?" +
          new URLSearchParams({ state: pending.state, code: "synthetic-code" }), { redirect: "manual" });
        assert.equal(response.status, expected);
      }
      assert.equal(f.calls.token, 0);
      assert.equal(f.calls.user, 0);
    } finally { await f.mf.dispose(); }
  });

  it("bounds malformed consent floods independently of token issuance", async () => {
    const f = await pairedRuntime({ issuerIngressLimit: 2 });
    try {
      for (const expected of [403, 403, 429]) {
        const response = await f.issuer.fetch(ISSUER + "/consent", {
          method: "POST", headers: { Origin: ISSUER, "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ csrf: "a".repeat(64), decision: "approve" }).toString(),
        });
        assert.equal(response.status, expected);
      }
      assert.equal(f.calls.token, 0);
    } finally { await f.mf.dispose(); }
  });
});
