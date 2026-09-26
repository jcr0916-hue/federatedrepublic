#!/usr/bin/env node
import {loadWorldRegistries,clockWarnings} from '../lib/world-chronology.mjs';
import fs from "node:fs";
import { readWorldInventory, buildWorldDraft } from "../lib/world-authoring.mjs";

function argsOf(argv){
  const out={};
  for(let i=0;i<argv.length;i++){
    const token=argv[i];
    if(!token.startsWith("--")) continue;
    const key=token.slice(2);
    if(["write","mundane"].includes(key)){ out[key]=true; continue; }
    out[key]=argv[++i];
  }
  return out;
}
const split=v=>v?String(v).split(",").map(x=>x.trim()).filter(Boolean):[];
const a=argsOf(process.argv.slice(2));
if(!a.kind||!a.date||!a.title||!a.blurb){
  console.error("Usage: npm run world:new -- --kind news|nrs|sc|dispatch --date 13.12 --title \"...\" --blurb \"...\" [--nrs-id NRS-Y13-0706] [--outlet \"...\"] [--author \"...\"] [--slug name] [--arcs korda] [--jurisdictions Korda] [--provisions §15.5.a] [--dossiers korda] [--related torenthia-news-001.html] [--mundane] [--write]");
  process.exit(2);
}
const inventory=readWorldInventory(".");
const draft=buildWorldDraft({
  nrsId:a["nrs-id"],kind:a.kind,date:a.date,title:a.title,blurb:a.blurb,outlet:a.outlet,author:a.author,slug:a.slug,
  arcs:split(a.arcs),jurisdictions:split(a.jurisdictions),provisions:split(a.provisions),
  dossiers:split(a.dossiers),related:split(a.related),mundane:Boolean(a.mundane)
},inventory);

for(const warning of clockWarnings(a.date,loadWorldRegistries().clocks))console.warn(`[world clock warning] ${warning}`);
console.log(`Next ${a.kind==='nrs'?'nrsSeq':'worldSeq'}: ${draft.seq}`);
console.log(`Filename: ${draft.filename}`);
console.log("Suggested metadata (advisory):");
console.log(JSON.stringify(draft.suggestions,null,2));

if(!a.write){
  console.log("\nPreview only. Re-run with --write to create the file.");
  process.exit(0);
}
if(fs.existsSync(draft.filename)){
  console.error(`Refusing to overwrite existing file: ${draft.filename}`);
  process.exit(1);
}
fs.writeFileSync(draft.filename,draft.content,{flag:'wx'});
console.log(`Created ${draft.filename}. Review suggested comments and replace the draft body before committing.`);
