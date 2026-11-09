import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { observe, type PrivacyCounterSink } from "../src/privacy-telemetry.ts";

describe("privacy-preserving operational counters", () => {
  it("records only fixed low-cardinality event/surface/count fields", () => {
    const emitted: unknown[] = [];
    const sink: PrivacyCounterSink = { writeDataPoint: point => { emitted.push(point); } };
    const secret = "nr1r." + "a".repeat(128);
    const env = { NEWSROOM_METRICS: sink, extraContext: {
      authorization: secret, body: "confidential submission", ip: "203.0.113.42",
    } };
    observe(env, "authentication_denied", "issuer");
    observe(env, "rate_limit_denied", "resource");
    observe(env, "refresh_denied", "issuer");
    observe(env, "revocation_failed", "issuer");
    observe(env, "storage_failed", "resource");
    observe(env, "containment_epoch_changed", "operator");
    const json = JSON.stringify(emitted);
    assert.equal(emitted.length, 6);
    assert.equal(json.includes(secret), false);
    assert.equal(json.includes("confidential submission"), false);
    assert.equal(json.includes("203.0.113.42"), false);
    assert.deepEqual(emitted[0], { blobs: ["authentication_denied", "issuer"], doubles: [1] });
    observe(env, secret as never, "issuer");
    observe(env, "storage_failed", secret as never);
    assert.equal(emitted.length, 6, "unrecognized values cannot leak dynamic request text");
  });

  it("does not change security decisions when telemetry binding is missing or throws", () => {
    assert.doesNotThrow(() => observe({}, "issuer_unavailable", "issuer"));
    assert.doesNotThrow(() => observe({ NEWSROOM_METRICS: { writeDataPoint() { throw Error("offline"); } } },
      "resource_unavailable", "resource"));
  });
});
