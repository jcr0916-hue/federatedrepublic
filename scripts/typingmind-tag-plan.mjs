import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dossiers = JSON.parse(fs.readFileSync(path.join(root, '_data/currentFiles.json'), 'utf8'));
const names = Object.fromEntries(dossiers.map(d => [d.id, d.short]));
const kinds = { news: 'News', nrs: 'NRS', sc: 'Court Opinion', dispatch: 'Dispatch' };

export function classify(file, data = {}, definitions = dossiers) {
  if (file.startsWith('docs/archive/')) return ['Archive'];
  if (/^torenthia-(news|nrs|sc|dispatch)-[^/]+\.html$/.test(file)) {
    if (!kinds[data.worldKind] || !data.worldId) throw new Error(`Missing World metadata: ${file}`);
    const tags = ['World Canon', kinds[data.worldKind]];
    for (const arc of data.worldArcs || []) {
      if (!names[arc]) throw new Error(`Unknown arc ${arc}: ${file}`);
      tags.push(names[arc]);
    }
    for (const arc of data.worldDossiers || []) {
      if (!names[arc] || !(data.worldArcs || []).includes(arc)) throw new Error(`Invalid dossier ${arc}: ${file}`);
    }
    for (const dossier of definitions) {
      if ((dossier.seedRecords || []).includes(data.worldId) || (data.worldDossiers || []).includes(dossier.id)) tags.push(`${dossier.short} Core`);
    }
    return [...new Set(tags)];
  }
  if (/\.(png|webp|jpe?g|svg|ico)$/i.test(file)) return ['Media Assets'];
  if (file.startsWith('State Constitutions/') || /^(?:docs\/)?constitution(?:al-quickref|-current)\.md$/.test(file) || file === 'pdf/constitution-current.pdf' || /^(annotated|constitution-print)\.html$/.test(file) || /^(?:pdf\/)?quicksheets?(?:-.*)?\.(html|pdf)$/.test(file)) return ['Constitution'];
  if (/^scenario(?:s|-.*)\.html$/.test(file)) return ['Scenarios'];
  if (file === 'crossroads.html' || file === 'korda-crossroads.json' || file === '_data/crossroads.json') return ['Crossroads Non-canon'];
  if (/^(?:dossier-|torenthia-state-|territory-).*\.html$/.test(file) || /^(?:torenthia(?:-atlas|-record)?|atlas|before-the-republic)\.html$/.test(file) || /^docs\/WORLD-STORY-(BIBLE|STATUS)\.md$/.test(file) || file.startsWith('docs/world/')) return ['World Reference'];
  if (file.startsWith('docs/')) return ['Project Operations'];
  if (file.endsWith('.html')) return ['Website Pages'];
  return ['Website Code'];
}

export function buildPlan(files) {
  const counts = new Map();
  for (const file of files) counts.set(path.basename(file), (counts.get(path.basename(file)) || 0) + 1);
  return files.map(file => {
    const data = /^torenthia-(news|nrs|sc|dispatch)-/.test(file) ? matter(fs.readFileSync(path.join(root, file), 'utf8')).data : {};
    return { path: file, name: path.basename(file), tags: classify(file, data), requiresPathCheck: counts.get(path.basename(file)) > 1 };
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const files = execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean);
  const plan = buildPlan(files);
  process.stdout.write(JSON.stringify({ schemaVersion: 1, mode: 'additive-review-plan', note: 'This generates a plan only; it does not update TypingMind. Confirm the source path for duplicate names. Review before applying.', documents: plan }, null, 2) + '\n');
}
