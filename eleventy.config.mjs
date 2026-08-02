// Eleventy config for The Federated Republic — Phase 4
// Proven: 37/37 news pages rebuild byte-identical (see PROOF-RESULT.md).
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
  eleventyConfig.addCollection("world", (api) =>
    api.getAll()
      .filter((p) => p.data.worldKind && p.data.worldDate)
      // worldDate is "YY.MM" as a STRING — quoted in the front matter on purpose.
      // Unquoted, YAML reads 13.09 as the float 13.09 and 13.10 as 13.1, which sorts
      // Month 10 BEFORE Month 9. String compare on zero-padded "13.09" is correct.
      //
      // TIEBREAK ON worldSeq, NOT FILENAME. worldDate is month-granular, so every piece
      // published in the same month ties. The old tiebreak was inputPath, and since
      // "news" < "nrs" alphabetically, reversing for display put EVERY nrs piece ahead of
      // EVERY news piece in the same month — which buried news-045 behind two older NRS
      // filings on both the World carousel and the Record.
      //
      // worldSeq is a global publication counter, backfilled once from git first-commit
      // order and set on every new piece thereafter. Deliberately NOT derived from git at
      // build time: hosts that shallow-clone would silently lose the history and fall back
      // to the broken alphabetical order with no visible failure.
      //
      // Files missing worldSeq sort last within their month rather than crashing the build.
      .sort((a, b) => {
        if (a.data.worldDate !== b.data.worldDate)
          return a.data.worldDate.localeCompare(b.data.worldDate);
        const as = a.data.worldSeq, bs = b.data.worldSeq;
        if (typeof as === "number" && typeof bs === "number") return as - bs;
        if (typeof as === "number") return -1;
        if (typeof bs === "number") return 1;
        return a.inputPath.localeCompare(b.inputPath);
      })
  );


  // Assets Eleventy does not template — copy through untouched.
  // If any of these is missing from _site, every page that uses it 404s.
  const passthrough = [
    "site.css", "nav.js", "map-data.js", "search-index.js", "sw.js",
    "favicon.ico", "favicon-32.png", "apple-touch-icon.png",
    "thoss-crossroads.json", "tier2-borders.json", "tier2-labels.json",
    "test-crossroads.json",
    "Flag Options", "Previous Versions Constitution DOCX",
  ];
  passthrough.forEach(p => eleventyConfig.addPassthroughCopy(p));

  // globs: every image and document format at root.
  // NOTE: *.jpg is NOT optional — torenthia-atlas.html serves world-map-tier1.webp with
  // an onerror fallback to world-map-tier1.jpg. Drop the glob and the fallback 404s, so
  // the world map vanishes on exactly the older browsers the fallback exists for.
  eleventyConfig.addPassthroughCopy({ "images": "." });
  eleventyConfig.addPassthroughCopy("logos");
  eleventyConfig.addPassthroughCopy({ "pdf": "." });
  eleventyConfig.addPassthroughCopy("*.txt");

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
