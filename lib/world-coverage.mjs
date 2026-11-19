// Coverage counts for the World, computed from published front matter and text.
//
// No model is involved: the counts are exact, so the Central Editor and the tracker desks
// can read where coverage is heavy or thin instead of rebuilding that picture by hand.
// Windows count records (the last N stories and the last M NRS records), not calendar days,
// because published records carry fictional dates, not real ones.

import { outletKey } from "./world-registry.mjs";

const escapeRe = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const JURISDICTIONS = [
  "Harren", "Merath", "Orath", "Aldenmere", "Caldenmere", "Kelvant", "Selvane", "Arvane",
  "Varek", "Rhovane", "Norvane", "Corindal", "Korda", "Morantine", "Solara", "Verdmont",
];

const seqOf = (r) => Number(r.data.worldKind === "nrs" ? r.data.nrsSeq : r.data.worldSeq);
const pct = (n, d) => (d ? Math.round((n / d) * 100) : 0);

function mentions(body, person) {
  const names = [person.name, ...(person.aliases || [])].filter((n) => !/^Director /.test(n));
  return names.some((n) => new RegExp(`\\b${escapeRe(n)}\\b`).test(body));
}

function tally(items, pick) {
  const m = new Map();
  for (const r of items) for (const k of [].concat(pick(r) || [])) if (k) m.set(k, (m.get(k) || 0) + 1);
  return [...m.entries()].sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])));
}

function threadMatch(thread, r, registry) {
  if ((thread.arcs || []).some((a) => (r.data.worldArcs || []).includes(a))) return true;
  const people = (thread.people || []).map((id) => (registry.people || []).find((p) => p.id === id)).filter(Boolean);
  const named = people.filter((p) => mentions(r.body, p)).length;
  const text = `${r.data.worldTitle || ""} ${r.data.worldBlurb || ""} ${r.body}`.toLowerCase();
  const kw = (thread.keywords || []).filter((k) => text.includes(k.toLowerCase())).length;
  if (thread.keywords && thread.keywords.length) return kw >= 2 && (named >= 1 || kw >= 3);
  return named >= 2;
}

export function buildCoverage(records, registry, { storyWindow = 20, nrsWindow = 40, concentration = 35 } = {}) {
  const stories = records.filter((r) => r.data.worldKind && r.data.worldKind !== "nrs").sort((a, b) => seqOf(a) - seqOf(b));
  const nrs = records.filter((r) => r.data.worldKind === "nrs").sort((a, b) => seqOf(a) - seqOf(b));
  const frontier = { worldSeq: stories.length ? seqOf(stories[stories.length - 1]) : 0, nrsSeq: nrs.length ? seqOf(nrs[nrs.length - 1]) : 0 };
  const win = stories.slice(-storyWindow);
  const nrsWin = nrs.slice(-nrsWindow);
  const outletOf = (r) => outletKey(r.data.worldOutlet, registry) || r.data.worldOutlet;

  const byOutlet = tally(win, outletOf);
  const byAuthor = tally(win, (r) => r.data.worldAuthor);
  const byJurisdiction = tally(win, (r) => r.data.worldJurisdictions);
  const byArc = tally(win, (r) => r.data.worldArcs);
  const nrsByJurisdiction = tally(nrsWin, (r) => r.data.worldJurisdictions);

  const lastSeq = (items, test) => {
    let last = null;
    for (const r of items) if (test(r)) last = seqOf(r);
    return last;
  };
  const arcNames = [...new Set(records.flatMap((r) => r.data.worldArcs || []))].sort();
  const arcs = arcNames.map((arc) => ({
    arc,
    inWindow: win.filter((r) => (r.data.worldArcs || []).includes(arc)).length,
    lastSeq: lastSeq(stories, (r) => (r.data.worldArcs || []).includes(arc)),
  }));
  const jurisdictions = JURISDICTIONS.map((j) => ({
    name: j,
    stories: win.filter((r) => (r.data.worldJurisdictions || []).includes(j)).length,
    records: nrsWin.filter((r) => (r.data.worldJurisdictions || []).includes(j)).length,
    lastStory: lastSeq(stories, (r) => (r.data.worldJurisdictions || []).includes(j)),
  }));

  const recent = stories.slice(-10);
  const threads = (registry.threads || []).map((t) => {
    const items = win.filter((r) => threadMatch(t, r, registry));
    const people = (t.people || []).map((id) => (registry.people || []).find((p) => p.id === id)).filter(Boolean).map((p) => ({
      name: p.name,
      inWindow: win.filter((r) => mentions(r.body, p)).length,
      inRecent: recent.filter((r) => mentions(r.body, p)).length,
      lastSeq: lastSeq(stories, (r) => mentions(r.body, p)),
    }));
    return { id: t.id, title: t.title, tracker: t.tracker || null, inWindow: items.length, lastSeq: lastSeq(stories, (r) => threadMatch(t, r, registry)), people };
  });

  const flags = [];
  if (win.length >= 10) {
    for (const [name, n] of byOutlet) if (pct(n, win.length) > concentration) flags.push(`${name} wrote ${n} of the last ${win.length} stories (${pct(n, win.length)}%).`);
    for (const [name, n] of byAuthor) if (pct(n, win.length) > concentration) flags.push(`${name} has ${n} of the last ${win.length} bylines (${pct(n, win.length)}%).`);
  }
  for (const a of arcs) if (!a.inWindow) flags.push(`The ${a.arc} arc has no story in the last ${win.length}${a.lastSeq ? ` (latest: worldSeq ${a.lastSeq})` : ""}.`);
  const quiet = jurisdictions.filter((j) => !j.stories && !j.records).map((j) => j.name);
  if (quiet.length) flags.push(`No story or NRS record in the window for: ${quiet.join(", ")}.`);
  for (const t of threads) {
    if (!t.inWindow) flags.push(`Thread "${t.title}" has no story in the last ${win.length}.`);
    for (const p of t.people) if (!p.inRecent && t.id === "lc-election") flags.push(`${p.name} is not named in the last ${recent.length} stories.`);
  }
  return { frontier, window: { stories: win.length, nrs: nrsWin.length, firstSeq: win.length ? seqOf(win[0]) : null, nrsFirstSeq: nrsWin.length ? seqOf(nrsWin[0]) : null }, byOutlet, byAuthor, byJurisdiction, byArc, nrsByJurisdiction, arcs, jurisdictions, threads, flags };
}

