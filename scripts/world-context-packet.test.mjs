import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildWorldContextPacket, extractSection } from '../lib/world-context-packet.mjs';

test('World context packet gives Korda authoring a bounded current canon packet', () => {
  const result = buildWorldContextPacket({ arc:'korda', dir:'.', recentNarrative:2, recentNrs:2 });

  assert.equal(result.frontier.worldSeq, 146);
  assert.equal(result.frontier.nrsSeq, 76);
  assert.equal(result.frontier.worldDate, '13.12');
  assert.deepEqual(result.recentNarrative.slice(0,2), ['torenthia-news-099.html','torenthia-news-097.html']);
  assert.deepEqual(result.recentNrs.slice(0,2), ['torenthia-nrs-073.html','torenthia-nrs-069.html']);

  assert.match(result.packet, /Korda Convention \[open\]/);
  assert.match(result.packet, /NRS-Y13-0737/);
  assert.match(result.packet, /The Committee Has Enough to Start Writing/);
  assert.match(result.packet, /\[§15\.5\.a\]/);
  assert.match(result.packet, /planning only, not published canon/i);
  assert.doesNotMatch(result.packet, /Sena Threll/);
  assert.doesNotMatch(result.packet, /Davin Kesh/);
});

test('section extraction stops before the next peer heading', () => {
  const doc = '## A\nintro\n### Wanted\nkeep\n#### child\nmore\n### Next\nstop\n## End\nno';
  assert.equal(extractSection(doc, 'Wanted'), '### Wanted\nkeep\n#### child\nmore');
});
