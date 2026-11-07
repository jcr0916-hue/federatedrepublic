import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { instance, call, tokens, type Fixture } from "./runtime.ts";

const desks = ["corindal", "korda", "varek", "federal"];
const bearer = (desk: string) => "synthetic-" + desk + "-credential";
const headers = (token: string) => ({ Authorization: "Bearer " + token, "Content-Type": "application/json" });
type RecordData = { id: string; key: string; desk: string; status: string; [name: string]: any };
type RpcResponse = {
  jsonrpc: string; id: number;
  result: { content: { type: string; text: string }[]; isError?: boolean; tools?: { name: string }[] };
};
const invoke = (f: Fixture, token: string, name: string, args: Record<string, unknown> = {}) =>
  call(f, "/mcp", { method: "POST", headers: headers(token), body: JSON.stringify({
    jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args },
  }) });
async function tool(f: Fixture, token: string, name: string, args: Record<string, unknown> = {}) {
  const response = await invoke(f, token, name, args);
  assert.equal(response.status, 200);
  const body = await response.json() as RpcResponse;
  assert.equal(body.result.isError, false, body.result.content[0]?.text);
  return JSON.parse(body.result.content[0].text) as RecordData;
}
async function deniedTool(f: Fixture, token: string, name: string, args: Record<string, unknown> = {}) {
  const response = await invoke(f, token, name, args);
  assert.equal(response.status, 200); // Original MCP reports tool errors within a successful response.
  const body = await response.json() as RpcResponse;
  assert.equal(body.result.isError, true);
}
async function submit(f: Fixture, desk: string, extra: Record<string, unknown> = {}) {
  return tool(f, bearer(desk), "newsroom_submit", {
    title: "Unpublished " + desk, kind: "article", body: "Private draft from " + desk, ...extra,
  });
}
async function seed(f: Fixture, desk: string) {
  const id = randomUUID(), key = `submissions/${desk}/2026-11-06/${id}.json`;
  const record = {
    schemaVersion: 1, id, key, desk, kind: "article", title: "Seed " + desk,
    summary: "Private", body: "Unpublished", sourceRefs: [], submittedAt: "2026-11-06T18:00:00.000Z",
    status: "PROPOSED", nonCanonical: true,
  };
  const bucket = await f.mf.getR2Bucket("NEWSROOM");
  await bucket.put(key, JSON.stringify(record));
  return record;
}

