import test from "node:test";
import assert from "node:assert/strict";
import { loadRegistry, analyzeRegistry, outletKey, editDistance } from "../lib/world-registry.mjs";

const reg = {
  outlets: [{ name: "The Torenthian" }, { name: "RNN", aliases: ["Republic News Network"] }],
  deskBylinePattern: "(Desk|Staff)$",
  people: [
    { id: "dara-voss", name: "Dara Voss", outlets: ["RNN", "The Torenthian"] },
    { id: "mara-iset", name: "Mara Iset", outlets: ["The Torenthian"] },
    { id: "ines-carrow", name: "Ines Carrow", aliases: ["Carrow"], pronouns: "she", pronounsLocked: true },
    { id: "casimir-rehn", name: "Casimir Rehn", aliases: ["Rehn"], pronouns: "he", pronounsLocked: true },
    { id: "aldous-fenn", name: "Aldous Fenn" },
    { id: "aleth-fenn", name: "Aleth Fenn", outlets: ["The Torenthian"] },
  ],
  avoid: [{ pattern: "Jorin Sandris", reason: "slip" }],
  collisions: [{ names: ["Aldous Fenn", "Aleth Fenn"], note: "unrelated" }],
};
const base = { worldKind: "news", worldTitle: "T", worldBlurb: "B", worldAuthor: "Dara Voss", worldOutlet: "RNN" };
const kinds = (w) => w.map((x) => x.kind);

test("a clean record has no flags", () => {
  assert.deepEqual(analyzeRegistry(base, "Carrow spoke, and she left. Rehn said he agreed.", reg), []);
});

test("avoided names are flagged", () => {
  assert.deepEqual(kinds(analyzeRegistry(base, "Jorin Sandris spoke.", reg)), ["avoid"]);
});

test("a bare surname is flagged only when both full names appear", () => {
  assert.deepEqual(kinds(analyzeRegistry(base, "Aleth Fenn wrote that Fenn was late.", reg)), []);
  assert.deepEqual(kinds(analyzeRegistry(base, "Aleth Fenn met Aldous Fenn. Later Fenn left.", reg)), ["collision"]);
  assert.deepEqual(kinds(analyzeRegistry(base, "Aleth Fenn met Aldous Fenn. Later Aleth Fenn left.", reg)), []);
});

test("outlets: aliases resolve, a wrong outlet for a byline is flagged, unknown outlets are flagged", () => {
  assert.equal(outletKey("Republic News Network", reg), "RNN");
  assert.deepEqual(kinds(analyzeRegistry({ ...base, worldOutlet: "Republic News Network" }, "x", reg)), []);
  assert.deepEqual(kinds(analyzeRegistry({ ...base, worldAuthor: "Mara Iset", worldOutlet: "RNN" }, "x", reg)), ["outlet"]);
  assert.deepEqual(kinds(analyzeRegistry({ ...base, worldOutlet: "The Daily Nothing" }, "x", reg)), ["outlet"]);
});

test("new bylines are flagged; near first names are called out; desk bylines are skipped", () => {
  const w = analyzeRegistry({ ...base, worldAuthor: "Mira Kael", worldOutlet: "The Torenthian" }, "x", reg);
  assert.deepEqual(kinds(w), ["byline"]);
  assert.match(w[0].message, /Mara Iset/);
  assert.deepEqual(kinds(analyzeRegistry({ ...base, worldAuthor: "TNB News Desk", worldOutlet: "RNN" }, "x", reg)), []);
});

test("locked pronouns are checked in the sentence after the name", () => {
  const w = analyzeRegistry(base, "Carrow said he would travel to Valedon.", reg);
  assert.deepEqual(kinds(w), ["pronoun"]);
  assert.match(w[0].message, /Ines Carrow/);
});

test("a pronoun that may belong to another named person is not flagged", () => {
  assert.deepEqual(analyzeRegistry(base, "Carrow told Rehn he would travel.", reg), []);
});

test("edit distance", () => {
  assert.equal(editDistance("Mara", "Mira"), 1);
  assert.equal(editDistance("Mara", "Maren"), 2);
  assert.equal(editDistance("Mara", "Petra"), 3);
});

test("the real registry is internally consistent", () => {
  const r = loadRegistry();
  const ids = r.people.map((p) => p.id);
  assert.equal(new Set(ids).size, ids.length, "person ids are unique");
  const outlets = new Set(r.outlets.map((o) => o.name));
  for (const p of r.people) for (const o of p.outlets || []) assert.ok(outlets.has(o), `${p.name}: outlet ${o} is registered`);
  for (const t of r.threads) for (const id of t.people || []) assert.ok(ids.includes(id), `${t.id}: ${id} is a registered person`);
  for (const p of r.people) if (p.pronounsLocked) assert.ok(["he", "she", "they"].includes(p.pronouns), `${p.name}: locked pronouns are set`);
  for (const a of r.avoid) assert.doesNotThrow(() => new RegExp(a.pattern));
});
