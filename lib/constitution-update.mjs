import fs from 'node:fs';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {isDeepStrictEqual} from 'node:util';
import {spawnSync} from 'node:child_process';
import {exists, safePath} from './ingest-files.mjs';

export function validateConstitution(data) {
  if (!Array.isArray(data) || !data.length) throw Error('Constitution must be a nonempty article array');
  if (/\b(?:TODO|TBD|FIXME|placeholder|lorem ipsum)\b/i.test(JSON.stringify(data))) throw Error('Constitution draft marker or placeholder requires human review');
  const ids = new Set();
  for (const article of data) {
    if (!article || typeof article.heading !== 'string' || !article.heading.trim() || !Array.isArray(article.provisions))
      throw Error('Every constitutional article requires a heading and provisions array');
    if (article.preamble && (typeof article.text !== 'string' || !article.text.trim())) throw Error('Preamble requires text');
    for (const item of [article,...article.provisions]) for (const key of ['draft','review','needsReview','ingestReview'])
      if (item?.[key]) throw Error(`Constitution ${key} flag requires human review`);
    for (const p of article.provisions) {
      if (!p || !/^§[1-9]\d*\.[1-9]\d*(?:\.[a-z0-9]+)*$/.test(p.num) || ids.has(p.num) ||
          typeof p.name !== 'string' || !p.name.trim() || typeof p.text !== 'string' || !p.text.trim())
        throw Error('Invalid or duplicate constitutional provision');
      ids.add(p.num);
    }
  }
  if (!ids.size) throw Error('Constitution must contain provisions');
}

export function renderConstitutionMarkdown(root, bytes) {
  // Reuse the canonical generator without writing files, even Python bytecode.
  const script = safePath(root,'scripts/build-constitution-md.py');
  const result = spawnSync('python3',['-B','-c',
    'import json,runpy,sys; m=runpy.run_path(sys.argv[1]); sys.stdout.write(m["render"](json.load(sys.stdin)))',script],
    {cwd:root,input:bytes,encoding:'utf8',maxBuffer:16*1024*1024});
  if (result.error || result.status !== 0) throw Error(`Cannot verify generated Constitution: ${result.error?.message || result.stderr}`);
  return result.stdout;
}

const inside = (parent, child) => {const r=path.relative(parent,child); return !r || (!r.startsWith('..'+path.sep) && r!=='..' && !path.isAbsolute(r));};

export function planConstitutionUpdate(root, inbox, incoming, now) {
  const canonical = fs.readFileSync(safePath(root,'constitution_data.json'));
  const oldData = JSON.parse(canonical), newData = JSON.parse(incoming);
  validateConstitution(newData);
  if (isDeepStrictEqual(oldData,newData)) return {action:'unchanged'};
  const scripts=JSON.parse(fs.readFileSync(safePath(root,'package.json'),'utf8')).scripts;
  if (!scripts?.sync || !scripts?.build) throw Error('Constitution updates require native sync and build commands');
  for (const name of ['check-consistency.py','check-constitutional-site.py']) {
    if (!fs.statSync(safePath(root,`scripts/${name}`)).isFile()) throw Error(`Missing constitutional check: ${name}`);
  }
  const markdown=fs.readFileSync(safePath(root,'docs/constitution-current.md'));
  if (!markdown.equals(Buffer.from(renderConstitutionMarkdown(root,canonical))))
    throw Error('Current generated Markdown is out of sync with canonical JSON; reconcile it before updating');
  const snapshotRoot=path.join(path.dirname(inbox),'Federated-Republic-Archive','constitution');
  if (inside(root,snapshotRoot) || inside(inbox,snapshotRoot)) throw Error('Constitution snapshot must be outside the repository and inbox');
  safePath(snapshotRoot,'');
  const date=now.toISOString().slice(2,10).replaceAll('-','');
  const names=exists(snapshotRoot)?fs.readdirSync(snapshotRoot).map(s=>s.toLowerCase()):[];
  let name=`Constitution-${date}.md`,n=1;
  while (names.includes(name.toLowerCase())) name=`Constitution-${date}-${String(n++).padStart(2,'0')}.md`;
  const snapshot=path.join(snapshotRoot,name);
  return {action:'update-constitution',canonical,markdown,snapshot};
}

export function recheckConstitutionUpdate(root, update) {
  if (!fs.readFileSync(safePath(root,'constitution_data.json')).equals(update.canonical)) throw Error('Canonical Constitution changed; preview again');
  if (!fs.readFileSync(safePath(root,'docs/constitution-current.md')).equals(update.markdown)) throw Error('Generated Constitution changed; preview again');
  safePath(path.dirname(update.snapshot),path.basename(update.snapshot));
  if (exists(update.snapshot)) throw Error('Constitution snapshot destination appeared; preview again');
}

export function replaceConstitution(root, item, result) {
  recheckConstitutionUpdate(root,item.update);
  const {snapshot,markdown}=item.update;
  fs.mkdirSync(path.dirname(snapshot),{recursive:true});
  fs.writeFileSync(snapshot,markdown,{flag:'wx'});
  if (!fs.readFileSync(snapshot).equals(markdown)) throw Error('Constitution snapshot verification failed');
  result.preserved.push(snapshot);
  // Check the authoritative pair again after preservation and before replacement.
  if (!fs.readFileSync(safePath(root,'constitution_data.json')).equals(item.update.canonical) ||
      !fs.readFileSync(safePath(root,'docs/constitution-current.md')).equals(markdown)) throw Error('Constitution changed during preservation; preview again');
  const temporary=safePath(root,`.constitution-ingest-${randomUUID()}.tmp`);
  try {
    fs.writeFileSync(temporary,item.text,{flag:'wx'});
    fs.renameSync(temporary,safePath(root,'constitution_data.json'));
  } finally {fs.rmSync(temporary,{force:true});}
}
