import fs from 'node:fs';
import path from 'node:path';
import { files } from './public-assets.mjs';
const dir = path.resolve(process.argv[2] || '_site');
if (!fs.existsSync(dir)) throw Error(`Build output missing: ${dir}`);
const entries = files(dir).map(file => ({ file: path.relative(dir, file), bytes: fs.statSync(file).size }));
const images = entries.filter(p => /\.(?:avif|webp|png|jpe?g|gif|svg|ico)$/i.test(p.file));
const total = values => ({ files: values.length, bytes: values.reduce((sum, p) => sum + p.bytes, 0) });
console.log(JSON.stringify({ total: total(entries), images: total(images), largest: entries.sort((a, b) => b.bytes - a.bytes).slice(0, 10) }, null, 2));
