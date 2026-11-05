import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import matter from 'gray-matter';
import { captureDates, decideDate, eligible, taipeiDay, withDate } from '../scripts/content-dates.mjs';

const original = { raw: '# Article\n\nBody\n', birth: '2026-09-30T09:55:17Z',
  modified: '2026-10-27T16:15:46Z', firstCommit: '2026-10-12T19:00:46+08:00',
  now: Date.parse('2026-11-06T00:00:00Z') };

test('captures the original Taipei day, independent of deployment timezone', () => {
  assert.deepEqual(decideDate(original), { status: 'capture', date: '2026-09-30', reason: 'local-file-creation' });
  assert.equal(taipeiDay('2026-08-01T17:27:38Z'), '2026-08-02');
  assert.equal(taipeiDay('2026-10-27T16:16:55Z'), '2026-10-28');
});

test('explicit article dates and known publication dates take priority', () => {
  assert.equal(decideDate({ ...original, raw: "---\ndate: '2024-02-01'\n---\nbody", override: '2025-01-01' }).date, '2024-02-01');
  assert.equal(decideDate({ ...original, override: '2025-01-01' }).date, '2025-01-01');
});

test('copied, restored, missing and future timestamps require review', () => {
  assert.equal(decideDate({ ...original, firstCommit: '2026-08-11' }).reason, 'created-after-first-commit');
  assert.equal(decideDate({ ...original, modified: '2026-01-01' }).reason, 'created-after-last-modification');
  for (const birth of [null, 'invalid', '1970-01-01', '2027-01-01']) {
    assert.equal(decideDate({ ...original, birth }).status, 'review');
  }
  // Git truncates timestamps to whole seconds.
  assert.equal(decideDate({ ...original, birth: '2026-09-30T09:55:17.900Z', firstCommit: '2026-09-30T09:55:17Z' }).status, 'capture');
});

test('adds metadata without changing body, comments, BOM or CRLF; repeated runs are inert', () => {
  for (const raw of ['# A\n\ntext\n', '\uFEFF# A\r\n\r\ntext\r\n',
    '---\r\n# comment\r\ntitle: "A"\r\n---\r\n\r\nbody\r\n']) {
    const result = withDate(raw, '2026-09-30');
    assert.equal(matter(result).content, matter(raw).content);
    assert.equal(result.replace(/date: '2026-09-30'\r?\n/, ''), raw.replace(/^\uFEFF/, '').startsWith('---') ? raw : `${raw.startsWith('\uFEFF') ? '\uFEFF' : ''}---${raw.includes('\r\n') ? '\r\n' : '\n'}---${raw.includes('\r\n') ? '\r\n' : '\n'}${raw.replace(/^\uFEFF/, '')}`);
    assert.equal(withDate(result, '2026-10-01'), result);
  }
  assert.throws(() => withDate('---\ndate:\n---\nbody', '2026-09-30'), /Empty date/);
});

test('uses website inclusion rules, including drafts and excluded social variants', () => {
  assert.equal(eligible('寫過的文章/趨勢談/OpenAI商業模式.md'), true);
  assert.equal(eligible('待發表的文章/new.md'), true);
  for (const file of ['raw/notes.md', '寫過的文章/趨勢談/new_FB.md',
    '寫過的文章/雜談/The Man Who Can\'t Be Moved.md', '寫過的文章/活動/not-selected.md']) {
    assert.equal(eligible(file), false);
  }
});

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'content-dates-test-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' });
  git('init', '-q');
  git('config', 'user.email', 'test@example.invalid');
  git('config', 'user.name', 'Test');
  git('config', 'contentDates.trustedRoot', root);
  const file = '寫過的文章/趨勢談/test.md';
  fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
  fs.writeFileSync(path.join(root, file), '# Staged article\n');
  return { root, git, file };
}

test('staged capture preserves unstaged writing and survives a fresh checkout', t => {
  const { root, git, file } = fixture(t);
  git('add', '--', file);
  fs.appendFileSync(path.join(root, file), '\nUnstaged paragraph\n');
  const rows = captureDates(root, { staged: true, write: true });
  assert.equal(rows[0].status, 'capture');
  const indexed = git('show', `:${file}`);
  assert.equal(matter(indexed).content, '# Staged article\n');
  assert.equal(matter(fs.readFileSync(path.join(root, file), 'utf8')).content, '# Staged article\n\nUnstaged paragraph\n');
  assert.equal(captureDates(root, { staged: true, write: true })[0].status, 'preserved');
  git('commit', '-qm', 'Capture date');
  const clone = path.join(root, 'clone');
  git('clone', '-q', root, clone);
  assert.equal(matter(fs.readFileSync(path.join(clone, file), 'utf8')).data.date, rows[0].date);
  assert.throws(() => captureDates(clone, { write: true }));
});

test('installed hook captures during commit and protects the second index used by --only', t => {
  const { root, git, file } = fixture(t);
  execFileSync(process.execPath, ['scripts/install-content-date-hook.mjs', '--content-dir', root]);
  git('add', '--', file);
  git('commit', '-qm', 'First post');
  assert.match(git('show', `HEAD:${file}`), /date: '\d{4}-\d{2}-\d{2}'/);
  const another = '寫過的文章/趨勢談/another.md';
  fs.writeFileSync(path.join(root, another), '# Another\n');
  fs.writeFileSync(path.join(root, 'unrelated.txt'), 'leave staged\n');
  git('add', '--', another, 'unrelated.txt');
  assert.throws(() => git('commit', '-qm', 'Only article', '--only', '--', another), /dates:write/);
  assert.equal(matter(fs.readFileSync(path.join(root, another), 'utf8')).data.date, undefined);
  captureDates(root, { write: true });
  git('add', '--', another);
  git('commit', '-qm', 'Only article', '--only', '--', another);
  assert.match(git('show', `HEAD:${another}`), /date: '/);
  assert.equal(git('diff', '--cached', '--name-only').trim(), 'unrelated.txt');
});

test('renames retain the earliest history when checking suspicious creation dates', t => {
  const { root, git, file } = fixture(t);
  git('add', '--', file);
  execFileSync('git', ['commit', '-qm', 'Old original'], { cwd: root,
    env: { ...process.env, GIT_AUTHOR_DATE: '2020-01-01T00:00:00Z', GIT_COMMITTER_DATE: '2020-01-01T00:00:00Z' } });
  const next = '寫過的文章/趨勢談/renamed.md';
  git('mv', file, next);
  const result = captureDates(root, { staged: true, write: true });
  assert.equal(result[0].reason, 'created-after-first-commit');
  assert.equal(matter(git('show', `:${next}`)).data.date, undefined);
});

test('untrusted worktrees and CI cannot write checkout timestamps', t => {
  const { root, git } = fixture(t);
  git('config', 'contentDates.trustedRoot', '/somewhere-else');
  assert.throws(() => captureDates(root, { write: true }), /original writing directory/);
  git('config', 'contentDates.trustedRoot', root);
  const previous = process.env.CI;
  process.env.CI = 'true';
  try { assert.throws(() => captureDates(root, { write: true }), /CI checkout/); }
  finally { if (previous === undefined) delete process.env.CI; else process.env.CI = previous; }
});
