#!/usr/bin/env node
import { buildWorldContextPacket } from '../lib/world-context-packet.mjs';

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith('--')) continue;
    const key = argv[i].slice(2);
    out[key] = argv[++i];
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));
if (!args.arc) {
  console.error('Usage: npm run world:packet -- --arc korda [--narrative 3] [--nrs 3]');
  process.exit(2);
}

const result = buildWorldContextPacket({
  arc: args.arc,
  recentNarrative: args.narrative ? Number(args.narrative) : 3,
  recentNrs: args.nrs ? Number(args.nrs) : 3,
});

console.log(result.packet);
