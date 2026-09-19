import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { collect, references, localURL } from './public-assets.mjs';

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'fr-assets-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const write = (name, text = 'image bytes') => {
    const file = path.join(root, name);
    fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, text);
  };
  write('scripts/protected-assets.json', '{"assets":["fallback.jpg"]}');
  write('images/fallback.jpg');
  return { root, write };
}

test('HTML attributes, entities, srcset, CSS imports, fallbacks, social images and script HTML', () => {
  const refs = references(`<link href=site.css><img src="one%20two.png?v=1&amp;x=2"
    srcset="small.webp 1x, big.webp 2x" onerror="this.src='fallback.jpg'">
    <meta property="og:image" content="https://thefederatedrepublic.org/social.png">
    <style>/* url(archive-master.png) */ @import "extra.css"; p{background:url(unquoted.png)}</style>
    <script>const html = '<img src="nav.png">'; const escaped = 'escaped\\u002epng';</script>`, 'index.html');
  for (const ref of ['site.css', 'one%20two.png?v=1&x=2', 'small.webp', 'big.webp', 'fallback.jpg', 'https://thefederatedrepublic.org/social.png', 'extra.css', 'unquoted.png', 'nav.png', 'escaped.png']) assert.ok(refs.includes(ref), ref);
  assert.ok(!refs.includes('archive-master.png'));
  assert.deepEqual(references('<img srcset="data:image/png;base64,AAAA 1x, retina.png 2x">', 'index.html'), ['data:image/png;base64,AAAA', 'retina.png']);
  assert.equal(localURL('../one%20two.png?x=1#hash', 'css/site.css'), 'one two.png');
  assert.equal(localURL('https://elsewhere.org/image.png', 'index.html'), null);
  assert.equal(localURL('data:image/png;base64,AAA', 'index.html'), null);
});

test('graph follows CSS/JSON/JS/SVG, expands generated filenames and ignores internal docs', t => {
  const { root, write } = fixture(t);
  write('_site/index.html', '<link href="css/site.css"><script src="app.js"></script><img src="logos/brand.svg">');
  write('_site/css/site.css', '@import "extra.css"; p{background:url(../one%20two.png?v=3)}');
  write('_site/css/extra.css', 'p{background:url(../css-only.webp)}');
  write('_site/app.js', 'fetch("data.json"); const a = `flag-${state}.png`; const b = "portrait-" + person + ".webp"; const c = "logos/" + "extra.svg";');
  write('_site/data.json', '{"nested":[{"image":"data-only.png"}]}');
  write('logos/brand.svg', '<svg><image href="../svg-only.png"/></svg>');
  write('logos/extra.svg', '<svg/>');
  for (const name of ['one two.png','css-only.webp','data-only.png','svg-only.png','flag-a.png','flag-b.png','portrait-a.webp','frontmatter.webp','unused-master.png']) write('images/' + name);
  write('docs/archive/note.html', '<img src="unused-master.png">');
  const wanted = collect({ root, metadata: [{ url: '/index.html', values: ['frontmatter.webp'] }] });
  for (const name of ['one two.png','css-only.webp','data-only.png','svg-only.png','flag-a.png','flag-b.png','portrait-a.webp','frontmatter.webp','fallback.jpg','logos/extra.svg']) assert.ok(wanted.has(name), name);
  assert.ok(!fs.existsSync(path.join(root, '_site/unused-master.png')));
  assert.equal(fs.readFileSync(path.join(root, 'images/unused-master.png'), 'utf8'), 'image bytes');
  collect({ root, validateOnly: true });
  fs.rmSync(path.join(root, '_site/frontmatter.webp'));
  assert.throws(() => collect({ root, validateOnly: true }), /build manifest.*frontmatter.webp/);
  // Repeated builds prune former references from output without touching masters.
  write('_site/index.html', '<p>no images</p>');
  fs.rmSync(path.join(root, '_site/app.js')); fs.rmSync(path.join(root, '_site/data.json'));
  fs.rmSync(path.join(root, '_site/css'), { recursive: true });
  collect({ root });
  assert.ok(!fs.existsSync(path.join(root, '_site/frontmatter.webp')));
  assert.ok(fs.existsSync(path.join(root, 'images/frontmatter.webp')));
});

test('fails on missing references, missing protected assets and unresolved generated families', t => {
  const { root, write } = fixture(t);
  write('_site/index.html', '<img src="missing.png">');
  assert.throws(() => collect({ root }), /index.html.*missing.png/);
  write('_site/index.html', '<img src="fallback.jpg">');
  collect({ root });
  fs.rmSync(path.join(root, '_site/fallback.jpg'));
  assert.throws(() => collect({ root, validateOnly: true }), /protected-assets.json.*fallback.jpg/);
  write('_site/index.html', '<script>const image = `absent-${id}.png`;</script>');
  assert.throws(() => collect({ root }), /unresolved generated filename/);
  fs.rmSync(path.join(root, 'images/fallback.jpg'));
  fs.rmSync(path.join(root, '_site/fallback.jpg'));
  assert.throws(() => collect({ root }), /protected-assets.json.*fallback.jpg/);
});

test('actual Eleventy config includes front matter and data/templates but excludes docs HTML', t => {
  const { root, write } = fixture(t);
  const repo = process.cwd();
  for (const name of ['links.css','eleventy.config.mjs','lib/world.mjs','constitution_data.json','scripts/public-assets.mjs','scripts/protected-assets.json']) write(name, fs.readFileSync(path.join(repo, name)));
  write('_data/currentFiles.json', '[]');
  fs.symlinkSync(path.join(repo, 'node_modules'), path.join(root, 'node_modules'), 'dir');
  const protectedAssets = JSON.parse(fs.readFileSync(path.join(repo, 'scripts/protected-assets.json'))).assets;
  for (const name of protectedAssets) {
    const source = ['images/' + name, 'pdf/' + name, name].find(p => fs.existsSync(path.join(repo, p)));
    write(source, fs.readFileSync(path.join(repo, source)));
  }
  // The real service worker references these offline pages.
  for (const name of ['annotated','scenarios','glossary','diagrams','sources','constitutional-history','torenthia','quicksheets','atlas','survey','contact']) write(name + '.html', '<p>offline page</p>');
  write('_data/assetProbe.json', '{"nested":{"image":"data-probe.png"}}');
  write('_includes/probe.njk', '<img src="{{ assetProbe.nested.image }}">');
  write('index.html', '---\nworldImage: front-probe.webp\n---\n{% include "probe.njk" %}');
  write('docs/archive/private.html', '<img src="archive-master.png">');
  for (const name of ['front-probe.webp','data-probe.png','archive-master.png']) write('images/' + name);
  execFileSync(process.execPath, [path.join(repo, 'node_modules/@11ty/eleventy/cmd.cjs')], { cwd: root, stdio: 'pipe' });
  for (const name of ['front-probe.webp','data-probe.png']) assert.ok(fs.existsSync(path.join(root, '_site', name)), name);
  assert.ok(!fs.existsSync(path.join(root, '_site/archive-master.png')));
  assert.ok(!fs.existsSync(path.join(root, '_site/docs/archive/private.html')));
});
