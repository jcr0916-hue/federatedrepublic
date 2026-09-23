import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {parseDocument, DomUtils} from 'htmlparser2';
import {parse} from 'acorn';
import {loadScenarios} from '../lib/scenarios.mjs';
const root='_site',files=fs.readdirSync(root).filter(f=>f.endsWith('.html'));
const docs=new Map(files.map(f=>[f,parseDocument(fs.readFileSync(path.join(root,f),'utf8'))]));
const errors=[];
for(const [file,doc] of docs){
 const elements=DomUtils.findAll(n=>n.type==='tag'||n.type==='script',doc.children);
 for(const el of elements){
  if(el.name==='script'&&!el.attribs.src&&(!el.attribs.type||el.attribs.type==='text/javascript')){
   try{parse(DomUtils.textContent(el),{ecmaVersion:'latest',sourceType:'script'});}catch(e){errors.push(`${file}: script ${e.message}`);}
  }
  if(el.name!=='a'||!el.attribs.href)continue;
  const url=new URL(el.attribs.href,'https://local.test/'+file);if(url.origin!=='https://local.test')continue;
  const target=decodeURIComponent(url.pathname.slice(1))||'index.html';
  if(!fs.existsSync(path.join(root,target))){errors.push(`${file}: missing ${el.attribs.href}`);continue;}
  if(url.hash&&docs.has(target)){
   const id=decodeURIComponent(url.hash.slice(1));
   if(!DomUtils.findOne(n=>n.attribs?.id===id,docs.get(target).children,true))errors.push(`${file}: missing anchor ${el.attribs.href}`);
  }
 }
}
const archive=docs.get('torenthia-record.html');
const records=DomUtils.findAll(n=>n.attribs?.class==='archive-item',archive.children);
const published=fs.readdirSync('.').filter(f=>f.endsWith('.html')&&/^---[\s\S]*?worldKind:/m.test(fs.readFileSync(f,'utf8')));
assert.equal(records.length,published.length,'Every published world item must appear in the archive');
for(const file of ['index.html','annotated.html','torenthia.html','torenthia-record.html','dossier-korda.html','republic-at-a-glance.html']){
 const doc=docs.get(file);assert.ok(DomUtils.findOne(n=>n.attribs?.id==='site-nav',doc.children,true),file);
}
// Keep the complete scenario library connected as stories are added or renamed.
const bridges=JSON.parse(fs.readFileSync('_data/scenarioBridges.json','utf8'));
const generated=loadScenarios();
const scenarioFiles=generated.entries.map(entry=>entry.href);
const provisions=new Set(JSON.parse(fs.readFileSync('constitution_data.json','utf8')).flatMap(a=>a.provisions.map(p=>p.num)));
for(const slug of Object.keys(bridges))assert.ok(scenarioFiles.includes(slug+'.html'), `Stale scenario guidance: ${slug}`);
for(const file of scenarioFiles){
 const bridge=bridges[file.replace(/\.html$/,'')] || generated.bridges[file.replace(/\.html$/,'')];
 assert.ok(bridge.summary?.trim()&&Array.isArray(bridge.provisions)&&Array.isArray(bridge.links),`${file}: incomplete guidance`);
 for(const ref of bridge.provisions)assert.ok(provisions.has(ref.ref),`${file}: unknown provision ${ref.ref}`);
 for(const link of bridge.links)assert.notEqual(link.url,file,`${file}: next read must not link to itself`);
 const headings=DomUtils.findAll(n=>n.attribs?.id==='scenario-learning-title',docs.get(file).children);
 assert.equal(headings.length,1,`${file}: render one reading bridge`);
}
if(errors.length){console.error(errors.join('\n'));process.exit(1);}
console.log(`Verified ${files.length} built pages: local links, anchors, inline script syntax, and all ${records.length} public records.`);

// Verify rendered dossier membership and dates against the same published metadata.
const {default:matter}=await import('gray-matter');
const {dossierRecords,worldNewest}=await import('../lib/world.mjs');
const world=published.map(file=>({data:matter(fs.readFileSync(file,'utf8')).data}));
const dossiers=JSON.parse(fs.readFileSync('_data/currentFiles.json','utf8'));
for(const file of dossiers){
 const doc=docs.get(`dossier-${file.id}.html`);
 const timeline=DomUtils.findOne(n=>n.attribs?.class==='record-timeline',doc.children,true);
 assert.ok(timeline,`${file.id}: timeline exists`);
 const actual=DomUtils.findAll(n=>n.name==='a',timeline.children).map(n=>n.attribs.href.replace(/^\//,'').replace(/\.html$/,''));
 const expected=dossierRecords(world,file);
 assert.deepEqual(actual,expected.map(p=>p.data.worldId),`${file.id}: rendered core chronology`);
 const [y,m]=worldNewest(expected).split('.').map(Number);
 assert.ok(DomUtils.textContent(doc).includes(`As of Year ${y}, Month ${m}`),`${file.id}: derived date`);
}
const korda=dossierRecords(world,dossiers.find(f=>f.id==='korda')).map(p=>p.data.worldId);
assert.ok(korda.includes('torenthia-nrs-041'));
assert.ok(!korda.includes('torenthia-news-085'));
console.log('Verified every dossier timeline/date; Korda roster is core and campaign coverage remains supporting.');
