import test from 'node:test';
import assert from 'node:assert/strict';
import {validateWorld,chronology,relatedWorld,dossierRecords,validateDossiers,worldNewest} from '../lib/world.mjs';
const piece=(id,date,seq,arcs=[],related=[])=>({inputPath:id,url:id+'.html',data:{worldId:id,worldDate:date,worldSeq:seq,worldArcs:arcs,worldJurisdictions:[],worldProvisions:['§15.2'],worldRelated:related}});
test('chronology orders numeric year/month and explicit within-month sequence',()=>{
 const pieces=[piece('a','13.10',2),piece('b','13.09',1),piece('c','13.10',3),piece('d','100.01',4)];
 assert.deepEqual(pieces.sort(chronology).map(p=>p.data.worldId),['b','a','c','d']);
});
test('publication rejects ambiguous metadata and broken relationships',()=>{
 const refs=new Set(['§15.2']);
 assert.throws(()=>validateWorld([piece('a','13.12',1),piece('b','13.12',1)],refs),/worldSeq/);
 assert.throws(()=>validateWorld([piece('a','13.13',1)],refs),/worldDate/);
 assert.throws(()=>validateWorld([piece('a','13.12',1,[],['missing.html'])],refs),/Unknown related/);
 assert.throws(()=>validateWorld([piece('a','13.12',1)],new Set()),/Unknown provision/);
});
test('related records prioritize explicit relationships, exclude self and unrelated newest news',()=>{
 const a=piece('a','13.12',3,['korda'],['old.html']);
 const records=[piece('old','13.10',1),piece('shared','13.12',2,['korda']),a,piece('unrelated','13.12',4)];
 assert.deepEqual(relatedWorld(records,'a').map(p=>p.data.worldId),['old','shared']);
});

test('dossiers preserve seeds, opt in core records once, and exclude supporting coverage',()=>{
 const seed=piece('seed','13.12',2,['korda']);
 seed.data.worldDossiers=['korda'];
 const core=piece('core','14.01',3,['korda']);core.data.worldDossiers=['korda'];
 const supporting=piece('supporting','14.02',4,['korda']);
 const historical=piece('historical','13.11',1);
 const pieces=[supporting,core,seed,historical];
 const selected=dossierRecords(pieces,{id:'korda',seedRecords:['seed','historical']});
 assert.deepEqual(selected.map(p=>p.data.worldId),['historical','seed','core']);
 assert.equal(worldNewest(selected),'14.01');
 assert.equal(worldNewest([core,seed]),'14.01');
 assert.equal(worldNewest([]),null);
 assert.equal(pieces[0],supporting,'selection must not mutate the collection');
});

test('dossier publication rejects invalid values, missing arcs, and missing seeds',()=>{
 const refs=new Set(['§15.2']);
 const a=piece('a','13.12',1,['korda']);
 const files=[{id:'korda',seedRecords:['a'],provisions:['§15.2']}];
 a.data.worldDossiers='korda';
 assert.throws(()=>validateWorld([a],refs),/worldDossiers/);
 a.data.worldDossiers=['unknown'];
 assert.throws(()=>validateDossiers([a],files,refs),/Unknown dossier/);
 a.data.worldDossiers=['korda'];a.data.worldArcs=[];
 assert.throws(()=>validateDossiers([a],files,refs),/must also appear/);
 a.data.worldArcs=['korda'];
 assert.doesNotThrow(()=>validateDossiers([a],files,refs));
 assert.throws(()=>validateDossiers([a],[{...files[0],seedRecords:['missing']}],refs),/Missing briefing seed/);
 assert.throws(()=>validateDossiers([],[{...files[0],seedRecords:[]}],refs),/Empty briefing/);
});
