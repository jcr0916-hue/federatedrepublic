/** LOOPBACK TEST HARNESS ONLY. Never deploy. GitHub is fully mocked and all
 * state/data/credentials are synthetic. Uses an ephemeral self-signed TLS cert.
 * The harness intercepts only its own /test/* and /client/callback paths.
 */
import { createServer } from "node:https";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import { Miniflare, convertV4MiniflareOptions } from "miniflare";
import { candidateScripts, CLIENT, CLIENT_SECRET, VALIDATOR, VALIDATOR_SECRET, VERIFIER, basic, hash } from "../test/candidate-harness.ts";

const files = await mkdtemp(join(tmpdir(), "newsroom-browser-candidate-"));
execFileSync("openssl", ["req", "-x509", "-newkey", "rsa:2048", "-nodes", "-days", "1",
  "-subj", "/CN=localhost", "-addext", "subjectAltName=DNS:localhost,IP:127.0.0.1",
  "-keyout", join(files, "key.pem"), "-out", join(files, "cert.pem")], { stdio: "ignore" });
let runtime: Miniflare;
let issuer: string, resource: string, redirect: string;
const upstream = new Map<string, string>();
const results: Record<string, unknown>[] = [];
const s256 = (value: string) => createHash("sha256").update(value).digest("base64url");
const jsonHeaders = { "Content-Type": "application/x-www-form-urlencoded", Authorization: basic(CLIENT, CLIENT_SECRET) };
const server = createServer({ key: await readFile(join(files, "key.pem")), cert: await readFile(join(files, "cert.pem")) },
  async (incoming, outgoing) => {
    try {
      const url = new URL(incoming.url!, "https://" + incoming.headers.host);
      if (url.pathname === "/test/result") {
        outgoing.writeHead(200, { "Content-Type": "application/json", "Cache-Control": "no-store" });
        outgoing.end(JSON.stringify(results)); return;
      }
      if (url.pathname === "/test/start") {
        const start = await runtime.dispatchFetch(issuer + "/authorize?" + new URLSearchParams({
          response_type: "code", client_id: CLIENT, redirect_uri: redirect, resource,
          scope: "newsroom:read", state: "browser-state", code_challenge: s256(VERIFIER), code_challenge_method: "S256",
        }), { redirect: "manual" });
        if (start.status !== 302) throw new Error("Authorization failed");
        const github = new URL(start.headers.get("Location")!);
        const code = randomBytes(16).toString("hex"); upstream.set(code, github.searchParams.get("code_challenge")!);
        const mock = new URL("/test/github", resource);
        mock.search = new URLSearchParams({ state: github.searchParams.get("state")!, code }).toString();
        outgoing.writeHead(302, { "Set-Cookie": start.headers.get("Set-Cookie")!, Location: mock.href,
          "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" }); outgoing.end(); return;
      }
      if (url.pathname === "/test/github") {
        // Cross-site browser navigation back from the mock provider host.
        const callback = new URL("/oauth/callback", issuer); callback.search = url.search;
        outgoing.writeHead(302, { Location: callback.href, "Cache-Control": "no-store" }); outgoing.end(); return;
      }
      if (url.pathname === "/client/callback") {
        if (url.searchParams.get("iss") !== issuer || url.searchParams.get("state") !== "browser-state")
          throw new Error("Invalid issuer/state");
        if (url.searchParams.get("error") === "access_denied") {
          results.push({ decision: "denied", noCode: !url.searchParams.has("code") });
          outgoing.writeHead(200, { "Content-Type": "text/html", "Cache-Control": "no-store" });
          outgoing.end("<!doctype html><title>Connection cancelled</title><h1>Connection cancelled</h1><p>No code or tokens issued.</p>"); return;
        }
        const tokensResponse = await runtime.dispatchFetch(issuer + "/token", { method: "POST", headers: jsonHeaders,
          body: new URLSearchParams({ grant_type: "authorization_code", code: url.searchParams.get("code")!,
            code_verifier: VERIFIER, redirect_uri: redirect, resource }),
        });
        if (tokensResponse.status !== 200) throw new Error("Code exchange failed");
        const tokens = await tokensResponse.json() as { access_token: string; refresh_token: string };
        const rpc = () => runtime.dispatchFetch(resource, { method: "POST", headers: {
          Authorization: "Bearer " + tokens.access_token, "Content-Type": "application/json",
        }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" }) });
        const before = await rpc();
        const beforeData = await before.json() as { result: { tools: { name: string }[] } };
        await runtime.dispatchFetch(issuer + "/revoke", { method: "POST", headers: jsonHeaders,
          body: new URLSearchParams({ token: tokens.refresh_token }) });
        const after = await rpc();
        const success = before.status === 200 && after.status === 401 &&
          beforeData.result.tools.map(tool => tool.name).sort().join(",") === "newsroom_list,newsroom_read";
        results.push({ decision: "approved", codeExchange: tokensResponse.status,
          readTools: beforeData.result.tools.map(tool => tool.name), afterRevocation: after.status, success });
        outgoing.writeHead(success ? 200 : 500, { "Content-Type": "text/html", "Cache-Control": "no-store" });
        outgoing.end("<!doctype html><title>Connection verified</title><h1>" + (success ? "Connection verified" : "Verification failed") +
          "</h1><p>Browser consent and code exchange succeeded. Only read tools were exposed. Access was denied immediately after revocation.</p>"); return;
      }
      const chunks: Buffer[] = []; let size = 0;
      for await (const chunk of incoming) {
        size += chunk.length; if (size > 65_536) throw new Error("Request too large"); chunks.push(chunk);
      }
      const headers = Object.fromEntries(Object.entries(incoming.headers).filter(([,value]) => value !== undefined)
        .map(([name,value]) => [name, Array.isArray(value) ? value.join(", ") : value!]));
      const response = await runtime.dispatchFetch(url.href, { method: incoming.method, headers,
        body: incoming.method === "GET" || incoming.method === "HEAD" ? undefined : Buffer.concat(chunks), redirect: "manual" });
      outgoing.writeHead(response.status, Object.fromEntries(response.headers)); outgoing.end(Buffer.from(await response.arrayBuffer()));
    } catch { outgoing.writeHead(500, { "Content-Type": "text/plain" }); outgoing.end("Local browser verification failed"); }
  });
await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
const port = (server.address() as { port: number }).port;
issuer = "https://localhost:" + port; resource = "https://127.0.0.1:" + port + "/mcp";
redirect = "https://127.0.0.1:" + port + "/client/callback";
const scripts = await candidateScripts();
runtime = new Miniflare(convertV4MiniflareOptions({ workers: [
  { name: "issuer", modules: true, script: scripts.issuer, compatibilityDate: "2026-10-01", routes: ["localhost/*"], bindings: {
    ISSUER_ORIGIN: issuer, ISSUER_AUDIENCE: resource, ISSUER_REDIRECT_URI: redirect,
    ISSUER_CLIENT_ID: CLIENT, ISSUER_CLIENT_SECRET_SHA256: hash(CLIENT_SECRET),
    ISSUER_RESOURCE_ID: VALIDATOR, ISSUER_RESOURCE_SECRET_SHA256: hash(VALIDATOR_SECRET),
    ISSUER_EDITOR_ID: "12345", ISSUER_GITHUB_CLIENT_ID: "synthetic-github-app", ISSUER_GITHUB_CLIENT_SECRET: "synthetic-github-secret",
  }, ratelimits: { ISSUER_INGRESS_LIMIT: { namespace_id: "10021", simple: { limit: 20000, period: 60 } } },
  durableObjects: { ISSUER_GRANTS: { className: "IssuerGrant", useSQLite: true },
    ISSUER_GUARD: { className: "IssuerGuard", useSQLite: true } }, outboundService: async request => {
    if (request.url === "https://github.com/login/oauth/access_token") {
      const params = new URLSearchParams(await request.text());
      if (upstream.get(params.get("code")!) !== s256(params.get("code_verifier")!)) return new Response(null, { status: 403 });
      return Response.json({ access_token: "gho_syntheticbrowser", token_type: "bearer", scope: "" });
    }
    return request.url === "https://api.github.com/user" ? Response.json({ id: 12345 }) : new Response(null, { status: 502 });
  } },
  { name: "resource", modules: true, script: scripts.resource, compatibilityDate: "2026-10-01", routes: ["127.0.0.1/*"],
    bindings: { RESOURCE_AUDIENCE: resource, RESOURCE_ISSUER: issuer, RESOURCE_CLIENT_ID: CLIENT,
      RESOURCE_VALIDATOR_ID: VALIDATOR, RESOURCE_VALIDATOR_SECRET: VALIDATOR_SECRET },
    ratelimits: { RESOURCE_INGRESS_LIMIT: { namespace_id: "10022", simple: { limit: 20000, period: 60 } } },
    serviceBindings: { ISSUER: "issuer" }, r2Buckets: ["NEWSROOM"], outboundService: () => new Response(null, { status: 502 }) },
] }));
await runtime.ready;
console.log(JSON.stringify({ start: issuer + "/test/start", result: issuer + "/test/result", syntheticOnly: true }));
let closing = false;
async function close() {
  if (closing) return; closing = true;
  server.closeAllConnections(); server.close();
  try { await runtime.dispose(); } finally { await rm(files, { recursive: true, force: true }); }
}
process.on("SIGINT", () => { void close().then(() => process.exit()); });
process.on("SIGTERM", () => { void close().then(() => process.exit()); });
