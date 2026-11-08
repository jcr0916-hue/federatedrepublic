import { it } from "node:test";
import assert from "node:assert/strict";
import { readonlyStorage } from "../src/readonly-storage.ts";

it("hands read handlers only frozen bound get/list capabilities, without R2 mutators", async () => {
  const calls: string[] = [];
  const bucket = {
    get: (async function(this: unknown) {
      assert.equal(this, bucket); calls.push("get"); return null;
    }) as R2Bucket["get"],
    list: (async function(this: unknown) {
      assert.equal(this, bucket); calls.push("list");
      return { objects: [], truncated: false, delimitedPrefixes: [] };
    }) as R2Bucket["list"],
    put: () => assert.fail("write reached raw bucket"),
    delete: () => assert.fail("delete reached raw bucket"),
  };
  const view = readonlyStorage(bucket);
  assert.equal(Object.isFrozen(view), true);
  assert.deepEqual(Object.keys(view).sort(), ["get", "list"]);
  for (const name of ["put", "delete", "createMultipartUpload", "resumeMultipartUpload"])
    assert.equal(Reflect.get(view, name), undefined, name);
  await view.get("synthetic"); await view.list();
  assert.deepEqual(calls, ["get", "list"]);
});
