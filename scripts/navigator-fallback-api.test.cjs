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

test('underspecified fallback query guides the user to resources without an AI call', async () => {
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
    assert.equal(res.body.retrieval.sufficient, false);
    assert.notEqual(res.body.answerState, 'full');
    assert.doesNotMatch(res.body.summary, /try naming the office, process, or section/i);
    assert.ok(Array.isArray(res.body.resources));
    assert.ok(res.body.resources.length > 0);
    for (const resource of res.body.resources.filter(r => r.kind === 'provision')) {
      assert.match(resource.href, /^annotated\.html#s/);
    }
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
    assert.match(seenBody.system, /every material consequence, exception, continuation rule, and fallback/i);
    assert.equal(seenBody.max_tokens, 600);
  } finally {
    global.fetch = originalFetch;
    if (originalGateway === undefined) delete process.env.AI_GATEWAY_API_KEY; else process.env.AI_GATEWAY_API_KEY = originalGateway;
    if (originalOidc === undefined) delete process.env.VERCEL_OIDC_TOKEN; else process.env.VERCEL_OIDC_TOKEN = originalOidc;
    if (originalAnthropic === undefined) delete process.env.ANTHROPIC_API_KEY; else process.env.ANTHROPIC_API_KEY = originalAnthropic;
  }
});


test('Annotated Constitution resource links target exact provision anchors', () => {
  const { annotatedAnchor, annotatedHref } = require('../api/_navigator-resources.js');
  assert.equal(annotatedAnchor('§2.14'), 's2-14');
  assert.equal(annotatedAnchor('§2.14.a'), 's2-14a');
  assert.equal(annotatedAnchor('§1.19.a'), 's1-19a');
  assert.equal(annotatedHref('§4.4.a'), 'annotated.html#s4-4a');
});

test('dual-executive freeform questions reach Sonnet with the verified cross-domain packet and resources', async () => {
  const originalFetch = global.fetch;
  const originalGateway = process.env.AI_GATEWAY_API_KEY;
  const originalOidc = process.env.VERCEL_OIDC_TOKEN;
  const originalAnthropic = process.env.ANTHROPIC_API_KEY;

  delete process.env.AI_GATEWAY_API_KEY;
  delete process.env.VERCEL_OIDC_TOKEN;
  process.env.ANTHROPIC_API_KEY = 'test-key';

  const questions = [
    'Why are there two executives?',
    "Why are there two executives with agency, doesn't that get chaotic in a crisis?",
  ];

  let fetchCalls = 0;
  const seenBodies = [];
  global.fetch = async (url, options) => {
    fetchCalls++;
    seenBodies.push(JSON.parse(options.body));
    return {
      ok: true,
      json: async () => ({ content: [{ type:'text', text:'The Constitution divides executive authority between the two Consuls and provides cross-domain coordination mechanisms; it does not itself state a single official design rationale.' }] }),
      text: async () => '',
    };
  };

  try {
    delete require.cache[require.resolve('../api/navigator.js')];
    const handler = require('../api/navigator.js');

    for (const question of questions) {
      const res = makeRes();
      await handler({ method:'POST', body:{ question } }, res);

      assert.equal(res.statusCode, 200, question);
      assert.equal(res.body.answerState, 'full', question);
      for (const num of ['§2.1','§2.5','§2.14','§2.14.a']) {
        assert.ok(res.body.provisions.some(p => p.num === num), `${question}: missing ${num}`);
        const resource = res.body.resources.find(r => r.kind === 'provision' && r.title.startsWith(num + ' '));
        assert.ok(resource, `${question}: missing resource ${num}`);
        assert.match(resource.href, /^annotated\.html#s/, question);
      }
      assert.ok(res.body.resources.some(r => r.href === 'scenario-coordination-failure.html'), `${question}: missing Stalemate`);
    }

    assert.equal(fetchCalls, questions.length);
    for (const body of seenBodies) {
      const packet = body.messages[0].content;
      assert.match(packet, /\[§2\.1\]/);
      assert.match(packet, /\[§2\.5\]/);
      assert.match(packet, /\[§2\.14\]/);
      assert.match(packet, /\[§2\.14\.a\]/);
      assert.match(body.system, /design rationale/i);
      assert.match(body.system, /do not invent an authorial purpose/i);
    }
  } finally {
    global.fetch = originalFetch;
    if (originalGateway === undefined) delete process.env.AI_GATEWAY_API_KEY; else process.env.AI_GATEWAY_API_KEY = originalGateway;
    if (originalOidc === undefined) delete process.env.VERCEL_OIDC_TOKEN; else process.env.VERCEL_OIDC_TOKEN = originalOidc;
    if (originalAnthropic === undefined) delete process.env.ANTHROPIC_API_KEY; else process.env.ANTHROPIC_API_KEY = originalAnthropic;
  }
});

test('Navigator homepage presents freeform guidance instead of preset question chips', () => {
  const fs = require('node:fs');
  const html = fs.readFileSync('index.html','utf8');
  assert.match(html, /Ask in your own words/);
  assert.match(html, /How do the Civic and Legat Consuls divide executive authority\?/);
  assert.doesNotMatch(html, /class="nav-chip"/);
  assert.doesNotMatch(html, /function setNav\(/);
  assert.match(html, /What the Constitution establishes/);
  assert.match(html, /Where to read more/);
});
