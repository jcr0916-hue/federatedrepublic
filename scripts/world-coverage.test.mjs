import test from "node:test";
import assert from "node:assert/strict";
import { buildCoverage, renderCoverage } from "../lib/world-coverage.mjs";

const registry = {
  outlets: [{ name: "The Torenthian" }, { name: "RNN", aliases: ["Republic News Network"] }],
  people: [{ id: "ines-carrow", name: "Ines Carrow", aliases: ["Carrow"] }, { id: "seren-mak", name: "Seren Mak", aliases: ["Mak"] }],
  threads: [
    { id: "lc-election", title: "LC election", people: ["ines-carrow", "seren-mak"], keywords: ["election", "ballot", "candidate"] },
    { id: "korda", title: "Korda", arcs: ["korda"] },
  ],
};
const story = (seq, over = {}) => ({ file: `n${seq}.html`, body: "Plain text.", data: { worldKind: "news", worldSeq: seq, worldOutlet: "The Torenthian", worldAuthor: "Petra Vend", worldArcs: [], worldJurisdictions: [], ...over } });
const nrs = (seq, over = {}) => ({ file: `r${seq}.html`, body: "Record.", data: { worldKind: "nrs", nrsSeq: seq, worldJurisdictions: [], ...over } });

test("windows, frontier and shares", () => {
  const recs = [];
  for (let i = 1; i <= 12; i++) recs.push(story(i, i % 2 ? { worldOutlet: "Republic News Network", worldAuthor: "Dara Voss" } : {}));
  recs.push(nrs(1), nrs(2));
  const c = buildCoverage(recs, registry, { storyWindow: 10, nrsWindow: 5 });
  assert.deepEqual(c.frontier, { worldSeq: 12, nrsSeq: 2 });
  assert.equal(c.window.stories, 10);
  assert.equal(c.window.firstSeq, 3);
  assert.deepEqual(c.byOutlet.map(([n, k]) => [n, k]), [["RNN", 5], ["The Torenthian", 5]]);
});

test("concentration is flagged above the threshold, only for a window of ten or more", () => {
  const many = Array.from({ length: 10 }, (_, i) => story(i + 1));
  assert.ok(buildCoverage(many, registry).flags.some((f) => /The Torenthian wrote 10 of the last 10/.test(f)));
  const few = Array.from({ length: 5 }, (_, i) => story(i + 1));
  assert.ok(!buildCoverage(few, registry).flags.some((f) => /wrote/.test(f)));
});

test("a thread matches on arcs, keywords and named people; quiet candidates are flagged", () => {
  const recs = Array.from({ length: 12 }, (_, i) => story(i + 1));
  recs[2] = story(3, { worldArcs: ["korda"] });
  recs[0] = { ...story(1), body: "Carrow filed as a candidate before the election ballot was drawn." };
  const c = buildCoverage(recs, registry, { storyWindow: 12 });
  const korda = c.threads.find((t) => t.id === "korda");
  const lc = c.threads.find((t) => t.id === "lc-election");
  assert.equal(korda.inWindow, 1);
  assert.equal(lc.inWindow, 1);
  const carrow = lc.people.find((p) => p.name === "Ines Carrow");
  assert.equal(carrow.inWindow, 1);
  assert.equal(carrow.lastSeq, 1);
  assert.ok(c.flags.some((f) => /Ines Carrow is not named in the last 10/.test(f)));
  assert.ok(c.flags.some((f) => /Seren Mak is not named in the last 10/.test(f)));
});

test("jurisdictions with no story or NRS in the window are flagged; the report renders", () => {
  const recs = [story(1, { worldJurisdictions: ["Korda"] }), nrs(1, { worldJurisdictions: ["Varek"] })];
  const c = buildCoverage(recs, registry);
  assert.ok(c.flags.some((f) => /No story or NRS record in the window for: .*Merath/.test(f)));
  const md = renderCoverage(c);
  assert.match(md, /^# World coverage/);
  assert.match(md, /\| Korda \| 1 \| 0 \|/);
});
