# chichieh-huang.com

個人網站，[Astro](https://astro.build) 建置，風格走「編輯極簡」——閱讀體驗優先，設計退到文字後面。

## 架構

```
文章來源（source of truth）              網站
┌─────────────────────────┐          ┌──────────────────────────┐
│ content-dna              │  build  │ chichieh.github.io        │
│ (my_content_style)       │ ──────► │  src/content/synced/  ←自動同步（gitignored）
│  寫過的文章/技術          │          │  src/content/blog/    ←Medium 舊文（已遷移，進版控）
│  寫過的文章/趨勢談        │          │  src/data/projects.ts ←專案卡片
│  待發表的文章 → 草稿      │          └──────────────────────────┘
└─────────────────────────┘                      │ push to main
                                                 ▼
                                    GitHub Actions build → gh-pages branch
                                                 │
                                                 ▼
                                    chichieh-huang.com（Cloudflare Pages）
```

## 日常寫作流程

1. 在 `my_content_style` 寫文章（純 markdown，不用 frontmatter）
2. 放到 `寫過的文章/技術` 或 `寫過的文章/趨勢談` → 下次建置自動上站
3. `待發表的文章` 內的檔案會被視為草稿（`npm run dev` 看得到、正式站看不到）
4. 要下架某篇：把檔名加進 `sync.config.json` 的 `excludeFiles`

frontmatter 全自動生成：標題取第一個標題行、日期取 git 首次 commit、分類取資料夾名。
想覆寫任何欄位，直接在文章開頭加 YAML frontmatter 即可（手寫的優先）。

### 寫作格式約定（對網站最友善的寫法）

```markdown
# 文章標題寫在第一行

內文直接開始……

## 章節標題（會出現在文章頁右側的「本頁章節」）
```

沒照做也有 fallback，按順序：`# 標題` → `【標題】` → `#hashtag式標題` →
檔名（縮寫檔名可在 `sync.config.json` 的 `titleOverrides` 補正式標題）。
整行粗體（2–40 字、結尾非句讀）會自動轉成 `##` 章節標題。
文末的 `#tag1 #tag2` 行會自動變成文章 tags。

### 圖片

把圖放在文章旁邊的 `images/` 資料夾，markdown 用相對路徑引用：

```markdown
![示意圖](images/我的圖.png)
```

建置時會自動把**有被引用到的圖**複製進網站（`public/content-images/`）並改寫路徑，
檔名有空格、中文都沒問題。貼外部網址（`https://…`）的圖也可以，原樣保留。
引用了但找不到的圖會在建置 log 出警告。

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

另有每日 09:00（台北）排程重建作為保底；content-dna 若加上 repository_dispatch
workflow（`event_type: content-updated`）可做到 push 即重建。

## 舊站

Jekyll（Chirpy theme）版本保存在 `jekyll-archive` branch。Medium 文章的網址
`/posts/<hash>/` 在新站完全不變。
