import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readonlyS3Storage } from "../src/readonly-s3-storage.ts";

const config = {
  endpoint: "https://" + "a".repeat(32) + ".r2.cloudflarestorage.com/",
  bucket: "newsroom-synthetic-only",
  accessKeyId: "A".repeat(32),
  secretAccessKey: "synthetic-secret-S3-read-only-" + "B".repeat(40),
};
const key = "submissions/korda/2026-11-07/11111111-1111-4111-8111-111111111111.json";

describe("R2 S3 credential-scoped read adapter (mocked network only)", () => {
  it("has only get/list, signs GET requests, keeps secrets out of URL and never writes", async () => {
    const requests: Request[] = [];
    const storage = readonlyS3Storage(config, async request => {
      requests.push(request);
      assert.equal(request.method, "GET");
      assert.equal(request.redirect, "manual");
      assert.match(request.headers.get("authorization") || "", /^AWS4-HMAC-SHA256 Credential=/);
      return Response.json({ schemaVersion: 1, title: "synthetic" });
    });
    assert.ok(Object.isFrozen(storage));
    assert.deepEqual(Object.keys(storage).sort(), ["get", "list"]);
    for (const method of ["put", "delete", "createMultipartUpload", "resumeMultipartUpload"])
      assert.equal(Reflect.get(storage, method), undefined);
    const result = await storage.get(key);
    assert.deepEqual(await result!.json(), { schemaVersion: 1, title: "synthetic" });
    assert.equal(requests.length, 1);
    assert.equal(new URL(requests[0].url).pathname, "/" + config.bucket + "/" + key);
    assert.ok(!requests[0].url.includes(config.secretAccessKey));
    assert.ok(!requests[0].url.includes(config.accessKeyId));
    assert.match(requests[0].headers.get("x-amz-date") || "", /^\d{8}T\d{6}Z$/);
    assert.equal(requests[0].headers.get("x-amz-content-sha256"), 
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
  });

  it("supports legacy newsroom list prefix, continuation token and XML entity key", async () => {
    const reqs: Request[] = [];
    const xml = `<?xml version="1.0"?><ListBucketResult><IsTruncated>true</IsTruncated>
      <Contents><Key>${key}</Key></Contents>
      <NextContinuationToken>next&amp;page</NextContinuationToken></ListBucketResult>`;
    const storage = readonlyS3Storage(config, async req => {
      reqs.push(req); return new Response(xml, { status: 200, headers: { "Content-Type": "application/xml" } });
    });
    const value = await storage.list({ prefix: "submissions/korda/", limit: 10, cursor: "previous&start" });
    assert.deepEqual(value.objects.map(x => x.key), [key]);
    assert.equal(value.truncated, true);
    assert.equal(value.cursor, "next&page");
    const url = new URL(reqs[0].url);
    assert.equal(url.searchParams.get("list-type"), "2");
    assert.equal(url.searchParams.get("prefix"), "submissions/korda/");
    assert.equal(url.searchParams.get("continuation-token"), "previous&start");
    assert.equal(url.searchParams.get("max-keys"), "10");
    assert.equal(reqs[0].method, "GET");
  });

  it("rejects external hosts, bad object paths, unbounded lists, redirects and oversized data", async () => {
    assert.throws(() => readonlyS3Storage({ ...config, endpoint: "https://evil.example/" }));
    const storage = readonlyS3Storage(config, async request => {
      if (request.url.includes("huge")) return new Response("x".repeat(70_000));
      return new Response("", { status: 302, headers: { Location: "https://evil.example" } });
    });
    await assert.rejects(storage.get("reviews/should-not-list.json"), /r2_invalid_key/);
    await assert.rejects(storage.get(key), /r2_redirect_denied/);
    await assert.rejects(storage.list({ prefix: "status/" }), /r2_invalid_prefix/);
    await assert.rejects(storage.list({ prefix: "submissions/", limit: 1000 }), /r2_invalid_limit/);
    await assert.rejects(storage.list({ prefix: "submissions/", cursor: "x".repeat(3000) }), /r2_invalid_cursor/);
    const big = readonlyS3Storage(config, async () => new Response("x".repeat(70_000)));
    await assert.rejects(big.get(key), /r2_object_too_large/);
  });

  it("rejects malformed XML and non-submission listings", async () => {
    const xml = "<ListBucketResult><IsTruncated>false</IsTruncated><Contents><Key>reviews/unsafe.json</Key></Contents></ListBucketResult>";
    const storage = readonlyS3Storage(config, async () => new Response(xml));
    await assert.rejects(storage.list({ prefix: "submissions/" }), /r2_invalid_object_key/);
  });
  it("follows S3 pagination using the returned continuation token", async () => {
    const seen: (string | null)[] = [];
    const storage = readonlyS3Storage(config, async request => {
      const token = new URL(request.url).searchParams.get("continuation-token");
      seen.push(token);
      if (!token) return new Response(
        '<ListBucketResult><IsTruncated>true</IsTruncated><Contents><Key>' + key +
        '</Key></Contents><NextContinuationToken>page-two</NextContinuationToken></ListBucketResult>');
      assert.equal(token, "page-two");
      const nextKey = key.replace("11111111-1111-4111-8111-111111111111", "22222222-2222-4222-8222-222222222222");
      return new Response('<ListBucketResult><IsTruncated>false</IsTruncated><Contents><Key>' +
        nextKey + '</Key></Contents></ListBucketResult>');
    });
    const first = await storage.list({prefix: "submissions/korda/", limit: 1});
    assert.equal(first.truncated, true);
    assert.equal(first.cursor, "page-two");
    const second = await storage.list({prefix: "submissions/korda/", limit: 1, cursor: first.cursor});
    assert.equal(second.truncated, false);
    assert.equal("cursor" in second, false);
    assert.notEqual(first.objects[0].key, second.objects[0].key);
    assert.deepEqual(seen, [null, "page-two"]);
  });

  it("distinguishes rejected continuation tokens from S3 backend errors", async () => {
    const invalid = readonlyS3Storage(config, async () => new Response(
      '<Error><Code>InvalidArgument</Code><Message>Bad continuation token</Message></Error>',
      {status: 400, headers: {"Content-Type": "application/xml"}}));
    await assert.rejects(
      invalid.list({prefix: "submissions/", cursor: "bogus-token"}), /r2_invalid_cursor/);
    await assert.rejects(
      invalid.list({prefix: "submissions/"}), /r2_list_unavailable/);

    const unavailable = readonlyS3Storage(config, async () => new Response(
      '<Error><Code>AccessDenied</Code></Error>', {status: 403}));
    await assert.rejects(
      unavailable.list({prefix: "submissions/", cursor: "bogus-token"}), /r2_list_unavailable/);

    const genericBadRequest = readonlyS3Storage(config, async () => new Response(
      '<Error><Code>InvalidBucketName</Code></Error>', {status: 400}));
    await assert.rejects(
      genericBadRequest.list({prefix: "submissions/", cursor: "bogus-token"}), /r2_list_unavailable/);
  });

});
