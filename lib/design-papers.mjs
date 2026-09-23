export function validateDesignPapers(pages, provisions){
  const ids=new Set();
  for(const p of pages){
    const d=p.data;
    if(!d.paperId || ids.has(d.paperId)) throw Error("Missing/duplicate paperId: "+p.inputPath);
    ids.add(d.paperId);
    if(!d.paperTitle || !d.paperTopic || !["draft","published"].includes(d.paperStatus)) throw Error("Incomplete paper metadata: "+p.inputPath);
    if(!Array.isArray(d.paperProvisions)||!Array.isArray(d.paperRelated)) throw Error("Missing paper arrays: "+p.inputPath);
    for(const ref of d.paperProvisions) if(!provisions.has(ref)) throw Error("Unknown paper provision "+ref+": "+p.inputPath);
    if(d.paperStatus==="published" && (!d.paperSummary || !/^\d{4}-\d{2}-\d{2}$/.test(String(d.paperDate||"")))) throw Error("Published paper needs summary and YYYY-MM-DD date: "+p.inputPath);
  }
  for(const p of pages) for(const id of p.data.paperRelated) if(!ids.has(id)) throw Error("Unknown related paper "+id+": "+p.inputPath);
  return pages;
}

export function paperChronology(a,b){
  return String(b.data.paperDate||"").localeCompare(String(a.data.paperDate||"")) || String(a.data.paperTitle).localeCompare(String(b.data.paperTitle));
}
