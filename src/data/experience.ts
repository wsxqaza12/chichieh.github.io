// 「經歷」頁的資料。postId 是站上對應心得文章的 slug（找不到就不顯示連結）。
// 年份只標有把握的，不確定的留空。

export interface Achievement {
  title: string;
  detail: string;
  year?: string;
  postId?: string;
}

export interface Talk {
  /** YYYY-MM-DD 或 YYYY-MM（只知道月份時）。晚於建置日的自動進「即將登場」 */
  date: string;
  event: string;
  topic?: string;
  detail?: string;
  postId?: string;
  /** 大型場次，名稱以強調色顯示 */
  major?: boolean;
  /** 同一系列的實際場次數（預設 1），總場數會加總 */
  count?: number;
  /** 現場側拍（只給大場配，避免頁面變相簿） */
  photo?: string;
}

export interface Media {
  outlet: string;
  detail: string;
  year?: string;
  postId?: string;
  /** 報導畫面／新聞截圖 */
  photo?: string;
}

export const achievements: Achievement[] = [
  {
    title: 'Anthropic 全球 Hackathon 入選（錄取率約 2.4%）',
    detail: '兩萬多人取五百的全球賽，六天 solo 打造 Cairn——AI 時代的社群知識地圖，以 Claude Managed Agents 實作 custodian agent「Moss」。',
    year: '2026',
    postId: 'antropic-hackathon',
  },
  {
    title: 'NVIDIA × LangChain Generative AI Agents Developer Contest — Top 100',
    detail: '以 LLMAvatarTalk（ASR × LLM × TTS × Audio2Face × Metahuman 的互動虛擬助理）入選前百強。',
    year: '2024',
  },
  {
    title: 'AppWorks Accelerator #31',
    detail: '以 AILogora 入選 AppWorks 加速器，與百餘位創業者一同衝刺。',
  },
  {
    title: '2019 AI 新銳領航者競賽（長榮航空組）第一名',
    detail: 'SAS 競賽長榮航空組冠軍。',
    year: '2019',
  },
  {
    title: '2026 年 25+ 場演講、工作坊與企業內訓',
    detail: '從 AWS Summit、台灣人工智慧年會到社群讀書會與企業內訓，持續分享 AI Agent 第一手實戰。',
    year: '2026',
  },
];

// 2026 年演講、工作坊與企業內訓（日期只知道月份的先標到月）
export const talks: Talk[] = [
  { date: '2026-01', event: 'GenAI 小聚', topic: '三刀流工程師' },
  { date: '2026-01', event: 'Twinkle AI × GDG 一週年活動', detail: '介紹 AILogora，70 餘人線下聚會。' },
  {
    date: '2026-01',
    event: 'R-Ladies Taipei × 台北大學統計系',
    topic: '從 Side Project 到 Business：AILogora 開發實錄與 Vibe Coding 實踐',
    postId: 'r-ladies',
  },
  { date: '2026-02', event: '某科技公司內部分享', topic: '萬能龍蝦助理' },
  { date: '2026-02-11', event: 'GenAI 小聚', topic: '富養龍蝦大全' },
  { date: '2026-02', event: '某運動科技公司內部分享', topic: '萬能龍蝦助理' },
  { date: '2026-02', event: 'BRP OpenClaw Workshop' },
  { date: '2026-03', event: 'Taiwan OpenClaw Meetup（MixerBox）' },
  { date: '2026-03', event: 'AppWorks AI Circle' },
  { date: '2026-03', event: 'NACC 專題分享' },
  { date: '2026-03', event: 'GDG 讀書會' },
  { date: '2026-04', event: '中山醫學大學 校園演講', detail: '同月受邀兩場。', count: 2 },
  { date: '2026-04', event: '百商 企業內訓', detail: '系列內訓共兩場。', count: 2 },
  {
    date: '2026-04',
    event: '政大 GDG On Campus 讀書會',
    topic: '在 AI 快速變化的時代，找回思考的自主權',
    detail: '帶領一學期讀書會，4–5 月共三場，從 AI FOMO 聊到資訊焦慮與判斷力。',
    count: 3,
  },
  { date: '2026-04', event: 'Taiwan OpenClaw Meetup 商業場（MixerBox）' },
  { date: '2026-05-18', event: 'AIA × Claude Code' },
  {
    date: '2026-05-24',
    event: 'WiDS Taiwan（Women in Data Science）',
    topic: '我的團隊裡有五個 AI：打造你的 Agent 團隊',
    detail: '線上 + 線下約 200 人論壇講者，分享五個月實測 Agent 團隊的效能邊界。',
    postId: 'wids講者心得',
    major: true,
  },
  {
    date: '2026-07-16',
    event: 'AWS Summit Taipei 2026',
    topic: '從 AI Session 到 Shared Memory：打造 AI Native 的知識基礎建設',
    detail: '現場爆滿的 Agent Memory 分享。',
    major: true,
    photo: '/assets/img/experience/aws-summit.jpg',
    postId: 'aws-跟-agile-演講',
  },
  {
    date: '2026-07-16',
    event: 'Agile Taiwan',
    topic: '從龍蝦到 Cairn，當 Agent 成為團隊成員，記憶要怎麼共享？',
    major: true,
    photo: '/assets/img/experience/agile-taiwan.jpg',
    postId: 'aws-跟-agile-演講',
  },
  { date: '2026-08-04', event: 'AIA 小聚' },
  { date: '2026-08-18', event: '2026 台灣人工智慧年會', major: true },
  { date: '2026-10-18', event: '桂格 企業內訓' },
  { date: '2026-12-18', event: '新創企業發展協會 演講' },
];

export const media: Media[] = [
  {
    outlet: '《商業周刊》',
    detail: '受訪談 OpenClaw 與 AI Agent 的實際應用、上手門檻與觀察。',
    year: '2026',
    postId: '商周',
  },
  {
    outlet: '非凡新聞',
    detail: '專訪示範 AI Agent 的行政應用（簡報、會議記錄、Agent 圓桌會議），並談使用風險與 NemoClaw 的影響。',
    year: '2026',
    postId: '非凡新聞',
  },
  {
    outlet: '公視',
    detail: '新聞採訪 +《尖峰對談》節目，以龍蝦（OpenClaw）使用者身分分享 AI Agent 的日常。',
    year: '2026',
    postId: '公視媒體經驗',
  },
];
