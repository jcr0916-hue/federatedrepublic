const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const crypto=require('node:crypto');
const E=require('../crossroads-engine.js');
const load=name=>JSON.parse(fs.readFileSync(name,'utf8'));
const korda=load('korda-crossroads.json'),thoss=load('docs/archive/crossroads/thoss-crossroads.json');
function play(role,ids){
 const run=E.initialize(korda,role);
 for(const id of ids){
  const scene=korda.scenes.find(s=>s.fragments[id]);
  E.enter(korda,run,scene);E.apply(korda,run,scene,id);
 }
 return run;
}
function walk(data,role){
 const found={}; let paths=0;
 function visit(run,id,path){
  if(id==='resolve'||data.endings[id]){
   const ending=id==='resolve'?E.selectEnding(data,run):id;
   assert.ok(data.endings[ending],ending);found[ending]??=path;paths++;return;
  }
  if(data.rules==='korda' && (run.meters.days<=0||run.state.deliberateLapse)) id='s6_korda';
  const scene=data.scenes.find(s=>s.id===id);assert.ok(scene,id);
  E.enter(data,run,scene);
  if(data.rules==='korda' && run.meters.days<=0 && id!=='s6_korda'){visit(run,'s6_korda',path);return;}
  const entries=Object.entries(E.fragments(scene,run));assert.ok(entries.length);
  for(const [fid,f] of entries){
   const next=structuredClone(run);E.apply(data,next,scene,fid);
   for(const m of data.meters) assert.ok(next.meters[m.id]>=m.min && next.meters[m.id]<=m.max);
   visit(next,f.next,[...path,fid]);
  }
 }
 visit(E.initialize(data,role),data.scenes[0].id,[]);return {found,paths};
}
test('game allowlist, defaults, role selection, isolated starting state',()=>{
 assert.equal(E.gameFile(''),'korda-crossroads.json');
 assert.throws(()=>E.gameFile('?game=thoss-crossroads.json'),/unavailable or archived/);
 for(const x of ['https://evil.test/a.json','../secret.json','no.json'])assert.throws(()=>E.gameFile('?game='+encodeURIComponent(x)));
 assert.throws(()=>E.initialize(korda));assert.throws(()=>E.initialize(korda,'thoss'));
 assert.deepEqual(E.initialize(korda,'threll').meters,{interior:58,corridor:30,swing:35,days:87});
 assert.deepEqual(E.initialize(korda,'kesh').meters,{interior:42,corridor:64,swing:35,days:87});
 const r=E.initialize(korda,'kesh');r.state.trust=-9;assert.equal(E.initialize(korda,'kesh').state.trust,0);
 assert.equal(E.initialize(thoss).role,null);
});
test('both game files have valid buttons, targets and authored prose; Thoss stays sealed',()=>{
 assert.match(thoss.note,/SEALED/);
 for(const d of [korda,thoss])for(const s of d.scenes){
  assert.ok(s.body);for(const b of s.buttons)assert.ok(s.fragments[b.route]);
  for(const [id,f] of Object.entries(s.fragments)){
   assert.ok(f.text && f.desc,id);assert.ok(f.next==='resolve'||d.endings[f.next]||d.scenes.some(n=>n.id===f.next),id);
  }
 }
 assert.equal(korda.scenes.length,6);assert.equal(Object.keys(korda.endings).length,5);
 for(const e of Object.values(korda.endings))for(const r of ['threll','kesh'])assert.ok(e.variants[r].text && /ratif/i.test(e.variants[r].coda));
});
test('role and state gates apply to classifier candidates and direct route application',()=>{
 for(const role of ['threll','kesh']){
  const run=E.initialize(korda,role);
  for(const s of korda.scenes.slice(0,3)){
   const choices=E.fragments(s,run);assert.equal(Object.keys(choices).length,4);
   assert.ok(Object.values(choices).every(f=>f.role===role));
   const invalid=Object.keys(s.fragments).find(id=>s.fragments[id].role!==role);
   assert.throws(()=>E.apply(korda,run,s,invalid));
  }
  assert.throws(()=>E.apply(korda,run,korda.scenes[0],'__proto__'));
  const s=korda.scenes[4];assert.ok(!E.fragments(s,run).s5_force_split);
  run.state.ultimatumEscalated=true;assert.ok(E.fragments(s,run).s5_force_split);
 }
});
test('all five endings reachable for both roles through legal paths',()=>{
 for(const role of ['threll','kesh']){
  const {found,paths}=walk(korda,role);
  assert.deepEqual(Object.keys(found).sort(),Object.keys(korda.endings).sort());
  console.log(role,paths,'paths; witnesses',JSON.stringify(found));
 }
});
test('no-concession persuasion wins for both roles; repeated demands deadlock',()=>{
 for(const [role,end] of [['threll','clean_statehood'],['kesh','negotiated_split']]){
  const second=role==='threll'?'narrow':'accept',last=role==='threll'?'s5_threll_clean':'s5_split';
  const run=play(role,[`s1_${role}_count`,`s2_${role}_${second}`,`s3_${role}_persuade`,`s4_${role}_persuade`,last,'s6_record']);
  assert.equal(E.selectEnding(korda,run),end);
  const hung=play(role,[`s1_${role}_force`,`s2_${role}_status_first`,`s3_${role}_${role==='threll'?'call_bluff':'ultimatum'}`,'s4_wait','s5_restate','s6_record']);
  assert.equal(E.selectEnding(korda,hung),'hung_convention');
 }
});
test('clock, lock snapshot, late automatic lock, inclusive boundaries and substantive package',()=>{
 let r=E.initialize(korda,'threll');r.meters={interior:65,corridor:35,swing:55,days:1};
 assert.equal(E.lock(r),'locked');r.meters.days=0;assert.equal(E.selectEnding(korda,r),'clean_statehood');
 r=E.initialize(korda,'threll');Object.assign(r.meters,{interior:100,swing:100,days:0});
 assert.equal(E.lock(r),'expired');assert.equal(E.selectEnding(korda,r),'hung_convention');
 const late=play('threll',['s1_threll_count','s2_threll_narrow','s3_threll_persuade','s4_threll_persuade','s5_tentative']);
 assert.equal(late.state.resolutionLocked,false);E.apply(korda,late,korda.scenes[5],'s6_record');assert.equal(E.selectEnding(korda,late),'clean_statehood');
 r=E.initialize(korda,'kesh');Object.assign(r.meters,{interior:90,corridor:90,swing:90});r.state.proposal='bargain';
 assert.equal(E.candidate(r),null);Object.assign(r.state,{broadPackage:true,corridorStructure:'autonomy',infrastructureCommitment:'full'});assert.equal(E.candidate(r),'grand_bargain');
 r.state.trust=-1;assert.equal(E.candidate(r),null);
 r.state.deliberateLapse=true;assert.equal(E.lock(r),'lapse');
});
test('walkout consumes real days once, including on repeated scene rendering',()=>{
 const r=play('kesh',['s1_kesh_count','s2_kesh_accept','s3_kesh_walkout']);
 const before=r.meters.days;E.enter(korda,r,korda.scenes[3]);assert.equal(r.meters.days,before-40);
 E.enter(korda,r,korda.scenes[3]);assert.equal(r.meters.days,before-40);
});
test('sealed Thoss content hash and every reachable legacy ending remain stable',()=>{
 assert.equal(crypto.createHash('sha256').update(fs.readFileSync('docs/archive/crossroads/thoss-crossroads.json')).digest('hex'),'3b66e1a72070e0b4aacb1c355eba55d4156bb6bad413506301aaa50266c17f19');
 const result=walk(thoss);assert.ok(result.paths>100);assert.ok(Object.keys(result.found).length>=6);
});

