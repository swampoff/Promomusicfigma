/**
 * DJ STUDIO ROUTES - События и Коллаборации DJ
 * 
 * Endpoints:
 * - GET/POST   /events           - список событий DJ / создание
 * - GET/PUT    /events/:id       - детали / обновление события
 * - DELETE     /events/:id       - удаление события
 * - GET/POST   /collaborations   - коллаборации DJ
 * - PUT        /collaborations/:id/accept  - принять коллаборацию
 * - PUT        /collaborations/:id/decline - отклонить
 * - GET        /notifications    - уведомления DJ
 * - POST       /notifications/read - пометить прочитанным
 */

import { Hono } from 'npm:hono@4';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Helper: получить userId из заголовка
function getUserId(c: any): string {
  return c.req.header('X-User-Id') || 'dj-1';
}

// ============================
// DJ EVENTS
// ============================

// GET /events - список событий DJ
app.get('/events', async (c) => {
  try {
    const djId = getUserId(c);
    const status = c.req.query('status'); // upcoming | completed | all

    const raw = await kv.get(`dj:events:${djId}`);
    let events: any[] = raw ? JSON.parse(raw) : [];

    if (status && status !== 'all') {
      const now = new Date();
      events = events.filter(e => {
        const eventDate = new Date(e.date);
        if (status === 'upcoming') return eventDate >= now || e.status === 'confirmed' || e.status === 'upcoming';
        if (status === 'completed') return e.status === 'completed';
        return true;
      });
    }

    events.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return c.json({ success: true, data: events, meta: { total: events.length } });
  } catch (error) {
    console.error('Error fetching DJ events:', error);
    return c.json({ error: 'Failed to fetch events', details: String(error) }, 500);
  }
});

// POST /events - создать событие
app.post('/events', async (c) => {
  try {
    const djId = getUserId(c);
    const body = await c.req.json();

    const event = {
      id: `dj-event-${Date.now()}`,
      title: body.title || 'Без названия',
      venue: body.venue || '',
      city: body.city || '',
      date: body.date || new Date().toISOString().split('T')[0],
      time: body.time || '23:00',
      type: body.type || 'club',
      status: 'upcoming',
      fee: body.fee || 0,
      capacity: body.capacity || 0,
      ticketsSold: 0,
      notes: body.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const raw = await kv.get(`dj:events:${djId}`);
    const events: any[] = raw ? JSON.parse(raw) : [];
    events.push(event);
    await kv.set(`dj:events:${djId}`, JSON.stringify(events));

    return c.json({ success: true, data: event }, 201);
  } catch (error) {
    console.error('Error creating DJ event:', error);
    return c.json({ error: 'Failed to create event', details: String(error) }, 500);
  }
});

// GET /events/:id
app.get('/events/:id', async (c) => {
  try {
    const djId = getUserId(c);
    const eventId = c.req.param('id');
    const raw = await kv.get(`dj:events:${djId}`);
    const events: any[] = raw ? JSON.parse(raw) : [];
    const event = events.find(e => e.id === eventId);

    if (!event) return c.json({ error: 'Event not found' }, 404);
    return c.json({ success: true, data: event });
  } catch (error) {
    return c.json({ error: 'Failed to fetch event', details: String(error) }, 500);
  }
});

// PUT /events/:id
app.put('/events/:id', async (c) => {
  try {
    const djId = getUserId(c);
    const eventId = c.req.param('id');
    const body = await c.req.json();

    const raw = await kv.get(`dj:events:${djId}`);
    const events: any[] = raw ? JSON.parse(raw) : [];
    const idx = events.findIndex(e => e.id === eventId);
    if (idx === -1) return c.json({ error: 'Event not found' }, 404);

    events[idx] = { ...events[idx], ...body, updatedAt: new Date().toISOString() };
    await kv.set(`dj:events:${djId}`, JSON.stringify(events));

    return c.json({ success: true, data: events[idx] });
  } catch (error) {
    return c.json({ error: 'Failed to update event', details: String(error) }, 500);
  }
});

// DELETE /events/:id
app.delete('/events/:id', async (c) => {
  try {
    const djId = getUserId(c);
    const eventId = c.req.param('id');

    const raw = await kv.get(`dj:events:${djId}`);
    let events: any[] = raw ? JSON.parse(raw) : [];
    events = events.filter(e => e.id !== eventId);
    await kv.set(`dj:events:${djId}`, JSON.stringify(events));

    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: 'Failed to delete event', details: String(error) }, 500);
  }
});

