// 「經歷」頁的資料。postId 是站上對應心得文章的 slug（找不到就不顯示連結）。
// 年份只標有把握的，不確定的留空。

export interface Achievement {
  title: string;
  detail: string;
  year?: string;
}

export interface Talk {
  event: string;
  topic?: string;
  detail?: string;
  year?: string;
  postId?: string;
}

export interface Media {
  outlet: string;
  detail: string;
  year?: string;
  postId?: string;
}

export const achievements: Achievement[] = [
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
    title: '近 20 場技術演講與工作坊',
    detail: '從 LLM、RAG 到 AI Agent 實戰，持續在社群分享第一手經驗。',
  },
];

export const talks: Talk[] = [
  {
    event: 'WiDS Taiwan（Women in Data Science）',
    topic: '我的團隊裡有五個 AI：打造你的 Agent 團隊',
    detail: '線上＋線下約 200 人論壇講者，分享五個月實測 Agent 團隊的效能邊界。',
    year: '2026',
    postId: 'wids講者心得',
  },
  {
    event: '政大 GDG On Campus 讀書會',
    topic: '在 AI 快速變化的時代，找回思考的自主權',
    detail: '帶領一學期的讀書會，從 AI FOMO 聊到資訊焦慮與判斷力。',
    year: '2026',
  },
  {
    event: 'R-Ladies Taipei × 台北大學統計系',
    topic: '從 Side Project 到 Business：AILogora 開發實錄與 Vibe Coding 實踐',
    year: '2026',
    postId: 'r-ladies',
  },
  {
    event: 'GenAI 小聚',
    topic: '復養龍蝦：OpenClaw 實戰／Vibe Kanban × Tailscale 生產力組合',
    detail: '多次受邀分享 coding agent 工作流。',
    year: '2026',
  },
  {
    event: 'Twinkle AI × GDG 一週年活動',
    topic: '介紹 AILogora',
    detail: '70 餘人線下聚會。',
  },
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
    detail: '新聞採訪＋節目錄製，以龍蝦（OpenClaw）使用者身分分享 AI Agent 的日常。',
    year: '2026',
    postId: '公視媒體經驗',
  },
];
