/**
 * DJ MARKETPLACE ROUTES
 * Public endpoints for DJ Marketplace catalog
 * Uses KV store with prefix dj:profile:, dj:mixes:, dj:reviews:, dj:calendar:
 */

import { Hono } from "npm:hono@4";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// ═══════ SEED DATA (initial profiles) ═══════

const SEED_PROFILES = [
  {
    id: 'dj-1', name: 'DJ Pulse',
    photo: 'https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?w=400&h=400&fit=crop&crop=face',
    city: 'Москва', genres: ['House', 'Deep House', 'Techno'],
    rating: 4.9, reviewsCount: 34, priceFrom: 25000, experience: '8 лет',
    verified: true, available: true, topGenre: 'House', completedGigs: 7,
    bio: 'Резидент лучших клубов Москвы. Энергичные сеты от deep до tech house.',
    tags: ['Клубы', 'Фестивали', 'Корпоративы'],
  },
  {
    id: 'dj-2', name: 'DJ Stella',
    photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
    city: 'Санкт-Петербург', genres: ['Pop', 'R&B', 'Disco', 'Open Format'],
    rating: 5.0, reviewsCount: 42, priceFrom: 30000, experience: '6 лет',
    verified: true, available: true, topGenre: 'Open Format', completedGigs: 12,
    bio: 'Свадебный и event DJ №1 в Питере. Знаю, как сделать ваш праздник незабываемым.',
    tags: ['Свадьбы', 'Корпоративы', 'Дни рождения'],
  },
  {
    id: 'dj-3', name: 'DJ Nexus',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    city: 'Казань', genres: ['Techno', 'Trance', 'EDM'],
    rating: 4.7, reviewsCount: 18, priceFrom: 15000, experience: '4 года',
    verified: true, available: false, topGenre: 'Techno', completedGigs: 3,
    bio: 'Dark techno и melodic trance. Постоянный гость андеграундных вечеринок.',
    tags: ['Клубы', 'Underground', 'Рейвы'],
  },
  {
    id: 'dj-4', name: 'DJ Mirage',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face',
    city: 'Сочи', genres: ['Lounge', 'Deep House', 'Disco'],
    rating: 4.8, reviewsCount: 27, priceFrom: 20000, experience: '5 лет',
    verified: true, available: true, topGenre: 'Lounge', completedGigs: 9,
    bio: 'Beach party и lounge атмосфера. Летние сеты у бассейна - мой конёк.',
    tags: ['Beach Party', 'Lounge', 'Рестораны'],
  },
  {
    id: 'dj-5', name: 'DJ Volt',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
    city: 'Екатеринбург', genres: ['EDM', 'House', 'Drum & Bass'],
    rating: 4.6, reviewsCount: 15, priceFrom: 18000, experience: '3 года',
    verified: false, available: true, topGenre: 'EDM', completedGigs: 5,
    bio: 'Энергия на максимум! EDM, bass house и drum & bass для взрывных вечеринок.',
    tags: ['Фестивали', 'Клубы', 'Студенческие'],
  },
  {
    id: 'dj-6', name: 'DJ Aurora',
    photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face',
    city: 'Москва', genres: ['Trance', 'EDM', 'House'],
    rating: 4.9, reviewsCount: 31, priceFrom: 35000, experience: '10 лет',
    verified: true, available: true, topGenre: 'Trance', completedGigs: 11,
    bio: 'Emotional trance и progressive house. Создаю атмосферу, которую вы запомните навсегда.',
    tags: ['Фестивали', 'Клубы', 'Open Air'],
  },
  {
    id: 'dj-7', name: 'DJ Crypto',
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face',
    city: 'Краснодар', genres: ['Hip-Hop', 'R&B', 'Pop'],
    rating: 4.5, reviewsCount: 12, priceFrom: 12000, experience: '2 года',
    verified: false, available: true, topGenre: 'Hip-Hop', completedGigs: 4,
    bio: 'Hip-hop, trap и R&B. Молодой, энергичный, всегда на одной волне с аудиторией.',
    tags: ['Вечеринки', 'Студенческие', 'Бары'],
  },
  {
    id: 'dj-8', name: 'DJ Phantom',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    city: 'Новосибирск', genres: ['Techno', 'Deep House', 'House'],
    rating: 4.8, reviewsCount: 22, priceFrom: 22000, experience: '7 лет',
    verified: true, available: true, topGenre: 'Deep House', completedGigs: 8,
    bio: 'Глубокий саунд и минимализм. Резидент клуба Tele-Club. Миксы на Mixcloud: 50K+ plays.',
    tags: ['Клубы', 'After-party', 'Корпоративы'],
  },
];

