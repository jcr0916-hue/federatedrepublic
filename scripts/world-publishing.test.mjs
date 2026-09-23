import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {readPublishingRecords,checkWorldPublishing} from '../lib/world-publishing.mjs';
import {buildWorldDraft} from '../lib/world-authoring.mjs';
const record=()=>({inputPath:'torenthia-news-001.html',content:'<p>Finished reporting.</p>',data:{worldKind:'news',worldId:'torenthia-news-001',worldDate:'13.12',worldSeq:1,worldTitle:'A report',worldOutlet:'The Torenthian',worldBlurb:'A summary',worldArcs:['korda'],worldDossiers:['korda'],worldJurisdictions:['Korda'],worldProvisions:[],worldRelated:[]}});
const options={provisions:new Set(),dossiers:[{id:'korda',seedRecords:[],provisions:[]}],status:'**Current published frontier:** Year 13, Month 12 · worldSeq through **1**'};
const check=r=>checkWorldPublishing([r],options);
test('finished records pass without mutating content or editorial state',()=>{
 const r=record(),before=JSON.stringify(r);
 assert.deepEqual(check(r),{errors:[],warnings:[]});assert.equal(JSON.stringify(r),before);
});
test('missing, blank, and malformed required metadata blocks publication',()=>{
 for(const key of ['worldKind','worldId','worldDate','worldTitle','worldOutlet','worldBlurb']){
  for(const value of [undefined,' ',42]){const r=record();r.data[key]=value;assert.ok(check(r).errors.length,key);}
 }
 for(const [key,value] of [['worldSeq',0],['worldArcs','korda'],['worldRelated',[42]],['worldMundane','true']]){
  const r=record();r.data[key]=value;assert.ok(check(r).errors.length,key);
 }
});
test('generated draft shells and explicit draft flags cannot publish',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'world-publish-'));
 try{
  const draft=buildWorldDraft({kind:'news',date:'13.12',title:'Title',blurb:'Summary',outlet:'The Torenthian',arcs:['korda'],dossiers:['korda']},[]);
  fs.writeFileSync(path.join(dir,draft.filename),draft.content);
  assert.match(checkWorldPublishing(readPublishingRecords(dir),options).errors.join('\n'),/draft marker/);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
 for(const key of ['draft','worldDraft']){const r=record();r.data[key]=true;assert.match(check(r).errors.join('\n'),/draft flag/);}
});
test('scan catches expected World filenames with missing metadata and custom World files',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'world-scan-'));
 try{
  fs.writeFileSync(path.join(dir,'torenthia-news-001.html'),'<p>Missing metadata</p>');
  fs.writeFileSync(path.join(dir,'custom.html'),'---\nworldTitle: Partial metadata\n---\n');
  fs.writeFileSync(path.join(dir,'index.html'),'<p>Home</p>');
  const records=readPublishingRecords(dir);assert.equal(records.length,2);
  assert.ok(checkWorldPublishing(records,options).errors.length);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('relationships, dossier rules, dates, and duplicate sequences remain blocking',()=>{
 for(const [key,value] of [['worldId','wrong'],['worldDate','13.13'],['worldArcs',[]],['worldRelated',['missing.html']],['worldProvisions',['§99.1']]]){
  const r=record();r.data[key]=value;assert.ok(check(r).errors.length,key);
 }
 const a=record(),b=record();b.inputPath='torenthia-news-002.html';b.data.worldId='torenthia-news-002';
 assert.match(checkWorldPublishing([a,b],options).errors.join('\n'),/worldSeq/);
});
test('new core records trigger advisory editorial review, without blocking',()=>{
 const r=record();r.data.worldSeq=2;
 const result=check(r);assert.equal(result.errors.length,0);
 assert.ok(result.warnings.some(x=>x.includes('New core korda')));
 assert.ok(result.warnings.some(x=>x.includes('sequence frontier')));
 assert.ok(checkWorldPublishing([r],{...options,status:null}).warnings.length);
 // A valid supporting arc still uses an existing dossier definition.
 const a=record();a.data.worldSeq=2;a.data.worldDossiers=[];
 const withSeed={...options,dossiers:[{...options.dossiers[0],seedRecords:[a.data.worldId]}]};
 assert.ok(!checkWorldPublishing([a],withSeed).warnings.some(x=>x.includes('New core')));
});
