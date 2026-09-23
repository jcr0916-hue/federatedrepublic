import fs from "node:fs";

const readJson=(name)=>JSON.parse(fs.readFileSync(new URL(name, import.meta.url),"utf8"));

export function loadArcRegistry(){ return readJson("./world-arcs.json"); }
export function loadCharacterRegistry(){ return readJson("./world-characters.json"); }
export function validateCharacterRegistry(entries=loadCharacterRegistry()){
  const seen=new Set();
  for(const entry of entries){
    if(!entry.name || !["world","crossroads"].includes(entry.track)) throw Error("Invalid character registry entry: "+JSON.stringify(entry));
    const key=entry.name.toLowerCase();
    if(seen.has(key)) throw Error("Duplicate character registry name: "+entry.name);
    seen.add(key);
  }
  return entries;
}
