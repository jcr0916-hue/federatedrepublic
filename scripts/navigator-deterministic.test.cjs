const { test } = require('node:test');
const assert = require('node:assert/strict');
const constitution = require('../constitution_data.json');

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

test('explicit single-section Navigator lookup returns verbatim text with zero AI calls', async () => {
  const originalFetch = global.fetch;
  let fetchCalls = 0;
  global.fetch = async () => {
    fetchCalls++;
    throw new Error('AI fetch must not run for deterministic explicit-section lookup');
  };

  try {
    delete require.cache[require.resolve('../api/navigator.js')];
    const handler = require('../api/navigator.js');
    const req = { method: 'POST', body: { question: 'What does §2.5 establish?' } };
    const res = makeRes();

    await handler(req, res);

    const source = constitution.flatMap(a => a.provisions).find(p => p.num === '§2.5');
    assert.equal(res.statusCode, 200);
    assert.equal(fetchCalls, 0);
    assert.match(res.body.summary, /no AI paraphrase was used/i);
    assert.equal(res.body.provisions.length, 1);
    assert.equal(res.body.provisions[0].num, '§2.5');
    assert.equal(res.body.provisions[0].name, source.name);
    assert.equal(res.body.provisions[0].text, source.text);
    assert.equal(res.body.provisions[0].verbatim, true);
  } finally {
    global.fetch = originalFetch;
  }
});

test('interpretive explicit-section question does not use deterministic Tier A', async () => {
  const originalFetch = global.fetch;
  const originalGateway = process.env.AI_GATEWAY_API_KEY;
  const originalOidc = process.env.VERCEL_OIDC_TOKEN;
  const originalAnthropic = process.env.ANTHROPIC_API_KEY;
  delete process.env.AI_GATEWAY_API_KEY;
  delete process.env.VERCEL_OIDC_TOKEN;
  process.env.ANTHROPIC_API_KEY = 'test-key';

  let fetchCalls = 0;
  global.fetch = async () => {
    fetchCalls++;
    return {
      ok: true,
      json: async () => ({ content: [{ type: 'text', text: 'Bounded model answer.' }] }),
      text: async () => '',
    };
  };

  try {
    delete require.cache[require.resolve('../api/navigator.js')];
    const handler = require('../api/navigator.js');
    const req = { method: 'POST', body: { question: 'Does §2.5 imply authority that is not expressly listed?' } };
    const res = makeRes();

    await handler(req, res);

    assert.equal(res.statusCode, 200);
    assert.ok(fetchCalls >= 1);
    assert.equal(res.body.provisions[0].verbatim, undefined);
    assert.equal(res.body.summary, 'Bounded model answer.');
  } finally {
    global.fetch = originalFetch;
    if (originalGateway === undefined) delete process.env.AI_GATEWAY_API_KEY; else process.env.AI_GATEWAY_API_KEY = originalGateway;
    if (originalOidc === undefined) delete process.env.VERCEL_OIDC_TOKEN; else process.env.VERCEL_OIDC_TOKEN = originalOidc;
    if (originalAnthropic === undefined) delete process.env.ANTHROPIC_API_KEY; else process.env.ANTHROPIC_API_KEY = originalAnthropic;
  }
});
