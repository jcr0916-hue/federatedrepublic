import fs from 'node:fs';

const base = (process.env.AI_BENCHMARK_BASE_URL || '').replace(/\/$/, '');
if (!base) {
  console.error('Set AI_BENCHMARK_BASE_URL to a preview or production origin.');
  process.exit(2);
}

const cases = JSON.parse(fs.readFileSync(new URL('./fixtures/crossroads-ai-cases.json', import.meta.url), 'utf8'));
let correct = 0;
let failed = 0;
const rows = [];

for (const test of cases) {
  const started = Date.now();
  try {
    const response = await fetch(base + '/api/crossroads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(test.body),
    });
    const data = await response.json();
    const pass = response.ok && data.fragment === test.expected;
    if (pass) correct++; else failed++;
    rows.push({
      name: test.name,
      expected: test.expected,
      actual: data.fragment || `HTTP ${response.status}`,
      pass,
      latencyMs: Date.now() - started,
    });
  } catch (error) {
    failed++;
    rows.push({
      name: test.name,
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
