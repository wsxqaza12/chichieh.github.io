// 首頁與其他頁面共用的分享卡片：/og.jpg
import type { APIRoute } from 'astro';
import { siteCard } from '../lib/og';

export const GET: APIRoute = async () => new Response(new Uint8Array(await siteCard()), { headers: { 'Content-Type': 'image/jpeg' } });
