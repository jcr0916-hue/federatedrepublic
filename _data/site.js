import fs from 'node:fs';
const pages=fs.readdirSync('.');
const diagram=fs.readFileSync('diagrams.html','utf8');
export default { scenarios:pages.filter(p=>/^scenario-.*\.html$/.test(p)).length,
 diagrams:[...diagram.matchAll(/class="dcard(?: dcard-active)?" data-tab=/g)].length,
 questions:9 };
