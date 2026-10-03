import test from 'node:test';
import assert from 'node:assert/strict';
import { buildEfficiencySnapshot } from './ai-efficiency-report.mjs';

test('AI efficiency report reflects bounded packet architecture and routing', () => {
  const snapshot = buildEfficiencySnapshot({dir:'.'});
  assert.ok(snapshot.constitution.provisions > 100);
  assert.ok(snapshot.annotator.packetChars.average < snapshot.constitution.fullTextChars);
  assert.ok(snapshot.annotator.averagePacketToFullConstitutionRatio < 0.5);
  assert.ok(snapshot.annotator.relatedProvisionCount.max <= 4);
  assert.equal(snapshot.navigator.benchmarkCases,80);
  assert.ok(snapshot.navigator.zeroAICases >= 56);
  assert.ok(snapshot.navigator.synthesisCases <= 24);
  assert.ok(snapshot.navigator.synthesisPacketChars.average > 0);
  assert.equal(snapshot.navigator.shadowDefault,'off');
  assert.equal(snapshot.torenthia.publicModelCalls,0);
  assert.equal(snapshot.torenthia.packets.length,4);
  for (const packet of snapshot.torenthia.packets) assert.ok(packet.packetChars > 1000);
});

test('AI efficiency report labels static token values as proxies rather than provider billing', () => {
  const snapshot = buildEfficiencySnapshot({dir:'.'});
  assert.match(snapshot.note,/token proxies.*static architecture measurements/i);
  assert.match(snapshot.note,/runtime \[annotator-metric\].*\[navigator-route\]/i);
});
