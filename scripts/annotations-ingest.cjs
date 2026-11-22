#!/usr/bin/env node
// Merge reviewed annotations into annotations.json.
// Usage: node scripts/annotations-ingest.cjs <stage-dir-or-file> [...]
// Stage files hold blocks produced from the generator relay (api/annotations-generate):
//   @@ §2.5 | <packet hash> | <word count> | <model>
//   <annotation text, three paragraphs>
// Each block is checked before it is accepted: the hash must equal the provision's current
// packet hash, the word count must equal the relay's count (catches transcription slips), and
// the text must pass the quality gate. Rejected blocks are listed and nothing from them is kept.
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const STORE = path.join(ROOT, 'annotations.json');
const core = require('../api/_annotator-core.js');
const { packetHash, annotationLint } = require('../api/_annotator-run.js');

const valid = new Set(core.getConstitutionData().flatMap(a => a.provisions.map(p => p.num)));
const store = fs.existsSync(STORE) ? JSON.parse(fs.readFileSync(STORE, 'utf8')) : { version: 1, entries: {} };
store.entries = store.entries || {};

function files(arg) {
  const st = fs.statSync(arg);
  return st.isDirectory() ? fs.readdirSync(arg).filter(f => f.endsWith('.txt')).sort().map(f => path.join(arg, f)) : [arg];
}

let accepted = 0;
const rejected = [];
for (const arg of process.argv.slice(2)) {
  for (const file of files(arg)) {
    const blocks = fs.readFileSync(file, 'utf8').split(/^@@ /m).slice(1);
    for (const block of blocks) {
      const nl = block.indexOf('\n');
      const [num, hash, words, model] = block.slice(0, nl).split('|').map(x => x.trim());
      const text = block.slice(nl + 1).trim();
      const problems = [];
      if (!valid.has(num)) problems.push('not a provision');
      else if (packetHash(core.buildContextPacket(num)) !== hash) problems.push('hash does not match the current packet');
      const lint = annotationLint(text, valid);
      if (Number(words) !== lint.words) problems.push(`word count ${lint.words} != relay ${words} (transcription slip?)`);
      problems.push(...lint.issues);
      if (problems.length) { rejected.push(`${num}: ${problems.join('; ')}`); continue; }
      store.entries[num] = { hash, text, model, generatedAt: new Date().toISOString() };
      accepted++;
    }
  }
}
const ordered = {};
for (const num of core.getConstitutionData().flatMap(a => a.provisions.map(p => p.num))) {
  if (store.entries[num]) ordered[num] = store.entries[num];
}
store.entries = ordered;
fs.writeFileSync(STORE, JSON.stringify(store, null, 1) + '\n');
console.log(`Accepted ${accepted}; stored ${Object.keys(ordered).length}.`);
if (rejected.length) { console.log(`Rejected:\n${rejected.join('\n')}`); process.exit(1); }
