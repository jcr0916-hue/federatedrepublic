const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { buildContextPacket } = require('../api/_annotator-core.js');

const constitution = JSON.parse(fs.readFileSync('constitution_data.json','utf8'));
const cases = JSON.parse(fs.readFileSync('scripts/fixtures/annotator-ai-cases.json','utf8'));
const provisions = new Map(constitution.flatMap(a => a.provisions).map(p => [p.num,p]));

test('Provision Annotator benchmark corpus is source-linked and internally valid', () => {
  assert.ok(cases.length >= 16, 'benchmark should contain at least 16 cases');
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


test('Expanded Annotator benchmark covers observed packet-era failure modes', () => {
  const nums = new Set(cases.map(x => x.num));
  for (const num of ['§2.3.a','§2.7','§4.4','§12.1.a','§13.2','§15.5.a']) {
    assert.ok(nums.has(num), `missing expanded benchmark case: ${num}`);
  }

  const legat = buildContextPacket('§2.3.a');
  assert.match(legat.packet, /\[§2\.7\] Civic Consul Legislative Instruments:/);
  assert.match(legat.packet, /bill is tabled for one month/i);
  assert.match(legat.packet, /\[§9\.1\]/);

  const statehood = buildContextPacket('§15.5.a');
  assert.match(statehood.packet, /\[§15\.2\] The Statehood Audit:/);
  assert.match(statehood.packet, /three years/i);
});

test('Every benchmark case can build a current deterministic source packet', () => {
  for (const item of cases) {
    const context = buildContextPacket(item.num);
    assert.ok(context, item.num);
    assert.equal(context.target.num, item.num);
    assert.match(context.packet, /SOURCE PACKET — generated deterministically from constitution_data\.json/);
    assert.match(context.packet, new RegExp('TARGET PROVISION\\nTARGET \\[' + item.num.replace(/\./g,'\\.') + '\\]'));
  }
});


test('Annotator packet keeps target mechanics salient and related context bounded', () => {
  const pools = buildContextPacket('§9.8');
  assert.match(pools.packet, /TARGET COVERAGE CUES/);
  assert.match(pools.packet, /restore the minimum within the period defined by statute/i);
  assert.ok(pools.related.length <= 4);

  const ethics = buildContextPacket('§7.10');
  assert.match(ethics.packet, /regardless of value/i);
  assert.equal(ethics.backlinks.length, 0);
  assert.doesNotMatch(
    ethics.packet,
    /explicit backlink/i,
    'downstream backlinks should not be injected into the Annotator packet'
  );

  const viability = buildContextPacket('§15.5.a');
  assert.match(viability.packet, /must be ratified by referendum of the eligible voters it affects/i);
  assert.match(viability.packet, /(?:None of the lapsed petitions may|may not be) reinitiated under substantially the same geographic scope for three years/i);
  assert.ok(viability.related.length <= 4);
});


test('Annotator prompt preserves narrow textual scope instead of substituting adjacent concepts', () => {
  const { SYSTEM } = require('../api/_annotator-core.js');
  assert.match(SYSTEM, /do not turn consent into compensation/i);
  assert.match(SYSTEM, /official capacity into all gifts/i);
  assert.match(SYSTEM, /inaction into rejection/i);
  assert.match(SYSTEM, /interpretive lenses, not evidence of drafting intent/i);
});
