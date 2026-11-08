/** Local full MCP read flow for S3-backed resource with mocked issuer and S3.
 * Does not grant or exercise any real R2 credentials.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { Miniflare, convertV4MiniflareOptions } from "miniflare";
import { RESOURCE, ISSUER, CLIENT, VALIDATOR, VALIDATOR_SECRET } from "./candidate-harness.ts";

const access = "nr1a." + "a".repeat(64) + "." + "b".repeat(64);
const endpoint = "https://" + "a".repeat(32) + ".r2.cloudflarestorage.com/";
const bucket = "newsroom-synthetic-only";
const key = "submissions/korda/2026-11-07/11111111-1111-4111-8111-111111111111.json";
const item = { schemaVersion: 1, id: "11111111-1111-4111-8111-111111111111", key,
  desk: "korda", kind: "report", title: "Synthetic S3 read", summary: "Only test data",
  status: "PROPOSED", submittedAt: "2026-11-07T21:14:00.000Z", nonCanonical: true, body: "synthetic-only" };
const status = { status: "HOLD", note: "Synthetic review only", reviewedAt: "2026-11-07T23:00:00.000Z" };

describe("S3 backed MCP resource without native R2 binding", () => {
  it("lists and reads synthetic R2-style objects with no storage write operation", async () => {
    const built = await build({ entryPoints: ["src/resource-s3-candidate.ts"], bundle: true,
      format: "esm", platform: "neutral", target: "es2023", mainFields: ["module", "main"],
      external: ["cloudflare:workers"], write: false, logLevel: "silent" });
    const methods: string[] = [];
    const config = convertV4MiniflareOptions({ workers: [
      { name: "issuer-stub", modules: true, script: `export default {async fetch(req) {
        if (new URL(req.url).pathname !== "/introspect") return new Response(null,{status:404});
        return Response.json({active:true, iss:"${ISSUER}", aud:"${RESOURCE}",
          client_id:"${CLIENT}", scope:"newsroom:read", exp:Math.floor(Date.now()/1000)+3600});
      }};`, compatibilityDate: "2026-10-01" },
      { name: "resource", modules: true, script: built.outputFiles[0].text,
        compatibilityDate: "2026-10-01", routes: ["resource.candidate.invalid/*"],
        bindings: {
          RESOURCE_AUDIENCE: RESOURCE, RESOURCE_ISSUER: ISSUER, RESOURCE_CLIENT_ID: CLIENT,
          RESOURCE_VALIDATOR_ID: VALIDATOR, RESOURCE_VALIDATOR_SECRET: VALIDATOR_SECRET,
          R2_READ_ENDPOINT: endpoint, R2_READ_BUCKET: bucket,
          R2_READ_ACCESS_KEY_ID: "A".repeat(32), R2_READ_SECRET_ACCESS_KEY: "s3-secret-" + "B".repeat(40),
        },
        serviceBindings: { ISSUER: "issuer-stub" },
        ratelimits: { RESOURCE_INGRESS_LIMIT: { namespace_id: "10023", simple: { limit: 100, period: 60 } } },
        outboundService: async request => {
          methods.push(request.method);
          assert.equal(request.method, "GET");
          const url = new URL(request.url);
          assert.equal(url.origin, new URL(endpoint).origin);
          assert.match(request.headers.get("Authorization") ?? "", /^AWS4-HMAC-SHA256 /);
          if (url.searchParams.get("list-type") === "2") return new Response(
            `<?xml version="1.0"?><ListBucketResult><IsTruncated>false</IsTruncated>
              <Contents><Key>${key}</Key></Contents></ListBucketResult>`,
            { headers: { "Content-Type": "application/xml" } });
          if (url.pathname === "/" + bucket + "/" + key) return Response.json(item);
          if (url.pathname === "/" + bucket + "/status/" + item.id + ".json") return Response.json(status);
          return new Response(null, { status: 404 });
        },
      },
    ] });
    const mf = new Miniflare(config);
    const rpc = async (method: string, params?: unknown) => mf.dispatchFetch(RESOURCE, {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + access },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    });
    try {
      const listed = await rpc("tools/call", { name: "newsroom_list", arguments: { desk: "korda", limit: 10 } });
      assert.equal(listed.status, 200, await listed.clone().text());
      const l = await listed.json() as { result: { content: { text: string }[]; isError: boolean } };
      assert.equal(l.result.isError, false);
      const rows = JSON.parse(l.result.content[0].text);
      assert.equal(rows.items[0].status, "HOLD");
      assert.equal(rows.items[0].title, item.title);

      const read = await rpc("tools/call", { name: "newsroom_read", arguments: { key } });
      assert.equal(read.status, 200, await read.clone().text());
      const details = await read.json() as { result: { content: { text: string }[]; isError: boolean } };
      assert.equal(details.result.isError, false);
      assert.equal(JSON.parse(details.result.content[0].text).editorialNote, status.note);

      const forbidden = await rpc("tools/call", { name: "newsroom_submit", arguments: { title: "bad" } });
      assert.equal(forbidden.status, 403);
      assert.ok(methods.length >= 5);
      assert.deepEqual(new Set(methods), new Set(["GET"]));
      await assert.rejects(mf.getR2Bucket("NEWSROOM", "resource"), /NEWSROOM|R2|not found|binding/i);
    } finally { await mf.dispose(); }
  });
});
