import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import {exists, safePath} from './ingest-files.mjs';
import {fictionalDate} from './world-chronology.mjs';

export const stateTestName = /^([a-z]+)-test-(\d{2,})-([a-z0-9]+(?:-[a-z0-9]+)*)\.html$/;
export const unfinished = /\b(?:TODO|TBD|FIXME|placeholder|lorem ipsum)\b|\[\s*(?:insert|draft)\b|Draft\s+body\s*:|<!--\s*(?:draft|replace|insert)\b/im;
const plainText = value => typeof value === 'string' && value.trim().length > 0;

export function parseStateProvisions(text) {
  const provisions = {};
  let current;
  for (const line of text.split(/\r?\n/)) {
    // Only definition headings, never incidental citations in prose.
    const match = /^(?:#{1,6}\s+(?:\*\*)?|\*\*)(?:§|Section\s+)(\d+(?:\.\d+)*)(?:\.)?\s+(?:[—–-]\s*)?(.+)$/.exec(line);
    if (match) {
      const [,number, rest] = match;
      if (provisions[number]) throw Error(`Duplicate State provision definition: ${number}`);
      const [title, ...body] = rest.split('**');
      current = provisions[number] = {number, title: title.trim(), text: body.join('**').trim()};
    } else if (/^#{1,6}\s/.test(line) || line.trim() === '---') current = null;
    else if (current) current.text += '\n' + line;
  }
  for (const p of Object.values(provisions)) p.text = p.text.trim();
  return provisions;
}

export function readStateConstitutions(root='.') {
  const dir = safePath(root, 'State Constitutions');
  if (!exists(dir)) return {};
  return Object.fromEntries(fs.readdirSync(dir).sort().filter(name => /^[a-z]+-state-constitution\.md$/.test(name)).map(name => {
    const file = `State Constitutions/${name}`, source = safePath(root, file);
    if (!fs.statSync(source).isFile()) throw Error(`Not a State Constitution file: ${file}`);
    const id = name.replace('-state-constitution.md', '');
    return [id, {id, source: file, provisions: parseStateProvisions(fs.readFileSync(source, 'utf8'))}];
  }));
}

export function parseStateTest(text, inputPath) {
  if (!/^---\r?\n/.test(text)) throw Error(`${inputPath}: expected plain YAML front matter`);
  const {data, content} = matter(text);
  return {inputPath: inputPath.replace(/^\.\//, ''), data, content};
}

export function readStateTests(root='.') {
  const records = [];
  function scan(relative) {
    const dir = safePath(root, relative);
    if (!exists(dir)) return;
    for (const entry of fs.readdirSync(dir, {withFileTypes:true}).sort((a,b) => a.name.localeCompare(b.name))) {
      const file = `${relative}/${entry.name}`;
      safePath(root, file);
      if (entry.isDirectory()) scan(file);
      else if (entry.isFile() && entry.name.endsWith('.html')) records.push(parseStateTest(fs.readFileSync(path.join(root,file),'utf8'), file));
    }
  }
  scan('state-tests');
  return records;
}

export function validateStateTests(records, states) {
  const errors = [], ids = new Set(), numbers = new Set();
  for (const {inputPath, data:d, content} of records) {
    const fail = message => errors.push(`${inputPath}: ${message}`);
    const match = stateTestName.exec(path.posix.basename(inputPath));
    if (d.stateTest !== true) fail('stateTest must be true');
    if (!Object.hasOwn(states, d.state)) fail(`Unknown State: ${d.state}`);
    if (!Number.isSafeInteger(d.testNumber) || d.testNumber < 1) fail('testNumber must be a positive safe integer');
    const number = String(d.testNumber).padStart(2,'0');
    if (d.testId !== `${d.state}-test-${number}`) fail('testId must match the State/test-number convention');
    if (ids.has(d.testId)) fail(`Duplicate testId: ${d.testId}`);
    ids.add(d.testId);
    const stateNumber = `${d.state}:${d.testNumber}`;
    if (numbers.has(stateNumber)) fail(`Duplicate testNumber within State: ${stateNumber}`);
    numbers.add(stateNumber);
    if (!match || match[1] !== d.state || match[2] !== number || inputPath !== `state-tests/${d.state}/${path.posix.basename(inputPath)}`)
      fail('Filename/path State and number must match metadata: <state>-test-NN-<slug>.html');
    if (!plainText(d.title)) fail('title must be a nonblank string');
    try {
      if (typeof d.date !== 'string' || !/^\d+\.(0[1-9]|1[0-2])$/.test(d.date)) throw Error('format');
      const [year,month] = d.date.split('.').map(Number);
      fictionalDate({year,month});
    } catch { fail('date must be a quoted fictional Year.MM date, e.g. "6.09"'); }
    if (!Array.isArray(d.stateProvisions)) fail('stateProvisions must be an array');
    else for (const ref of d.stateProvisions) {
      if (typeof ref !== 'string' || !Object.hasOwn(states[d.state]?.provisions || {}, ref)) fail(`Unknown State provision: ${String(ref)}`);
    }
    if (d.status !== 'canonical-history') fail('status must be canonical-history for publication');
    for (const key of ['draft','stateTestDraft','worldDraft','ingestReview','review','needsReview']) if (d[key]) fail(`${key}: draft/review flag requires human review`);
    for (const key of ['permalink','eleventyExcludeFromCollections','eleventyComputed','layout','pagination','templateEngineOverride'])
      if (key in d) fail(`${key} requires manual review`);
    if (Object.keys(d).some(key => key.startsWith('world') || key.startsWith('nrs'))) fail('State tests must not allocate World/NRS metadata or sequences');
    if (unfinished.test(content) || unfinished.test(JSON.stringify(d))) fail('Draft marker or placeholder requires human review');
  }
  return {errors};
}

export const provisionAnchor = (state, number) => `${state}-${number.replaceAll('.','-')}`;

export function indexStateTests(records, states) {
  const {errors} = validateStateTests(records,states);
  if (errors.length) throw Error(errors.join('\n'));
  const byId = {}, byProvision = {}, entries = [];
  for (const {inputPath,data:d} of [...records].sort((a,b)=>a.data.state.localeCompare(b.data.state)||a.data.testNumber-b.data.testNumber)) {
    const entry = {...d, url:'/'+inputPath, provisions:[...new Set(d.stateProvisions)].map(number => ({
      ...states[d.state].provisions[number], anchor:provisionAnchor(d.state,number),
      url:`/state-tests.html#${provisionAnchor(d.state,number)}`
    }))};
    entries.push(entry); byId[d.testId] = entry;
    for (const p of entry.provisions) (byProvision[`${d.state}:${p.number}`] ||= []).push(entry.testId);
  }
  const indexedStates = Object.values(states).filter(s => entries.some(e => e.state===s.id)).map(s => ({
    id:s.id, source:s.source, sourceURL:`https://github.com/jcr0916-hue/federatedrepublic/blob/main/${encodeURI(s.source)}`,
    provisions:Object.values(s.provisions).filter(p=>byProvision[`${s.id}:${p.number}`]).map(p=>({
      ...p, anchor:provisionAnchor(s.id,p.number), tests:byProvision[`${s.id}:${p.number}`].map(id=>byId[id])
    }))
  }));
  return {entries, byId, byProvision, states:indexedStates};
}

export function loadStateTestIndex(root='.') {
  return indexStateTests(readStateTests(root),readStateConstitutions(root));
}

export function stateTestCitations(entry) {
  const escape = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
  return `<aside class="state-test-citations" aria-label="Cited State constitutional provisions"><h2>Cited State provisions</h2><ul>${entry.provisions.map(p=>
    `<li><a href="${escape(p.url)}">§${escape(p.number)} — ${escape(p.title)}</a></li>`).join('')}</ul><p><a href="/state-tests.html">All State historical tests</a></p></aside>`;
}
