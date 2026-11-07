import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  mintGrantId, mintBoundCredential, routeBoundCredential, sha256Hex,
  verifyConfidentialClient,
} from "../prototype/issuer-boundary.ts";

const SECRET = "synthetic-only-client-secret-minimum-entropy-1234567890";

describe("server-owned grant identifiers and OAuth client binding (prototype)", () => {
  it("uses unpredictable 256-bit grant IDs and distinct access/refresh credentials", async () => {
    const grant = mintGrantId(), other = mintGrantId();
    assert.match(grant, /^[a-f0-9]{64}$/);
    assert.notEqual(grant, other);
    const access = mintBoundCredential(grant, "access");
    const refresh = mintBoundCredential(grant, "refresh");
    assert.notEqual(access, refresh);
    assert.equal(access.length, 134);
    assert.equal(refresh.length, 134);
    assert.deepEqual(await routeBoundCredential(access, "access"),
      { grantId: grant, credentialHash: await sha256Hex(access) });
    assert.deepEqual(await routeBoundCredential(refresh, "refresh"),
      { grantId: grant, credentialHash: await sha256Hex(refresh) });
    assert.equal(await routeBoundCredential(access, "refresh"), null);
    assert.equal(await routeBoundCredential(refresh, "access"), null);
    assert.throws(() => mintBoundCredential("client-supplied-name", "access"));
  });

  it("treats the routing ID as untrusted and detects altered secrets", async () => {
    const grant = mintGrantId(), access = mintBoundCredential(grant, "access");
    const parsed = await routeBoundCredential(access, "access");
    assert.ok(parsed);
    const tampered = access.slice(0, -1) + (access.at(-1) === "f" ? "e" : "f");
    const candidate = await routeBoundCredential(tampered, "access");
    assert.equal(candidate?.grantId, parsed?.grantId);
    assert.notEqual(candidate?.credentialHash, parsed?.credentialHash);
    const wrongId = "nr1a." + mintGrantId() + "." + access.split(".")[2];
    assert.notEqual((await routeBoundCredential(wrongId, "access"))?.grantId, grant);
    assert.equal(await routeBoundCredential("nr1a." + grant, "access"), null);
    assert.equal(await routeBoundCredential(access.toUpperCase(), "access"), null);
    assert.equal(await routeBoundCredential("nr1a." + grant + "." + "z".repeat(64), "access"), null);
    assert.equal(await routeBoundCredential(access + ".extra", "access"), null);
  });

  it("keeps browser, upstream-state and authorization-code credentials distinct from bearer tokens", async () => {
    const grant = mintGrantId();
    const kinds = ["access", "refresh", "code", "browser", "state"] as const;
    for (const kind of kinds) {
      const credential = mintBoundCredential(grant, kind);
      for (const presentedAs of kinds) {
        const result = await routeBoundCredential(credential, presentedAs);
        if (kind === presentedAs) assert.equal(result?.credentialHash, await sha256Hex(credential));
        else assert.equal(result, null, kind + " must not authenticate as " + presentedAs);
      }
    }
  });

  it("checks confidential clients against trusted hashed registration", async () => {
    const stored = await sha256Hex(SECRET);
    const good = "Basic " + Buffer.from("synthetic-editor:" + SECRET).toString("base64");
    assert.equal(await verifyConfidentialClient(good, "synthetic-editor", stored), true);
    assert.equal(await verifyConfidentialClient(good, "different-client", stored), false);
    assert.equal(await verifyConfidentialClient(good, "synthetic-editor", await sha256Hex("wrong" + SECRET)), false);
    assert.equal(await verifyConfidentialClient("Bearer test-token", "synthetic-editor", stored), false);
    assert.equal(await verifyConfidentialClient("Basic invalid!!!", "synthetic-editor", stored), false);
    assert.equal(await verifyConfidentialClient(null, "synthetic-editor", stored), false);
    assert.equal(await verifyConfidentialClient("Basic " + Buffer.from("synthetic-editor:" +
      "short").toString("base64"), "synthetic-editor", stored), false);
    assert.equal(await verifyConfidentialClient("Basic " + Buffer.from("wrong:" +
      SECRET).toString("base64"), "synthetic-editor", stored), false);
    assert.equal(await verifyConfidentialClient("Basic " + Buffer.from("synthetic-editor:" +
      SECRET + ":extra").toString("base64"), "synthetic-editor", stored), false);
  });
});
