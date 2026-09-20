import stats from './stats.js';
import { readFileSync } from 'node:fs';
const mapLabels = JSON.parse(readFileSync('tier2-labels.json', 'utf8'));
const labels = mapLabels.states;
const capitals = {
  Harren: 'Hadrin',
  Varek: 'Kellor',
  Norvane: 'Ilyr',
  Kelvant: 'Rhondel',
};
// Only published profiles belong here. Facts remain in the shared statistics ledger.
export default ['Harren', 'Varek', 'Norvane', 'Kelvant'].map(name => {
  const key = name.toLowerCase();
  const [x, y] = labels[name.toUpperCase()];
  const capital = capitals[name];
  const [capitalX, capitalY] = mapLabels.cities[capital];
  return { ...stats.states.find(s => s.name === name), key, capital, capitalX, capitalY,
    url: `torenthia-state-${key}.html`, left: x / 1536 * 100, top: y / 1024 * 100 };
});
