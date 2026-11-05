// Install only on the original writing checkout, never automatically during a build.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const { values } = parseArgs({ options: { 'content-dir': { type: 'string' }, 'wsl-distro': { type: 'string' } } });
if (!values['content-dir']) throw new Error('Pass --content-dir with the ORIGINAL writing directory.');
if (process.env.CI) throw new Error('Do not register CI checkouts.');
const root = fs.realpathSync(values['content-dir']);
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
const hookPath = path.resolve(root, git('rev-parse', '--git-path', 'hooks/pre-commit'));
const marker = '# chichieh-content-date-hook';
if (fs.existsSync(hookPath) && !fs.readFileSync(hookPath, 'utf8').includes(marker)) {
  throw new Error(`Existing pre-commit hook at ${hookPath}; integrate explicitly instead of overwriting it.`);
}
const quote = value => `'${value.replaceAll("'", "'\\''")}'`;
const script = fileURLToPath(new URL('./content-dates.mjs', import.meta.url));
let bridge = '';
if (values['wsl-distro']) {
  const distro = values['wsl-distro'];
  const wsl = '/mnt/c/Windows/System32/wsl.exe';
  execFileSync(wsl, ['-d', distro, '--exec', process.execPath, '--version'], { stdio: 'ignore' });
  execFileSync(wsl, ['-d', distro, '--exec', 'test', '-f', script]);
  const windowsRoot = execFileSync('wslpath', ['-m', root], { encoding: 'utf8' }).trim();
  bridge = `elif command -v wsl.exe >/dev/null 2>&1; then
  [ "$content_root" = ${quote(windowsRoot)} ] || exit 0
  # Preserve Git's alternate index (e.g. git commit --only) across the WSL boundary.
  index_win=$(cygpath -w "$(git rev-parse --git-path index)") || exit 1
  index_wsl=$(MSYS_NO_PATHCONV=1 MSYS2_ARG_CONV_EXCL='*' wsl.exe -d ${quote(distro)} --exec wslpath -u "$index_win") || exit 1
  export MSYS_NO_PATHCONV=1 MSYS2_ARG_CONV_EXCL='*'
  exec wsl.exe -d ${quote(distro)} --exec env GIT_INDEX_FILE="$index_wsl" ${quote(process.execPath)} ${quote(script)} --staged --write --content-dir ${quote(root)}
`;
}
const hook = `#!/bin/sh
${marker}
content_root=$(git rev-parse --show-toplevel) || exit 1
if [ -x ${quote(process.execPath)} ]; then
  [ "$content_root" = ${quote(root)} ] || exit 0
  exec ${quote(process.execPath)} ${quote(script)} --staged --write --content-dir ${quote(root)}
${bridge}else
  echo 'Article date capture is unavailable. Restore the configured Node/WSL installation.' >&2
  exit 1
fi
`;
fs.mkdirSync(path.dirname(hookPath), { recursive: true });
fs.writeFileSync(hookPath, hook, { mode: 0o755 });
fs.chmodSync(hookPath, 0o755);
git('config', '--local', 'contentDates.trustedRoot', root);
console.log(`Registered original writing directory: ${root}\nInstalled: ${hookPath}`);
