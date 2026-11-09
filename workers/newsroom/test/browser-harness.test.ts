/** Local HTTPS transport regression. This is not a browser or live GitHub test. */
import { it } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { request } from "node:https";
import { once } from "node:events";
import { createInterface } from "node:readline";

function local(url: string, options: { method?: string; headers?: Record<string, string>; body?: string } = {}) {
  const target = new URL(url);
  assert.ok(["localhost", "127.0.0.1"].includes(target.hostname));
  return new Promise<{ status: number; headers: import("node:http").IncomingHttpHeaders; body: string }>((resolve, reject) => {
    // Only the harness's ephemeral self-signed certificate is accepted here.
    const req = request(target, { rejectUnauthorized: false, method: options.method, headers: options.headers }, res => {
      let body = "";
      res.setEncoding("utf8"); res.on("data", chunk => { body += chunk; });
      res.on("end", () => resolve({ status: res.statusCode!, headers: res.headers, body }));
      res.on("error", reject);
    });
    req.on("error", reject); req.end(options.body);
  });
}

it("runs the local HTTPS harness through cookie, consent, code exchange, read tools and revocation", { timeout: 60_000 }, async () => {
  const child = spawn(process.execPath, ["--import", "tsx", "scripts/browser-candidate-harness.ts"], {
    stdio: ["ignore", "pipe", "pipe"],
  });
  const exited = once(child, "exit");
  const lines = createInterface({ input: child.stdout });
  // Drain stderr without publishing potentially sensitive request data.
  child.stderr.resume();
  const deadline = setTimeout(() => child.kill("SIGKILL"), 55_000);
  try {
    const started = await Promise.race([
      (async () => { for await (const line of lines) {
        if (line.startsWith('{"start":')) return JSON.parse(line) as { start: string; result: string };
      } throw new Error("harness exited before readiness"); })(),
      exited.then(() => { throw new Error("harness exited before readiness"); }),
    ]);
    const first = await local(started.start);
    assert.equal(first.status, 302);
    const cookie = first.headers["set-cookie"]![0].split(";")[0];
    assert.match(first.headers["set-cookie"]![0], /Secure; HttpOnly; SameSite=Lax; Max-Age=300/);
    const upstream = await local(first.headers.location!);
    assert.equal(upstream.status, 302);
    // Cookie is sent only back to the issuer host, not the mock provider host.
    const callback = await local(upstream.headers.location!, { headers: { Cookie: cookie } });
    assert.equal(callback.status, 200);
    const rotated = callback.headers["set-cookie"]![0].split(";")[0];
    assert.notEqual(rotated, cookie);
    const csrf = callback.body.match(/name="csrf" value="([a-f0-9]{64})"/)?.[1];
    assert.ok(csrf);
    const consent = await local(new URL("/consent", started.start).href, {
      method: "POST", headers: { Cookie: rotated, Origin: new URL(started.start).origin,
        "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ csrf, decision: "approve" }).toString(),
    });
    assert.equal(consent.status, 302);
    const result = await local(consent.headers.location!);
    assert.equal(result.status, 200);
    const evidence = await local(started.result);
    assert.deepEqual(JSON.parse(evidence.body), [{ decision: "approved", codeExchange: 200,
      readTools: ["newsroom_list", "newsroom_read"], afterRevocation: 401, success: true }]);
  } finally {
    lines.close(); child.kill("SIGTERM");
    await exited; clearTimeout(deadline);
  }
});
