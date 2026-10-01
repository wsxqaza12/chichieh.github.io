// 連載。文章頁會依這裡畫出「路線」（第幾季、第幾段），首頁也用它排最新路段。
//
// 文章怎麼加進連載：不用改這個檔案。文章網址（= 檔名）符合 match 的規則就會自動算進來，
// 檔名裡的數字就是第幾篇，例如 Memory6.md → 第 6 篇 → 第二季第 2 段。
// 要改這個檔案的時候只有：開新的一季（把上一季補上 to、加一筆新的季）、更新下一篇的預告、開新的連載。
// 連載文章標題開頭的編號（「6 當 Memory 也會被攻擊」）在網站上會自動拿掉。

export interface Season {
  n: number;
  name: string;
  /** 英文版的季名 */
  nameEn: string;
  /** 這一季從第幾篇開始、到第幾篇（不填 to = 還在連載中，之後的都算這一季） */
  from: number;
  to?: number;
  /** 下一篇的預告：第 n 篇上站後自動消失 */
  next?: { n: number; text: string; en: string };
}

export interface Series {
  name: string;
  /** 首頁「最新路段」的介紹（中、英） */
  intro: string;
  introEn: string;
  /** 文章網址符合這個規則就算進連載，第一個括號是篇數 */
  match: RegExp;
  seasons: Season[];
}

export const series: Series[] = [
  {
    name: 'Agent Memory',
    intro: '第一季四篇，從「大家講的 Memory 是同一件事嗎」一路談到記憶怎麼形成與遺忘。第二季開始追問，記住了就代表記對了嗎？',
    introEn: 'Season one ran four essays, from whether we even mean the same thing by “memory” to how agent memory forms, updates and fades. Season two asks whether an agent that remembers also remembers right.',
    match: /^memory(\d+)$/,
    seasons: [
      { n: 1, name: '把過去留下來', nameEn: 'Keeping the past', from: 1, to: 4 },
      {
        n: 2,
        name: '當過去不再適用',
        nameEn: 'When the past stops applying',
        from: 5,
        next: {
          n: 6,
          text: '如果有人知道 Agent 會相信自己的記憶，並且刻意讓錯誤的東西被留下來呢？',
          en: 'What if someone knows your agent trusts its memory, and plants something false on purpose?',
        },
      },
    ],
  },
];

export interface SeriesPlace {
  series: Series;
  season: Season;
  /** 這一季的第幾段 */
  ep: number;
  /** 整個連載的第幾篇 */
  num: number;
}

const seasonOf = (s: Series, num: number) => s.seasons.find((x) => num >= x.from && (x.to === undefined || num <= x.to));

export function seriesOf(id: string): SeriesPlace | null {
  for (const s of series) {
    const m = id.match(s.match);
    if (!m) continue;
    const num = +m[1];
    const season = seasonOf(s, num);
    if (season) return { series: s, season, ep: num - season.from + 1, num };
  }
  return null;
}

export interface ResolvedSeason extends Season {
  /** 已上站的文章 id，依篇數排序 */
  posts: string[];
  /** 還沒上站的下一篇預告（上站後是 undefined） */
  upcoming?: string;
  upcomingEn?: string;
}

/** 依目前上站的文章，算出每一季有哪幾篇 */
export function resolveSeries(s: Series, ids: string[]): ResolvedSeason[] {
  const eps = ids.flatMap((id) => {
    const m = id.match(s.match);
    return m ? [{ id, num: +m[1] }] : [];
  });
  const latest = Math.max(0, ...eps.map((e) => e.num));
  return s.seasons.map((se) => ({
    ...se,
    posts: eps.filter((e) => seasonOf(s, e.num) === se).sort((a, b) => a.num - b.num).map((e) => e.id),
    upcoming: se.next && latest < se.next.n ? se.next.text : undefined,
    upcomingEn: se.next && latest < se.next.n ? se.next.en : undefined,
  }));
}
