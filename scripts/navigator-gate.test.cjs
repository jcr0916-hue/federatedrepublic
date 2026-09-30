const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const constitution = require('../constitution_data.json');
const {
  expandQuery,
  rankProvisions,
  retrievalGate,
} = require('../api/_navigator-core.js');

const provisions = constitution.flatMap(a => a.provisions);
const cases = JSON.parse(fs.readFileSync('scripts/fixtures/navigator-gate-cases.json', 'utf8'));

test('Navigator benchmark fixture has balanced coverage', () => {
  assert.equal(cases.length, 64);
  const counts = cases.reduce((m, c) => {
    m[c.expectedGate] = (m[c.expectedGate] || 0) + 1;
    return m;
  }, {});
  assert.equal(counts.TIER_A_CANDIDATE, 24);
  assert.equal(counts.ESCALATE, 35);
  assert.equal(counts.NOT_ESTABLISHED, 5);
});

test('Navigator deterministic retrieval and escalation benchmark', () => {
  const failures = [];

  for (const item of cases) {
    const terms = expandQuery(item.question);
    const ranked = rankProvisions(provisions, terms, 5);
    const gate = retrievalGate(item.question, ranked);
    const nums = ranked.map(x => x.provision.num);

    const missingRequired = item.required.filter(num => !nums.includes(num));
    if (gate.status !== item.expectedGate || missingRequired.length) {
      failures.push({
        id: item.id,
        question: item.question,
        expectedGate: item.expectedGate,
        actualGate: gate.status,
        reason: gate.reason,
        ranked: ranked.map(x => ({ num: x.provision.num, score: x.score })),
        missingRequired,
      });
    }

    if (item.expectedGate === 'NOT_ESTABLISHED' && ranked.length !== 0) {
      failures.push({
        id: item.id,
        question: item.question,
        expectedGate: 'NOT_ESTABLISHED',
        actualGate: gate.status,
        reason: 'negative case retrieved provisions',
        ranked: ranked.map(x => ({ num: x.provision.num, score: x.score })),
      });
    }
  }

  assert.deepEqual(failures, []);
});

test('explicit single sections are Tier A candidates while cross-provision and interpretive prompts escalate', () => {
  const direct = cases.find(c => c.id === 'direct-04');
  const directRanked = rankProvisions(provisions, expandQuery(direct.question), 5);
  assert.equal(retrievalGate(direct.question, directRanked).status, 'TIER_A_CANDIDATE');
  assert.equal(directRanked[0].provision.num, '§2.5');

  const cross = cases.find(c => c.id === 'cross-02');
  assert.equal(retrievalGate(cross.question, rankProvisions(provisions, expandQuery(cross.question), 5)).status, 'ESCALATE');

  const ambiguity = cases.find(c => c.id === 'interpret-02');
  assert.equal(retrievalGate(ambiguity.question, rankProvisions(provisions, expandQuery(ambiguity.question), 5)).status, 'ESCALATE');
});
