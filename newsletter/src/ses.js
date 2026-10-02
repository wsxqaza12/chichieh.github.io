// 用 Amazon SES v2 寄一封信。自己簽 SigV4（只用 fetch 和 WebCrypto），Cloudflare Worker 和 Node（GitHub Actions）都能用。
const enc = new TextEncoder();
const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
const sha256 = async (s) => hex(await crypto.subtle.digest('SHA-256', enc.encode(s)));
async function hmac(key, s) {
  const k = await crypto.subtle.importKey('raw', typeof key === 'string' ? enc.encode(key) : key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return crypto.subtle.sign('HMAC', k, enc.encode(s));
}

// 寄件人名稱有中文時要用 RFC 2047 編碼（=?UTF-8?B?…?=）
export function fromHeader(name, address) {
  if (!name) return address;
  if (/^[\x20-\x7e]*$/.test(name)) return `"${name.replace(/["\\]/g, '')}" <${address}>`;
  const b64 = btoa(String.fromCharCode(...enc.encode(name)));
  return `=?UTF-8?B?${b64}?= <${address}>`;
}

/**
 * @param {{ accessKeyId: string, secretAccessKey: string, region: string, endpoint?: string }} aws
 * @param {{ from: string, to: string, replyTo?: string, subject: string, html: string, text: string, headers?: {name: string, value: string}[], configurationSet?: string }} mail
 * @returns {Promise<string>} SES MessageId
 */
export async function sendEmail(aws, mail) {
  const endpoint = aws.endpoint ?? `https://email.${aws.region}.amazonaws.com`;
  const url = new URL('/v2/email/outbound-emails', endpoint);
  const payload = JSON.stringify({
    FromEmailAddress: mail.from,
    Destination: { ToAddresses: [mail.to] },
    ...(mail.replyTo ? { ReplyToAddresses: [mail.replyTo] } : {}),
    ...(mail.configurationSet ? { ConfigurationSetName: mail.configurationSet } : {}),
    Content: {
      Simple: {
        Subject: { Data: mail.subject, Charset: 'UTF-8' },
        Body: { Html: { Data: mail.html, Charset: 'UTF-8' }, Text: { Data: mail.text, Charset: 'UTF-8' } },
        ...(mail.headers?.length ? { Headers: mail.headers.map((h) => ({ Name: h.name, Value: h.value })) } : {}),
      },
    },
  });

  const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
  const day = amzDate.slice(0, 8);
  const payloadHash = await sha256(payload);
  const signedHeaders = 'content-type;host;x-amz-content-sha256;x-amz-date';
  const canonical = ['POST', url.pathname, '', `content-type:application/json\nhost:${url.host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`, signedHeaders, payloadHash].join('\n');
  const scope = `${day}/${aws.region}/ses/aws4_request`;
  const toSign = ['AWS4-HMAC-SHA256', amzDate, scope, await sha256(canonical)].join('\n');
  let key = await hmac(`AWS4${aws.secretAccessKey}`, day);
  for (const part of [aws.region, 'ses', 'aws4_request']) key = await hmac(key, part);
  const signature = hex(await hmac(key, toSign));

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-amz-date': amzDate,
      'x-amz-content-sha256': payloadHash,
      authorization: `AWS4-HMAC-SHA256 Credential=${aws.accessKeyId}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
    },
    body: payload,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(`SES ${res.status}: ${data.message ?? data.Message ?? JSON.stringify(data).slice(0, 200)}`);
    err.status = res.status;
    throw err;
  }
  return data.MessageId;
}
