#!/usr/bin/env node
import { validateWorldDraftFile } from '../lib/world-draft-validation.mjs';

function parseArgs(argv){
  const out={};
  for(let i=0;i<argv.length;i++){
    const token=argv[i];
    if(!token.startsWith('--'))continue;
    const key=token.slice(2);
    if(key==='allow-existing-seq'){out[key]=true;continue;}
    out[key]=argv[++i];
  }
  return out;
}

const args=parseArgs(process.argv.slice(2));
if(!args.file){
  console.error('Usage: npm run world:validate-draft -- --file torenthia-news-098.html [--allow-existing-seq]');
  process.exit(2);
}

try{
  const result=validateWorldDraftFile(args.file,{enforceNext:!args['allow-existing-seq']});
  for(const warning of result.warnings) console.warn(`[world draft warning] ${warning}`);
  for(const error of result.errors) console.error(`[world draft FAIL] ${error}`);
  if(result.errors.length) process.exitCode=1;
  else console.log(`[world draft PASS] ${result.file}: ${result.bodyRefs.length} constitutional body reference(s), ${result.warnings.length} warning(s), no unresolved-canon violations.`);
}catch(error){
  console.error(`[world draft FAIL] ${error.message}`);
  process.exitCode=1;
}
