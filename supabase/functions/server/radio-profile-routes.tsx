/**
 * RADIO STATION PROFILE ROUTES
 * Получение и обновление профиля радиостанции
 * Источник данных: KV store + демо-профили
 */

import { Hono } from 'npm:hono@4';
import * as kv from './kv_store.tsx';

const app = new Hono();

// ── Типы ──────────────────────────────────────────────────

interface RadioSocials {
  instagram: string;
  facebook: string;
  twitter: string;
  youtube: string;
}

interface RadioProfile {
  id: string;
  name: string;
  email: string;
  city: string;
  country: string;
  frequency: string;
  formats: string[];
  listeners: string;
  status: string;
  description: string;
  founded: string;
  phone: string;
  website: string;
  address: string;
  streamUrl: string;
  backupStreamUrl: string;
  bitrate: string;
  audioFormat: string;
  socials: RadioSocials;
  tracksInRotation: number;
  partners: number;
  monthlyReach: string;
  totalArtistRequests: number;
  totalAdSlots: number;
  revenue: number;
  createdAt: string;
}

const ALLOWED_UPDATE_FIELDS = new Set([
  'name', 'email', 'city', 'country', 'frequency', 'formats',
  'description', 'founded', 'phone', 'website', 'address',
  'streamUrl', 'backupStreamUrl', 'bitrate', 'audioFormat',
  'socials', 'listeners', 'status',
]);

// ── Helpers ───────────────────────────────────────────────

function kvKey(radioId: string): string {
  return `radio_profile:${radioId}`;
}

function parseKvProfile(raw: unknown): RadioProfile | null {
  if (!raw) return null;
  return raw as RadioProfile;
}

async function loadFromKv(radioId: string): Promise<RadioProfile | null> {
  const raw = await kv.get(kvKey(radioId));
  return parseKvProfile(raw);
}

async function saveToKv(radioId: string, profile: RadioProfile): Promise<void> {
  await kv.set(kvKey(radioId), profile);
}

function sanitizeUpdates(updates: Record<string, unknown>): Partial<RadioProfile> {
  const clean: Record<string, unknown> = {};
  for (const key of Object.keys(updates)) {
    if (ALLOWED_UPDATE_FIELDS.has(key)) {
      clean[key] = updates[key];
    }
  }
  return clean as Partial<RadioProfile>;
}

// ── Демо-профили ──────────────────────────────────────────

const EMPTY_SOCIALS: RadioSocials = {
  instagram: '', facebook: '', twitter: '', youtube: '',
};

function makeRadioProfile(overrides: Partial<RadioProfile> & { id: string; name: string; email: string }): RadioProfile {
  return {
    city: '',
    country: 'Россия',
    frequency: '',
    formats: [],
    listeners: '0',
    status: 'Online',
    description: '',
    founded: '',
    phone: '',
    website: '',
    address: '',
    streamUrl: '',
    backupStreamUrl: '',
    bitrate: '320 kbps',
    audioFormat: 'MP3',
    socials: { ...EMPTY_SOCIALS },
    tracksInRotation: 0,
    partners: 0,
    monthlyReach: '0',
    totalArtistRequests: 0,
    totalAdSlots: 0,
    revenue: 0,
    createdAt: '',
    ...overrides,
    socials: { ...EMPTY_SOCIALS, ...overrides.socials },
  };
}

