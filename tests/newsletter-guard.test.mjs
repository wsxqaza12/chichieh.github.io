import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import worker, { reserveConfirmation } from '../newsletter/src/index.js';

test('confirmation quota covers all addresses for a rolling hour', async () => {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec(readFileSync(new URL('../newsletter/schema.sql', import.meta.url), 'utf8'));
  const db = {
    prepare(sql) { return { bind: (...args) => () => ({ meta: sqlite.prepare(sql).run(...args) }) }; },
    batch(statements) { return statements.map(run => run()); },
  };
  assert.ok(await reserveConfirmation(db, 'one@example.com'));
  assert.equal(await reserveConfirmation(db, 'one@example.com'), false);
  for (let i = 1; i < 10; i++) assert.ok(await reserveConfirmation(db, i + '@example.com'));
  assert.equal(await reserveConfirmation(db, 'overflow@example.com'), false);
  sqlite.exec('UPDATE confirmation_slots SET at = at - 3600001');
  assert.ok(await reserveConfirmation(db, 'overflow@example.com'));
  sqlite.close();
});

test('subscribe rejects missing, invalid, wrong-host and wrong-action tokens before database access', async t => {
  const mock = t.mock.method(globalThis, 'fetch');
  for (const [token, result] of [
    ['', {}], ['invalid', {success:false}],
    ['wrong-host', {success:true, hostname:'example.com', action:'newsletter'}],
    ['wrong-action', {success:true, hostname:'chichieh-huang.com', action:'other'}],
  ]) {
    mock.mock.mockImplementation(async () => Response.json(result));
    const request = new Request('https://chichieh-huang.com/api/newsletter/subscribe', {
      method:'POST', headers:{'content-type':'application/json'},
      body:JSON.stringify({email:'test@example.com','cf-turnstile-response':token}),
    });
    assert.equal((await worker.fetch(request, {TURNSTILE_SECRET:'test'})).status,403);
  }
});

test('verified signups send confirmations until the shared quota is full', async t => {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec(readFileSync(new URL('../newsletter/schema.sql', import.meta.url), 'utf8'));
  t.after(() => sqlite.close());
  const env = {
    TURNSTILE_SECRET: 'test', SES_REGION: 'test', AWS_SECRET_ACCESS_KEY: 'test', FROM_ADDRESS: 'sender@example.com',
    DB: {
      prepare(sql) {
        const stmt = sqlite.prepare(sql);
        return { bind: (...args) => ({
          first: () => stmt.get(...args), run: () => ({meta: stmt.run(...args)}),
        }) };
      },
      batch(statements) { return statements.map(stmt => stmt.run()); },
    },
  };
  let sends = 0;
  t.mock.method(globalThis, 'fetch', async url => {
    if (String(url).includes('/siteverify')) return Response.json({success:true, action:'newsletter', hostname:'chichieh-huang.com'});
    if (String(url).includes('/dns-query')) return Response.json({Status:0, Answer:[{}]});
    assert.equal(new URL(url).pathname, '/v2/email/outbound-emails');
    sends++;
    return Response.json({MessageId:'test'});
  });
  for (let i = 0; i <= 10; i++) {
    const res = await worker.fetch(new Request('https://chichieh-huang.com/api/newsletter/subscribe', {
      method: 'POST', headers: {'cf-connecting-ip':'192.0.2.' + i},
      body: new URLSearchParams({email:i + '@example.com', 'cf-turnstile-response':'test'}),
    }), env);
    assert.equal(res.status, 303);
    assert.equal(new URL(res.headers.get('location')).searchParams.get('s'), i < 10 ? 'check' : 'slow');
  }
  assert.equal(sends, 10);
  assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM subscribers').get().n, 10);
});
