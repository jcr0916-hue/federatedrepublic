import fs from 'node:fs';
export default {labels:JSON.parse(fs.readFileSync('tier2-labels.json','utf8')),borders:JSON.parse(fs.readFileSync('tier2-borders.json','utf8'))};
