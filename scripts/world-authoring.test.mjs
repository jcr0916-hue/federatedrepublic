import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";
import { readWorldInventory,nextWorldSeq,nextWorldFilename,metadataSuggestions,buildWorldDraft } from "../lib/world-authoring.mjs";

const items=[
  {name:"torenthia-news-086.html",data:{worldSeq:132}},
  {name:"torenthia-nrs-041.html",data:{worldSeq:130}},
  {name:"torenthia-sc-002.html",data:{worldSeq:122}}
];

test("assigns the next global sequence and per-kind filename",()=>{
  assert.equal(nextWorldSeq(items),133);
  assert.equal(nextWorldFilename("news",items), "torenthia-news-087.html");
  assert.equal(nextWorldFilename("nrs",items), "torenthia-nrs-042.html");
  assert.equal(nextWorldFilename("sc",items), "torenthia-sc-003.html");
  assert.equal(nextWorldFilename("dispatch",items,"Mara Iset"), "torenthia-dispatch-mara-iset.html");
});

test("suggests metadata without making it authoritative",()=>{
  const s=metadataSuggestions({title:"Korda Territory Convention and §15.5.a",blurb:"Korda delegates meet again."});
  assert.ok(s.arcs.includes("korda"));
  assert.ok(s.jurisdictions.includes("Korda"));
  assert.ok(s.provisions.includes("§15.5.a"));
});

test("rejects invalid dates and dossier/arc mismatches",()=>{
  assert.throws(()=>buildWorldDraft({kind:"news",date:"13.13",title:"x",blurb:"x",outlet:"The Torenthian",arcs:[],jurisdictions:[],provisions:[],dossiers:[],related:[]},items),/world date/);
  assert.throws(()=>buildWorldDraft({kind:"news",date:"13.12",title:"x",blurb:"x",outlet:"The Torenthian",arcs:[],jurisdictions:[],provisions:[],dossiers:["korda"],related:[]},items),/must also be included/);
});

test("draft keeps suggestions commented until explicitly accepted",()=>{
  const d=buildWorldDraft({kind:"news",date:"13.12",title:"Korda Territory Convention and §15.5.a",blurb:"Korda delegates meet again.",outlet:"The Torenthian",arcs:[],jurisdictions:[],provisions:[],dossiers:[],related:[]},items);
  assert.match(d.content,/worldArcs: \[\]/);
  assert.match(d.content,/# suggested worldArcs: \["korda"\]/);
  assert.match(d.content,/worldSeq: 133/);
  assert.equal(d.filename,"torenthia-news-087.html");
});


test("inventory scans numbered records and dispatches from disk",()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'world-inventory-'));
 try {
  for(const item of [...items,{name:'torenthia-dispatch-example.html',data:{worldSeq:10}}])
   fs.writeFileSync(path.join(dir,item.name),`---\nworldKind: news\nworldSeq: ${item.data.worldSeq}\n---\n`);
  fs.writeFileSync(path.join(dir,'torenthia.html'),'---\nworldKind: news\nworldSeq: 999\n---\n');
  const inventory=readWorldInventory(dir);
  assert.equal(inventory.length,4);
  assert.equal(nextWorldSeq(inventory),133);
  for(const [kind,expected] of [['news','087'],['nrs','042'],['sc','003']])
   assert.equal(nextWorldFilename(kind,inventory),`torenthia-${kind}-${expected}.html`);
 } finally {fs.rmSync(dir,{recursive:true,force:true});}
});

test('NRS drafts consume only nrsSeq and require a reviewed unique reference',()=>{
 const inventory=[...items,{name:'torenthia-nrs-042.html',data:{worldKind:'nrs',nrsSeq:42,nrsId:'NRS-Y13-0706'}}];
 const opts={kind:'nrs',date:'13.12',title:'Example',blurb:'Example'};
 assert.throws(()=>buildWorldDraft(opts,inventory),/nrs-id/);
 assert.throws(()=>buildWorldDraft({...opts,nrsId:'NRS-Y13-0706'},inventory),/Duplicate/);
 const draft=buildWorldDraft({...opts,nrsId:'NRS-Y13-0707'},inventory);
 assert.match(draft.content,/nrsSeq: 43/);assert.doesNotMatch(draft.content,/worldSeq:/);
 assert.equal(nextWorldSeq(inventory),133);
});
