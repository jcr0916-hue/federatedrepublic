import fs from 'node:fs';
import path from 'node:path';

const statuses=new Set(['published','open','scheduled','planned']);
export function fictionalDate(value){
  if(typeof value==='string'){
    if(!/^\d{2,}\.(0[1-9]|1[0-2])$/.test(value))throw Error(`Invalid fictional date: ${value}`);
    const [year,month]=value.split('.').map(Number);return fictionalDate({year,month});
  }
  if(!value||!Number.isSafeInteger(value.year)||value.year<1||!Number.isInteger(value.month)||value.month<1||value.month>12||
    (value.day!==undefined&&(!Number.isSafeInteger(value.day)||value.day<1)))throw Error(`Invalid fictional date: ${JSON.stringify(value)}`);
  return {...value};
}
const monthKey=d=>d.year*12+d.month;
// Only report a crossing when the available precision establishes it.
export function isAfter(date,boundary){
  const a=fictionalDate(date),b=fictionalDate(boundary);
  return monthKey(a)>monthKey(b)||(monthKey(a)===monthKey(b)&&a.day!==undefined&&b.day!==undefined&&a.day>b.day);
}
export const dateLabel=d=>`${String(d.year).padStart(2,'0')}.${String(d.month).padStart(2,'0')}${d.day===undefined?'':` day ${d.day}`}`;
export function publishedChronology(records){
  return records.map(({data:d})=>({id:d.worldId,date:{...fictionalDate(d.worldDate),...(d.worldDay===undefined?{}:{day:d.worldDay})},
    stream:d.worldKind==='nrs'?'nrs':'narrative',type:d.worldKind,status:'published',jurisdictions:d.worldJurisdictions,
    arcs:d.worldArcs,sources:[d.worldId],people:d.worldPeople||[],offices:d.worldOffices||[]}));
}
export function chronologyRegistry(records,events=[]){return [...publishedChronology(records),...events];}
export function loadWorldRegistries(root='.'){
  const read=name=>{const file=path.join(root,'_data',name);return fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):[];};
  return {events:read('worldChronology.json'),clocks:read('worldClocks.json')};
}
export function validateRegistries(records,events=[],clocks=[]){
  const sources=new Set(records.map(r=>r.data.worldId)),ids=new Set(sources);
  const checkSources=item=>{
    if(!Array.isArray(item.sources)||!item.sources.length)throw Error(`${item.id}: source records required`);
    for(const id of item.sources)if(!sources.has(id))throw Error(`${item.id}: unknown source ${id}`);
  };
  const strings=(item,key)=>{if(item[key]!==undefined&&(!Array.isArray(item[key])||item[key].some(s=>typeof s!=='string'||!s.trim())))throw Error(`${item.id}: invalid ${key}`);};
  for(const item of [...events,...clocks]){
    if(typeof item.id!=='string'||!item.id.trim()||ids.has(item.id))throw Error(`Missing/duplicate registry id: ${item.id}`);
    ids.add(item.id);
    if(!statuses.has(item.status))throw Error(`${item.id}: invalid status`);
    for(const key of ['arcs','jurisdictions','people','offices'])strings(item,key);
    checkSources(item);
  }
  for(const item of events){
    fictionalDate(item.date);
    if(!['narrative','nrs','institutional','editorial'].includes(item.stream)||typeof item.type!=='string'||!item.type.trim())throw Error(`${item.id}: stream/type required`);
  }
  for(const c of clocks){
    if(!c.title||!c.summary||!c.nextAction||!c.trigger?.description||!c.timing)throw Error(`${c.id}: summary, trigger, timing and nextAction required`);
    if(c.trigger.date)fictionalDate(c.trigger.date);
    const t=c.timing;
    if(!['deadline','window','relative','unscheduled','none','template'].includes(t.kind))throw Error(`${c.id}: invalid timing kind`);
    if(t.kind==='deadline'){
      fictionalDate(t.due);
      if(c.trigger.date&&isAfter(c.trigger.date,t.due))throw Error(`${c.id}: deadline precedes trigger`);
    }
    if(t.kind==='window'){
      if(t.start||t.end){fictionalDate(t.start);fictionalDate(t.end);if(isAfter(t.start,t.end))throw Error(`${c.id}: reversed window`);}
      else if(!Number.isSafeInteger(t.year)||t.year<1||!t.season)throw Error(`${c.id}: window needs bounds or year/season`);
    }
    if(t.kind==='relative'){
      if(!c.trigger.date||!Number.isFinite(t.amount)||t.amount<=0||!['active-days','months','days','years'].includes(t.unit))throw Error(`${c.id}: invalid relative timing`);
      if(t.reviewAfter)fictionalDate(t.reviewAfter);
    }
  }
  return true;
}
export function clockWarnings(proposed,clocks){
  const date=fictionalDate(proposed),crossed=[],review=[];
  for(const c of clocks){
    if(!['open','scheduled'].includes(c.status))continue;
    const t=c.timing;
    if((t.kind==='deadline'&&isAfter(date,t.due))||(t.kind==='window'&&t.end&&isAfter(date,t.end))||
      (t.kind==='window'&&!t.end&&date.year>t.year))crossed.push(c);
    else if(t.kind==='window'&&!t.end&&date.year===t.year)review.push(c);
    else if(t.kind==='relative'&&t.reviewAfter&&isAfter(date,t.reviewAfter))review.push(c);
  }
  const warnings=[];
  if(crossed.length)warnings.push(`Story date ${dateLabel(date)} crosses ${crossed.length} unresolved scheduled event(s): ${crossed.map(c=>`${c.id} (${c.title}): ${c.nextAction}`).join('; ')}`);
  for(const c of review)warnings.push(`Story date ${dateLabel(date)} requires clock review: ${c.id} (${c.title}). ${c.timing.note||'Calendar precision is unresolved; no exact deadline asserted.'} Next: ${c.nextAction}`);
  return warnings;
}
export function registryWarnings(records,{events=[],clocks=[]},status=''){
  validateRegistries(records,events,clocks);
  const published=chronologyRegistry(records,events).filter(e=>e.status==='published');
  if(!published.length)return [];
  // A known published day can prove a crossing even when another record in the
  // same month has no day. Keep that evidence without dating imprecise records.
  const frontier=published.map(e=>fictionalDate(e.date)).reduce((a,b)=>
    isAfter(b,a)||(monthKey(a)===monthKey(b)&&a.day===undefined&&b.day!==undefined)?b:a);
  const warnings=clockWarnings(frontier,clocks);
  const match=status?.match(/Current published frontier:\*\* Year (\d+), Month (\d+)/i);
  if(!match||+match[1]!==frontier.year||+match[2]!==frontier.month)warnings.push(`Status frontier differs from registry: ${dateLabel(frontier)}.`);
  if(status&&!status.includes(clockDashboard(clocks)))warnings.push('Status clock dashboard differs from structured registry; run npm run world:status -- --write. Human notes are retained.');
  return warnings;
}
export function timingLabel(clock){
  const t=clock.timing;
  if(t.kind==='deadline')return `Due ${dateLabel(t.due)}`;
  if(t.kind==='window')return t.end?`Window ${dateLabel(t.start)}–${dateLabel(t.end)}`:`Window ${t.season} Y${t.year} (month bounds unset)`;
  if(t.kind==='relative')return `${t.approximate?'Approximately ':t.maximum?'Up to ':''}${t.amount} ${t.unit} from ${dateLabel(clock.trigger.date)}${t.binding===false?' (non-binding)':''}; calendar endpoint unresolved`;
  return t.kind==='template'?'Uninstantiated; no current seat or dated obligation':t.kind==='none'?'No timed obligation':'Unscheduled';
}
export function clockDashboard(clocks){
  return ['<!-- WORLD-CLOCKS:START -->','### Structured clock dashboard','',...clocks.map(c=>`- **${c.title}** [${c.id}; ${c.status}; ${c.timing.kind}]: ${timingLabel(c)}. ${c.summary} Next: ${c.nextAction}`),'<!-- WORLD-CLOCKS:END -->'].join('\n');
}
