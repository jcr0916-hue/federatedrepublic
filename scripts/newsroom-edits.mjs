// How much did the Central Editor change a desk's draft? Compares a desk submission with the
// published story and reports words kept, cut and added, and the number of separate edits
// (a "hunk" is one unbroken run of changed words). Only the story is compared: the draft's
// "Notes for the editor" ledger and the page's markup are left out.
//
//   node scripts/newsroom-edits.mjs --draft <submission.json|.txt> --published <news-NNN.html> [--label "news 143 · Caldenmere"]
//   node scripts/newsroom-edits.mjs --log <draft> <published> <label>  (appends a row to docs/torenthia/agents/EDIT-LOG.md)
//
// A draft file may be the inbox JSON (its "body" is used) or plain text.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ENTITIES = { '&ldquo;': '"', '&rdquo;': '"', '&lsquo;': "'", '&rsquo;': "'", '&mdash;': '—', '&ndash;': '–', '&amp;': '&', '&nbsp;': ' ', '&hellip;': '…', '&larr;': '', '&rarr;': '' };

export function decode(text) {
  return String(text)
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&[a-z]+;/gi, (m) => (m in ENTITIES ? ENTITIES[m] : ' '));
}

export function storyFromDraft(raw) {
  let body = String(raw);
  try {
    const j = JSON.parse(body);
    if (j && typeof j.body === 'string') body = j.body;
  } catch { /* plain text */ }
  const cut = body.search(/^\s*-{3,}\s*\n\s*Notes for the editor/im);
  if (cut >= 0) body = body.slice(0, cut);
  // Some desks write the story as HTML paragraphs; markdown emphasis is not part of the words either.
  body = body.replace(/<\/p>/gi, '\n\n').replace(/<[^>]+>/g, ' ').replace(/\*+/g, '');
  return body.trim();
}

export function storyFromPublished(html) {
  const m = String(html).match(/<div class="article-body">([\s\S]*?)<\/div>\s*<div class="article-nav">|<div class="article-body">([\s\S]*?)<\/div>/);
  const inner = m ? (m[1] || m[2]) : String(html);
  return decode(inner.replace(/<\/p>/gi, '\n\n').replace(/<[^>]+>/g, ' ')).replace(/[ \t]+/g, ' ').trim();
}

export function tokens(text) {
  return String(text)
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .split(/[^a-z0-9§'.-]+|(?<=\w)[.,;:!?)"]+(?=\s|$)|^["(]+/i)
    .map((t) => t.replace(/^[^a-z0-9§]+|[^a-z0-9§]+$/g, ''))
    .filter(Boolean);
}

// Longest common subsequence over words; the story is short, so the O(n·m) table is fine.
export function diff(a, b) {
  const n = a.length, m = b.length;
  const dp = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  let i = 0, j = 0, kept = 0, cut = 0, added = 0, hunks = 0, inHunk = false;
  while (i < n || j < m) {
    if (i < n && j < m && a[i] === b[j]) { kept++; i++; j++; inHunk = false; continue; }
    if (!inHunk) { hunks++; inHunk = true; }
    if (j >= m || (i < n && dp[i + 1][j] >= dp[i][j + 1])) { cut++; i++; } else { added++; j++; }
  }
  return { kept, cut, added, hunks };
}

export function editStats(draftText, publishedText) {
  const a = tokens(draftText), b = tokens(publishedText);
  const d = diff(a, b);
  const total = a.length + b.length;
  return {
    draftWords: a.length,
    publishedWords: b.length,
    ...d,
    // 0 = published exactly as filed, 1 = nothing in common.
    changed: total ? Number((1 - (2 * d.kept) / total).toFixed(3)) : 0,
  };
}

export function row(label, s) {
  return `| ${label} | ${s.draftWords} | ${s.publishedWords} | ${s.cut} | ${s.added} | ${s.hunks} | ${Math.round(s.changed * 100)}% |`;
}

const HEADER = ['| Piece | Draft words | Published words | Cut | Added | Separate edits | Changed |', '|---|---:|---:|---:|---:|---:|---:|'];

function main(argv) {
  const get = (f) => { const i = argv.indexOf(f); return i >= 0 ? argv[i + 1] : null; };
  const logIdx = argv.indexOf('--log');
  const [draftPath, pubPath, label] = logIdx >= 0 ? argv.slice(logIdx + 1) : [get('--draft'), get('--published'), get('--label')];
  if (!draftPath || !pubPath) { console.error('usage: --draft <file> --published <html> [--label text]  |  --log <draft> <published> <label>'); process.exit(2); }
  const stats = editStats(storyFromDraft(fs.readFileSync(draftPath, 'utf8')), storyFromPublished(fs.readFileSync(pubPath, 'utf8')));
  const line = row(label || path.basename(pubPath), stats);
  if (logIdx < 0) { console.log([...HEADER, line].join('\n')); return; }
  const logPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'docs/torenthia/agents/EDIT-LOG.md');
  fs.appendFileSync(logPath, line + '\n');
  console.log(line);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) main(process.argv.slice(2));
