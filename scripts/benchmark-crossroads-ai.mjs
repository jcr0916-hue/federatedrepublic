import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const engine = require('../crossroads-engine.js');

const base = (process.env.AI_BENCHMARK_BASE_URL || '').replace(/\/$/, '');
if (!base) {
  console.error('Set AI_BENCHMARK_BASE_URL to a preview or production origin.');
  process.exit(2);
}

const cases = JSON.parse(fs.readFileSync(new URL('./fixtures/crossroads-ai-cases.json', import.meta.url), 'utf8'));
const game = JSON.parse(fs.readFileSync(new URL('../korda-crossroads.json', import.meta.url), 'utf8'));

function bodyFor(test) {
  const scene = game.scenes.find(s => s.id === test.scene);
  if (!scene) throw new Error(`Unknown benchmark scene: ${test.scene}`);

  const run = engine.initialize(game, test.role);
  if (test.state) Object.assign(run.state, test.state);

  const fragments = Object.entries(engine.fragments(scene, run))
    .map(([id, fragment]) => ({ id, desc: fragment.desc || '' }));

  const allowed = new Set(fragments.map(f => f.id));
  if (!['out_of_bounds', 'needs_detail'].includes(test.expected) && !allowed.has(test.expected)) {
    throw new Error(`Benchmark case "${test.name}" expects unavailable fragment ${test.expected}`);
  }

  return {
    move: test.move,
    sceneTitle: scene.title,
    sceneBody: String(scene.body || '').replace(/<[^>]+>/g, ''),
    dimensions: scene.dimensions || ['who', 'what', 'how'],
    fragments,
  };
}

let correct = 0;
let failed = 0;
const rows = [];

for (const test of cases) {
  const started = Date.now();
  try {
    const response = await fetch(base + '/api/crossroads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyFor(test)),
    });
    const data = await response.json();
    const pass = response.ok && data.fragment === test.expected;
    if (pass) correct++; else failed++;
    rows.push({
      name: test.name,
      scene: test.scene,
      role: test.role,
      expected: test.expected,
      actual: data.fragment || `HTTP ${response.status}`,
      pass,
      latencyMs: Date.now() - started,
    });
  } catch (error) {
    failed++;
    rows.push({
      name: test.name,
      scene: test.scene,
      role: test.role,
      expected: test.expected,
      actual: String(error),
      pass: false,
      latencyMs: Date.now() - started,
    });
  }
}

console.table(rows);
console.log(JSON.stringify({
  target: base,
  cases: cases.length,
  correct,
  failed,
  accuracy: cases.length ? correct / cases.length : 0,
}, null, 2));

if (failed) process.exitCode = 1;
