import test from 'node:test';
import assert from 'node:assert/strict';
import {validateWorld,chronology,relatedWorld} from '../lib/world.mjs';
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
