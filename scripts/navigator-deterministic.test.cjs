const { test } = require('node:test');
const assert = require('node:assert/strict');
const constitution = require('../constitution_data.json');
const { uniqueTitleMatch, titleEligible, broadTopicMatch } = require('../api/_navigator-core.js');
const { buildNavigatorContextPacket } = require('../api/_navigator-context.js');

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


test('eligible unique full provision titles resolve deterministically across the Constitution', () => {
  const provisions = constitution.flatMap(a => a.provisions);
  const eligible = provisions.filter(p => titleEligible(p.name));
  assert.ok(eligible.length > 100);

  const failures = [];
  for (const p of eligible) {
    const question = `What is the constitutional rule for ${p.name}?`;
    const match = uniqueTitleMatch(question, provisions);
    if (!match || match.num !== p.num) {
      failures.push({ expected: p.num, name: p.name, actual: match?.num || null });
    }
  }
  assert.deepEqual(failures, []);
});

test('title matching refuses interpretive and multi-title questions', () => {
  const provisions = constitution.flatMap(a => a.provisions);
  assert.equal(
    uniqueTitleMatch('What does Civic Consul — Domain and Term imply beyond the text?', provisions),
    null
  );
  assert.equal(
    uniqueTitleMatch('Compare Habeas Corpus and Double Jeopardy.', provisions),
    null
  );
});

test('natural-language full-title lookup returns verbatim text with zero AI calls', async () => {
  const originalFetch = global.fetch;
  let fetchCalls = 0;
  global.fetch = async () => {
    fetchCalls++;
    throw new Error('AI fetch must not run for deterministic full-title lookup');
  };

  try {
    delete require.cache[require.resolve('../api/navigator.js')];
    const handler = require('../api/navigator.js');
    const req = { method: 'POST', body: { question: 'What is the rule for Civic Consul — Domain and Term?' } };
    const res = makeRes();

    await handler(req, res);

    const source = constitution.flatMap(a => a.provisions).find(p => p.num === '§2.5');
    assert.equal(res.statusCode, 200);
    assert.equal(fetchCalls, 0);
    assert.equal(res.body.provisions.length, 1);
    assert.equal(res.body.provisions[0].num, '§2.5');
    assert.equal(res.body.provisions[0].text, source.text);
    assert.equal(res.body.provisions[0].verbatim, true);
    assert.match(res.body.summary, /no AI paraphrase was used/i);
  } finally {
    global.fetch = originalFetch;
  }
});

test('interpretive full-title question still uses the model path', async () => {
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
      json: async () => ({ content: [{ type: 'text', text: 'Interpretive model answer.' }] }),
      text: async () => '',
    };
  };

  try {
    delete require.cache[require.resolve('../api/navigator.js')];
    const handler = require('../api/navigator.js');
    const req = { method: 'POST', body: { question: 'What does Civic Consul — Domain and Term imply beyond the text?' } };
    const res = makeRes();

    await handler(req, res);

    assert.equal(res.statusCode, 200);
    assert.ok(fetchCalls >= 1);
    assert.equal(res.body.summary, 'Interpretive model answer.');
  } finally {
    global.fetch = originalFetch;
    if (originalGateway === undefined) delete process.env.AI_GATEWAY_API_KEY; else process.env.AI_GATEWAY_API_KEY = originalGateway;
    if (originalOidc === undefined) delete process.env.VERCEL_OIDC_TOKEN; else process.env.VERCEL_OIDC_TOKEN = originalOidc;
    if (originalAnthropic === undefined) delete process.env.ANTHROPIC_API_KEY; else process.env.ANTHROPIC_API_KEY = originalAnthropic;
  }
});


test('broad judicial-selection phrasing resolves to deterministic disambiguation', () => {
  assert.deepEqual(broadTopicMatch('judicial selection'), {
    topic: 'judicial-selection',
    sections: ['§4.2', '§4.4', '§4.4.a'],
  });
  assert.deepEqual(broadTopicMatch('How are judges appointed?'), {
    topic: 'judicial-selection',
    sections: ['§4.2', '§4.4', '§4.4.a'],
  });
  assert.equal(broadTopicMatch('Supreme Court Selection'), null);
});