test('API remains classifier-only and rejects invented narrative routes',async()=>{
 const handler=require('../api/crossroads.js');
 const originalFetch=global.fetch,originalKey=process.env.ANTHROPIC_API_KEY;
 process.env.ANTHROPIC_API_KEY='test-only';
 const request={method:'POST',body:{move:'work the room',sceneTitle:'The Count',sceneBody:'Authored setup',fragments:[{id:'allowed',desc:'Persuade without concession'}]}};
 async function response(raw){
  let payload;
  global.fetch=async(_url,options)=>{
   payload=JSON.parse(options.body);
   return {ok:true,json:async()=>({content:[{type:'text',text:raw}]})};
  };
  let result;const res={setHeader(){},status(n){this.code=n;return this;},json(v){result=v;return this;},end(){}};
  await handler(request,res);
  assert.match(payload.system,/classifier, not a writer/);
  assert.match(payload.system,/Never invent a fragment id/);
  return result;
 }
 try{
  assert.equal((await response('{"fragment":"allowed"}')).fragment,'allowed');
  assert.equal((await response('{"fragment":"A completely new story"}')).fragment,'out_of_bounds');
  assert.equal((await response('The Convention crowned a king.')).fragment,'out_of_bounds');
 } finally {global.fetch=originalFetch;if(originalKey===undefined)delete process.env.ANTHROPIC_API_KEY;else process.env.ANTHROPIC_API_KEY=originalKey;}
});

