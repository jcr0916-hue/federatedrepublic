const { test } = require('node:test');
const assert = require('node:assert/strict');

test('Annotator uses Sonnet with a deterministic source packet instead of the full Constitution', async () => {
  const handler = require('../api/annotate.js');
  const originalFetch = global.fetch;
  const originalKey = process.env.ANTHROPIC_API_KEY;
  const originalGateway = process.env.AI_GATEWAY_API_KEY;
  const originalOidc = process.env.VERCEL_OIDC_TOKEN;

  delete process.env.AI_GATEWAY_API_KEY;
  delete process.env.VERCEL_OIDC_TOKEN;
  process.env.ANTHROPIC_API_KEY = 'test-only';

  let payload;
  global.fetch = async (_url, options) => {
    payload = JSON.parse(options.body);
    return {
      ok: true,
      status: 200,
      json: async () => ({
        content:[{type:'text',text:'Grounded annotation.'}],
        stop_reason:'end_turn'
      })
    };
  };

  let body;
  const res = {
    setHeader(){},
    status(n){ this.statusCode=n; return this; },
    json(v){ body=v; return this; },
    end(){}
  };

  try {
    await handler({method:'POST',body:{num:'§2.3.a'}},res);
    assert.equal(res.statusCode,200);
    assert.equal(body.annotation,'Grounded annotation.');
    assert.equal(payload.model,'claude-sonnet-5');
    assert.equal(payload.max_tokens,1200);
    assert.equal(payload.temperature,0);

    assert.match(payload.system,/source-bound constitutional design analyst/i);
    assert.match(payload.system,/application has already performed constitutional retrieval/i);
    assert.match(payload.system,/Do not invent enforcement mechanisms/i);
    assert.match(payload.system,/Never invent a provision number or label/i);
    assert.match(payload.system,/do not conflate an initial review\/action window with the duration or legal effect/i);
    assert.match(payload.system,/roughly 350–500 words/i);
    assert.doesNotMatch(payload.system,/complete constitution text follows/i);

    const prompt = payload.messages[0].content;
    assert.match(prompt,/SOURCE PACKET — generated deterministically from constitution_data\.json/);
    assert.match(prompt,/TARGET PROVISION\n\[§2\.3\.a\] Legat Consul Legislative Veto:/);
    assert.match(prompt,/\[§2\.7\] Civic Consul Legislative Instruments:/,
      'same-article context should expose the distinct CC veto mechanics');
    assert.match(prompt,/\[§9\.1\] The Monitors:/,
      'explicit cross-reference should be included even outside Article II');
    assert.doesNotMatch(prompt,/\[§15\.9\]/,
      'unrelated constitutional provisions should not be sent to the model');
  } finally {
    global.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.ANTHROPIC_API_KEY; else process.env.ANTHROPIC_API_KEY = originalKey;
    if (originalGateway === undefined) delete process.env.AI_GATEWAY_API_KEY; else process.env.AI_GATEWAY_API_KEY = originalGateway;
    if (originalOidc === undefined) delete process.env.VERCEL_OIDC_TOKEN; else process.env.VERCEL_OIDC_TOKEN = originalOidc;
    delete require.cache[require.resolve('../api/annotate.js')];
  }
});
