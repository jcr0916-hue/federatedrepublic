import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { build } from "esbuild";
import { Miniflare, convertV4MiniflareOptions, type Request as LocalRequest } from "miniflare";

const ORIGIN = "https://synthetic.newsroom.invalid";
const CLIENT = "synthetic-newsroom-editor";
const REDIRECT = "https://chatgpt.invalid/oauth/callback";
const VERIFIER = "pkce-verifier-0123456789-ABCDEFGHIJKLMNOPQRSTUVWXYZ-abcdefgh";
const CHALLENGE = createHash("sha256").update(VERIFIER).digest("base64url");
const STATE = "a".repeat(64);

describe("browser cookie and mocked GitHub callback fixture (never deploy)", () => {
  it("binds authorization to HttpOnly cookie, Origin, OAuth state and editor identity", async () => {
    let tokenCalls = 0, userCalls = 0;
    const built = await build({
      entryPoints: ["prototype/synthetic-browser-fixture.ts"], bundle: true,
      format: "esm", platform: "neutral", target: "es2023",
      mainFields: ["module", "main"], external: ["cloudflare:workers"],
      write: false, logLevel: "silent",
    });
    const mf = new Miniflare(convertV4MiniflareOptions({
      modules: true, script: built.outputFiles[0].text,
      compatibilityDate: "2026-10-01",
      durableObjects: { SYNTHETIC_GRANTS: { className: "SyntheticOAuthGrant", useSQLite: true } },
      serviceBindings: {
        GITHUB: async (request: LocalRequest) => {
          const url = new URL(request.url);
          if (url.href === "https://github.com/login/oauth/access_token" && request.method === "POST") {
            tokenCalls++;
            const form = new URLSearchParams(await request.text());
            if (form.get("client_id") !== "synthetic-github-client") return Response.json({ error: "bad_client" }, { status: 403 });
            const upstream = form.get("code");
            if (upstream !== "synthetic-approved-github-code" && upstream !== "synthetic-other-user-code")
              return Response.json({ error: "invalid_code" }, { status: 403 });
            return Response.json({ access_token: upstream === "synthetic-approved-github-code"
              ? "synthetic-upstream-allowed" : "synthetic-upstream-other" });
          }
          if (url.href === "https://api.github.com/user" && request.method === "GET") {
            userCalls++;
            const auth = request.headers.get("authorization");
            if (auth === "Bearer synthetic-upstream-allowed") return Response.json({ id: "synthetic-editor-12345" });
            if (auth === "Bearer synthetic-upstream-other") return Response.json({ id: "synthetic-other-user" });
          }
          return new Response(null, { status: 403 });
        },
      },
      outboundService: () => new Response(null, { status: 502 }),
    }));
    try {
      const authorize = async (grant: string, state = STATE) => {
        const url = new URL(ORIGIN + "/authorize");
        url.search = new URLSearchParams({
          grant, state, client_id: CLIENT, scope: "newsroom:read",
          resource: ORIGIN + "/mcp", redirect_uri: REDIRECT,
          code_challenge: CHALLENGE, code_challenge_method: "S256",
        }).toString();
        return mf.dispatchFetch(url.toString(), { redirect: "manual" });
      };
      const consent = (grant: string, state: string, cookie: string | undefined,
        origin = ORIGIN, decision = "approve") => mf.dispatchFetch(
        ORIGIN + "/consent?" + new URLSearchParams({ grant, state }),
        { method: "POST", redirect: "manual", headers: {
          "Content-Type": "application/x-www-form-urlencoded", Origin: origin,
          ...(cookie ? { Cookie: cookie } : {}),
        }, body: new URLSearchParams({ decision }) },
      );
      const callback = (grant: string, state: string, cookie: string | undefined,
        upstreamCode = "synthetic-approved-github-code") => mf.dispatchFetch(
        ORIGIN + "/oauth/callback?" + new URLSearchParams({ grant, state, code: upstreamCode }),
        { redirect: "manual", headers: cookie ? { Cookie: cookie } : {} },
      );
      const first = await authorize("editor-a");
      assert.equal(first.status, 200, await first.clone().text());
      const cookie = first.headers.get("set-cookie")!;
      assert.match(cookie, /^__Host-newsroom-consent=[0-9a-f]{64}; Path=\/; Secure; HttpOnly; SameSite=Lax; Max-Age=300$/);
      assert.match(first.headers.get("content-security-policy")!, /form-action 'self'/);
      assert.equal(first.headers.get("referrer-policy"), "origin");
      const value = cookie.split(";")[0];
      const form = await first.text();
      assert.ok(form.includes("state=" + STATE));
      assert.ok(!form.includes(value.split("=")[1]));

      assert.equal((await consent("editor-a", STATE, undefined)).status, 403);
      assert.equal((await consent("editor-a", STATE, value, "https://attacker.invalid")).status, 403);
      assert.equal((await consent("editor-a", STATE, "__Host-newsroom-consent=" + "f".repeat(64))).status, 403,
        "Swapped session cookie must fail before redirecting to GitHub");
      // In the attacker's swapped-cookie request, the callback still cannot pass.
      assert.equal((await callback("editor-a", STATE, "__Host-newsroom-consent=" + "f".repeat(64))).status, 403);
      assert.equal(tokenCalls, 0);
      const consentOK = await consent("editor-a", STATE, value);
      assert.equal(consentOK.status, 302);
      assert.equal(new URL(consentOK.headers.get("location")!).hostname, "github.com");
      assert.equal(new URL(consentOK.headers.get("location")!).searchParams.get("state"), STATE);
      assert.equal((await callback("editor-a", STATE, undefined)).status, 403);
      assert.equal((await callback("editor-a", "b".repeat(64), value)).status, 403);
      assert.equal((await callback("editor-a", STATE, value, "synthetic-other-user-code")).status, 403);
      const good = await callback("editor-a", STATE, value);
      assert.equal(good.status, 302, await good.clone().text());
      assert.match(good.headers.get("set-cookie")!, /Max-Age=0/);
      const destination = new URL(good.headers.get("location")!);
      assert.equal(destination.origin, "https://chatgpt.invalid");
      assert.equal(destination.searchParams.get("state"), STATE);
      assert.match(destination.searchParams.get("code")!, /^[0-9a-f]{64}$/);
      assert.equal((await callback("editor-a", STATE, value)).status, 403);
      assert.equal((await authorize("editor-a")).status, 400);
      assert.equal(tokenCalls, 2);
      assert.equal(userCalls, 2);

      const second = await authorize("editor-b", "c".repeat(64));
      assert.equal(second.status, 200);
      const secondCookie = second.headers.get("set-cookie")!.split(";")[0];
      assert.equal((await callback("editor-b", "c".repeat(64), value)).status, 403);
      assert.equal((await consent("editor-b", "c".repeat(64), secondCookie, ORIGIN, "deny")).status, 403);
      assert.equal((await callback("editor-b", "c".repeat(64), secondCookie)).status, 403);
    } finally {
      await mf.dispose();
    }
  });
});
