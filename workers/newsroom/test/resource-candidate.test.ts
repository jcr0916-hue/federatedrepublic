import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Response as LocalResponse } from "miniflare";
import { pairedRuntime, ISSUER, RESOURCE, CLIENT, VALIDATOR, CLIENT_SECRET, VALIDATOR_SECRET, basic } from "./candidate-harness.ts";

describe("paired standalone issuer and read-only newsroom resource (local only)", () => {
  it("publishes resource discovery and challenges missing or malformed credentials", async () => {
    const f = await pairedRuntime();
    try {
      const url = new URL(RESOURCE);
      const metadata = await f.resource.fetch(url.origin + "/.well-known/oauth-protected-resource/mcp");
      assert.deepEqual(await metadata.json(), { resource: RESOURCE, authorization_servers: [ISSUER],
        scopes_supported: ["newsroom:read"], bearer_methods_supported: ["header"] });
      const anonymous = await f.rpc("", "tools/list");
      assert.equal(anonymous.status, 401);
      assert.match(anonymous.headers.get("WWW-Authenticate")!, /resource_metadata=.*oauth-protected-resource\/mcp/);
      assert.equal((await f.rpc("invalid", "tools/list")).status, 401);
      assert.equal((await f.resource.fetch(url.origin + "/v1/list")).status, 404);
    } finally { await f.mf.dispose(); }
  });

  it("supports authenticated MCP 2026 server/discover with only read-only capabilities", async () => {
    const f = await pairedRuntime();
    try {
      assert.equal((await f.rpc("", "server/discover")).status, 401);
      const token = await f.tokens();
      const discovered = await f.rpc(token.access_token, "server/discover", {
        _meta: { "io.modelcontextprotocol/protocolVersion": "2026-07-28" },
      });
      assert.equal(discovered.status, 200);
      const body = await discovered.json() as {
        jsonrpc: string; id: number;
        result: { resultType: string; supportedVersions: string[];
          capabilities: Record<string, unknown>; ttlMs: number; cacheScope: string };
      };
      assert.equal(body.jsonrpc, "2.0");
      assert.equal(body.id, 1);
      assert.equal(body.result.resultType, "complete");
      assert.deepEqual(body.result.supportedVersions, ["2026-07-28"]);
      assert.deepEqual(body.result.capabilities, { tools: {} });
      assert.equal(body.result.cacheScope, "private");
      assert.equal(body.result.ttlMs, 0);
      assert.equal((await f.rpc(token.access_token, "resources/list")).status, 403);
      assert.equal((await f.rpc(token.access_token, "prompts/list")).status, 403);
    } finally { await f.mf.dispose(); }
  });

  it("uses separate resource credentials and prevents OAuth-client introspection or resource token issuance", async () => {
    const f = await pairedRuntime();
    try {
      const token = await f.tokens();
      const fields = { token: token.access_token, token_type_hint: "access_token" };
      assert.equal((await f.clientPost("/introspect", fields)).status, 401);
      const inspected = await f.clientPost("/introspect", fields, basic(VALIDATOR, VALIDATOR_SECRET));
      assert.equal(inspected.status, 200);
      const result = await inspected.json() as Record<string, unknown>;
      assert.equal(result.iss, ISSUER); assert.equal(result.client_id, CLIENT); assert.equal(result.aud, RESOURCE);
      assert.equal((await f.clientPost("/token", { grant_type: "refresh_token", refresh_token: token.refresh_token },
        basic(VALIDATOR, VALIDATOR_SECRET))).status, 401);
      assert.equal((await f.clientPost("/revoke", { token: token.refresh_token }, basic(VALIDATOR, VALIDATOR_SECRET))).status, 401);
      assert.equal((await f.rpc(token.access_token, "ping")).status, 200);
    } finally { await f.mf.dispose(); }
  });

  it("lists/reads isolated R2 data and exposes only the two read tools with OAuth metadata", async () => {
    const f = await pairedRuntime();
    try {
      const key = "submissions/korda/2026-11-07/11111111-1111-4111-8111-111111111111.json";
      const record = { id: "11111111-1111-4111-8111-111111111111", key, desk: "korda", kind: "report",
        title: "Synthetic read fixture", summary: "Local only", body: "Synthetic unpublished content",
        status: "PROPOSED", nonCanonical: true, submittedAt: "2026-11-07T00:00:00Z" };
      await f.bucket.put(key, JSON.stringify(record));
      const token = await f.tokens();
      const tools = await (await f.rpc(token.access_token, "tools/list")).json() as {
        result: { tools: { name: string; annotations: { readOnlyHint: boolean }; securitySchemes: unknown }[] } };
      assert.deepEqual(tools.result.tools.map(x => x.name).sort(), ["newsroom_list", "newsroom_read"]);
      for (const tool of tools.result.tools) {
        assert.equal(tool.annotations.readOnlyHint, true);
        assert.deepEqual(tool.securitySchemes, [{ type: "oauth2", scopes: ["newsroom:read"] }]);
      }
      const read = await f.rpc(token.access_token, "tools/call", { name: "newsroom_read", arguments: { key } });
      const body = await read.json() as { result: { content: { text: string }[] } };
      assert.deepEqual(JSON.parse(body.result.content[0].text), record);
      const listed = await f.rpc(token.access_token, "tools/call", { name: "newsroom_list", arguments: { desk: "korda" } });
      assert.equal(listed.status, 200);
      assert.ok((await listed.text()).includes("Synthetic read fixture"));
    } finally { await f.mf.dispose(); }
  });

  it("rejects every write/unknown tool and forged arguments without changing isolated objects", async () => {
    const f = await pairedRuntime();
    try {
      const token = await f.tokens();
      for (const name of ["newsroom_submit", "newsroom_review", "publish", "admin", "unknown"])
        assert.equal((await f.rpc(token.access_token, "tools/call", { name, arguments: { title: "forged" } })).status, 403);
      assert.equal((await f.rpc(token.access_token, "tools/call", {
        name: "newsroom_list", arguments: { editor: true, role: "owner" },
      })).status, 400);
      assert.equal((await f.rpc(token.access_token, "resources/read", {})).status, 403);
      assert.equal((await f.bucket.list()).objects.length, 0);
    } finally { await f.mf.dispose(); }
  });

  it("rejects old access after refresh and rejects the successor on the first request after revocation", async () => {
    const f = await pairedRuntime();
    try {
      const token = await f.tokens();
      assert.equal((await f.rpc(token.access_token, "ping")).status, 200);
      const rotated = await f.clientPost("/token", { grant_type: "refresh_token", refresh_token: token.refresh_token });
      const next = await rotated.json() as { access_token: string; refresh_token: string };
      assert.equal(rotated.status, 200);
      assert.equal((await f.rpc(token.access_token, "ping")).status, 401);
      assert.equal((await f.rpc(next.access_token, "ping")).status, 200);
      assert.equal((await f.clientPost("/revoke", { token: next.refresh_token })).status, 200);
      assert.equal((await f.rpc(next.access_token, "ping")).status, 401, "no cached active decision");
      assert.equal((await f.clientPost("/token", { grant_type: "refresh_token", refresh_token: next.refresh_token })).status, 400);
    } finally { await f.mf.dispose(); }
  });

  it("fails closed if the resource credential is rotated or misconfigured", async () => {
    const f = await pairedRuntime({ resourceBindings: { RESOURCE_VALIDATOR_SECRET: CLIENT_SECRET } });
    try {
      const token = await f.tokens();
      const result = await f.rpc(token.access_token, "ping");
      assert.equal(result.status, 503);
      const raw = await result.text();
      assert.ok(!raw.includes(CLIENT_SECRET) && !raw.includes(VALIDATOR_SECRET) && !raw.includes(token.access_token));
    } finally { await f.mf.dispose(); }
  });

  it("rejects a wrong issuer, audience, client, scope, expiry or malformed authoritative response", async () => {
    const valid = { active: true, iss: ISSUER, aud: RESOURCE, client_id: CLIENT, scope: "newsroom:read",
      exp: Math.floor(Date.now() / 1000) + 900 };
    const values: Record<string, unknown>[] = [
      { ...valid, iss: "https://evil.invalid" }, { ...valid, aud: "https://evil.invalid/mcp" },
      { ...valid, client_id: "other" }, { ...valid, scope: "newsroom:read newsroom:review" },
      { ...valid, exp: 1 }, { ...valid, exp: "9999999999" }, { ...valid, active: "true" },
    ];
    for (const value of values) {
      const f = await pairedRuntime({ introspection: () => LocalResponse.json(value) });
      try { assert.equal((await f.rpc("nr1a." + "a".repeat(64) + "." + "b".repeat(64), "ping")).status, 401); }
      finally { await f.mf.dispose(); }
    }
    for (const response of [new LocalResponse("{"), new LocalResponse("x".repeat(5000)),
      new LocalResponse(null, { status: 302, headers: { Location: "https://evil.invalid" } }), new LocalResponse(null, { status: 503 })]) {
      const f = await pairedRuntime({ introspection: () => response.clone() });
      try { assert.equal((await f.rpc("nr1a." + "a".repeat(64) + "." + "b".repeat(64), "ping")).status, 503); }
      finally { await f.mf.dispose(); }
    }
  });
});