const DEMO_RADIO_PROFILES: Record<string, RadioProfile> = {
  'radio-1': makeRadioProfile({
    id: 'radio-1',
    name: 'PROMO.FM',
    email: 'promofm@promo.fm',
    city: 'Москва',
    frequency: 'FM 100.5',
    formats: ['Pop', 'Hits'],
    listeners: '1.2M',
    status: 'Online',
    description: 'PROMO.FM - главная радиостанция экосистемы promo.music. Лучшие хиты, свежие релизы и эксклюзивные интервью с артистами 24/7.',
    founded: '2020',
    phone: '+7 (495) 100-05-00',
    website: 'https://promo.fm',
    address: 'ул. Тверская, д. 1, Москва, 125009',
    streamUrl: 'https://stream.promo.fm/live',
    backupStreamUrl: 'https://backup.stream.promo.fm/live',
    bitrate: '320 kbps',
    audioFormat: 'AAC+',
    socials: {
      instagram: '@promofm', facebook: 'PromoFMRadio',
      twitter: '@promofm', youtube: '@PromoFMRadio',
    },
    tracksInRotation: 580,
    partners: 42,
    monthlyReach: '3.8M',
    totalArtistRequests: 23,
    totalAdSlots: 8,
    revenue: 485000,
    createdAt: '2024-01-01T00:00:00Z',
  }),
  'radio-2': makeRadioProfile({
    id: 'radio-2',
    name: 'Sound Wave',
    email: 'soundwave@promo.fm',
    city: 'Санкт-Петербург',
    frequency: 'FM 95.3',
    formats: ['Electronic', 'Dance'],
    listeners: '680K',
    status: 'Online',
    description: 'Sound Wave - радиостанция для любителей электронной музыки. Deep house, progressive, melodic techno и лучшие DJ-сеты каждую ночь.',
    founded: '2021',
    phone: '+7 (812) 953-00-53',
    website: 'https://soundwave.fm',
    address: 'Невский пр., д. 28, Санкт-Петербург, 191186',
    streamUrl: 'https://stream.soundwave.fm/live',
    backupStreamUrl: 'https://backup.soundwave.fm/live',
    bitrate: '320 kbps',
    audioFormat: 'MP3',
    socials: {
      instagram: '@soundwave_fm', facebook: 'SoundWaveFM',
      twitter: '@soundwave_fm', youtube: '@SoundWaveFM',
    },
    tracksInRotation: 320,
    partners: 19,
    monthlyReach: '1.9M',
    totalArtistRequests: 15,
    totalAdSlots: 5,
    revenue: 210000,
    createdAt: '2024-03-10T00:00:00Z',
  }),
  'radio-3': makeRadioProfile({
    id: 'radio-3',
    name: 'Retro Gold',
    email: 'retrogold@promo.fm',
    city: 'Казань',
    frequency: 'FM 88.7',
    formats: ['Retro', 'Classics'],
    listeners: '430K',
    status: 'Online',
    description: 'Retro Gold - золотая коллекция хитов прошлых десятилетий. Лучшие песни 70-х, 80-х, 90-х и 2000-х, которые вы любите.',
    founded: '2019',
    phone: '+7 (843) 887-00-87',
    website: 'https://retrogold.fm',
    address: 'ул. Баумана, д. 15, Казань, 420111',
    streamUrl: 'https://stream.retrogold.fm/live',
    backupStreamUrl: 'https://backup.retrogold.fm/live',
    bitrate: '256 kbps',
    audioFormat: 'MP3',
    socials: {
      instagram: '@retrogold_fm', facebook: 'RetroGoldFM',
      twitter: '@retrogold_fm', youtube: '@RetroGoldFM',
    },
    tracksInRotation: 1200,
    partners: 15,
    monthlyReach: '1.2M',
    totalArtistRequests: 8,
    totalAdSlots: 3,
    revenue: 130000,
    createdAt: '2023-09-15T00:00:00Z',
  }),
  'radio-4': makeRadioProfile({
    id: 'radio-4',
    name: 'Night Vibes',
    email: 'nightvibes@promo.fm',
    city: 'Москва',
    frequency: 'FM 103.2',
    formats: ['R&B', 'Hip-Hop'],
    listeners: '920K',
    status: 'Online',
    description: 'Night Vibes - ночное радио для ценителей R&B, Hip-Hop и Urban-музыки. Свежие треки, эксклюзивные премьеры и ночные шоу.',
    founded: '2022',
    phone: '+7 (495) 103-20-00',
    website: 'https://nightvibes.fm',
    address: 'Пресненская наб., д. 12, Москва, 123112',
    streamUrl: 'https://stream.nightvibes.fm/live',
    backupStreamUrl: 'https://backup.nightvibes.fm/live',
    bitrate: '320 kbps',
    audioFormat: 'AAC+',
    socials: {
      instagram: '@nightvibes_fm', facebook: 'NightVibesFM',
      twitter: '@nightvibes_fm', youtube: '@NightVibesFM',
    },
    tracksInRotation: 410,
    partners: 31,
    monthlyReach: '2.7M',
    totalArtistRequests: 19,
    totalAdSlots: 6,
    revenue: 350000,
    createdAt: '2024-02-20T00:00:00Z',
  }),
};

