import test from "node:test";
import assert from "node:assert/strict";
import { nextWorldSeq,nextWorldFilename,metadataSuggestions,buildWorldDraft } from "../lib/world-authoring.mjs";

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

test("draft keeps suggestions commented until explicitly accepted",()=>{
  const d=buildWorldDraft({kind:"news",date:"13.12",title:"Korda Territory Convention and §15.5.a",blurb:"Korda delegates meet again.",outlet:"The Torenthian",arcs:[],jurisdictions:[],provisions:[],dossiers:[],related:[]},items);
  assert.match(d.content,/worldArcs: \[\]/);
  assert.match(d.content,/# suggested worldArcs: \["korda"\]/);
  assert.match(d.content,/worldSeq: 133/);
  assert.equal(d.filename,"torenthia-news-087.html");
});
