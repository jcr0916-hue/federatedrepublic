#!/usr/bin/env node
// Builds annotation-history.json: the dated Constitutional History change-log entries
// (constitutional-history.html and constitutional-history-archive.html), keyed for the
// annotator so it can cite recorded rationale instead of saying none exists.
//
// Entries from before the May 29, 2026 article reordering use the old provision numbers
// and are left out: matching them to current numbers would attach reasons to the wrong
// provision. Sentences carrying the placeholder "529" (a lost-number artifact in the log)
// are dropped.
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const SOURCES = ['constitutional-history-archive.html', 'constitutional-history.html'];
const OUT = path.join(ROOT, 'annotation-history.json');
const CUTOFF = '2026-05-30'; // first full day after the May 29 reordering and renumbering

const MONTHS = { January:1, February:2, March:3, April:4, May:5, June:6, July:7, August:8, September:9, October:10, November:11, December:12 };

function decode(s) {
  return String(s)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;|&rsquo;/g, "'").replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/&rarr;/g, '→').replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&middot;/g, '·').replace(/&mdash;/g, '—').replace(/&ndash;/g, '–').replace(/&sect;/g, '§')
    .replace(/\s+/g, ' ').trim();
}

function parseDate(label) {
  let m = label.match(/(?:^|\s)(?:Session\s+)?(\d{2})(\d{2})(\d{2})[a-z/]*\b/);
  if (m) return `20${m[1]}-${m[2]}-${m[3]}`;
  m = label.match(/(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),\s*(20\d{2})/);
  if (m) return `${m[3]}-${String(MONTHS[m[1]]).padStart(2, '0')}-${String(m[2]).padStart(2, '0')}`;
  return null;
}

function refsIn(text) {
  const out = new Set();
  for (const r of text.match(/§\s?\d+(?:\.\d+)*(?:\.[a-z])?/g) || []) out.add(r.replace(/\s/g, ''));
  return [...out];
}

function parseFile(file) {
  const html = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const entries = [];
  for (const m of html.matchAll(/<details class="hist-entry">([\s\S]*?)<\/details>/g)) {
    const block = m[1];
    const pick = (re) => (block.match(re) || [, ''])[1];
    const label = decode(pick(/hist-tag">([\s\S]*?)<\/div>/));
    const title = decode(pick(/hist-title">([\s\S]*?)<\/h2>/));
    const body = decode(pick(/hist-body">([\s\S]*)$/));
    entries.push({ label, title, body });
  }
  return entries;
}

function clean(body) {
  return body.split(/(?<=[.!?])\s+/).filter((s) => !/\b529\b/.test(s)).join(' ').trim();
}

function build() {
  const all = [];
  let sawFirstPostReorder = false;
  for (const file of SOURCES) {
    sawFirstPostReorder = file !== SOURCES[0] ? true : false; // each file is chronological; the recent page is entirely post-reorder
    for (const e of parseFile(file)) {
      const parsed = parseDate(e.label) || parseDate(e.title);
      // A few entries carry no date in their tag; the log is chronological, so
      // they inherit the previous entry's date and are marked approximate.
      const date = parsed || (all.length ? all[all.length - 1].date : null);
      if (file === SOURCES[0]) {
        if (parsed && parsed >= CUTOFF) sawFirstPostReorder = true;
        if (!sawFirstPostReorder) continue; // undated and pre-reorder archive entries use old numbering
      }
      if (parsed && parsed < CUTOFF) continue;
      const text = clean(e.body);
      if (!text) continue;
      const refs = refsIn(`${e.label} ${e.title} ${text}`);
      all.push({ id: `h${String(all.length + 1).padStart(3, '0')}`, label: e.label, date, ...(parsed ? {} : { dateApprox: true }), title: e.title, text, refs });
    }
  }
  return { generatedFrom: SOURCES, cutoff: CUTOFF, count: all.length, entries: all };
}

function main() {
  const json = JSON.stringify(build(), null, 2) + '\n';
  if (process.argv.includes('--check')) {
    const current = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
    if (current !== json) {
      console.error('annotation-history.json is out of date. Run: npm run annotation-history (then npm run sync to refresh cached-annotation revision)');
      process.exit(1);
    }
    console.log('annotation-history.json is current.');
    return;
  }
  fs.writeFileSync(OUT, json);
  console.log(`wrote annotation-history.json (${JSON.parse(json).count} entries)`);
}

if (require.main === module) main();
module.exports = { build, parseDate, refsIn, clean };
