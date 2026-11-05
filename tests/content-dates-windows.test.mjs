import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import matter from 'gray-matter';

// Optional real Windows Git -> WSL integration test; unit tests run on every OS.
const testRoot = process.env.CONTENT_DATES_WINDOWS_TEST_ROOT;
test('Windows Git hook preserves partial staging and Chinese paths', { skip: !testRoot }, t => {
  const root = fs.mkdtempSync(path.join(testRoot, '.codex-date-hook-test-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const win = execFileSync('wslpath', ['-w', root], { encoding: 'utf8' }).trim();
  const git = (...args) => execFileSync('/mnt/c/Program Files/Git/cmd/git.exe', ['-C', win, ...args],
    { encoding: 'utf8', timeout: 30000 });
  git('init', '-q');
  git('config', 'user.name', 'Date hook test');
  git('config', 'user.email', 'test@example.invalid');
  execFileSync(process.execPath, ['scripts/install-content-date-hook.mjs', '--content-dir', root,
    '--wsl-distro', 'Ubuntu-20.04']);
  const rel = '寫過的文章/趨勢談/Windows hook.md';
  fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
  fs.writeFileSync(path.join(root, rel), '# Windows Git\r\n');
  git('add', '--', rel);
  fs.appendFileSync(path.join(root, rel), '\r\nNot staged yet\r\n');
  git('commit', '-qm', 'Test Windows date capture');
  assert.match(git('show', `HEAD:${rel}`), /date: '\d{4}-\d{2}-\d{2}'/);
  assert.doesNotMatch(git('show', `HEAD:${rel}`), /Not staged/);
  assert.match(matter(fs.readFileSync(path.join(root, rel), 'utf8')).content, /Not staged yet\r\n/);
  assert.equal(git('diff', '--cached', '--name-only').trim(), '');
  git('add', '--', rel);
  git('commit', '-qm', 'Finish paragraph');
  assert.equal(git('status', '--porcelain').trim(), '');
});
