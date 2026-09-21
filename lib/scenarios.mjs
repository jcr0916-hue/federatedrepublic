import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import {parseDocument, DomUtils} from 'htmlparser2';

const definitions = JSON.parse(fs.readFileSync(new URL('./scenario-categories.json', import.meta.url), 'utf8'));
const hasClass = (node, name) => (node.attribs?.class || '').split(/\s+/).includes(name);
const plain = node => DomUtils.textContent(node).replace(/\s+/g, ' ').trim();

// Array order in the category config and optional per-page order preserve editorial placement.
// Unordered new stories sort after ordered stories, deterministically by filename.
export function loadScenarios(root = '.') {
  const categories = definitions.map(category => ({...category, entries: []}));
  const byId = new Map(categories.map(category => [category.id, category]));
  const entries = fs.readdirSync(root).filter(file => /^scenario-.*\.html$/.test(file)).sort().map(href => {
    const {data, content} = matter(fs.readFileSync(path.join(root, href), 'utf8'));
    const category = byId.get(data.scenarioCategory);
    const fail = message => { throw new Error(`${href}: ${message}`); };
    if (!category) fail('missing or unknown scenarioCategory');
    if (data.scenarioOrder !== undefined && (!Number.isInteger(data.scenarioOrder) || data.scenarioOrder < 0)) fail('scenarioOrder must be a nonnegative integer');
    if (data.scenarioStart !== undefined && typeof data.scenarioStart !== 'boolean') fail('scenarioStart must be boolean');
    const doc = parseDocument(content.replace(/{%[\s\S]*?%}/g, ''));
    for (const node of DomUtils.findAll(n => ['script', 'style'].includes(n.name), doc.children)) DomUtils.removeElement(node);
    const main = DomUtils.findOne(n => n.name === 'main', doc.children, true)
      || DomUtils.findOne(n => n.name === 'body', doc.children, true);
    if (!main) fail('missing main content');
    const titleNode = DomUtils.findOne(n => hasClass(n, 'scenario-title'), main.children, true)
      || DomUtils.findOne(n => n.name === 'h1', main.children, true);
    const subtitle = DomUtils.findOne(n => hasClass(n, 'scenario-subtitle'), main.children, true);
    const meta = DomUtils.findOne(n => n.name === 'meta' && n.attribs.name === 'description', doc.children, true);
    const title = titleNode && plain(titleNode);
    const desc = subtitle ? plain(subtitle) : meta?.attribs.content?.trim();
    if (!title || !desc) fail('missing title or subtitle/description');
    // Separate text nodes so adjacent paragraphs do not merge into a single word.
    const textOf = node => node.type === 'text' ? node.data : (node.children || []).map(textOf).join(' ');
    const text = textOf(main);
    const refs = [...new Set(text.match(/§\d+\.\d+(?:\.[a-z])?/g) || [])];
    const entry = {href, title, desc, refs, minutes: Math.max(1, Math.ceil(text.trim().split(/\s+/).length / 220)),
      category: category.id, order: data.scenarioOrder ?? Number.MAX_SAFE_INTEGER, start: data.scenarioStart === true};
    category.entries.push(entry);
    return entry;
  });
  for (const category of categories) category.entries.sort((a, b) => a.order - b.order || a.href.localeCompare(b.href));
  const start = entries.filter(entry => entry.start);
  if (start.length > 1) throw new Error('Only one scenario may have scenarioStart: true');
  const bridges = Object.fromEntries(entries.map(entry => [entry.href.replace(/\.html$/, ''), {summary: entry.desc, provisions: entry.refs.slice(0, 4).map(ref => ({ref, label: 'Constitutional provision'})), links: []}]));
  return {categories, entries, start, bridges, count: entries.length, provisionCount: new Set(entries.flatMap(entry => entry.refs)).size};
}
