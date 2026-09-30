const { test } = require('node:test');
const assert = require('node:assert/strict');

test('AI transport prefers Gateway, preserves Anthropic-compatible body, and tags the request', async () => {
  const originalFetch = global.fetch;
  const originalGateway = process.env.VERCEL_OIDC_TOKEN;
  const originalApi = process.env.AI_GATEWAY_API_KEY;
  const originalAnthropic = process.env.ANTHROPIC_API_KEY;

  process.env.VERCEL_OIDC_TOKEN = 'oidc-test-token';
  delete process.env.AI_GATEWAY_API_KEY;
  process.env.ANTHROPIC_API_KEY = 'rollback-key-should-not-be-used';

  let seen;
  global.fetch = async (url, options) => {
    seen = { url, options, body: JSON.parse(options.body) };
    return { ok: true, json: async () => ({ content: [{ type: 'text', text: '{"fragment":"allowed"}' }] }) };
  };

  try {
    delete require.cache[require.resolve('../api/_ai-transport.js')];
    const { anthropicMessage } = require('../api/_ai-transport.js');
    const result = await anthropicMessage({
      model: 'anthropic/claude-sonnet-5',
      max_tokens: 200,
      system: 'system',
      messages: [{ role: 'user', content: 'hello' }],
      tags: ['feature:crossroads', 'env:test'],
    });

    assert.equal(result.route, 'gateway');
    assert.equal(result.model, 'anthropic/claude-sonnet-5');
    assert.equal(seen.url, 'https://ai-gateway.vercel.sh/v1/messages');
    assert.equal(seen.options.headers.Authorization, 'Bearer oidc-test-token');
    assert.equal(seen.body.model, 'anthropic/claude-sonnet-5');
    assert.deepEqual(seen.body.providerOptions.gateway.tags, [
      'site:federated-republic',
      'feature:crossroads',
      'env:test',
    ]);
  } finally {
    global.fetch = originalFetch;
    if (originalGateway === undefined) delete process.env.VERCEL_OIDC_TOKEN; else process.env.VERCEL_OIDC_TOKEN = originalGateway;
    if (originalApi === undefined) delete process.env.AI_GATEWAY_API_KEY; else process.env.AI_GATEWAY_API_KEY = originalApi;
    if (originalAnthropic === undefined) delete process.env.ANTHROPIC_API_KEY; else process.env.ANTHROPIC_API_KEY = originalAnthropic;
  }
});

test('AI transport retains direct Anthropic rollback when Gateway credentials are absent', async () => {
  const originalFetch = global.fetch;
  const originalGateway = process.env.VERCEL_OIDC_TOKEN;
  const originalApi = process.env.AI_GATEWAY_API_KEY;
  const originalAnthropic = process.env.ANTHROPIC_API_KEY;

  delete process.env.VERCEL_OIDC_TOKEN;
  delete process.env.AI_GATEWAY_API_KEY;
  process.env.ANTHROPIC_API_KEY = 'anthropic-test-token';

  let seen;
  global.fetch = async (url, options) => {
    seen = { url, options, body: JSON.parse(options.body) };
    return { ok: true, json: async () => ({ content: [] }) };
  };

  try {
    delete require.cache[require.resolve('../api/_ai-transport.js')];
    const { anthropicMessage } = require('../api/_ai-transport.js');
    const result = await anthropicMessage({
      model: 'anthropic/claude-sonnet-5',
      max_tokens: 20,
      system: 'system',
      messages: [{ role: 'user', content: 'hello' }],
    });

    assert.equal(result.route, 'anthropic-direct');
    assert.equal(seen.url, 'https://api.anthropic.com/v1/messages');
    assert.equal(seen.options.headers['x-api-key'], 'anthropic-test-token');
    assert.equal(seen.body.model, 'claude-sonnet-5');
    assert.equal(seen.body.providerOptions, undefined);
  } finally {
    global.fetch = originalFetch;
    if (originalGateway === undefined) delete process.env.VERCEL_OIDC_TOKEN; else process.env.VERCEL_OIDC_TOKEN = originalGateway;
    if (originalApi === undefined) delete process.env.AI_GATEWAY_API_KEY; else process.env.AI_GATEWAY_API_KEY = originalApi;
    if (originalAnthropic === undefined) delete process.env.ANTHROPIC_API_KEY; else process.env.ANTHROPIC_API_KEY = originalAnthropic;
  }
});

test('Gateway-only transport accepts a non-Anthropic model for shadow benchmarking', async () => {
  const originalFetch = global.fetch;
  const originalGateway = process.env.VERCEL_OIDC_TOKEN;
  const originalApi = process.env.AI_GATEWAY_API_KEY;

  process.env.VERCEL_OIDC_TOKEN = 'oidc-test-token';
  delete process.env.AI_GATEWAY_API_KEY;

  let seen;
  global.fetch = async (url, options) => {
    seen = { url, body: JSON.parse(options.body) };
    return { ok: true, json: async () => ({ content: [] }) };
  };

  try {
    delete require.cache[require.resolve('../api/_ai-transport.js')];
    const { gatewayMessage } = require('../api/_ai-transport.js');
    const result = await gatewayMessage({
      model: 'openai/gpt-5.4-nano',
      max_tokens: 20,
      system: 'system',
      messages: [{ role: 'user', content: 'hello' }],
      tags: ['feature:crossroads', 'role:shadow'],
    });

    assert.equal(result.route, 'gateway');
    assert.equal(result.model, 'openai/gpt-5.4-nano');
    assert.equal(seen.url, 'https://ai-gateway.vercel.sh/v1/messages');
    assert.equal(seen.body.model, 'openai/gpt-5.4-nano');
    assert.deepEqual(seen.body.providerOptions.gateway.tags, [
      'site:federated-republic',
      'feature:crossroads',
      'role:shadow',
    ]);
  } finally {
    global.fetch = originalFetch;
    if (originalGateway === undefined) delete process.env.VERCEL_OIDC_TOKEN; else process.env.VERCEL_OIDC_TOKEN = originalGateway;
    if (originalApi === undefined) delete process.env.AI_GATEWAY_API_KEY; else process.env.AI_GATEWAY_API_KEY = originalApi;
  }
});
