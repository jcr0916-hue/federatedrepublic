import test from 'node:test';
import assert from 'node:assert/strict';
import { editStats, storyFromDraft, storyFromPublished, tokens } from './newsroom-edits.mjs';

test('an unchanged story scores zero, ignoring quotes, markup and the notes ledger', () => {
  const draft = JSON.stringify({ body: 'CALDEN — He said "that\'s it." Then he left.\n\n---\nNotes for the editor:\nNew elements: none. Recommendation: USE.' });
  const html = '<div class="article-body"><p><strong>CALDEN</strong> &mdash; He said &ldquo;that&rsquo;s it.&rdquo; Then he left.</p></div><div class="article-nav">x</div>';
  const s = editStats(storyFromDraft(draft), storyFromPublished(html));
  assert.equal(s.cut, 0); assert.equal(s.added, 0); assert.equal(s.hunks, 0); assert.equal(s.changed, 0);
  assert.ok(!storyFromDraft(draft).includes('Recommendation'));
});

test('a word swap is one edit; a cut sentence is one edit; counts add up', () => {
  const a = 'The board met on Tuesday. No vote before the board. The room was full. Everyone left early.';
  const b = 'The board met on Tuesday. No vote on the board. Everyone left early.';
  const s = editStats(a, b);
  assert.equal(s.hunks, 2);
  assert.equal(s.kept + s.cut, s.draftWords);
  assert.equal(s.kept + s.added, s.publishedWords);
  assert.equal(s.cut, 5); // "before" + "The room was full"
  assert.equal(s.added, 1); // "on"
  assert.ok(s.changed > 0 && s.changed < 0.3);
});

test('tokens drop punctuation but keep section signs and numbers', () => {
  assert.deepEqual(tokens('Under §8.4, a "modest" sum—20% more.'), ['under', '§8.4', 'a', 'modest', 'sum', '20', 'more']);
});
