#!/usr/bin/env node
import fs from "node:fs";
import { readWorldInventory } from "../lib/world-authoring.mjs";
import { loadArcRegistry, validateCharacterRegistry } from "../lib/world-registry.mjs";

const FAIL=[], WARN=[];
const fail=m=>FAIL.push(m), warn=m=>WARN.push(m);
const files=readWorldInventory(".");
const arcs=loadArcRegistry();
const characters=validateCharacterRegistry();

for(const item of files){
  const raw=fs.readFileSync(item.name,"utf8");
  if(raw.includes("<!-- Draft body: replace this comment with the finished World record. -->")){
    fail(item.name+": generated draft marker remains; replace the draft body before publishing");
  }
  for(const arc of item.data.worldArcs||[]){
    if(!Object.hasOwn(arcs,arc)) fail(item.name+": unknown worldArcs value \""+arc+"\"");
  }
}

const esc=s=>s.replace(/[.*+?^$()|[\]\\]/g,"\\$&");
for(const person of characters.filter(p=>p.track==="crossroads")){
  const re=new RegExp(esc(person.name),"i");
  for(const item of files){
    const raw=fs.readFileSync(item.name,"utf8");
    if(re.test(raw)) fail(item.name+": Crossroads-only character \""+person.name+"\" appears in World canon");
  }
}

const latest=[...files].sort((a,b)=>Number(a.data.worldSeq)-Number(b.data.worldSeq)).at(-1);
if(latest && fs.existsSync("docs/WORLD-STORY-STATUS.md")){
  const status=fs.readFileSync("docs/WORLD-STORY-STATUS.md","utf8");
  const seq=status.match(/worldSeq through \*\*(\d+)\*\*/i);
  const date=status.match(/Current published frontier:\*\* Year (\d+), Month (\d+)/i);
  const parts=String(latest.data.worldDate).split(".").map(Number);
  if(!seq || Number(seq[1])!==Number(latest.data.worldSeq)) warn("WORLD-STORY-STATUS frontier is stale: latest worldSeq is "+latest.data.worldSeq);
  if(!date || Number(date[1])!==parts[0] || Number(date[2])!==parts[1]) warn("WORLD-STORY-STATUS fictional date is stale: latest World date is "+latest.data.worldDate);
}

for(const m of WARN) console.warn("[world publish warn] "+m);
for(const m of FAIL) console.error("[world publish fail] "+m);
if(WARN.length) console.warn("[world publish] "+WARN.length+" warning(s)");
if(FAIL.length){ console.error("[world publish] "+FAIL.length+" blocking problem(s)"); process.exit(1); }
console.log("[world publish] hard publishing checks passed");
