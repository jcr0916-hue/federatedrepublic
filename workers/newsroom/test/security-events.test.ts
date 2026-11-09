import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import { securityEvent, observeResponse } from "../src/security-events.ts";
import { challengePage, verifyAuthorizationChallenge } from "../src/authorization-challenge.ts";
import { CHALLENGE_BINDINGS } from "./challenge-fixture.ts";
import { sha256Hex } from "../prototype/issuer-boundary.ts";

describe("privacy-preserving monitoring and challenge upstream policy", () => {
  it("emits only fixed schema fields and rejects arbitrary labels, query strings and exception text", () => {
    const lines: string[] = [];
    const spy = mock.method(console, "log", (line: string) => { lines.push(line); });
    try {
      securityEvent("guard", "containment_changed", "internal", 200);
      observeResponse("issuer", "/oauth/callback?code=DO_NOT_LOG&state=PRIVATE", 503);
      securityEvent("issuer", "revocation_failed", "revoke", 503);
      securityEvent("resource", "storage_failure", "mcp", 503);
      securityEvent("issuer", "DO_NOT_LOG" as never, "token", 503);
      securityEvent("resource", "service_failure", "PRIVATE" as never, 503);
      assert.equal(lines.length, 4);
      for (const line of lines) {
        const value = JSON.parse(line);
        assert.deepEqual(Object.keys(value).sort(), ["event", "route", "sampleRate", "schema", "service", "status"]);
        assert.doesNotMatch(line, /DO_NOT_LOG|PRIVATE|code=|state=|Authorization|bearer|submission/);
      }
      assert.equal(JSON.parse(lines[1]).route, "other");
    } finally { spy.mock.restore(); }
  });

  it("fails closed for wrong Siteverify host/action/cdata, provider failure and malformed or oversized responses", async () => {
    const origin = "https://issuer.synthetic.invalid", params = new URLSearchParams({ state: "private-synthetic-state" });
    const page = await challengePage(params, CHALLENGE_BINDINGS);
    const cookie = page.headers.get("Set-Cookie")!.split(";")[0];
    const session = cookie.split("=")[1], cdata = await sha256Hex(session + "\n" + params);
    const request = new Request(origin + "/authorize", { headers: { Cookie: cookie } });
    const valid = { success: true, hostname: new URL(origin).hostname, action: "newsroom_login", cdata };
    const variants = [{ ...valid, success: false }, { ...valid, success: "true" }, { ...valid, hostname: "localhost" },
      { ...valid, action: "other" }, { ...valid, cdata: "0".repeat(64) }];
    for (const value of variants) {
      const spy = mock.method(globalThis, "fetch", async () => Response.json(value));
      try { await assert.rejects(verifyAuthorizationChallenge(request, params, "synthetic", CHALLENGE_BINDINGS), /challenge_rejected/); }
      finally { spy.mock.restore(); }
    }
    for (const response of [new Response("{"), new Response("x".repeat(5000)), Response.json(valid, { status: 503 }),
      new Response(null, { status: 302, headers: { Location: "https://foreign.invalid" } })]) {
      const spy = mock.method(globalThis, "fetch", async () => response);
      try { await assert.rejects(verifyAuthorizationChallenge(request, params, "synthetic", CHALLENGE_BINDINGS), /challenge_rejected/); }
      finally { spy.mock.restore(); }
    }
    const spy = mock.method(globalThis, "fetch", async (_input: unknown, init?: RequestInit) => {
      assert.equal(init?.redirect, "manual"); assert.ok(init?.signal);
      throw new DOMException("PRIVATE UPSTREAM ERROR", "TimeoutError");
    });
    try { await assert.rejects(verifyAuthorizationChallenge(request, params, "synthetic", CHALLENGE_BINDINGS), /challenge_rejected/); }
    finally { spy.mock.restore(); }
  });
});
