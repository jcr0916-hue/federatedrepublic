// Eleventy config for The Federated Republic — Phase 4
// Proven: 37/37 news pages rebuild byte-identical (see PROOF-RESULT.md).
import fs from "node:fs";
import path from "node:path";
import { collect } from "./scripts/public-assets.mjs";

import {validateWorld, chronology, relatedWorld} from './lib/world.mjs';

export default function (eleventyConfig) {

  // ── THE WORLD COLLECTION ──────────────────────────────────────────────────
  // Every world-content page declares itself in front matter (worldKind, worldDate,
  // worldTitle, worldOutlet, worldBlurb). Eleventy STRIPS that front matter from the
  // output — verified: all 57 pages build byte-identical to their pre-front-matter
  // originals — so the reader sees nothing and the build gains a queryable record.
  //
  // WHY THIS EXISTS: The Record and The World were hand-maintained. The World fell
  // 48 pieces and two months behind and did not know the biggest story of the year
  // had happened. A feed that restates what the pages already know will always
  // eventually lie. Derive it or delete it.
  //
  // Publishing is now: drop the file in. Nothing to remember.
  const constitutionData=JSON.parse(fs.readFileSync('constitution_data.json','utf8'));
  const provisionNumbers=new Set(constitutionData.flatMap(a=>a.provisions.map(p=>p.num)));
  const currentFiles=JSON.parse(fs.readFileSync('_data/currentFiles.json','utf8'));
  const validArcs=new Set(currentFiles.map(f=>f.id));
  eleventyConfig.addCollection("world", api => {
    const pieces=validateWorld(api.getAll().filter(p=>p.data.worldKind),provisionNumbers).sort(chronology);
    const ids=new Set(pieces.map(p=>p.data.worldId));
    for(const p of pieces)for(const arc of p.data.worldArcs)if(!validArcs.has(arc))throw Error(`Unknown arc ${arc}: ${p.inputPath}`);
    for(const file of currentFiles){
      if(!/^\d{2,}\.(0[1-9]|1[0-2])$/.test(file.asOf))throw Error(`Invalid briefing date: ${file.id}`);
      for(const id of file.records)if(!ids.has(id))throw Error(`Missing briefing record ${id}`);
      for(const ref of file.provisions)if(!provisionNumbers.has(ref))throw Error(`Missing briefing provision ${ref}`);
    }
    return pieces;
  });
  eleventyConfig.addFilter("relatedWorld", relatedWorld);
  eleventyConfig.addFilter("mapEntries", (pieces,key,dot)=>[...pieces].reverse().filter(p=>{
    if(p.data.worldMundane)return false;
    const places=String(p.data.worldPlaces || '').split(/[ ,]+/);
    const text=(p.data.worldTitle+' '+p.data.worldBlurb).toLowerCase();
    return places.includes(key) || dot.aliases.some(alias=>text.includes(alias.toLowerCase()));
  }).slice(0,3).map(p=>({url:p.url,title:p.data.worldTitle,date:p.data.worldDate})));

  eleventyConfig.addFilter("arcRecords", (pieces,arc)=>pieces.filter(p=>p.data.worldArcs.includes(arc)));
  eleventyConfig.addFilter("jurisdictionRecords", (pieces,name)=>pieces.filter(p=>p.data.worldJurisdictions.includes(name)));
  eleventyConfig.addFilter("take", (items,n)=>items.slice(0,n));
  eleventyConfig.addFilter("worldDateLabel", value=>{const [y,m]=value.split('.');return `Year ${Number(y)}, Month ${Number(m)}`;});
  eleventyConfig.addFilter("provisionAnchor", ref=>'s'+ref.slice(1).replace('.', '-').replaceAll('.',''));
  eleventyConfig.addFilter("recordById", (pieces,id)=>pieces.find(p=>p.data.worldId===id));
  eleventyConfig.addFilter("worldNewest", pieces=>pieces.at(-1)?.data.worldDate || '13.12');

  // Mundane entries remain in The Record without promotion on the World hub.
  eleventyConfig.addFilter("worldHighlights", pieces =>
    pieces.filter(piece => !piece.data.worldMundane));

  // Related State coverage follows published World content, including body mentions.
  eleventyConfig.addFilter("stateCoverage", (pieces,name)=>[...pieces].reverse().filter(p=>p.data.worldJurisdictions.includes(name)));
  eleventyConfig.addPassthroughCopy("State Constitutions/harren-state-constitution.md");
  eleventyConfig.addPassthroughCopy("State Constitutions/varek-state-constitution.md");
  eleventyConfig.addPassthroughCopy("State Constitutions/norvane-state-constitution.md");
  eleventyConfig.addPassthroughCopy("State Constitutions/kelvant-state-constitution.md");

  // Assets Eleventy does not template — copy through untouched.
  // If any of these is missing from _site, every page that uses it 404s.
  const passthrough = [
    "site.css", "links.css", "republic.css", "nav.js", "discovery.js", "related-rail.js", "map-data.js", "search-index.js", "sw.js",
    "favicon.ico", "favicon-32.png", "apple-touch-icon.png",
    "crossroads-engine.js", "korda-crossroads.json", "tier2-borders.json", "tier2-labels.json",
    "test-crossroads.json",
    "Flag Options", "Previous Versions Constitution DOCX",
  ];
  passthrough.forEach(p => eleventyConfig.addPassthroughCopy(p));

  // Only rendered public pages and their runtime dependencies select library assets.
  // Keep legacy flattened image/PDF URLs and /logos/ URLs unchanged.
  eleventyConfig.ignores.add("docs/**");
  eleventyConfig.ignores.add("scripts/**");
  eleventyConfig.addWatchTarget("images/");
  eleventyConfig.addWatchTarget("logos/");
  eleventyConfig.addWatchTarget("pdf/");
  let assetMetadata = [];
  eleventyConfig.on("eleventy.before", () => { assetMetadata = []; });
  eleventyConfig.addCollection("publicAssetMetadata", api => {
    assetMetadata = api.getAll().filter(p => p.url).map(p => ({
      url: p.url,
      // Front matter is stripped from HTML. In particular worldImage must survive
      // even when a piece is outside the currently visible feed window.
      values: Object.entries(p.data)
        .filter(([key, value]) => /(?:image|asset|icon|poster)$/i.test(key) && typeof value === "string")
        .map(([, value]) => value)
    }));
    return [];
  });
  eleventyConfig.on("eleventy.after", ({ dir }) => {
    collect({ output: dir.output, metadata: assetMetadata });
  });
  eleventyConfig.addPassthroughCopy("*.txt");

  // ---- GLOSSARY AUTO-DEFINE ----------------------------------------------
  // Wraps the FIRST occurrence of each glossary term on each page in a
  // <span class="def"> so the definition pops on hover (desktop) or tap
  // (mobile, via tabindex + :focus). Definitions live in _data/glossary.json;
  // edit there once and every page updates on the next build.
  //
  // Deliberately conservative about WHERE it will match:
  //   - never inside a tag (attributes, hrefs, class names)
  //   - never inside <a>, <script>, <style>, <code>, or an existing .def
  //   - never inside headings (h1-h4) or the page <title>
  //   - only terms with "autoMatch": true
  //   - only the first occurrence per page, so long pages don't get littered
  eleventyConfig.addTransform("glossaryDefine", function (content) {
    if (!(this.page.outputPath || "").endsWith(".html")) return content;
    // the glossary page itself defines these terms; don't self-annotate
    if ((this.page.inputPath || "").includes("glossary.html")) return content;

    let glossary;
    try {
      glossary = JSON.parse(
        fs.readFileSync(path.join(process.cwd(), "_data/glossary.json"), "utf8")
      );
    } catch { return content; }

    const terms = Object.entries(glossary)
      .filter(([, v]) => v.autoMatch && v.popup)
      .map(([slug, v]) => ({ slug, label: v.label, popup: v.popup }))
      // longest first, so "Acting Civic Consul" wins over "Civic Consul"
      .sort((a, b) => b.label.length - a.label.length);
    if (!terms.length) return content;

    // Split into segments we may touch and segments we must not.
    // Also block provision/term name labels — a heading shouldn't define itself.
    const BLOCKED = /<(script|style|code|a|h1|h2|h3|h4|title)\b[^>]*>[\s\S]*?<\/\1>|<span class="(prov-name|prov-num|term-name|sccard-title|article-headline)"[^>]*>[\s\S]*?<\/span>|<div class="(prov-label|scenario-title|article-headline|qs-scope)"[^>]*>[\s\S]*?<\/div>|<span class="def"[\s\S]*?<\/span>\s*<\/span>|<[^>]+>/gi;
    const used = new Set();

    const pieces = [];
    let last = 0, m;
    while ((m = BLOCKED.exec(content)) !== null) {
      pieces.push({ text: content.slice(last, m.index), safe: true });
      pieces.push({ text: m[0], safe: false });
      last = m.index + m[0].length;
    }
    pieces.push({ text: content.slice(last), safe: true });

    const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const escAttr = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

    for (const piece of pieces) {
      if (!piece.safe) continue;
      for (const term of terms) {
        if (used.has(term.slug)) continue;
        const re = new RegExp(`\\b(${esc(term.label)})\\b`, "i");
        if (!re.test(piece.text)) continue;
        piece.text = piece.text.replace(re, (match) =>
          `<span class="def" tabindex="0">${match}` +
          `<span class="def-pop">${escAttr(term.popup)}</span></span>`
        );
        used.add(term.slug);
      }
    }
    return pieces.map((p) => p.text).join("");
  });

  // Accessibility: visual section labels in long-form World documents become
  // semantic headings without changing their existing classes or appearance.
  eleventyConfig.addTransform("longFormSemanticHeadings", function(content) {
    if (!(this.page.outputPath || "").endsWith(".html")) return content;
    content = content.replace(/<div class="article-subhead">([\s\S]*?)<\/div>/gi, '<h2 class="article-subhead">$1</h2>');
    content = content.replace(/<div class="doc-section-label">([\s\S]*?)<\/div>/gi, '<h2 class="doc-section-label">$1</h2>');
    return content;
  });

  // Accessibility: metadata tables use their first cell as a row label.
  // Convert those labels to semantic row headers at build time across all NRS/public documents.
  eleventyConfig.addTransform("metadataTableRowHeaders", function(content) {
    if (!(this.page.outputPath || "").endsWith(".html")) return content;
    return content.replace(/(<table\b[^>]*class="[^"]*meta-table[^"]*"[^>]*>[\s\S]*?<\/table>)/gi, table => {
      let upgraded=table.replace(/<tr>([\s\S]*?)<td>([\s\S]*?)<\/td>/gi, '<tr>$1<th scope="row">$2</th>');
      if(!/<caption\b/i.test(upgraded)) upgraded=upgraded.replace(/(<table\b[^>]*>)/i,'$1<caption class="sr-only">Document metadata</caption>');
      return upgraded;
    });
  });

  // Eleventy defaults to "pretty" permalinks (page.html -> page/index.html), which would
  // break vercel.json's /(.*) -> /$1.html route on EVERY page. Force output filenames to
  // mirror the source exactly.
  eleventyConfig.addGlobalData("permalink", () => (data) => `${data.page.filePathStem}.html`);

  return {
    dir: { input: ".", output: "_site", includes: "_includes", data: "_data" },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: false,   // do NOT template the .md docs in the repo
    templateFormats: ["html"],       // ONLY html — .md arc docs stay untouched
  };
}
