const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const constitution = require('../constitution_data.json');
const { expandQuery, rankProvisions, retrievalGate } = require('../api/_navigator-core.js');

const provisions = constitution.flatMap(a => a.provisions);
const cases = JSON.parse(fs.readFileSync('scripts/fixtures/navigator-haiku-direct-cases.json','utf8'));

test('Haiku direct-rule corpus spans the full Constitution', () => {
  assert.equal(cases.length, 76);
  const articles = new Set(cases.map(c => c.requiredSource.match(/^§(\d+)/)[1]));
  assert.equal(articles.size, 20);
});

test('Every Haiku direct-rule case deterministically gates to Tier A and retrieves its explicit source', () => {
  const failures = [];
  for (const item of cases) {
    const ranked = rankProvisions(provisions, expandQuery(item.question), 5);
    const gate = retrievalGate(item.question, ranked);
    const nums = ranked.map(x => x.provision.num);
    if (gate.status !== 'TIER_A_CANDIDATE' || nums[0] !== item.requiredSource) {
      failures.push({
        id:item.id,
        required:item.requiredSource,
        gate:gate.status,
        reason:gate.reason,
        ranked:ranked.map(x=>({num:x.provision.num,score:x.score}))
      });
    }
  }
  assert.deepEqual(failures, []);
});
