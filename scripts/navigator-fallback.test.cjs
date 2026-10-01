const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const constitution = require('../constitution_data.json');
const { topicMatch } = require('../api/_navigator-topics.js');
const {
  expandQuery,
  rankProvisions,
  uniqueTitleMatch,
  retrievalSufficiency,
} = require('../api/_navigator-core.js');

const provisions = constitution.flatMap(a => a.provisions);
const cases = JSON.parse(fs.readFileSync('scripts/fixtures/navigator-fallback-cases.json','utf8'));

test('Navigator fallback benchmark has 80 cases', () => {
  assert.equal(cases.length, 80);
  assert.equal(cases.filter(c => c.expectedSufficient).length, 50);
  assert.equal(cases.filter(c => !c.expectedSufficient).length, 30);
});

test('fallback benchmark bypasses deterministic topic and title routes', () => {
  const failures = [];
  for (const item of cases) {
    const topic = topicMatch(item.question);
    const title = uniqueTitleMatch(item.question, provisions);
    if (topic || title) {
      failures.push({
        id:item.id,
        topic:topic?.id || null,
        title:title?.num || null,
        question:item.question,
      });
    }
  }
  assert.deepEqual(failures, []);
});

test('retrieval sufficiency benchmark', () => {
  const failures = [];

  for (const item of cases) {
    const ranked = rankProvisions(provisions, expandQuery(item.question), 5);
    const assessment = retrievalSufficiency(item.question, ranked);
    const nums = ranked.map(x => x.provision.num);
    const missing = (item.required || []).filter(num => !nums.includes(num));

    if (assessment.sufficient !== item.expectedSufficient || missing.length) {
      failures.push({
        id:item.id,
        question:item.question,
        expectedSufficient:item.expectedSufficient,
        actualSufficient:assessment.sufficient,
        reason:assessment.reason,
        coverage:assessment.coverage,
        ranked:ranked.map(x=>({num:x.provision.num,score:x.score})),
        missing,
      });
    }
  }

  assert.deepEqual(failures, []);
});
