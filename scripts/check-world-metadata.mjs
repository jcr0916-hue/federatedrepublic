#!/usr/bin/env node
import fs from "node:fs";
import matter from "gray-matter";
import { analyzeWorldMetadata } from "../lib/world-metadata.mjs";

const baseline=132;
const auditAll=process.argv.includes("--all");
const files=fs.readdirSync(".").filter(f=>/^torenthia-(?:news|nrs|sc|dispatch).*\.html$/i.test(f));
let checked=0,warnings=0;

for(const file of files){
  const raw=fs.readFileSync(file,"utf8");
  const parsed=matter(raw);
  if(!parsed.data.worldKind) continue;
  const seq=Number(parsed.data.worldSeq);
  if(!auditAll && (parsed.data.worldKind==='nrs' ? parsed.data.nrsSeq<=41 : (!Number.isInteger(seq)||seq<=baseline))) continue;

  const body=parsed.content
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi," ")
    .replace(/<[^>]+>/g," ")
    .replace(/\s+/g," ");
  const hits=analyzeWorldMetadata(parsed.data,body);
  checked++;
  for(const hit of hits){
    warnings++;
    console.warn(`[world metadata] ${file}: ${hit.message}`);
  }
}

if(warnings){
  console.warn(`[world metadata] ${warnings} suggestion(s) across ${checked} new World record(s). Review front matter or add worldSignalIgnore for a deliberate exception.`);
}else{
  console.log(`[world metadata] checked ${checked} new World record(s); no likely metadata omissions found.`);
}
