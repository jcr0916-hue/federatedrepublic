const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const constitution = require('../constitution_data.json');
const { TOPICS, topicMatch } = require('../api/_navigator-topics.js');
const {
  expandQuery,
  rankProvisions,
  retrievalGate,
  uniqueTitleMatch,
} = require('../api/_navigator-core.js');

const provisions = constitution.flatMap(a => a.provisions);
const provisionNums = new Set(provisions.map(p => p.num));
const cases = JSON.parse(fs.readFileSync('scripts/fixtures/navigator-natural-language-cases.json','utf8'));

test('Navigator natural-language benchmark has 80 cases and expected coverage', () => {
  assert.equal(cases.length, 80);
  const counts = cases.reduce((m,c) => {
    m[c.expected] = (m[c.expected] || 0) + 1;
    return m;
  }, {});
  assert.equal(counts.TOPIC, 42);
  assert.equal(counts.SONNET, 28);
  assert.equal(counts.NO_MATCH, 10);
});

test('every deterministic topic references current constitutional provisions', () => {
  const missing = [];
  for (const topic of TOPICS) {
    for (const [num] of topic.sections) {
      if (!provisionNums.has(num)) missing.push({ topic: topic.id, num });
    }
  }
  assert.deepEqual(missing, []);
});

test('all registered aliases resolve to their own topic', () => {
  const failures = [];
  for (const topic of TOPICS) {
    for (const alias of topic.aliases) {
      const match = topicMatch(alias);
      if (!match || match.id !== topic.id) failures.push({ alias, expected: topic.id, actual: match?.id || null });
    }
  }
  assert.deepEqual(failures, []);
});

test('80-case natural-language routing benchmark', () => {
  const failures = [];

  for (const item of cases) {
    const topic = topicMatch(item.question);
    const title = uniqueTitleMatch(item.question, provisions);
    const ranked = rankProvisions(provisions, expandQuery(item.question), 5);
    const gate = retrievalGate(item.question, ranked);

    if (item.expected === 'TOPIC') {
      if (!topic || topic.id !== item.topic) {
        failures.push({ id:item.id, expected:item.topic, actual:topic?.id || null, reason:'topic mismatch' });
      }
      continue;
    }

    if (item.expected === 'NO_MATCH') {
      if (topic || title || ranked.length) {
        failures.push({
          id:item.id,
          reason:'expected no match',
          topic:topic?.id || null,
          title:title?.num || null,
          ranked:ranked.map(x=>({num:x.provision.num,score:x.score})),
        });
      }
      continue;
    }

    // SONNET cases must not be consumed by deterministic topic/title routes,
    // and must retrieve enough evidence to reach the model path.
    if (topic || title || ranked.length === 0 || gate.status === 'NOT_ESTABLISHED') {
      failures.push({
        id:item.id,
        reason:'expected Sonnet path',
        topic:topic?.id || null,
        title:title?.num || null,
        gate:gate.status,
        gateReason:gate.reason,
        ranked:ranked.map(x=>({num:x.provision.num,score:x.score})),
      });
    }
  }

  assert.deepEqual(failures, []);
});
