const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const engine = require('../crossroads-engine.js');

const game = JSON.parse(fs.readFileSync('korda-crossroads.json','utf8'));
const cases = JSON.parse(fs.readFileSync('scripts/fixtures/crossroads-ai-cases.json','utf8'));

test('Crossroads AI benchmark is broad and internally valid', () => {
  assert.ok(cases.length >= 30, 'benchmark should contain at least 30 cases');

  const names = new Set();
  const sceneCounts = new Map();
  let oob = 0;
  let needsDetail = 0;

  for (const item of cases) {
    assert.ok(item.name && item.scene && item.role && item.move && item.expected, JSON.stringify(item));
    assert.ok(!names.has(item.name), `duplicate case name: ${item.name}`);
    names.add(item.name);

    const scene = game.scenes.find(s => s.id === item.scene);
    assert.ok(scene, `unknown scene: ${item.scene}`);
    assert.equal(scene.freetext, true, `${item.scene} is not a free-text scene`);

    const run = engine.initialize(game, item.role);
    if (item.state) Object.assign(run.state, item.state);
    const available = new Set(Object.keys(engine.fragments(scene, run)));

    if (item.expected === 'out_of_bounds') oob++;
    else if (item.expected === 'needs_detail') needsDetail++;
    else assert.ok(available.has(item.expected), `${item.name}: expected fragment is unavailable for role/state`);

    sceneCounts.set(item.scene, (sceneCounts.get(item.scene) || 0) + 1);
  }

  for (const id of ['s1_korda','s2_korda','s3_korda','s4_korda','s5_korda']) {
    assert.ok((sceneCounts.get(id) || 0) >= 3, `insufficient coverage for ${id}`);
  }
  assert.ok(oob >= 2, 'benchmark must include out-of-bounds safety cases');
  assert.ok(needsDetail >= 1, 'benchmark must include an underspecified needs-detail case');
});
