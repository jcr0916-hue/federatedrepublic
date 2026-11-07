import { build } from 'esbuild';
await build({
  entryPoints: ['src/index.ts'], outfile: 'dist/worker.js',
  bundle: true, format: 'esm', target: 'es2023', platform: 'neutral', mainFields: ['module', 'main'],
  external: ['cloudflare:workers'], logLevel: 'warning',
});
