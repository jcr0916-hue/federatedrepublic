import {loadWorldRegistries} from './world-chronology.mjs';
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import {readPublishingRecords, checkWorldPublishing} from './world-publishing.mjs';
import {nextWorldSeq} from './world-authoring.mjs';
import {analyzeWorldMetadata} from './world-metadata.mjs';
import {references, localURL, assetInventory, publicAssetURL} from '../scripts/public-assets.mjs';

const worldName = /^torenthia-(?:(news|nrs|sc)-\d+|(dispatch)-[a-z0-9-]+)\.html$/;
const imageName = /\.(png|jpe?g|webp|avif|gif|svg|ico)$/i;
const exists = p => { try { fs.lstatSync(p); return true; } catch (e) { if(e.code==='ENOENT') return false; throw e; } };

// Never traverse symlinks, including a destination's parent directories.
export function safePath(root, relative) {
  if(path.isAbsolute(relative) || relative.split(/[\\/]/).some(p=>p==='..')) throw Error('Unsafe path');
  const absolute=path.resolve(root,relative);
  let current=path.parse(absolute).root;
  for(const part of absolute.slice(current.length).split(path.sep).filter(Boolean)) {
    current=path.join(current,part);
    if(exists(current) && fs.lstatSync(current).isSymbolicLink()) throw Error(`Symlink refused: ${current}`);
  }
  return absolute;
}

export function classify(relative, root) {
  const name=path.basename(relative);
  if(relative===name && worldName.test(name)) return {destination:name,kind:'world'};
  if(['WORLD-STORY-STATUS.md','WORLD-STORY-BIBLE.md'].includes(name) && [name,`docs/${name}`].includes(relative))
    return {destination:`docs/${name}`,kind:'editorial'};
  if(relative==='constitution_data.json') return {destination:relative,kind:'constitution'};
  if(/^[a-z]+-state-constitution\.md$/.test(name) && [name,`State Constitutions/${name}`].includes(relative)) {
    // Only recognize established State names, never infer statehood from a filename.
    if(fs.readdirSync(path.join(root,'State Constitutions')).includes(name)) return {destination:`State Constitutions/${name}`,kind:'state'};
  }
  if(imageName.test(name) && /^(images|logos)\/[^/]+$/.test(relative)) return {destination:relative,kind:'asset'};
  return {destination:null,kind:'unknown'};
}