test('Thoss engine matches the sealed legacy selector across boundary states',()=>{
 // Frozen pre-feature selector is an independent regression oracle.
 function old(m,last){
  const A=m.allies,I=m.intent;
  if(last==='s4lc_declare')return 'legat_run';if(last==='s4lc_withdraw')return 'returned';
  if(last==='s4lc_wait'||last==='s4lc_conditional')return 'legislator';
  if(last==='s4_kingmaker')return 'kingmaker';
  if(I<25||A<30)return 'legislator';if(I>=30&&I<52&&A>=55)return 'long_game';
  if(last==='s4_wait'&&I>=30&&A<60)return 'legat_run';
  if(I>=52)return A>=65?'commit_civic':'commit_civic_thin';if(A>=55)return 'long_game';return 'legislator';
 }
 for(const allies of [0,29,30,54,55,59,60,64,65,100])for(const intent of [0,24,25,29,30,51,52,100])for(const last of ['', 's4lc_declare','s4lc_withdraw','s4lc_wait','s4lc_conditional','s4_kingmaker','s4_wait']){
  const run=E.initialize(thoss);Object.assign(run.meters,{allies,intent});run.lastFragmentId=last;
  assert.equal(E.selectEnding(thoss,run),old(run.meters,last));
 }
});

test('actual page sends only eligible descriptors, rejects cross-role replies, and resets replay',async()=>{
 const page=fs.readFileSync('crossroads.html','utf8').match(/<script>\s*(const CR =[\s\S]*?)<\/script>/)[1];
 const elements=new Map();let selected='threll',fetchBody,reply='s1_kesh_force';
 function element(id){if(!elements.has(id))elements.set(id,{innerHTML:'',textContent:'',value:'',style:{},dataset:{},classList:{add(){},remove(){}},addEventListener(type,cb){this[type]=cb;},querySelectorAll(){return [];}});return elements.get(id);}
 const document={getElementById:element,querySelector:s=>s.includes(':checked')?{value:selected}:s==='.meters'?element('meters'):element('freetext-wrap'),querySelectorAll:()=>[]};
 const context=vm.createContext({document,location:{search:''},CrossroadsEngine:E,console,setTimeout,fetch:async(url,options)=>{
  if(url==='/api/crossroads'){fetchBody=JSON.parse(options.body);return {ok:true,json:async()=>({fragment:reply,read:'MODEL PROSE MUST NEVER RENDER'})};}
  return {ok:true,json:async()=>korda};
 }});
 vm.runInContext(page,context);await new Promise(setImmediate);
 vm.runInContext('CR.start()',context);element('contBtn').click();
 element('ftInput').value='Put status on the agenda';await element('ftSend').click();
 assert.ok(fetchBody.fragments.every(f=>f.id.startsWith('s1_threll_')));
 assert.ok(fetchBody.fragments.every(f=>Object.keys(f).sort().join(',')==='desc,id'));
 assert.match(element('sceneArea').innerHTML,/outside the choices/);
 assert.doesNotMatch(element('sceneArea').innerHTML,/MODEL PROSE/);
 assert.match(element('meters').innerHTML,/>58</);
 element('contBtn').click();reply='s1_threll_force';element('ftInput').value='Put Statehood first';await element('ftSend').click();
 assert.match(element('meters').innerHTML,/>68</);
 assert.doesNotMatch(element('sceneArea').innerHTML,/MODEL PROSE/);
 vm.runInContext('CR.replay()',context);selected='kesh';vm.runInContext('CR.start()',context);
 assert.match(element('meters').innerHTML,/>42</);assert.match(element('meters').innerHTML,/>64</);
});

test('a deal drafted at zero is late and deliberate lapse survives the final fragment',()=>{
 const r=E.initialize(korda,'threll');Object.assign(r.meters,{interior:90,swing:90,days:8});
 assert.equal(E.apply(korda,r,korda.scenes[4],'s5_threll_clean'),'expired');
 assert.equal(r.state.resolutionLocked,false);assert.equal(E.selectEnding(korda,r),'hung_convention');
 const short=E.initialize(korda,'threll');E.apply(korda,short,korda.scenes[5],'s6_record');assert.equal(short.meters.days,0);
 const lapse=E.initialize(korda,'kesh');Object.assign(lapse.meters,{interior:90,corridor:90,swing:90});
 E.apply(korda,lapse,korda.scenes[3],'s4_deliberate_lapse');E.apply(korda,lapse,korda.scenes[5],'s6_record');
 assert.equal(lapse.lastFragmentId,'s6_record');assert.equal(E.selectEnding(korda,lapse),'hung_convention');
});
