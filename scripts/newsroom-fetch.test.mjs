import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { listAll, fetchMany, select, save } from './newsroom-fetch.mjs';

const item = (n, extra = {}) => ({ id: `${n}`.padStart(8, '0') + '-aaaa', key: `submissions/korda/2026-11-2${n}/${`${n}`.padStart(8, '0')}-aaaa.json`, desk: 'korda', kind: 'article', title: `T${n}`, submittedAt: `2026-11-2${n}T16:10:00Z`, status: 'PROPOSED', ...extra });

test('listAll follows cursors; select filters by time, status and skips newsroom reports', async () => {
  const pages = [{ items: [item(1), item(2, { desk: 'desk-editor' })], more: true, cursor: 'c1' }, { items: [item(3, { status: 'ARCHIVED' }), item(4)], more: false }];
  let n = 0;
  const seen = [];
  const all = await listAll(async (url, init) => { seen.push({ url: String(url), auth: init.headers.Authorization }); return { ok: true, json: async () => pages[n++] }; }, 'https://x.test/', 'tok');
  assert.equal(all.length, 4);
  assert.match(seen[1].url, /cursor=c1/);
  assert.ok(seen.every((s) => s.auth === 'Bearer tok' && s.url.startsWith('https://x.test/api/newsroom-read?')));
  assert.deepEqual(select(all, { since: '2026-11-22T00:00:00Z', status: 'PROPOSED' }).map((i) => i.title), ['T4']);
  assert.deepEqual(select(all, {}).map((i) => i.title), ['T1', 'T3', 'T4'], 'desk-editor reports are skipped by default');
  assert.equal(select(all, { includeReports: true }).length, 4);
});

test('fetchMany batches in tens and save writes the submission and the story above the ledger', async () => {
  const keys = Array.from({ length: 12 }, (_, i) => `submissions/korda/2026-11-21/${String(i).padStart(8, '0')}-aaaa.json`);
  const calls = [];
  const got = await fetchMany(async (url) => { calls.push(new URL(url).searchParams.get('keys').split(',').length); return { ok: true, json: async () => ({ items: [], errors: [] }) }; }, 'https://x.test', 'tok', keys);
  assert.deepEqual(calls, [10, 2]);
  assert.deepEqual(got, []);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nf-'));
  const stem = save(dir, { ...item(1), body: 'The story.\n\n---\nNotes for the editor:\nLedger.' });
  assert.equal(JSON.parse(fs.readFileSync(`${stem}.json`, 'utf8')).title, 'T1');
  assert.equal(fs.readFileSync(`${stem}.story.txt`, 'utf8').trim(), 'The story.');
  fs.rmSync(dir, { recursive: true });
});
