// Local review artifact only; never provisions a Worker or attaches a bucket.
import { build } from 'esbuild';
await build({
  entryPoints: ['src/resource-candidate.ts'], outfile: 'dist/resource-candidate.js',
  bundle: true, format: 'esm', target: 'es2023', platform: 'neutral', mainFields: ['module', 'main'],
  external: ['cloudflare:workers'], logLevel: 'warning',
});
