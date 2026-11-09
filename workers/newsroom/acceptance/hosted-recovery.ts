/** DISPOSABLE SCHEDULED TEST ONLY. Never production or publicly invocable.
 * Runs synthetic state transitions through real, separately deployed issuer and
 * resource Workers. No real GitHub identity, Turnstile solve or S3 credential.
 * fetch always denies; tests run from a short-lived cron, with per-phase CAS.
 */
import { DurableObject } from "cloudflare:workers";
import type { IssuerGrant } from "../src/issuer-grant.ts";
import type { IssuerGuard } from "../src/issuer-guard.ts";
import { mintBoundCredential, mintGrantId, sha256Hex } from "../prototype/issuer-boundary.ts";
import { mintAdmittedCredential } from "../src/access-admission.ts";
import { s256 } from "../src/policy.ts";
interface Env {
  RUN: DurableObjectNamespace<HostedRecoveryRun>;
  ISSUER_GRANTS: DurableObjectNamespace<IssuerGrant>;
  ISSUER_GUARD: DurableObjectNamespace<IssuerGuard>;
  ISSUER: Fetcher; RESOURCE: Fetcher; TEST_DATA: R2Bucket; RESULTS: KVNamespace;
  RUN_PHASE: string; ISSUER_ORIGIN: string; RESOURCE_AUDIENCE: string;
  CLIENT_ID: string; CLIENT_SECRET: string; SESSION_KEY: string;
}
type Tokens = { access_token: string; refresh_token: string };
const VERIFIER = "synthetic-hosted-verifier-0123456789-ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const REDIRECT = "https://synthetic-recovery.invalid/callback";
class CheckFailed extends Error {}
export class HostedRecoveryRun extends DurableObject<Env> {
  async run(phase: string) {
    if (!["seed", "outage", "recover"].includes(phase)) return;
    const admitted = this.ctx.storage.transactionSync(() => {
      if (this.ctx.storage.kv.get(phase)) return false;
      this.ctx.storage.kv.put(phase, "running"); return true;
    });
    if (!admitted) return;
    // Cleanup is armed before external I/O, including a lost or crashed seed run.
    await this.ctx.storage.setAlarm(Date.now() + 3600_000);
    const checks: { check: string; pass: boolean }[] = [];
    const check = (name: string, value: boolean) => {
      checks.push({ check: name, pass: value }); if (!value) throw new CheckFailed(name);
    };
    const env = this.env, guard = env.ISSUER_GUARD.getByName(env.CLIENT_ID);
    const post = (path: string, fields: Record<string, string>) => env.ISSUER.fetch(env.ISSUER_ORIGIN + path, {
      method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + btoa(env.CLIENT_ID + ":" + env.CLIENT_SECRET) }, body: new URLSearchParams(fields),
    });
    const rpc = (token: string, name = "ping", args?: Record<string, unknown>) => env.RESOURCE.fetch(env.RESOURCE_AUDIENCE, {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: name === "ping" ? "ping" : "tools/call",
        ...(name === "ping" ? {} : { params: { name, arguments: args ?? {} } }) }),
    });
    const binding = async () => ({ clientId: env.CLIENT_ID, editorId: "12345", audience: env.RESOURCE_AUDIENCE,
      epoch: await guard.currentEpoch(), redirectUri: REDIRECT, clientState: "synthetic-hosted-state", challenge: await s256(VERIFIER) });
    const pending = async () => {
      const id = mintGrantId(), grant = env.ISSUER_GRANTS.getByName(id), expected = await binding();
      const context = "issuer-browser:v1\n" + env.ISSUER_ORIGIN;
      const browser = await mintAdmittedCredential(id, "browser", env.SESSION_KEY, context);
      const state = await mintAdmittedCredential(id, "state", env.SESSION_KEY, context);
      check("synthetic-pending-start", await grant.start({ binding: expected, browserHash: await sha256Hex(browser),
        upstreamHash: await sha256Hex(state), verifier: mintGrantId(), now: Math.floor(Date.now() / 1000) }));
      return { id, grant, expected, browser, state };
    };
    const code = async () => {
      const p = await pending(), time = Math.floor(Date.now() / 1000);
      check("synthetic-upstream-claim", !!await p.grant.claimUpstream({ browserHash: await sha256Hex(p.browser),
        upstreamHash: await sha256Hex(p.state), expected: p.expected, now: time }));
      const successor = mintBoundCredential(p.id, "browser"), csrf = mintGrantId();
      check("synthetic-verified-identity-transition", !!await p.grant.authenticate({ browserHash: await sha256Hex(p.browser),
        verifiedEditorId: "12345", successorBrowserHash: await sha256Hex(successor), csrfHash: await sha256Hex(csrf), now: time }));
      const raw = mintBoundCredential(p.id, "code");
      check("synthetic-consent-transition", !!await p.grant.finishConsent({ browserHash: await sha256Hex(successor),
        csrfHash: await sha256Hex(csrf), approve: true, codeHash: await sha256Hex(raw), expected: p.expected, now: time }));
      return raw;
    };
    const exchange = (raw: string) => post("/token", { grant_type: "authorization_code", code: raw,
      redirect_uri: REDIRECT, code_verifier: VERIFIER });
    const fresh = async () => {
      const response = await exchange(await code()); check("real-issuer-code-exchange", response.status === 200);
      return await response.json() as Tokens;
    };
    let success = false;
    try {
      if (phase === "seed") {
        check("fresh-namespace-epoch-zero", await guard.currentEpoch() === 0);
        const a = await fresh(), b = await fresh(), pendingLogin = await pending(), waitingCode = await code();
        const key = "submissions/korda/2026-11-09/11111111-1111-4111-8111-111111111111.json";
        await env.TEST_DATA.put(key, JSON.stringify({ id: "11111111-1111-4111-8111-111111111111", key, desk: "korda",
          kind: "report", title: "Synthetic recovery fixture", body: "Noncanonical synthetic test only", status: "PROPOSED", nonCanonical: true }));
        check("resource-active-before-containment", (await rpc(a.access_token)).status === 200);
        const read = await rpc(a.access_token, "newsroom_read", { key });
        check("isolated-native-bucket-read", read.status === 200 && !(await read.json() as { result: { isError: boolean } }).result.isError);
        const attempts = await Promise.all(Array.from({ length: 8 }, () => guard.invalidateAll(0)));
        check("containment-cas-one-winner", attempts.filter(x => x.changed).length === 1 && attempts.every(x => x.epoch === 1));
        for (const token of [a, b]) {
          check("old-access-denied-after-containment", (await rpc(token.access_token)).status === 401);
          check("old-refresh-denied-after-containment", (await post("/token", { grant_type: "refresh_token", refresh_token: token.refresh_token })).status === 400);
        }
        const callback = await env.ISSUER.fetch(env.ISSUER_ORIGIN + "/oauth/callback?" + new URLSearchParams({
          state: pendingLogin.state, code: "never-sent-to-github" }), { headers: { Cookie: "__Host-newsroom-issuer=" + pendingLogin.browser } });
        check("pending-login-denied-after-containment", callback.status === 403);
        check("pending-code-denied-after-containment", (await exchange(waitingCode)).status === 400);
        const current = await fresh();
        check("fresh-authorization-after-containment", (await rpc(current.access_token)).status === 200);
        check("stale-containment-retry-no-change", !(await guard.invalidateAll(0)).changed);
        check("fresh-grant-survives-stale-retry", (await rpc(current.access_token)).status === 200);
        this.ctx.storage.kv.put("tokens", { old: a, current, key });
        await this.ctx.storage.setAlarm(Date.now() + 3600_000);
      } else {
        const state = this.ctx.storage.kv.get<{ old: Tokens; current: Tokens; key: string }>("tokens");
        check("recovery-checkpoint-present", !!state);
        if (!state) return;
        check("epoch-persists-across-upload", await guard.currentEpoch() === 1);
        if (phase === "outage") {
          check("issuer-outage-fails-closed-at-resource", (await rpc(state.current.access_token)).status === 503);
          check("issuer-outage-refresh-unavailable", (await post("/token", { grant_type: "refresh_token", refresh_token: state.current.refresh_token })).status === 503);
        } else {
          check("old-access-still-denied-after-restart", (await rpc(state.old.access_token)).status === 401);
          check("current-access-recovers-after-restart", (await rpc(state.current.access_token)).status === 200);
          const raced = await Promise.all([0, 1].map(() => post("/token", { grant_type: "refresh_token", refresh_token: state.current.refresh_token })));
          check("refresh-race-exactly-one-success", raced.map(x => x.status).sort().join(",") === "200,400");
          const winner = await raced.find(x => x.status === 200)!.json() as Tokens;
          check("refresh-replay-revokes-winning-family", (await rpc(winner.access_token)).status === 401);
          const recovered = await fresh();
          const read = await rpc(recovered.access_token, "newsroom_read", { key: state.key });
          const result = await read.json() as { result?: { isError?: boolean; content?: { text: string }[] } };
          const item = result.result?.content?.[0]?.text;
          const record = item && !result.result?.isError ? JSON.parse(item) : null;
          check("fresh-reconnect-read-recovers", read.status === 200 && !!record && record.key === state.key &&
            record.nonCanonical === true && record.body === "Noncanonical synthetic test only");
          check("revoke-endpoint-succeeds", (await post("/revoke", { token: recovered.refresh_token })).status === 200);
          check("revoked-access-immediately-denied", (await rpc(recovered.access_token)).status === 401);
          check("second-epoch-containment", (await guard.invalidateAll(1)).changed);
          this.ctx.storage.kv.delete("tokens");
        }
      }
      success = true;
    } catch (error) {
      checks.push({ check: error instanceof CheckFailed ? "assertion-failed" : "runtime-failure-redacted", pass: false });
    }
    this.ctx.storage.kv.put(phase, success ? "passed" : "failed");
    await env.RESULTS.put(phase, JSON.stringify({ schemaVersion: 1, syntheticOnly: true, phase, success, checks,
      limitations: ["no real GitHub or Turnstile browser acceptance", "native isolated R2 test; not S3 permission proof", "not a multi-region outage test"] }), { expirationTtl: 604800 });
  }
  async alarm() { await this.ctx.storage.deleteAll(); }
}
export default {
  fetch() { return new Response(null, { status: 404 }); },
  scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(env.RUN.getByName("synthetic-recovery-20261109").run(env.RUN_PHASE));
  },
};
