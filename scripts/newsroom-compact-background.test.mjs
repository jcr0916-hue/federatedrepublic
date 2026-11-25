import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const core = require('../api/_newsroom-core.js');

const roster = JSON.parse(fs.readFileSync(core.ROSTER_PATH, 'utf8'));
const TERRITORIES = ['korda', 'solara', 'morantine', 'verdmont'];
const COMPACTS = {
  korda: 'docs/torenthia/KORDA-TERRITORIAL-COMPACT.md',
  solara: 'docs/torenthia/territorial-compacts/SOLARA-TERRITORIAL-COMPACT-v0.3-APPROVED-EDITORIAL.md',
  morantine: 'docs/torenthia/territorial-compacts/MORANTINE-TERRITORIAL-COMPACT-v0.2-APPROVED-EDITORIAL.md',
  verdmont: 'docs/torenthia/territorial-compacts/VERDMONT-TERRITORIAL-COMPACT-v0.2-APPROVED-EDITORIAL.md',
};

test('each Territory desk reads its own Compact and the shared background file', () => {
  for (const id of TERRITORIES) {
    const desk = roster.desks.find((d) => d.id === id);
    assert.ok(desk, id);
    assert.ok(desk.sources.includes(COMPACTS[id]), `${id} reads its Compact`);
    assert.ok(desk.sources.includes('docs/torenthia/agents/COMPACT-BACKGROUND.md'), `${id} reads the background file`);
    for (const s of desk.sources) assert.ok(fs.existsSync(s), `${id}: ${s}`);
    const total = desk.sources.reduce((n, s) => n + fs.statSync(s).size, 0);
    assert.ok(total < 80000, `${id}: sources (${total} chars) fit the 80,000-character desk limit, so the Compact is not truncated`);
  }
});

test('each Territory desk has the compact-background assignment open, and it names the shared file', () => {
  for (const id of TERRITORIES) {
    const text = fs.readFileSync(`docs/torenthia/agents/${id}/ASSIGNMENTS.md`, 'utf8');
    const open = text.split('## Open')[1].split('## Done')[0];
    assert.match(open, /COMPACT-BACKGROUND\.md/, id);
    assert.ok(core.hasOpenAssignment(text), `${id} has an open assignment the runner recognizes`);
  }
});

test('working reports from the Territory desks go straight to the Central Editor', () => {
  for (const id of TERRITORIES) assert.ok(roster.triage.passThroughReports.includes(id), id);
  assert.ok(roster.triage.passThroughReports.includes('monitors') && roster.triage.passThroughReports.includes('corindal'));
});

test('the Territory desks run on their normal schedule: no desk moved to make room for the assignment', () => {
  const days = Object.fromEntries(TERRITORIES.map((id) => [id, roster.desks.find((d) => d.id === id).days.join(',')]));
  assert.deepEqual(days, { korda: 'tue,fri', solara: 'tue', morantine: 'wed', verdmont: 'sun' });
});
