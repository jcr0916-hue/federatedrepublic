// Test infrastructure only. No release entrypoint or public administrative API.
import { build } from 'esbuild';
await build({entryPoints:['acceptance/current-hosted-validation.ts'],outfile:'dist/current-hosted-validation.js',bundle:true,
  format:'esm',platform:'neutral',target:'es2023',external:['cloudflare:workers']});
