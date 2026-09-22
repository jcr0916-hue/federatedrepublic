const ARC_RULES = {
  "korda": ["korda", "territory convention", "corridor petition", "joint committee on transition facts"],
  "lake-varda": ["lake varda", "varda crossing", "sunderland"],
  "fiscal-equalization": ["fiscal equalization", "equalization mechanism", "§12.6"],
  "argent-ridge": ["argent ridge", "national trust designation"],
};

const JURISDICTIONS = [
  "Harren","Merath","Orath","Aldenmere","Caldenmere","Kelvant","Selvane","Arvane",
  "Varek","Rhovane","Norvane","Corindal","Korda","Morantine","Solara","Verdmont"
];

const escapeRe=s=>s.replace(/[.*+?^\${}()|[\]\\]/g,"\\$&");
const count=(text,term)=>(text.match(new RegExp(escapeRe(term),"gi"))||[]).length;

export function analyzeWorldMetadata(data, bodyText="") {
  const title=String(data.worldTitle||"").toLowerCase();
  const blurb=String(data.worldBlurb||"").toLowerCase();
  const body=String(bodyText||"").toLowerCase();
  const arcs=new Set(data.worldArcs||[]);
  const jurisdictions=new Set(data.worldJurisdictions||[]);
  const provisions=new Set(data.worldProvisions||[]);
  const ignore=new Set(data.worldSignalIgnore||[]);
  const warnings=[];

  for(const [arc,terms] of Object.entries(ARC_RULES)){
    if(arcs.has(arc)||ignore.has("arc:"+arc)) continue;
    const headlineHit=terms.some(t=>title.includes(t)||blurb.includes(t));
    const bodyHits=terms.reduce((n,t)=>n+count(body,t),0);
    if(headlineHit||bodyHits>=2) warnings.push({
      kind:"arc", value:arc,
      message:`likely ${arc} coverage, but "${arc}" is missing from worldArcs`
    });
  }

  for(const name of JURISDICTIONS){
    if(jurisdictions.has(name)||ignore.has("jurisdiction:"+name)) continue;
    const term=name.toLowerCase();
    if(title.includes(term)||blurb.includes(term)||count(body,term)>=2) warnings.push({
      kind:"jurisdiction", value:name,
      message:`"${name}" appears central, but is missing from worldJurisdictions`
    });
  }

  const source=`${title} ${blurb} ${body}`;
  const refs=[...new Set(source.match(/§\d+\.\d+(?:\.[a-z])?/g)||[])];
  for(const ref of refs){
    if(provisions.has(ref)||ignore.has("provision:"+ref)) continue;
    const strong=title.includes(ref.toLowerCase())||blurb.includes(ref.toLowerCase())||count(body,ref)>=2;
    if(strong) warnings.push({
      kind:"provision", value:ref,
      message:`${ref} is materially referenced, but is missing from worldProvisions`
    });
  }
  return warnings;
}

export { ARC_RULES, JURISDICTIONS };
