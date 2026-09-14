/** Public URL graph. Source artwork is never modified or removed. */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { Parser } from 'htmlparser2';
import { parse } from 'acorn';
import { ancestor } from 'acorn-walk';

const ASSET = /\.(?:html|avif|webp|png|jpe?g|gif|svg|ico|css|m?js|json|webmanifest|pdf|woff2?|ttf|otf|mp[34]|webm|ogg|wav|txt|docx?|md)(?:[?#].*)?$/i;
const TEXT = /\.(?:html|css|m?js|json|webmanifest|svg)$/i;
const ORIGIN = 'https://thefederatedrepublic.org';
export function files(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? files(p) : e.isFile() ? [p] : [];
  });
}
export function localURL(value, base) {
  if (!value || /^(?:#|data:|blob:|mailto:|tel:|javascript:)/i.test(value)) return null;
  const url = new URL(value, new URL(base, ORIGIN + '/'));
  if (![ORIGIN, 'https://www.thefederatedrepublic.org'].includes(url.origin)) return null;
  const name = decodeURIComponent(url.pathname).replace(/^\//, '');
  if (name.split('/').includes('..') || name.includes('\\')) throw Error(`Unsafe asset URL: ${value}`);
  return name;
}

// The HTML parser handles entities, unquoted attributes and nested inline code.
// JavaScript is parsed, never executed. String HTML (nav.js) is scanned as HTML.
export function references(text, filename) {
  const refs = new Set();
  const add = (value, required = false) => {
    if (typeof value === 'string' && !/[\"'<>\n]/.test(value) && (required || ASSET.test(value.trim()))) refs.add(value.trim());
  };
  function css(code) {
    for (const m of code.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^)]*))\s*\)|@import\s+["']([^"']+)["']/gi)) add(m[1] ?? m[2] ?? m[3] ?? m[4], true);
  }
  function js(code) {
    let tree;
    try { tree = parse(code, { ecmaVersion: 'latest', sourceType: 'module', allowReturnOutsideFunction: true }); }
    catch (e) { throw Error(`Cannot inspect JavaScript in ${filename}: ${e.message}`); }
    ancestor(tree, {
      Literal(node, ancestors) {
        if (typeof node.value !== 'string') return;
        if (node.value.includes('<')) html(node.value);
        else if (!(ancestors.at(-2)?.type === 'BinaryExpression' && ancestors.at(-2)?.operator === '+')) { add(node.value); css(node.value); }
      },
      TemplateLiteral(node) {
        if (!node.expressions.length) { const value = node.quasis[0].value.cooked; add(value); if (value.includes('<')) html(value); }
        else {
          // Finite filename families are expanded against the source inventory.
          const pattern = node.quasis.map(q => q.value.cooked).join('*');
          if (ASSET.test(pattern) && !pattern.includes('<')) add(pattern);
        }
      },
      BinaryExpression(node, ancestors) {
        if (ancestors.at(-2)?.type === 'BinaryExpression' && ancestors.at(-2)?.operator === '+') return;
        if (node.operator !== '+') return;
        const pattern = n => n.type === 'Literal' && typeof n.value === 'string' ? n.value : n.type === 'BinaryExpression' && n.operator === '+' ? pattern(n.left) + pattern(n.right) : '*';
        const value = pattern(node);
        if (!value.includes('*') && value.includes('<')) html(value);
        else if (ASSET.test(value) && !/[<>\n]/.test(value)) add(value);
      }
    });
  }
  function html(code) {
    let script = null, style = false, body = '';
    const parser = new Parser({
      onopentag(tag, attrs) {
        if (tag === 'script') { script = attrs.type || 'text/javascript'; body = ''; }
        if (tag === 'style') { style = true; body = ''; }
        for (const [key, value] of Object.entries(attrs)) {
          if (key === 'style') css(value);
          else if (key.startsWith('on')) js(value);
          else if (key === 'srcset' || key === 'imagesrcset') {
            for (const candidate of value.matchAll(/(?:^|,)\s*(data:[^\s]+|[^\s,]+)(?:\s+[^,]*)?/g)) add(candidate[1], true);
          } else if (['src', 'href', 'poster', 'data', 'xlink:href'].includes(key)) add(value, true);
          else if (key === 'content' || key.startsWith('data-')) add(value);
        }
      },
      ontext(value) { if (script || style) body += value; },
      onclosetag(tag) {
        if (tag === 'script' && script) {
          if (/json/.test(script)) { try { data(JSON.parse(body)); } catch (e) { throw Error(`Invalid JSON in ${filename}: ${e.message}`); } }
          else if (['text/javascript', 'application/javascript', 'module'].includes(script) && body.trim()) js(body);
          script = null; body = '';
        }
        if (tag === 'style' && style) { css(body); style = false; body = ''; }
      }
    }, { decodeEntities: true });
    parser.end(code);
  }
  function data(value) {
    if (typeof value === 'string') { add(value); if (value.includes('<')) html(value); }
    else if (value && typeof value === 'object') Object.values(value).forEach(data);
  }
  if (/\.(html|svg)$/.test(filename)) html(text);
  else if (/\.css$/.test(filename)) css(text);
  else if (/\.(json|webmanifest)$/.test(filename)) data(JSON.parse(text));
  else if (/\.m?js$/.test(filename)) js(text);
  return [...refs];
}