describe("supplied Worker baseline and actual R2 handlers", () => {
  it("preserves the supplied source bytes and records their provenance", async () => {
    const source = await readFile("src/legacy.js");
    assert.equal(createHash("sha256").update(source.subarray(0, 7808)).digest("hex"),
      "8bd4c7352f6af43e4a6ff265671c7a832c4f37866e40f5f1022a14f45030db3a");
    assert.equal(source.subarray(7808).toString(),
      "\n\n// Integration exports only. The original 7,808 bytes above are preserved unchanged.\nexport { principal, mcp };\n");
  });

  it("matches original legacy responses through the real entrypoint without configured OAuth", async () => {
    const env = { GITHUB_CLIENT_SECRET: "" };
    const original = await instance({ entrypoint: "baseline", env });
    const integrated = await instance({ entrypoint: "production", env });
    const samples = [];
    for (const desk of desks) {
      const record = await seed(original, desk);
      const bucket = await integrated.mf.getR2Bucket("NEWSROOM");
      await bucket.put(record.key, JSON.stringify(record));
      samples.push(record);
    }
    const compare = async (path: string, init = {}) => {
      const [a, b] = await Promise.all([call(original, path, init), call(integrated, path, init)]);
      assert.equal(b.status, a.status, path);
      assert.deepEqual([...b.headers], [...a.headers], path);
      assert.deepEqual(await b.json(), await a.json(), path);
    };
    await compare("/health");
    await compare("/not-found");
    await compare("/v1/list");
    for (const desk of [...desks, "editorial"]) {
      const auth = headers(bearer(desk));
      await compare("/mcp", { headers: auth });
      await compare("/v1/list?desk=all", { headers: auth });
      await compare("/v1/read?key=" + encodeURIComponent(samples[0].key), { headers: auth });
      await compare("/v1/review", { method: "POST", headers: auth, body: JSON.stringify({ key: "invalid" }) });
      for (const method of ["initialize", "ping", "tools/list", "unknown"]) {
        await compare("/mcp", { method: "POST", headers: auth,
          body: JSON.stringify({ jsonrpc: "2.0", id: 1, method }) });
      }
    }
    assert.equal((await call(integrated, "/mcp", { method: "POST", body: "{}" })).status, 503);
    assert.deepEqual(integrated.calls, { token: 0, identity: 0 });
  });

  it("ignores forged desk, role, status, key and canonical fields on all four desks", async () => {
    const f = await instance({ original: true });
    const bucket = await f.mf.getR2Bucket("NEWSROOM");
    for (const desk of desks) {
      const created = await submit(f, desk, {
        desk: "editorial", editor: true, principal: { desk: "federal", editor: true },
        status: "ACCEPTED", nonCanonical: false, canonical: true, key: "status/forged.json", id: "forged",
      });
      assert.equal(created.desk, desk);
      assert.equal(created.status, "PROPOSED");
      assert.match(created.key, new RegExp("^submissions/" + desk + "/\\d{4}-\\d\\d-\\d\\d/[a-f\\d-]+\\.json$"));
      const stored = await (await bucket.get(created.key))!.json() as RecordData;
      assert.equal(stored.nonCanonical, true);
      assert.equal(stored.status, "PROPOSED");
      assert.equal(stored.desk, desk);
      assert.notEqual(stored.id, "forged");
      for (const field of ["editor", "principal", "canonical"]) assert.ok(!Object.hasOwn(stored, field));
    }
    assert.equal((await bucket.list()).objects.length, 4);
    assert.deepEqual(f.calls, { token: 0, identity: 0 });
  });

  it("pins list prefixes and pagination to the authenticated desk, including a foreign cursor", async () => {
    const f = await instance({ original: true });
    for (const desk of desks) for (let i = 0; i < 3; i++) await submit(f, desk, { title: desk + i });
    const foreign = await tool(f, bearer("federal"), "newsroom_list", { limit: 1 });
    assert.equal(foreign.more, true);
    for (const desk of desks) {
      const found = new Set<string>();
      let cursor: string | null = null;
      do {
        const page = await tool(f, bearer(desk), "newsroom_list", {
          desk: "all", editor: true, prefix: "submissions/", limit: 1, cursor,
        });
        assert.equal(page.items.length, 1);
        assert.equal(page.items[0].desk, desk);
        found.add(page.items[0].key);
        cursor = page.cursor;
        assert.ok(found.size <= 3, "pagination must terminate");
      } while (cursor);
      assert.equal(found.size, 3);
      const response = await invoke(f, bearer(desk), "newsroom_list", {
        desk: "federal", cursor: foreign.cursor, limit: 100,
      });
      const body = await response.json() as RpcResponse;
      if (!body.result.isError) {
        const page = JSON.parse(body.result.content[0].text);
        assert.ok(page.items.every((item: RecordData) => item.desk === desk));
      }
    }
    const editor = await tool(f, bearer("editorial"), "newsroom_list", { desk: "all", limit: 100 });
    assert.equal(editor.items.length, 12);
    assert.deepEqual(new Set(editor.items.map((x: RecordData) => x.desk)), new Set(desks));
  });

  it("denies other desks, prefix lookalikes and malformed/non-submission keys", async () => {
    const f = await instance({ original: true });
    const records = await Promise.all(desks.map(desk => submit(f, desk)));
    for (const desk of desks) {
      const own = records.find(x => x.desk === desk)!;
      assert.equal((await tool(f, bearer(desk), "newsroom_read", { key: own.key })).desk, desk);
      for (const other of records.filter(x => x.desk !== desk)) {
        await deniedTool(f, bearer(desk), "newsroom_read", { key: other.key, desk: other.desk, editor: true });
      }
      for (const key of [
        own.key.replace(desk, desk + "-extra"), own.key.replace(desk, desk + "/../federal"),
        own.key.replace("/" + desk + "/", "%2f" + desk + "%2f"), own.key + "\n",
        "status/" + own.id + ".json", "reviews/" + own.id + "/event.json", null, 7,
      ]) await deniedTool(f, bearer(desk), "newsroom_read", { key });
    }
  });

  it("keeps review editor-only, appends all statuses and preserves the unpublished submission", async () => {
    const f = await instance({ original: true });
    const created = await submit(f, "corindal");
    const bucket = await f.mf.getR2Bucket("NEWSROOM");
    const original = await (await bucket.get(created.key))!.text();
    for (const desk of desks) {
      await deniedTool(f, bearer(desk), "newsroom_review", {
        key: created.key, status: "ACCEPTED", note: "Forged editor", editor: true, desk: "editorial",
      });
    }
    const statuses = ["UNDER_REVIEW", "REVISION_REQUESTED", "ASSIGN", "ACCEPTED", "WATCH", "HOLD", "ARCHIVED", "REJECTED"];
    for (const status of statuses) {
      const event = await tool(f, bearer("editorial"), "newsroom_review", {
        key: created.key, status, note: "Unpublished editorial decision " + status, nonCanonical: false, publish: true,
      });
      assert.equal(event.status, status);
      assert.equal(event.actor, "editorial");
    }
    assert.equal(await (await bucket.get(created.key))!.text(), original);
    const history = await bucket.list({ prefix: "reviews/" + created.id + "/" });
    assert.equal(history.objects.length, 8);
    const editor = await tool(f, bearer("editorial"), "newsroom_read", { key: created.key });
    assert.equal(editor.status, "REJECTED");
    assert.equal(editor.nonCanonical, true);
    const agent = await tool(f, bearer("corindal"), "newsroom_read", { key: created.key });
    assert.equal(agent.status, "PROPOSED"); // Preserve the original agent view; only editors get the status overlay.
    assert.ok(!Object.hasOwn(agent, "editorialNote"));
    const agentList = await tool(f, bearer("corindal"), "newsroom_list");
    assert.equal(agentList.items[0].status, "PROPOSED");
    const editorList = await tool(f, bearer("editorial"), "newsroom_list");
    assert.equal(editorList.items[0].status, "REJECTED");
    assert.equal((await bucket.list()).objects.length, 10); // One original, eight events, one latest-status record.
    await deniedTool(f, bearer("editorial"), "newsroom_publish", { key: created.key });
  });

  it("uses the original handlers for OAuth reads and scoped review without enabling submission or publication", async () => {
    const f = await instance({ original: true });
    const records = await Promise.all(desks.map(desk => submit(f, desk)));
    const reader = await tokens(f);
    const list = await tool(f, reader.access_token, "newsroom_list", { desk: "all" });
    assert.deepEqual(new Set(list.items.map((x: RecordData) => x.desk)), new Set(desks));
    for (const record of records) {
      const read = await tool(f, reader.access_token, "newsroom_read", { key: record.key, desk: "federal", editor: false });
      assert.equal(read.id, record.id);
      assert.equal(read.nonCanonical, true);
    }
    assert.equal((await invoke(f, reader.access_token, "newsroom_review", {
      key: records[0].key, status: "ACCEPTED", note: "Missing review scope",
    })).status, 403);
    const blocked = async (token: string) => {
      for (const name of ["newsroom_submit", "newsroom_publish", "unknown_tool"]) {
        assert.equal((await invoke(f, token, name, { title: "New draft", body: "Forged", editor: true })).status, 403);
      }
      assert.equal((await call(f, "/v1/list", { headers: headers(token) })).status, 401);
    };
    await blocked(reader.access_token);
    const reviewer = await tokens(f, "newsroom:read newsroom:review");
    // The provider replaces this user's older grant when they explicitly reconnect.
    assert.equal((await invoke(f, reader.access_token, "newsroom_list")).status, 401);
    await blocked(reviewer.access_token);
    const event = await tool(f, reviewer.access_token, "newsroom_review", {
      key: records[0].key, status: "ACCEPTED", note: "Editorial acceptance is not publication", publish: true,
    });
    assert.equal(event.actor, "editorial");
    const read = await tool(f, reviewer.access_token, "newsroom_read", { key: records[0].key });
    assert.equal(read.status, "ACCEPTED");
    assert.equal(read.nonCanonical, true);
    const bucket = await f.mf.getR2Bucket("NEWSROOM");
    const objects = (await bucket.list()).objects;
    assert.equal(objects.length, 6);
    assert.ok(objects.every(x => /^(submissions|reviews|status)\//.test(x.key)));
    assert.deepEqual(f.calls, { token: 2, identity: 2 });
  });
});
