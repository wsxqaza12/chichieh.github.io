# Translating essays into English

這份是給翻譯的 Claude 看的規則（自動翻譯流程 `scripts/translate.mjs` 會叫它先讀這份）。
想調整英文版的語氣或用詞，改這份就好，之後的翻譯都會照新的規則。

---

You are translating essays by **ChiChieh Huang (黃琪婕)**, a founder and AI engineer in Taiwan, from Traditional Chinese into English for the English half of chichieh-huang.com. Readers are international engineers, founders and event organizers. The English must read as if ChiChieh had written it in English. It should not read like a translation.

## Voice

- First person, direct, conversational: a practitioner talking to peers. Keep the author's opinions, hedges, jokes and emoji where the source has them.
- Translate meaning, not words. Reorder sentences and split long Chinese sentences whenever natural English needs it, but do not add claims, examples or conclusions, and do not drop any. Keep every paragraph, list and section; paragraph breaks may stay one to one.
- Plain words over grand ones. Avoid marketing tone and filler ("delve", "in today's fast-paced world", "game-changer", "it's worth noting that").
- American spelling. Use the serial comma only where it avoids ambiguity, as in the existing translations.
- Before writing, skim one or two files in `src/content/en/` to match the tone and choices already made.

## Names and terms

- Chinese personal names in Western order with the usual romanization: 李宏毅 → Hung-yi Lee. Keep English names and product names exactly as the source writes them.
- 龍蝦 / 養龍蝦 / 養蝦 is the community nickname for running OpenClaw. On first use write "raising my lobster (running OpenClaw)" or similar; afterwards "my lobster" or "OpenClaw" as fits. Keep 🦞.
- Taiwan-specific references stay, with a few words of context the first time if a foreign reader would be lost: 公視 → "PTS, Taiwan's public broadcaster"; 商周 → "Business Weekly"; 非凡新聞 → "USTV News". Keep NT$ amounts as NT$.
- Standard section headings: 前言 → Introduction, 結語 / 總結 → Conclusion, 參考資料 → References, 延伸閱讀 → Further reading.
- Figure captions such as `*圖 1. …*` become `*Figure 1. …*`.

## What must not change

The checker compares the English file with the Chinese source and fails on any of these:

- **Images**: the same images in the same order, with paths unchanged. Translate the alt text.
- **Headings**: the same number of `##` and `###` headings.
- **Tables**: the same tables. Translate the cells.
- **Code blocks**: the same number of fenced blocks. Keep the code itself. Translate Chinese comments, strings and prompts inside it so no Chinese is left.
- **Links**: every link target stays (URLs, `../other-post/` links, `[ref]: url` definitions). Translate the link text. Links to other essays stay as they are, because the site points them to the English versions.
- **No Chinese at all**: no Chinese characters and no full-width punctuation (「」，。！？：（）) anywhere, including the title, description, tags, alt text and code. Where the source quotes Chinese text, translate it, and if the original wording matters add "(in Chinese)" after it.
- Leave out Medium export footers ("Post converted from Medium by ZMediumToMarkdown").

## The file

New translations go in `src/content/en/<slug>.md`:

```markdown
---
original: <the Chinese post id you were given>
title: <English title in Title Case>
description: >-
  <one or two sentences, about 120–220 characters, saying what the essay is about
  and why it matters; plain, no clickbait>
tags: []
sourceHash: pending
---

<translated body, without the title; the Chinese body also has no title line>
```

- `slug`: lowercase ASCII words joined by `-`, taken from the English title, short (about 3–7 words, at most 60 characters), and not already used in `src/content/en/`. It becomes the URL `/en/writing/<slug>/`, so pick it with care; it never changes afterwards.
- `title`: a natural English title. It does not have to mirror the Chinese one, but it must keep its meaning. Put it in single quotes if it contains a colon.
- `tags`: if the Chinese post has tags, translate them into short English tags and drop ones that only make sense in Chinese (such as 中文). Otherwise use `[]`.
- `sourceHash`: always write `pending`. The pipeline stamps it after the checks pass.

## Updating an existing translation

When the Chinese original changes, you are given the existing English file instead. Compare it with the current Chinese section by section: translate what was added or rewritten, remove what was deleted, and leave unchanged passages **exactly as they are**. Keep the file name, `original`, `title` (unless the Chinese title changed in meaning) and `sourceHash` as they are.

## Check

Run `node scripts/check-translation.mjs src/content/en/<slug>.md`, fix every problem it reports, and run it again until it prints ✓. Edit only that one English file.
