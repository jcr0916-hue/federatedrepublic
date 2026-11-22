#!/usr/bin/env node
// Publication-time ledger for World records (see lib/world-published.mjs).
//   node scripts/world-stamp.mjs           add any record missing from _data/worldPublished.json
//   node scripts/world-stamp.mjs --check   exit nonzero if a record is missing, malformed or orphaned
import { readWorldInventory } from "../lib/world-authoring.mjs";
import path from "node:path";
import { readLedger, writeLedger, ledgerProblems, firstCommitTime, LEDGER_FILE } from "../lib/world-published.mjs";

function stampMissing(root = ".") {
  const ledger = readLedger(root);
  const added = [];
  for (const r of readWorldInventory(root)) {
    const id = r.data.worldId;
    if (id && !(id in ledger)) { ledger[id] = firstCommitTime(root, path.relative(root, r.sourcePath)); added.push(id); }
  }
  if (added.length) writeLedger(ledger, root);
  return added;
}

if (process.argv.includes("--check")) {
  const problems = ledgerProblems(readWorldInventory("."), readLedger("."));
  if (problems.length) { console.error(problems.join("\n")); process.exit(1); }
  console.log(`${LEDGER_FILE}: every World record has a publication time.`);
} else {
  const added = stampMissing(".");
  console.log(added.length ? `Stamped ${added.length} record(s): ${added.join(", ")}` : "Nothing to stamp.");
}
