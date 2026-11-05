import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import matter from 'gray-matter';
import { createMarkdownProcessor, rehypeHeadingIds } from '@astrojs/markdown-remark';
import rehypeField from '../src/lib/rehype-field.mjs';

const processor = await createMarkdownProcessor({ rehypePlugins: [rehypeHeadingIds, rehypeField], syntaxHighlight: false });
const render = (body, frontmatter = {}) => processor.render(body, { frontmatter });
const notes = (html) => [...html.matchAll(/<aside class="sn" id="([^"]+)"/g)];
const markers = (html) => [...html.matchAll(/<sup class="ref"[^>]*><a href="#([^"]+)"/g)];

test('an inline paper link generates one navigable note, a bibliography and source metadata', async () => {
  const { code, metadata } = await render('Use [HyDE](https://arxiv.org/abs/2212.10496 "Precise Zero-Shot Dense Retrieval without Relevance Labels").');
  assert.equal(notes(code).length, 1);
  assert.equal(markers(code)[0][1], notes(code)[0][1]);
  assert.match(code, /<ul class="refs">/);
  assert.match(code, /Precise Zero-Shot Dense Retrieval without Relevance Labels/);
  assert.equal(metadata.frontmatter.fieldReferenceCount, 1);
  assert.equal(metadata.frontmatter.fieldSidenoteCount, 1);
  assert.ok(metadata.headings.some((h) => h.slug === 'references'));
});

test('abs, PDF and HTML links deduplicate, while explicit paper versions stay distinct', async () => {
  const { code, metadata } = await render('[A](https://arxiv.org/abs/2212.10496) [B](https://arxiv.org/pdf/2212.10496.pdf#page=2) [C](https://arxiv.org/html/2212.10496/) [v1](https://arxiv.org/abs/2212.10496v1)');
  assert.equal(notes(code).length, 2);
  assert.equal(markers(code).length, 2);
  assert.equal(metadata.frontmatter.fieldReferenceCount, 2);
});

test('legacy h3 references retain descriptions, general web sources and uncited entries', async () => {
  const { code, metadata } = await render('[Guide](https://example.com/guide#section).\n\n### References\n\n- [Full guide](https://example.com/guide/) — explanation\n- [Unused](https://arxiv.org/abs/2209.11755)');
  assert.equal(notes(code).length, 1);
  assert.match(code, /explanation/);
  assert.match(code, /<li id="ref2">/);
  assert.equal(metadata.frontmatter.fieldReferenceCount, 2);
});

test('caption citations work and multiple sources in one paragraph keep their reading order', async () => {
  const { code } = await render('![Example](https://example.com/figure.png)\n\n*Figure 1. [First](https://arxiv.org/abs/2209.11755) and [Second](https://arxiv.org/abs/2212.10496).*');
  assert.match(code, /<figcaption>/);
  assert.equal(notes(code).length, 2);
  assert.ok(code.indexOf('id="sn1"') < code.indexOf('id="sn2"'));
  assert.match(code, /<strong>First<\/strong>/);
  assert.match(code, /<strong>Second<\/strong>/);
});

test('ordinary links, unverified author names, lookalike hosts and code never become citations', async () => {
  const { code, metadata } = await render('Gao et al. (2023). [Site](https://example.com) [Lookalike](https://arxiv.org.example.com/abs/2212.10496)\n\n```md\n[Code](https://arxiv.org/abs/2212.10496)\n```');
  assert.equal(notes(code).length, 0);
  assert.equal(metadata.frontmatter.fieldReferenceCount, 0);
  assert.equal(metadata.frontmatter.fieldSidenoteCount, 0);
  assert.doesNotMatch(code, /class="refs"/);
});

test('DOI links get notes, existing references are reused, and duplicate IDs are avoided', async () => {
  const { code, metadata } = await render('<span id="sn1"></span>\n\n[Study](https://doi.org/10.1000/example).\n\n## 參考資料\n\n- [Study title](https://doi.org/10.1000/example)');
  assert.equal(notes(code).length, 1);
  assert.equal(notes(code)[0][1], 'sn1-2');
  assert.equal(markers(code)[0][1], 'sn1-2');
  assert.equal(metadata.frontmatter.fieldReferenceCount, 1);
});

test('generated references and note labels follow each article language', async () => {
  const body = '[Study](https://arxiv.org/abs/2212.10496)';
  const [zh, en] = await Promise.all([render(body), render(body, { original: 'example' })]);
  assert.match(zh.code, /參考資料/);
  assert.match(zh.code, /aria-label="註 1"/);
  assert.match(en.code, /References/);
  assert.match(en.code, /aria-label="Note 1"/);
});

test('the RAG pilot produces the same five verified sources in Chinese and English', async () => {
  for (const file of ['src/content/blog/fced76fdb8b9.md', 'src/content/en/what-is-rag.md']) {
    const { content, data } = matter(await fs.readFile(file, 'utf8'));
    const { code, metadata } = await render(content, data);
    assert.equal(notes(code).length, 5, file);
    assert.equal(metadata.frontmatter.fieldReferenceCount, 5, file);
    for (const id of ['2312.10997', '2209.11755', '2303.07678', '2305.15294', '2212.10496']) assert.ok(code.includes(`href="https://arxiv.org/abs/${id}"`));
  }
});
