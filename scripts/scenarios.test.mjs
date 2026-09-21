import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {loadScenarios} from '../lib/scenarios.mjs';

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'scenarios-'));
  t.after(() => fs.rmSync(root, {recursive: true, force: true}));
  return root;
}
function write(root, name, metadata = '', body = '§2.6 ' + 'word '.repeat(440)) {
  fs.writeFileSync(path.join(root, name), `---\nscenarioCategory: dual-executive\n${metadata}---\n<html><head><meta name="description" content="Fallback &amp; description"></head><body><main><h1>Title &amp; more</h1><p class="scenario-subtitle">Source <em>subtitle</em>.</p><p>${body}</p><script>§99.1</script><style>§99.2</style></main></body></html>`);
}
test('new files supply catalog content, references, reading time and counts', t => {
  const root = fixture(t);
  write(root, 'scenario-new.html', 'scenarioStart: true\n');
  const result = loadScenarios(root);
  assert.equal(result.count, 1);
  assert.equal(result.provisionCount, 1);
  assert.equal(result.start[0].title, 'Title & more');
  assert.equal(result.entries[0].desc, 'Source subtitle.');
  assert.deepEqual(result.entries[0].refs, ['§2.6']);
  assert.equal(result.entries[0].minutes, 3);
  write(root, 'scenario-another.html', '', '§2.8 §2.6 §2.8');
  assert.equal(loadScenarios(root).count, 2);
  assert.equal(loadScenarios(root).provisionCount, 2);
});
test('explicit order precedes new unordered pages; ties sort by filename', t => {
  const root = fixture(t);
  write(root, 'scenario-a.html');
  write(root, 'scenario-z.html', 'scenarioOrder: 10\n');
  write(root, 'scenario-b.html', 'scenarioOrder: 10\n');
  assert.deepEqual(loadScenarios(root).categories.find(c => c.id === 'dual-executive').entries.map(e => e.href), ['scenario-b.html', 'scenario-z.html', 'scenario-a.html']);
});
test('invalid editorial metadata fails with the filename', t => {
  const root = fixture(t);
  write(root, 'scenario-bad.html', 'scenarioOrder: wrong\n');
  assert.throws(() => loadScenarios(root), /scenario-bad.html: scenarioOrder/);
  fs.writeFileSync(path.join(root, 'scenario-bad.html'), '<main><h1>Missing metadata</h1></main>');
  assert.throws(() => loadScenarios(root), /scenario-bad.html: missing or unknown scenarioCategory/);
});
test('legacy body layout and meta description remain discoverable', t => {
  const root = fixture(t);
  write(root, 'scenario-old.html');
  const file = path.join(root, 'scenario-old.html');
  fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace(/<\/?main>/g, '').replace(/<p class="scenario-subtitle">.*?<\/p>/, ''));
  assert.equal(loadScenarios(root).entries[0].desc, 'Fallback & description');
});
