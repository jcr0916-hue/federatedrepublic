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

async function runWithShadow(enabled) {
  const originalFetch = global.fetch;
  const saved = {
    gateway: process.env.AI_GATEWAY_API_KEY,
    oidc: process.env.VERCEL_OIDC_TOKEN,
    anthropic: process.env.ANTHROPIC_API_KEY,
    shadow: process.env.AI_NAVIGATOR_SHADOW_ENABLED,
  };

  process.env.AI_GATEWAY_API_KEY = 'test-gateway';
  delete process.env.VERCEL_OIDC_TOKEN;
  delete process.env.ANTHROPIC_API_KEY;
  if (enabled) process.env.AI_NAVIGATOR_SHADOW_ENABLED = '1';
  else delete process.env.AI_NAVIGATOR_SHADOW_ENABLED;

  const payloads = [];
  global.fetch = async (_url, options) => {
    const payload = JSON.parse(options.body);
    payloads.push(payload);
    const tags = payload.providerOptions?.gateway?.tags || [];
    const shadow = tags.includes('role:shadow');
    return {
      ok: true,
      status: 200,
      text: async () => '',
      json: async () => shadow
        ? { content:[{ type:'text', text:'{"status":"ESCALATE","answer":"","sources":["§2.5"]}' }] }
        : { content:[{ type:'text', text:'Grounded answer.' }] },
    };
  };

  try {
    delete require.cache[require.resolve('../api/navigator.js')];
    const handler = require('../api/navigator.js');
    const res = makeRes();
    await handler(
      { method:'POST', body:{ question:'Does §2.5 imply authority that is not expressly listed?' } },
      res
    );
    return { res, payloads };
  } finally {
    global.fetch = originalFetch;
    if (saved.gateway === undefined) delete process.env.AI_GATEWAY_API_KEY; else process.env.AI_GATEWAY_API_KEY = saved.gateway;
    if (saved.oidc === undefined) delete process.env.VERCEL_OIDC_TOKEN; else process.env.VERCEL_OIDC_TOKEN = saved.oidc;
    if (saved.anthropic === undefined) delete process.env.ANTHROPIC_API_KEY; else process.env.ANTHROPIC_API_KEY = saved.anthropic;
    if (saved.shadow === undefined) delete process.env.AI_NAVIGATOR_SHADOW_ENABLED; else process.env.AI_NAVIGATOR_SHADOW_ENABLED = saved.shadow;
    delete require.cache[require.resolve('../api/navigator.js')];
  }
}

test('Navigator shadow evaluation is off by default even when Gateway is configured', async () => {
  const { res, payloads } = await runWithShadow(false);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.summary, 'Grounded answer.');
  assert.equal(payloads.length, 1);
  const tags = payloads[0].providerOptions.gateway.tags;
  assert.ok(tags.includes('role:primary'));
  assert.ok(!tags.includes('role:shadow'));
});

test('Navigator shadow evaluation can be enabled explicitly for measurement', async () => {
  const { res, payloads } = await runWithShadow(true);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.summary, 'Grounded answer.');
  assert.equal(payloads.length, 2);
  assert.ok(payloads.some(p => p.providerOptions.gateway.tags.includes('role:primary')));
  assert.ok(payloads.some(p => p.providerOptions.gateway.tags.includes('role:shadow')));
});