// ============================
// DJ COLLABORATIONS
// ============================

// GET /collaborations
app.get('/collaborations', async (c) => {
  try {
    const djId = getUserId(c);
    const status = c.req.query('status'); // incoming | active | completed | all

    const raw = await kv.get(`dj:collabs:${djId}`);
    let collabs: any[] = raw ? JSON.parse(raw) : [];

    if (status && status !== 'all') {
      collabs = collabs.filter(col => col.status === status);
    }

    collabs.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return c.json({ success: true, data: collabs, meta: { total: collabs.length } });
  } catch (error) {
    console.error('Error fetching DJ collaborations:', error);
    return c.json({ error: 'Failed to fetch collaborations', details: String(error) }, 500);
  }
});

// POST /collaborations
app.post('/collaborations', async (c) => {
  try {
    const djId = getUserId(c);
    const body = await c.req.json();

    const collab = {
      id: `dj-collab-${Date.now()}`,
      djName: body.djName || '',
      djCity: body.djCity || '',
      genres: body.genres || [],
      type: body.type || 'b2b',
      message: body.message || '',
      date: new Date().toISOString().split('T')[0],
      status: 'outgoing',
      createdAt: new Date().toISOString(),
    };

    const raw = await kv.get(`dj:collabs:${djId}`);
    const collabs: any[] = raw ? JSON.parse(raw) : [];
    collabs.push(collab);
    await kv.set(`dj:collabs:${djId}`, JSON.stringify(collabs));

    return c.json({ success: true, data: collab }, 201);
  } catch (error) {
    return c.json({ error: 'Failed to create collaboration', details: String(error) }, 500);
  }
});

// PUT /collaborations/:id/accept
app.put('/collaborations/:id/accept', async (c) => {
  try {
    const djId = getUserId(c);
    const collabId = c.req.param('id');

    const raw = await kv.get(`dj:collabs:${djId}`);
    const collabs: any[] = raw ? JSON.parse(raw) : [];
    const idx = collabs.findIndex(col => col.id === collabId);
    if (idx === -1) return c.json({ error: 'Collaboration not found' }, 404);

    collabs[idx].status = 'active';
    collabs[idx].acceptedAt = new Date().toISOString();
    await kv.set(`dj:collabs:${djId}`, JSON.stringify(collabs));

    return c.json({ success: true, data: collabs[idx] });
  } catch (error) {
    return c.json({ error: 'Failed to accept collaboration', details: String(error) }, 500);
  }
});

// PUT /collaborations/:id/decline
app.put('/collaborations/:id/decline', async (c) => {
  try {
    const djId = getUserId(c);
    const collabId = c.req.param('id');

    const raw = await kv.get(`dj:collabs:${djId}`);
    const collabs: any[] = raw ? JSON.parse(raw) : [];
    const idx = collabs.findIndex(col => col.id === collabId);
    if (idx === -1) return c.json({ error: 'Collaboration not found' }, 404);

    collabs[idx].status = 'declined';
    collabs[idx].declinedAt = new Date().toISOString();
    await kv.set(`dj:collabs:${djId}`, JSON.stringify(collabs));

    return c.json({ success: true, data: collabs[idx] });
  } catch (error) {
    return c.json({ error: 'Failed to decline collaboration', details: String(error) }, 500);
  }
});

// ============================
// DJ NOTIFICATIONS
// ============================

// GET /notifications
app.get('/notifications', async (c) => {
  try {
    const djId = getUserId(c);
    const raw = await kv.get(`dj:notifications:${djId}`);
    const notifications: any[] = raw ? JSON.parse(raw) : [];

    notifications.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return c.json({
      success: true,
      data: notifications,
      meta: {
        total: notifications.length,
        unread: notifications.filter((n: any) => !n.read).length,
      },
    });
  } catch (error) {
    return c.json({ error: 'Failed to fetch notifications', details: String(error) }, 500);
  }
});

// POST /notifications/read
app.post('/notifications/read', async (c) => {
  try {
    const djId = getUserId(c);
    const body = await c.req.json();
    const notificationIds: string[] = body.ids || [];

    const raw = await kv.get(`dj:notifications:${djId}`);
    const notifications: any[] = raw ? JSON.parse(raw) : [];

    for (const n of notifications) {
      if (notificationIds.length === 0 || notificationIds.includes(n.id)) {
        n.read = true;
      }
    }

    await kv.set(`dj:notifications:${djId}`, JSON.stringify(notifications));
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: 'Failed to mark notifications as read', details: String(error) }, 500);
  }
});

export default app;
