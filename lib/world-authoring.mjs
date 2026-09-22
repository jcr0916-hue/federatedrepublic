import fs from "node:fs";
import matter from "gray-matter";
import { analyzeWorldMetadata } from "./world-metadata.mjs";

const WORLD_FILE_RE=/^torenthia-(news|nrs|sc|dispatch[^.]*)\.html$/i;

export function readWorldInventory(dir="."){
  return fs.readdirSync(dir)
    .filter(name=>WORLD_FILE_RE.test(name))
    .map(name=>{
      const raw=fs.readFileSync(dir+"/"+name,"utf8");
      const parsed=matter(raw);
      return {name,data:parsed.data};
    })
    .filter(x=>x.data.worldKind);
}

export function nextWorldSeq(items){
  const seqs=items.map(x=>Number(x.data.worldSeq)).filter(Number.isInteger);
  return (seqs.length?Math.max(...seqs):0)+1;
}

export function nextWorldFilename(kind,items,slug){
  if(kind==="dispatch"){
    if(!slug) throw Error("--slug is required for dispatch records");
    const clean=slug.toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
    if(!clean) throw Error("--slug must contain letters or numbers");
    return `torenthia-dispatch-${clean}.html`;
  }
  if(!["news","nrs","sc"].includes(kind)) throw Error(`Unsupported kind: ${kind}`);
  const re=new RegExp(`^torenthia-${kind}-(\\d+)\\.html$`,"i");
  const nums=items.map(x=>x.name.match(re)).filter(Boolean).map(m=>Number(m[1]));
  const next=(nums.length?Math.max(...nums):0)+1;
  return `torenthia-${kind}-${String(next).padStart(3,"0")}.html`;
}

export function metadataSuggestions({title="",blurb=""}){
  const hits=analyzeWorldMetadata({
    worldTitle:title,worldBlurb:blurb,
    worldArcs:[],worldJurisdictions:[],worldProvisions:[]
  }, "");
  return {
    arcs:[...new Set(hits.filter(x=>x.kind==="arc").map(x=>x.value))],
    jurisdictions:[...new Set(hits.filter(x=>x.kind==="jurisdiction").map(x=>x.value))],
    provisions:[...new Set(hits.filter(x=>x.kind==="provision").map(x=>x.value))]
  };
}

const yamlList=items=>`[${items.map(x=>JSON.stringify(x)).join(", ")}]`;

export function buildWorldDraft(opts,items){
  if(!/^\d{2,}\.(0[1-9]|1[0-2])$/.test(String(opts.date||""))) throw Error("world date must use YY.MM with month 01–12, for example 13.12");
  const arcs=opts.arcs||[];
  const dossiers=opts.dossiers||[];
  for(const dossier of dossiers) if(!arcs.includes(dossier)) throw Error(`dossier "${dossier}" must also be included in --arcs`);
  const seq=nextWorldSeq(items);
  const filename=nextWorldFilename(opts.kind,items,opts.slug);
  const worldId=filename.replace(/\.html$/,"");
  const suggestions=metadataSuggestions(opts);
  const jurisdictions=opts.jurisdictions||[];
  const provisions=opts.provisions||[];
  const related=opts.related||[];
  const outlet=opts.outlet || (opts.kind==="nrs"?"National Record System":opts.kind==="sc"?"Supreme Court":opts.kind==="dispatch"?"Dispatch":"");
  if(!outlet) throw Error("--outlet is required for news records");

  const lines=[
    "---",
    `worldKind: ${opts.kind}`,
    `worldSeq: ${seq}`,
    `worldDate: ${JSON.stringify(opts.date)}`,
    `worldTitle: ${JSON.stringify(opts.title)}`,
    `worldOutlet: ${JSON.stringify(outlet)}`
  ];
  if(opts.author) lines.push(`worldAuthor: ${JSON.stringify(opts.author)}`);
  lines.push(
    `worldBlurb: ${JSON.stringify(opts.blurb)}`,
    `worldId: ${JSON.stringify(worldId)}`,
    `worldArcs: ${yamlList(arcs)}`
  );
  if(suggestions.arcs.length && !arcs.length) lines.push(`# suggested worldArcs: ${yamlList(suggestions.arcs)}`);
  lines.push(`worldJurisdictions: ${yamlList(jurisdictions)}`);
  if(suggestions.jurisdictions.length && !jurisdictions.length) lines.push(`# suggested worldJurisdictions: ${yamlList(suggestions.jurisdictions)}`);
  lines.push(`worldProvisions: ${yamlList(provisions)}`);
  if(suggestions.provisions.length && !provisions.length) lines.push(`# suggested worldProvisions: ${yamlList(suggestions.provisions)}`);
  if(dossiers.length) lines.push(`worldDossiers: ${yamlList(dossiers)}`);
  if(opts.mundane) lines.push("worldMundane: true");
  lines.push(`worldRelated: ${yamlList(related)}`,"---");

  const titleEsc=String(opts.title).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  const blurbEsc=String(opts.blurb).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  const body=`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <link rel="icon" href="favicon.ico" sizes="any">
  <link rel="icon" type="image/png" href="favicon-32.png" sizes="32x32">
  <link rel="apple-touch-icon" href="apple-touch-icon.png">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${titleEsc}</title>
  <meta name="description" content="${blurbEsc}">
  <link rel="stylesheet" href="site.css">
</head>
<body>
  <a href="#main-content" class="skip-nav">Skip to main content</a>
  {% include "nav.njk" %}
  <main id="main-content">
    <div class="article-wrap">
      <h1 class="article-headline">${titleEsc}</h1>
      <p class="article-deck">${blurbEsc}</p>
      <!-- Draft body: replace this comment with the finished World record. -->
      <div class="article-nav"><a href="torenthia.html">&larr; The World</a><a href="torenthia-record.html">The Record &rarr;</a></div>
    </div>
  </main>
  {% include "related-world.njk" %}
  {% include "footer.njk" %}
  <script src="nav.js"></script>
</body>
</html>
`;
  return {seq,filename,worldId,suggestions,content:lines.join("\n")+"\n"+body};
}
