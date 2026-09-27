import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {parseStateProvisions, readStateConstitutions, parseStateTest, validateStateTests, indexStateTests, stateTestCitations} from '../lib/state-tests.mjs';

const file='state-tests/varek/varek-test-01-the-72-hour-flood.html';
const original=parseStateTest(fs.readFileSync(file,'utf8'),file);
const states=readStateConstitutions();
const record=(data={},content=original.content)=>({...original,data:{...original.data,...data},content});
const errors=(records)=>validateStateTests(records,states).errors.join('\n');

test('Varek canonical prototype validates against the real State Constitution',()=>{
  assert.equal(errors([original]),'');
  assert.deepEqual(original.data.stateProvisions,['3.5','12.1','12.2','12.3','12.10','12.11']);
  for(const name of ['Deverin Hask','Toma Ilvest','Tessin','Tessin Ford','Hollowmere County']) assert.ok(original.content.includes(name));
  assert.equal(original.data.date,'6.09');
});
test('State definitions are read across established heading formats without treating citations as definitions',()=>{
  assert.equal(Object.keys(states).length,12);
  for(const state of Object.values(states)) assert.ok(Object.keys(state.provisions).length>0,state.id);
  assert.ok(states.norvane.provisions['1.1']);
  assert.ok(states.selvane.provisions['1']);
  assert.ok(states.caldenmere.provisions['1.1'].text.startsWith('All persons'));
  const p=parseStateProvisions('## §3.5 Presiding Officer\nSee §99.1.\n\n## Other heading\nNot provision text.');
  assert.deepEqual(Object.keys(p),['3.5']);
  assert.equal(p['3.5'].text,'See §99.1.');
  assert.throws(()=>parseStateProvisions('## §1.1 First\n## §1.1 Second'),/Duplicate/);
});
test('required State-test metadata rejects invalid types, identity, title, date, provisions and status',()=>{
  for(const [change,expected] of [
    [{stateTest:false},/stateTest must be true/], [{state:'unknown'},/Unknown State/],
    [{testNumber:0},/positive safe integer/], [{testNumber:1.5},/positive safe integer/],
    [{testNumber:Number.MAX_SAFE_INTEGER+1},/positive safe integer/],
    [{testId:'varek-test-1'},/testId must match/], [{state:'harren'},/Filename\/path/],
    [{title:''},/title must be/], [{title:'  '},/title must be/], [{title:undefined},/title must be/],
    [{date:'6.13'},/fictional Year.MM/], [{date:'6.9'},/fictional Year.MM/], [{date:6.09},/fictional Year.MM/],
    [{date:'2026-09-26'},/fictional Year.MM/], [{date:'0.09'},/fictional Year.MM/],
    [{stateProvisions:'3.5'},/must be an array/], [{stateProvisions:['99.1']},/Unknown State provision/],
    [{stateProvisions:[3.5]},/Unknown State provision/], [{status:'draft'},/canonical-history/]
  ]) assert.match(errors([record(change)]),expected,JSON.stringify(change));
});
test('duplicate State numbers and IDs are refused across filenames; different States can each have test 01',()=>{
  const copy={...original,inputPath:'state-tests/varek/varek-test-01-another.html'};
  assert.match(errors([original,copy]),/Duplicate testId/);
  assert.match(errors([original,copy]),/Duplicate testNumber/);
  const differentId={...copy,data:{...copy.data,testId:'varek-test-02'}};
  assert.match(errors([original,differentId]),/Duplicate testNumber/);
  const differentNumber={...copy,data:{...copy.data,testNumber:2}};
  assert.match(errors([original,differentNumber]),/Duplicate testId/);
  const other={...record({state:'harren',testId:'harren-test-01',stateProvisions:['1.1']}),inputPath:'state-tests/harren/harren-test-01-river.html'};
  assert.equal(errors([original,other]),'');
});
test('paths and filename numbering are strict and cannot silently rename a State test',()=>{
  for(const inputPath of ['state-tests/varek/varek-test-1-flood.html','state-tests/varek/varek-test-001-flood.html','state-tests/varek/varek-test-02-flood.html','state-tests/harren/varek-test-01-flood.html','varek-test-01-flood.html'])
    assert.match(errors([{...original,inputPath}]),/Filename\/path/);
});
test('drafts, review flags, placeholders and routing/World overrides are refused',()=>{
  for(const key of ['draft','stateTestDraft','ingestReview','review','needsReview']) assert.match(errors([record({[key]:true})]),/human review/);
  for(const key of ['layout','permalink','eleventyComputed','templateEngineOverride']) assert.match(errors([record({[key]:'x'})]),/manual review/);
  for(const word of ['TODO','TBD','FIXME','placeholder','<!-- draft -->']) assert.match(errors([record({},`<p>${word}</p>`)]),/placeholder/);
  assert.match(errors([record({worldSeq:138})]),/World\/NRS/);
  assert.throws(()=>parseStateTest('---javascript\nthrow Error("Executed")\n---\n',file),/plain YAML/);
});
test('discovery indexes both directions with the original fictional date and escaped source titles',()=>{
  const index=indexStateTests([original],states),entry=index.byId['varek-test-01'];
  assert.equal(entry.date,'6.09');
  assert.deepEqual(index.byProvision['varek:12.1'],['varek-test-01']);
  assert.equal(entry.provisions.find(p=>p.number==='12.1').url,'/state-tests.html#varek-12-1');
  assert.equal(index.states[0].provisions.find(p=>p.number==='12.1').tests[0].url,'/'+file);
  assert.match(stateTestCitations(entry),/href="\/state-tests.html#varek-12-11"/);
  assert.ok(!('worldSeq' in entry));
});
