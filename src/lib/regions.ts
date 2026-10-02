// 寫作地形圖的「區域」：首頁地圖由南（下）到北（上）排列。
// 每篇文章依標題與網址自動歸到一個區域；文章 frontmatter 寫 `region: Agent` 可以手動指定。

export interface Region {
  key: string; // 主題名，也是 frontmatter region 的值
  suffix: string; // 地名後綴：RAG 盆地、Agent 山脈
  en: string; // 地形英文（地圖上的小字）
  name: string; // 英文版的地名
  id: string; // 英文版網址參數用（?r=memory），避免網址出現中文
}

export const REGIONS: Region[] = [
  { key: '資料工程', suffix: '低地', en: 'LOWLANDS', name: 'Data Lowlands', id: 'data' },
  { key: 'LLM', suffix: '高原', en: 'PLATEAU', name: 'LLM Plateau', id: 'llm' },
  { key: 'RAG', suffix: '盆地', en: 'BASIN', name: 'RAG Basin', id: 'rag' },
  { key: '語音・Avatar', suffix: '丘陵', en: 'HILLS', name: 'Voice & Avatar Hills', id: 'voice' },
  { key: 'Vibe Coding', suffix: '河谷', en: 'VALLEY', name: 'Vibe Coding Valley', id: 'vibe-coding' },
  { key: 'Agent', suffix: '山脈', en: 'RANGE', name: 'Agent Range', id: 'agent' },
  { key: '龍蝦', suffix: '灣', en: 'BAY', name: 'OpenClaw Bay', id: 'openclaw' },
  { key: 'MCP', suffix: '隘口', en: 'PASS', name: 'MCP Pass', id: 'mcp' },
  { key: '記憶', suffix: '峰', en: 'SUMMIT', name: 'Memory Summit', id: 'memory' },
];

export const regionName = (key: string, lang: 'zh' | 'en' = 'zh') => {
  const r = REGIONS.find((x) => x.key === key);
  return r ? (lang === 'en' ? r.name : r.key + r.suffix) : key;
};

// 依序比對，第一個命中的規則勝出（順序有意義：記憶 > MCP > 龍蝦 > Agent …）
const RULES: [string, RegExp][] = [
  ['記憶', /memory|記憶(?!體)|jev|知識|aws-跟/i],
  ['MCP', /^mcp/i],
  ['龍蝦', /openclaw|龍蝦|養蝦|商周|非凡|公視|antigravity|cowork/i],
  ['Agent', /agent|harness|資安|broker|openmanus|通訊協定|mutiagent|multi-agent|hackathon|wids|step-deep|pahub|產業落地/i],
  ['語音・Avatar', /語音|voice|avatar|d2e|embodied/i],
  ['RAG', /rag|graphrag/i],
  ['Vibe Coding', /vibe|v0|coding|ai寫的|software developers|uv|ngrok|ailogora|anti-ai|可觀測|eval|google|殭屍|r-ladies/i],
  ['LLM', /llm|llama|gpt|prompt|deepseek|reasoning|huggingface|壓縮|評估|karpathy|2025|情緒|ck wu|回答|預訓練|multi-tw/i],
  ['資料工程', /pandas|polars|cudf|wsl|clustering|api|開源|pr/i],
];

// 規則猜錯的個案，用網址 id 釘住
const OVERRIDES: Record<string, string> = {
  'e2d02dd25fd9': 'LLM', // 記憶體不夠? 來看 LLM 的壓縮技術（「記憶體」不是記憶）
  '42628a4362f7': 'LLM', // LLM 評估教學 | EleutherAI LM Evaluation Harness
};

export function regionOf(id: string, title: string, override?: string): string {
  if (override && REGIONS.some((r) => r.key === override)) return override;
  if (OVERRIDES[id]) return OVERRIDES[id];
  const key = `${id} ${title}`;
  return (RULES.find(([, re]) => re.test(key)) ?? ['LLM'])[0];
}
