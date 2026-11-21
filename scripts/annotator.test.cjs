const { test } = require('node:test');
const assert = require('node:assert/strict');

test('Annotator uses Sonnet with a deterministic source packet and enough output room', async () => {
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
        content:[{type:'text',text:'Grounded paragraph one.\n\nGrounded paragraph two.\n\nGrounded paragraph three.'}],
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
    assert.equal(body.annotation,'Grounded paragraph one.\n\nGrounded paragraph two.\n\nGrounded paragraph three.');
    assert.equal(payload.model,'claude-sonnet-5');
    assert.equal(payload.max_tokens,1600);
    assert.equal(payload.temperature,0);

    assert.match(payload.system,/source-bound constitutional design analyst/i);
    assert.match(payload.system,/application has already performed constitutional retrieval/i);
    assert.match(payload.system,/Do not invent enforcement mechanisms/i);
    assert.match(payload.system,/Never invent a provision number or label/i);
    assert.match(payload.system,/distinguish an initial review\/action window from the duration or legal effect/i);
    assert.match(payload.system,/roughly 350–500 words/i);
    assert.doesNotMatch(payload.system,/complete constitution text follows/i);

    const prompt = payload.messages[0].content;
    assert.match(prompt,/SOURCE PACKET — generated deterministically from constitution_data\.json/);
    assert.match(prompt,/TARGET PROVISION\nTARGET \[§2\.3\.a\] Legat Consul Legislative Veto/);
    assert.match(prompt,/\[§2\.7\] Civic Consul Legislative Instruments/,
      'same-article context should expose the distinct CC veto mechanics');
    assert.match(prompt,/Either Speaker may request an EM domain assessment/);
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


test('Annotator retries a max-token cutoff with a larger completion budget', async () => {
  const handler = require('../api/annotate.js');
  const originalFetch = global.fetch;
  const originalKey = process.env.ANTHROPIC_API_KEY;
  const originalGateway = process.env.AI_GATEWAY_API_KEY;
  const originalOidc = process.env.VERCEL_OIDC_TOKEN;

  delete process.env.AI_GATEWAY_API_KEY;
  delete process.env.VERCEL_OIDC_TOKEN;
  process.env.ANTHROPIC_API_KEY = 'test-only';

  const payloads = [];
  let call = 0;
  global.fetch = async (_url, options) => {
    payloads.push(JSON.parse(options.body));
    call += 1;
    return {
      ok: true,
      status: 200,
      json: async () => call === 1
        ? { content:[{type:'text',text:'Cut off mid-sentence'}], stop_reason:'max_tokens' }
        : { content:[{type:'text',text:'Complete rewritten annotation.'}], stop_reason:'end_turn' }
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
    await handler({method:'POST',body:{num:'§2.6'}},res);
    assert.equal(res.statusCode,200);
    assert.equal(body.annotation,'Complete rewritten annotation.');
    assert.equal(body.truncated,false);
    assert.equal(payloads.length,2);
    assert.equal(payloads[0].max_tokens,1600);
    assert.equal(payloads[1].max_tokens,2400);
    assert.match(payloads[1].messages[0].content,/REWRITE REQUIRED:/i);
    assert.match(payloads[1].messages[0].content,/hit the output limit/i);
    assert.match(payloads[1].messages[0].content,/525-word hard limit/i);
  } finally {
    global.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.ANTHROPIC_API_KEY; else process.env.ANTHROPIC_API_KEY = originalKey;
    if (originalGateway === undefined) delete process.env.AI_GATEWAY_API_KEY; else process.env.AI_GATEWAY_API_KEY = originalGateway;
    if (originalOidc === undefined) delete process.env.VERCEL_OIDC_TOKEN; else process.env.VERCEL_OIDC_TOKEN = originalOidc;
    delete require.cache[require.resolve('../api/annotate.js')];
  }
});


test('Annotator rewrites end-turn output that violates the three-paragraph contract', async () => {
  const handler = require('../api/annotate.js');
  const originalFetch = global.fetch;
  const originalKey = process.env.ANTHROPIC_API_KEY;
  const originalGateway = process.env.AI_GATEWAY_API_KEY;
  const originalOidc = process.env.VERCEL_OIDC_TOKEN;

  delete process.env.AI_GATEWAY_API_KEY;
  delete process.env.VERCEL_OIDC_TOKEN;
  process.env.ANTHROPIC_API_KEY = 'test-only';

  const payloads = [];
  let call = 0;
  global.fetch = async (_url, options) => {
    payloads.push(JSON.parse(options.body));
    call++;
    return {
      ok:true,
      status:200,
      json:async () => call === 1
        ? { content:[{type:'text',text:'# Heading\n\nFirst paragraph only.'}], stop_reason:'end_turn' }
        : { content:[{type:'text',text:'Paragraph one.\n\nParagraph two.\n\nParagraph three.'}], stop_reason:'end_turn' }
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
    await handler({method:'POST',body:{num:'§2.6'}},res);
    assert.equal(res.statusCode,200);
    assert.equal(body.annotation,'Paragraph one.\n\nParagraph two.\n\nParagraph three.');
    assert.equal(payloads.length,2);
    assert.match(payloads[1].messages[0].content,/used 2 paragraphs instead of exactly 3/i);
    assert.match(payloads[1].messages[0].content,/used headings or bullets/i);
  } finally {
    global.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.ANTHROPIC_API_KEY; else process.env.ANTHROPIC_API_KEY = originalKey;
    if (originalGateway === undefined) delete process.env.AI_GATEWAY_API_KEY; else process.env.AI_GATEWAY_API_KEY = originalGateway;
    if (originalOidc === undefined) delete process.env.VERCEL_OIDC_TOKEN; else process.env.VERCEL_OIDC_TOKEN = originalOidc;
    delete require.cache[require.resolve('../api/annotate.js')];
  }
});

test('Packet carries recorded change-log history for a provision the log cites, and none-marker otherwise', () => {
  const core = require('../api/_annotator-core.js');
  const history = core.getAnnotationHistory();
  assert.ok(history.entries.length > 50);
  const cited = history.entries.filter(e => (e.refs || []).includes('§2.16')).sort((a, b) => b.date.localeCompare(a.date))[0];
  assert.ok(cited, 'expected the log to cite §2.16');
  const withLog = core.buildContextPacket('§2.16');
  assert.match(withLog.packet, /RECORDED DESIGN HISTORY/);
  assert.match(withLog.packet, /\[LOG 1\]/);
  assert.match(withLog.packet, new RegExp(cited.title.slice(0, 20).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));

  const data = core.getConstitutionData();
  const cites = new Set(history.entries.flatMap(e => e.refs || []));
  const uncited = data.flatMap(a => a.provisions).find(p => !cites.has(p.num));
  if (uncited) {
    const packet = core.buildContextPacket(uncited.num).packet;
    assert.match(packet, /\(none — the supplied sources record no rationale for this provision\)/);
    assert.doesNotMatch(packet, /\[LOG 1\]/);
  }
});

test('Recorded history excludes corrupted "529" sentences, pre-reorder entries, and raw HTML entities', () => {
  const { entries, cutoff } = require('../api/_annotator-core.js').getAnnotationHistory();
  for (const e of entries) {
    assert.ok(e.date >= cutoff, `${e.id} predates the numbering cutoff`);
    assert.doesNotMatch(e.text, /\b529\b/, `${e.id} contains the 529 placeholder`);
    assert.doesNotMatch(`${e.label} ${e.title} ${e.text}`, /&[a-z#0-9]+;/i, `${e.id} has an undecoded entity`);
  }
});

test('Packet supplies the defining provision of a term used across Articles (Civic Consul relies on the Legat Consul domain in §2.1)', () => {
  const core = require('../api/_annotator-core.js');
  const ctx = core.buildContextPacket('§2.5');
  const defining = ctx.related.filter(r => /^defining provision of/.test(r.relation));
  assert.ok(defining.some(r => r.provision.num === '§2.1' && /Legat Consul/.test(r.relation)));
  assert.match(ctx.packet, /RELATED \d+ — defining provision of "Legat Consul"/);
  assert.ok(ctx.related.length <= 4);
  // A cross-Article defining provision is reachable too.
  const cross = core.buildContextPacket('§3.6').related.find(r => r.provision.num === '§2.1');
  assert.ok(cross, '§3.6 should pull §2.1 across Articles');
});

test('System prompt lets the model report recorded history and forbids "defined elsewhere" when the packet supplies the definition', () => {
  const { SYSTEM } = require('../api/_annotator-core.js');
  assert.match(SYSTEM, /RECORDED DESIGN HISTORY/);
  assert.match(SYSTEM, /never say that no explanation exists/i);
  assert.match(SYSTEM, /DEFINED TERMS/);
  assert.match(SYSTEM, /never describe a definition as merely presumed/i);
});
