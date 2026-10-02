// 電子報的信件版型：訂閱確認信、新文章通知。顏色取自網站的日間地形圖（信件一律用淺色，深色模式交給郵件軟體）。
// Worker（確認信）和 scripts/newsletter.mjs（新文章）共用。
export const SITE = 'https://chichieh-huang.com';
export const FROM_ADDRESS = 'hi@chichieh-huang.com';
export const senderName = (lang) => (lang === 'en' ? 'ChiChieh Huang' : '黃琪婕 ChiChieh Huang');

const C = { ground: '#EDEEE6', paper: '#F6F6F1', ink: '#1B231E', body: '#2A322C', ink2: '#58655C', ink3: '#86907F', line: '#CFD2C4', trail: '#C2461A' };
// 字型名稱用單引號：這些字串會放進 style="…" 屬性裡
const SANS = `'Noto Sans TC','PingFang TC','Microsoft JhengHei',-apple-system,'Segoe UI',Helvetica,Arial,sans-serif`;
const MONO = `'SFMono-Regular',Menlo,Consolas,'Liberation Mono',monospace`;
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function layout({ lang, preheader, label, body, footer, note }) {
  return `<!doctype html>
<html lang="${lang === 'en' ? 'en' : 'zh-Hant'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"><title>${esc(preheader)}</title></head>
<body style="margin:0;padding:0;background:${C.ground};-webkit-text-size-adjust:100%;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${C.ground};">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.ground};"><tr><td align="center" style="padding:32px 14px 40px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">
${note ? `<tr><td style="padding:12px 16px;margin-bottom:14px;background:${C.ink};font:14px/1.6 ${SANS};color:#ffffff;">${note}</td></tr><tr><td style="height:14px;line-height:14px;">&nbsp;</td></tr>` : ''}
<tr><td style="padding:0 2px 12px;font:500 11px/1.4 ${MONO};letter-spacing:.14em;text-transform:uppercase;color:${C.ink2};">${label}</td></tr>
<tr><td style="background:${C.paper};border:1px solid ${C.line};border-top:3px solid ${C.trail};padding:30px 30px 34px;font:16px/1.85 ${SANS};color:${C.body};">${body}</td></tr>
<tr><td style="padding:18px 2px 0;font:13px/1.75 ${SANS};color:${C.ink3};">${footer}</td></tr>
</table></td></tr></table>
</body></html>`;
}

const button = (href, text) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:26px 0 0;"><tr><td style="background:${C.trail};"><a href="${esc(href)}" style="display:inline-block;padding:13px 22px;font:500 15px/1.2 ${SANS};color:#ffffff;text-decoration:none;">${esc(text)}</a></td></tr></table>`;
const link = (href, text) => `<a href="${esc(href)}" style="color:${C.ink2};text-decoration:underline;">${esc(text)}</a>`;
const h1 = (text) => `<h1 style="margin:0 0 14px;font:500 26px/1.4 ${SANS};color:${C.ink};">${esc(text)}</h1>`;
const p = (html) => `<p style="margin:0 0 12px;">${html}</p>`;

/** 訂閱確認信 */
export function confirmEmail({ lang, url }) {
  if (lang === 'en') {
    return {
      subject: "Confirm your subscription to ChiChieh Huang's newsletter",
      html: layout({
        lang,
        preheader: 'One click and you are subscribed.',
        label: 'ChiChieh Huang · Newsletter',
        body: h1('One more step') + p("Click the button to confirm this is your address. After that, I'll email you whenever I publish a new essay.") + button(url, 'Confirm subscription') + `<p style="margin:22px 0 0;font-size:13px;color:${C.ink3};">If the button doesn't work, paste this link into your browser:<br><span style="word-break:break-all;">${esc(url)}</span></p>`,
        footer: "If you didn't sign up, just ignore this email and you won't hear from me again.",
      }),
      text: `One more step\n\nConfirm your subscription to ChiChieh Huang's newsletter:\n${url}\n\nIf you didn't sign up, just ignore this email and you won't hear from me again.\n`,
    };
  }
  return {
    subject: '請確認訂閱：黃琪婕的電子報',
    html: layout({
      lang,
      preheader: '按一下就訂閱好了。',
      label: 'ChiChieh Huang · 電子報',
      body: h1('差一步就訂閱好了') + p('按下面的按鈕，確認這個 Email 是你的。確認之後，我寫好新文章時會寄到這裡。') + button(url, '確認訂閱') + `<p style="margin:22px 0 0;font-size:13px;color:${C.ink3};">按鈕不能按的話，把這個網址貼到瀏覽器：<br><span style="word-break:break-all;">${esc(url)}</span></p>`,
      footer: '如果你沒有訂閱，忽略這封信就好，不會再收到任何信。',
    }),
    text: `差一步就訂閱好了\n\n確認訂閱黃琪婕的電子報：\n${url}\n\n如果你沒有訂閱，忽略這封信就好，不會再收到任何信。\n`,
  };
}

/** 新文章通知 */
export function issueEmail({ lang, title, description, url, image, unsubscribeUrl, note }) {
  const en = lang === 'en';
  const img = image
    ? `<a href="${esc(url)}" style="display:block;margin:0 0 24px;"><img src="${esc(image)}" width="538" alt="" style="display:block;width:100%;max-width:538px;height:auto;border:0;"></a>`
    : '';
  return {
    subject: title,
    html: layout({
      lang,
      note,
      preheader: description,
      label: en ? 'ChiChieh Huang · New essay' : 'ChiChieh Huang · 新文章',
      body: img + h1(title) + (description ? p(esc(description)) : '') + button(url, en ? 'Read the essay →' : '閱讀全文 →'),
      footer: en
        ? `You're getting this because you subscribed at chichieh-huang.com. Just reply to reach me.<br>${link(unsubscribeUrl, 'Unsubscribe')} · ${link(SITE + '/en/', 'chichieh-huang.com')}`
        : `你收到這封信，是因為你在 chichieh-huang.com 訂閱了電子報。有想法直接回信就好。<br>${link(unsubscribeUrl, '取消訂閱')} · ${link(SITE + '/', 'chichieh-huang.com')}`,
    }),
    text: `${title}\n\n${description ? description + '\n\n' : ''}${en ? 'Read the essay' : '閱讀全文'}: ${url}\n\n--\n${en ? 'Unsubscribe' : '取消訂閱'}: ${unsubscribeUrl}\n`,
  };
}
