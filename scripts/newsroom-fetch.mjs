// Pull newsroom inbox filings into local files through the read-only endpoint (api/newsroom-read.js).
// For the Central Editor's shell: it needs NEWSROOM_READ_TOKEN in the environment.
//
//   node scripts/newsroom-fetch.mjs --out <dir> [--since <ISO time>] [--desk <id>] [--status PROPOSED] [--include-reports]
//   node scripts/newsroom-fetch.mjs --out <dir> --key <submission key> [--key <another>]
//
// Writes <dir>/<desk>/<date>-<id8>.json (the full submission) and, for stories, <id8>.story.txt (the
// body above the notes ledger, ready for scripts/newsroom-edits.mjs). Prints one line per filing.
// NEWSROOM_READ_URL overrides the base (default https://thefederatedrepublic.org).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = 'https://thefederatedrepublic.org';

// The story itself: the body above the "Notes for the editor" ledger, without HTML paragraph tags.
export function storyOf(item) {
  let body = String(item.body || '');
  const cut = body.search(/^\s*-{3,}\s*\n\s*Notes for the editor/im);
  if (cut >= 0) body = body.slice(0, cut);
  return body.replace(/<\/p>/gi, '\n\n').replace(/<[^>]+>/g, ' ').replace(/[ \t]+/g, ' ').trim();
}

export async function api(fetchImpl, base, token, params) {
  const url = `${base.replace(/\/$/, '')}/api/newsroom-read?${new URLSearchParams(params)}`;
  const res = await fetchImpl(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`newsroom-read ${params.op} failed (${res.status})`);
  return res.json();
}

export async function listAll(fetchImpl, base, token, { desk } = {}) {
  const items = [];
  let cursor = '';
  for (let page = 0; page < 30; page++) {
    const data = await api(fetchImpl, base, token, { op: 'list', limit: '100', ...(desk ? { desk } : {}), ...(cursor ? { cursor } : {}) });
    items.push(...(data.items || []));
    if (!data.more || !data.cursor) break;
    cursor = data.cursor;
  }
  return items;
}

export async function fetchMany(fetchImpl, base, token, keys) {
  const out = [];
  for (let i = 0; i < keys.length; i += 10) {
    const data = await api(fetchImpl, base, token, { op: 'readmany', keys: keys.slice(i, i + 10).join(',') });
    out.push(...(data.items || []));
    for (const e of data.errors || []) console.error(`could not read ${e.key} (${e.status})`);
  }
  return out;
}

export function select(items, { since, status, includeReports }) {
  const t = since ? Date.parse(since) : 0;
  return items.filter((it) => (!status || it.status === status) && Date.parse(it.submittedAt) >= t && (includeReports || !['desk-editor', 'newsroom-run'].includes(it.desk)));
}

export function save(out, item) {
  const dir = path.join(out, item.desk);
  fs.mkdirSync(dir, { recursive: true });
  const stem = `${String(item.submittedAt).slice(0, 10)}-${String(item.id).slice(0, 8)}`;
  fs.writeFileSync(path.join(dir, `${stem}.json`), JSON.stringify(item, null, 2));
  if (item.kind === 'article') fs.writeFileSync(path.join(dir, `${stem}.story.txt`), storyOf(item) + '\n');
  return path.join(dir, stem);
}

async function main(argv) {
  const opt = (f) => { const i = argv.indexOf(f); return i >= 0 ? argv[i + 1] : null; };
  const keys = argv.flatMap((a, i) => (a === '--key' ? [argv[i + 1]] : []));
  const out = opt('--out');
  const token = process.env.NEWSROOM_READ_TOKEN;
  if (!out || !token) { console.error('usage: NEWSROOM_READ_TOKEN=… node scripts/newsroom-fetch.mjs --out <dir> [--since ISO] [--desk id] [--status S] [--include-reports] | --key <key>…'); process.exit(2); }
  const base = process.env.NEWSROOM_READ_URL || BASE;
  let wanted = keys;
  if (!keys.length) {
    const all = await listAll(fetch, base, token, { desk: opt('--desk') });
    wanted = select(all, { since: opt('--since'), status: opt('--status'), includeReports: argv.includes('--include-reports') }).map((i) => i.key);
  }
  for (const item of await fetchMany(fetch, base, token, wanted)) console.log(`${save(out, item)}  ${item.desk} · ${item.kind} · ${item.title}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) main(process.argv.slice(2)).catch((e) => { console.error(e.message); process.exit(1); });
