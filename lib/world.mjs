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
