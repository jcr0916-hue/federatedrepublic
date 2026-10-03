import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { readWorldInventory } from './world-authoring.mjs';
import { loadWorldAuthoringGuardrails } from './world-draft-validation.mjs';

const ARC_SECTIONS = {
  korda: {
    status: 'Korda Convention',
    bible: 'Korda Convention',
  },
  'lake-varda': {
    status: 'Lake Varda / Sunderland',
    bible: 'Lake Varda',
  },
  'fiscal-equalization': {
    status: 'Fiscal Equalization',
    bible: 'Fiscal Equalization',
  },
  'argent-ridge': {
    status: 'Argent Ridge',
    bible: 'Argent Ridge / Riverglow',
  },
};

function numericDate(value) {
  const m = String(value || '').match(/^(\d+)\.(\d{2})$/);
  return m ? Number(m[1]) * 100 + Number(m[2]) : -1;
}

function latestDate(items) {
  return items
    .map(x => x.data.worldDate)
    .filter(Boolean)
    .sort((a, b) => numericDate(b) - numericDate(a))[0] || 'unknown';
}

function cleanText(raw) {
  return String(raw || '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&middot;/g, '·')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&rarr;/g, '→')
    .replace(/&larr;/g, '←')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function extractSection(markdown, headingNeedle) {
  if (!headingNeedle) return '';
  const lines = String(markdown || '').split(/\r?\n/);
  const needle = headingNeedle.toLowerCase();
  let start = -1;
  let level = null;

  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^(#{2,3})\s+(.+)$/);
    if (!m) continue;
    if (m[2].toLowerCase().includes(needle)) {
      start = i;
      level = m[1].length;
      break;
    }
  }
  if (start < 0) return '';

  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    const m = lines[i].match(/^(#{2,3})\s+(.+)$/);
    if (m && m[1].length <= level) {
      end = i;
      break;
    }
  }
  return lines.slice(start, end).join('\n').trim();
}

function relevantItems(items, arc) {
  return items.filter(x => Array.isArray(x.data.worldArcs) && x.data.worldArcs.includes(arc));
}

function recentByStream(items, kind, limit) {
  const filtered = items.filter(x => kind === 'narrative'
    ? x.data.worldKind !== 'nrs' && Number.isInteger(Number(x.data.worldSeq))
    : x.data.worldKind === 'nrs' && Number.isInteger(Number(x.data.nrsSeq))
  );

  return filtered
    .sort((a, b) => kind === 'narrative'
      ? Number(b.data.worldSeq) - Number(a.data.worldSeq)
      : Number(b.data.nrsSeq) - Number(a.data.nrsSeq)
    )
    .slice(0, limit);
}

function recordExcerpt(dir, item, maxChars = 1800) {
  const raw = fs.readFileSync(path.join(dir, item.name), 'utf8');
  const parsed = matter(raw);
  const text = cleanText(parsed.content);
  return text.length > maxChars ? text.slice(0, maxChars).replace(/\s+\S*$/, '') + ' …' : text;
}

function exactProvisionSet(dir, nums) {
  const constitution = JSON.parse(fs.readFileSync(path.join(dir, 'constitution_data.json'), 'utf8'));
  const byNum = new Map(
    constitution.flatMap(article => article.provisions || []).map(p => [p.num, p])
  );
  return [...nums].map(num => byNum.get(num)).filter(Boolean);
}

export function buildWorldContextPacket({ arc, dir='.', recentNarrative=3, recentNrs=3 }) {
  if (!arc) throw new Error('arc is required');
  const items = readWorldInventory(dir);
  const relevant = relevantItems(items, arc);
  if (!relevant.length) throw new Error(`No published World records found for arc: ${arc}`);

  const maxWorldSeq = Math.max(0, ...items.map(x => Number(x.data.worldSeq)).filter(Number.isInteger));
  const maxNrsSeq = Math.max(0, ...items.map(x => Number(x.data.nrsSeq)).filter(Number.isInteger));
  const recentNews = recentByStream(relevant, 'narrative', recentNarrative);
  const recentRecords = recentByStream(relevant, 'nrs', recentNrs);

  const authoringGuardrails = loadWorldAuthoringGuardrails(dir).filter(g => g.active && g.arc === arc);
  const clocks = JSON.parse(fs.readFileSync(path.join(dir, '_data/worldClocks.json'), 'utf8'))
    .filter(clock => Array.isArray(clock.arcs) && clock.arcs.includes(arc));
  const chronology = JSON.parse(fs.readFileSync(path.join(dir, '_data/worldChronology.json'), 'utf8'))
    .filter(entry => Array.isArray(entry.arcs) && entry.arcs.includes(arc));

  const sectionMap = ARC_SECTIONS[arc] || {};
  const statusDoc = fs.readFileSync(path.join(dir, 'docs/WORLD-STORY-STATUS.md'), 'utf8');
  const bibleDoc = fs.readFileSync(path.join(dir, 'docs/WORLD-STORY-BIBLE.md'), 'utf8');
  const statusSection = extractSection(statusDoc, sectionMap.status || arc);
  const bibleSection = extractSection(bibleDoc, sectionMap.bible || arc);

  const provisionNums = new Set();
  [...recentNews, ...recentRecords].forEach(item => {
    (item.data.worldProvisions || []).forEach(num => provisionNums.add(num));
  });
  clocks.forEach(clock => (clock.provisions || []).forEach(num => provisionNums.add(num)));
  const provisions = exactProvisionSet(dir, provisionNums);

  const parts = [
    'TORENTHIA AUTHORING SOURCE PACKET',
    'Generated deterministically from current repository sources.',
    '',
    'SOURCE HIERARCHY / USE RULE',
    'Published World records and constitutional text are canonical. WORLD-STORY-BIBLE contains durable canon and established setting facts. WORLD-STORY-STATUS is an operational editorial handoff and may contain planning-only material; anything labeled planning, internal direction, open, proposed, or not published must not be presented as established canon. Clocks and chronology constrain timing. Do not invent a day, deadline, outcome, character fact, or institutional act that these sources do not establish.',
    '',
    'CURRENT FRONTIER',
    `Latest fictional month in World inventory: ${latestDate(items)}`,
    `Narrative worldSeq frontier: ${maxWorldSeq}`,
    `NRS nrsSeq frontier: ${maxNrsSeq}`,
    `Target arc: ${arc}`,
    '',
    'STILL-OPEN CANON GUARDRAILS',
    authoringGuardrails.length
      ? authoringGuardrails.map(g => `- [${g.id}] ${g.note} ${g.resolutionInstruction}`).join('\n')
      : '(none)',
    '',
    'ACTIVE / RELEVANT CLOCKS',
    clocks.length ? clocks.map(c => `- ${c.title} [${c.status}]: ${c.summary} Next: ${c.nextAction}`).join('\n') : '(none)',
    '',
    'STRUCTURED CHRONOLOGY FOR THIS ARC',
    chronology.length ? chronology.map(e => `- ${e.id}: ${JSON.stringify(e.date)} — ${e.note}`).join('\n') : '(none)',
    '',
    'DURABLE CANON EXCERPT — WORLD-STORY-BIBLE',
    bibleSection || '(no mapped section found)',
    '',
    'CURRENT EDITORIAL STATUS / GUARDRAILS — WORLD-STORY-STATUS',
    statusSection || '(no mapped section found)',
    '',
    'RECENT RELEVANT NARRATIVE RECORDS',
  ];

  if (recentNews.length) {
    for (const item of recentNews) {
      parts.push(
        `[${item.name}] seq ${item.data.worldSeq} · ${item.data.worldDate} · ${item.data.worldTitle}`,
        `Blurb: ${item.data.worldBlurb || ''}`,
        `Excerpt: ${recordExcerpt(dir, item)}`,
        ''
      );
    }
  } else parts.push('(none)', '');

  parts.push('RECENT RELEVANT NRS RECORDS');
  if (recentRecords.length) {
    for (const item of recentRecords) {
      parts.push(
        `[${item.name}] nrsSeq ${item.data.nrsSeq} · ${item.data.nrsId || ''} · ${item.data.worldDate} · ${item.data.worldTitle}`,
        `Blurb: ${item.data.worldBlurb || ''}`,
        `Excerpt: ${recordExcerpt(dir, item)}`,
        ''
      );
    }
  } else parts.push('(none)', '');

  parts.push('EXACT CONSTITUTIONAL TEXT REFERENCED BY RECENT ARC MATERIAL');
  if (provisions.length) {
    for (const p of provisions) parts.push(`[${p.num}] ${p.name}: ${p.text}`, '');
  } else parts.push('(none)', '');

  parts.push(
    'AUTHORING RULE',
    'Use this packet to establish what is already true, what remains open, and what is safe to advance. A new piece may advance the story only where the editorial-status section permits it, and any advance must remain consistent with the canonical records, clocks, durable canon, and constitutional text above.'
  );

  return {
    arc,
    frontier: { worldDate: latestDate(items), worldSeq: maxWorldSeq, nrsSeq: maxNrsSeq },
    recentNarrative: recentNews.map(x => x.name),
    recentNrs: recentRecords.map(x => x.name),
    packet: parts.join('\n').trim(),
  };
}

export { extractSection, cleanText };
