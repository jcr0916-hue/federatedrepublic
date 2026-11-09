/** Failure classification only; never logs browser credentials or contacts GitHub. */
import { mintAdmittedCredential } from "../src/access-admission.ts";
import { CHALLENGE_BINDINGS } from "./challenge-fixture.ts";
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { pairedRuntime, ISSUER } from "./candidate-harness.ts";
import { mintGrantId, mintBoundCredential, routeBoundCredential, sha256Hex } from "../prototype/issuer-boundary.ts";
import type { IssuerGrant } from "../src/issuer-grant.ts";

describe("callback browser-session failure diagnosis", () => {
  it("rejects missing, malformed, duplicate and replaced cookies before upstream I/O without consuming state", async () => {
    const f = await pairedRuntime();
    try {
      const a = await f.start(), b = await f.start();
      // A second /authorize overwrites the one host cookie in a real cookie jar.
      for (const cookie of ["", "__Host-newsroom-issuer=bad", a.cookie + "; " + a.cookie, b.cookie]) {
        const response = await f.issuer.fetch(ISSUER + "/oauth/callback?" + new URLSearchParams({
          state: a.state, code: "unused-synthetic-code",
        }), { redirect: "manual", headers: { Cookie: cookie } });
        assert.equal(response.status, 403);
        assert.deepEqual(await response.json(), { error: "invalid_browser_session" });
        assert.equal(response.headers.get("set-cookie"), null);
        assert.equal(response.headers.get("location"), null);
      }
      assert.deepEqual(f.calls, { token: 0, user: 0 });
      // Failed binding checks must not destroy the valid transaction.
      await f.login(a);
      assert.deepEqual(f.calls, { token: 1, user: 1 });
    } finally { await f.mf.dispose(); }
  });

  it("distinguishes same-grant secret mismatch from a missing browser session", async () => {
    const f = await pairedRuntime();
    try {
      const a = await f.start();
      const routed = (await routeBoundCredential(a.state, "state"))!;
      const response = await f.issuer.fetch(ISSUER + "/oauth/callback?" + new URLSearchParams({
        state: a.state, code: "unused-synthetic-code",
      }), { redirect: "manual", headers: {
        Cookie: "__Host-newsroom-issuer=" + await mintAdmittedCredential(routed.grantId, "browser", CHALLENGE_BINDINGS.ISSUER_SESSION_KEY, "issuer-browser:v1\n" + ISSUER),
      } });
      assert.equal(response.status, 403);
      assert.deepEqual(await response.json(), { error: "invalid_callback" });
      assert.deepEqual(f.calls, { token: 0, user: 0 });
      await f.login(a);
    } finally { await f.mf.dispose(); }
  });

  it("reports an expired stored session as invalid_callback when its browser cookie is still presented", async () => {
    const f = await pairedRuntime();
    try {
      const id = mintGrantId(), session = await mintAdmittedCredential(id, "browser", CHALLENGE_BINDINGS.ISSUER_SESSION_KEY, "issuer-browser:v1\n" + ISSUER),
        state = await mintAdmittedCredential(id, "state", CHALLENGE_BINDINGS.ISSUER_SESSION_KEY, "issuer-browser:v1\n" + ISSUER);
      const ns = await f.mf.getDurableObjectNamespace("ISSUER_GRANTS", "issuer");
      const raw = ns.get(ns.idFromName(id));
      const grant = raw as typeof raw & Pick<DurableObjectStub<IssuerGrant>, "start">;
      assert.equal(await grant.start({ binding: { clientId: "registered-candidate-client", editorId: "12345",
        audience: "https://resource.candidate.invalid/mcp", epoch: 0,
        redirectUri: "https://client.candidate.invalid/callback", clientState: "synthetic", challenge: "a".repeat(43) },
        browserHash: await sha256Hex(session), upstreamHash: await sha256Hex(state), verifier: mintGrantId(),
        now: Math.floor(Date.now() / 1000) - 301 }), true);
      const response = await f.issuer.fetch(ISSUER + "/oauth/callback?" + new URLSearchParams({ state, code: "unused" }), {
        redirect: "manual", headers: { Cookie: "__Host-newsroom-issuer=" + session },
      });
      assert.equal(response.status, 403);
      assert.deepEqual(await response.json(), { error: "invalid_callback" });
      assert.deepEqual(f.calls, { token: 0, user: 0 });
    } finally { await f.mf.dispose(); }
  });

  it("preserves the host-only Secure HttpOnly Lax five-minute cookie and rejects a foreign callback origin", async () => {
    const f = await pairedRuntime();
    try {
      const a = await f.start();
      const response = await f.issuer.fetch(ISSUER + "/oauth/callback?" + new URLSearchParams({
        state: a.state, code: "unused-synthetic-code",
      }), { redirect: "manual", headers: { Cookie: a.cookie, Origin: "https://foreign.invalid" } });
      assert.equal(response.status, 403);
      assert.deepEqual(await response.json(), { error: "origin_not_allowed" });
      assert.deepEqual(f.calls, { token: 0, user: 0 });
      const session = await f.login(a);
      assert.notEqual(session.cookie, a.cookie);
      // Read the actual new Set-Cookie header on another authorization response.
      const start = await f.issuer.fetch(ISSUER + "/authorize?" + new URLSearchParams({
        response_type: "code", client_id: "registered-candidate-client",
        redirect_uri: "https://client.candidate.invalid/callback", scope: "read",
        state: "synthetic", code_challenge: "a".repeat(43), code_challenge_method: "S256",
      }), { redirect: "manual" });
      assert.equal(start.status, 200);
      const header = start.headers.get("set-cookie")!;
      assert.match(header, /^__Host-newsroom-admission=[a-f0-9]{64};/);
      assert.match(header, /; Path=\/; Secure; HttpOnly; SameSite=Lax; Max-Age=300$/);
      assert.doesNotMatch(header, /Domain=/i);
    } finally { await f.mf.dispose(); }
  });
});
