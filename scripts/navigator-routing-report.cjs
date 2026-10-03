#!/usr/bin/env node
const fs = require('node:fs');
const constitution = require('../constitution_data.json');
const { topicMatch } = require('../api/_navigator-topics.js');
const {
  expandQuery,
  rankProvisions,
  retrievalGate,
  retrievalSufficiency,
  uniqueTitleMatch,
  explicitSectionRefs,
  contextualSectionRefs,
} = require('../api/_navigator-core.js');

const provisions = constitution.flatMap(a => a.provisions);
const byNum = new Map(provisions.map(p => [p.num, p]));

function classify(question) {
  const terms = expandQuery(question);
  const lexicalRanked = rankProvisions(provisions, terms, 5);
  const contextualRefs = contextualSectionRefs(question);
  const contextualRanked = contextualRefs
    .map((num, index) => byNum.get(num) ? ({ provision: byNum.get(num), score: 100 - index, via: 'context' }) : null)
    .filter(Boolean);
  const contextualNums = new Set(contextualRanked.map(x => x.provision.num));
  const ranked = [...contextualRanked, ...lexicalRanked.filter(x => !contextualNums.has(x.provision.num))].slice(0, 5);
  const matched = ranked.map(x => x.provision);
  const gate = retrievalGate(question, ranked);

  const topic = topicMatch(question);
  if (topic) return { route:'deterministic-topic', aiCalls:0, matched:topic.sections.map(([num]) => num) };

  const title = uniqueTitleMatch(question, provisions);
  if (title) return { route:'deterministic-title', aiCalls:0, matched:[title.num] };

  if (!matched.length) return { route:'resource-only', aiCalls:0, matched:[] };

  if (gate.status === 'TIER_A_CANDIDATE' && gate.reason === 'EXPLICIT_SINGLE_SECTION') {
    const refs = explicitSectionRefs(question);
    if (refs.length === 1 && byNum.has(refs[0])) {
      return { route:'deterministic-section', aiCalls:0, matched:[refs[0]] };
    }
  }

  const sufficiency = contextualRefs.length
    ? { sufficient:true, reason:'VERIFIED_CONTEXT_PACKET' }
    : retrievalSufficiency(question, ranked);

  if (!sufficiency.sufficient) {
    return { route:'guided-fallback', aiCalls:0, matched:matched.map(p => p.num), reason:sufficiency.reason };
  }

  return { route:'sonnet-synthesis', aiCalls:1, matched:matched.map(p => p.num), reason:sufficiency.reason };
}

function countRoutes(rows) {
  return rows.reduce((out, row) => {
    const key = row.result.route;
    out[key] = (out[key] || 0) + 1;
    return out;
  }, {});
}

function pct(n, total) {
  return total ? Math.round((n / total) * 1000) / 10 : 0;
}

function summarize(name, questions) {
  const rows = questions.map(item => ({
    id: item.id,
    question: item.question,
    result: classify(item.question),
  }));
  const counts = countRoutes(rows);
  const total = rows.length;
  const zeroAI = rows.filter(x => x.result.aiCalls === 0).length;
  const sonnet = rows.filter(x => x.result.route === 'sonnet-synthesis').length;
  return {
    name,
    total,
    counts,
    zeroAI,
    zeroAIPercent: pct(zeroAI, total),
    sonnet,
    sonnetPercent: pct(sonnet, total),
  };
}

const natural = JSON.parse(fs.readFileSync('scripts/fixtures/navigator-natural-language-cases.json','utf8'));
const gate = JSON.parse(fs.readFileSync('scripts/fixtures/navigator-gate-cases.json','utf8'));
const direct = JSON.parse(fs.readFileSync('scripts/fixtures/navigator-haiku-direct-cases.json','utf8'));

const summaries = [
  summarize('natural-language', natural),
  summarize('gate', gate),
  summarize('explicit-direct', direct),
];

if (process.argv.includes('--json')) {
  process.stdout.write(JSON.stringify({ generatedFrom:'current deterministic routing code', summaries }, null, 2) + '\n');
  process.exit(0);
}

for (const s of summaries) {
  console.log(`\n${s.name}: ${s.total} benchmark questions`);
  for (const [route, count] of Object.entries(s.counts).sort()) {
    console.log(`  ${route}: ${count} (${pct(count, s.total)}%)`);
  }
  console.log(`  zero-AI routes: ${s.zeroAI} (${s.zeroAIPercent}%)`);
  console.log(`  Sonnet synthesis: ${s.sonnet} (${s.sonnetPercent}%)`);
}
console.log('\nThese are benchmark-corpus routing distributions, not production traffic shares.');