export function planIngest({root,inbox}) {
  root=path.resolve(root); inbox=path.resolve(inbox);
  const plan={root,inbox,items:[],errors:[],warnings:[]};
  safePath(root,'');
  safePath(inbox,'');
  if(!exists(inbox)) { plan.warnings.push('Inbox is missing; nothing to ingest.'); return plan; }
  function scan(relative='') {
    for(const entry of fs.readdirSync(path.join(inbox,relative),{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))) {
      const name=path.posix.join(relative,entry.name);
      if(entry.isDirectory() && ['images','logos','docs','State Constitutions'].includes(name)) {scan(name);continue;}
      const item={source:name,...classify(name,root),errors:[],warnings:[],metadata:{}};
      plan.items.push(item);
      if(!entry.isFile()) {item.errors.push('Only regular files in supported inbox folders are accepted.');continue;}
      if(!item.destination) {item.errors.push('Unknown or ambiguous routing; report only. Put image assets in images/ or logos/ inside the inbox.');continue;}
      try {
        item.bytes=fs.readFileSync(safePath(inbox,name));
        const dest=safePath(root,item.destination);
        if(exists(dest) || fs.readdirSync(path.dirname(dest)).some(n=>n.toLowerCase()===path.basename(dest).toLowerCase())) item.errors.push('Destination collision: never overwrite; compare and merge manually.');
        if(item.kind==='asset') {
          if(/\.svg$/i.test(name)) item.refs=[...references(item.bytes.toString('utf8'),item.destination)];
          continue;
        }
        const raw=new TextDecoder('utf-8',{fatal:true,ignoreBOM:true}).decode(item.bytes);
        if(raw.startsWith('\uFEFF')) throw Error('UTF-8 BOM requires manual removal before import.');
        item.text=raw.replace(/\r\n?/g,'\n');
        if(raw!==item.text) item.warnings.push('CRLF/CR detected; import will normalize to LF without reserializing front matter.');
        if(/\b(?:TODO|TBD|FIXME|lorem ipsum)\b|\[\s*(?:insert|placeholder|draft)\b|Draft\s+body\s*:|<!--\s*(?:draft|replace|insert)\b/im.test(item.text)) item.errors.push('Draft marker or placeholder requires human review.');
        if(item.kind==='editorial' || item.kind==='state' || item.kind==='constitution') item.errors.push('Canon/constitutional source requires a human-reviewed manual merge; no automatic editorial decision.');
        if(item.kind==='constitution') JSON.parse(item.text);
        if(item.kind==='world') {
          if(!/^---\n/.test(item.text)) throw Error('Expected plain YAML front matter; executable/alternative front-matter engines are refused.');
          const parsed=matter(item.text);
          item.metadata=parsed.data;
          item.record={inputPath:item.destination,data:parsed.data,content:parsed.content};
          const match=worldName.exec(name);
          if(parsed.data.worldKind!==(match[1]||match[2])) item.errors.push('Filename family does not match worldKind.');
          if(parsed.data.worldDossiers?.length) item.errors.push('Core dossier placement requires human review; import manually after review.');
          if(parsed.data.draft || parsed.data.worldDraft || parsed.data.ingestReview) item.errors.push('Draft/review flag requires human review.');
          // These alter Eleventy routing or execution rather than ordinary article metadata.
          for(const key of ['permalink','eleventyExcludeFromCollections','eleventyComputed','layout','pagination'])
            if(key in parsed.data) item.errors.push(`${key} requires manual review.`);
          item.refs=[...references(parsed.content,item.destination),...(Array.isArray(parsed.data.worldRelated)?parsed.data.worldRelated:[])];
          if(parsed.data.worldImage) {
            if(typeof parsed.data.worldImage!=='string') item.errors.push('worldImage must be a string.');
            else item.refs.push(parsed.data.worldImage);
          }
          for(const m of parsed.content.matchAll(/{%\s*include\s+["']([^"']+)["']/g)) item.refs.push('/_includes/'+m[1]);
        }
      } catch(e) {item.errors.push(e.message);}
    }
  }
  scan();
  if(!plan.items.length) {plan.warnings.push('Inbox is empty; nothing to ingest.');return plan;}
  const worlds=plan.items.filter(i=>i.record);
  const published=readPublishingRecords(root);
  let next=nextWorldSeq([...published,...worlds.map(i=>i.record)]);
  for(const item of worlds) {
    if(item.metadata.worldKind!=='nrs' && (item.metadata.worldSeq===undefined || item.metadata.worldSeq===null || item.metadata.worldSeq===''))
      item.errors.push(`Missing worldSeq: proposed next available sequence ${next++}; set it explicitly and preview again (not reserved).`);
    for(const field of ['worldArcs','worldJurisdictions','worldProvisions','worldRelated','worldDossiers','worldSignalIgnore'])
      if(item.metadata[field]!==undefined && !Array.isArray(item.metadata[field])) item.errors.push(`${field} must be an array.`);
    if(item.metadata.worldSeq!==undefined && item.metadata.worldSeq!==null && item.metadata.worldSeq!=='' && !Number.isSafeInteger(item.metadata.worldSeq)) item.errors.push('worldSeq must be a safe integer.');
    if(!Number.isSafeInteger(next)) item.errors.push('Sequence range exhausted; human review required.');
    if(!item.errors.length) item.warnings.push(...analyzeWorldMetadata(item.metadata,item.record.content.replace(/<[^>]*>/g,' ')).map(w=>w.message));
  }
  // Check all duplicates, including two inbox files or a case-only destination variant.
  for(const item of plan.items) {
    if(item.destination && plan.items.some(other=>other!==item && other.destination?.toLowerCase()===item.destination.toLowerCase())) item.errors.push('Duplicate inbox destination.');
    if(item.record && item.metadata.worldSeq!==undefined && [...published,...worlds.filter(i=>i!==item).map(i=>i.record)].some(r=>r.data.worldSeq===item.metadata.worldSeq)) item.errors.push('Duplicate worldSeq in repository or inbox.');
  }
  const options={
    registry:loadWorldRegistries(root),
    provisions:new Set(JSON.parse(fs.readFileSync(path.join(root,'constitution_data.json'),'utf8')).flatMap(a=>a.provisions.map(p=>p.num))),
    dossiers:JSON.parse(fs.readFileSync(path.join(root,'_data/currentFiles.json'),'utf8')),
    status:fs.readFileSync(path.join(root,'docs/WORLD-STORY-STATUS.md'),'utf8')
  };
  const assets=assetInventory(root);
  for(const item of plan.items.filter(i=>i.kind==='asset' && i.destination)) {
    const url=publicAssetURL(item.destination);
    if((url!==item.destination && exists(safePath(root,url))) ||
       [...assets.keys()].some(existing=>existing.toLowerCase()===url.toLowerCase()))
      item.errors.push('Public asset URL collision; never replace existing published assets.');
  }
  function pruneReferences() {
    let changed;
    do {
      changed=false;
      const eligible=plan.items.filter(i=>i.destination && !i.errors.length);
      for(const item of eligible) for(const ref of item.refs||[]) {
        try {
          if(/[{}*]/.test(ref)) throw Error(`Dynamic reference needs human review: ${ref}`);
          const local=localURL(ref,publicAssetURL(item.destination));
          if(local===null) continue;
          const source=assets.has(local)?path.relative(root,assets.get(local)):local;
          const existing=local && (assets.has(local)||!/^(images|pdf)\//.test(local)) && exists(safePath(root,source)) && fs.statSync(safePath(root,source)).isFile();
          if(!existing && !eligible.some(i=>publicAssetURL(i.destination)===local)) throw Error(`Unresolved public reference: ${ref}`);
        } catch(e) {item.errors.push(e.message);changed=true;}
      }
    } while(changed);
  }
  pruneReferences();
  const eligibleWorlds=worlds.filter(i=>!i.errors.length);
  const checked=checkWorldPublishing([...published,...eligibleWorlds.map(i=>i.record)],options);
  plan.warnings.push(...checked.warnings);
  if(checked.errors.length) {
    plan.errors.push(...checked.errors);
    for(const item of eligibleWorlds) item.errors.push('World candidate batch failed shared publishing validation; fix reported errors and preview again.');
    pruneReferences();
  }
  return plan;
}

export function applyIngest(plan,{archive=false,runChecks}) {
  const result={applied:[],archived:[],errors:[],checks:[]};
  const items=plan.items.filter(i=>i.destination && !i.errors.length);
  // Recheck the complete batch before any writes. Exclusive creation closes overwrite races.
  for(const item of items) {
    if(exists(safePath(plan.root,item.destination))) throw Error(`Destination appeared: ${item.destination}; preview again.`);
    if(!fs.readFileSync(safePath(plan.inbox,item.source)).equals(item.bytes)) throw Error(`Inbox changed: ${item.source}; preview again.`);
  }
  try {
    for(const item of items) {
      fs.writeFileSync(safePath(plan.root,item.destination),item.text??item.bytes,{flag:'wx'});
      result.applied.push(item.destination);
    }
  } catch(e) {result.errors.push(e.message);}
  if(result.applied.length) {
    try {
      result.checks=runChecks(result.applied);
      if(!Array.isArray(result.checks)||!result.checks.length) throw Error('No post-import check results were returned.');
    } catch(e) {result.errors.push(`Post-import checks could not complete: ${e.message}`);result.checks=[];}
    if(result.checks.some(c=>!c.ok)) result.errors.push('Post-import checks failed. Imported files remain for inspection; nothing archived. NOT ready to commit.');
    if(!result.errors.length && archive) {
      const archiveRoot=path.join(path.dirname(plan.inbox),'Federated-Republic-Archive');
      const batch=path.join(archiveRoot,new Date().toISOString().replace(/[:.]/g,'-'));
      safePath(batch,'');
      fs.mkdirSync(batch,{recursive:true});
      for(const item of items) {
        try {
          const source=safePath(plan.inbox,item.source);
          if(!fs.readFileSync(source).equals(item.bytes)) throw Error('Source changed; left in inbox');
          const target=safePath(batch,item.source);
          fs.mkdirSync(path.dirname(target),{recursive:true});
          fs.copyFileSync(source,target,fs.constants.COPYFILE_EXCL);
          if(!fs.readFileSync(source).equals(item.bytes)) throw Error('Source changed during archive; left in inbox');
          fs.unlinkSync(source);
          result.archived.push(`${item.source} -> ${target}`);
        } catch(e) {result.errors.push(`${item.source}: ${e.message}`);}
      }
    }
  }
  return result;
}
