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
 * - GET        /plans            - тарифные планы DJ
 * - GET        /subscription/:djId - текущая подписка DJ
 * - POST       /subscription/:djId/change - смена плана
 */

import { Hono } from 'npm:hono@4';
import * as kv from './kv_store.tsx';
import { recordRevenue } from './platform-revenue.tsx';

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

// ============================
// DJ SUBSCRIPTION PLANS
// ============================

// Canonical DJ plans (source of truth)
const DJ_SUBSCRIPTION_PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 0,
    priceYear: 0,
    currency: 'RUB',
    interval: 'month' as const,
    description: 'Для начинающих DJ',
    features: [
      'Профиль в каталоге',
      'До 5 миксов',
      'До 5 букингов/мес',
      'Базовая аналитика',
    ],
    limits: { mixes: 5, bookingsPerMonth: 5, dynamicPricing: false, promoAir: false, priority: false, referrals: false },
    popular: false,
    color: 'gray',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 1990,
    priceYear: 19900,
    currency: 'RUB',
    interval: 'month' as const,
    description: 'Для активных DJ',
    features: [
      'Безлимит миксов',
      'Безлимит букингов',
      'Динамические цены',
      'Promo.air интеграция',
      'Приоритет в каталоге',
      'Реферальная программа',
    ],
    limits: { mixes: -1, bookingsPerMonth: -1, dynamicPricing: true, promoAir: true, priority: true, referrals: true },
    popular: true,
    color: 'purple',
  },
  {
    id: 'agency',
    name: 'Agency',
    price: 9990,
    priceYear: 99900,
    currency: 'RUB',
    interval: 'month' as const,
    description: 'Для DJ-агентств',
    features: [
      'До 20 DJ в команде',
      'Единый дашборд',
      'Авто-распределение букингов',
      'API доступ',
      'Персональный менеджер',
    ],
    limits: { mixes: -1, bookingsPerMonth: -1, dynamicPricing: true, promoAir: true, priority: true, referrals: true, teamSize: 20, apiAccess: true },
    popular: false,
    color: 'amber',
  },
];

// GET /plans - тарифные планы DJ
app.get('/plans', async (c) => {
  try {
    return c.json({ success: true, data: DJ_SUBSCRIPTION_PLANS });
  } catch (error) {
    console.log(`[DJ Plans] Error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// GET /subscription/:djId - текущая подписка DJ
app.get('/subscription/:djId', async (c) => {
  try {
    const djId = c.req.param('djId');
    const subscription = await kv.get(`dj:subscription:${djId}`) as any;

    if (!subscription) {
      // Default: Starter (бесплатный)
      return c.json({
        success: true,
        data: {
          djId,
          planId: 'starter',
          planName: 'Starter',
          status: 'active',
          price: 0,
          startDate: new Date().toISOString(),
          endDate: null,
        },
      });
    }

    return c.json({ success: true, data: subscription });
  } catch (error) {
    console.log(`[DJ Subscription] Error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// POST /subscription/:djId/change - смена плана
app.post('/subscription/:djId/change', async (c) => {
  try {
    const djId = c.req.param('djId');
    const body = await c.req.json();
    const { planId, interval: reqInterval } = body;

    const plan = DJ_SUBSCRIPTION_PLANS.find(p => p.id === planId);
    if (!plan) {
      return c.json({ success: false, error: 'Invalid plan ID' }, 400);
    }

    const interval = reqInterval === 'year' ? 'year' : 'month';
    const now = new Date();
    const daysToAdd = interval === 'year' ? 365 : 30;
    const endDate = plan.price > 0
      ? new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000).toISOString()
      : null;
    const price = interval === 'year' ? plan.priceYear : plan.price;

    const subscription = {
      djId,
      planId: plan.id,
      planName: plan.name,
      status: 'active',
      price,
      currency: plan.currency,
      interval,
      startDate: now.toISOString(),
      endDate,
      limits: plan.limits,
      updatedAt: now.toISOString(),
    };

    await kv.set(`dj:subscription:${djId}`, subscription);

    // Record revenue for paid plans
    if (price > 0) {
      try {
        await recordRevenue({
          channel: 'dj_subscription',
          description: `DJ подписка ${plan.name} (${interval === 'year' ? 'годовая' : 'месячная'})`,
          grossAmount: price,
          platformRevenue: price,
          payoutAmount: 0,
          commissionRate: 1,
          payerId: djId,
          payerName: `DJ ${djId}`,
          metadata: { planId: plan.id, interval },
        });
      } catch (e) {
        console.log(`[DJ Subscription] Revenue recording failed: ${e}`);
      }
    }

    return c.json({ success: true, data: subscription });
  } catch (error) {
    console.log(`[DJ Subscription Change] Error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

export default app;