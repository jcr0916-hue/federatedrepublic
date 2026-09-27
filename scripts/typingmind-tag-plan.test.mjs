import test from 'node:test';
import assert from 'node:assert/strict';
import { classify, buildPlan } from './typingmind-tag-plan.mjs';

test('explicit core records and supporting coverage stay distinct', () => {
  const core = classify('torenthia-nrs-041.html', { worldKind: 'nrs', worldId: 'torenthia-nrs-041', worldArcs: ['korda'], worldDossiers: ['korda'] });
  const supporting = classify('torenthia-news-085.html', { worldKind: 'news', worldId: 'torenthia-news-085', worldArcs: ['korda'] });
  assert.ok(core.includes('Korda Core'));
  assert.ok(supporting.includes('Korda'));
  assert.ok(!supporting.includes('Korda Core'));
});
test('frozen dossier baseline remains core', () => {
  assert.ok(classify('torenthia-news-075.html', { worldKind: 'news', worldId: 'torenthia-news-075', worldArcs: ['korda'] }).includes('Korda Core'));
});
test('invalid opt-ins fail instead of silently misclassifying', () => {
  assert.throws(() => classify('torenthia-news-999.html', { worldKind: 'news', worldId: 'x', worldArcs: [], worldDossiers: ['korda'] }));
});
test('retired sources are excluded without reading the removed archive', () => {
  const oldFiles = ['docs/archive/constitution/constitution-current.pdf', 'constitutional-quickref.md'];
  for (const file of oldFiles) assert.throws(() => classify(file), /Cold-storage material/);
  const current = ['pdf/constitution-current.pdf', 'docs/constitutional-quickref.md', 'constitution_data.json'];
  const plan = buildPlan([...oldFiles, ...current]);
  assert.deepEqual(plan.map(d => d.path), current);
  assert.ok(plan.every(d => d.tags.includes('Constitution') && !d.requiresPathCheck));
});
test('current duplicate basenames still require source-path confirmation', () => {
  assert.ok(buildPlan(['images/probe.png', 'logos/probe.png']).every(d => d.requiresPathCheck));
  assert.deepEqual(classify('PROJECT-SOURCES.md'), ['Project Operations']);
  assert.deepEqual(classify('scripts/fixtures/thoss-crossroads.json'), ['Website Code']);
});
test('hypotheticals and reference material stay separate from World records', () => {
  assert.deepEqual(classify('crossroads.html'), ['Crossroads Non-canon']);
  assert.deepEqual(classify('scenario-the-vote.html'), ['Scenarios']);
  assert.deepEqual(classify('docs/WORLD-STORY-BIBLE.md'), ['World Reference']);
});
