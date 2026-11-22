const { test } = require('node:test');
const assert = require('node:assert/strict');

// Live-generation tests must not be short-circuited by stored annotations.
process.env.ANNOTATE_STORED = 'off';

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
  assert.match(withLog.packet, /\[HISTORY 1\]/);
  assert.match(withLog.packet, new RegExp(cited.title.slice(0, 20).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));

  const data = core.getConstitutionData();
  const cites = new Set(history.entries.flatMap(e => e.refs || []));
  const uncited = data.flatMap(a => a.provisions).find(p => !cites.has(p.num));
  if (uncited) {
    const packet = core.buildContextPacket(uncited.num).packet;
    assert.match(packet, /RECORDED DESIGN HISTORY[^\n]*\n\(none\)/);
    assert.doesNotMatch(packet, /\[HISTORY 1\]/);
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

test('System prompt uses recorded history and defined terms in plain voice, without narrating sources or absences', () => {
  const { SYSTEM } = require('../api/_annotator-core.js');
  assert.match(SYSTEM, /RECORDED DESIGN HISTORY/);
  assert.match(SYSTEM, /DEFINED TERMS/);
  assert.match(SYSTEM, /VOICE:/);
  assert.match(SYSTEM, /never refer to the packet, the sources, the change log/i);
  assert.match(SYSTEM, /do not remark on what the text, the history, or the sources leave unsaid/i);
  assert.doesNotMatch(SYSTEM, /attributed to the (project's )?change log/i);
  assert.doesNotMatch(SYSTEM, /record no rationale/i);
});

function fakeRes() {
  return {
    headers: {},
    setHeader(k, v) { this.headers[k] = v; },
    status(n) { this.statusCode = n; return this; },
    json(v) { this.body = v; return this; },
    end() { return this; },
  };
}

async function withMockedModel(text, fn) {
  const originalFetch = global.fetch;
  const originalKey = process.env.ANTHROPIC_API_KEY;
  const originalGateway = process.env.AI_GATEWAY_API_KEY;
  const originalOidc = process.env.VERCEL_OIDC_TOKEN;
  delete process.env.AI_GATEWAY_API_KEY;
  delete process.env.VERCEL_OIDC_TOKEN;
  process.env.ANTHROPIC_API_KEY = 'test-only';
  let calls = 0;
  global.fetch = async () => {
    calls++;
    return { ok: true, status: 200, json: async () => ({ content: [{ type: 'text', text }], stop_reason: 'end_turn' }) };
  };
  try {
    return await fn(() => calls);
  } finally {
    global.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.ANTHROPIC_API_KEY; else process.env.ANTHROPIC_API_KEY = originalKey;
    if (originalGateway === undefined) delete process.env.AI_GATEWAY_API_KEY; else process.env.AI_GATEWAY_API_KEY = originalGateway;
    if (originalOidc === undefined) delete process.env.VERCEL_OIDC_TOKEN; else process.env.VERCEL_OIDC_TOKEN = originalOidc;
  }
}

const THREE = 'One plain paragraph.\n\nTwo plain paragraphs.\n\nThree plain paragraphs.';

test('Stored annotation is served without a model call while its packet hash matches', async () => {
  const run = require('../api/_annotator-run.js');
  const core = require('../api/_annotator-core.js');
  const handler = require('../api/annotate.js');
  const hash = run.packetHash(core.buildContextPacket('§2.5'));
  process.env.ANNOTATE_STORED = 'on';
  run.setStoreForTests({ entries: { '§2.5': { hash, text: 'Stored text.', model: 'test' } } });
  try {
    await withMockedModel(THREE, async (calls) => {
      const res = fakeRes();
      await handler({ method: 'POST', body: { num: '§2.5' } }, res);
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.annotation, 'Stored text.');
      assert.equal(res.body.source, 'stored');
      assert.equal(calls(), 0);
    });
  } finally {
    process.env.ANNOTATE_STORED = 'off';
    run.setStoreForTests(null);
  }
});

test('Stale stored annotation (hash mismatch) and ANNOTATE_STORED=off both fall back to live generation', async () => {
  const run = require('../api/_annotator-run.js');
  const handler = require('../api/annotate.js');
  const core = require('../api/_annotator-core.js');
  const goodHash = run.packetHash(core.buildContextPacket('§2.5'));
  try {
    process.env.ANNOTATE_STORED = 'on';
    run.setStoreForTests({ entries: { '§2.5': { hash: 'stale-hash-0000', text: 'Old text.' } } });
    await withMockedModel(THREE, async (calls) => {
      const res = fakeRes();
      await handler({ method: 'POST', body: { num: '§2.5' } }, res);
      assert.equal(res.body.source, 'live');
      assert.equal(res.body.annotation, THREE);
      assert.equal(calls(), 1);
    });
    run.setStoreForTests({ entries: { '§2.5': { hash: goodHash, text: 'Stored text.' } } });
    process.env.ANNOTATE_STORED = 'off';
    await withMockedModel(THREE, async (calls) => {
      const res = fakeRes();
      await handler({ method: 'POST', body: { num: '§2.5' } }, res);
      assert.equal(res.body.source, 'live');
      assert.equal(calls(), 1);
    });
  } finally {
    process.env.ANNOTATE_STORED = 'off';
    run.setStoreForTests(null);
  }
});

test('Generator endpoint answers only on protected vercel.app hosts and returns hash, lint and text', async () => {
  const gen = require('../api/annotations-generate.js');
  const closed = fakeRes();
  await gen({ method: 'GET', headers: { host: 'thefederatedrepublic.org' }, query: { op: 'status' } }, closed);
  assert.equal(closed.statusCode, 404);

  const status = fakeRes();
  await gen({ method: 'GET', headers: { host: 'x.vercel.app' }, query: { op: 'status' } }, status);
  assert.equal(status.statusCode, 200);
  assert.equal(status.body.total, 177);
  assert.equal(status.body.fresh + status.body.staleCount, 177);

  const tooMany = fakeRes();
  await gen({ method: 'GET', headers: { host: 'x.vercel.app' }, query: { op: 'generate', nums: '1.1,1.2,1.3,1.4,1.5,1.6,1.7,1.8,1.9' } }, tooMany);
  assert.equal(tooMany.statusCode, 400);

  await withMockedModel('The packet shows it.\n\nTwo.\n\nThree.', async () => {
    const res = fakeRes();
    await gen({ method: 'GET', headers: { host: 'x.vercel.app' }, query: { op: 'generate', nums: '2.5,§2.6' } }, res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.results.length, 2);
    const first = res.body.results[0];
    assert.equal(first.num, '§2.5');
    assert.match(first.hash, /^[0-9a-f]{16}$/);
    assert.ok(first.issues.includes('mentions the packet'));
    assert.equal(first.attempts, 3);
  });

  // A model that fixes its output on the second attempt is accepted without further retries.
  const originalFetch = global.fetch;
  const originalKey = process.env.ANTHROPIC_API_KEY;
  const originalGateway = process.env.AI_GATEWAY_API_KEY;
  const originalOidc = process.env.VERCEL_OIDC_TOKEN;
  delete process.env.AI_GATEWAY_API_KEY;
  delete process.env.VERCEL_OIDC_TOKEN;
  process.env.ANTHROPIC_API_KEY = 'test-only';
  let n = 0;
  const bodies = [];
  global.fetch = async (_url, options) => {
    bodies.push(JSON.parse(options.body));
    n++;
    const text = n === 1 ? 'The packet says so.\n\nTwo.\n\nThree.' : 'The Civic Consul holds residual power.\n\nIt relies on §2.1.\n\nIt prevents gaps.';
    return { ok: true, status: 200, json: async () => ({ content: [{ type: 'text', text }], stop_reason: 'end_turn' }) };
  };
  try {
    const res = fakeRes();
    await gen({ method: 'GET', headers: { host: 'x.vercel.app' }, query: { op: 'generate', nums: '2.5' } }, res);
    const r = res.body.results[0];
    assert.equal(r.attempts, 2);
    assert.deepEqual(r.issues, []);
    assert.match(bodies[1].messages[0].content, /REWRITE REQUIRED: mentions the packet/);
    assert.ok(bodies[1].max_tokens >= 3000);
  } finally {
    global.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.ANTHROPIC_API_KEY; else process.env.ANTHROPIC_API_KEY = originalKey;
    if (originalGateway === undefined) delete process.env.AI_GATEWAY_API_KEY; else process.env.AI_GATEWAY_API_KEY = originalGateway;
    if (originalOidc === undefined) delete process.env.VERCEL_OIDC_TOKEN; else process.env.VERCEL_OIDC_TOKEN = originalOidc;
  }
});

test('Annotation lint accepts plain three-paragraph prose and rejects source talk, absences, and unknown section numbers', () => {
  const { annotationLint } = require('../api/_annotator-run.js');
  const valid = new Set(['§2.5', '§2.1']);
  assert.deepEqual(annotationLint('The Civic Consul holds residual power (§2.5).\n\nIt relies on §2.1.\n\nIt prevents gaps.', valid).issues, []);
  const bad = annotationLint('The log entry says so.\n\nThe text does not state why.\n\nSee §9.99.', valid).issues;
  assert.ok(bad.includes('cites the log') && bad.includes('narrates an absence') && bad.some(i => /unknown provision number §9\.99/.test(i)));
});

test('Every committed stored annotation passes the quality gate', () => {
  const store = require('../annotations.json');
  const { annotationLint } = require('../api/_annotator-run.js');
  const core = require('../api/_annotator-core.js');
  const valid = new Set(core.getConstitutionData().flatMap(a => a.provisions.map(p => p.num)));
  for (const [num, entry] of Object.entries(store.entries || {})) {
    assert.ok(valid.has(num), `${num} is not a provision`);
    assert.match(entry.hash, /^[0-9a-f]{16}$/, `${num} hash`);
    const lint = annotationLint(entry.text, valid);
    assert.deepEqual(lint.issues, [], `${num}: ${lint.issues.join('; ')}`);
  }
});
