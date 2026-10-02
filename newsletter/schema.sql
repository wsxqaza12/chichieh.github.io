-- 電子報名單（Cloudflare D1）。套用：npx wrangler d1 execute chichieh-newsletter --remote --file newsletter/schema.sql
CREATE TABLE IF NOT EXISTS subscribers (
  email           TEXT PRIMARY KEY,
  lang            TEXT NOT NULL,              -- zh | en：收哪一種語言的新文章
  status          TEXT NOT NULL,              -- pending（等確認）| active | unsubscribed | bounced | complained
  token           TEXT NOT NULL UNIQUE,       -- 確認與退訂連結用
  source          TEXT,                       -- 從哪一頁訂閱
  created_at      TEXT NOT NULL,
  confirmed_at    TEXT,
  updated_at      TEXT NOT NULL,
  confirm_sent_at TEXT,
  confirm_count   INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS subscribers_lang_status ON subscribers (lang, status);

-- 訂閱表單的次數限制（每個 IP）
CREATE TABLE IF NOT EXISTS attempts (ip TEXT NOT NULL, at INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS attempts_ip_at ON attempts (ip, at);

-- 每篇文章的寄送狀態：baseline（電子報開始前就有的文章，不寄）| pending（等核准）| sent | skipped
CREATE TABLE IF NOT EXISTS issues (
  url        TEXT PRIMARY KEY,
  lang       TEXT NOT NULL,
  title      TEXT,
  status     TEXT NOT NULL,
  recipients INTEGER,
  created_at TEXT NOT NULL,
  sent_at    TEXT
);

-- 已寄出的信（重跑時跳過已寄過的人）
CREATE TABLE IF NOT EXISTS deliveries (
  url        TEXT NOT NULL,
  email      TEXT NOT NULL,
  message_id TEXT,
  at         TEXT NOT NULL,
  PRIMARY KEY (url, email)
);

-- SES 的退信與檢舉紀錄
CREATE TABLE IF NOT EXISTS events (at TEXT NOT NULL, type TEXT NOT NULL, email TEXT, detail TEXT);
