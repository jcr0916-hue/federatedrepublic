#!/usr/bin/env node
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { buildWorldContextPacket } from '../lib/world-context-packet.mjs';

const require = createRequire(import.meta.url);
const constitution = require('../constitution_data.json');
const annotatorCore = require('../api/_annotator-core.js');
const navigatorContext = require('../api/_navigator-context.js');
const { topicMatch } = require('../api/_navigator-topics.js');
const navCore = require('../api/_navigator-core.js');

const provisions = constitution.flatMap(a => a.provisions || []);
const byNum = new Map(provisions.map(p => [p.num, p]));

function percentile(values, p) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a,b) => a-b);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil(sorted.length * p) - 1));
  return sorted[index];
}

function stats(values) {
  if (!values.length) return {count:0,min:0,median:0,p90:0,max:0,average:0};
  const total = values.reduce((a,b) => a + b, 0);
  return {
    count: values.length,
    min: Math.min(...values),
    median: percentile(values, 0.5),
    p90: percentile(values, 0.9),
    max: Math.max(...values),
    average: Math.round(total / values.length),
  };
}

function tokenProxy(chars) {
  return Math.round(chars / 4);
}

function rankQuestion(question) {
  const terms = navCore.expandQuery(question);
  const lexicalRanked = navCore.rankProvisions(provisions, terms, 5);
  const contextualRefs = navCore.contextualSectionRefs(question);
  const contextualRanked = contextualRefs
    .map((num,index) => byNum.get(num) ? ({provision:byNum.get(num), score:100-index, via:'context'}) : null)
    .filter(Boolean);
  const contextualNums = new Set(contextualRanked.map(x => x.provision.num));
  const ranked = [...contextualRanked, ...lexicalRanked.filter(x => !contextualNums.has(x.provision.num))].slice(0,5);
  return {contextualRefs, ranked};
}

function navigatorRoute(question) {
  const rankedResult = rankQuestion(question);
  const contextualRefs = rankedResult.contextualRefs;
  const ranked = rankedResult.ranked;
  const matched = ranked.map(x => x.provision);
  const gate = navCore.retrievalGate(question, ranked);
  const topic = topicMatch(question);
  if (topic) return {route:'deterministic-topic', aiCalls:0, ranked};
  const title = navCore.uniqueTitleMatch(question, provisions);
  if (title) return {route:'deterministic-title', aiCalls:0, ranked};
  if (!matched.length) return {route:'resource-only', aiCalls:0, ranked};
  if (gate.status === 'TIER_A_CANDIDATE' && gate.reason === 'EXPLICIT_SINGLE_SECTION') {
    const refs = navCore.explicitSectionRefs(question);
    if (refs.length === 1 && byNum.has(refs[0])) return {route:'deterministic-section', aiCalls:0, ranked};
  }
  const sufficiency = contextualRefs.length
    ? {sufficient:true, reason:'VERIFIED_CONTEXT_PACKET'}
    : navCore.retrievalSufficiency(question, ranked);
  if (!sufficiency.sufficient) return {route:'guided-fallback', aiCalls:0, ranked};
  return {route:'sonnet-synthesis', aiCalls:1, ranked};
}

function constitutionTextChars() {
  return provisions.reduce((n,p) => n + String(p.num).length + String(p.name).length + String(p.text).length + 4, 0);
}

