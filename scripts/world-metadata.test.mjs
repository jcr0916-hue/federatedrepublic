import test from "node:test";
import assert from "node:assert/strict";
import { analyzeWorldMetadata } from "../lib/world-metadata.mjs";

const base={
  worldTitle:"Routine filing",
  worldBlurb:"A routine filing.",
  worldArcs:[],worldJurisdictions:[],worldProvisions:[]
};

test("flags strong arc, jurisdiction, and provision signals",()=>{
  const data={...base,worldTitle:"Korda Territory Convention cites §15.5.a"};
  const warnings=analyzeWorldMetadata(data,"Korda delegates debate the Territory Convention under §15.5.a. Korda remains unresolved.");
  assert.ok(warnings.some(w=>w.kind==="arc"&&w.value==="korda"));
  assert.ok(warnings.some(w=>w.kind==="jurisdiction"&&w.value==="Korda"));
  assert.ok(warnings.some(w=>w.kind==="provision"&&w.value==="§15.5.a"));
});

test("does not warn when metadata is present",()=>{
  const data={...base,worldTitle:"Korda Territory Convention cites §15.5.a",worldArcs:["korda"],worldJurisdictions:["Korda"],worldProvisions:["§15.5.a"]};
  assert.deepEqual(analyzeWorldMetadata(data,"Korda delegates met again."),[]);
});

test("supports deliberate suppression without changing global rules",()=>{
  const data={...base,worldTitle:"A Korda comparison",worldSignalIgnore:["arc:korda","jurisdiction:Korda"]};
  assert.deepEqual(analyzeWorldMetadata(data,"Korda appears twice only as comparison. Korda."),[]);
});

test('new independent NRS records receive metadata warnings without worldSeq',async t=>{
 const fs=await import('node:fs'),os=await import('node:os'),path=await import('node:path');
 const {spawnSync}=await import('node:child_process');
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'nrs-metadata-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
 fs.writeFileSync(path.join(dir,'torenthia-nrs-042.html'),'---\nworldKind: nrs\nnrsSeq: 42\nworldTitle: Korda Territory Convention\nworldBlurb: Korda delegates meet.\nworldArcs: []\nworldJurisdictions: []\nworldProvisions: []\n---\nKorda Territory Convention.');
 const result=spawnSync(process.execPath,[new URL('./check-world-metadata.mjs',import.meta.url).pathname],{cwd:dir,encoding:'utf8'});
 assert.equal(result.status,0);assert.match(result.stderr,/missing from worldArcs/);
});
