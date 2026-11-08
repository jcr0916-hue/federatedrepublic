// Experimental read-only S3-backed MCP candidate. No deploy configuration.
import { build } from "esbuild";
await build({
  entryPoints: ["src/resource-s3-candidate.ts"], outfile: "dist/resource-s3-candidate.js",
  bundle: true, format: "esm", target: "es2023", platform: "neutral",
  mainFields: ["module", "main"], external: ["cloudflare:workers"], logLevel: "warning",
});
