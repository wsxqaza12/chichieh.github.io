// 網站的兩種語言：中文（預設，網址不加前綴）與英文（/en/）。
// 英文版的文章在 src/content/en/（翻譯），網址 /en/writing/<英文網址>/；英文網站只列有翻譯的文章。

export type Lang = 'zh' | 'en';

const PAIRS: [string, string][] = [
  ['/', '/en/'],
  ['/posts/', '/en/writing/'],
  ['/speaking/', '/en/speaking/'],
  ['/projects/', '/en/work/'],
  ['/about/', '/en/about/'],
  ['/newsletter/', '/en/newsletter/'],
];

export const langOf = (path: string): Lang => (path === '/en' || path.startsWith('/en/') ? 'en' : 'zh');

/** 同一頁的另一種語言版本（沒有對應頁時，回到該語言最接近的頁） */
export function altPath(path: string): string {
  const p = path.endsWith('/') ? path : path + '/';
  if (langOf(p) === 'en') return PAIRS.find(([, en]) => en === p)?.[0] ?? '/';
  const hit = PAIRS.find(([zh]) => zh === p);
  if (hit) return hit[1];
  if (p.startsWith('/experience/')) return '/en/speaking/';
  if (p.startsWith('/posts/')) return '/en/writing/';
  return '/en/';
}

/** 有中英對照的頁面：回傳 [中文, 英文] 路徑（給 hreflang 用） */
export function pairOf(path: string): [string, string] | null {
  const p = path.endsWith('/') ? path : path + '/';
  return PAIRS.find(([zh, en]) => zh === p || en === p) ?? null;
}

export const nav = {
  zh: [
    { href: '/', label: '地圖', short: true },
    { href: '/posts/', label: '文章', short: true },
    { href: '/speaking/', label: '演講', short: false },
    { href: '/projects/', label: '作品', short: false },
    { href: '/about/', label: '關於', short: true },
  ],
  en: [
    { href: '/en/', label: 'Map', short: true },
    { href: '/en/writing/', label: 'Writing', short: true },
    { href: '/en/speaking/', label: 'Speaking', short: false },
    { href: '/en/work/', label: 'Work', short: false },
    { href: '/en/about/', label: 'About', short: true },
  ],
};

export const ui = {
  zh: {
    siteName: '黃琪婕 ChiChieh Huang',
    defaultDescription: '黃琪婕 ChiChieh Huang：做 Generative AI 產品，也把它寫成中文。LLM、Agent、RAG、Agent Memory 的技術文章與演講。',
    sub: 'CHICHIEH HUANG · GEN AI',
    homeLabel: '黃琪婕 首頁',
    day: '日間', night: '夜間', themeLabel: '切換日間與夜間',
    otherLang: 'EN', otherLangLabel: 'English version',
    invite: '邀請合作',
    footer: '由文字與一隻龍蝦驅動',
    scale: '比例尺 1 :', chars: '字',
    // 地圖
    mapLabel: '寫作地形圖',
    you: '你在這裡', read: '閱讀全文 →',
    legendCairn: '石堆＝一篇文章，石頭越多字越多', legendTrail: '每月的寫作路線', legendContour: '等高線＝主題的累積', months3: '3 個月',
    // 文章清單
    all: '全部', date: '日期', region: '區域', title: '標題', length: '字數',
    more: (n: number) => `展開其餘 ${n} 篇 ↓`, empty: '這個區域還沒有文章。', draft: '草稿', filterLabel: '依區域篩選',
    // 演講剖面
    months: ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'].map((m) => m + '月'),
    today: '今天', talksAria: (y: number, n: number) => `${y} 年演講累積場次，共 ${n} 場`, cumulative: '累積',
    surveyor: '▲ 測繪者',
  },
  en: {
    siteName: 'ChiChieh Huang',
    defaultDescription: 'ChiChieh Huang is a founder and AI engineer in Taipei, building shared memory for people and AI agents, and writing about LLMs, agents and agent memory.',
    sub: 'FOUNDER · AI ENGINEER',
    homeLabel: 'ChiChieh Huang home',
    day: 'Day', night: 'Night', themeLabel: 'Switch day and night',
    otherLang: '中文', otherLangLabel: '中文版',
    invite: 'Work with me',
    footer: 'Powered by words and one lobster',
    scale: 'Scale 1 :', chars: 'words',
    mapLabel: 'A map of my writing',
    you: 'You are here', read: 'Read →',
    legendCairn: 'Cairn = one essay; more stones, longer essay', legendTrail: 'Monthly writing trail', legendContour: 'Contours = topics building up', months3: '3 months',
    all: 'All', date: 'Date', region: 'Region', title: 'Title', length: 'Length',
    more: (n: number) => `Show ${n} more ↓`, empty: 'Nothing in this region yet.', draft: 'Draft', filterLabel: 'Filter by region',
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    today: 'Today', talksAria: (y: number, n: number) => `Talks given in ${y}, cumulative: ${n}`, cumulative: 'Total',
    surveyor: '▲ SURVEYOR',
  },
};

export const numberWords = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