const table = (head, rows) => [`| ${head.join(" | ")} |`, `|${head.map(() => "---").join("|")}|`, ...rows.map((r) => `| ${r.join(" | ")} |`)].join("\n");
const ago = (seq, frontier) => (seq == null ? "never" : seq === frontier ? "latest" : `${frontier - seq} back`);

export function renderCoverage(c) {
  const w = c.window;
  const out = [
    "# World coverage",
    "",
    `Generated by \`npm run world:coverage -- --write\` from published World records. Do not edit by hand. Frontier: worldSeq **${c.frontier.worldSeq}**, nrsSeq **${c.frontier.nrsSeq}**. Window: the last **${w.stories}** stories (worldSeq ${w.firstSeq} to ${c.frontier.worldSeq}) and the last **${w.nrs}** NRS records (nrsSeq ${w.nrsFirstSeq} to ${c.frontier.nrsSeq}). Counts are exact; what they mean is for the editor and the tracker desks to judge.`,
    "",
    "## Flags",
    "",
    ...(c.flags.length ? c.flags.map((f) => `- ${f}`) : ["- None."]),
    "",
    "## Threads",
    "",
    table(["Thread", "Stories in window", "Latest"], c.threads.map((t) => [t.title, String(t.inWindow), ago(t.lastSeq, c.frontier.worldSeq)])),
    "",
  ];
  for (const t of c.threads.filter((x) => x.people.length)) {
    out.push(`### ${t.title}: people`, "", table(["Person", "Stories in window", "In last 10", "Latest"], t.people.map((p) => [p.name, String(p.inWindow), String(p.inRecent), ago(p.lastSeq, c.frontier.worldSeq)])), "");
  }
  out.push(
    "## Arcs", "", table(["Arc", "Stories in window", "Latest"], c.arcs.map((a) => [a.arc, String(a.inWindow), ago(a.lastSeq, c.frontier.worldSeq)])), "",
    "## Jurisdictions", "", table(["Jurisdiction", "Stories in window", "NRS in window", "Latest story"], c.jurisdictions.map((j) => [j.name, String(j.stories), String(j.records), ago(j.lastStory, c.frontier.worldSeq)])), "",
    "## Outlets (stories in window)", "", table(["Outlet", "Stories", "Share"], c.byOutlet.map(([n, k]) => [n, String(k), `${pct(k, w.stories)}%`])), "",
    "## Bylines (stories in window)", "", table(["Byline", "Stories", "Share"], c.byAuthor.map(([n, k]) => [n, String(k), `${pct(k, w.stories)}%`])), "",
  );
  return out.join("\n");
}
