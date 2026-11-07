import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { Miniflare, convertV4MiniflareOptions } from "miniflare";

const AUTH = "Basic " + Buffer.from(
  "synthetic-editor:synthetic-only-client-secret-minimum-entropy-1234567890",
).toString("base64");

describe("server-owned DO grant routing (local-only, not OAuth)", () => {
  it("routes only verified client credentials to the matching grant DO", async () => {
    const result = await build({
      entryPoints: ["prototype/issuer-boundary-fixture.ts"], bundle: true,
      platform: "neutral", format: "esm", target: "es2023",
      mainFields: ["module", "main"], external: ["cloudflare:workers"],
      write: false, logLevel: "silent",
    });
    const mf = new Miniflare(convertV4MiniflareOptions({
      modules: true, script: result.outputFiles[0].text,
      compatibilityDate: "2026-10-01",
      durableObjects: { SYNTHETIC_GRANTS: { className: "SyntheticOAuthGrant", useSQLite: true } },
    }));
    try {
      const rpc = async (path: string, input: Record<string, unknown> = {}, auth: string = AUTH) => {
        const response = await mf.dispatchFetch("https://fixture.example" + path, {
          method: "POST", headers: { Authorization: auth, "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        return { status: response.status, body: await response.json() as Record<string, any> };
      };
      assert.equal((await rpc("/issue", {}, "Basic invalid")).status, 401);
      assert.equal((await rpc("/issue", { grant: "client-pick" })).status, 400);
      assert.equal((await rpc("/issue", { clientId: "attacker" })).status, 400);
      const one = await rpc("/issue");
      const two = await rpc("/issue");
      assert.equal(one.status, 200);
      assert.equal(two.status, 200);
      const a = one.body, b = two.body;
      assert.match(a.access_token, /^nr1a\.[a-f0-9]{64}\.[a-f0-9]{64}$/);
      assert.match(a.refresh_token, /^nr1r\.[a-f0-9]{64}\.[a-f0-9]{64}$/);
      assert.notEqual(a.access_token.split(".")[1], b.access_token.split(".")[1]);
      assert.equal((await rpc("/read", { access_token: a.access_token })).status, 200);
      assert.equal((await rpc("/read", { access_token: a.refresh_token })).status, 401);
      assert.equal((await rpc("/read", { access_token: a.access_token }, "Bearer wrong")).status, 401);
      const tampered = a.access_token.slice(0, -1) +
        (a.access_token.at(-1) === "e" ? "f" : "e");
      assert.equal((await rpc("/read", { access_token: tampered })).status, 401);
      const wrongId = "nr1a." + b.access_token.split(".")[1] + "." + a.access_token.split(".")[2];
      assert.equal((await rpc("/read", { access_token: wrongId })).status, 401);
      assert.equal((await rpc("/refresh", { refresh_token: a.access_token })).status, 401);
      const rotations = await Promise.all([
        rpc("/refresh", { refresh_token: a.refresh_token }),
        rpc("/refresh", { refresh_token: a.refresh_token }),
      ]);
      assert.deepEqual(rotations.map(x => x.status).sort(), [200, 401]);
      const next = rotations.find(x => x.status === 200)!.body;
      assert.equal((await rpc("/read", { access_token: a.access_token })).status, 401);
      assert.equal((await rpc("/read", { access_token: next.access_token })).status, 200);
      assert.equal((await rpc("/read", { access_token: b.access_token })).status, 200);
      assert.equal((await rpc("/revoke", { access_token: next.access_token })).status, 200);
      assert.equal((await rpc("/read", { access_token: next.access_token })).status, 401);
      assert.equal((await rpc("/refresh", { refresh_token: next.refresh_token })).status, 401);
      assert.equal((await rpc("/read", { access_token: b.access_token })).status, 200);
    } finally { await mf.dispose(); }
  });
});
