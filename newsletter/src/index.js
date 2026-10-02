// 電子報的 Cloudflare Worker，掛在 chichieh-huang.com/api/newsletter/*：
//   POST /subscribe        訂閱（網站的訂閱框），寄確認信
//   GET  /confirm?t=       確認信裡的連結
//   GET  /unsubscribe?t=   信尾的取消訂閱連結 → 導到網站的確認頁（避免郵件掃描器點連結就退訂）
//   POST /unsubscribe?t=   真正退訂（確認頁的按鈕、Gmail 等的一鍵退訂）
//   POST /ses-events?key=  SES → SNS 的退信／檢舉通知
//   /admin/*               寄電子報的流程（scripts/newsletter.mjs）用，要 ADMIN_TOKEN
// 名單在 D1（binding DB），結構見 schema.sql。
import { sendEmail, fromHeader } from './ses.js';
import { confirmEmail, senderName, SITE } from './mail.js';

const BASE = '/api/newsletter';
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
const redirect = (to) => new Response(null, { status: 303, headers: { location: to, 'cache-control': 'no-store' } });
const now = () => new Date().toISOString();
const newToken = () => [...crypto.getRandomValues(new Uint8Array(24))].map((b) => b.toString(16).padStart(2, '0')).join('');
const langOf = (v) => (v === 'en' ? 'en' : 'zh');
const page = (lang, state, extra = '') => `${SITE}${lang === 'en' ? '/en' : ''}/newsletter/?s=${state}${extra}`;
const EMAIL = /^[^\s@"'<>()[\],;:\\]+@[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/;

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const path = url.pathname.replace(/\/+$/, '').slice(BASE.length);
    try {
      if (path === '/subscribe' && req.method === 'POST') return await subscribe(req, env);
      if (path === '/confirm' && req.method === 'GET') return await confirm(url, env);
      if (path === '/unsubscribe' && (req.method === 'GET' || req.method === 'POST')) return await unsubscribe(req, url, env);
      if (path === '/ses-events' && req.method === 'POST') return await sesEvents(req, url, env);
      if (path.startsWith('/admin/')) return await admin(req, url, path.slice('/admin'.length), env);
      return json({ error: 'not found' }, 404);
    } catch (err) {
      console.error(err);
      return json({ error: 'server error' }, 500);
    }
  },
};

async function readBody(req) {
  const type = req.headers.get('content-type') ?? '';
  if (type.includes('application/json')) return { form: false, data: await req.json().catch(() => ({})) };
  const text = await req.text();
  return { form: true, data: Object.fromEntries(new URLSearchParams(text)) };
}

