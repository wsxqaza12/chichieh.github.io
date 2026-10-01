// 地圖用的文章精簡資料（首頁地形圖、文章頁位置圖共用，瀏覽器會快取）
import { getSummaries } from '../lib/posts';

export async function GET() {
  return new Response(JSON.stringify(await getSummaries()), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
