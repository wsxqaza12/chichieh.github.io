// Capture creation dates on the original writing computer, before Git loses them.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import matter from 'gray-matter';

const siteRoot = fileURLToPath(new URL('../', import.meta.url));
export const config = JSON.parse(fs.readFileSync(path.join(siteRoot, 'sync.config.json'), 'utf8'));
const git = (root, args, options = {}) => execFileSync('git', args, {
  cwd: root, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024, ...options,
});

export function eligible(relative, settings = config) {
  const file = path.posix.basename(relative);
  const source = settings.sources.find(s => s.dir === path.posix.dirname(relative));
  return Boolean(source && file.endsWith('.md') &&
    (!source.includeFiles || source.includeFiles.includes(file)) &&
    !source.excludeFiles?.includes(file) && !settings.excludeFiles?.includes(file) &&
    !settings.excludePatterns?.some(p => file.includes(p)));
}

export function taipeiDay(timestamp) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date(timestamp));
}

export function decideDate({ raw, override, birth, modified, firstCommit, now = Date.now() }) {
  const explicit = matter(raw).data.date;
  if (explicit != null) return { status: 'preserved', date: explicit, reason: 'frontmatter' };
  if (override != null) return { status: 'preserved', date: override, reason: 'dateOverride' };
  const created = Date.parse(birth);
  if (!Number.isFinite(created) || created <= 0 || created > now) {
    return { status: 'review', reason: 'missing-or-future-creation-time' };
  }
  // A later creation time usually means a copy, restore or fresh checkout.
  if (firstCommit && created > Date.parse(firstCommit) + 999) {
    return { status: 'review', reason: 'created-after-first-commit' };
  }
  if (modified && created > Date.parse(modified)) {
    return { status: 'review', reason: 'created-after-last-modification' };
  }
  return { status: 'capture', date: taipeiDay(birth), reason: 'local-file-creation' };
}

// Do not reserialize YAML or the article: preserve comments, BOM, CRLF and body bytes.
export function withDate(raw, date) {
  if (matter(raw).data.date != null) return raw;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error(`Invalid date: ${date}`);
  const bom = raw.startsWith('\uFEFF') ? '\uFEFF' : '';
  const text = raw.slice(bom.length);
  const newline = text.includes('\r\n') ? '\r\n' : '\n';
  const line = `date: '${date}'${newline}`;
  if (/^---\r?\n/.test(text)) {
    // Empty/null date keys are not silently duplicated.
    if (Object.hasOwn(matter(raw).data, 'date')) throw new Error('Empty date field needs review');
    const end = text.indexOf('\n') + 1;
    return bom + text.slice(0, end) + line + text.slice(end);
  }
  return `${bom}---${newline}${line}---${newline}${text}`;
}

export function readBirthTimes(root, files) {
  const windowsMount = process.platform === 'linux' && /^\/mnt\/[a-z]\//i.test(root);
  if (windowsMount || process.platform === 'win32') {
    const paths = files.map(file => {
      const full = path.join(root, file);
      return windowsMount ? execFileSync('wslpath', ['-w', full], { encoding: 'utf8' }).trim() : full;
    });
    const payload = Buffer.from(JSON.stringify(paths)).toString('base64');
    const script = `$ErrorActionPreference='Stop'; $ProgressPreference='SilentlyContinue'
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
$paths = ConvertFrom-Json ([System.Text.Encoding]::UTF8.GetString([Convert]::FromBase64String('${payload}')))
@($paths | ForEach-Object { $f=Get-Item -LiteralPath $_; [PSCustomObject]@{birth=$f.CreationTimeUtc.ToString('o');modified=$f.LastWriteTimeUtc.ToString('o')} }) | ConvertTo-Json -Compress`;
    const executable = windowsMount
      ? '/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe' : 'powershell.exe';
    const output = execFileSync(executable, ['-NoProfile', '-NonInteractive', '-EncodedCommand',
      Buffer.from(script, 'utf16le').toString('base64')], { encoding: 'utf8', timeout: 30000 });
    const decoded = JSON.parse(output.replace(/^\uFEFF/, ''));
    const rows = Array.isArray(decoded) ? decoded : [decoded];
    return new Map(files.map((file, i) => [file, rows[i]]));
  }
  return new Map(files.map(file => {
    const stat = fs.statSync(path.join(root, file));
    return [file, { birth: stat.birthtimeMs > 0 ? stat.birthtime.toISOString() : null,
      modified: stat.mtime.toISOString() }];
  }));
}

function firstCommit(root, file) {
  if (!git(root, ['rev-list', '--all', '--max-count=1']).trim()) return null;
  return git(root, ['log', '--follow', '--diff-filter=A', '--format=%aI', '--', file])
    .trim().split('\n').filter(Boolean).at(-1) ?? null;
}

