/**
 * Shrinks the PNG files in the built site (default: _site). Source artwork in the repository is
 * never read for writing or changed: only the copies the build deployed are rewritten, at the same
 * URL and the same pixel size (the header seal is the one resize, see SEAL below).
 *
 * Large PNGs are re-encoded as palette PNGs. An output is kept only when it is at least 15% smaller
 * AND measurably faithful (PSNR on the image flattened over white); otherwise the original stays.
 * Palette PNGs are never re-encoded, so running it twice changes nothing. A missing or broken image library only warns: an optimization
 * must never block a deploy.
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const MIN_BYTES = 100 * 1024;      // smaller files are not worth touching
export const MIN_GAIN = 0.15;             // keep a result only if it saves at least this much
export const MIN_PSNR = 38;               // dB, flattened over white; below this the original stays
// The header logo shows at 32 px on about 500 pages and at 300 px (600 px on retina) on two. A 640 px
// copy covers both, so the 1024 px master is not shipped to readers.
export const SEAL = { name: 'seal.png', width: 640 };
const SKIP = /^(?:favicon|apple-touch-icon)/i;

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : e.isFile() ? [p] : [];
  });
}

export function psnr(a, b) {
  if (a.length !== b.length) return 0;
  let sum = 0;
  for (let i = 0; i < a.length; i++) { const d = a[i] - b[i]; sum += d * d; }
  const mse = sum / a.length;
  return mse === 0 ? 99 : 10 * Math.log10((255 * 255) / mse);
}

async function flat(sharp, input, width) {
  let img = sharp(input).flatten({ background: '#ffffff' }).removeAlpha();
  if (width) img = img.resize({ width, withoutEnlargement: true });
  return img.raw().toBuffer({ resolveWithObject: true });
}

export async function optimizeFile(sharp, file) {
  const original = fs.readFileSync(file);
  const base = path.basename(file);
  if (original.length < MIN_BYTES && base !== SEAL.name) return { file, action: 'skip', reason: 'small' };
  const meta = await sharp(original).metadata();
  // Already a palette PNG (flat flags, or a file this script wrote): re-quantizing would only add loss.
  if (meta.isPalette || meta.paletteBitDepth) return { file, action: 'skip', reason: 'already palette' };
  const isSeal = base === SEAL.name && meta.width > SEAL.width;
  let pipeline = sharp(original);
  if (isSeal) pipeline = pipeline.resize({ width: SEAL.width });
  const out = await pipeline.png({ palette: true, quality: 85, effort: 10, compressionLevel: 9, dither: 1 }).toBuffer();
  const a = await flat(sharp, original, isSeal ? SEAL.width : 0);
  const b = await flat(sharp, out, 0);
  if (a.info.width !== b.info.width || a.info.height !== b.info.height) return { file, action: 'skip', reason: 'size-mismatch' };
  const score = psnr(a.data, b.data);
  if (score < MIN_PSNR) return { file, action: 'skip', reason: `quality ${score.toFixed(1)} dB` };
  if (out.length > original.length * (1 - MIN_GAIN)) return { file, action: 'skip', reason: 'small-gain' };
  fs.writeFileSync(file, out);
  return { file, action: 'optimized', before: original.length, after: out.length, psnr: score };
}

export async function optimizeDir(dir = '_site', { log = console.log } = {}) {
  let sharp;
  try { sharp = (await import('sharp')).default; }
  catch (e) { log(`optimize-site-images: image library unavailable (${e.code || e.message}); built images left as they are`); return { results: [], skipped: true }; }
  const results = [];
  for (const file of walk(dir).filter(f => /\.png$/i.test(f) && !SKIP.test(path.basename(f)))) {
    try { results.push(await optimizeFile(sharp, file)); }
    catch (e) { results.push({ file, action: 'skip', reason: `error: ${e.message}` }); }
  }
  const done = results.filter(r => r.action === 'optimized');
  const before = done.reduce((n, r) => n + r.before, 0), after = done.reduce((n, r) => n + r.after, 0);
  log(`optimize-site-images: ${done.length} of ${results.length} PNGs rewritten, ${(before / 1048576).toFixed(1)} MB -> ${(after / 1048576).toFixed(1)} MB in ${dir}`);
  for (const r of results.filter(r => r.action === 'skip' && !/small$/.test(r.reason))) log(`  kept original: ${path.relative(dir, r.file)} (${r.reason})`);
  return { results, skipped: false };
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  await optimizeDir(process.argv[2] || '_site');
}
