const { test } = require('node:test');
const assert = require('node:assert/strict');

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

test('underspecified fallback query is rejected before any AI call', async () => {
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
    assert.match(res.body.summary, /cannot answer that reliably/i);
    assert.equal(res.body.retrieval.sufficient, false);
    assert.equal(res.body.provisions.length, 0);
  } finally {
    global.fetch = originalFetch;
  }
});

test('sufficient fallback query reaches Sonnet with a bounded evidence packet', async () => {
  const originalFetch = global.fetch;
  const originalGateway = process.env.AI_GATEWAY_API_KEY;
  const originalOidc = process.env.VERCEL_OIDC_TOKEN;
  const originalAnthropic = process.env.ANTHROPIC_API_KEY;

  delete process.env.AI_GATEWAY_API_KEY;
  delete process.env.VERCEL_OIDC_TOKEN;
  process.env.ANTHROPIC_API_KEY = 'test-key';

  let fetchCalls = 0;
  let seenBody = null;
  global.fetch = async (url, options) => {
    fetchCalls++;
    seenBody = JSON.parse(options.body);
    return {
      ok: true,
      json: async () => ({ content: [{ type:'text', text:'A warrant or other prior independent judicial authorization is generally required under the supplied privacy provision.' }] }),
      text: async () => '',
    };
  };

  try {
    delete require.cache[require.resolve('../api/navigator.js')];
    const handler = require('../api/navigator.js');
    const res = makeRes();

    await handler({
      method:'POST',
      body:{ question:'Can the government search my phone without judicial authorization?' }
    }, res);

    assert.equal(res.statusCode, 200);
    assert.ok(fetchCalls >= 1);
    assert.match(res.body.summary, /judicial authorization/i);
    assert.ok(res.body.provisions.some(p => p.num === '§1.8'));
    assert.ok(res.body.provisions.length <= 5);
    assert.match(seenBody.messages[0].content, /§1\.8/);
    assert.equal(seenBody.temperature, 0);
    assert.match(seenBody.system, /Do not add any unstated power/i);
    assert.match(seenBody.system, /mechanism for changing or avoiding a constitutional rule/i);
  } finally {
    global.fetch = originalFetch;
    if (originalGateway === undefined) delete process.env.AI_GATEWAY_API_KEY; else process.env.AI_GATEWAY_API_KEY = originalGateway;
    if (originalOidc === undefined) delete process.env.VERCEL_OIDC_TOKEN; else process.env.VERCEL_OIDC_TOKEN = originalOidc;
    if (originalAnthropic === undefined) delete process.env.ANTHROPIC_API_KEY; else process.env.ANTHROPIC_API_KEY = originalAnthropic;
  }
});
