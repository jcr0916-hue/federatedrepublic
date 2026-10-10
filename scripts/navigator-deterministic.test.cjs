const { test } = require('node:test');
const assert = require('node:assert/strict');
const constitution = require('../constitution_data.json');
const { uniqueTitleMatch, titleEligible, broadTopicMatch } = require('../api/_navigator-core.js');
const { buildNavigatorContextPacket, mechanicCues } = require('../api/_navigator-context.js');
const { deterministicCompanionResources } = require('../api/_navigator-resources.js');

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
    assert.match(res.body.provisions[2].relevance, /public confirmation/i);
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
  assert.ok(packet.related.length <= 4);
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
    assert.match(payload.messages[0].content, /RELATED EXACT-TEXT PROVISIONS/);
    assert.doesNotMatch(payload.messages[0].content, /\[§15\.9\]/);
  } finally {
    global.fetch = originalFetch;
    if (originalGateway === undefined) delete process.env.AI_GATEWAY_API_KEY; else process.env.AI_GATEWAY_API_KEY = originalGateway;
    if (originalOidc === undefined) delete process.env.VERCEL_OIDC_TOKEN; else process.env.VERCEL_OIDC_TOKEN = originalOidc;
    if (originalAnthropic === undefined) delete process.env.ANTHROPIC_API_KEY; else process.env.ANTHROPIC_API_KEY = originalAnthropic;
    delete require.cache[require.resolve('../api/navigator.js')];
  }
});


test('Navigator deterministically attaches companion resources from controlling provisions', () => {
  const provisions = constitution.flatMap(a => a.provisions);
  const byNum = new Map(provisions.map(p => [p.num, p]));

  const veto = deterministicCompanionResources([byNum.get('§2.7')]);
  assert.deepEqual(
    veto.map(r => [r.kind, r.href]),
    [
      ['quicksheet','quicksheet-article-2.html'],
      ['diagram','diagrams.html#tab-dual'],
      ['glossary','glossary.html#term-suspensive-veto'],
    ]
  );

  const court = deterministicCompanionResources([byNum.get('§4.4'), byNum.get('§4.4.a')]);
  assert.equal(court[0].href, 'quicksheet-judiciary.html');
  assert.ok(court.some(r => r.href === 'diagrams.html#tab-sc-appointment'));

  const statehood = deterministicCompanionResources([byNum.get('§15.2')]);
  assert.equal(statehood[0].href, 'quicksheet-states.html');
  assert.ok(statehood.some(r => r.href === 'diagrams.html#tab-states-fed'));
  assert.ok(statehood.some(r => r.href === 'glossary.html#term-provisional-membership-period'));
});

test('Navigator companion resource selection is bounded and contains no model-generated URLs', () => {
  const provisions = constitution.flatMap(a => a.provisions);
  const sample = provisions.filter(p => ['§2.1','§2.7','§3.1','§4.4','§15.2'].includes(p.num));
  const resources = deterministicCompanionResources(sample);

  assert.ok(resources.length <= 3);
  for (const resource of resources) {
    assert.match(resource.href, /^(?:quicksheet-|diagrams\.html#|glossary\.html#)/);
    assert.ok(['quicksheet','diagram','glossary'].includes(resource.kind));
  }
});


test('Navigator context packet surfaces verbatim procedural cues for distinct triggers', () => {
  const provisions = constitution.flatMap(a => a.provisions);
  const byNum = new Map(provisions.map(p => [p.num, p]));
  const packet = buildNavigatorContextPacket(
    'How do §4.4 and §4.4.a interact if the Senate delays?',
    [
      { provision:byNum.get('§4.4'), score:20 },
      { provision:byNum.get('§4.4.a'), score:19 },
    ],
    provisions
  );

  assert.match(packet.packet, /PROCEDURAL CUES — verbatim excerpts/i);
  assert.match(packet.packet, /If the Civic Consul fails to nominate, or the Senate fails to vote, within the applicable period/i);
  assert.match(packet.packet, /not to exceed 120 days/i);
});

test('mechanic cue extraction stays verbatim and bounded', () => {
  const cues = mechanicCues('(1) Ordinary rule. (2) If nobody acts within 30 days, certification occurs automatically. (3) Where the Senate fails to vote, a separate route applies. (4) Unrelated prose.');
  assert.equal(cues.length, 2);
  assert.match(cues[0], /If nobody acts within 30 days, certification occurs automatically/);
  assert.match(cues[1], /Where the Senate fails to vote, a separate route applies/);
});

test('Navigator retries a max-token synthesis instead of returning a cut-off answer', async () => {
  const originalFetch = global.fetch;
  const originalGateway = process.env.AI_GATEWAY_API_KEY;
  const originalOidc = process.env.VERCEL_OIDC_TOKEN;
  const originalAnthropic = process.env.ANTHROPIC_API_KEY;
  delete process.env.AI_GATEWAY_API_KEY;
  delete process.env.VERCEL_OIDC_TOKEN;
  process.env.ANTHROPIC_API_KEY = 'test-key';

  const payloads = [];
  let call = 0;
  global.fetch = async (_url, options) => {
    payloads.push(JSON.parse(options.body));
    call++;
    return {
      ok:true,
      status:200,
      text:async () => '',
      json:async () => call === 1
        ? { content:[{type:'text',text:'Cut off answer'}], stop_reason:'max_tokens' }
        : { content:[{type:'text',text:'Complete bounded answer.'}], stop_reason:'end_turn' },
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

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.summary, 'Complete bounded answer.');
    assert.equal(payloads.length, 2);
    assert.equal(payloads[0].max_tokens, 600);
    assert.equal(payloads[1].max_tokens, 900);
    assert.match(payloads[0].system, /Never transfer a trigger, deadline, fallback, override, funding rule, or consequence/i);
    assert.match(payloads[1].system, /Rewrite the full answer from the beginning/i);
  } finally {
    global.fetch = originalFetch;
    if (originalGateway === undefined) delete process.env.AI_GATEWAY_API_KEY; else process.env.AI_GATEWAY_API_KEY = originalGateway;
    if (originalOidc === undefined) delete process.env.VERCEL_OIDC_TOKEN; else process.env.VERCEL_OIDC_TOKEN = originalOidc;
    if (originalAnthropic === undefined) delete process.env.ANTHROPIC_API_KEY; else process.env.ANTHROPIC_API_KEY = originalAnthropic;
    delete require.cache[require.resolve('../api/navigator.js')];
  }
});


test('Navigator packet includes structural sibling provisions before unrelated context', () => {
  const provisions = constitution.flatMap(a => a.provisions);
  const byNum = new Map(provisions.map(p => [p.num, p]));
  const packet = buildNavigatorContextPacket(
    'Can the Senate block a Supreme Court seat forever under §4.4?',
    [{ provision:byNum.get('§4.4'), score:20 }],
    provisions
  );

  assert.match(packet.packet, /\[§4\.4\.a\] Public Confirmation/);
  assert.match(packet.packet, /structural sibling to §4\.4/);
});
