/** Test-only paired Workers. All credentials/data are synthetic; outbound egress
 * is mocked or denied. No cloud resources or connected OAuth grant are used. */
import { CHALLENGE_BINDINGS, ADMISSION_KEY, solveChallenge, mockSiteverify } from "./challenge-fixture.ts";
import assert from "node:assert/strict";
import { createHash, randomBytes } from "node:crypto";
import { build } from "esbuild";
import { Miniflare, convertV4MiniflareOptions, type V4FetchHandler } from "miniflare";

export const ISSUER = "https://issuer.candidate.invalid";
export const RESOURCE = "https://resource.candidate.invalid/mcp";
export const REDIRECT = "https://client.candidate.invalid/callback";
export const CLIENT = "registered-candidate-client";
export const CLIENT_SECRET = "synthetic-client-secret-0123456789-ABCDEFGHIJKLMNOPQRSTUVWXYZ";
export const VALIDATOR = "independent-resource-validator";
export const VALIDATOR_SECRET = "synthetic-validator-secret-9876543210-ABCDEFGHIJKLMNOPQRSTUVWXYZ";
export const VERIFIER = "synthetic-verifier-0123456789-ABCDEFGHIJKLMNOPQRSTUVWXYZ-abcdef";
export const CLIENT_STATE = "opaque-client-state+/%&=";
export const hash = (value: string) => createHash("sha256").update(value).digest("hex");
export const challenge = (value: string) => createHash("sha256").update(value).digest("base64url");
export const basic = (id: string, secret: string) => "Basic " + Buffer.from(id + ":" + secret).toString("base64");
export const ISSUER_BINDINGS = {
  ...CHALLENGE_BINDINGS, ISSUER_ADMISSION_KEY: ADMISSION_KEY,
  ISSUER_ORIGIN: ISSUER, ISSUER_CLIENT_ID: CLIENT, ISSUER_CLIENT_SECRET_SHA256: hash(CLIENT_SECRET),
  ISSUER_RESOURCE_ID: VALIDATOR, ISSUER_RESOURCE_SECRET_SHA256: hash(VALIDATOR_SECRET),
  ISSUER_REDIRECT_URI: REDIRECT, ISSUER_AUDIENCE: RESOURCE, ISSUER_EDITOR_ID: "12345",
  ISSUER_GITHUB_CLIENT_ID: "dedicated-synthetic-github-app", ISSUER_GITHUB_CLIENT_SECRET: "synthetic-github-app-secret",
};
export const RESOURCE_BINDINGS = {
  RESOURCE_ADMISSION_KEY: ADMISSION_KEY, RESOURCE_AUDIENCE: RESOURCE, RESOURCE_ISSUER: ISSUER, RESOURCE_CLIENT_ID: CLIENT,
  RESOURCE_VALIDATOR_ID: VALIDATOR, RESOURCE_VALIDATOR_SECRET: VALIDATOR_SECRET,
};
let scriptsPromise: Promise<{ issuer: string; resource: string }> | undefined;
export function candidateScripts() {
  return scriptsPromise ??= Promise.all(["issuer", "resource"].map(async kind => {
    const built = await build({ entryPoints: ["src/" + kind + "-candidate.ts"], bundle: true,
      format: "esm", platform: "neutral", target: "es2023", mainFields: ["module", "main"],
      external: ["cloudflare:workers"], write: false, logLevel: "silent" });
    return built.outputFiles[0].text;
  })).then(([issuer, resource]) => ({ issuer, resource }));
}
export async function pairedRuntime(options: {
  persistencePath?: string;
  issuerScript?: string;
  issuerBindings?: Partial<typeof ISSUER_BINDINGS>;
  resourceBindings?: Partial<typeof RESOURCE_BINDINGS>;
  introspection?: V4FetchHandler;
  resourceIngressLimit?: number;
  issuerIngressLimit?: number;
} = {}) {
  const scripts = await candidateScripts();
  const upstream = new Map<string, string>();
  const calls = { token: 0, user: 0 };
  const usedChallenges = new Set<string>();
  const mf = new Miniflare(convertV4MiniflareOptions({
    resourcePersistencePath: options.persistencePath,
    workers: [{ name: "issuer", modules: true, script: options.issuerScript ?? scripts.issuer, compatibilityDate: "2026-10-01",
      routes: ["issuer.candidate.invalid/*"],
      bindings: { ...ISSUER_BINDINGS, ...options.issuerBindings },
      ratelimits: { ISSUER_INGRESS_LIMIT: { namespace_id: "10001", simple: { limit: options.issuerIngressLimit ?? 20000, period: 60 } } },
      durableObjects: { ISSUER_GRANTS: { className: "IssuerGrant", useSQLite: true },
        ISSUER_GUARD: { className: "IssuerGuard", useSQLite: true } },
      outboundService: async request => {
        if (request.url === "https://challenges.cloudflare.com/turnstile/v0/siteverify")
          return mockSiteverify(request, new URL(ISSUER).hostname, usedChallenges);
        if (request.url === "https://github.com/login/oauth/access_token") {
          calls.token++;
          const params = new URLSearchParams(await request.text());
          assert.equal(params.get("client_id"), ISSUER_BINDINGS.ISSUER_GITHUB_CLIENT_ID);
          assert.equal(params.get("client_secret"), ISSUER_BINDINGS.ISSUER_GITHUB_CLIENT_SECRET);
          assert.equal(params.get("redirect_uri"), ISSUER + "/oauth/callback");
          assert.equal(challenge(params.get("code_verifier")!), upstream.get(params.get("code")!), "upstream PKCE");
          return Response.json({ access_token: "gho_syntheticonly", token_type: "bearer", scope: "" });
        }
        if (request.url === "https://api.github.com/user") {
          calls.user++;
          assert.equal(request.headers.get("Authorization"), "Bearer gho_syntheticonly");
          return Response.json({ id: 12345 });
        }
        return new Response(null, { status: 502 });
      },
    }, { name: "resource", modules: true, script: scripts.resource, compatibilityDate: "2026-10-01",
      routes: ["resource.candidate.invalid/*"],
      bindings: { ...RESOURCE_BINDINGS, ...options.resourceBindings },
      ratelimits: { RESOURCE_INGRESS_LIMIT: { namespace_id: "10002", simple: { limit: options.resourceIngressLimit ?? 20000, period: 60 } } },
      serviceBindings: { ISSUER: options.introspection ?? "issuer" }, r2Buckets: ["NEWSROOM"],
      outboundService: () => new Response(null, { status: 502 }),
    }],
  }));
  // Dispatch through the local ingress router. getWorker().fetch is a proxy RPC
  // surface with its own Origin check, unsuitable for browser Origin tests.
  const issuer = { fetch: mf.dispatchFetch.bind(mf) }, resource = { fetch: mf.dispatchFetch.bind(mf) };
  const bucket = await mf.getR2Bucket("NEWSROOM", "resource");
  const clientPost = (path: string, fields: Record<string, string>, auth = basic(CLIENT, CLIENT_SECRET)) =>
    issuer.fetch(ISSUER + path, { method: "POST", redirect: "manual", headers: {
      "Content-Type": "application/x-www-form-urlencoded", ...(auth ? { Authorization: auth } : {}),
    }, body: new URLSearchParams(fields).toString() });
  const start = async (overrides: Record<string, string | null> = {}) => {
    const params = new URLSearchParams({ response_type: "code", client_id: CLIENT, redirect_uri: REDIRECT,
      scope: "newsroom:read", resource: RESOURCE, state: CLIENT_STATE,
      code_challenge: challenge(VERIFIER), code_challenge_method: "S256" });
    for (const [key, value] of Object.entries(overrides)) value === null ? params.delete(key) : params.set(key, value);
    const response = await solveChallenge(issuer.fetch, ISSUER + "/authorize?" + params);
    assert.equal(response.status, 302, await response.clone().text());
    const github = new URL(response.headers.get("Location")!);
    return { cookie: response.headers.get("Set-Cookie")!.split(";")[0], state: github.searchParams.get("state")!,
      challenge: github.searchParams.get("code_challenge")! };
  };
  const login = async (provided?: Awaited<ReturnType<typeof start>>) => {
    const pending = provided ?? await start();
    const code = randomBytes(16).toString("hex"); upstream.set(code, pending.challenge);
    const response = await issuer.fetch(ISSUER + "/oauth/callback?" + new URLSearchParams({ state: pending.state, code }), {
      redirect: "manual", headers: { Cookie: pending.cookie },
    });
    assert.equal(response.status, 200, await response.clone().text());
    const csrf = (await response.text()).match(/name="csrf" value="([a-f0-9]{64})"/)?.[1];
    assert.ok(csrf);
    return { cookie: response.headers.get("Set-Cookie")!.split(";")[0], csrf };
  };
  const consent = async (provided?: Awaited<ReturnType<typeof login>>, decision = "approve") => {
    const session = provided ?? await login();
    const response = await issuer.fetch(ISSUER + "/consent", { method: "POST", redirect: "manual", headers: {
      "Content-Type": "application/x-www-form-urlencoded", Cookie: session.cookie, Origin: ISSUER,
    }, body: new URLSearchParams({ csrf: session.csrf, decision }).toString() });
    assert.equal(response.status, 302, await response.clone().text());
    const redirect = new URL(response.headers.get("Location")!);
    assert.equal(redirect.searchParams.get("iss"), ISSUER);
    assert.equal(redirect.searchParams.get("state"), CLIENT_STATE);
    return redirect;
  };
  const tokens = async () => {
    const code = (await consent()).searchParams.get("code")!;
    const response = await clientPost("/token", { grant_type: "authorization_code", code,
      redirect_uri: REDIRECT, resource: RESOURCE, code_verifier: VERIFIER });
    assert.equal(response.status, 200, await response.clone().text());
    return await response.json() as { access_token: string; refresh_token: string; scope: string; expires_in: number };
  };
  const rpc = (token: string, method: string, params?: unknown) => resource.fetch(RESOURCE, {
    method: "POST", headers: { "Content-Type": "application/json", ...(token ? { Authorization: "Bearer " + token } : {}) },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, ...(params ? { params } : {}) }),
  });
  return { mf, issuer, resource, bucket, calls, clientPost, start, login, consent, tokens, rpc };
}
export type PairedRuntime = Awaited<ReturnType<typeof pairedRuntime>>;
