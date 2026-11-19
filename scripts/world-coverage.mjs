#!/usr/bin/env node
// Coverage counts for the World (see lib/world-coverage.mjs).
//   npm run world:coverage             print the report
//   npm run world:coverage -- --write  write docs/torenthia/COVERAGE.md
//   --stories N / --nrs N              window sizes (default 20 stories, 40 NRS records)
import fs from "node:fs";
import matter from "gray-matter";
import { worldSourceFiles } from "../lib/world-authoring.mjs";
import { loadRegistry } from "../lib/world-registry.mjs";
import { buildCoverage, renderCoverage } from "../lib/world-coverage.mjs";

const args = process.argv.slice(2);
const num = (flag, dflt) => { const i = args.indexOf(flag); return i > -1 && Number(args[i + 1]) > 0 ? Number(args[i + 1]) : dflt; };

const records = [];
for (const { sourcePath } of worldSourceFiles(".")) {
  const parsed = matter(fs.readFileSync(sourcePath, "utf8"));
  if (!parsed.data.worldKind) continue;
  const body = parsed.content
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, " ")
    .replace(/\s+/g, " ");
  records.push({ file: sourcePath, data: parsed.data, body });
}

const md = renderCoverage(buildCoverage(records, loadRegistry(), { storyWindow: num("--stories", 20), nrsWindow: num("--nrs", 40) })) + "\n";
if (args.includes("--write")) {
  fs.writeFileSync("docs/torenthia/COVERAGE.md", md);
  console.log("wrote docs/torenthia/COVERAGE.md");
} else {
  process.stdout.write(md);
}
