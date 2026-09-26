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

test('independent NRS ordering, combined chronology, and narrative navigation retain legacy sequences',async()=>{
 const {narrativeWorld,nrsRecords,streamRecords}=await import('../lib/world.mjs');
 const a=piece('news-a','13.12',137),b=piece('news-b','14.01',138);
 const old=piece('old-nrs','13.12',130);Object.assign(old.data,{worldKind:'nrs',nrsSeq:41,nrsId:'NRS-Y13-0705'});
 const n=piece('new-nrs','14.01',undefined);Object.assign(n.data,{worldKind:'nrs',nrsSeq:42,nrsId:'NRS-Y14-0001'});
 const records=[n,b,old,a];validateWorld(records,new Set(['§15.2']));
 assert.deepEqual(narrativeWorld(records).map(p=>p.data.worldId),['news-a','news-b']);
 assert.deepEqual(nrsRecords(records).map(p=>p.data.worldId),['old-nrs','new-nrs']);
 assert.equal([...records].sort(chronology).length,4);
 assert.deepEqual(streamRecords(records,'news'),[a,b]);assert.deepEqual(streamRecords(records,'nrs'),[old,n]);
 assert.equal(old.data.worldSeq,130);assert.equal(n.data.worldSeq,undefined);
 for(const key of ['nrsSeq','nrsId']){const copy=structuredClone(n);copy.data[key]=old.data[key];assert.throws(()=>validateWorld([old,copy],new Set(['§15.2'])),new RegExp(key));}
 const core={id:'korda',seedRecords:['old-nrs','new-nrs']};assert.deepEqual(dossierRecords(records,core),[old,n]);
});

test('known equal days retain a deterministic sequence tie-break without inventing days',()=>{
 const a=piece('a','13.12',1),b=piece('b','13.12',2),month=piece('month','13.12',3);
 a.data.worldDay=26;b.data.worldDay=26;
 assert.deepEqual([b,month,a].sort(chronology).map(p=>p.data.worldId),['month','a','b']);
});
