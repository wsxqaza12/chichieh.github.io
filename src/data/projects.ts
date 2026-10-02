// 作品。第一個是首頁與作品頁的主打（基地營），featured 的會在作品頁放大顯示。
// en 是英文版的文字；沒有填的欄位英文版會沿用中文。

export interface Project {
  name: string;
  summary: string;
  stack: string[];
  link?: string;
  /** 連結的說明（預設依網址判斷：GitHub / 看看） */
  linkLabel?: string;
  status?: string;
  year?: string;
  /** 作品頁放大顯示 */
  featured?: boolean;
  /** 放大顯示時的圖（public/ 底下的路徑） */
  image?: string;
  /** 一句亮點，例如入選的加速器 */
  note?: string;
  en?: { name?: string; summary: string; status?: string; note?: string; linkLabel?: string };
}

export const projects: Project[] = [
  {
    name: 'Cairn',
    summary: '自己會長大的社群 wiki——人留下真實經驗，custodian agent「Moss」負責整理、連結與維護。Anthropic 全球 Hackathon 作品（錄取率 2.4%）。',
    stack: ['Next.js', 'Supabase', 'Claude Managed Agents', 'MCP'],
    link: 'https://youtu.be/n_OpVfxD7EA',
    linkLabel: '看 Demo 影片',
    status: '開發中',
    year: '2026',
    featured: true,
    note: 'Anthropic 全球 Hackathon 入選 · 錄取率 2.4%',
    en: {
      summary: 'Shared memory for people and AI agents. People leave real experience as field notes, and Moss, a custodian agent, organizes, links and maintains them. Built solo in six days for Anthropic’s global hackathon.',
      status: 'In development',
      note: 'Selected for Anthropic’s global hackathon · 500 of 20,000+ applicants',
      linkLabel: 'Watch the demo',
    },
  },
  {
    name: 'AILogora',
    summary: '以觀點為主體、以主題為架構、以中文為核心的 AI 技術實作者社群平台：觀點卡、討論、知識地圖，每週寄出 AILogora 週報。',
    stack: ['Next.js', 'Bun', 'Supabase', 'AWS'],
    link: 'https://ailogora.com',
    linkLabel: '前往 AILogora',
    status: '營運中',
    year: '2025',
    featured: true,
    image: '/assets/img/projects/ailogora.webp',
    note: 'AppWorks Accelerator #31',
    en: {
      summary: 'A Chinese-first community for AI practitioners, organized around viewpoints and topics: perspective cards, discussions, a knowledge map, and a weekly digest for nearly 4,000 subscribers.',
      status: 'Live',
      note: 'AppWorks Accelerator #31',
      linkLabel: 'Visit AILogora',
    },
  },
  {
    name: 'LLMAvatarTalk',
    summary: '即時語音互動的 AI 虛擬助理：NVIDIA RIVA ASR/TTS × LangChain × Audio2Face，讓 Avatar 聽懂並回應語音。',
    stack: ['NVIDIA RIVA', 'LangChain', 'Audio2Face'],
    link: 'https://github.com/wsxqaza12/LLMAvatarTalk-An-Interactive-AI-Assistant',
    year: '2024',
    en: { summary: 'A real-time voice assistant with an animated avatar, built on NVIDIA Riva ASR/TTS, LangChain and Audio2Face. Top 100 in the NVIDIA × LangChain Generative AI Agents Developer Contest.' },
  },
  {
    name: 'GraphRAG 視覺化教學',
    summary: 'Microsoft GraphRAG 的實作與視覺化教學，附上已建好的索引檔，省下索引成本快速上手。',
    stack: ['GraphRAG', 'Python'],
    link: 'https://github.com/wsxqaza12/GraphRAG-Visualization-Tutorial',
    year: '2024',
    en: { name: 'GraphRAG Visualization Tutorial', summary: 'A hands-on guide to Microsoft GraphRAG with visualizations and a prebuilt index, so you can explore it without paying for indexing.' },
  },
  {
    name: 'cairn-memory',
    summary: 'Cairn 的開源記憶層：讓 AI Agent 跨 session 記住事情，每條記憶都附上「收據」，也就是它從哪段原文學來的。可以查看、修正，忘掉的就真的不會再回來。',
    stack: ['JavaScript', 'SQLite', 'MCP', 'Claude Code plugin'],
    link: 'https://github.com/Cairn-ink/cairn-memory',
    year: '2026',
    en: { summary: 'The open-source memory layer behind Cairn: cross-session memory for AI agents where every memory carries a receipt, the exact source text it came from. Inspect it, correct it, or forget it for good.' },
  },
  {
    name: 'RAG_LangChain_streamlit',
    summary: 'RAG 實作教學範例：Streamlit + LangChain + Llama2，從零搭出自己的檢索增強應用。',
    stack: ['LangChain', 'Streamlit', 'Llama2'],
    link: 'https://github.com/wsxqaza12/RAG_LangChain_streamlit',
    year: '2024',
    en: { summary: 'A from-scratch retrieval-augmented generation example with Streamlit, LangChain and Llama 2.' },
  },
  {
    name: 'LLM 規格比較',
    summary: '主流 LLM（ChatGPT、Gemini、Claude、Mistral、Llama…）的規格盤點與比較表。',
    stack: ['Research'],
    link: 'https://github.com/wsxqaza12/Comparison-of-LLM-Specifications',
    year: '2024',
    en: { name: 'LLM Spec Comparison', summary: 'A side-by-side comparison of mainstream LLMs: ChatGPT, Gemini, Claude, Mistral, Llama and more.' },
  },
  {
    name: 'skill-openclaw-map',
    summary: 'OpenClaw（龍蝦）的 Skill 整理地圖，把散落的技能與工作流收斂成一張可查的地圖。',
    stack: ['OpenClaw', 'Markdown'],
    link: 'https://github.com/wsxqaza12/skill-openclaw-map',
    year: '2026',
    en: { summary: 'A map of OpenClaw skills and workflows, gathered into one place you can actually search.' },
  },
];

/** 依語言取作品的文字 */
export function projectText(p: Project, lang: 'zh' | 'en') {
  const e = lang === 'en' ? p.en : undefined;
  const label = e?.linkLabel ?? p.linkLabel ?? (p.link?.includes('github.com') ? 'GitHub' : lang === 'en' ? 'Visit' : '看看');
  return { name: e?.name ?? p.name, summary: e?.summary ?? p.summary, status: e?.status ?? p.status, note: e?.note ?? p.note, label };
}