export function stagedFiles(root) {
  const parts = git(root, ['diff', '--cached', '--name-status', '-z', '--find-renames', '--diff-filter=ACMR']).split('\0');
  const result = [];
  for (let i = 0; i < parts.length - 1;) {
    const status = parts[i++];
    const old = parts[i++];
    const file = /^[RC]/.test(status) ? parts[i++] : old;
    if (eligible(file)) result.push({ file, historyPath: old });
  }
  return result;
}

export function captureDates(root, { write = false, staged = false } = {}) {
  root = fs.realpathSync(root);
  // This local Git setting is deliberately not committed or inherited by fresh clones.
  const trusted = git(root, ['config', '--local', '--get', 'contentDates.trustedRoot'], { stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  if (process.env.CI || trusted !== root) throw new Error('Creation dates require the registered original writing directory; never a CI checkout.');
  const entries = staged ? stagedFiles(root) : config.sources.flatMap(source => {
    const directory = path.join(root, source.dir);
    if (!fs.existsSync(directory)) return [];
    return fs.readdirSync(directory).map(file => `${source.dir}/${file}`)
      .filter(file => eligible(file)).map(file => ({ file, historyPath: file }));
  });
  if (!entries.length) return [];
  const needsBirth = entries.filter(({ file }) => {
    const raw = staged ? git(root, ['show', `:${file}`]) : fs.readFileSync(path.join(root, file), 'utf8');
    return matter(raw).data.date == null && config.dateOverrides?.[path.posix.basename(file)] == null;
  }).map(e => e.file);
  // Git --only builds two separate indexes; mutating one in a hook would leave a
  // staged reversal of the date in the other. Ask for an explicit capture first.
  if (write && staged && needsBirth.length && /^next-index-/.test(path.basename(process.env.GIT_INDEX_FILE ?? ''))) {
    throw new Error('New article dates with git commit --only: run dates:write and stage the date first, or use a normal staged commit.');
  }
  const timestamps = needsBirth.length ? readBirthTimes(root, needsBirth) : new Map();
  const changes = [];
  const rows = entries.map(({ file, historyPath }) => {
    const full = path.join(root, file);
    if (!fs.lstatSync(full).isFile()) throw new Error(`Not a regular file: ${file}`);
    const workingRaw = fs.readFileSync(full, 'utf8');
    const raw = staged ? git(root, ['show', `:${file}`]) : workingRaw;
    const times = timestamps.get(file) ?? {};
    const originalCommit = timestamps.has(file) ? firstCommit(root, historyPath) : null;
    const choice = decideDate({ raw, override: config.dateOverrides?.[path.posix.basename(file)],
      ...times, firstCommit: originalCommit });
    if (write && choice.status === 'capture') {
      // Partial staging is supported: only add metadata to each version independently.
      if (matter(workingRaw).data.date != null) throw new Error(`Unstaged date in ${file}; stage it first.`);
      changes.push({ file, full, workingRaw, next: withDate(workingRaw, choice.date),
        indexed: staged ? withDate(raw, choice.date) : null });
    }
    return { path: file, ...choice, ...times, firstCommit: originalCommit };
  });
  // Prepare every change before touching files or the index.
  for (const change of changes) {
    if (fs.readFileSync(change.full, 'utf8') !== change.workingRaw) throw new Error(`File changed during audit: ${change.file}`);
    if (staged) {
      const mode = git(root, ['ls-files', '--stage', '--', change.file]).split(' ')[0];
      const blob = git(root, ['hash-object', '-w', '--stdin'], { input: change.indexed }).trim();
      git(root, ['update-index', '--cacheinfo', mode, blob, change.file]);
    }
    fs.writeFileSync(change.full, change.next);
  }
  return rows;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  try {
    const { values } = parseArgs({ options: {
      'content-dir': { type: 'string' }, write: { type: 'boolean' },
      staged: { type: 'boolean' }, report: { type: 'string' },
    } });
    const root = values['content-dir'] ?? process.env.CONTENT_DIR ??
      config.contentDirCandidates.map(p => path.resolve(siteRoot, p)).find(p => fs.existsSync(p));
    if (!root) throw new Error('Content repository not found');
    const rows = captureDates(root, values);
    if (values.report) fs.writeFileSync(values.report, JSON.stringify(rows, null, 2) + '\n');
    for (const row of rows.filter(r => r.status !== 'preserved')) {
      console.log(`dates: ${row.status} ${row.date ?? ''} ${row.path} (${row.reason})`);
    }
    const count = status => rows.filter(r => r.status === status).length;
    console.log(`dates: ${rows.length} files; ${count('preserved')} preserved, ${count('capture')} ${values.write ? 'captured' : 'eligible'}, ${count('review')} need review.`);
  } catch (error) {
    console.error(`dates: ${error.message}`);
    process.exitCode = 1;
  }
}