export function collect({ root = process.cwd(), output = '_site', metadata = [], validateOnly = false } = {}) {
  const out = path.resolve(root, output);
  const manifest = path.join(root, '.cache/public-assets.json');
  const config = JSON.parse(fs.readFileSync(path.join(root, 'scripts/protected-assets.json'), 'utf8'));
  const inventory = new Map();
  for (const [source, destination] of [['images', ''], ['logos', 'logos'], ['pdf', '']]) {
    for (const file of files(path.join(root, source))) {
      const url = path.posix.join(destination, path.relative(path.join(root, source), file).split(path.sep).join('/'));
      if (inventory.has(url)) throw Error(`Duplicate public asset URL: ${url}`);
      inventory.set(url, file);
    }
  }
  const wanted = new Set(), scanned = new Set(), errors = [];
  function requireAsset(value, base) {
    let url;
    try { url = localURL(value, base); } catch (e) { errors.push(`${base}: ${e.message}`); return; }
    if (url === null || url.startsWith('api/')) return;
    if (!url || url.endsWith('/')) url += 'index.html';
    else if (!path.posix.extname(url) && !fs.existsSync(path.join(out, url))) url += '.html';
    if (url.includes('*')) {
      const regex = new RegExp('^' + url.split('*').map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('.*') + '$');
      const candidates = new Set([...inventory.keys(), ...files(out).map(p => path.relative(out, p).split(path.sep).join('/'))]);
      const matches = [...candidates].filter(p => regex.test(p));
      if (!matches.length) errors.push(`${base}: unresolved generated filename ${value}; declare its runtime assets in protected-assets.json`);
      matches.forEach(p => requireAsset('/' + p, base));
      return;
    }
    // A suffix alone is part of a concatenated expression, not a public URL.
    if (/^\.[a-z0-9]+$/i.test(value)) return;
    wanted.add(url);
    const target = path.join(out, url);
    if (!validateOnly && inventory.has(url)) {
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.copyFileSync(inventory.get(url), target);
    }
    if (!fs.existsSync(target) || !fs.statSync(target).isFile()) { errors.push(`${base} → ${value} (missing ${url})`); return; }
    scan(target, url);
  }
  function scan(file, url) {
    if (scanned.has(url) || !TEXT.test(url)) return;
    scanned.add(url);
    for (const ref of references(fs.readFileSync(file, 'utf8'), url)) requireAsset(ref, url);
  }
  for (const url of config.assets) requireAsset('/' + url, 'protected-assets.json');
  if (validateOnly) {
    if (!fs.existsSync(manifest)) throw Error('Run npm run build first: public asset manifest is missing.');
    for (const url of JSON.parse(fs.readFileSync(manifest, 'utf8'))) requireAsset('/' + url, 'build manifest');
  }
  for (const file of files(out)) {
    const url = path.relative(out, file).split(path.sep).join('/');
    // Existing passthrough runtime JS/CSS/JSON and rendered HTML are graph roots.
    if (!inventory.has(url)) scan(file, url);
  }
  for (const { url, values } of metadata) for (const value of values) requireAsset(value, url);
  if (errors.length) throw Error('Public asset validation failed:\n' + [...new Set(errors)].join('\n'));
  if (!validateOnly) {
    // Eleventy watch/incremental builds must not retain last build's unused images.
    // Only prune known library destinations inside the generated output.
    for (const url of inventory.keys()) if (!wanted.has(url)) fs.rmSync(path.join(out, url), { force: true });
  }
  if (!validateOnly) {
    fs.mkdirSync(path.dirname(manifest), { recursive: true });
    fs.writeFileSync(manifest, JSON.stringify([...wanted].sort(), null, 2) + '\n');
  }
  console.log(`[assets] Validated ${wanted.size} referenced/protected assets; ${[...wanted].filter(p => inventory.has(p)).length}/${inventory.size} library files deployed.`);
  return wanted;
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  if (process.argv.includes('--clean')) {
    fs.rmSync(path.resolve('_site'), { recursive: true, force: true });
    fs.rmSync(path.resolve('.cache/public-assets.json'), { force: true });
  }
  else collect({ validateOnly: true });
}
