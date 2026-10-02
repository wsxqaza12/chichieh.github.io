// 寄電子報：新文章上站後，找出還沒寄過的文章，先寄預覽給自己，到 GitHub 核准後寄給訂閱者。
// 由 .github/workflows/newsletter.yml 執行：
//   node scripts/newsletter.mjs plan --site <gh-pages 目錄> --out plan.json [--retry-pending]
//        找出 RSS 裡還沒記錄過的文章；第一次執行時把現有文章全部記成 baseline（不寄）
//   node scripts/newsletter.mjs preview plan.json   寄預覽給 NEWSLETTER_PREVIEW_TO
//   node scripts/newsletter.mjs send plan.json      寄給訂閱者；可以重跑，寄過的人會跳過
//   node scripts/newsletter.mjs stats               訂閱人數
// 環境變數：NEWSLETTER_ADMIN_TOKEN（必要）、NEWSLETTER_AWS_ACCESS_KEY_ID / NEWSLETTER_AWS_SECRET_ACCESS_KEY（寄信）、
//           NEWSLETTER_PREVIEW_TO（預覽收件人）
// 這個 repo 是公開的，Actions 的 log 誰都看得到：不印出訂閱者的 Email。
import fs from 'node:fs';
import path from 'node:path';
import { sendEmail, fromHeader } from '../newsletter/src/ses.js';
import { issueEmail, senderName, SITE, FROM_ADDRESS } from '../newsletter/src/mail.js';

const API = process.env.NEWSLETTER_API ?? `${SITE}/api/newsletter`;
const CONFIG_SET = 'chichieh-newsletter';
const MAX_NEW = 5; // 一次冒出超過這麼多篇，多半是網址改了，不自動寄
const [cmd, ...args] = process.argv.slice(2);
const opt = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const mask = (email) => email.replace(/^(.).*?(@.*)$/, '$1***$2');
const aws = () => ({ accessKeyId: process.env.NEWSLETTER_AWS_ACCESS_KEY_ID, secretAccessKey: process.env.NEWSLETTER_AWS_SECRET_ACCESS_KEY, region: 'ap-northeast-1', endpoint: process.env.NEWSLETTER_SES_ENDPOINT || undefined });
const output = (k, v) => process.env.GITHUB_OUTPUT && fs.appendFileSync(process.env.GITHUB_OUTPUT, `${k}=${v}\n`);
const summary = (md) => { console.log(md); if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, md + '\n'); };

async function api(p, body) {
  const res = await fetch(API + p, {
    method: body ? 'POST' : 'GET',
    headers: { authorization: `Bearer ${process.env.NEWSLETTER_ADMIN_TOKEN}`, ...(body ? { 'content-type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${p}: ${res.status} ${(await res.text()).slice(0, 200)}`);
  return res.json();
}

// ── RSS ─────────────────────────────────────────────────────────────

const ENTITIES = { lt: '<', gt: '>', quot: '"', apos: "'", amp: '&' };
const decode = (s) =>
  s.replace(/^<!\[CDATA\[([\s\S]*)\]\]>$/, '$1').replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) =>
    e[0] === '#' ? String.fromCodePoint(e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)) : ENTITIES[e.toLowerCase()] ?? m
  );
export function parseRss(xml, lang) {
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]
    .map(([, item]) => {
      const tag = (t) => decode((item.match(new RegExp(`<${t}>([\\s\\S]*?)</${t}>`)) ?? [, ''])[1].trim());
      return { url: tag('link'), lang, title: tag('title'), description: tag('description') };
    })
    .filter((i) => i.url.startsWith(SITE));
}

async function feeds(site) {
  const read = async (rel) => (site ? fs.readFileSync(path.join(site, rel), 'utf8') : (await fetch(`${SITE}/${rel}`)).text());
  return [...parseRss(await read('rss.xml'), 'zh'), ...parseRss(await read('en/rss.xml'), 'en')];
}

// 等文章真的上站（Cloudflare Pages 在 gh-pages 更新後還要一兩分鐘），順便拿分享卡片當信裡的圖
async function live(url) {
  for (let i = 0; i < 40; i++) {
    const res = await fetch(url, { headers: { 'cache-control': 'no-cache' } }).catch(() => null);
    if (res?.ok) {
      const html = await res.text();
      const image = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1];
      return image ? new URL(image, SITE).href : undefined;
    }
    await sleep(15_000);
  }
  throw new Error(`${url} is not live after 10 minutes`);
}

// ── 指令 ─────────────────────────────────────────────────────────────