test('judicial selection API response disambiguates procedures with zero AI calls', async () => {
  const originalFetch = global.fetch;
  let fetchCalls = 0;
  global.fetch = async () => {
    fetchCalls++;
    throw new Error('AI fetch must not run for deterministic judicial-selection disambiguation');
  };

  try {
    delete require.cache[require.resolve('../api/navigator.js')];
    const handler = require('../api/navigator.js');
    const req = { method: 'POST', body: { question: 'judicial selection' } };
    const res = makeRes();

    await handler(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(fetchCalls, 0);
    assert.match(res.body.summary, /Judicial Pool/i);
    assert.match(res.body.summary, /Civic Consul nominates/i);
    assert.match(res.body.summary, /Senate confirms by a two-thirds vote/i);
    assert.match(res.body.summary, /Supreme Court/i);
    assert.deepEqual(res.body.provisions.map(p => p.num), ['§4.2', '§4.4', '§4.4.a']);
    assert.match(res.body.provisions[0].relevance, /inferior courts?/i);
    assert.match(res.body.provisions[1].relevance, /Supreme Court/i);
    assert.match(res.body.provisions[2].relevance, /Senate-bypass/i);
  } finally {
    global.fetch = originalFetch;
  }
});


test('Navigator context packet expands explicit constitutional relationships without sending the whole Constitution', () => {
  const provisions = constitution.flatMap(a => a.provisions);
  const target = provisions.find(p => p.num === '§2.3.a');
  const packet = buildNavigatorContextPacket(
    'How should the Legat Consul legislative veto be understood?',
    [{ provision: target, score: 20 }],
    provisions
  );

  assert.match(packet.packet, /SOURCE PACKET — generated deterministically from constitution_data\.json/);
  assert.match(packet.packet, /PRIMARY 1 \[§2\.3\.a\] Legat Consul Legislative Veto/);
  assert.match(packet.packet, /\[§9\.1\]/,
    'the target provision\'s explicit external cross-reference should be supplied');
  assert.doesNotMatch(packet.packet, /\[§15\.9\]/,
    'an unrelated constitutional provision should not be supplied');
  assert.ok(packet.related.length <= 6);
});

test('interpretive Navigator model call receives the verified source packet', async () => {
  const originalFetch = global.fetch;
  const originalGateway = process.env.AI_GATEWAY_API_KEY;
  const originalOidc = process.env.VERCEL_OIDC_TOKEN;
  const originalAnthropic = process.env.ANTHROPIC_API_KEY;
  delete process.env.AI_GATEWAY_API_KEY;
  delete process.env.VERCEL_OIDC_TOKEN;
  process.env.ANTHROPIC_API_KEY = 'test-key';

  let payload;
  global.fetch = async (_url, options) => {
    payload = JSON.parse(options.body);
    return {
      ok: true,
      json: async () => ({ content: [{ type: 'text', text: 'Packet-grounded answer.' }] }),
      text: async () => '',
    };
  };

  try {
    delete require.cache[require.resolve('../api/navigator.js')];
    const handler = require('../api/navigator.js');
    const res = makeRes();
    await handler({ method:'POST', body:{ question:'Does §2.3.a imply broader veto authority than the text states?' } }, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.summary, 'Packet-grounded answer.');
    assert.match(payload.system, /already performed retrieval and assembled a verified SOURCE PACKET/i);
    assert.match(payload.messages[0].content, /PRIMARY RETRIEVED PROVISIONS/);
    assert.match(payload.messages[0].content, /\[§2\.3\.a\] Legat Consul Legislative Veto/);
    assert.match(payload.messages[0].content, /RELATED EXACT-TEXT PROVISIONS FOUND BY CROSS-REFERENCE/);
    assert.doesNotMatch(payload.messages[0].content, /\[§15\.9\]/);
  } finally {
    global.fetch = originalFetch;
    if (originalGateway === undefined) delete process.env.AI_GATEWAY_API_KEY; else process.env.AI_GATEWAY_API_KEY = originalGateway;
    if (originalOidc === undefined) delete process.env.VERCEL_OIDC_TOKEN; else process.env.VERCEL_OIDC_TOKEN = originalOidc;
    if (originalAnthropic === undefined) delete process.env.ANTHROPIC_API_KEY; else process.env.ANTHROPIC_API_KEY = originalAnthropic;
    delete require.cache[require.resolve('../api/navigator.js')];
  }
});
