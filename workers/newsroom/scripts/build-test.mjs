import { build } from 'esbuild';
await build({
  entryPoints: ['test/fixture-worker.ts'], outfile: 'dist/fixture-worker.js',
  bundle: true, format: 'esm', target: 'es2023', platform: 'neutral', mainFields: ['module', 'main'],
  external: ['cloudflare:workers'], logLevel: 'warning',
});
