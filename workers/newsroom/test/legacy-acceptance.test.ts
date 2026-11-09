import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runLegacyAcceptance } from "../scripts/legacy-acceptance.mjs";
import { instance } from "./runtime.ts";

describe("complete isolated agent-to-editor HTTP workflow", () => {
  it("runs the same acceptance sequence against the preserved legacy Worker", async () => {
    const f = await instance({ entrypoint: "baseline" });
    const credentials = Object.fromEntries(["corindal", "korda", "varek", "federal", "editorial"].map(desk =>
      [desk, "synthetic-" + desk + "-credential"]));
    const result = await runLegacyAcceptance("https://newsroom.example", credentials,
      (url, init) => f.mf.dispatchFetch(url, { method: init.method,
        headers: init.headers as Record<string, string>, body: init.body as string, redirect: "manual" }));
    assert.equal(result.passed, true);
    assert.equal(result.syntheticSubmissions, 4);
    assert.ok(result.checks > 100);
    const objects = (await (await f.mf.getR2Bucket("NEWSROOM")).list()).objects;
    assert.equal(objects.length, 6, "only four proposals, one review and one status object exist");
  });

  it("refuses production and existing OAuth acceptance targets before sending any request", async () => {
    for (const origin of ["https://federated-republic-newsroom.jcr0916.workers.dev",
      "https://newsroom-s3-readonly-acceptance.jcr0916.workers.dev"]) {
      await assert.rejects(runLegacyAcceptance(origin, {}, () => { throw new Error("must_not_fetch"); }),
        /acceptance_target_not_isolated/);
    }
  });
});