async function plan() {
  const items = await feeds(opt('--site'));
  const { issues } = await api('/admin/issues');
  let fresh = [];
  if (!issues.length) {
    // 第一次：現有文章都記成 baseline，電子報從下一篇開始寄
    await api('/admin/issues', { items: items.map((i) => ({ ...i, status: 'baseline' })) });
    summary(`### Newsletter\nFirst run: recorded ${items.length} existing essays as baseline. Nothing sent.`);
  } else {
    const known = new Map(issues.map((i) => [i.url, i.status]));
    fresh = items.filter((i) => !known.has(i.url) || (args.includes('--retry-pending') && known.get(i.url) === 'pending'));
    if (fresh.length > MAX_NEW) {
      await api('/admin/issues', { items: fresh.map((i) => ({ ...i, status: 'skipped' })) });
      summary(`### Newsletter\n⚠️ ${fresh.length} new items at once (URL change?). Marked as skipped, nothing sent.`);
      fresh = [];
    }
    for (const i of fresh) i.image = await live(i.url);
    // 先記成 pending：核准時按 Reject，這幾篇就不會在下次部署又被提出來
    if (fresh.length) await api('/admin/issues', { items: fresh.map((i) => ({ ...i, status: 'pending' })) });
    summary(`### Newsletter\n${fresh.length ? fresh.map((i) => `- ${i.lang === 'en' ? 'EN' : '中文'} · [${i.title}](${i.url})`).join('\n') : 'No new essays.'}`);
  }
  fs.writeFileSync(opt('--out') ?? 'plan.json', JSON.stringify(fresh, null, 2));
  output('count', fresh.length);
}

const activeCount = (stats, lang) => stats.subscribers.filter((r) => r.lang === lang && r.status === 'active').reduce((n, r) => n + r.n, 0);

async function preview(file) {
  const to = process.env.NEWSLETTER_PREVIEW_TO;
  if (!to) return console.log('NEWSLETTER_PREVIEW_TO not set, no preview sent');
  const stats = await api('/admin/stats');
  const run = process.env.GITHUB_RUN_ID ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}` : null;
  for (const i of JSON.parse(fs.readFileSync(file, 'utf8'))) {
    const en = i.lang === 'en';
    const n = activeCount(stats, i.lang);
    const go = run ? ` <a href="${run}" style="color:#ffffff;font-weight:600;">${en ? 'Review on GitHub →' : '到 GitHub 核准 →'}</a>` : '';
    const note = en ? `Preview. Approve the run on GitHub to send this to ${n} English subscriber${n === 1 ? '' : 's'}.${go}` : `預覽：到 GitHub 按核准後，這封信會寄給 ${n} 位中文訂閱者。${go}`;
    const mail = issueEmail({ ...i, unsubscribeUrl: `${SITE}${en ? '/en' : ''}/newsletter/`, note });
    await sendEmail(aws(), { from: fromHeader(senderName(i.lang), FROM_ADDRESS), to, replyTo: FROM_ADDRESS, configurationSet: CONFIG_SET, ...mail, subject: `[${en ? 'Preview' : '預覽'}] ${mail.subject}` });
    console.log(`preview sent: ${i.title}`);
  }
}

async function send(file) {
  let failedTotal = 0;
  const lines = ['### Newsletter sent'];
  for (const i of JSON.parse(fs.readFileSync(file, 'utf8'))) {
    const { recipients } = await api(`/admin/recipients?lang=${i.lang}`);
    const done = new Set((await api(`/admin/deliveries?url=${encodeURIComponent(i.url)}`)).emails);
    let batch = [], sent = 0, failed = 0;
    const flush = async () => { if (batch.length) await api('/admin/deliveries', { url: i.url, items: batch }); batch = []; };
    for (const r of recipients.filter((r) => !done.has(r.email))) {
      const unsubscribeUrl = `${API}/unsubscribe?t=${r.token}`;
      const mail = issueEmail({ ...i, unsubscribeUrl });
      const message = {
        from: fromHeader(senderName(i.lang), FROM_ADDRESS), to: r.email, replyTo: FROM_ADDRESS, configurationSet: CONFIG_SET, ...mail,
        headers: [{ name: 'List-Unsubscribe', value: `<${unsubscribeUrl}>` }, { name: 'List-Unsubscribe-Post', value: 'List-Unsubscribe=One-Click' }],
      };
      for (let attempt = 1; ; attempt++) {
        try {
          batch.push({ email: r.email, messageId: await sendEmail(aws(), message) });
          sent++;
          break;
        } catch (err) {
          // 太快或 SES 暫時出錯：等一下再試；其他錯誤（例如地址被拒）跳過這個人
          if ((err.status === 429 || err.status >= 500) && attempt < 4) { await sleep(2000 * attempt); continue; }
          failed++;
          console.warn(`  ✗ ${mask(r.email)}: ${err.message}`);
          break;
        }
      }
      if (batch.length >= 25) await flush();
      await sleep(110); // 每秒最多約 9 封（帳號上限 14 封，留給 AILogora）
    }
    await flush();
    await api('/admin/issues', { items: [{ url: i.url, lang: i.lang, title: i.title, status: 'sent', recipients: done.size + sent }] });
    lines.push(`- ${i.title}: sent to ${sent}${done.size ? ` (+${done.size} earlier)` : ''}${failed ? `, ${failed} failed` : ''}`);
    failedTotal += failed;
  }
  summary(lines.join('\n'));
  if (failedTotal) process.exitCode = 1;
}

async function stats() {
  const s = await api('/admin/stats');
  for (const r of s.subscribers) console.log(`${r.lang} ${r.status}: ${r.n}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const run = { plan, preview: () => preview(args[0]), send: () => send(args[0]), stats }[cmd];
  if (!run) {
    console.error('usage: node scripts/newsletter.mjs plan|preview|send|stats');
    process.exit(2);
  }
  await run();
}
