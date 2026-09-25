#!/usr/bin/env node
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {spawnSync} from 'node:child_process';
import {planIngest,applyIngest} from '../lib/republic-ingest.mjs';

export function checkCommands(root, applied) {
  const scripts=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8')).scripts;
  const commands=[];
  if(applied.includes('constitution_data.json')) commands.push(['npm',['run','sync']]);
  for(const name of ['check:world-meta','check:world-publish']) if(scripts[name]) commands.push(['npm',['run',name]]);
  commands.push(['npm',['run','build']]);
  if(applied.some(p=>p.endsWith('.html')) && scripts['check:discovery']) commands.push(['npm',['run','check:discovery']]);
  if(applied.some(p=>p==='constitution_data.json'||p.startsWith('State Constitutions/'))) {
    for(const name of ['check-consistency.py','check-constitutional-site.py']) if(fs.existsSync(path.join(root,'scripts',name))) commands.push(['python3',[`scripts/${name}`]]);
  }
  return commands;
}

export function runIngest(args, {
  root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),
  inbox=path.join(os.homedir(),'Downloads','Federated-Republic-Inbox'),
  log=console.log,
  runCommand=(cmd,args,root)=>spawnSync(cmd,args,{cwd:root,stdio:'inherit'})
} = {}) {
  if(args.some(a=>!['--apply','--archive'].includes(a)) || (args.includes('--archive')&&!args.includes('--apply'))) throw Error('Usage: npm run republic:ingest -- [--apply [--archive]]');
  const plan=planIngest({root,inbox});
  const section=(title,lines)=>log(`\n${title}\n${lines.length?lines.map(s=>`  ${s}`).join('\n'):'  None.'}`);
  log(`Republic ingest — ${args.includes('--apply')?'APPLY':'PREVIEW ONLY'}\nRepository: ${root}\nInbox: ${inbox}`);
  section('Detected files',plan.items.map(i=>`${i.source} [${i.kind}]${Object.keys(i.metadata).length?'\n    Metadata: '+JSON.stringify(i.metadata):''}`));
  section('Proposed actions',plan.items.filter(i=>i.destination).map(i=>`${i.source} -> ${i.destination}${i.errors.length?' [BLOCKED]':' [COPY]'}; no rename`));
  section('Warnings/errors',[...plan.errors,...plan.warnings,...plan.items.flatMap(i=>[...i.errors.map(e=>`${i.source}: ERROR ${e}`),...i.warnings.map(w=>`${i.source}: WARNING ${w}`)])]);
  let result={applied:[],archived:[],errors:[],checks:[]};
  if(args.includes('--apply')) result=applyIngest(plan,{archive:args.includes('--archive'),runChecks:applied=>checkCommands(root,applied).map(([cmd,args])=>{
    log(`\nRunning ${cmd} ${args.join(' ')}`);
    const check=runCommand(cmd,args,root);
    return {command:`${cmd} ${args.join(' ')}`,ok:check.status===0,error:check.error?.message};
  })});
  section('Applied actions',[...result.applied.map(p=>`Imported ${p}`),...result.archived.map(p=>`Archived ${p}`)]);
  section('Validation results',[...result.checks.map(c=>`${c.ok?'PASS':'FAIL'} ${c.command}${c.error?': '+c.error:''}`),...result.errors]);
  section('Files requiring human review',plan.items.filter(i=>i.errors.length).map(i=>`${i.source}: ${i.errors.join(' ')}`));
  const failed=plan.errors.length||plan.items.some(i=>i.errors.length)||result.errors.length;
  log(!args.includes('--apply')?'\nPreview complete. No repository or inbox changes.':failed?'\nStopped for review. No commit, push, or deployment performed.':result.applied.length?'\nREADY TO COMMIT after inspecting the diff. No commit, push, or deployment performed.':'\nNothing imported. No commit, push, or deployment performed.');
  return failed?1:0;
}
if(process.argv[1] && import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href) {
  try {process.exitCode=runIngest(process.argv.slice(2));} catch(e) {console.error(`Ingest stopped: ${e.message}`);process.exitCode=1;}
}
