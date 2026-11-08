import { after, before } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { Miniflare, convertV4MiniflareOptions, type Request as LocalRequest } from "miniflare";
import { build } from "esbuild";

const ORIGIN = "https://newsroom.example";
const RESOURCE = ORIGIN + "/mcp";
const REDIRECT = "https://chatgpt.com/connector/oauth/local-fixture";
const CLIENT = "chatgpt-local-fixture";
const VERIFIER = "synthetic-pkce-verifier-0123456789-ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const CHALLENGE = createHash("sha256").update(VERIFIER).digest("base64url");
const upstreamToken = "synthetic-upstream-access-token";
type Tokens = { access_token: string; refresh_token: string; expires_in: number; scope: string };
type Provision = {
  provision(): Promise<{ clientId: string; clientSecret: string }>;
  changeEditor(id: string): Promise<void>;
};

const syntheticEnv = {
  OAUTH_ISSUER: ORIGIN, CHATGPT_CLIENT_ID: CLIENT, CHATGPT_REDIRECT_URI: REDIRECT,
  EDITOR_GITHUB_USER_ID: "12345", GITHUB_CLIENT_ID: "synthetic-github-client",
  GITHUB_CLIENT_SECRET: "synthetic-github-secret",
};

const scripts: Record<string, string> = {};
const instances: Miniflare[] = [];
before(async () => {
  for (const [name, path] of Object.entries({
    fixture: "test/fixture-worker.ts", baseline: "src/legacy.js", production: "src/index.ts",
  })) {
    const result = await build({
      entryPoints: [path], bundle: true, format: "esm", platform: "neutral",
      target: "es2023", mainFields: ["module", "main"], external: ["cloudflare:workers"], write: false, logLevel: "silent",
    });
    scripts[name] = result.outputFiles[0].text;
  }
});
after(async () => { await Promise.all(instances.map(instance => instance.dispose())); });

async function instance(options: {
  identity?: number; env?: Partial<typeof syntheticEnv>;
  original?: boolean; entrypoint?: "baseline" | "production";
  overlapCodeReads?: boolean;
} = {}) {
  const calls: { token: number; identity: number } = { token: 0, identity: 0 };
  const mf = new Miniflare(convertV4MiniflareOptions({
    modules: true, script: scripts[options.entrypoint || "fixture"], compatibilityDate: "2026-10-01", kvNamespaces: ["OAUTH_KV"], r2Buckets: ["NEWSROOM"],
    bindings: {
      ...syntheticEnv, KEY_EDITOR: "synthetic-editorial-credential",
      ...Object.fromEntries(["corindal", "korda", "varek", "federal"].map(desk =>
        ["KEY_" + desk.toUpperCase(), `synthetic-${desk}-credential`])),
      TEST_ORIGINAL: options.original ? "true" : "false",
      TEST_OVERLAP_CODE_READS: options.overlapCodeReads ? "true" : "false", ...options.env,
    },
    serviceBindings: {
      GITHUB: async (request: LocalRequest) => {
        const url = new URL(request.url);
        if (url.href === "https://github.com/login/oauth/access_token" && request.method === "POST") {
          calls.token++;
          const form = new URLSearchParams(await request.text());
          if (form.get("client_id") !== syntheticEnv.GITHUB_CLIENT_ID ||
              form.get("client_secret") !== syntheticEnv.GITHUB_CLIENT_SECRET ||
              form.get("redirect_uri") !== ORIGIN + "/oauth/callback" || !form.get("code_verifier")) {
            return Response.json({ error: "invalid_request" }, { status: 400 });
          }
          return Response.json({ access_token: upstreamToken, token_type: "bearer", scope: "" });
        }
        if (url.href === "https://api.github.com/user" && request.headers.get("authorization") === "Bearer " + upstreamToken) {
          calls.identity++;
          return Response.json({ id: options.identity ?? 12345 });
        }
        return new Response(null, { status: 400 });
      },
    },
    // A test cannot accidentally talk to a live identity provider or other upstream.
    outboundService: () => new Response(null, { status: 502 }),
  }));
  instances.push(mf);
  const worker = await mf.getWorker();
  const client = options.entrypoint || options.env?.GITHUB_CLIENT_SECRET === "" ? { clientId: CLIENT, clientSecret: "unused-synthetic-secret" }
    : await (worker as unknown as Provision).provision();
  assert.equal(typeof client.clientId, "string");
  return { mf, client, calls };
}

