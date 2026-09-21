import fs from 'node:fs';
import {loadScenarios} from '../lib/scenarios.mjs';
const diagram=fs.readFileSync('diagrams.html','utf8');
export default { scenarios:loadScenarios().count,
 diagrams:[...diagram.matchAll(/class="dcard(?: dcard-active)?" data-tab=/g)].length,
 questions:9 };
