// Real publication times for World records, kept in one ledger so the 318 record
// files stay untouched. The republic map lights a State or Territory while it has a
// record published within the last LIT_HOURS. Routine (worldMundane) records never
// light a place.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

export const LIT_HOURS = 72;
export const LEDGER_FILE = "_data/worldPublished.json";
// Must match JURISDICTIONS in lib/world-metadata.mjs (States first, then Territories).
export const AREAS = [
  { name: "Harren", kind: "State" }, { name: "Merath", kind: "State" }, { name: "Orath", kind: "State" },
  { name: "Aldenmere", kind: "State" }, { name: "Caldenmere", kind: "State" }, { name: "Kelvant", kind: "State" },
  { name: "Selvane", kind: "State" }, { name: "Arvane", kind: "State" }, { name: "Varek", kind: "State" },
  { name: "Rhovane", kind: "State" }, { name: "Norvane", kind: "State" }, { name: "Corindal", kind: "State" },
  { name: "Korda", kind: "Territory" }, { name: "Morantine", kind: "Territory" },
  { name: "Solara", kind: "Territory" }, { name: "Verdmont", kind: "Territory" },
];

export const isStamp = (v) => typeof v === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(v) && !Number.isNaN(Date.parse(v));

export function readLedger(root = ".") {
  const file = path.join(root, LEDGER_FILE);
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : {};
}

export function writeLedger(ledger, root = ".") {
  const sorted = Object.fromEntries(Object.entries(ledger).sort(([a], [b]) => a.localeCompare(b, "en", { numeric: true })));
  fs.writeFileSync(path.join(root, LEDGER_FILE), JSON.stringify(sorted, null, 2) + "\n");
}

// Time the record file first entered the repository; the current time if it has not been committed yet.
export function firstCommitTime(root, relPath) {
  try {
    const out = execFileSync("git", ["log", "--diff-filter=A", "--format=%aI", "--", relPath], { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim().split("\n").filter(Boolean);
    if (out.length) return out[out.length - 1];
  } catch { /* no git history: fall through */ }
  return new Date().toISOString();
}

export function ledgerProblems(records, ledger) {
  const problems = [];
  const ids = new Set(records.map(r => r.data.worldId));
  for (const r of records) {
    const id = r.data.worldId;
    if (!(id in ledger)) problems.push(`${id}: no publication time in ${LEDGER_FILE} (run npm run world:stamp)`);
    else if (!isStamp(ledger[id])) problems.push(`${id}: invalid publication time "${ledger[id]}"`);
  }
  for (const id of Object.keys(ledger)) if (!ids.has(id)) problems.push(`${id}: in ${LEDGER_FILE} but no such World record`);
  return problems;
}

// pieces: Eleventy "world" collection entries (newest last). Returns one entry per area with
// its three newest non-routine records, each carrying its real publication time.
export function areaActivity(pieces, ledger, areas = AREAS) {
  const eligible = [...pieces].filter(p => !p.data.worldMundane && isStamp(ledger[p.data.worldId]))
    .sort((a, b) => Date.parse(ledger[b.data.worldId]) - Date.parse(ledger[a.data.worldId]) || (b.data.worldSeq ?? 0) - (a.data.worldSeq ?? 0));
  return areas.map(a => ({
    ...a, key: a.name.toLowerCase(),
    items: eligible.filter(p => (p.data.worldJurisdictions || []).includes(a.name)).slice(0, 3).map(p => ({
      url: p.url, title: p.data.worldTitle, outlet: p.data.worldOutlet || "", kind: p.data.worldKind,
      published: ledger[p.data.worldId], date: p.data.worldDate,
    })),
  }));
}
