// Synthetic scheduled acceptance bundle only; never a release entrypoint.
import { build } from "esbuild";
await build({ entryPoints: ["acceptance/hosted-recovery.ts"], outfile: "dist/hosted-recovery.js", bundle: true,
  format: "esm", platform: "neutral", target: "es2023", external: ["cloudflare:workers"] });
