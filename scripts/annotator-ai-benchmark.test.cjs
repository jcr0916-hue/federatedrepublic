const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const constitution = JSON.parse(fs.readFileSync('constitution_data.json','utf8'));
const cases = JSON.parse(fs.readFileSync('scripts/fixtures/annotator-ai-cases.json','utf8'));
const provisions = new Map(constitution.flatMap(a => a.provisions).map(p => [p.num,p]));

test('Provision Annotator benchmark corpus is source-linked and internally valid', () => {
  assert.ok(cases.length >= 10, 'benchmark should contain at least 10 cases');
  const seen = new Set();

  for (const item of cases) {
    assert.ok(item.num && item.title, JSON.stringify(item));
    assert.ok(!seen.has(item.num), `duplicate benchmark provision: ${item.num}`);
    seen.add(item.num);
    assert.ok(provisions.has(item.num), `unknown current provision: ${item.num}`);
    assert.ok(Array.isArray(item.must) && item.must.length >= 3, `${item.num}: missing must criteria`);
    assert.ok(Array.isArray(item.mustNot) && item.mustNot.length >= 2, `${item.num}: missing must-not criteria`);
    for (const line of [...item.must, ...item.mustNot]) {
      assert.equal(typeof line, 'string');
      assert.ok(line.length >= 20, `${item.num}: rubric line too short`);
    }
  }
});
