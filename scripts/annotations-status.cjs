#!/usr/bin/env node
// Report on stored annotations: how many are fresh against the current source packets,
// which provisions need (re)generation, and any quality-gate failures.
const store = require('../annotations.json');
const core = require('../api/_annotator-core.js');
const { packetHash, annotationLint } = require('../api/_annotator-run.js');

const nums = core.getConstitutionData().flatMap(a => a.provisions.map(p => p.num));
const valid = new Set(nums);
const stale = [];
const failing = [];
let fresh = 0;
for (const num of nums) {
  const entry = (store.entries || {})[num];
  if (entry && entry.text && entry.hash === packetHash(core.buildContextPacket(num))) fresh++;
  else stale.push(num);
  if (entry) {
    const { issues } = annotationLint(entry.text, valid);
    if (issues.length) failing.push(`${num}: ${issues.join('; ')}`);
  }
}
console.log(`Stored annotations: ${fresh} fresh of ${nums.length}; ${stale.length} need generation.`);
if (stale.length) console.log(`Need generation: ${stale.join(', ')}`);
if (failing.length) { console.log(`Quality-gate failures:\n${failing.join('\n')}`); process.exit(1); }
