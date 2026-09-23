import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import {validateWorld, validateDossiers, chronology} from './world.mjs';

// Include expected World filenames even when their front matter is missing.
export function readPublishingRecords(dir='.') {
  return fs.readdirSync(dir).filter(name=>name.endsWith('.html')).flatMap(name=>{
    const raw=fs.readFileSync(path.join(dir,name),'utf8');
    const {data,content}=matter(raw);
    return /^torenthia-(?:(?:news|nrs|sc)-\d+|dispatch[^.]*)\.html$/i.test(name) || Object.keys(data).some(k=>k.startsWith('world'))
      ? [{inputPath:name,data,content}] : [];
  });
}

export function checkWorldPublishing(records,{provisions,dossiers,status}) {
  const errors=[],warnings=[];
  for(const {inputPath,data:d,content} of records){
    const fail=message=>errors.push(`${inputPath}: ${message}`);
    for(const key of ['worldKind','worldId','worldDate','worldTitle','worldOutlet','worldBlurb'])
      if(typeof d[key]!=='string'||!d[key].trim())fail(`${key} must be a nonempty string`);
    if(!['news','nrs','sc','dispatch'].includes(d.worldKind))fail('unsupported worldKind');
    if(d.worldId!==path.basename(inputPath,'.html'))fail('worldId must match the filename');
    if(!Number.isInteger(d.worldSeq)||d.worldSeq<1)fail('worldSeq must be a positive integer');
    for(const key of ['worldArcs','worldJurisdictions','worldProvisions','worldRelated','worldDossiers','worldSignalIgnore']){
      if(d[key]===undefined&&['worldDossiers','worldSignalIgnore'].includes(key))continue;
      if(!Array.isArray(d[key])||d[key].some(v=>typeof v!=='string'||!v.trim()))fail(`${key} must be an array of nonempty strings`);
    }
    if(d.worldMundane!==undefined&&typeof d.worldMundane!=='boolean')fail('worldMundane must be a boolean');
    if(d.draft===true||d.worldDraft===true)fail('draft flag remains; finish and review this record before publishing');
    if(/Draft\s+body\s*:\s*replace\s+this\s+comment/i.test(content))fail('generated draft marker remains; replace the draft body before publishing');
  }
  if(errors.length)return {errors,warnings};
  try {validateWorld(records,provisions);validateDossiers(records,dossiers,provisions);}
  catch(error){errors.push(error.message);return {errors,warnings};}
  if(!records.length)return {errors,warnings};
  const latest=[...records].sort(chronology).at(-1).data;
  const maxSeq=Math.max(...records.map(p=>p.data.worldSeq));
  const frontier=status?.match(/worldSeq through \*\*(\d+)\*\*/i);
  const date=status?.match(/Current published frontier:\*\* Year (\d+), Month (\d+)/i);
  const [year,month]=latest.worldDate.split('.').map(Number);
  if(!frontier||Number(frontier[1])!==maxSeq)warnings.push(`Review WORLD-STORY-STATUS.md: published sequence frontier is ${maxSeq}.`);
  if(!date||Number(date[1])!==year||Number(date[2])!==month)warnings.push(`Review WORLD-STORY-STATUS.md: newest fictional date is ${latest.worldDate}.`);
  const unreviewed=records.filter(p=>!frontier||p.data.worldSeq>Number(frontier[1]));
  const coreArcs=new Set(unreviewed.flatMap(p=>p.data.worldDossiers||[]));
  for(const arc of coreArcs)warnings.push(`New core ${arc} record: review its dossier summary/question and Story Status section; update the Bible only for durable canon.`);
  return {errors,warnings};
}
