// Map position (percent of the 1536 x 1024 base map) for each State and Territory's activity point:
// centered over its printed name, a little above it so the point never covers the lettering.
import { readFileSync } from 'node:fs';
const labels = JSON.parse(readFileSync('tier2-labels.json', 'utf8')).states;
const labelFor = name => Object.entries(labels).find(([k]) => k.replace(/ TERRITORY| \(S\)/g, '').trim() === name.toUpperCase())?.[1];
const LIFT = 30;
export default Object.fromEntries(
  ['Harren','Merath','Orath','Aldenmere','Caldenmere','Kelvant','Selvane','Arvane','Varek','Rhovane','Norvane','Corindal','Korda','Morantine','Solara','Verdmont']
    .map(name => {
      const point = labelFor(name);
      if (!point) throw new Error(`No map label for ${name}`);
      return [name, { left: +(point[0] / 1536 * 100).toFixed(2), top: +((point[1] - LIFT) / 1024 * 100).toFixed(2) }];
    })
);
