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
  const f=fixture(t);fs.writeFileSync(path.join(f.root,'package.json'),JSON.stringify({scripts:{'check:world-meta':'x','check:world-publish':'x','check:discovery':'x','check:scenarios':'x'}}));
  const c=checkCommands(f.root,['constitution_data.json']).map(x=>x.flat().join(' '));
  assert.deepEqual(c,['npm run sync','python3 scripts/check-consistency.py','python3 scripts/check-constitutional-site.py','npm run check:world-meta','npm run check:world-publish','npm run build','npm run check:discovery','npm run check:scenarios']);
  const state=checkCommands(f.root,['state-tests/varek/varek-test-01-flood.html']).map(x=>x.flat().join(' '));
  assert.deepEqual(state,['npm run check:state-tests','npm run check:world-meta','npm run check:world-publish','npm run build','npm run check:discovery']);
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

test('NRS ingest needs no narrative sequence; duplicate NRS references are blocked',t=>{
 const f=fixture(t);
 const nrs=(number,reference)=>article(1,`nrsSeq: ${number}\nnrsId: ${reference}\n`,undefined,`torenthia-nrs-00${number}`).replace('worldKind: news','worldKind: nrs').replace('worldSeq: 1\n','');
 f.put('torenthia-nrs-001.html',nrs(1,'NRS-Y13-0706'));
 const before=[tree(f.root),tree(f.inbox)],p=f.plan();
 assert.equal(p.errors.length,0);assert.equal(p.items[0].errors.length,0);
 assert.deepEqual([tree(f.root),tree(f.inbox)],before);
 f.put('torenthia-nrs-002.html',nrs(2,'NRS-Y13-0706'));
 assert.match(f.plan().errors.join(),/nrsId/);
});

// New content families exercise the same preview/apply/archive boundary.
function stateFixture(t) {
  const f=fixture(t);
  fs.copyFileSync('State Constitutions/varek-state-constitution.md',path.join(f.root,'State Constitutions/varek-state-constitution.md'));
  const source=fs.readFileSync('state-tests/varek/varek-test-01-the-72-hour-flood.html','utf8');
  const header=source.slice(0,source.indexOf('\n---\n',4)+5);
  return {...f,article:()=>header+'<p>Finished historical account.</p>\n',name:'varek-test-01-the-72-hour-flood.html'};
}
test('State test routes from flat or canonical nested path; preview creates no directories',t=>{
  const f=stateFixture(t),dest='state-tests/varek/'+f.name;
  for(const source of [f.name,dest]) assert.deepEqual(classify(source,f.root),{kind:'state-test',destination:dest});
  f.put(dest,f.article());const before=[tree(f.root),tree(f.inbox)],p=f.plan();
  assert.deepEqual([tree(f.root),tree(f.inbox)],before);
  assert.equal(p.items[0].errors.length,0);assert.equal(p.errors.length,0);
  assert.equal(fs.existsSync(path.join(f.root,'state-tests')),false);
});
test('new State-test imports validate before archiving; existing files never overwrite',t=>{
  const f=stateFixture(t);f.put(f.name,f.article());
  const result=applyIngest(f.plan(),{archive:true,runChecks:files=>{
    assert.deepEqual(files,['state-tests/varek/'+f.name]);
    assert.equal(fs.readFileSync(path.join(f.root,files[0]),'utf8'),f.article());
    assert.ok(fs.existsSync(path.join(f.inbox,f.name)));return pass();
  }});
  assert.equal(result.archived.length,1);
  f.put(f.name,f.article().replace('Finished','Changed'));
  const before=tree(f.root),p=f.plan();assert.match(p.items[0].errors.join(),/collision/);
  assert.deepEqual(applyIngest(p,{runChecks:pass}).applied,[]);assert.deepEqual(tree(f.root),before);
});
test('State-test bad metadata and broken relative references are held during preview',t=>{
  const f=stateFixture(t);
  for(const text of [f.article().replace('state: varek','state: unknown'),f.article().replace('"3.5"','"99.1"'),f.article().replace('testNumber: 1','testNumber: 2'),f.article().replace('"The 72-Hour Flood"','" "'),f.article().replace('"6.09"','"6.13"'),f.article().replace('stateTest: true','stateTest: false'),f.article().replace('Finished','TODO'),f.article()+'<img src="missing.png">',f.article().replace('stateTest: true','draft: true\nstateTest: true')]) {
    f.put(f.name,text);const p=f.plan();assert.ok(p.errors.length||p.items[0].errors.length,text);
    assert.deepEqual(applyIngest(p,{runChecks:pass}).applied,[]);
  }
});
test('State tests refuse duplicate IDs/numbers in inbox or repository, including a different slug',t=>{
  const f=stateFixture(t);f.put(f.name,f.article());f.put('varek-test-01-another.html',f.article());
  let p=f.plan();assert.match(p.errors.join(),/Duplicate testId/);assert.match(p.errors.join(),/Duplicate testNumber/);
  fs.rmSync(path.join(f.inbox,'varek-test-01-another.html'));
  fs.mkdirSync(path.join(f.root,'state-tests/varek'),{recursive:true});
  fs.writeFileSync(path.join(f.root,'state-tests/varek/varek-test-01-another.html'),f.article());
  p=f.plan();assert.match(p.errors.join(),/Duplicate testId/);assert.deepEqual(applyIngest(p,{runChecks:pass}).applied,[]);
});
test('State tests recheck changed provision sources and newly introduced duplicates before apply',t=>{
  const f=stateFixture(t);f.put(f.name,f.article());const p=f.plan();
  fs.writeFileSync(path.join(f.root,'State Constitutions/varek-state-constitution.md'),'# No matching provisions');
  assert.throws(()=>applyIngest(p,{runChecks:pass}),/State tests changed since preview/);
});
test('nested State-test destinations refuse symlink traversal and failed checks preserve inbox sources',t=>{
  const f=stateFixture(t);f.put(f.name,f.article());
  fs.mkdirSync(path.join(f.root,'state-tests'));fs.symlinkSync(f.inbox,path.join(f.root,'state-tests/varek'));
  assert.match(f.plan().items[0].errors.join(),/Symlink/);
  fs.unlinkSync(path.join(f.root,'state-tests/varek'));
  const r=applyIngest(f.plan(),{archive:true,runChecks:()=>[{command:'State discovery',ok:false}]});
  assert.equal(r.archived.length,0);assert.ok(fs.existsSync(path.join(f.inbox,f.name)));assert.match(r.errors.join(),/NOT ready/);
});

