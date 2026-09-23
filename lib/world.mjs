export function validateWorld(pieces, provisions) {
  const ids=new Set(), seqs=new Set();
  for(const p of pieces){
    const d=p.data;
    if(!d.worldId || ids.has(d.worldId))throw Error(`Missing/duplicate worldId: ${p.inputPath}`);
    ids.add(d.worldId);
    if(!/^\d{2,}\.\d{2}$/.test(d.worldDate)||+d.worldDate.split('.')[1]<1||+d.worldDate.split('.')[1]>12)throw Error(`Invalid worldDate: ${p.inputPath}`);
    if(!Number.isInteger(d.worldSeq)||seqs.has(d.worldSeq))throw Error(`Missing/duplicate worldSeq: ${p.inputPath}`);
    seqs.add(d.worldSeq);
    for(const key of ['worldArcs','worldJurisdictions','worldProvisions','worldRelated'])if(!Array.isArray(d[key]))throw Error(`Missing ${key}: ${p.inputPath}`);
    if(d.worldDossiers!==undefined && !Array.isArray(d.worldDossiers))throw Error(`Invalid worldDossiers: ${p.inputPath}`);
    if(d.worldSignalIgnore!==undefined && !Array.isArray(d.worldSignalIgnore))throw Error(`Invalid worldSignalIgnore: ${p.inputPath}`);
    for(const ref of d.worldProvisions)if(!provisions.has(ref))throw Error(`Unknown provision ${ref}: ${p.inputPath}`);
  }
  for(const p of pieces)for(const url of p.data.worldRelated)if(!ids.has(url.replace(/\.html$/,'')))throw Error(`Unknown related record ${url}`);
  return pieces;
}
export function chronology(a,b){
  const [ay,am]=a.data.worldDate.split('.').map(Number),[by,bm]=b.data.worldDate.split('.').map(Number);
  return ay-by||am-bm||a.data.worldSeq-b.data.worldSeq;
}
export function relatedWorld(pieces,id){
  const current=pieces.find(p=>p.data.worldId===id);if(!current)return [];
  const d=current.data;
  return pieces.filter(p=>p!==current && (d.worldRelated.includes(p.data.worldId+'.html')||p.data.worldRelated.includes(id+'.html')||p.data.worldArcs.some(a=>d.worldArcs.includes(a))))
    .sort((a,b)=>Number(d.worldRelated.includes(b.data.worldId+'.html'))-Number(d.worldRelated.includes(a.data.worldId+'.html'))||chronology(b,a)).slice(0,4);
}

export function dossierRecords(pieces,file){
  const seed=new Set(file.seedRecords||[]);
  return pieces.filter(p=>seed.has(p.data.worldId)||(p.data.worldDossiers||[]).includes(file.id)).sort(chronology);
}

export function validateDossiers(pieces,currentFiles,provisionNumbers){
  const validArcs=new Set(currentFiles.map(f=>f.id));
  const ids=new Set(pieces.map(p=>p.data.worldId));
  for(const p of pieces){
    for(const arc of p.data.worldArcs)if(!validArcs.has(arc))throw Error(`Unknown arc ${arc}: ${p.inputPath}`);
    for(const dossier of (p.data.worldDossiers||[])){
      if(!validArcs.has(dossier))throw Error(`Unknown dossier ${dossier}: ${p.inputPath}`);
      if(!p.data.worldArcs.includes(dossier))throw Error(`Dossier ${dossier} must also appear in worldArcs: ${p.inputPath}`);
    }
  }
  for(const file of currentFiles){
    if(!Array.isArray(file.seedRecords))throw Error(`Missing briefing seedRecords: ${file.id}`);
    if(!dossierRecords(pieces,file).length)throw Error(`Empty briefing timeline: ${file.id}`);
    for(const id of (file.seedRecords||[]))if(!ids.has(id))throw Error(`Missing briefing seed record ${id}`);
    for(const ref of file.provisions)if(!provisionNumbers.has(ref))throw Error(`Missing briefing provision ${ref}`);
  }
}

export function worldNewest(pieces){
  return pieces.length ? [...pieces].sort(chronology).at(-1).data.worldDate : null;
}