const SEED_MIXES: Record<string, any[]> = {
  'dj-1': [
    { id: 'm1-1', title: 'Summer Vibes 2025', genre: 'Deep House', duration: '1:12:00', plays: 1240, likes: 87 },
    { id: 'm1-2', title: 'Late Night Sessions', genre: 'Techno', duration: '58:30', plays: 890, likes: 64 },
  ],
  'dj-2': [
    { id: 'm2-1', title: 'Wedding Mix - Romantic', genre: 'Open Format', duration: '45:00', plays: 2100, likes: 152 },
    { id: 'm2-2', title: 'Party Starter', genre: 'Pop', duration: '1:00:00', plays: 1500, likes: 98 },
  ],
};

const SEED_REVIEWS: Record<string, any[]> = {
  'dj-1': [
    { id: 'r1', author: 'Анна К.', date: '14 янв 2026', rating: 5, text: 'Отличный DJ! Все гости танцевали до утра.', eventType: 'Свадьба' },
    { id: 'r2', author: 'Максим Д.', date: '28 дек 2025', rating: 5, text: 'Корпоратив прошёл на ура!', eventType: 'Корпоратив' },
  ],
  'dj-2': [
    { id: 'r3', author: 'Елена С.', date: '10 янв 2026', rating: 5, text: 'Лучший свадебный DJ!', eventType: 'Свадьба' },
  ],
};

// ═══════ SEED ENDPOINT (idempotent) ═══════

app.post('/seed', async (c) => {
  try {
    console.log('🌱 Seeding DJ Marketplace data...');

    // Check if already seeded
    const existing = await kv.get('dj:marketplace:seeded');
    if (existing) {
      return c.json({ success: true, message: 'Already seeded' });
    }

    // Seed profiles
    const seedKeys = SEED_PROFILES.map(p => `dj:profile:${p.id}`);
    const seedValues = SEED_PROFILES.map(p => p);
    await kv.mset(seedKeys, seedValues);

    // Seed mixes
    for (const [djId, mixes] of Object.entries(SEED_MIXES)) {
      await kv.set(`dj:mixes:${djId}`, mixes);
    }

    // Seed reviews
    for (const [djId, reviews] of Object.entries(SEED_REVIEWS)) {
      await kv.set(`dj:reviews:${djId}`, reviews);
    }

    // Index: list of all DJ IDs for quick listing
    await kv.set('dj:marketplace:index', SEED_PROFILES.map(p => p.id));
    await kv.set('dj:marketplace:seeded', true);

    console.log(`✅ Seeded ${SEED_PROFILES.length} DJ profiles`);
    return c.json({ success: true, count: SEED_PROFILES.length });
  } catch (err: any) {
    console.error('❌ Seed error:', err);
    return c.json({ success: false, error: `Seed error: ${err.message}` }, 500);
  }
});

// ═══════ GET /djs — List all DJs (public) ═══════

app.get('/djs', async (c) => {
  try {
    // Get index
    let index = await kv.get('dj:marketplace:index') as string[] | null;

    // Auto-seed if empty
    if (!index || index.length === 0) {
      console.log('Auto-seeding DJ data on first request...');
      const autoSeedKeys = SEED_PROFILES.map(p => `dj:profile:${p.id}`);
      const autoSeedValues = SEED_PROFILES.map(p => p);
      await kv.mset(autoSeedKeys, autoSeedValues);
      for (const [djId, mixes] of Object.entries(SEED_MIXES)) {
        await kv.set(`dj:mixes:${djId}`, mixes);
      }
      for (const [djId, reviews] of Object.entries(SEED_REVIEWS)) {
        await kv.set(`dj:reviews:${djId}`, reviews);
      }
      index = SEED_PROFILES.map(p => p.id);
      await kv.set('dj:marketplace:index', index);
      await kv.set('dj:marketplace:seeded', true);
    }

    // Fetch all profiles
    const keys = index.map(id => `dj:profile:${id}`);
    const profiles = await kv.mget(keys);
    const validProfiles = profiles.filter(Boolean);

    // Server-side filtering
    const query = c.req.query();
    let result = [...validProfiles] as any[];

    if (query.city) {
      result = result.filter((p: any) => p.city === query.city);
    }
    if (query.genre) {
      result = result.filter((p: any) => p.genres?.includes(query.genre));
    }
    if (query.verified === 'true') {
      result = result.filter((p: any) => p.verified);
    }
    if (query.available === 'true') {
      result = result.filter((p: any) => p.available);
    }
    if (query.price_min) {
      result = result.filter((p: any) => p.priceFrom >= Number(query.price_min));
    }
    if (query.price_max && query.price_max !== 'Infinity') {
      result = result.filter((p: any) => p.priceFrom <= Number(query.price_max));
    }
    if (query.search) {
      const q = query.search.toLowerCase();
      result = result.filter((p: any) =>
        p.name.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.genres.some((g: string) => g.toLowerCase().includes(q)) ||
        p.tags.some((t: string) => t.toLowerCase().includes(q))
      );
    }

    // Sort
    const sortBy = query.sort || 'rating';
    result.sort((a: any, b: any) => {
      switch (sortBy) {
        case 'rating': return b.rating - a.rating;
        case 'price_asc': return a.priceFrom - b.priceFrom;
        case 'price_desc': return b.priceFrom - a.priceFrom;
        case 'popularity': return b.completedGigs - a.completedGigs;
        default: return 0;
      }
    });

    return c.json({ success: true, data: result, total: result.length });
  } catch (err: any) {
    console.error('❌ Error fetching DJ list:', err);
    return c.json({ success: false, error: `Failed to fetch DJs: ${err.message}` }, 500);
  }
});

