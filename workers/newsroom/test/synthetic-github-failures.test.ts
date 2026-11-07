import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { build } from "esbuild";
import { Miniflare, convertV4MiniflareOptions, type Request as LocalRequest } from "miniflare";

const ORIGIN = "https://synthetic.newsroom.invalid";
const VERIFIER = "pkce-verifier-0123456789-ABCDEFGHIJKLMNOPQRSTUVWXYZ-abcdefgh";
const CHALLENGE = createHash("sha256").update(VERIFIER).digest("base64url");
const STATE = "a".repeat(64);
const redirect = "https://chatgpt.invalid/oauth/callback";

describe("synthetic GitHub callback failure paths (local-only)", () => {
  it("fails closed on cancellations, duplicate parameters, invalid responses and upstream errors", async () => {
    let tokenCalls = 0, userCalls = 0;
    const compiled = await build({
      entryPoints: ["prototype/synthetic-browser-fixture.ts"], bundle: true,
      platform: "neutral", format: "esm", target: "es2023",
      mainFields: ["module", "main"], external: ["cloudflare:workers"],
      write: false, logLevel: "silent",
    });
    const mf = new Miniflare(convertV4MiniflareOptions({
      modules: true, script: compiled.outputFiles[0].text,
      compatibilityDate: "2026-10-01",
      durableObjects: { SYNTHETIC_GRANTS: { className: "SyntheticOAuthGrant", useSQLite: true } },
      serviceBindings: {
        GITHUB: async (req: LocalRequest) => {
          const u = new URL(req.url);
          if (u.href === "https://github.com/login/oauth/access_token") {
            tokenCalls++;
            const form = new URLSearchParams(await req.text());
            if (!form.get("code_verifier") || form.get("redirect_uri") !== ORIGIN + "/oauth/callback")
              return Response.json({ error: "bad_pkce" }, { status: 400 });
            const code = form.get("code");
            if (code === "transport-fail") throw new Error("synthetic upstream failure");
            if (code === "bad-status") return Response.json({ error: "bad_gateway" }, { status: 502 });
            if (code === "invalid-json") return new Response("{", { status: 200 });
            if (code === "missing-token") return Response.json({ token_type: "bearer" });
            if (code === "permission-scope") return Response.json({ access_token: "mock-valid", scope: "repo" });
            if (code === "incorrect-type") return Response.json({ access_token: "mock-valid", token_type: "mac" });
            if (code === "wrong-user" || code === "invalid-user-json" || code === "user-status")
              return Response.json({ access_token: "mock-" + code, token_type: "bearer", scope: "" });
            return Response.json({ access_token: "mock-valid", token_type: "bearer", scope: "" });
          }
          if (u.href === "https://api.github.com/user") {
            userCalls++;
            const auth = req.headers.get("authorization");
            if (auth === "Bearer mock-invalid-user-json") return new Response("{", { status: 200 });
            if (auth === "Bearer mock-user-status") return Response.json({ error: "offline" }, { status: 503 });
            if (auth === "Bearer mock-wrong-user") return Response.json({ id: "synthetic-other-user" });
            if (auth === "Bearer mock-valid") return Response.json({ id: "synthetic-editor-12345" });
          }
          return new Response(null, { status: 403 });
        },
      },
      outboundService: () => new Response(null, { status: 502 }),
    }));
    try {
      const prepare = async (grant: string) => {
        const url = new URL(ORIGIN + "/authorize");
        url.search = new URLSearchParams({
          grant, state: STATE, client_id: "synthetic-newsroom-editor",
          scope: "newsroom:read", resource: ORIGIN + "/mcp",
          redirect_uri: redirect, code_challenge: CHALLENGE, code_challenge_method: "S256",
        }).toString();
        const page = await mf.dispatchFetch(url.toString());
        assert.equal(page.status, 200, await page.clone().text());
        const cookie = page.headers.get("set-cookie")!.split(";")[0];
        const approved = await mf.dispatchFetch(ORIGIN + "/consent?" +
          new URLSearchParams({ grant, state: STATE }), {
          method: "POST", redirect: "manual",
          headers: { Cookie: cookie, Origin: ORIGIN,
            "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ decision: "approve" }),
        });
        assert.equal(approved.status, 302, await approved.clone().text());
        const github = new URL(approved.headers.get("location")!);
        assert.equal(github.searchParams.get("code_challenge_method"), "S256");
        assert.notEqual(github.searchParams.get("state"), STATE);
        return { cookie, state: github.searchParams.get("state")! };
      };
      const callback = (grant: string, cookie: string, query: URLSearchParams) =>
        mf.dispatchFetch(ORIGIN + "/oauth/callback?" +
          new URLSearchParams({ grant }).toString() + "&" + query.toString(), {
          redirect: "manual", headers: { Cookie: cookie },
        });
      const params = (state: string, code: string) => new URLSearchParams({ state, code });
      const benign = await prepare("malformed");
      for (const query of [
        new URLSearchParams({ state: benign.state, error: "access_denied" }),
        new URLSearchParams({ state: benign.state, error: "access_denied", code: "good" }),
        new URLSearchParams({ state: benign.state, code: "good", error_description: "cancelled" }),
        new URLSearchParams({ state: benign.state, code: "good", extra: "x" }),
        new URLSearchParams({ state: benign.state, code: "good", grant: "malformed" }),
        new URLSearchParams({ state: benign.state, code: "good", code2: "evil" }),
      ]) {
        assert.equal((await callback("malformed", benign.cookie, query)).status, 403);
      }
      const duplicateState = params(benign.state, "good"); duplicateState.append("state", "b".repeat(64));
      assert.equal((await callback("malformed", benign.cookie, duplicateState)).status, 403);
      const duplicateCode = params(benign.state, "good"); duplicateCode.append("code", "evil");
      assert.equal((await callback("malformed", benign.cookie, duplicateCode)).status, 403);
      assert.equal(tokenCalls, 0);
      // Bad callback syntax must not consume the valid pending authorization.
      assert.equal((await callback("malformed", benign.cookie, params(benign.state, "good"))).status, 302);
      assert.equal(tokenCalls, 1);

      const failures: Array<[string, number]> = [
        ["transport-fail", 502], ["bad-status", 403],
        ["invalid-json", 502], ["missing-token", 403],
        ["permission-scope", 403], ["incorrect-type", 403],
        ["wrong-user", 403], ["invalid-user-json", 502], ["user-status", 403],
      ];
      for (const [scenario, expectedStatus] of failures) {
        const pending = await prepare(scenario);
        const first = await callback(scenario, pending.cookie, params(pending.state, scenario));
        assert.equal(first.status, expectedStatus, scenario + ": " + await first.clone().text());
        assert.equal(first.headers.get("location"), null, scenario);
        const before = tokenCalls;
        assert.equal((await callback(scenario, pending.cookie, params(pending.state, scenario))).status, 403);
        assert.equal(tokenCalls, before, "replay after upstream failure must not contact GitHub");
      }
      assert.ok(userCalls >= 3);
    } finally {
      await mf.dispose();
    }
  });
});
