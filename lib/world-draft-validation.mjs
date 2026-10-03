import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { readWorldInventory, nextWorldSeq, nextNrsSeq } from './world-authoring.mjs';
import { clockWarnings, loadWorldRegistries } from './world-chronology.mjs';

function cleanText(raw='') {
  return String(raw)
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ')
    .replace(/<[^>]+>/g,' ')
    .replace(/&(?:nbsp|mdash|ndash|middot);/gi,' ')
    .replace(/\s+/g,' ')
    .trim();
}

function numericDate(value) {
  const m=String(value||'').match(/^(\d+)\.(\d{2})$/);
  return m ? Number(m[1])*12+Number(m[2]) : -1;
}

export function loadWorldAuthoringGuardrails(root='.') {
  const file=path.join(root,'_data','worldAuthoringGuardrails.json');
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file,'utf8')) : [];
}

export function guardrailFindings(record, guardrails=[]) {
  const findings=[];
  const d=record.data || {};
  const arcs=new Set(d.worldArcs || []);
  const seq=d.worldKind==='nrs' ? Number(d.nrsSeq) : Number(d.worldSeq);
  const text=cleanText(record.content || '');
  for(const g of guardrails) {
    if(!g.active || !arcs.has(g.arc)) continue;
    const floor=d.worldKind==='nrs' ? Number(g.afterNrsSeq||0) : Number(g.afterWorldSeq||0);
    if(!Number.isFinite(seq) || seq<=floor) continue;
    for(const source of g.patterns || []) {
      const re=new RegExp(source,'i');
      const m=text.match(re);
      if(!m) continue;
      findings.push({
        id:g.id,
        arc:g.arc,
        match:m[0],
        note:g.note,
        resolutionInstruction:g.resolutionInstruction,
      });
    }
  }
  return findings;
}

export function validateWorldDraftFile(file,{root='.',enforceNext=true}={}) {
  const full=path.resolve(root,file);
  if(!fs.existsSync(full)) throw Error(`Draft file not found: ${file}`);
  const raw=fs.readFileSync(full,'utf8');
  const parsed=matter(raw);
  const d=parsed.data;
  const errors=[],warnings=[];

  if(!d.worldKind) errors.push('worldKind is required');
  if(!d.worldDate || !/^\d{2,}\.(0[1-9]|1[0-2])$/.test(String(d.worldDate))) errors.push('worldDate must use YY.MM');
  if(!Array.isArray(d.worldArcs)) errors.push('worldArcs must be an array');

  const allInventory=readWorldInventory(root);
  const inventory=allInventory.filter(x=>path.resolve(root,x.name)!==full);
  if(enforceNext && d.worldKind) {
    const isNrs=d.worldKind==='nrs';
    const key=isNrs?'nrsSeq':'worldSeq';
    const actual=Number(d[key]);
    const statusFile=path.join(root,'docs','WORLD-STORY-STATUS.md');
    const status=fs.existsSync(statusFile)?fs.readFileSync(statusFile,'utf8'):'';
    const match=isNrs
      ? status.match(/nrsSeq through \\*\\*(\\d+)\\*\\*/i)
      : status.match(/worldSeq through \\*\\*(\\d+)\\*\\*/i);

    if(match){
      const publishedFrontier=Number(match[1]);
      const newSeqs=allInventory
        .filter(x=>isNrs?x.data.worldKind==='nrs':x.data.worldKind!=='nrs')
        .map(x=>Number(x.data[key]))
        .filter(n=>Number.isSafeInteger(n)&&n>publishedFrontier)
        .sort((a,b)=>a-b);
      const expected=Array.from({length:newSeqs.length},(_,i)=>publishedFrontier+i+1);
      if(newSeqs.join(',')!==expected.join(',')){
        errors.push(`${key} values after published frontier ${publishedFrontier} must be contiguous: found [${newSeqs.join(', ')}]`);
      }
      if(actual<=publishedFrontier) warnings.push(`${key} ${actual} is not beyond published frontier ${publishedFrontier}; this appears to be an existing/backfilled record`);
    } else {
      const expected=isNrs ? nextNrsSeq(inventory) : nextWorldSeq(inventory);
      if(actual!==expected) errors.push(`${key} must be next in stream: expected ${expected}, found ${actual}`);
    }
  }

  const frontier=inventory
    .map(x=>x.data.worldDate)
    .filter(Boolean)
    .sort((a,b)=>numericDate(b)-numericDate(a))[0];
  if(frontier && d.worldDate && numericDate(d.worldDate)<numericDate(frontier)) {
    warnings.push(`worldDate ${d.worldDate} is earlier than current inventory frontier ${frontier}; confirm this is an intentional backdated publication`);
  }

  const constitution=JSON.parse(fs.readFileSync(path.join(root,'constitution_data.json'),'utf8'));
  const known=new Set(constitution.flatMap(a=>a.provisions||[]).map(p=>p.num));
  const frontRefs=Array.isArray(d.worldProvisions) ? d.worldProvisions : [];
  for(const ref of frontRefs) if(!known.has(ref)) errors.push(`Unknown constitutional provision in worldProvisions: ${ref}`);

  const bodyRefs=[...new Set(cleanText(parsed.content).match(/§\d+(?:\.\d+)*(?:\.[a-z])?/gi)||[])];
  for(const ref of bodyRefs) {
    if(!known.has(ref)) errors.push(`Unknown constitutional provision cited in body: ${ref}`);
    else if(!frontRefs.includes(ref)) warnings.push(`Body cites ${ref} but worldProvisions does not list it`);
  }

  const registries=loadWorldRegistries(root);
  if(d.worldDate) {
    for(const warning of clockWarnings(d.worldDate,registries.clocks)) warnings.push(warning);
  }

  const guardrails=loadWorldAuthoringGuardrails(root);
  const findings=guardrailFindings({data:d,content:parsed.content},guardrails);
  for(const finding of findings) {
    errors.push(`${finding.id}: draft appears to resolve still-open ${finding.arc} canon via “${finding.match}”. ${finding.note} ${finding.resolutionInstruction}`);
  }

  return {
    file:path.basename(file),
    errors,
    warnings,
    frontier,
    bodyRefs,
    guardrailFindings:findings,
  };
}

export { cleanText };
