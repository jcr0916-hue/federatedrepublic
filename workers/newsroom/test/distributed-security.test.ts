import { build } from "esbuild";
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Response as LocalResponse } from "miniflare";
import { pairedRuntime, ISSUER, RESOURCE, CLIENT, REDIRECT, VERIFIER, challenge } from "./candidate-harness.ts";
import { ADMISSION_KEY, CHALLENGE_BINDINGS } from "./challenge-fixture.ts";
import { accessContext, mintAdmittedAccess, mintAdmittedCredential, verifyAccessAdmission } from "../src/access-admission.ts";
import { mintGrantId } from "../prototype/issuer-boundary.ts";
import type { IssuerGuard } from "../src/issuer-guard.ts";
const params = () => new URLSearchParams({ response_type: "code", client_id: CLIENT, redirect_uri: REDIRECT,
  resource: RESOURCE, scope: "newsroom:read", state: "synthetic", code_challenge: challenge(VERIFIER), code_challenge_method: "S256" });
const form = { "Content-Type": "application/x-www-form-urlencoded", Origin: ISSUER };
async function budget(f: Awaited<ReturnType<typeof pairedRuntime>>, anonymous = false) {
  const ns = await f.mf.getDurableObjectNamespace("ISSUER_GUARD", "issuer");
  const raw = ns.get(ns.idFromName(anonymous ? "anonymous-challenge:v1:" + CLIENT : CLIENT));
  return raw as typeof raw & Pick<DurableObjectStub<IssuerGuard>, "admit" | "invalidateAll">;
}
describe("distributed admission, backend costs and recovery boundaries", () => {
  it("rejects modified, wrong-context/key and expired MAC credentials locally", async () => {
    const context = accessContext(ISSUER, CLIENT, RESOURCE);
    const token = await mintAdmittedAccess(mintGrantId(), ADMISSION_KEY, context);
    assert.equal(await verifyAccessAdmission(token, ADMISSION_KEY, context), true);
    assert.equal(await verifyAccessAdmission(token, "a".repeat(64), context), false);
    assert.equal(await verifyAccessAdmission(token, ADMISSION_KEY, context + "other"), false);
    for (const part of [1, 2, 3, 4]) {
      const pieces = token.split("."); pieces[part] = pieces[part].slice(0, -1) + (pieces[part].endsWith("0") ? "1" : "0");
      assert.equal(await verifyAccessAdmission(pieces.join("."), ADMISSION_KEY, context), false);
    }
    const expired = await mintAdmittedCredential(mintGrantId(), "access", ADMISSION_KEY, context, Math.floor(Date.now() / 1000) - 1);
    assert.equal(await verifyAccessAdmission(expired, ADMISSION_KEY, context), false);
  });

  it("does no issuer work or source-quota charging for distributed fabricated bearer traffic", async () => {
    let calls = 0;
    const f = await pairedRuntime({ resourceIngressLimit: 2, introspection: () => {
      calls++; return LocalResponse.json({ active: true, iss: ISSUER, aud: RESOURCE, client_id: CLIENT,
        scope: "newsroom:read", exp: Math.floor(Date.now() / 1000) + 900 });
    } });
    try {
      for (let i = 0; i < 150; i++) {
        const forged = `nr1a.${mintGrantId()}.${mintGrantId()}.${Math.floor(Date.now() / 1000) + 900}.${mintGrantId()}`;
        const response = await f.resource.fetch(RESOURCE, { method: "POST", headers: {
          "Content-Type": "application/json", Authorization: "Bearer " + forged, "CF-Connecting-IP": `192.0.2.${i + 1}`,
        }, body: '{"jsonrpc":"2.0","id":1,"method":"ping"}' });
        assert.equal(response.status, 401); await response.arrayBuffer();
      }
      assert.equal(calls, 0);
      const admitted = await mintAdmittedAccess(mintGrantId(), ADMISSION_KEY, accessContext(ISSUER, CLIENT, RESOURCE));
      assert.equal((await f.rpc(admitted, "ping")).status, 200);
      assert.equal(calls, 1);
    } finally { await f.mf.dispose(); }
  });

  it("creates no shared login allocation for unsolved GET/POST traffic and retains live operations", async () => {
    const f = await pairedRuntime();
    try {
      const tokens = await f.tokens();
      for (let i = 0; i < 80; i++) {
        const page = await f.issuer.fetch(ISSUER + "/authorize?" + params(), { headers: { "CF-Connecting-IP": `198.51.100.${i + 1}` } });
        assert.equal(page.status, 200); await page.arrayBuffer();
        const denied = await f.issuer.fetch(ISSUER + "/authorize", { method: "POST", headers: {
          ...form, Cookie: "__Host-newsroom-admission=" + mintGrantId(),
        }, body: new URLSearchParams({ authorization: params().toString(), "cf-turnstile-response": "invalid" }).toString() });
        assert.equal(denied.status, 403); await denied.arrayBuffer();
      }
      assert.equal((await f.rpc(tokens.access_token, "ping")).status, 200);
      assert.equal((await f.start()).cookie.startsWith("__Host-newsroom-issuer="), true, "failed challenges did not consume login quota");
      const guard = await budget(f, true);
      // Exhaust only anonymous verification; emergency/active operations are independent.
      let allowed = 0;
      for (let i = 0; i < 301; i++) if ((await guard.admit("challenge", Date.now())).allowed) allowed++;
      assert.equal(allowed, 218); // 300 minus 1 initial token login, 80 failures, 1 fresh login.
      const blocked = await f.issuer.fetch(ISSUER + "/authorize", { method: "POST", headers: {
        ...form, Cookie: "__Host-newsroom-admission=" + mintGrantId(),
      }, body: new URLSearchParams({ authorization: params().toString(), "cf-turnstile-response": "invalid" }).toString() });
      assert.equal(blocked.status, 429); assert.ok(Number(blocked.headers.get("Retry-After")) > 0);
      assert.equal((await f.rpc(tokens.access_token, "ping")).status, 200);
      assert.equal((await f.clientPost("/token", { grant_type: "refresh_token", refresh_token: tokens.refresh_token })).status, 200);
      assert.equal((await f.clientPost("/revoke", { token: tokens.refresh_token })).status, 200);
    } finally { await f.mf.dispose(); }
  });

  it("binds one-use browser challenges to cookie, request and Origin and permits the pinned GitHub redirect", async () => {
    const f = await pairedRuntime();
    try {
      const page = await f.issuer.fetch(ISSUER + "/authorize?" + params());
      assert.equal(page.headers.get("Referrer-Policy"), "same-origin");
      assert.match(page.headers.get("Content-Security-Policy")!, /form-action 'self' https:\/\/github.com;/);
      const html = await page.text(), proof = /data-cdata="([a-f0-9]{64})"/.exec(html)![1];
      const cookie = page.headers.get("Set-Cookie")!.split(";")[0];
      const post = (authorization = params().toString(), cookieValue = cookie, origin = ISSUER) => f.issuer.fetch(ISSUER + "/authorize", {
        method: "POST", redirect: "manual", headers: { ...form, Origin: origin, Cookie: cookieValue },
        body: new URLSearchParams({ authorization, "cf-turnstile-response": proof }).toString(),
      });
      for (const origin of ["null", "https://foreign.invalid"]) {
        const denied = await post(undefined, cookie, origin);
        assert.equal(denied.status, 403);
        assert.deepEqual(await denied.json(), { error: "origin_not_allowed" });
      }
      assert.equal((await post(undefined, "")).status, 403);
      const good = await post(); assert.equal(good.status, 302);
      assert.equal(new URL(good.headers.get("Location")!).origin, "https://github.com");
      assert.equal(good.headers.get("Referrer-Policy"), "no-referrer");
      assert.equal((await post()).status, 403, "Siteverify proof cannot be replayed");
      const otherPage = await f.issuer.fetch(ISSUER + "/authorize?" + params());
      const otherProof = /data-cdata="([a-f0-9]{64})"/.exec(await otherPage.text())![1];
      const changed = params(); changed.set("state", "changed");
      const altered = await f.issuer.fetch(ISSUER + "/authorize", { method: "POST", headers: { ...form,
        Cookie: otherPage.headers.get("Set-Cookie")!.split(";")[0] }, body: new URLSearchParams({
          authorization: changed.toString(), "cf-turnstile-response": otherProof }).toString() });
      assert.equal(altered.status, 403);
    } finally { await f.mf.dispose(); }
  });

  it("rejects fabricated callback and consent credentials before guard or grant lookup", async () => {
    const built = await build({ stdin: { contents: `import candidate, {IssuerGuard as RealGuard, IssuerGrant} from "./src/issuer-candidate.ts";
      export { IssuerGrant }; export class IssuerGuard extends RealGuard {currentEpoch(){throw new Error("lookup sentinel");}}
      export default {async fetch(request,env){const categories=[];const response=await candidate.fetch(request,{...env,
        NEWSROOM_METRICS:{writeDataPoint(point){categories.push(point.blobs[0]);}}});
        response.headers.set("X-Synthetic-Counter-Categories",categories.join(","));return response;}};`, resolveDir: process.cwd() }, bundle: true, format: "esm", platform: "neutral",
      external: ["cloudflare:workers"], write: false });
    const f = await pairedRuntime({ issuerScript: built.outputFiles[0].text });
    try {
      const id = mintGrantId(), core = mintGrantId(), expires = Math.floor(Date.now() / 1000) + 300;
      const fakeBrowser = `nr1b.${id}.${core}.${expires}.${mintGrantId()}`;
      const fakeState = `nr1s.${id}.${core}.${expires}.${mintGrantId()}`;
      const callback = (state: string, browser: string) => f.issuer.fetch(ISSUER + "/oauth/callback?" + new URLSearchParams({
        state, code: "synthetic-unused" }), { headers: { Cookie: "__Host-newsroom-issuer=" + browser } });
      const deniedCallback = await callback(fakeState, fakeBrowser);
      assert.equal(deniedCallback.status, 403);
      assert.ok(deniedCallback.headers.get("X-Synthetic-Counter-Categories")?.split(",").includes("authentication_denied"),
        "preserve the inherited fixed callback authentication counter");
      const consent = await f.issuer.fetch(ISSUER + "/consent", { method: "POST", headers: {
        ...form, Cookie: "__Host-newsroom-issuer=" + fakeBrowser,
      }, body: new URLSearchParams({ csrf: mintGrantId(), decision: "approve" }).toString() });
      assert.equal(consent.status, 403);
      assert.deepEqual(f.calls, { token: 0, user: 0 });
      const context = "issuer-browser:v1\n" + ISSUER;
      const signedBrowser = await mintAdmittedCredential(id, "browser", CHALLENGE_BINDINGS.ISSUER_SESSION_KEY, context);
      const signedState = await mintAdmittedCredential(id, "state", CHALLENGE_BINDINGS.ISSUER_SESSION_KEY, context);
      assert.equal((await callback(signedState, signedBrowser)).status, 503, "sentinel confirms genuine proof can reach guard");
    } finally { await f.mf.dispose(); }
  });

  it("bounds storage requests separately and keeps control operations available after storage exhaustion", async () => {
    const f = await pairedRuntime();
    try {
      const tokens = await f.tokens(), guard = await budget(f);
      const time = Date.now();
      const results = await Promise.all(Array.from({ length: 30 }, () => guard.admit("storage", time, 201)));
      assert.equal(results.filter(x => x.allowed).length, 17);
      assert.equal((await guard.admit("storage", time, 183)).allowed, true);
      const list = await f.rpc(tokens.access_token, "tools/call", { name: "newsroom_list", arguments: { limit: 100 } });
      assert.equal(list.status, 429); assert.ok(Number(list.headers.get("Retry-After")) > 0);
      assert.equal((await f.rpc(tokens.access_token, "ping")).status, 200);
      for (const limit of [-1, 0, 101, 1.5, "100", null])
        assert.equal((await f.rpc(tokens.access_token, "tools/call", { name: "newsroom_list", arguments: { limit } })).status, 400);
      assert.equal((await f.clientPost("/token", { grant_type: "refresh_token", refresh_token: tokens.refresh_token })).status, 200);
      assert.equal((await f.clientPost("/revoke", { token: tokens.refresh_token })).status, 200);
      assert.equal((await guard.invalidateAll(0)).changed, true, "containment has no rate quota");
    } finally { await f.mf.dispose(); }
  });
});
