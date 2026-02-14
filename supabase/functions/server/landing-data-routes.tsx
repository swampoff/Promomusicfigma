/**
 * LANDING DATA ROUTES
 * Публичные API endpoints для данных лендинга
 * Артисты, чарты, треки, новости, концерты - всё из KV store
 */

import { Hono } from 'npm:hono@4';
import * as kv from './kv_store.tsx';
import { reseedDemoData } from './demo-seed.tsx';

const landing = new Hono();

// ============================================
// POPULAR ARTISTS
// ============================================

/**
 * GET /popular-artists
 * Список популярных артистов (отсортирован по monthly listeners)
 */
landing.get('/popular-artists', async (c) => {
  try {
    const raw = await kv.get('artists:popular');
    const artists = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : [];

    return c.json({ success: true, data: artists });
  } catch (error) {
    console.error('Error fetching popular artists:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

/**
 * GET /artists/:idOrSlug
 * Профиль артиста по ID или slug
 */
landing.get('/artists/:idOrSlug', async (c) => {
  try {
    const param = c.req.param('idOrSlug');
    let artistId = param;

    // Check if it's a slug
    if (!param.startsWith('artist-')) {
      const resolvedId = await kv.get(`artist_slug:${param}`);
      if (resolvedId) {
        artistId = typeof resolvedId === 'string' ? resolvedId : resolvedId;
      }
    }

    const raw = await kv.get(`artist:${artistId}`);
    if (!raw) {
      return c.json({ success: false, error: 'Artist not found' }, 404);
    }

    const artist = typeof raw === 'string' ? JSON.parse(raw) : raw;

    // Get artist's tracks
    const trackKeys = await kv.getByPrefix(`track:public:`);
    const artistTracks = trackKeys
      .map((t: any) => typeof t === 'string' ? JSON.parse(t) : t)
      .filter((t: any) => t.artistId === artistId)
      .sort((a: any, b: any) => b.plays - a.plays);

    return c.json({
      success: true,
      data: {
        ...artist,
        tracks: artistTracks,
      },
    });
  } catch (error) {
    console.error('Error fetching artist:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

/**
 * GET /artists
 * Все артисты (для каталога)
 */
landing.get('/artists', async (c) => {
  try {
    const genre = c.req.query('genre');
    const search = c.req.query('search')?.toLowerCase();
    const limit = parseInt(c.req.query('limit') || '50');

    const allArtistData = await kv.getByPrefix('artist:artist-');
    let artists = allArtistData
      .map((a: any) => typeof a === 'string' ? JSON.parse(a) : a)
      .filter((a: any) => a && a.id); // filter out invalid entries

    if (genre) {
      artists = artists.filter((a: any) => a.genre === genre);
    }

    if (search) {
      artists = artists.filter((a: any) =>
        a.name?.toLowerCase().includes(search) ||
        a.genre?.toLowerCase().includes(search) ||
        a.city?.toLowerCase().includes(search)
      );
    }

    // Sort by monthly listeners desc
    artists.sort((a: any, b: any) => (b.monthlyListeners || 0) - (a.monthlyListeners || 0));

    return c.json({
      success: true,
      data: artists.slice(0, limit),
      total: artists.length,
    });
  } catch (error) {
    console.error('Error fetching artists list:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================
// CHARTS
// ============================================

/**
 * GET /charts/weekly
 * Еженедельный чарт TOP 20
 */
landing.get('/charts/weekly', async (c) => {
  try {
    const raw = await kv.get('chart:weekly:top20');
    const chart = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : { entries: [] };

    return c.json({ success: true, data: chart });
  } catch (error) {
    console.error('Error fetching weekly chart:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================
// TRACKS (PUBLIC)
// ============================================

/**
 * GET /tracks/new
 * Новинки - последние добавленные треки
 */
landing.get('/tracks/new', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '10');
    const allTracks = await kv.getByPrefix('track:public:');

    const tracks = allTracks
      .map((t: any) => typeof t === 'string' ? JSON.parse(t) : t)
      .filter((t: any) => t && t.id)
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);

    return c.json({ success: true, data: tracks });
  } catch (error) {
    console.error('Error fetching new tracks:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

/**
 * GET /tracks/trending
 * Трендовые треки (по количеству прослушиваний)
 */
landing.get('/tracks/trending', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '10');
    const allTracks = await kv.getByPrefix('track:public:');

    const tracks = allTracks
      .map((t: any) => typeof t === 'string' ? JSON.parse(t) : t)
      .filter((t: any) => t && t.id)
      .sort((a: any, b: any) => (b.plays || 0) - (a.plays || 0))
      .slice(0, limit);

    return c.json({ success: true, data: tracks });
  } catch (error) {
    console.error('Error fetching trending tracks:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

/**
 * GET /tracks/by-genre/:genre
 * Треки по жанру
 */
landing.get('/tracks/by-genre/:genre', async (c) => {
  try {
    const genre = c.req.param('genre');
    const limit = parseInt(c.req.query('limit') || '20');
    const allTracks = await kv.getByPrefix('track:public:');

    const tracks = allTracks
      .map((t: any) => typeof t === 'string' ? JSON.parse(t) : t)
      .filter((t: any) => t && t.genre === genre)
      .sort((a: any, b: any) => (b.plays || 0) - (a.plays || 0))
      .slice(0, limit);

    return c.json({ success: true, data: tracks });
  } catch (error) {
    console.error('Error fetching tracks by genre:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================
// NEWS (PUBLIC)
// ============================================

/**
 * GET /news
 * Публичные новости
 */
landing.get('/news', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '10');
    const tag = c.req.query('tag');

    const allNews = await kv.getByPrefix('news:public:');

    let news = allNews
      .map((n: any) => typeof n === 'string' ? JSON.parse(n) : n)
      .filter((n: any) => n && n.id && n.status === 'published');

    if (tag) {
      news = news.filter((n: any) => n.tag === tag);
    }

    news.sort((a: any, b: any) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    return c.json({ success: true, data: news.slice(0, limit) });
  } catch (error) {
    console.error('Error fetching news:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

/**
 * GET /news/:id
 * Одна новость по ID
 */
landing.get('/news/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const raw = await kv.get(`news:public:${id}`);

    if (!raw) {
      return c.json({ success: false, error: 'News not found' }, 404);
    }

    const newsItem = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return c.json({ success: true, data: newsItem });
  } catch (error) {
    console.error('Error fetching news item:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================
// CONCERTS (PUBLIC)
// Два источника: Яндекс Афиша (API) + концерты артистов Promo.music (KV)
// ============================================

// Маппинг городов → slug для Яндекс Афиши
const YANDEX_CITY_MAP: Record<string, string> = {
  'moscow': 'moscow',
  'saint-petersburg': 'saint-petersburg',
  'Москва': 'moscow',
  'Санкт-Петербург': 'saint-petersburg',
  'Екатеринбург': 'ekaterinburg',
  'Казань': 'kazan',
  'Новосибирск': 'novosibirsk',
  'Краснодар': 'krasnodar',
  'Нижний Новгород': 'nizhny-novgorod',
  'Самара': 'samara',
  'Ростов-на-Дону': 'rostov-na-donu',
  'Воронеж': 'voronezh',
  'Сочи': 'sochi',
  'Геленджик': 'gelendzhik',
};

const YANDEX_SLUG_TO_CITY: Record<string, string> = {
  'moscow': 'Москва',
  'saint-petersburg': 'Санкт-Петербург',
  'ekaterinburg': 'Екатеринбург',
  'kazan': 'Казань',
  'novosibirsk': 'Новосибирск',
  'krasnodar': 'Краснодар',
  'nizhny-novgorod': 'Нижний Новгород',
  'samara': 'Самара',
  'rostov-na-donu': 'Ростов-на-Дону',
  'voronezh': 'Воронеж',
  'sochi': 'Сочи',
  'gelendzhik': 'Геленджик',
};

// Кэш Яндекс Афиши: 1 час
const YANDEX_CACHE_TTL = 60 * 60 * 1000;

/**
 * Загрузка концертов из Яндекс Афиши
 * Формат ответа Yandex Afisha API:
 * { paging: {...}, data: [{ event: { id, title, argument, poster }, scheduleInfo: { dates, placeInfo, prices } }] }
 */
async function fetchYandexAfishaConcerts(
  citySlug: string = 'moscow',
  limit: number = 12
): Promise<any[]> {
  const cacheKey = `yandex_afisha:cache:${citySlug}`;

  // Проверяем кэш
  try {
    const cached = await kv.get(cacheKey);
    if (cached) {
      const parsed = typeof cached === 'string' ? JSON.parse(cached) : cached;
      if (parsed.timestamp && Date.now() - parsed.timestamp < YANDEX_CACHE_TTL) {
        console.log(`  Яндекс Афиша cache hit: ${citySlug} (${parsed.concerts?.length || 0} events)`);
        return parsed.concerts || [];
      }
    }
  } catch (e) {
    console.log(`  Yandex cache read error: ${e}`);
  }

  // Запрос к API Яндекс Афиши
  try {
    const today = new Date().toISOString().split('T')[0];
    const url = `https://afisha.yandex.ru/api/events/rubric/concert?limit=${limit}&offset=0&city=${citySlug}&hasMixed=0&date=${today}`;

    console.log(`  Fetching Yandex Afisha: ${url}`);

    const resp = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Promo.music/1.0 (concert aggregator)',
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!resp.ok) {
      console.log(`  Yandex Afisha returned ${resp.status}`);
      return [];
    }

    const json = await resp.json();
    const events = json?.data || [];
    const cityName = YANDEX_SLUG_TO_CITY[citySlug] || citySlug;

    const concerts = events.map((item: any, idx: number) => {
      const ev = item?.event || {};
      const schedule = item?.scheduleInfo || {};
      const dateInfo = schedule?.dates?.[0] || {};
      const place = schedule?.placeInfo || {};
      const prices = schedule?.prices || [];
      const posterUrl = ev?.poster?.image
        ? `https://avatars.mds.yandex.net/get-afishanew/${ev.poster.image}`
        : '';

      // Извлекаем дату и время
      const rawDate = dateInfo?.date || '';
      let eventDate = '';
      let eventTime = '';
      if (rawDate) {
        const d = new Date(rawDate);
        eventDate = d.toISOString().split('T')[0];
        eventTime = d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', hour12: false });
      }

      // Цены
      const priceMin = prices.length > 0 ? String(Math.min(...prices.map((p: any) => p?.value || 0))) : '';
      const priceMax = prices.length > 0 ? String(Math.max(...prices.map((p: any) => p?.value || 0))) : '';

      return {
        id: `ya-${ev.id || idx}`,
        title: ev.title || 'Без названия',
        artist: ev.title || '',
        artistId: '',
        artistAvatar: '',
        venue: place?.title || '',
        city: place?.city?.name || cityName,
        date: eventDate,
        time: eventTime || '19:00',
        capacity: 0,
        ticketsSold: 0,
        ticketPriceFrom: priceMin,
        ticketPriceTo: priceMax,
        status: 'published',
        views: 0,
        coverImage: posterUrl,
        description: ev.argument || '',
        source: 'yandex_afisha' as const,
        yandexUrl: `https://afisha.yandex.ru/${citySlug}/concert/${ev.id}`,
        contentRating: ev.contentRating || '',
      };
    }).filter((c: any) => c.date);

    // Сохраняем в кэш
    try {
      await kv.set(cacheKey, { timestamp: Date.now(), concerts });
    } catch (e) {
      console.log(`  Yandex cache write error: ${e}`);
    }

    console.log(`  Yandex Afisha: fetched ${concerts.length} concerts for ${citySlug}`);
    return concerts;
  } catch (error) {
    console.log(`  Yandex Afisha fetch error for ${citySlug}: ${error}`);
    return [];
  }
}

/**
 * GET /concerts
 * Предстоящие концерты из двух источников:
 * 1) Яндекс Афиша (API) - внешние концерты
 * 2) Концерты артистов Promo.music (KV) - наши артисты
 */
landing.get('/concerts', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '12');
    const city = c.req.query('city') || '';
    const source = c.req.query('source') || 'all'; // 'all' | 'yandex' | 'promo'

    // 1. Концерты наших артистов из KV
    let promoConcerts: any[] = [];
    if (source === 'all' || source === 'promo') {
      const allKvConcerts = await kv.getByPrefix('concert:public:');
      promoConcerts = allKvConcerts
        .map((item: any) => typeof item === 'string' ? JSON.parse(item) : item)
        .filter((item: any) => item && item.id)
        .map((item: any) => ({
          ...item,
          source: 'promo_artist',
        }));
    }

    // 2. Концерты из Яндекс Афиши
    let yandexConcerts: any[] = [];
    if (source === 'all' || source === 'yandex') {
      // Определяем slug города
      const citySlug = city
        ? (YANDEX_CITY_MAP[city] || city.toLowerCase().replace(/\s+/g, '-'))
        : 'moscow';

      // Загружаем для основного города
      yandexConcerts = await fetchYandexAfishaConcerts(citySlug, limit);

      // Если запрос без города, подгружаем ещё Петербург
      if (!city && yandexConcerts.length < limit) {
        const spbConcerts = await fetchYandexAfishaConcerts('saint-petersburg', 6);
        yandexConcerts = [...yandexConcerts, ...spbConcerts];
      }
    }

    // 3. Объединяем и фильтруем
    let combined = [...promoConcerts, ...yandexConcerts];

    // Фильтр по городу (для промо-концертов)
    if (city) {
      combined = combined.filter((item: any) =>
        item.source === 'yandex_afisha' || item.city === city
      );
    }

    // Только будущие
    const now = new Date().toISOString().split('T')[0];
    combined = combined
      .filter((item: any) => item.date >= now)
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Дедупликация по title + date
    const seen = new Set<string>();
    const deduped = combined.filter((item: any) => {
      const key = `${item.title?.toLowerCase().trim()}::${item.date}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Подсчёт по источникам
    const promoCount = deduped.filter(c => c.source === 'promo_artist').length;
    const yandexCount = deduped.filter(c => c.source === 'yandex_afisha').length;

    console.log(`Concerts: ${promoCount} promo + ${yandexCount} yandex = ${deduped.length} total`);

    return c.json({
      success: true,
      data: deduped.slice(0, limit),
      meta: {
        total: deduped.length,
        sources: { promo: promoCount, yandex: yandexCount },
        city: city || 'all',
      },
    });
  } catch (error) {
    console.error('Error fetching concerts:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================
// PLATFORM STATS
// ============================================

/**
 * GET /radio-partners
 * Публичные профили радиостанций-партнёров
 */
landing.get('/radio-partners', async (c) => {
  try {
    const allStations = await kv.getByPrefix('radio_station:');

    const stations = allStations
      .map((s: any) => typeof s === 'string' ? JSON.parse(s) : s)
      .filter((s: any) => s && s.stationName)
      .map((s: any) => ({
        id: s.id,
        stationName: s.stationName,
        description: s.description || '',
        frequency: s.frequency || '',
        city: s.city || '',
        country: s.country || 'Россия',
        formats: s.formats || [],
        audienceSize: s.audienceSize || 0,
        logoUrl: s.logoUrl || '',
        isOnline: s.isOnline ?? true,
        createdAt: s.createdAt,
      }));

    // Сортировка по аудитории (крупные первыми)
    stations.sort((a: any, b: any) => (b.audienceSize || 0) - (a.audienceSize || 0));

    console.log(`Radio partners: ${stations.length} stations returned`);

    return c.json({
      success: true,
      data: stations,
      meta: {
        total: stations.length,
        totalAudience: stations.reduce((sum: number, s: any) => sum + (s.audienceSize || 0), 0),
      },
    });
  } catch (error) {
    console.error('Error fetching radio partners:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

/**
 * GET /stats
 * Общая статистика платформы
 */
landing.get('/stats', async (c) => {
  try {
    const raw = await kv.get('stats:platform');
    const stats = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : {
      totalArtists: 0,
      totalTracks: 0,
      totalPlays: 0,
      totalSubscribers: 0,
    };

    return c.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching platform stats:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

/**
 * GET /genres
 * Статистика по жанрам
 */
landing.get('/genres', async (c) => {
  try {
    const raw = await kv.get('stats:genres');
    const genres = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : {};

    return c.json({ success: true, data: genres });
  } catch (error) {
    console.error('Error fetching genres:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================
// SEARCH
// ============================================

/**
 * GET /search?q=query
 * Поиск по артистам и трекам
 */
landing.get('/search', async (c) => {
  try {
    const query = c.req.query('q')?.toLowerCase();
    if (!query || query.length < 2) {
      return c.json({ success: true, data: { artists: [], tracks: [] } });
    }

    // Search artists
    const allArtists = await kv.getByPrefix('artist:artist-');
    const matchedArtists = allArtists
      .map((a: any) => typeof a === 'string' ? JSON.parse(a) : a)
      .filter((a: any) => a && a.name &&
        (a.name.toLowerCase().includes(query) ||
         a.genre?.toLowerCase().includes(query) ||
         a.city?.toLowerCase().includes(query))
      )
      .slice(0, 5);

    // Search tracks
    const allTracks = await kv.getByPrefix('track:public:');
    const matchedTracks = allTracks
      .map((t: any) => typeof t === 'string' ? JSON.parse(t) : t)
      .filter((t: any) => t && t.title &&
        (t.title.toLowerCase().includes(query) ||
         t.artist?.toLowerCase().includes(query) ||
         t.genre?.toLowerCase().includes(query))
      )
      .slice(0, 10);

    return c.json({
      success: true,
      data: {
        artists: matchedArtists,
        tracks: matchedTracks,
      },
    });
  } catch (error) {
    console.error('Error searching:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================
// BEATS MARKETPLACE (PUBLIC)
// ============================================

/**
 * GET /beats
 * Каталог битов с фильтрацией и сортировкой
 */
landing.get('/beats', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '20');
    const genre = c.req.query('genre');
    const sort = c.req.query('sort') || 'newest';

    const allBeats = await kv.getByPrefix('beat:public:');

    let beats = allBeats
      .map((b: any) => typeof b === 'string' ? JSON.parse(b) : b)
      .filter((b: any) => b && b.id && b.status === 'active');

    if (genre) {
      beats = beats.filter((b: any) => b.genre?.toLowerCase() === genre.toLowerCase());
    }

    switch (sort) {
      case 'popular':
        beats.sort((a: any, b: any) => (b.plays || 0) - (a.plays || 0));
        break;
      case 'rating':
        beats.sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'price_asc':
        beats.sort((a: any, b: any) => (a.price || 0) - (b.price || 0));
        break;
      case 'price_desc':
        beats.sort((a: any, b: any) => (b.price || 0) - (a.price || 0));
        break;
      case 'newest':
      default:
        beats.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    return c.json({ success: true, data: beats.slice(0, limit) });
  } catch (error) {
    console.error('Error fetching beats:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================
// PRODUCER SERVICES (PUBLIC)
// ============================================

/**
 * GET /producer-services
 * Каталог услуг продюсеров
 */
landing.get('/producer-services', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '20');
    const type = c.req.query('type');

    const allServices = await kv.getByPrefix('producer_service:public:');

    let services = allServices
      .map((s: any) => typeof s === 'string' ? JSON.parse(s) : s)
      .filter((s: any) => s && s.id && s.status === 'active');

    if (type) {
      services = services.filter((s: any) => s.type === type);
    }

    services.sort((a: any, b: any) => (b.orders || 0) - (a.orders || 0));

    return c.json({ success: true, data: services.slice(0, limit) });
  } catch (error) {
    console.error('Error fetching producer services:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================
// PORTFOLIO BEFORE/AFTER (PUBLIC)
// ============================================

/**
 * GET /portfolio
 * Примеры работ до/после
 */
landing.get('/portfolio', async (c) => {
  try {
    const raw = await kv.get('portfolio:public:all');
    const items = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : [];

    return c.json({ success: true, data: items });
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================
// PRODUCER/ENGINEER PROFILES (PUBLIC)
// ============================================

/**
 * GET /producer-profiles
 * Список всех продюсеров/звукоинженеров
 */
landing.get('/producer-profiles', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '20');
    const specialization = c.req.query('specialization');

    const allProfiles = await kv.getByPrefix('producer_profile:');

    let profiles = allProfiles
      .map((p: any) => typeof p === 'string' ? JSON.parse(p) : p)
      .filter((p: any) => p && p.id);

    if (specialization) {
      profiles = profiles.filter((p: any) =>
        p.specializations?.includes(specialization)
      );
    }

    profiles.sort((a: any, b: any) => (b.averageRating || 0) - (a.averageRating || 0));

    return c.json({ success: true, data: profiles.slice(0, limit) });
  } catch (error) {
    console.error('Error fetching producer profiles:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

/**
 * GET /producer-profile/:id
 * Профиль конкретного продюсера/звукоинженера
 */
landing.get('/producer-profile/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const raw = await kv.get(`producer_profile:${id}`);

    if (!raw) {
      return c.json({ success: false, error: 'Producer profile not found' }, 404);
    }

    const profile = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return c.json({ success: true, data: profile });
  } catch (error) {
    console.error('Error fetching producer profile:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================
// PRODUCER REVIEWS (PUBLIC)
// ============================================

/**
 * GET /producer-reviews/:producerId
 * Отзывы о конкретном продюсере/звукоинженере
 */
landing.get('/producer-reviews/:producerId', async (c) => {
  try {
    const producerId = c.req.param('producerId');
    const allReviews = await kv.getByPrefix(`producer_review:${producerId}:`);

    const reviews = allReviews
      .map((r: any) => typeof r === 'string' ? JSON.parse(r) : r)
      .filter((r: any) => r && r.id)
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return c.json({ success: true, data: reviews });
  } catch (error) {
    console.error('Error fetching producer reviews:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================
// PRODUCER ORDERS
// ============================================

/**
 * GET /producer-orders/:producerId
 * Заказы конкретного продюсера
 */
landing.get('/producer-orders/:producerId', async (c) => {
  try {
    const producerId = c.req.param('producerId');
    const status = c.req.query('status');
    const allOrders = await kv.getByPrefix(`producer_order:${producerId}:`);

    let orders = allOrders
      .map((o: any) => typeof o === 'string' ? JSON.parse(o) : o)
      .filter((o: any) => o && o.id);

    if (status) {
      if (status === 'active') {
        orders = orders.filter((o: any) => o.status !== 'completed' && o.status !== 'cancelled');
      } else {
        orders = orders.filter((o: any) => o.status === status);
      }
    }

    orders.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return c.json({ success: true, data: orders });
  } catch (error) {
    console.error('Error fetching producer orders:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================
// PRODUCER WALLET
// ============================================

/**
 * GET /producer-wallet/:producerId
 * Кошелёк продюсера (баланс, транзакции)
 */
landing.get('/producer-wallet/:producerId', async (c) => {
  try {
    const producerId = c.req.param('producerId');
    const raw = await kv.get(`producer_wallet:${producerId}`);

    if (!raw) {
      return c.json({ success: false, error: 'Wallet not found' }, 404);
    }

    const wallet = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return c.json({ success: true, data: wallet });
  } catch (error) {
    console.error('Error fetching producer wallet:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================
// ADMIN: RESEED
// ============================================

/**
 * POST /reseed
 * Принудительный ресид демо-данных (для разработки)
 */
landing.post('/reseed', async (c) => {
  try {
    console.log('[Landing] Reseed requested');
    const result = await reseedDemoData();
    return c.json({ success: true, ...result });
  } catch (error) {
    console.error('Error reseeding:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

export default landing;