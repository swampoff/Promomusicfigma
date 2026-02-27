import { Hono } from 'npm:hono@4';
import * as kv from './kv_store.tsx';
import { resolveUserId } from './resolve-user-id.tsx';

const newsRoutes = new Hono();
const DEMO_USER = 'demo-user';

newsRoutes.get('/', async (c) => {
  try {
    const userId = await resolveUserId(c, DEMO_USER);
    const news = await kv.getByPrefix(`news:user:${userId}:`);
    return c.json({ success: true, data: news || [] });
  } catch (error) {
    return c.json({ success: true, data: [] });
  }
});

newsRoutes.post('/', async (c) => {
  try {
    const userId = await resolveUserId(c, DEMO_USER);
    const body = await c.req.json();
    const newsId = body.id || `news-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date().toISOString();
    const item = {
      id: newsId, likes: 0, comments: 0,
      ...body, userId,
      createdAt: body.createdAt || now, updatedAt: now,
    };
    await kv.set(`news:user:${userId}:${newsId}`, item);
    return c.json({ success: true, data: item }, 201);
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

export default newsRoutes;
