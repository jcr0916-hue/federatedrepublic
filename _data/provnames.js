// Maps § number -> provision name, derived from constitution_data.json at build time.
// Used to give diagram § references a hover tooltip (the provision's name) without hand-maintenance.
import { readFileSync } from "node:fs";
const data = JSON.parse(readFileSync("./constitution_data.json", "utf8"));
const map = {};
for (const art of data) {
  for (const p of (art.provisions || [])) {
    if (p.num && p.name) {
      // key by the anchor form: §14.1 -> s14-1
      const anchor = p.num.replace('§','s').replace(/\./g,'-');
      map[anchor] = p.name;
      map[p.num] = p.name;
    }
  }
}
export default map;
