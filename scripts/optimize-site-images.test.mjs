import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { optimizeDir, optimizeFile, psnr, SEAL, MIN_BYTES } from './optimize-site-images.mjs';

// Stand-in artwork: smooth gradients posterized to a few tonal steps (under 256 distinct colors),
// stored uncompressed. Large as a truecolor PNG, and it palette-quantizes with almost no loss.
async function photoLike(width, height, seed = 1) {
  const buf = Buffer.alloc(width * height * 3);
  const step = v => Math.floor(v / 43) * 43;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const i = (y * width + x) * 3;
    buf[i] = step(((x + seed) * 255) / width);
    buf[i + 1] = step((y * 255) / height);
    buf[i + 2] = step(((x + y) * 255) / (width + height));
  }
  return sharp(buf, { raw: { width, height, channels: 3 } }).png({ compressionLevel: 0 }).toBuffer();
}

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'optimg-'));
const quiet = { log: () => {} };

test('large truecolor PNG shrinks, keeps its pixel size, and passes the quality guard', async () => {
  const dir = tmp();
  const file = path.join(dir, 'photo.png');
  fs.writeFileSync(file, await photoLike(900, 700));
  const before = fs.statSync(file).size;
  assert.ok(before > MIN_BYTES);
  const { results } = await optimizeDir(dir, quiet);
  assert.equal(results[0].action, 'optimized');
  assert.ok(fs.statSync(file).size < before * 0.85);
  const meta = await sharp(file).metadata();
  assert.deepEqual([meta.width, meta.height], [900, 700]);
  assert.ok(results[0].psnr >= 38);
});

test('running twice changes nothing (idempotent)', async () => {
  const dir = tmp();
  fs.writeFileSync(path.join(dir, 'photo.png'), await photoLike(900, 700));
  await optimizeDir(dir, quiet);
  const once = fs.readFileSync(path.join(dir, 'photo.png'));
  const second = await optimizeDir(dir, quiet);
  assert.equal(second.results.filter(r => r.action === 'optimized').length, 0);
  assert.ok(once.equals(fs.readFileSync(path.join(dir, 'photo.png'))));
});

test('small files and favicons are left alone', async () => {
  const dir = tmp();
  const small = await sharp({ create: { width: 40, height: 40, channels: 3, background: '#336699' } }).png().toBuffer();
  fs.writeFileSync(path.join(dir, 'tiny.png'), small);
  fs.writeFileSync(path.join(dir, 'favicon.png'), await photoLike(900, 700));
  const favBefore = fs.readFileSync(path.join(dir, 'favicon.png'));
  const { results } = await optimizeDir(dir, quiet);
  assert.equal(results.length, 1);
  assert.equal(results[0].reason, 'small');
  assert.ok(favBefore.equals(fs.readFileSync(path.join(dir, 'favicon.png'))));
});

test('seal.png is resized to the shipped width even though it is small', async () => {
  const dir = tmp();
  fs.writeFileSync(path.join(dir, SEAL.name), await photoLike(1024, 1024, 7));
  await optimizeDir(dir, quiet);
  const meta = await sharp(path.join(dir, SEAL.name)).metadata();
  assert.equal(meta.width, SEAL.width);
  assert.equal(meta.height, SEAL.width);
});

test('an output that fails the quality guard is discarded and the original stays', async () => {
  const dir = tmp();
  // Fine high-frequency colored noise cannot survive a 256-color palette at PSNR >= 38.
  const w = 700, h = 700, buf = Buffer.alloc(w * h * 3);
  let s = 99;
  for (let i = 0; i < buf.length; i++) { s = (s * 1664525 + 1013904223) >>> 0; buf[i] = s >>> 24; }
  const png = await sharp(buf, { raw: { width: w, height: h, channels: 3 } }).png().toBuffer();
  const file = path.join(dir, 'noise.png');
  fs.writeFileSync(file, png);
  const r = await optimizeFile(sharp, file);
  assert.equal(r.action, 'skip');
  assert.match(r.reason, /quality/);
  assert.ok(png.equals(fs.readFileSync(file)));
});

test('psnr: identical buffers score high, different sizes score zero', () => {
  assert.equal(psnr(Buffer.from([1, 2, 3]), Buffer.from([1, 2, 3])), 99);
  assert.equal(psnr(Buffer.from([1, 2]), Buffer.from([1, 2, 3])), 0);
  assert.ok(psnr(Buffer.from([0, 0, 0, 0]), Buffer.from([255, 255, 255, 255])) < 1);
});

test('a missing directory is not an error', async () => {
  const { results } = await optimizeDir(path.join(tmp(), 'nope'), quiet);
  assert.deepEqual(results, []);
});