function constitutionFixture(t) {
  const f=fixture(t);
  const files=['constitution_data.json','docs/constitution-current.md','docs/constitutional-quickref.md','annotated.html','search-index.js','scripts/build-constitution-md.py','scripts/build-quickref.py','scripts/build-search-index.py','scripts/sync-annotated.py','scripts/check-consistency.py','scripts/check-constitutional-site.py'];
  for(const file of files) {const dest=path.join(f.root,file);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(file,dest);}
  const native=JSON.parse(fs.readFileSync('package.json','utf8')).scripts;
  fs.writeFileSync(path.join(f.root,'package.json'),JSON.stringify({scripts:{sync:native.sync,build:'node -e "process.exit(0)"'}}));
  const incoming=JSON.parse(fs.readFileSync(path.join(f.root,'constitution_data.json'),'utf8'));
  incoming[1].provisions[0].text+=' Fixture-only amendment for an isolated test.';
  f.put('constitution_data.json',JSON.stringify(incoming,null,2)+'\n');
  return {...f,plan:()=>planIngest({root:f.root,inbox:f.inbox,updateConstitution:true,now:new Date('2026-09-26T12:00:00Z')})};
}
test('Federal update is explicit, immutable in preview, compares JSON, and proposes an external dated snapshot',t=>{
  const f=constitutionFixture(t),before=[tree(f.root),tree(f.inbox)];
  assert.ok(planIngest({root:f.root,inbox:f.inbox}).items[0].errors.length);
  const p=f.plan();assert.equal(p.items[0].errors.length,0);assert.equal(p.items[0].action,'update-constitution');
  assert.match(p.items[0].update.snapshot,/Federated-Republic-Archive\/constitution\/Constitution-260926\.md$/);
  assert.deepEqual([tree(f.root),tree(f.inbox)],before);
  assert.ok(!fs.existsSync(path.dirname(p.items[0].update.snapshot)));
  f.put('constitution_data.json',JSON.stringify(JSON.parse(fs.readFileSync(path.join(f.root,'constitution_data.json'),'utf8'))));
  const same=f.plan();assert.equal(same.items[0].action,'unchanged');
  assert.deepEqual(applyIngest(same,{archive:true,runChecks:()=>assert.fail('No checks for unchanged source')}).applied,[]);
  assert.ok(fs.existsSync(path.join(f.inbox,'constitution_data.json')));
});
test('Federal update preserves exact prior Markdown before replacement, then runs real sync and constitutional checks',t=>{
  const f=constitutionFixture(t),old=fs.readFileSync(path.join(f.root,'docs/constitution-current.md'));
  const lines=[],commands=[];
  const result=runIngest(['--update-constitution','--apply','--archive'],{root:f.root,inbox:f.inbox,log:s=>lines.push(s),runCommand:(cmd,args,root)=>{
    const snapshotDir=path.join(path.dirname(f.inbox),'Federated-Republic-Archive/constitution');
    assert.ok(fs.readdirSync(snapshotDir).some(name=>fs.readFileSync(path.join(snapshotDir,name)).equals(old)));
    commands.push([cmd,...args].join(' '));return spawnSync(cmd,args,{cwd:root,encoding:'utf8'});
  }});
  assert.equal(result,0,lines.join('\n'));
  assert.deepEqual(commands,['npm run sync','python3 scripts/check-consistency.py','python3 scripts/check-constitutional-site.py','npm run build']);
  assert.match(fs.readFileSync(path.join(f.root,'docs/constitution-current.md'),'utf8'),/Fixture-only amendment/);
  assert.ok(!fs.existsSync(path.join(f.inbox,'constitution_data.json')));
  assert.ok(!fs.existsSync(path.join(f.root,'docs/archive')));
  assert.ok(lines.some(line=>line.includes('Preserved previous Constitution Markdown')));
});
test('same-day Federal snapshots are exclusive and get collision-safe names',t=>{
  const f=constitutionFixture(t),first=f.plan().items[0].update.snapshot;
  fs.mkdirSync(path.dirname(first),{recursive:true});fs.writeFileSync(first,'Previously saved history');
  const p=f.plan();assert.notEqual(p.items[0].update.snapshot,first);assert.match(p.items[0].update.snapshot,/Constitution-260926-01\.md$/);
  const r=applyIngest(p,{runChecks:pass});assert.equal(r.preserved.length,1);
  assert.equal(fs.readFileSync(first,'utf8'),'Previously saved history');
});
test('explicit Federal updates still hold draft/review flags and placeholder content',t=>{
  const f=constitutionFixture(t),incoming=fs.readFileSync(path.join(f.inbox,'constitution_data.json'),'utf8');
  for(const key of ['draft','review','needsReview','ingestReview']) {
    const data=JSON.parse(incoming);data[1].provisions[0][key]=true;
    f.put('constitution_data.json',JSON.stringify(data));assert.match(f.plan().items[0].errors.join(),/human review/);
  }
  f.put('constitution_data.json',incoming.replace('Fixture-only amendment','placeholder'));
  assert.match(f.plan().items[0].errors.join(),/placeholder/);
});
test('Federal update refuses stale Markdown, malformed JSON structures, mixed batches and snapshot symlinks',t=>{
  const f=constitutionFixture(t);const old=fs.readFileSync(path.join(f.root,'docs/constitution-current.md'));
  fs.writeFileSync(path.join(f.root,'docs/constitution-current.md'),'Stale text');assert.match(f.plan().items[0].errors.join(),/out of sync/);
  fs.writeFileSync(path.join(f.root,'docs/constitution-current.md'),old);
  f.put('notes.txt','Keep');assert.match(f.plan().errors.join(),/only constitution_data/);fs.rmSync(path.join(f.inbox,'notes.txt'));
  const dest=path.dirname(f.plan().items[0].update.snapshot);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.symlinkSync(f.root,dest);
  assert.match(f.plan().items[0].errors.join(),/Symlink/);fs.unlinkSync(dest);
  f.put('constitution_data.json','{"heading":"incomplete"}');assert.match(f.plan().items[0].errors.join(),/article array/);
});
test('Federal update rechecks canonical, generated and incoming bytes plus snapshot collisions before replacing anything',t=>{
  for(const target of ['constitution_data.json','docs/constitution-current.md','inbox','snapshot']) {
    const f=constitutionFixture(t),p=f.plan(),old=fs.readFileSync(path.join(f.root,'constitution_data.json'));
    if(target==='inbox') f.put('constitution_data.json','[]');
    else if(target==='snapshot') {fs.mkdirSync(path.dirname(p.items[0].update.snapshot),{recursive:true});fs.writeFileSync(p.items[0].update.snapshot,'Earlier save');}
    else fs.appendFileSync(path.join(f.root,target),'\n');
    assert.throws(()=>applyIngest(p,{runChecks:pass}),/changed|appeared/i);
    if(target!=='constitution_data.json') assert.ok(fs.readFileSync(path.join(f.root,'constitution_data.json')).equals(old));
  }
});
test('failed Federal validation leaves incoming source and previous Markdown intact and reports not ready',t=>{
  const f=constitutionFixture(t),old=fs.readFileSync(path.join(f.root,'docs/constitution-current.md')),lines=[],commands=[];
  const code=runIngest(['--update-constitution','--apply','--archive'],{root:f.root,inbox:f.inbox,log:s=>lines.push(s),runCommand:(cmd,args,root)=>{
    commands.push([cmd,...args].join(' '));
    if(cmd==='python3') return {status:1};
    return spawnSync(cmd,args,{cwd:root,encoding:'utf8'});
  }});
  assert.equal(code,1);assert.match(lines.join('\n'),/FAIL python3 scripts\/check-consistency.py/);assert.match(lines.join('\n'),/NOT ready to commit/);
  assert.ok(fs.existsSync(path.join(f.inbox,'constitution_data.json')));
  const dir=path.join(path.dirname(f.inbox),'Federated-Republic-Archive/constitution');
  assert.ok(fs.readdirSync(dir).some(name=>fs.readFileSync(path.join(dir,name)).equals(old)));
  assert.deepEqual(commands,['npm run sync','python3 scripts/check-consistency.py']);
});
