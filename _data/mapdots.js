// Map dot -> relevant World entries, derived at BUILD TIME from the world collection by
// keyword-matching each place's aliases against piece titles + blurbs. Newest 3 per dot.
// Self-updating: publish a piece naming a place, it appears under that dot on next build.
// korda-north was retired (canon: no northern Korda); its storyline folds into Norvane.
import { readFileSync, readdirSync } from "node:fs";

const PLACES = {
  'norvane':    { label:'Norvane',     type:'crisis',     aliases:['Norvane'] },
  'rhondel':    { label:'Rhondel',     type:'crisis',     aliases:['Rhondel'] },
  'verentum':   { label:'Verentum',    type:'political',  aliases:['Verentum'] },
  'selvane':    { label:'Selvane',     type:'political',  aliases:['Selvane','Thoss'] },
  'corindal':   { label:'Corindal',    type:'legal',      aliases:['Corindal'] },
  'korda-south':{ label:'Korda',       type:'legal',      aliases:['Korda','Varenne','Varda Crossing'] },
  'lake-varda': { label:'Lake Varda',  type:'diplomatic', aliases:['Lake Varda','Varda'] },
  'valedon':    { label:'Valedon',     type:'diplomatic', aliases:['Valedon'] },
  'toren-river':{ label:'Toren River', type:'diplomatic', aliases:['Toren River'] },
};
const TYPE_LABEL = { crisis:'Crisis', political:'Political', legal:'Legal', diplomatic:'Diplomatic' };

function field(t, name){ const m = t.match(new RegExp(name+':\\s*"([^"]*)"')); return m ? m[1] : ''; }

const pieces = readdirSync(".")
  .filter(f => /^torenthia-(news|nrs|dispatch|sc).*\.html$/.test(f))
  .map(f => { const t = readFileSync(f,"utf8"); if(!t.startsWith('---')) return null;
    return { url:f, title:field(t,'worldTitle'), blurb:field(t,'worldBlurb'), date:field(t,'worldDate') }; })
  .filter(Boolean);

const out = {};
for (const [key, p] of Object.entries(PLACES)) {
  const hits = pieces
    .filter(pc => p.aliases.some(a => (pc.title+' '+pc.blurb).toLowerCase().includes(a.toLowerCase())))
    .sort((a,b) => b.date.localeCompare(a.date))
    .slice(0,3)
    .map(pc => ({ url:pc.url, title:pc.title, date:pc.date }));
  out[key] = { label:p.label, type:p.type, typeLabel:TYPE_LABEL[p.type], entries:hits };
}
export default out;