type Fixture = Awaited<ReturnType<typeof instance>>;
type TestInit = { method?: string; headers?: Record<string, string>; body?: string | URLSearchParams };
const call = (f: Fixture, path: string, init: TestInit = {}) =>
  f.mf.dispatchFetch(ORIGIN + path, { ...init, body: init.body?.toString(), redirect: "manual" });
const cookies = (response: Awaited<ReturnType<typeof call>>) =>
  response.headers.getSetCookie().map(cookie => cookie.split(";")[0]).join("; ");

function authorizeUrl(f: Fixture, scopes = "newsroom:read", changes: Record<string, string | null | undefined> = {}) {
  const params = new URLSearchParams({
    response_type: "code", client_id: f.client.clientId, redirect_uri: REDIRECT,
    scope: scopes, state: "synthetic-client-state", resource: RESOURCE,
    code_challenge: CHALLENGE, code_challenge_method: "S256",
  });
  for (const [name, value] of Object.entries(changes)) value == null ? params.delete(name) : params.set(name, value);
  return "/authorize?" + params;
}

async function consent(f: Fixture, scopes = "newsroom:read") {
  const start = await call(f, authorizeUrl(f, scopes));
  assert.equal(start.status, 200);
  const html = await start.text();
  const handle = /name="handle" value="([^"]+)"/.exec(html)?.[1];
  assert.ok(handle);
  const approved = await call(f, "/authorize", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded", Origin: ORIGIN, Cookie: cookies(start) },
    body: new URLSearchParams({ handle, decision: "approve" }),
  });
  assert.equal(approved.status, 302);
  return { start, html, handle, approved, location: new URL(approved.headers.get("location")!) };
}

async function code(f: Fixture, scopes = "newsroom:read") {
  const consentResult = await consent(f, scopes);
  const state = consentResult.location.searchParams.get("state")!;
  const completed = await call(f, "/oauth/callback?" + new URLSearchParams({ state, code: "synthetic-github-code" }), {
    headers: { Cookie: cookies(consentResult.approved) },
  });
  return { ...consentResult, completed };
}

async function exchange(f: Fixture, authorizationCode: string, changes: Record<string, string | undefined> = {}) {
  return call(f, "/oauth/token", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code", client_id: f.client.clientId, client_secret: f.client.clientSecret,
      code: authorizationCode, redirect_uri: REDIRECT, resource: RESOURCE, code_verifier: VERIFIER,
      ...Object.fromEntries(Object.entries(changes).filter((entry): entry is [string, string] => entry[1] !== undefined)),
    }),
  });
}

async function tokens(f: Fixture, scopes = "newsroom:read") {
  const authorized = await code(f, scopes);
  assert.equal(authorized.completed.status, 302);
  const redirect = new URL(authorized.completed.headers.get("location")!);
  assert.equal(redirect.origin + redirect.pathname, REDIRECT);
  assert.equal(redirect.searchParams.get("state"), "synthetic-client-state");
  assert.equal(redirect.searchParams.get("iss"), ORIGIN);
  const response = await exchange(f, redirect.searchParams.get("code")!);
  assert.equal(response.status, 200, "valid code exchange should succeed");
  return await response.json() as Tokens;
}

const rpc = (f: Fixture, bearer: string | null, method = "tools/list", name?: string) => call(f, "/mcp", {
  method: "POST", headers: { "Content-Type": "application/json", ...(bearer ? { Authorization: "Bearer " + bearer } : {}) },
  body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, ...(name ? { params: { name, arguments: {} } } : {}) }),
});

export { ORIGIN, RESOURCE, REDIRECT, CLIENT, VERIFIER, upstreamToken, syntheticEnv, instance, call, cookies, authorizeUrl, consent, code, exchange, tokens, rpc };
export type { Fixture, Tokens, Provision };
