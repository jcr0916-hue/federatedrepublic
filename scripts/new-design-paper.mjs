#!/usr/bin/env node
import fs from "node:fs";

function argsOf(argv){
  const out={};
  for(let i=0;i<argv.length;i++){
    const token=argv[i];
    if(!token.startsWith("--")) continue;
    const key=token.slice(2);
    if(key==="write"){ out.write=true; continue; }
    out[key]=argv[++i];
  }
  return out;
}
const split=v=>v?String(v).split(",").map(x=>x.trim()).filter(Boolean):[];
const slug=s=>String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const a=argsOf(process.argv.slice(2));
if(!a.title||!a.topic||!a.summary){
  console.error('Usage: npm run paper:new -- --title "..." --topic principles --summary "..." [--provisions §2.1,§2.5] [--related other-paper-id] [--write]');
  process.exit(2);
}
const id=a.id?slug(a.id):slug(a.title);
if(!id){ console.error("Could not derive paper id"); process.exit(2); }
const filename="paper-"+id+".html";
const list=v=>"["+v.map(x=>JSON.stringify(x)).join(", ")+"]";
const content=[
  "---",
  "designPaper: true",
  "paperId: "+JSON.stringify(id),
  "paperTitle: "+JSON.stringify(a.title),
  "paperSummary: "+JSON.stringify(a.summary),
  "paperTopic: "+JSON.stringify(a.topic),
  "paperStatus: draft",
  "paperDate: null",
  "paperProvisions: "+list(split(a.provisions)),
  "paperRelated: "+list(split(a.related)),
  "permalink: false",
  "---",
  '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>'+a.title+' — The Federated Republic</title><link rel="stylesheet" href="site.css"></head><body><a href="#main-content" class="skip-nav">Skip to main content</a>{% include "nav.njk" %}<main id="main-content"><div class="article-wrap"><div class="article-section">Design Paper</div><h1 class="article-headline">'+a.title+'</h1><p class="article-deck">'+a.summary+'</p><!-- Draft design paper: replace this comment with the finished paper. --></div></main>{% include "footer.njk" %}<script src="nav.js"></script></body></html>'
].join("\n");
console.log("Paper ID: "+id);
console.log("Filename: "+filename);
console.log("Status: draft (not publicly rendered; permalink is false)");
if(!a.write){ console.log("\nPreview only. Re-run with --write to create the draft."); process.exit(0); }
if(fs.existsSync(filename)){ console.error("Refusing to overwrite existing file: "+filename); process.exit(1); }
fs.writeFileSync(filename,content+"\n");
console.log("Created "+filename+". Replace the draft body; when ready, set paperStatus to published, set paperDate, and remove permalink: false.");
