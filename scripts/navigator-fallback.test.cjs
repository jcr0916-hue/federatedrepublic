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


function makeRes() {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    setHeader(k,v){ this.headers[k]=v; },
    status(code){ this.statusCode=code; return this; },
    json(value){ this.body=value; return this; },
    end(){ return this; },
  };
}

test('underspecified fallback question returns guidance with zero AI calls', async () => {
  const originalFetch = global.fetch;
  let fetchCalls = 0;
  global.fetch = async () => {
    fetchCalls++;
    throw new Error('AI must not run for insufficient retrieval');
  };

  try {
    delete require.cache[require.resolve('../api/navigator.js')];
    const handler = require('../api/navigator.js');
    const res = makeRes();
    await handler({ method:'POST', body:{ question:'What happens if the vote fails?' } }, res);

    assert.equal(res.statusCode, 200);
    assert.equal(fetchCalls, 0);
    assert.match(res.body.summary, /can’t answer that reliably/i);
    assert.match(res.body.summary, /make the subject more specific/i);
  } finally {
    global.fetch = originalFetch;
  }
});

test('supported fallback sends expanded five-provision evidence packet to Sonnet', async () => {
  const originalFetch = global.fetch;
  const originalGateway = process.env.AI_GATEWAY_API_KEY;
  const originalOidc = process.env.VERCEL_OIDC_TOKEN;
  const originalAnthropic = process.env.ANTHROPIC_API_KEY;
  delete process.env.AI_GATEWAY_API_KEY;
  delete process.env.VERCEL_OIDC_TOKEN;
  process.env.ANTHROPIC_API_KEY = 'test-key';

  const requests = [];
  global.fetch = async (url, options) => {
    requests.push({ url:String(url), body:JSON.parse(options.body) });
    return {
      ok:true,
      status:200,
      json:async()=>({ content:[{ type:'text', text:'The two Consuls may petition the Supreme Court for expedited resolution.' }] }),
      text:async()=>'',
    };
  };

  try {
    delete require.cache[require.resolve('../api/navigator.js')];
    const handler = require('../api/navigator.js');
    const res = makeRes();
    await handler({
      method:'POST',
      body:{ question:'What happens if the two Consuls cannot agree on who should lead a cross-domain emergency?' }
    }, res);

    assert.equal(res.statusCode, 200);
    assert.equal(requests.length, 1);
    const prompt = requests[0].body.messages[0].content;
    assert.match(prompt, /\[§2\.14\.a\]/);
    assert.match(prompt, /\[§4\.5\]/);
    assert.match(requests[0].body.system, /Answer the user's question in the first sentence/i);
    assert.match(requests[0].body.system, /Do not add any unstated/i);
    assert.ok(res.body.provisions.some(p => p.num === '§4.5'));
  } finally {
    global.fetch = originalFetch;
    if (originalGateway === undefined) delete process.env.AI_GATEWAY_API_KEY; else process.env.AI_GATEWAY_API_KEY = originalGateway;
    if (originalOidc === undefined) delete process.env.VERCEL_OIDC_TOKEN; else process.env.VERCEL_OIDC_TOKEN = originalOidc;
    if (originalAnthropic === undefined) delete process.env.ANTHROPIC_API_KEY; else process.env.ANTHROPIC_API_KEY = originalAnthropic;
  }
});