export function buildEfficiencySnapshot(options = {}) {
  const dir = options.dir || '.';
  const fullConstitutionChars = constitutionTextChars();

  const annotationPackets = provisions.map(p => annotatorCore.buildContextPacket(p.num)).filter(Boolean);
  const annotationChars = annotationPackets.map(x => x.packet.length);
  const annotationRelated = annotationPackets.map(x => x.related.length);

  const natural = JSON.parse(fs.readFileSync(dir + '/scripts/fixtures/navigator-natural-language-cases.json','utf8'));
  const navRows = natural.map(item => {
    const routed = navigatorRoute(item.question);
    let packetChars = 0;
    if (routed.route === 'sonnet-synthesis') {
      packetChars = navigatorContext.buildNavigatorContextPacket(item.question, routed.ranked, provisions).packet.length;
    }
    return {route:routed.route, aiCalls:routed.aiCalls, id:item.id, packetChars};
  });
  const navCounts = navRows.reduce((out,row) => {
    out[row.route] = (out[row.route] || 0) + 1;
    return out;
  }, {});
  const navSynthesis = navRows.filter(x => x.route === 'sonnet-synthesis');
  const navPacketChars = navSynthesis.map(x => x.packetChars);

  const worldArcs = ['korda','lake-varda','fiscal-equalization','argent-ridge'];
  const worldPackets = worldArcs.map(arc => {
    const result = buildWorldContextPacket({arc,dir,recentNarrative:3,recentNrs:3});
    return {arc, packetChars:result.packet.length, tokenProxy:tokenProxy(result.packet.length)};
  });

  return {
    generatedFrom:'current repository architecture',
    note:'Character/token proxies below are static architecture measurements. Exact provider token use and request latency must come from runtime [annotator-metric] and [navigator-route] logs.',
    constitution:{
      provisions:provisions.length,
      fullTextChars:fullConstitutionChars,
      fullTextTokenProxy:tokenProxy(fullConstitutionChars),
    },
    annotator:{
      model:'anthropic/claude-sonnet-5',
      requestsPerNormalAnswer:1,
      requestsOnRewrite:2,
      fixedSystemChars:annotatorCore.SYSTEM.length,
      packetChars:stats(annotationChars),
      packetTokenProxy:stats(annotationChars.map(tokenProxy)),
      relatedProvisionCount:stats(annotationRelated),
      averagePacketToFullConstitutionRatio:Number((annotationChars.reduce((a,b) => a+b,0) / annotationChars.length / fullConstitutionChars).toFixed(3)),
    },
    navigator:{
      model:'anthropic/claude-sonnet-4.6',
      benchmarkCases:natural.length,
      routeCounts:navCounts,
      zeroAICases:navRows.filter(x => x.aiCalls === 0).length,
      synthesisCases:navSynthesis.length,
      synthesisPacketChars:stats(navPacketChars),
      synthesisPacketTokenProxy:stats(navPacketChars.map(tokenProxy)),
      shadowDefault:'off',
      normalSynthesisRequests:1,
      maxTokenRewriteRequests:2,
    },
    torenthia:{
      publicModelCalls:0,
      workflow:'deterministic packet + external/editorial drafting + deterministic validation',
      packets:worldPackets,
      packetChars:stats(worldPackets.map(x => x.packetChars)),
    },
  };
}

function print(snapshot) {
  const a = snapshot.annotator;
  const n = snapshot.navigator;
  const w = snapshot.torenthia;
  console.log('AI efficiency audit - current repository architecture\n');
  console.log('Constitution: ' + snapshot.constitution.provisions + ' provisions; ' + snapshot.constitution.fullTextChars + ' text chars (~' + snapshot.constitution.fullTextTokenProxy + ' token-size proxy).\n');
  console.log('Provision Annotator');
  console.log('  model: ' + a.model);
  console.log('  packet chars: avg ' + a.packetChars.average + '; median ' + a.packetChars.median + '; p90 ' + a.packetChars.p90 + '; max ' + a.packetChars.max);
  console.log('  packet/full-Constitution ratio: ' + (a.averagePacketToFullConstitutionRatio*100).toFixed(1) + '% average');
  console.log('  related exact-text provisions: avg ' + a.relatedProvisionCount.average + '; p90 ' + a.relatedProvisionCount.p90);
  console.log('  model calls: 1 normal; 2 only when output-contract rewrite is required\n');
  console.log('Constitution Navigator - 80-case natural-language benchmark');
  for (const entry of Object.entries(n.routeCounts).sort()) console.log('  ' + entry[0] + ': ' + entry[1]);
  console.log('  zero-AI cases: ' + n.zeroAICases + '/' + n.benchmarkCases);
  console.log('  Sonnet synthesis cases: ' + n.synthesisCases + '/' + n.benchmarkCases);
  console.log('  synthesis packet chars: avg ' + n.synthesisPacketChars.average + '; p90 ' + n.synthesisPacketChars.p90 + '; max ' + n.synthesisPacketChars.max);
  console.log('  shadow evaluator: ' + n.shadowDefault + ' by default\n');
  console.log('Torenthia authoring');
  console.log('  repository/public API model calls: 0');
  for (const row of w.packets) console.log('  ' + row.arc + ': ' + row.packetChars + ' chars (~' + row.tokenProxy + ' token-size proxy)');
  console.log('\nExact cost/token/latency accounting begins with runtime [annotator-metric] and [navigator-route] records; no user prompt/question text is included in those metrics.');
}

if (process.argv[1] && import.meta.url.endsWith('/' + process.argv[1].split('/').pop())) {
  const snapshot = buildEfficiencySnapshot({dir:'.'});
  if (process.argv.includes('--json')) process.stdout.write(JSON.stringify(snapshot,null,2) + '\n');
  else print(snapshot);
}
