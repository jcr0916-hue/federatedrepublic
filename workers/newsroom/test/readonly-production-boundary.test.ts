import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path: string) => readFileSync(new URL("../" + path, import.meta.url), "utf8");
const contract = JSON.parse(read("release/readonly-production-boundary.json")) as {
  releaseApproved: boolean;
  productionReady: boolean;
  allowedOAuthScopes: string[];
  allowedOAuthTools: string[];
  legacy: { worker: string; sourceEntrypoint: string; bundle: string; operation: string; requiredBindings: string[] };
  issuer: { workerName: string; sourceEntrypoint: string; bundle: string; requiredBindings: string[] };
  resource: { workerName: string; sourceEntrypoint: string; bundle: string; requiredBindings: string[] };
  prohibitedOauthTools: string[];
  excludedBindingsOnResource: string[];
  requiresApprovalFor: string[];
};

describe("review-only production release boundary (never deploys)", () => {
  it("remains explicitly unapproved, with no named production candidates", () => {
    assert.equal(contract.releaseApproved, false);
    assert.equal(contract.productionReady, false);
    assert.equal(contract.issuer.workerName, "UNASSIGNED_DO_NOT_DEPLOY");
    assert.equal(contract.resource.workerName, "UNASSIGNED_DO_NOT_DEPLOY");
    assert.equal(contract.legacy.worker, "federated-republic-newsroom");
    assert.equal(contract.legacy.operation, "preserve-unchanged");
    assert.ok(contract.requiresApprovalFor.includes("attach-production-r2"));
    assert.ok(contract.requiresApprovalFor.includes("merge-main"));
    assert.notEqual(contract.issuer.workerName, contract.resource.workerName + "-issuer");
  });

  it("pins the distinct build entrypoints instead of promoting the KV OAuth bundle", () => {
    assert.deepEqual([
      contract.legacy.sourceEntrypoint, contract.issuer.sourceEntrypoint, contract.resource.sourceEntrypoint
    ], ["src/index.ts", "src/issuer-candidate.ts", "src/resource-s3-candidate.ts"]);
    assert.deepEqual([
      contract.legacy.bundle, contract.issuer.bundle, contract.resource.bundle
    ], ["dist/worker.js", "dist/issuer-candidate.js", "dist/resource-s3-candidate.js"]);
    const original = read("src/index.ts");
    assert.match(original, /createNewsroomOAuth\(legacyAdapter\)/);
    for (const [script, input, output] of [
      ["scripts/build-issuer-candidate.mjs", "src/issuer-candidate.ts", "dist/issuer-candidate.js"],
      ["scripts/build-resource-candidate.mjs", "src/resource-candidate.ts", "dist/resource-candidate.js"],
    ]) {
      const build = read(script);
      assert.ok(build.includes(input));
      assert.ok(build.includes(output));
      assert.doesNotMatch(build, /wrangler\s+deploy|cloudflare\.request/);
    }
  });

  it("keeps source-level authorization limited to read-only tools", () => {
    assert.deepEqual(contract.allowedOAuthScopes, ["newsroom:read"]);
    assert.deepEqual(contract.allowedOAuthTools, ["newsroom_list", "newsroom_read"]);
    const issuer = read(contract.issuer.sourceEntrypoint);
    const resource = read("src/resource-candidate.ts");
    assert.ok(issuer.includes('const SCOPE = "newsroom:read"'));
    assert.ok(resource.includes('const SCOPE = "newsroom:read"'));
    assert.ok(resource.includes('new Set(["newsroom_list", "newsroom_read"])'));
    assert.ok(resource.includes('["server/discover", "initialize"'));
    assert.ok(resource.includes('!READ_TOOLS.has(call.name)'));
    for (const name of contract.prohibitedOauthTools) {
      assert.ok(!contract.allowedOAuthTools.includes(name));
    }
  });

  it("requires separate issuer introspection and excludes legacy desk secrets from resource", () => {
    assert.equal(new Set(contract.issuer.requiredBindings).size, 13);
    assert.equal(new Set(contract.resource.requiredBindings).size, 11);
    assert.ok(contract.issuer.requiredBindings.includes("ISSUER_GRANTS"));
    assert.ok(contract.issuer.requiredBindings.includes("ISSUER_GUARD"));
    assert.ok(contract.resource.requiredBindings.includes("ISSUER"));
    assert.ok(!contract.resource.requiredBindings.includes("NEWSROOM"));
    assert.ok(contract.resource.requiredBindings.includes("R2_READ_BUCKET"));
    assert.ok(contract.resource.requiredBindings.includes("RESOURCE_INGRESS_LIMIT"));
    assert.ok(contract.issuer.requiredBindings.includes("ISSUER_INGRESS_LIMIT"));
    for (const name of contract.excludedBindingsOnResource) {
      assert.ok(!contract.resource.requiredBindings.includes(name), name);
    }
    for (const secret of contract.legacy.requiredBindings.filter(x => x.startsWith("KEY_"))) {
      assert.ok(!contract.resource.requiredBindings.includes(secret), secret);
    }
    const resource = read("src/resource-candidate.ts");
    assert.ok(resource.includes('env.ISSUER.fetch'));
    assert.ok(resource.includes('verified.scope !== SCOPE'));
    assert.ok(resource.includes('verified.aud !== config.audience'));
    assert.ok(resource.includes('verified.client_id !== env.RESOURCE_CLIENT_ID'));
  });
});
