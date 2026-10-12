import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildWorldContextPacket, extractSection } from '../lib/world-context-packet.mjs';

test('World context packet gives Korda authoring a bounded current canon packet', () => {
  const result = buildWorldContextPacket({ arc:'korda', dir:'.', recentNarrative:2, recentNrs:2 });

  // The global publication frontier advances whenever a new World edition ships.
  // Test the packet contract rather than freezing yesterday's publication numbers.
  assert.ok(Number.isSafeInteger(result.frontier.worldSeq));
  assert.ok(Number.isSafeInteger(result.frontier.nrsSeq));
  assert.ok(result.frontier.worldSeq >= 154);
  assert.ok(result.frontier.nrsSeq >= 88);
  assert.match(result.frontier.worldDate, /^\\d{2,}\\.(0[1-9]|1[0-2])$/);
  assert.equal(result.recentNarrative.length, 2);
  assert.equal(result.recentNrs.length, 2);
  assert.ok(result.recentNarrative.every(file => /^torenthia-(news|sc|dispatch)-/.test(file)));
  assert.ok(result.recentNrs.every(file => /^torenthia-nrs-\\d+\\.html$/.test(file)));

  assert.match(result.packet, /Korda settlement ratification/);
  assert.match(result.packet, /NRS-Y13-0750/);
  assert.match(result.packet, /\\[§15\\.5\\.a\\]/);
  assert.match(result.packet, /affected-voter ratification/i);
  assert.doesNotMatch(result.packet, /Sena Threll/);
  assert.doesNotMatch(result.packet, /Davin Kesh/);
});

test('section extraction stops before the next peer heading', () => {
  const doc = '## A\nintro\n### Wanted\nkeep\n#### child\nmore\n### Next\nstop\n## End\nno';
  assert.equal(extractSection(doc, 'Wanted'), '### Wanted\nkeep\n#### child\nmore');
});
