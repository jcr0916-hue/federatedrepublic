import stats from './stats.js';
import { readFileSync } from 'node:fs';
const labels = JSON.parse(readFileSync('tier2-labels.json', 'utf8')).states;
// Only published profiles belong here. Facts remain in the shared statistics ledger.
export default ['Harren', 'Varek', 'Norvane', 'Kelvant'].map(name => {
  const key = name.toLowerCase();
  const [x, y] = labels[name.toUpperCase()];
  return { ...stats.states.find(s => s.name === name), key,
    url: `torenthia-state-${key}.html`, left: x / 1536 * 100, top: y / 1024 * 100 };
});
