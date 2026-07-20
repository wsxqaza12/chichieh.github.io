export interface Project {
  name: string;
  summary: string;
  stack: string[];
  link?: string;
  status?: string;
  featured?: boolean;
}

export const projects: Project[] = [
  {
    name: 'Cairn',
    summary: '自己會長大的社群 wiki——人留下真實經驗，custodian agent「Moss」負責整理、連結與維護。Anthropic 全球 Hackathon 作品（錄取率 2.4%）。',
    stack: ['Next.js', 'Supabase', 'Claude Managed Agents', 'MCP'],
    link: 'https://youtu.be/n_OpVfxD7EA',
    status: '開發中',
    featured: true,
  },
  {
    name: 'LLMAvatarTalk',
    summary: '即時語音互動的 AI 虛擬助理：NVIDIA RIVA ASR/TTS × LangChain × Audio2Face，讓 Avatar 聽懂並回應語音。',
    stack: ['NVIDIA RIVA', 'LangChain', 'Audio2Face'],
    link: 'https://github.com/wsxqaza12/LLMAvatarTalk-An-Interactive-AI-Assistant',
    featured: true,
  },
  {
    name: 'GraphRAG 視覺化教學',
    summary: 'Microsoft GraphRAG 的實作與視覺化教學，附上已建好的索引檔，省下索引成本快速上手。',
    stack: ['GraphRAG', 'Python'],
    link: 'https://github.com/wsxqaza12/GraphRAG-Visualization-Tutorial',
    featured: true,
  },
  {
    name: 'agent-broker',
    summary: 'Discord ↔ ACP coding CLI 橋接器，讓 Claude Code、Codex、Gemini 等 coding agent 直接在 Discord 收發任務。',
    stack: ['TypeScript', 'ACP', 'Discord'],
    link: 'https://github.com/wsxqaza12/agent-broker',
  },
  {
    name: 'RAG_LangChain_streamlit',
    summary: 'RAG 實作教學範例：Streamlit + LangChain + Llama2，從零搭出自己的檢索增強應用。',
    stack: ['LangChain', 'Streamlit', 'Llama2'],
    link: 'https://github.com/wsxqaza12/RAG_LangChain_streamlit',
  },
  {
    name: 'LLM 規格比較',
    summary: '主流 LLM（ChatGPT、Gemini、Claude、Mistral、Llama…）的規格盤點與比較表。',
    stack: ['Research'],
    link: 'https://github.com/wsxqaza12/Comparison-of-LLM-Specifications',
  },
  {
    name: 'skill-openclaw-map',
    summary: 'OpenClaw（龍蝦）的 Skill 整理地圖，把散落的技能與工作流收斂成一張可查的地圖。',
    stack: ['OpenClaw', 'Markdown'],
    link: 'https://github.com/wsxqaza12/skill-openclaw-map',
  },
];
