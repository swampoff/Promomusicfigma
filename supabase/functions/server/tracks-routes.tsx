import { Hono } from 'npm:hono@4';
import * as kv from './kv_store.tsx';
import { resolveUserId } from './resolve-user-id.tsx';

const tracksRoutes = new Hono();
const DEMO_USER = 'demo-user';

// GET /tracks — all tracks for user
tracksRoutes.get('/', async (c) => {
  try {
    const userId = await resolveUserId(c, DEMO_USER);
    const tracks = await kv.getByPrefix(`track:user:${userId}:`);
    return c.json({ success: true, data: tracks || [] });
  } catch (error) {
    console.error('Error GET /tracks:', error);
    return c.json({ success: true, data: [] });
  }
});

// GET /tracks/:id
tracksRoutes.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const userId = await resolveUserId(c, DEMO_USER);
    const track = await kv.get(`track:user:${userId}:${id}`);
    if (!track) return c.json({ success: false, error: 'Track not found' }, 404);
    return c.json({ success: true, data: track });
  } catch (error) {
    console.error('Error GET /tracks/:id:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// POST /tracks — create
tracksRoutes.post('/', async (c) => {
  try {
    const userId = await resolveUserId(c, DEMO_USER);
    const body = await c.req.json();
    const trackId = body.id || `track-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date().toISOString();
    const track = {
      id: trackId,
      plays: 0,
      likes: 0,
      downloads: 0,
      ...body,
      userId,
      createdAt: body.createdAt || now,
      updatedAt: now,
    };
    await kv.set(`track:user:${userId}:${trackId}`, track);
    return c.json({ success: true, data: track }, 201);
  } catch (error) {
    console.error('Error POST /tracks:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// PUT /tracks/:id — update
tracksRoutes.put('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const userId = await resolveUserId(c, DEMO_USER);
    const existing = await kv.get(`track:user:${userId}:${id}`);
    if (!existing) return c.json({ success: false, error: 'Track not found' }, 404);
    const body = await c.req.json();
    const updated = { ...existing, ...body, id, userId, updatedAt: new Date().toISOString() };
    await kv.set(`track:user:${userId}:${id}`, updated);
    return c.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error PUT /tracks/:id:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// DELETE /tracks/:id
tracksRoutes.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const userId = await resolveUserId(c, DEMO_USER);
    await kv.del(`track:user:${userId}:${id}`);
    return c.json({ success: true, message: 'Track deleted' });
  } catch (error) {
    console.error('Error DELETE /tracks/:id:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

export default tracksRoutes;
