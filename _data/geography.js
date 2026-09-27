import fs from 'node:fs';
export default {
  // Temporary artwork until Gaea is ready; retain the full 1536 × 1024 canvas.
  baseImage: 'region-map-tier2-temporary.webp',
  labels: JSON.parse(fs.readFileSync('tier2-labels.json', 'utf8')),
  borders: JSON.parse(fs.readFileSync('tier2-borders.json', 'utf8')),
};
