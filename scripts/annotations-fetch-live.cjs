#!/usr/bin/env node
// Fetch annotations for the given provisions from the public annotate endpoint (live
// generation), apply the quality gate, and write passing ones as stage blocks for
// scripts/annotations-ingest.cjs. Failing outputs are listed; temperature-0 output still
// varies between calls, so running again often clears them, and the protected generator
// relay (api/annotations-generate, which retries against the gate) covers stubborn ones.
// Usage: node scripts/annotations-fetch-live.cjs <stage-file.txt> §2.5 §2.6 ...
const fs = require('node:fs');
const core = require('../api/_annotator-core.js');
const { packetHash, annotationLint } = require('../api/_annotator-run.js');

const ENDPOINT = process.env.ANNOTATE_URL || 'https://thefederatedrepublic.org/api/annotate';
const MODEL = process.env.ANNOTATE_MODEL_LABEL || 'anthropic/claude-sonnet-5';
const valid = new Set(core.getConstitutionData().flatMap(a => a.provisions.map(p => p.num)));
const [out, ...nums] = process.argv.slice(2);
if (!out || !nums.length) { console.error('Usage: annotations-fetch-live.cjs <stage-file> <§num>...'); process.exit(2); }

(async () => {
  const pass = [];
  const fail = [];
  const run = async (num) => {
    const ctx = core.buildContextPacket(num);
    if (!ctx) { fail.push(`${num}: unknown provision`); return; }
    const r = await fetch(ENDPOINT, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ num }) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j.annotation) { fail.push(`${num}: HTTP ${r.status} ${JSON.stringify(j).slice(0, 80)}`); return; }
    const lint = annotationLint(j.annotation, valid);
    const issues = j.truncated ? [...lint.issues, 'hit the output limit'] : lint.issues;
    if (issues.length) { fail.push(`${num}: ${issues.join('; ')}`); return; }
    pass.push(`@@ ${num} | ${packetHash(ctx)} | ${lint.words} | ${MODEL}\n${j.annotation.trim()}\n`);
  };
  const queue = [...nums];
  await Promise.all(Array.from({ length: 6 }, async () => { while (queue.length) await run(queue.shift()); }));
  if (pass.length) fs.writeFileSync(out, pass.join('\n'));
  console.log(`pass ${pass.length}, fail ${fail.length}`);
  fail.forEach(f => console.log(' x', f));
})();
