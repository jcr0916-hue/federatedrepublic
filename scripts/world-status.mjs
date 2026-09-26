import fs from 'node:fs';
import {readPublishingRecords} from '../lib/world-publishing.mjs';
import {loadWorldRegistries,validateRegistries,clockDashboard,registryWarnings} from '../lib/world-chronology.mjs';
const file='docs/WORLD-STORY-STATUS.md',records=readPublishingRecords(),registry=loadWorldRegistries();
validateRegistries(records,registry.events,registry.clocks);
let status=fs.readFileSync(file,'utf8');
if(process.argv.includes('--write')){
  const block=clockDashboard(registry.clocks),pattern=/<!-- WORLD-CLOCKS:START -->[\s\S]*?<!-- WORLD-CLOCKS:END -->/;
  status=pattern.test(status)?status.replace(pattern,block):status.replace('## Hard clocks / scheduled mechanisms','## Hard clocks / scheduled mechanisms\n\n'+block+'\n');
  fs.writeFileSync(file,status);
}
for(const warning of registryWarnings(records,registry,status))console.warn(`[world status warning] ${warning}`);
console.log('World registries validated; editorial notes remain human-owned.');