// 網域收得到信嗎（有 MX，或至少有 A 記錄）：擋掉打錯字和亂填的地址，保護共用的 SES 寄信信譽
async function domainReceivesMail(domain) {
  for (const type of ['MX', 'A']) {
    const res = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=${type}`, { headers: { accept: 'application/dns-json' } }).catch(() => null);
    if (!res?.ok) return true; // 查不到就先放行，不因為 DNS 服務出狀況擋掉真的讀者
    const data = await res.json().catch(() => ({}));
    if (data.Status === 3) return false; // 網域不存在
    if ((data.Answer ?? []).length) return true;
  }
  return false;
}

async function subscribe(req, env) {
  const { form, data } = await readBody(req);
  const lang = langOf(data.lang);
  const reply = (state, status = 200) => (form ? redirect(page(lang, state)) : json({ ok: status < 400, state }, status));

  // 機器人：隱藏欄位被填了就假裝成功
  if (data.website) return reply('check');
  const email = String(data.email ?? '').trim().toLowerCase();
  if (email.length > 254 || !EMAIL.test(email)) return reply('invalid', 400);

  // 同一個 IP 一小時最多 8 次
  const ip = req.headers.get('cf-connecting-ip') ?? 'unknown';
  const hourAgo = Date.now() - 3600_000;
  await env.DB.prepare('DELETE FROM attempts WHERE at < ?').bind(Date.now() - 86400_000).run();
  const { n } = await env.DB.prepare('SELECT COUNT(*) AS n FROM attempts WHERE ip = ? AND at > ?').bind(ip, hourAgo).first();
  if (n >= 8) return reply('slow', 429);
  await env.DB.prepare('INSERT INTO attempts (ip, at) VALUES (?, ?)').bind(ip, Date.now()).run();

  if (!(await domainReceivesMail(email.split('@')[1]))) return reply('invalid', 400);

  const source = String(data.source ?? '').slice(0, 200);
  const row = await env.DB.prepare('SELECT * FROM subscribers WHERE email = ?').bind(email).first();
  const t = now();
  if (!row) {
    const token = newToken();
    await env.DB.prepare('INSERT INTO subscribers (email, lang, status, token, source, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)').bind(email, lang, 'pending', token, source, t, t).run();
    await sendConfirm(env, email, lang, token);
    return reply('check');
  }
  if (row.status === 'active') {
    // 已經訂閱：從另一種語言的頁面再訂一次，就當作改語言
    if (row.lang !== lang) await env.DB.prepare('UPDATE subscribers SET lang = ?, updated_at = ? WHERE email = ?').bind(lang, t, email).run();
    return reply('check');
  }
  if (row.status === 'bounced' || row.status === 'complained') return reply('check');
  // pending 或 unsubscribed：重寄確認信，但 10 分鐘內只寄一次、總共最多 5 次
  const recent = row.confirm_sent_at && Date.now() - Date.parse(row.confirm_sent_at) < 600_000;
  await env.DB.prepare("UPDATE subscribers SET lang = ?, status = 'pending', updated_at = ? WHERE email = ?").bind(lang, t, email).run();
  if (!recent && row.confirm_count < 5) await sendConfirm(env, email, lang, row.token);
  return reply('check');
}

async function sendConfirm(env, email, lang, token) {
  const mail = confirmEmail({ lang, url: `${SITE}${BASE}/confirm?t=${token}` });
  await sendEmail(aws(env), {
    from: fromHeader(senderName(lang), env.FROM_ADDRESS),
    to: email,
    replyTo: env.FROM_ADDRESS,
    configurationSet: env.CONFIGURATION_SET,
    ...mail,
  });
  await env.DB.prepare('UPDATE subscribers SET confirm_sent_at = ?, confirm_count = confirm_count + 1 WHERE email = ?').bind(now(), email).run();
}

const aws = (env) => ({ accessKeyId: env.AWS_ACCESS_KEY_ID, secretAccessKey: env.AWS_SECRET_ACCESS_KEY, region: env.SES_REGION, endpoint: env.SES_ENDPOINT || undefined });

async function confirm(url, env) {
  const token = url.searchParams.get('t') ?? '';
  const row = token && (await env.DB.prepare('SELECT * FROM subscribers WHERE token = ?').bind(token).first());
  if (!row) return redirect(page('zh', 'expired'));
  if (row.status === 'pending') {
    await env.DB.prepare("UPDATE subscribers SET status = 'active', confirmed_at = ?, updated_at = ? WHERE token = ?").bind(now(), now(), token).run();
  }
  return redirect(page(row.lang, row.status === 'pending' || row.status === 'active' ? 'confirmed' : 'expired'));
}

async function unsubscribe(req, url, env) {
  let token = url.searchParams.get('t') ?? '';
  const fromPage = url.searchParams.has('page'); // 網站確認頁的表單（瀏覽器沒開 JS 時）
  if (req.method === 'POST' && !token) token = String((await readBody(req)).data.t ?? '');
  const row = token && (await env.DB.prepare('SELECT email, lang, status FROM subscribers WHERE token = ?').bind(token).first());
  if (req.method === 'GET') return redirect(page(row?.lang ?? 'zh', row ? 'unsubscribe' : 'expired', row ? `&t=${token}` : ''));
  if (row && (row.status === 'active' || row.status === 'pending')) {
    await env.DB.prepare("UPDATE subscribers SET status = 'unsubscribed', updated_at = ? WHERE token = ?").bind(now(), token).run();
  }
  if (fromPage) return redirect(page(row?.lang ?? 'zh', row ? 'unsubscribed' : 'expired'));
  // Gmail 等的一鍵退訂（RFC 8058）只看 200；網站上的按鈕用 fetch 拿 JSON
  return json({ ok: !!row });
}

async function sesEvents(req, url, env) {
  if (!env.SES_EVENTS_KEY || url.searchParams.get('key') !== env.SES_EVENTS_KEY) return json({ error: 'forbidden' }, 403);
  const msg = JSON.parse(await req.text());
  if (msg.TopicArn !== env.SNS_TOPIC_ARN) return json({ error: 'wrong topic' }, 403);
  if (msg.Type === 'SubscriptionConfirmation') {
    const confirmUrl = new URL(msg.SubscribeURL);
    if (confirmUrl.protocol !== 'https:' || !/^sns\.[a-z0-9-]+\.amazonaws\.com$/.test(confirmUrl.hostname)) return json({ error: 'bad url' }, 400);
    const res = await fetch(confirmUrl);
    return json({ confirmed: res.ok });
  }
  if (msg.Type !== 'Notification') return json({ ok: true });
  const event = JSON.parse(msg.Message);
  const type = event.eventType ?? event.notificationType;
  let emails = [], status = null;
  if (type === 'Bounce' && event.bounce?.bounceType === 'Permanent') {
    emails = event.bounce.bouncedRecipients.map((r) => r.emailAddress);
    status = 'bounced';
  } else if (type === 'Complaint') {
    emails = event.complaint.complainedRecipients.map((r) => r.emailAddress);
    status = 'complained';
  }
  const t = now();
  for (const e of emails) {
    const email = e.trim().toLowerCase();
    if (status) await env.DB.prepare('UPDATE subscribers SET status = ?, updated_at = ? WHERE email = ?').bind(status, t, email).run();
    await env.DB.prepare('INSERT INTO events (at, type, email, detail) VALUES (?, ?, ?, ?)').bind(t, type, email, JSON.stringify(event.bounce ?? event.complaint ?? {}).slice(0, 2000)).run();
  }
  return json({ ok: true, updated: status ? emails.length : 0 });
}

// ── 給寄信流程用的管理 API ─────────────────────────────────────────

function authorized(req, env) {
  const got = req.headers.get('authorization') ?? '';
  const want = `Bearer ${env.ADMIN_TOKEN ?? ''}`;
  if (!env.ADMIN_TOKEN || got.length !== want.length) return false;
  let diff = 0;
  for (let i = 0; i < want.length; i++) diff |= got.charCodeAt(i) ^ want.charCodeAt(i);
  return diff === 0;
}

async function admin(req, url, path, env) {
  if (!authorized(req, env)) return json({ error: 'unauthorized' }, 401);
  const all = async (sql, ...args) => (await env.DB.prepare(sql).bind(...args).all()).results;

  if (path === '/stats' && req.method === 'GET') {
    return json({ subscribers: await all('SELECT lang, status, COUNT(*) AS n FROM subscribers GROUP BY lang, status') });
  }
  if (path === '/recipients' && req.method === 'GET') {
    return json({ recipients: await all("SELECT email, token FROM subscribers WHERE status = 'active' AND lang = ? ORDER BY created_at", langOf(url.searchParams.get('lang'))) });
  }
  if (path === '/issues' && req.method === 'GET') {
    return json({ issues: await all('SELECT * FROM issues ORDER BY created_at') });
  }
  if (path === '/issues' && req.method === 'POST') {
    const { items = [] } = await req.json();
    const t = now();
    const stmt = env.DB.prepare(
      `INSERT INTO issues (url, lang, title, status, recipients, created_at, sent_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
       ON CONFLICT(url) DO UPDATE SET status = excluded.status, recipients = COALESCE(excluded.recipients, issues.recipients), sent_at = COALESCE(excluded.sent_at, issues.sent_at)`
    );
    await env.DB.batch(items.map((i) => stmt.bind(i.url, langOf(i.lang), i.title ?? null, i.status, i.recipients ?? null, t, i.status === 'sent' ? t : null)));
    return json({ ok: true, count: items.length });
  }
  if (path === '/deliveries' && req.method === 'GET') {
    return json({ emails: (await all('SELECT email FROM deliveries WHERE url = ?', url.searchParams.get('url') ?? '')).map((r) => r.email) });
  }
  if (path === '/deliveries' && req.method === 'POST') {
    const { url: issue, items = [] } = await req.json();
    const stmt = env.DB.prepare('INSERT OR IGNORE INTO deliveries (url, email, message_id, at) VALUES (?, ?, ?, ?)');
    const t = now();
    if (items.length) await env.DB.batch(items.map((i) => stmt.bind(issue, i.email, i.messageId ?? null, t)));
    return json({ ok: true, count: items.length });
  }
  return json({ error: 'not found' }, 404);
}
