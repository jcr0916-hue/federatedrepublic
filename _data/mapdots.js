// Map labels and aliases only; record ordering comes from the shared world collection.
const PLACES = {
  'norvane':    { label:'Norvane',     type:'crisis',     aliases:['Norvane'] },
  'rhondel':    { label:'Rhondel',     type:'crisis',     aliases:['Rhondel'] },
  'verentum':   { label:'Verentum',    type:'political',  aliases:['Verentum'] },
  'selvane':    { label:'Selvane',     type:'political',  aliases:['Selvane','Thoss'] },
  'corindal':   { label:'Corindal',    type:'legal',      aliases:['Corindal'] },
  'argent-ridge':{ label:'Argent Ridge', type:'legal',    aliases:['Argent Ridge','Riverglow'] },
  'korda-south':{ label:'Korda',       type:'legal',      aliases:['Korda','Varenne','Varda Crossing'] },
  'lake-varda': { label:'Lake Varda',  type:'diplomatic', aliases:['Lake Varda','Sunderland'] },
  'valedon':    { label:'Valedon',     type:'diplomatic', aliases:['Valedon'] },
  'toren-river':{ label:'Toren River', type:'diplomatic', aliases:['Toren River'] },
};
const TYPE_LABEL = { crisis:'Crisis', political:'Political', legal:'Legal', diplomatic:'Diplomatic' };

export default Object.fromEntries(Object.entries(PLACES).map(([key,p])=>[key,{...p,typeLabel:TYPE_LABEL[p.type]}]));
