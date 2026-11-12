// Offline artifact builds only. No Worker deployment, account mutation or binding provisioning.
import { build } from "esbuild";
for (const [input, output] of [
  ["src/issuer-editor-candidate.ts", "dist/issuer-editor-candidate.js"],
  ["src/editor-gateway-candidate.ts", "dist/editor-gateway-candidate.js"],
  ["src/issuer-editor-discovery.ts", "dist/issuer-editor-discovery.js"],
  ["src/editor-gateway-discovery.ts", "dist/editor-gateway-discovery.js"],
]) await build({ entryPoints: [input], outfile: output,
  bundle: true, format: "esm", target: "es2023", platform: "neutral",
  mainFields: ["module", "main"], external: ["cloudflare:workers"], logLevel: "warning" });
