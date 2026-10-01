// 英文版頁面共用的分享卡片：/en/og.jpg
import type { APIRoute } from 'astro';
import { siteCard } from '../../lib/og';

export const GET: APIRoute = async () => new Response(new Uint8Array(await siteCard('en')), { headers: { 'Content-Type': 'image/jpeg' } });
