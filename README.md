# chichieh-huang.com

個人網站，[Astro](https://astro.build) 建置。設計概念是「寫作地形圖」：每篇文章是地圖上的一座石堆，
位置由時間（西→東）與主題區域（南→北）決定，地形依寫作量生成，路線一路爬到最新的主題。
預設是夜間測繪（深色），也有日間地形圖（淺色）。

## 架構

```
文章來源（source of truth）              網站
┌─────────────────────────┐          ┌──────────────────────────┐
│ content-dna              │  build  │ chichieh.github.io        │
│ (my_content_style)       │ ──────► │  src/content/synced/  ←自動同步（gitignored）
│  寫過的文章/技術          │          │  src/content/blog/    ←Medium 舊文（已遷移，進版控）
│  寫過的文章/趨勢談        │          │  src/data/projects.ts ←專案卡片
│                          │          │  src/data/series.ts   ←連載（季、段）
│                          │          │  src/data/experience.ts ←演講、獎項、報導
│  待發表的文章 → 草稿      │          └──────────────────────────┘
└─────────────────────────┘                      │ push to main
                                                 ▼
                                    GitHub Actions build → gh-pages branch
                                                 │
                                                 ▼
                                    chichieh-huang.com（Cloudflare Pages）
```

## 日常寫作流程

1. 在 `my_content_style` 寫文章（純 markdown，不用 frontmatter），一樣寫中文就好
2. 放到 `寫過的文章/技術` 或 `寫過的文章/趨勢談`，push → 幾分鐘內中文版上站
3. 接著自動翻譯成英文，檢查通過後英文版跟著上站（見下方「英文版」），不用另外做什麼
4. `待發表的文章` 內的檔案會被視為草稿（`npm run dev` 看得到、正式站看不到，也不會翻譯）
5. 要下架某篇：把檔名加進 `sync.config.json` 的 `excludeFiles`

frontmatter 全自動生成：標題取第一個標題行、日期取 git 首次 commit、分類取資料夾名。
想覆寫任何欄位，直接在文章開頭加 YAML frontmatter 即可（手寫的優先）。

### 寫作格式約定（對網站最友善的寫法）

```markdown
# 文章標題寫在第一行

內文直接開始……

## 1. 章節標題（會變成文章頁左側「本篇路線」上的一站，開頭的編號會變成標籤）
```

沒照做也有 fallback，按順序：`# 標題` → `【標題】` → `#hashtag式標題` →
檔名（縮寫檔名可在 `sync.config.json` 的 `titleOverrides` 補正式標題）。
整行粗體（2–40 字、結尾非句讀）會自動轉成 `##` 章節標題。
文末的 `#tag1 #tag2` 行會自動變成文章 tags。

### 地圖上的區域

每篇文章會依標題自動歸到一個區域（資料工程、LLM、RAG、語音・Avatar、Vibe Coding、
Agent、龍蝦、MCP、記憶），規則在 `src/lib/regions.ts`。猜錯的話在文章開頭加：

```yaml
---
region: Agent
---
```

### 連載

連載文章會自動歸隊：檔名符合規則（例如 `Memory6.md`）就會算進 Agent Memory，
檔名裡的數字就是第幾篇，自動分到對應的季，「籌備中」的預告也會在下一篇上站後自動消失。
標題開頭的編號（「6 當 Memory 也會被攻擊」）在網站上會自動拿掉。

只有這些時候要改 `src/data/series.ts`：開新的一季、更新下一篇的預告、開新的連載。

### 圖說與參考資料

- 圖片下一行寫 `*圖 1　圖說文字*`（整行斜體），會變成圖版下方的圖說。
- 文末用 `## 參考資料` 列出連結，內文第一次連到同一個網址的地方會自動加上 `[1]`，
  並在旁邊放一張引用註記（寬螢幕在右側邊欄，手機接在段落後面）。

### 圖片

把圖放在文章旁邊的 `images/` 資料夾，markdown 用相對路徑引用：

```markdown
![示意圖](images/我的圖.png)
```

建置時會自動把**有被引用到的圖**複製進網站（`public/content-images/`）並改寫路徑，
檔名有空格、中文都沒問題。貼外部網址（`https://…`）的圖也可以，原樣保留。
引用了但找不到的圖會在建置 log 出警告。

## 英文版（/en/）

英文版是完整的英文網站：首頁地圖、文章（全文翻譯）、演講與合作、作品、關於，頁面上除了切換到中文的按鈕，不會出現中文。

### 文章的英文版

每篇中文文章的英文版是 `src/content/en/<英文網址>.md`，網址是 `/en/writing/<英文網址>/`：

```yaml
---
original: memory5          # 中文文章的 id（= 中文網址 /posts/<id>/）
title: Remembering Isn't the Same as Remembering Right
description: 一兩句英文摘要（列表、地圖、分享卡片都用這個）
tags: []
sourceHash: '…'            # 中文原文的指紋，用 npm run i18n -- --stamp 產生
---
```

- 日期、地形圖上的區域、連載集數都跟著中文原文，不用另外寫。
- 內文連到其他文章（`/posts/<id>/`、`../<id>/`、舊的 Medium 網址）時，建置會自動換成該文的英文網址。
- **還沒翻譯的文章，英文網站先不列**（地圖、列表、RSS 都不會出現），建置 log 會列出還缺哪幾篇。

### 自動翻譯

文章庫 push 之後，`.github/workflows/translate.yml` 會找出還沒有英文版、或中文改過的文章，
交給 Claude Code 翻譯（Claude 失敗時改用 Gemini），翻完跑檢查，通過就 commit 到 `main` 並重新部署：

```
content-dna push ──► 部署（中文版上站）
                └──► 翻譯 ──► 檢查 ──► commit 英文版 ──► 再部署（英文版上站）
```

- **新文章**：整篇翻譯，自己取英文網址。**中文改過**：只改英文版裡對應的段落，其他不動，網址不變。
- 翻譯規則（語氣、用詞、不能動的東西）在 [`docs/translating.md`](docs/translating.md)，想調整英文版的寫法改這份。
- 檢查（`scripts/check-translation.mjs`）：圖片、章節標題、表格、code block、連結都要跟中文對得上，不能留任何中文。
  沒通過的那篇不會上站，workflow 會亮紅燈（GitHub 會寄信），隔天排程會再試一次。
- 一次最多翻 3 篇，其餘留到下一輪（每日 09:30 也會跑一次）。
- 翻譯引擎依序嘗試，前一個失敗（例如 Claude 額度用完）就換下一個，翻出來的都要通過同一套檢查。
  commit 訊息和 workflow 摘要會註明每篇是哪個引擎翻的。
  - Claude：repo secret `CLAUDE_CODE_OAUTH_TOKEN`（在自己電腦跑 `claude setup-token` 產生，用 Claude 訂閱額度）
    或 `ANTHROPIC_API_KEY`（按用量計費）。
  - Gemini（備援）：repo secret `GEMINI_API_KEY`（Google AI Studio 的 key）。直接呼叫 Gemini API，
    自動挑這把 key 能用的最新 pro 模型，不行再退到 flash；要指定模型可設 `GEMINI_MODEL`。
  - 都沒設的話這個 workflow 會直接跳過。

本機也能跑同一套流程（用你登入的 `claude`）：

```bash
npm run translate                       # 同步文章、翻譯所有缺的與改過的（一次最多 3 篇）
npm run translate -- --dry-run          # 只列出會翻哪幾篇
npm run translate -- --limit 10         # 一次多翻幾篇
npm run translate -- --engine gemini    # 只用 Gemini（需要環境變數 GEMINI_API_KEY）
npm run i18n                            # 哪些文章還沒有英文版、哪些中文改過
node scripts/check-translation.mjs --all   # 檢查全部英文版
```

自己改了英文版、不想被下次的自動更新蓋掉也沒關係：更新只在中文原文改過時才會發生，而且只改對應的段落。
手動翻譯或修改完，用 `npm run i18n -- --stamp src/content/en/xxx.md` 記下中文原文目前的指紋。

Medium 時期另外發過英文版的三篇（`d30783070827`、`a1d263ce61b4`、`a3476af62056`），
frontmatter 標了 `translationOf`，英文網站改用 `src/content/en/` 裡的版本，不會重複列出。

### 語言切換

- 第一次直接打開中文首頁、而且瀏覽器語言沒有中文的人，會自動帶到 `/en/`；搜尋引擎爬蟲、從站內點過來的人不會被轉。
- 在任何一頁按「EN／中文」切換之後會記住選擇，之後不會再被自動轉。
- 中文的文章頁不自動轉址，非中文瀏覽器會在右下角看到「This page is also available in English」提示。
- 每篇文章的中英兩頁互相用 `hreflang` 標示，Google 會依搜尋者的語言顯示對應版本。

### 其他英文內容

| 要改什麼 | 在哪裡 |
|---|---|
| 介面文字（選單、按鈕、圖例） | `src/i18n.ts` |
| 文章頁的英文介面 | `src/views/Post.astro`（中英共用） |
| 演講講題、合作形式（中、英） | `src/data/speaking.ts` |
| 作品的英文介紹 | `src/data/projects.ts` 每個作品的 `en` |
| 演講場次、獎項、報導的英文 | `src/data/experience.ts` 的 `en` |
| 連載的英文介紹、季名、下一篇預告 | `src/data/series.ts` |
| 關於頁的英文自介 | `src/views/About.astro` |

中英頁面共用同一份版型（`src/views/`），`src/pages/` 底下只是兩個語言的入口。

## 分享卡片

每篇文章在建置時會產生一張分享卡片（`/og/<slug>.jpg`，英文版 `/og/en/<英文網址>.jpg`，1200×630），畫的是這篇在地形圖上的位置，
首頁與其他頁面共用 `/og.jpg`。卡片的字型在建置時從 Google Fonts 下載並快取在 `.cache/og-fonts/`；
下載失敗時卡片照樣產生，只是沒有文字。程式在 `src/lib/og.ts`、`src/lib/og-text.ts`。

## 本機開發

```bash
npm install
npm run dev        # 會先跑 sync（讀 ../my_content_style），再起 dev server
npm run build      # 產出 dist/
```

## 部署

push 到 `main` → GitHub Actions 建置 → 推到 `gh-pages` branch → Cloudflare Pages 供應網域。

**需要設定一次**：在 repo Settings → Secrets 加 `CONTENT_DNA_TOKEN`
（可讀取 `wsxqaza12/content-dna` 的 fine-grained PAT），CI 才拉得到文章庫。
沒設的話網站仍會建置，但只有 Medium 遷移的文章。

content-dna 的 `.github/workflows/notify-site.yml` 在每次 push 時送出 `content-updated`，
網站的部署和自動翻譯都會跟著跑（content-dna 那邊需要 `SITE_TRIGGER_TOKEN`）。
另有每日 09:00（台北）排程重建作為保底。

自動翻譯另外需要 `CLAUDE_CODE_OAUTH_TOKEN` 或 `ANTHROPIC_API_KEY`，見上方「自動翻譯」。

## 舊站

Jekyll（Chirpy theme）版本保存在 `jekyll-archive` branch。Medium 文章的網址
`/posts/<hash>/` 在新站完全不變。