// ═══════ GET /djs/:id — Single DJ profile (public) ═══════

app.get('/djs/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const profile = await kv.get(`dj:profile:${id}`);
    if (!profile) {
      return c.json({ success: false, error: `DJ not found: ${id}` }, 404);
    }
    return c.json({ success: true, data: profile });
  } catch (err: any) {
    console.error('❌ Error fetching DJ profile:', err);
    return c.json({ success: false, error: `Failed to fetch DJ: ${err.message}` }, 500);
  }
});

// ═══════ GET /djs/:id/mixes — DJ mixes (public) ═══════

app.get('/djs/:id/mixes', async (c) => {
  try {
    const id = c.req.param('id');
    const mixes = await kv.get(`dj:mixes:${id}`) || [];
    return c.json({ success: true, data: mixes });
  } catch (err: any) {
    console.error('❌ Error fetching DJ mixes:', err);
    return c.json({ success: false, error: `Failed to fetch mixes: ${err.message}` }, 500);
  }
});

// ═══════ GET /djs/:id/reviews — DJ reviews (public) ═══════

app.get('/djs/:id/reviews', async (c) => {
  try {
    const id = c.req.param('id');
    const reviews = await kv.get(`dj:reviews:${id}`) || [];
    return c.json({ success: true, data: reviews });
  } catch (err: any) {
    console.error('❌ Error fetching DJ reviews:', err);
    return c.json({ success: false, error: `Failed to fetch reviews: ${err.message}` }, 500);
  }
});

// ═══════ GET /djs/:id/calendar — DJ availability (public) ═══════

app.get('/djs/:id/calendar', async (c) => {
  try {
    const id = c.req.param('id');
    // Check for stored calendar, or generate default
    let calendar = await kv.get(`dj:calendar:${id}`);
    if (!calendar) {
      // Generate default 21-day calendar
      const days = [];
      const now = new Date();
      for (let i = 0; i < 21; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() + i);
        days.push({
          date: d.toISOString().split('T')[0],
          dayOfWeek: d.toLocaleDateString('ru-RU', { weekday: 'short' }),
          dayNum: d.getDate(),
          month: d.toLocaleDateString('ru-RU', { month: 'short' }),
          available: Math.random() > 0.35,
        });
      }
      calendar = days;
    }
    return c.json({ success: true, data: calendar });
  } catch (err: any) {
    console.error('❌ Error fetching DJ calendar:', err);
    return c.json({ success: false, error: `Failed to fetch calendar: ${err.message}` }, 500);
  }
});

// ═══════ POST /djs/:id/book — Request booking (requires login intent) ═══════

app.post('/djs/:id/book', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    
    const profile = await kv.get(`dj:profile:${id}`);
    if (!profile) {
      return c.json({ success: false, error: `DJ not found: ${id}` }, 404);
    }

    const bookingId = `booking-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const booking = {
      id: bookingId,
      djId: id,
      djName: (profile as any).name,
      clientName: body.clientName || 'Аноним',
      clientEmail: body.clientEmail || '',
      eventDate: body.eventDate || '',
      eventType: body.eventType || '',
      message: body.message || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    await kv.set(`dj:booking:${bookingId}`, booking);

    // Add to DJ's bookings list
    const existingBookings = (await kv.get(`dj:bookings:${id}`) || []) as string[];
    existingBookings.push(bookingId);
    await kv.set(`dj:bookings:${id}`, existingBookings);

    console.log(`📅 New booking request: ${bookingId} for DJ ${id}`);
    return c.json({ success: true, data: booking });
  } catch (err: any) {
    console.error('❌ Booking error:', err);
    return c.json({ success: false, error: `Booking failed: ${err.message}` }, 500);
  }
});

export default app;