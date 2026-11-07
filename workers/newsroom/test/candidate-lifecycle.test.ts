import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { fork } from "node:child_process";
import { once } from "node:events";
import { setTimeout as delay } from "node:timers/promises";
import { pairedRuntime, CLIENT, CLIENT_SECRET, VALIDATOR, VALIDATOR_SECRET, VERIFIER, REDIRECT, RESOURCE,
  ISSUER, CLIENT_STATE, basic, hash, challenge, type PairedRuntime } from "./candidate-harness.ts";
import type { IssuerGrant } from "../src/issuer-grant.ts";
import type { IssuerGuard } from "../src/issuer-guard.ts";
import { issuerGitHubIdentity } from "../src/issuer-github.ts";

describe("candidate compatibility, durable lifecycle and local abuse limits", () => {
  it("supports the narrow read alias, preserves issuer/state on denial and rejects broadened compatibility inputs", async () => {
    const f = await pairedRuntime();
    try {
      const pending = await f.start({ scope: "read", resource: null });
      const result = await f.consent(await f.login(pending), "deny");
      assert.equal(result.searchParams.get("error"), "access_denied");
      assert.equal(result.searchParams.get("state"), CLIENT_STATE);
      assert.equal(result.searchParams.get("iss"), ISSUER);
      assert.equal(result.searchParams.has("code"), false);
      for (const [scope, audience] of [["read newsroom:review", RESOURCE], ["read", "https://evil.invalid/mcp"]]) {
        const params = new URLSearchParams({ response_type: "code", client_id: CLIENT, redirect_uri: REDIRECT,
          scope, resource: audience, state: CLIENT_STATE, code_challenge: challenge(VERIFIER), code_challenge_method: "S256" });
        const response = await f.issuer.fetch(ISSUER + "/authorize?" + params, { redirect: "manual" });
        assert.equal(response.status, 400); assert.equal(response.headers.get("Location"), null);
      }
    } finally { await f.mf.dispose(); }
  });

  it("supports pre-registered body credentials while rejecting mixed, duplicated and resource-side credentials", async () => {
    const f = await pairedRuntime();
    try {
      const code = (await f.consent()).searchParams.get("code")!;
      const fields = { grant_type: "authorization_code", code, redirect_uri: REDIRECT, code_verifier: VERIFIER,
        resource: RESOURCE, client_id: CLIENT, client_secret: CLIENT_SECRET };
      assert.equal((await f.clientPost("/token", fields)).status, 400, "reject mixed Basic and body credentials");
      assert.equal((await f.clientPost("/token", { ...fields, client_secret: "incorrect-secret-01234567890123456789" }, "")).status, 401);
      const duplicate = new URLSearchParams(fields); duplicate.append("client_id", CLIENT);
      assert.equal((await f.issuer.fetch(ISSUER + "/token", { method: "POST", headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      }, body: duplicate.toString() })).status, 400);
      const response = await f.clientPost("/token", fields, "");
      assert.equal(response.status, 200);
      const tokens = await response.json() as { access_token: string; refresh_token: string };
      assert.equal((await f.rpc(tokens.access_token, "ping")).status, 200);
      assert.equal((await f.clientPost("/introspect", { client_id: VALIDATOR, client_secret: VALIDATOR_SECRET,
        token: tokens.access_token, token_type_hint: "access_token" }, "")).status, 400);
      assert.equal((await f.clientPost("/revoke", { client_id: CLIENT, client_secret: CLIENT_SECRET,
        token: tokens.refresh_token }, "")).status, 200);
      assert.equal((await f.rpc(tokens.access_token, "ping")).status, 401);
    } finally { await f.mf.dispose(); }
  });

  it("survives runtime restart at pending login, code issuance, refresh and revocation boundaries", async () => {
    const path = await mkdtemp(join(tmpdir(), "newsroom-candidate-restart-"));
    let f: PairedRuntime | undefined;
    const restart = async () => { await f?.mf.dispose(); f = await pairedRuntime({ persistencePath: path }); return f; };
    try {
      f = await restart();
      const pending = await f.start();
      f = await restart();
      const code = (await f.consent(await f.login(pending))).searchParams.get("code")!;
      f = await restart();
      const response = await f.clientPost("/token", { grant_type: "authorization_code", code,
        redirect_uri: REDIRECT, code_verifier: VERIFIER });
      assert.equal(response.status, 200);
      const issued = await response.json() as { access_token: string; refresh_token: string };
      const rotated = await f.clientPost("/token", { grant_type: "refresh_token", refresh_token: issued.refresh_token });
      const current = await rotated.json() as typeof issued;
      assert.equal(rotated.status, 200);
      f = await restart();
      assert.equal((await f.rpc(issued.access_token, "ping")).status, 401);
      assert.equal((await f.rpc(current.access_token, "ping")).status, 200);
      assert.equal((await f.clientPost("/token", { grant_type: "refresh_token", refresh_token: issued.refresh_token })).status, 400);
      await f.clientPost("/revoke", { token: current.refresh_token });
      f = await restart();
      assert.equal((await f.rpc(current.access_token, "ping")).status, 401);
      assert.equal((await f.clientPost("/token", { grant_type: "refresh_token", refresh_token: current.refresh_token })).status, 400);
    } finally { await f?.mf.dispose(); await rm(path, { recursive: true, force: true }); }
  });

  it("recovers persisted committed grants after a child runtime is killed without graceful disposal", async () => {
    const path = await mkdtemp(join(tmpdir(), "newsroom-candidate-crash-"));
    const child = fork(new URL("./candidate-crash-child.ts", import.meta.url), [path], {
      execArgv: ["--import", "tsx"], detached: true, stdio: ["ignore", "ignore", "pipe", "ipc"],
    });
    let f: PairedRuntime | undefined;
    const deadline = new AbortController();
    try {
      const message = await Promise.race([
        once(child, "message").then(([message]) => message as { access_token: string; refresh_token: string }),
        once(child, "exit").then(([code]) => { throw new Error("Child runtime exited before checkpoint: " + code); }),
        delay(20_000, undefined, { signal: deadline.signal }).then(() => { throw new Error("Child runtime did not reach checkpoint"); }),
      ]);
      deadline.abort();
      assert.match(message.access_token, /^nr1a\./);
      // This test owns the detached group: kill Node AND its local workerd,
      // so a surviving native runtime cannot mask the persisted recovery test.
      const stopped = once(child, "exit"); process.kill(-child.pid!, "SIGKILL"); await stopped;
      f = await pairedRuntime({ persistencePath: path });
      assert.equal((await f.rpc(message.access_token, "ping")).status, 200);
      const attempts = await Promise.all([0, 1].map(() => f!.clientPost("/token", {
        grant_type: "refresh_token", refresh_token: message.refresh_token,
      })));
      assert.deepEqual(attempts.map(x => x.status).sort(), [200, 400]);
    } finally {
      deadline.abort();
      if (child.exitCode === null && child.signalCode === null) process.kill(-child.pid!, "SIGKILL");
      await f?.mf.dispose(); await rm(path, { recursive: true, force: true });
    }
  });

  it("requires fresh authorization after a lost committed refresh response", async () => {
    const f = await pairedRuntime();
    try {
      const old = await f.tokens();
      const lost = await f.clientPost("/token", { grant_type: "refresh_token", refresh_token: old.refresh_token });
      assert.equal(lost.status, 200); await lost.body?.cancel();
      assert.equal((await f.clientPost("/token", { grant_type: "refresh_token", refresh_token: old.refresh_token })).status, 400);
      assert.equal((await f.rpc(old.access_token, "ping")).status, 401);
      const recovered = await f.tokens();
      assert.equal((await f.rpc(recovered.access_token, "ping")).status, 200);
    } finally { await f.mf.dispose(); }
  });

  it("automatically cleans expired pending state and cannot replace a live pending transaction", async () => {
    const f = await pairedRuntime();
    try {
      const namespace = await f.mf.getDurableObjectNamespace("ISSUER_GRANTS", "issuer");
      const raw = namespace.get(namespace.idFromName("e".repeat(64)));
      const grant = raw as typeof raw & Pick<DurableObjectStub<IssuerGrant>, "start" | "claimUpstream" | "inspect">;
      const input = { binding: { clientId: CLIENT, editorId: "12345", audience: RESOURCE, redirectUri: REDIRECT,
        clientState: CLIENT_STATE, challenge: challenge(VERIFIER) }, browserHash: "a".repeat(64),
        upstreamHash: "b".repeat(64), verifier: "c".repeat(64), now: Math.floor(Date.now() / 1000) - 301 };
      assert.equal(await grant.start(input), true);
      // The real alarm fires immediately for this already-expired internal test record.
      let cleaned = false;
      for (let i = 0; i < 30 && !cleaned; i++) {
        await delay(50);
        cleaned = await grant.start({ ...input, now: Math.floor(Date.now() / 1000) });
      }
      assert.equal(cleaned, true, "expired object storage was reclaimed by its alarm");
      assert.equal(await grant.start({ ...input, now: Math.floor(Date.now() / 1000) }), false);
      const token = await f.tokens();
      assert.equal((await f.rpc(token.access_token, "ping")).status, 200);
    } finally { await f.mf.dispose(); }
  });

  it("serializes the client authorization budget, denies a backwards clock and resets only after the window", async () => {
    const f = await pairedRuntime();
    try {
      const namespace = await f.mf.getDurableObjectNamespace("ISSUER_GUARD", "issuer");
      const raw = namespace.get(namespace.idFromName("budget-test"));
      const guard = raw as typeof raw & Pick<DurableObjectStub<IssuerGuard>, "admit">;
      const now = Date.now();
      const attempts = await Promise.all(Array.from({ length: 80 }, () => guard.admit("authorize", now)));
      assert.equal(attempts.filter(x => x.allowed).length, 60);
      assert.equal((await guard.admit("authorize", now + 59_999)).allowed, false);
      assert.equal((await guard.admit("authorize", now - 1)).allowed, false);
      assert.equal((await guard.admit("authorize", now + 60_000)).allowed, true);
    } finally { await f.mf.dispose(); }
  });

  it("does not expose its private state writer through Durable Object RPC", async () => {
    const f = await pairedRuntime();
    try {
      const namespace = await f.mf.getDurableObjectNamespace("ISSUER_GRANTS", "issuer");
      const raw = namespace.get(namespace.idFromName("private-writer-test"));
      const attempted = raw as typeof raw & { write(value: unknown): Promise<void> };
      await assert.rejects(async () => { await attempted.write({ phase: "active" }); }, /does not implement.*write/);
    } finally { await f.mf.dispose(); }
  });

  it("returns 429 and Retry-After when token requests exceed the shared client budget", async () => {
    const f = await pairedRuntime();
    try {
      // The separate 80-way RPC test covers atomic admission. Bound ingress
      // concurrency here so the full suite does not test the host's socket cap.
      const attempts = [];
      for (let offset = 0; offset < 245; offset += 20) {
        const batch = await Promise.all(Array.from({ length: Math.min(20, 245 - offset) }, async () => {
          const response = await f.clientPost("/token", {
            grant_type: "refresh_token", refresh_token: "invalid",
          }, basic(CLIENT, CLIENT_SECRET));
          await response.arrayBuffer();
          return response;
        }));
        attempts.push(...batch);
      }
      assert.equal(attempts.filter(x => x.status === 400).length, 240);
      const denied = attempts.filter(x => x.status === 429);
      assert.equal(denied.length, 5);
      assert.ok(Number(denied[0].headers.get("Retry-After")) > 0);
    } finally { await f.mf.dispose(); }
  });

  it("uses a real deadline signal for a hung GitHub transport and returns no upstream details", async () => {
    const started = Date.now();
    // A real transport owns its request until completion; retain that ownership
    // in the mock too, rather than leaving an unreachable request/signal cycle.
    const pendingRequests: Request[] = [];
    let watchdog: ReturnType<typeof setTimeout> | undefined;
    try {
      await assert.rejects(Promise.race([issuerGitHubIdentity("synthetic-code", "a".repeat(64), {
        issuer: ISSUER, githubClientId: "synthetic", githubClientSecret: "synthetic", editorId: "12345",
      }, request => new Promise((_resolve, reject) => {
        pendingRequests.push(request);
        request.signal.addEventListener("abort", () => reject(request.signal.reason), { once: true });
      })), new Promise((_resolve, reject) => {
        watchdog = setTimeout(() => reject(new Error("deadline_did_not_abort")), 15_000);
      })]), error => error instanceof Error && error.message === "identity_provider_unavailable");
      assert.ok(Date.now() - started >= 9000);
    } finally { clearTimeout(watchdog); pendingRequests.length = 0; }
  });
});
