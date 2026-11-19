#!/usr/bin/env node
// Cast, outlet and name checks for World records (see lib/world-registry.mjs).
//
//   node scripts/check-world-registry.mjs            records changed on this branch (or, without git, worldSeq above the baseline)
//   node scripts/check-world-registry.mjs --all      every World record
//   node scripts/check-world-registry.mjs --since N  worldSeq/nrsSeq at or above N
//   node scripts/check-world-registry.mjs --evidence pronoun counts for everyone in the registry
//   add --strict to exit nonzero when anything is flagged
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import matter from "gray-matter";
import { worldSourceFiles } from "../lib/world-authoring.mjs";
import { loadRegistry, analyzeRegistry, pronounEvidence } from "../lib/world-registry.mjs";

const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const sinceIdx = args.indexOf("--since");
const since = sinceIdx > -1 ? Number(args[sinceIdx + 1]) : null;
const BASELINE = 186;

function textOf(content) {
  return content
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, " ")
    .replace(/\s+/g, " ");
}

function changedPaths() {
  try {
    const run = (a) => execFileSync("git", a, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).split("\n").filter(Boolean);
    let diff = [];
    for (const base of ["origin/main", "main"]) {
      try { diff = run(["diff", "--name-only", `${base}...HEAD`]); break; } catch { /* try the next base */ }
    }
    return new Set([...diff, ...run(["diff", "--name-only"]), ...run(["ls-files", "-o", "--exclude-standard"])]);
  } catch { return null; }
}

const registry = loadRegistry();
const changed = !flag("--all") && since === null ? changedPaths() : null;
const records = [];
for (const { sourcePath } of worldSourceFiles(".")) {
  const parsed = matter(fs.readFileSync(sourcePath, "utf8"));
  if (!parsed.data.worldKind) continue;
  records.push({ file: sourcePath, data: parsed.data, body: textOf(parsed.content) });
}

if (flag("--evidence")) {
  for (const e of pronounEvidence(records, registry)) {
    if (e.he + e.she + e.they === 0) continue;
    console.log(`${e.name.padEnd(20)} he ${String(e.he).padStart(3)}  she ${String(e.she).padStart(3)}  they ${String(e.they).padStart(3)}  ${e.locked ? `locked ${e.pronouns}` : "not locked"}`);
  }
  process.exit(0);
}

const seqOf = (d) => Number(d.worldKind === "nrs" ? d.nrsSeq : d.worldSeq);
const selected = records.filter((r) => {
  if (flag("--all")) return true;
  if (since !== null) return seqOf(r.data) >= since;
  if (changed) return changed.has(r.file);
  return seqOf(r.data) > BASELINE;
});

let warnings = 0;
for (const r of selected) {
  for (const hit of analyzeRegistry(r.data, r.body, registry)) {
    warnings++;
    console.warn(`[world registry] ${r.file}: ${hit.message}`);
  }
}
if (warnings) {
  console.warn(`[world registry] ${warnings} flag(s) across ${selected.length} World record(s). Fix the text, or update _data/worldRegistry.json if the registry is out of date.`);
  if (flag("--strict")) process.exit(1);
} else {
  console.log(`[world registry] checked ${selected.length} World record(s); no cast, outlet or name problems found.`);
}
