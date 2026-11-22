import test from 'node:test';
import assert from 'node:assert/strict';
import { AREAS, LIT_HOURS, areaActivity, ledgerProblems, isStamp, readLedger } from '../lib/world-published.mjs';
import { JURISDICTIONS } from '../lib/world-metadata.mjs';
import { readWorldInventory } from '../lib/world-authoring.mjs';
import points from '../_data/areaPoints.js';

const piece = (id, juris, extra = {}) => ({ url: `/${id}.html`, data: { worldId: id, worldTitle: id, worldKind: 'news', worldDate: '14.02', worldSeq: Number(id.replace(/\D/g, '')) || 1, worldJurisdictions: juris, ...extra } });

test('map areas are exactly the World jurisdictions, each with a map position', () => {
  assert.deepEqual(AREAS.map(a => a.name).sort(), [...JURISDICTIONS].sort());
  for (const a of AREAS) {
    const p = points[a.name];
    assert.ok(p && p.left > 0 && p.left < 100 && p.top > 0 && p.top < 100, `${a.name} has a map position`);
  }
});

test('a place lights from its newest non-routine records, newest first, three at most', () => {
  const ledger = { n1: '2026-11-01T10:00:00-08:00', n2: '2026-11-20T10:00:00-08:00', n3: '2026-11-19T10:00:00-08:00', n4: '2026-11-18T10:00:00-08:00', n5: '2026-11-21T10:00:00-08:00' };
  const pieces = [piece('n1', ['Korda']), piece('n2', ['Korda']), piece('n3', ['Korda']), piece('n4', ['Korda']), piece('n5', ['Korda'], { worldMundane: true })];
  const korda = areaActivity(pieces, ledger).find(a => a.name === 'Korda');
  assert.deepEqual(korda.items.map(i => i.title), ['n2', 'n3', 'n4'], 'routine record skipped, newest first, capped at three');
  assert.equal(areaActivity(pieces, ledger).find(a => a.name === 'Harren').items.length, 0);
});

test('records without a valid publication time never light a place', () => {
  const items = areaActivity([piece('n1', ['Orath']), piece('n2', ['Orath'])], { n2: 'yesterday' }).find(a => a.name === 'Orath').items;
  assert.equal(items.length, 0);
});

test('the ledger check reports missing, malformed and orphaned entries', () => {
  const records = [piece('a', []), piece('b', []), piece('c', [])];
  const problems = ledgerProblems(records, { a: '2026-11-20T10:00:00Z', b: 'soon', zzz: '2026-11-20T10:00:00Z' });
  assert.equal(problems.length, 3);
  assert.ok(problems.some(p => p.startsWith('c:')) && problems.some(p => p.startsWith('b:')) && problems.some(p => p.startsWith('zzz:')));
  assert.ok(isStamp('2026-11-21T13:37:51-08:00') && !isStamp('2026-11-21'));
});

test('every published World record has a publication time', () => {
  assert.deepEqual(ledgerProblems(readWorldInventory('.'), readLedger('.')), []);
  assert.equal(LIT_HOURS, 72);
});
