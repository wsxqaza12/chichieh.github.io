// 連載。文章頁會依這裡畫出「路線」（第幾季、第幾段），首頁也用它排最新路段。
// posts 放文章網址的 slug（/posts/<id>/），依閱讀順序。
// 連載文章標題開頭的編號（「5 記住了…」）在網站上會自動拿掉，順序以這裡為準。

export interface Season {
  n: number;
  name: string;
  posts: string[];
  /** 這一季下一篇的預告，還沒寫就顯示「籌備中」 */
  next?: string;
}

export interface Series {
  name: string;
  /** 首頁「最新路段」的介紹 */
  intro: string;
  seasons: Season[];
}

export const series: Series[] = [
  {
    name: 'Agent Memory',
    intro: '第一季四篇，從「大家講的 Memory 是同一件事嗎」一路談到記憶怎麼形成與遺忘。第二季開始追問，記住了就代表記對了嗎？',
    seasons: [
      { n: 1, name: '把過去留下來', posts: ['memory1', 'memory2', 'memory3', 'memory4'] },
      {
        n: 2,
        name: '當過去不再適用',
        posts: ['memory5'],
        next: '如果有人知道 Agent 會相信自己的記憶，並且刻意讓錯誤的東西被留下來呢？',
      },
    ],
  },
];

export interface SeriesPlace {
  series: Series;
  season: Season;
  ep: number;
}

export function seriesOf(id: string): SeriesPlace | null {
  for (const s of series)
    for (const season of s.seasons) {
      const i = season.posts.indexOf(id);
      if (i >= 0) return { series: s, season, ep: i + 1 };
    }
  return null;
}
