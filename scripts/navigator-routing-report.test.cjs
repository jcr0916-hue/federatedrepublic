const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');

test('Navigator routing report is deterministic and labels benchmark results as non-production', () => {
  const run = spawnSync(process.execPath, ['scripts/navigator-routing-report.cjs', '--json'], {
    encoding:'utf8',
  });
  assert.equal(run.status, 0, run.stderr);
  const report = JSON.parse(run.stdout);
  assert.equal(report.generatedFrom, 'current deterministic routing code');
  assert.equal(report.summaries.length, 3);

  const natural = report.summaries.find(x => x.name === 'natural-language');
  const gate = report.summaries.find(x => x.name === 'gate');
  const direct = report.summaries.find(x => x.name === 'explicit-direct');

  assert.equal(natural.total, 80);
  assert.equal(gate.total, 64);
  assert.equal(direct.total, 76);
  assert.equal(direct.sonnet, 0);
  assert.equal(direct.zeroAI, 76);
  assert.ok(natural.zeroAI > 0);
  assert.ok(natural.sonnet > 0);
});

test('Navigator route telemetry never requires or logs question text', () => {
  const { navigatorMetric } = require('../api/_navigator-metrics.js');
  const original = console.info;
  let logged;
  console.info = (_label, payload) => { logged = payload; };
  try {
    const payload = navigatorMetric({
      route:'sonnet-synthesis',
      aiCalls:1,
      answerState:'full',
      packetChars:4200,
      packetPrimaryCount:3,
      packetRelatedCount:2,
      matchedCount:5,
      resourceCount:7,
      shadowEnabled:false,
      question:'this should never be logged',
    });
    assert.equal(payload.route, 'sonnet-synthesis');
    assert.equal(payload.packetChars, 4200);
    assert.equal(payload.question, undefined);
    assert.equal(logged.question, undefined);
  } finally {
    console.info = original;
  }
});
