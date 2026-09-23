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
test('archived current-named files cannot become current Constitution', () => {
  assert.deepEqual(classify('docs/archive/constitution/constitution-current.pdf'), ['Archive']);
  assert.deepEqual(classify('pdf/constitution-current.pdf'), ['Constitution']);
  assert.ok(buildPlan(['docs/archive/constitution/constitution-current.pdf', 'pdf/constitution-current.pdf']).every(d => d.requiresPathCheck));
});
test('hypotheticals and reference material stay separate from World records', () => {
  assert.deepEqual(classify('crossroads.html'), ['Crossroads Non-canon']);
  assert.deepEqual(classify('scenario-the-vote.html'), ['Scenarios']);
  assert.deepEqual(classify('docs/WORLD-STORY-BIBLE.md'), ['World Reference']);
});
