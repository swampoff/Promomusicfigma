import { Hono } from 'npm:hono@4';
import * as kv from './kv_store.tsx';
import { resolveUserId } from './resolve-user-id.tsx';

const profileRoutes = new Hono();
const DEMO_USER = 'demo-user';

// GET /profile
profileRoutes.get('/', async (c) => {
  try {
    const userId = await resolveUserId(c, DEMO_USER);
    const profile = await kv.get(`profile:${userId}`);
    return c.json({
      success: true,
      data: profile || {
        userId,
        name: 'New Artist',
        subscribers: 0,
        totalPlays: 0,
        totalTracks: 0,
      },
    });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// PUT /profile
profileRoutes.put('/', async (c) => {
  try {
    const userId = await resolveUserId(c, DEMO_USER);
    const body = await c.req.json();
    const existing = await kv.get(`profile:${userId}`);
    const updated = {
      ...(existing || { userId, subscribers: 0, totalPlays: 0, totalTracks: 0 }),
      ...body,
      userId,
      updatedAt: new Date().toISOString(),
    };
    await kv.set(`profile:${userId}`, updated);
    return c.json({ success: true, data: updated });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

export default profileRoutes;
