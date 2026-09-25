import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {planIngest,applyIngest,classify} from '../lib/republic-ingest.mjs';
import {checkCommands,runIngest} from './republic-ingest.mjs';
import {spawnSync} from 'node:child_process';

function fixture(t) {
  const base=fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()),'republic-ingest-'));
  t.after(()=>fs.rmSync(base,{recursive:true,force:true}));
  const root=path.join(base,'repo'),inbox=path.join(base,'Federated-Republic-Inbox');
  for(const dir of [root,inbox,...['_data','docs','images','logos','State Constitutions'].map(d=>path.join(root,d))]) fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(path.join(root,'constitution_data.json'),'[]');
  fs.writeFileSync(path.join(root,'_data/currentFiles.json'),'[]');
  fs.writeFileSync(path.join(root,'docs/WORLD-STORY-STATUS.md'),'worldSeq through **1**');
  fs.writeFileSync(path.join(root,'State Constitutions/arvane-state-constitution.md'),'# Constitution');
  const put=(name,body)=>{fs.mkdirSync(path.dirname(path.join(inbox,name)),{recursive:true});fs.writeFileSync(path.join(inbox,name),body);};
  return {root,inbox,put,plan:()=>planIngest({root,inbox})};
}
function article(seq=1,extra='',body='<p>Finished reporting.</p>',id='torenthia-news-001') {
  return `---\nworldKind: news\nworldSeq: ${seq}\nworldDate: "13.12"\nworldTitle: "Report"\nworldOutlet: "The Torenthian"\nworldBlurb: "Local report."\nworldId: "${id}"\nworldArcs: []\nworldJurisdictions: []\nworldProvisions: []\nworldRelated: []\n${extra}---\n${body}\n`;
}
const pass=()=>[{command:'test check',ok:true}];
const tree=dir=>fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name)).flatMap(e=>e.isDirectory()?tree(path.join(dir,e.name)).map(([p,b])=>[e.name+'/'+p,b]):[[e.name,fs.readFileSync(path.join(dir,e.name)).toString('base64')]]);

