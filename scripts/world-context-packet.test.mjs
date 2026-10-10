import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildWorldContextPacket, extractSection } from '../lib/world-context-packet.mjs';

test('World context packet gives Korda authoring a bounded current canon packet', () => {
  const result = buildWorldContextPacket({ arc:'korda', dir:'.', recentNarrative:2, recentNrs:2 });

  assert.equal(result.frontier.worldSeq, 151);
  assert.equal(result.frontier.nrsSeq, 84);
  assert.equal(result.frontier.worldDate, '13.12');
  assert.deepEqual(result.recentNarrative.slice(0,2), ['torenthia-news-105.html','torenthia-news-104.html']);
  assert.deepEqual(result.recentNrs.slice(0,2), ['torenthia-nrs-084.html','torenthia-nrs-083.html']);

  assert.match(result.packet, /Korda Convention \[open\]/);
  assert.match(result.packet, /NRS-Y13-0748/);
  assert.match(result.packet, /The Votes No One Is Claiming/);
  assert.match(result.packet, /\[§15\.5\.a\]/);
  assert.match(result.packet, /planning only, not published canon/i);
  assert.doesNotMatch(result.packet, /Sena Threll/);
  assert.doesNotMatch(result.packet, /Davin Kesh/);
});

test('section extraction stops before the next peer heading', () => {
  const doc = '## A\nintro\n### Wanted\nkeep\n#### child\nmore\n### Next\nstop\n## End\nno';
  assert.equal(extractSection(doc, 'Wanted'), '### Wanted\nkeep\n#### child\nmore');
});