// ── Routes ────────────────────────────────────────────────

/**
 * GET /profile/:radioId
 * Двухуровневый фоллбэк: KV → demo
 */
app.get('/profile/:radioId', async (c) => {
  const radioId = c.req.param('radioId');
  console.log(`[RadioProfile] GET ${radioId}`);

  try {
    // 1. KV cache
    const kvProfile = await loadFromKv(radioId);
    if (kvProfile) {
      return c.json({ success: true, source: 'kv', data: kvProfile });
    }

    // 2. Demo fallback
    const demoProfile = DEMO_RADIO_PROFILES[radioId];
    if (demoProfile) {
      await saveToKv(radioId, demoProfile);
      return c.json({ success: true, source: 'demo', data: demoProfile });
    }

    return c.json({ success: false, error: `Radio station not found: ${radioId}` }, 404);
  } catch (error) {
    console.error(`[RadioProfile] GET error: ${error}`);
    const fallback = DEMO_RADIO_PROFILES[radioId];
    if (fallback) {
      return c.json({ success: true, source: 'demo-fallback', data: fallback });
    }
    return c.json({ success: false, error: String(error) }, 500);
  }
});

/**
 * PUT /profile/:radioId
 * Обновить профиль радиостанции
 */
app.put('/profile/:radioId', async (c) => {
  const radioId = c.req.param('radioId');
  console.log(`[RadioProfile] PUT ${radioId}`);

  try {
    const rawUpdates = await c.req.json();
    const updates = sanitizeUpdates(rawUpdates);

    if (Object.keys(updates).length === 0) {
      return c.json({ success: false, error: 'No valid fields to update' }, 400);
    }

    const currentProfile = (await loadFromKv(radioId)) || DEMO_RADIO_PROFILES[radioId] || null;
    if (!currentProfile) {
      return c.json({ success: false, error: 'Radio station not found' }, 404);
    }

    const updatedProfile: RadioProfile = {
      ...currentProfile,
      ...updates,
      socials: {
        ...currentProfile.socials,
        ...(updates.socials || {}),
      },
    };

    await saveToKv(radioId, updatedProfile);

    console.log(`[RadioProfile] Updated: ${radioId} → ${updatedProfile.name}`);
    return c.json({ success: true, data: updatedProfile });
  } catch (error) {
    console.error(`[RadioProfile] PUT error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

/**
 * GET /profile/:radioId/stats
 * Статистика радиостанции
 */
app.get('/profile/:radioId/stats', async (c) => {
  const radioId = c.req.param('radioId');

  try {
    const profile = (await loadFromKv(radioId)) || DEMO_RADIO_PROFILES[radioId];
    if (profile) {
      return c.json({
        success: true,
        data: {
          listeners: profile.listeners,
          tracksInRotation: profile.tracksInRotation,
          partners: profile.partners,
          monthlyReach: profile.monthlyReach,
          totalArtistRequests: profile.totalArtistRequests,
          totalAdSlots: profile.totalAdSlots,
          revenue: profile.revenue,
        },
      });
    }

    return c.json({ success: false, error: 'Stats not found' }, 404);
  } catch (error) {
    console.error(`[RadioProfile] Stats error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

export default app;