test('preview is byte-for-byte immutable, detects metadata and plans LF normalization',t=>{
  const f=fixture(t);f.put('torenthia-news-001.html',article().replace(/\n/g,'\r\n'));
  const before=[tree(f.root),tree(f.inbox)];const p=f.plan();
  assert.deepEqual([tree(f.root),tree(f.inbox)],before);assert.equal(p.items[0].errors.length,0);
  assert.equal(p.items[0].metadata.worldSeq,1);assert.match(p.items[0].warnings.join(),/LF/);
  const r=applyIngest(p,{runChecks:pass});assert.equal(r.applied.length,1);
  assert.equal(fs.readFileSync(path.join(f.root,'torenthia-news-001.html'),'utf8'),article());
  assert.equal(fs.readFileSync(path.join(f.inbox,'torenthia-news-001.html'),'utf8'),article().replace(/\n/g,'\r\n'));
});
test('unknown files and ambiguous flat images are report-only',t=>{
  const f=fixture(t);f.put('notes.txt','notes');f.put('portrait.png','image');
  const r=applyIngest(f.plan(),{runChecks:()=>assert.fail('No checks without changes')});assert.deepEqual(r.applied,[]);
});
test('canonical routing recognizes docs, states, constitution and explicit asset folders',t=>{
  const f=fixture(t);
  for(const [name,dest] of [['WORLD-STORY-BIBLE.md','docs/WORLD-STORY-BIBLE.md'],['WORLD-STORY-STATUS.md','docs/WORLD-STORY-STATUS.md'],['constitution_data.json','constitution_data.json'],['arvane-state-constitution.md','State Constitutions/arvane-state-constitution.md'],['images/new-map.webp','images/new-map.webp'],['logos/new.svg','logos/new.svg']]) assert.equal(classify(name,f.root).destination,dest);
  assert.equal(classify('korda-state-constitution.md',f.root).kind,'unknown');
});
test('never overwrites, even identical content',t=>{
  const f=fixture(t);f.put('torenthia-news-001.html',article());fs.writeFileSync(path.join(f.root,'torenthia-news-001.html'),article());
  const p=f.plan();assert.match(p.items[0].errors.join(),/collision/);assert.deepEqual(applyIngest(p,{runChecks:pass}).applied,[]);
});
test('duplicate sequences across repo and inbox are blocked',t=>{
  const f=fixture(t);fs.writeFileSync(path.join(f.root,'torenthia-news-001.html'),article());
  f.put('torenthia-news-002.html',article(1,'',undefined,'torenthia-news-002'));
  assert.match(f.plan().items[0].errors.join(),/Duplicate worldSeq/);
  f.put('torenthia-news-003.html',article(1,'',undefined,'torenthia-news-003'));
  assert.ok(f.plan().items.every(i=>i.errors.some(e=>e.includes('Duplicate worldSeq'))));
});
test('blank sequences get distinct suggestions above repo and inbox, never written',t=>{
  const f=fixture(t);f.put('torenthia-news-001.html',article(''));
  f.put('torenthia-news-002.html',article(20,'',undefined,'torenthia-news-002'));
  f.put('torenthia-news-003.html',article('','',undefined,'torenthia-news-003'));
  const p=f.plan();assert.match(p.items[0].errors.join(),/sequence 21/);assert.match(p.items[2].errors.join(),/sequence 22/);
});
test('draft flags, placeholders and core dossier placement require review',t=>{
  const f=fixture(t);
  for(const [extra,body] of [['draft: true\n','finished'],['worldDraft: "true"\n','finished'],['','TODO: finish'],['','<!-- Draft body: replace this comment -->'],['worldDossiers: [korda]\n','finished'],['ingestReview: true\n','finished']]) {
    f.put('torenthia-news-001.html',article(1,extra,body));assert.ok(f.plan().items[0].errors.length);
  }
});
test('shared validator blocks types, IDs, dates, provisions and broken related records',t=>{
  const f=fixture(t);
  for(const raw of [article().replace('worldArcs: []','worldArcs: korda'),article().replace('"13.12"','"13.13"'),article().replace('worldRelated: []','worldRelated: [torenthia-news-999.html]'),article().replace('worldProvisions: []','worldProvisions: ["§99.1"]'),article(1,'',undefined,'wrong')]) {
    f.put('torenthia-news-001.html',raw);assert.ok(f.plan().items[0].errors.length);
  }
  f.put('torenthia-news-001.html',article(1,'worldMundane: yes\n'));assert.ok(f.plan().items[0].errors.length);
});
test('references require existing or eligible assets; rejected dependencies do not qualify',t=>{
  const f=fixture(t);f.put('torenthia-news-001.html',article(1,'','<img src="new.png">'));
  assert.match(f.plan().items[0].errors.join(),/Unresolved/);
  f.put('images/new.png',Buffer.from([137,80,78,71]));assert.ok(f.plan().items.every(i=>!i.errors.length));
  f.put('torenthia-news-002.html',article(2,'','<a href="torenthia-news-003.html">Next</a>','torenthia-news-002'));
  f.put('torenthia-news-003.html',article(3,'draft: true\n',undefined,'torenthia-news-003'));
  assert.ok(f.plan().items.find(i=>i.source==='torenthia-news-002.html').errors.length);
});
test('apply checks before archive, leaves failed and unknown sources in inbox',t=>{
  const f=fixture(t);f.put('torenthia-news-001.html',article());f.put('notes.txt','notes');
  const r=applyIngest(f.plan(),{archive:true,runChecks:()=>{assert.ok(fs.existsSync(path.join(f.inbox,'torenthia-news-001.html')));return pass();}});
  assert.equal(r.archived.length,1);assert.ok(!fs.existsSync(path.join(f.inbox,'torenthia-news-001.html')));assert.ok(fs.existsSync(path.join(f.inbox,'notes.txt')));
});
test('assets depending on a World record rejected by shared validation are held',t=>{
  const f=fixture(t);f.put('torenthia-news-001.html',article().replace('"13.12"','"13.13"'));
  f.put('images/navigation.svg','<svg><a href="/torenthia-news-001.html">Story</a></svg>');
  const p=f.plan();assert.ok(p.items.every(i=>i.errors.length));
  assert.deepEqual(applyIngest(p,{runChecks:pass}).applied,[]);
});
test('failed post-import checks preserve source and imported file for inspection',t=>{
  const f=fixture(t);f.put('torenthia-news-001.html',article());
  const r=applyIngest(f.plan(),{archive:true,runChecks:()=>[{command:'build',ok:false}]});
  assert.equal(r.archived.length,0);assert.ok(r.errors.length);assert.ok(fs.existsSync(path.join(f.inbox,'torenthia-news-001.html')));assert.ok(fs.existsSync(path.join(f.root,'torenthia-news-001.html')));
});
test('rechecks changed sources and destinations before writes',t=>{
  const f=fixture(t);f.put('torenthia-news-001.html',article());const p=f.plan();f.put('torenthia-news-001.html',article(2));
  assert.throws(()=>applyIngest(p,{runChecks:pass}),/Inbox changed/);
  const p2=f.plan();fs.writeFileSync(path.join(f.root,'torenthia-news-001.html'),'do not replace');assert.throws(()=>applyIngest(p2,{runChecks:pass}),/Destination appeared/);
});
test('symlink sources and destinations are refused',t=>{
  const f=fixture(t);fs.symlinkSync(path.join(f.root,'constitution_data.json'),path.join(f.inbox,'torenthia-news-001.html'));
  assert.ok(f.plan().items[0].errors.length);
  fs.rmSync(path.join(f.root,'images'),{recursive:true});fs.symlinkSync(f.inbox,path.join(f.root,'images'));f.put('images/new.png','image');
  assert.match(f.plan().items.find(i=>i.source==='images/new.png').errors.join(),/Symlink/);
});
test('empty and missing inbox gracefully produce no actions',t=>{
  const f=fixture(t);assert.deepEqual(f.plan().items,[]);fs.rmdirSync(f.inbox);assert.match(f.plan().warnings.join(),/missing/);
});
test('executable front matter is rejected without execution',t=>{
  const f=fixture(t);f.put('torenthia-news-001.html','---javascript\n(()=>{throw new Error("EXECUTED")})()\n---\n');
  const p=f.plan();assert.match(p.items[0].errors.join(),/plain YAML/);assert.doesNotMatch(p.items[0].errors.join(),/EXECUTED/);
});
test('post-import command selection uses native sync before build and narrow validators',t=>{
  const f=fixture(t);fs.writeFileSync(path.join(f.root,'package.json'),JSON.stringify({scripts:{'check:world-meta':'x','check:world-publish':'x','check:discovery':'x'}}));
  const c=checkCommands(f.root,['constitution_data.json','torenthia-news-001.html']).map(x=>x.flat().join(' '));
  assert.equal(c[0],'npm run sync');assert.ok(c.indexOf('npm run build')>c.indexOf('npm run check:world-meta'));assert.ok(c.includes('npm run check:discovery'));
});

