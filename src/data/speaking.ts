// 「邀請演講與合作」頁的內容（中、英）。講題都來自實際講過的場次，可以直接改文字。
// region 對應地形圖上的區域（決定講題卡片上的地名），post 是相關文章的 slug。

export interface Topic {
  id: string;
  region?: string;
  post?: string;
  zh: { title: string; pitch: string; for: string; given: string[] };
  en: { title: string; pitch: string; for: string; given: string[] };
}

export const topics: Topic[] = [
  {
    id: 'shared-memory',
    region: '記憶',
    post: 'aws-跟-agile-演講',
    zh: {
      title: '從 AI Session 到 Shared Memory：Agent 的記憶怎麼共享',
      pitch: '大家都在講 Agent Memory，但個人 Agent 的記憶解決的是連續性；一旦落到團隊，要面對的是來源、範圍、審核與修正。這場整理我研究 Agent Memory 的心得，以及 Cairn 想解的問題：人跟 Agent 怎麼共享團隊記憶。',
      for: '研討會、工程與產品團隊',
      given: ['2026 臺灣人工智慧年會', 'AWS Summit Taipei 2026', 'Agile Taiwan'],
    },
    en: {
      title: 'From AI Sessions to Shared Memory: How Agents Should Share What They Know',
      pitch: 'Everyone talks about agent memory, but personal memory mostly buys continuity. Once memory belongs to a team, you have to deal with sources, scope, review and correction. This talk distills my research on agent memory and the problem Cairn is built to solve: how people and agents share what a team knows.',
      for: 'Conferences, engineering and product teams',
      given: ['Taiwan AI Annual Conference 2026', 'AWS Summit Taipei 2026', 'Agile Taiwan'],
    },
  },
  {
    id: 'agent-team',
    region: 'Agent',
    post: 'wids講者心得',
    zh: {
      title: '我的團隊裡有五個 AI：打造你的 Agent 團隊',
      pitch: '我花了五個月實測一支 Agent 團隊：哪些工作真的能交給 Agent、哪些不行、人跟 Agent 怎麼分工。不談空泛的理論，談效能邊界與踩過的坑。',
      for: '技術社群、研討會、想導入 Agent 的團隊',
      given: ['WiDS Taiwan 2026'],
    },
    en: {
      title: 'Five AIs on My Team: Building Your Agent Team',
      pitch: 'Five months of running a team of AI agents in daily work: what you can actually hand to an agent, what you can’t, and how people and agents split the job. Less theory, more limits and pitfalls.',
      for: 'Tech communities, conferences, teams adopting agents',
      given: ['WiDS Taiwan 2026'],
    },
  },
  {
    id: 'openclaw',
    region: '龍蝦',
    post: '龍蝦-agent-skill-workflow',
    zh: {
      title: '萬能龍蝦助理：讓 AI Agent 真的幫你做事',
      pitch: '用 OpenClaw（龍蝦）處理簡報、會議記錄與行政流程，從安裝、Skill 與 Workflow 設計，一路談到資安與使用風險。適合想讓團隊實際用起來的企業內訓與工作坊。',
      for: '企業內訓、工作坊、非工程背景的團隊',
      given: ['企業內訓', 'GenAI 小聚', 'Taiwan OpenClaw Meetup', 'BRP OpenClaw Workshop'],
    },
    en: {
      title: 'The Do-Everything Lobster: Putting OpenClaw Agents to Work',
      pitch: 'Using OpenClaw for slides, meeting notes and everyday admin, from setup and skill and workflow design to security and the real risks. Built for in-house trainings and workshops where the goal is a team that actually uses it.',
      for: 'Corporate training, workshops, non-engineering teams',
      given: ['Corporate trainings', 'GenAI Meetup', 'Taiwan OpenClaw Meetup', 'BRP OpenClaw Workshop'],
    },
  },
  {
    id: 'side-project',
    region: 'Vibe Coding',
    post: 'r-ladies',
    zh: {
      title: '從 Side Project 到 Business：用 Vibe Coding 做出產品',
      pitch: 'AILogora 從看見 AI 知識碎片化的痛點、用 Vibe Coding 做出第一版，到面對「寫程式」與「做生意」之間的鴻溝。適合校園、新創社群與想把點子做成產品的人。',
      for: '校園、新創社群、創業者',
      given: ['R-Ladies Taipei × 台北大學統計系', 'Twinkle AI × GDG'],
    },
    en: {
      title: 'From Side Project to Business: Shipping a Product with Vibe Coding',
      pitch: 'How AILogora went from a pain point, AI knowledge scattered everywhere, to a first version built with vibe coding, and then across the gap between writing code and running a business. For campuses, startup communities and anyone turning an idea into a product.',
      for: 'Universities, startup communities, founders',
      given: ['R-Ladies Taipei × NTPU Statistics', 'Twinkle AI × GDG'],
    },
  },
  {
    id: 'judgment',
    zh: {
      title: '在 AI 快速變化的時代，找回思考的自主權',
      pitch: '新模型一週一個，AI FOMO 與資訊焦慮成了日常。這是一學期讀書會的主題：怎麼篩選資訊、怎麼建立自己的判斷力，而不是被演算法推著走。',
      for: '校園、讀書會、系列課程',
      given: ['政大 GDG On Campus 讀書會（三場）'],
    },
    en: {
      title: 'Keeping Your Own Judgment When AI Moves This Fast',
      pitch: 'A new model every week has made AI FOMO and information anxiety part of daily life. This ran as a semester-long study group: how to filter what matters and build your own judgment instead of being pushed around by the feed.',
      for: 'Universities, study groups, course series',
      given: ['GDG on Campus NCCU (three sessions)'],
    },
  },
];

export interface Format {
  zh: { name: string; text: string; example: string };
  en: { name: string; text: string; example: string };
}

export const formats: Format[] = [
  {
    zh: { name: '主題演講', text: '研討會、社群活動與校園演講。', example: 'AWS Summit Taipei、WiDS Taiwan、台灣人工智慧年會' },
    en: { name: 'Talks & keynotes', text: 'Conferences, community events and campus talks.', example: 'AWS Summit Taipei, WiDS Taiwan, Taiwan AI Annual Conference' },
  },
  {
    zh: { name: '工作坊', text: '帶大家動手做，現場就把 Agent 跑起來。', example: 'BRP OpenClaw Workshop' },
    en: { name: 'Workshops', text: 'Hands-on sessions where everyone leaves with an agent running.', example: 'BRP OpenClaw Workshop' },
  },
  {
    zh: { name: '企業內訓', text: '依團隊需求設計，單場或系列課程都可以。', example: '科技、運動科技與消費品企業的內訓' },
    en: { name: 'Corporate training', text: 'Designed around your team, as a single session or a series.', example: 'In-house trainings for tech, sports-tech and consumer companies' },
  },
  {
    zh: { name: 'AI 顧問', text: '從需求分析到技術落地，一起規劃與打造 GenAI 應用。', example: 'AI 解決方案諮詢、職涯諮詢' },
    en: { name: 'Advisory', text: 'From scoping to shipping, planning and building GenAI applications with your team.', example: 'GenAI solution consulting, career advice' },
  },
];
