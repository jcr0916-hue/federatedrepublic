// Local artifact only. No deploy configuration, bindings or cloud operations.
import { build } from 'esbuild';
await build({
  entryPoints: ['src/issuer-candidate.ts'], outfile: 'dist/issuer-candidate.js',
  bundle: true, format: 'esm', target: 'es2023', platform: 'neutral', mainFields: ['module', 'main'],
  external: ['cloudflare:workers'], logLevel: 'warning',
});