test('asset references use flattened public URLs rather than source paths',t=>{
  const f=fixture(t);
  fs.writeFileSync(path.join(f.root,'images/existing.png'),'image');
  f.put('torenthia-news-001.html',article(1,'worldImage: existing.png\n','<img src="existing.png">'));
  assert.equal(f.plan().items[0].errors.length,0);
  f.put('torenthia-news-001.html',article(1,'worldImage: images/existing.png\n'));
  assert.match(f.plan().items[0].errors.join(),/Unresolved public reference/);
});

test('command workflow previews without writes, applies, checks, then archives only successful files',t=>{
  const f=fixture(t),lines=[];
  const scripts=Object.fromEntries(['check:world-meta','check:world-publish','build','check:discovery'].map(name=>[name,`node -e "require('fs').appendFileSync('validation.log','${name}\\n')"`]));
  fs.writeFileSync(path.join(f.root,'package.json'),JSON.stringify({scripts}));
  f.put('torenthia-news-001.html',article());
  const options={root:f.root,inbox:f.inbox,log:s=>lines.push(s),runCommand:(cmd,args,root)=>spawnSync(cmd,args,{cwd:root,encoding:'utf8'})};
  const before=[tree(f.root),tree(f.inbox)];
  assert.equal(runIngest([],options),0);
  assert.deepEqual([tree(f.root),tree(f.inbox)],before);
  assert.throws(()=>runIngest(['--archive'],options),/Usage/);
  assert.throws(()=>runIngest(['--force'],options),/Usage/);
  f.put('unknown.txt','Keep this');
  assert.equal(runIngest(['--apply','--archive'],options),1); // unknown still requires review
  assert.equal(fs.readFileSync(path.join(f.root,'validation.log'),'utf8'),'check:world-meta\ncheck:world-publish\nbuild\ncheck:discovery\n');
  assert.ok(fs.existsSync(path.join(f.root,'torenthia-news-001.html')));
  assert.ok(!fs.existsSync(path.join(f.inbox,'torenthia-news-001.html')));
  assert.ok(fs.existsSync(path.join(f.inbox,'unknown.txt')));
  assert.ok(lines.some(s=>s.includes('PASS npm run build')));
  const archived=tree(path.join(path.dirname(f.inbox),'Federated-Republic-Archive'));
  assert.equal(archived.length,1);assert.equal(Buffer.from(archived[0][1],'base64').toString(),article());
});
test('command workflow reports a real build failure and preserves all sources',t=>{
  const f=fixture(t),lines=[];
  fs.writeFileSync(path.join(f.root,'package.json'),JSON.stringify({scripts:{build:'node -e "process.exit(1)"'}}));
  f.put('torenthia-news-001.html',article());
  assert.equal(runIngest(['--apply','--archive'],{root:f.root,inbox:f.inbox,log:s=>lines.push(s),runCommand:(cmd,args,root)=>spawnSync(cmd,args,{cwd:root,encoding:'utf8'})}),1);
  assert.ok(fs.existsSync(path.join(f.inbox,'torenthia-news-001.html')));
  assert.ok(!fs.existsSync(path.join(path.dirname(f.inbox),'Federated-Republic-Archive')));
  assert.ok(lines.some(s=>s.includes('FAIL npm run build')));
});
test('assets cannot shadow an existing root public URL',t=>{
  const f=fixture(t);fs.writeFileSync(path.join(f.root,'favicon.ico'),'existing icon');f.put('images/favicon.ico','new icon');
  assert.match(f.plan().items[0].errors.join(),/Public asset URL collision/);
});
test('unexpected check errors never archive imported sources',t=>{
  const f=fixture(t);f.put('torenthia-news-001.html',article());
  const r=applyIngest(f.plan(),{archive:true,runChecks:()=>{throw Error('Runner unavailable');}});
  assert.match(r.errors.join(),/Runner unavailable/);assert.ok(fs.existsSync(path.join(f.inbox,'torenthia-news-001.html')));assert.equal(r.archived.length,0);
});
test('BOM, unsafe sequence integers and directory references require review',t=>{
  const f=fixture(t);
  for(const raw of ['\uFEFF'+article(),article(Number.MAX_SAFE_INTEGER+1),article(1,'','<a href="images/">Link</a>')]) {
    f.put('torenthia-news-001.html',raw);assert.ok(f.plan().items[0].errors.length);
  }
});
