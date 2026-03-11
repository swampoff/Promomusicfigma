/**
 * LANDING DATA ROUTES
 * Публичные API endpoints для данных лендинга
 * Артисты, чарты, треки, новости, концерты - всё из KV store
 */

import { Hono } from 'npm:hono@4';
import { getAllArtistProfiles, getAllConcerts, getAllProducerProfiles, getArtistProfile, getBeats, getProducerProfile, getTrack, getTracksByUser, upsertTrack, deleteTrack, artistAnalyticsCacheStore, beatReviewsStore, chartSourcesStore, concertAgentStore, contactFormsStore, investorInquiriesStore, newsPublicStore, paymentBalancesStore, platformStatsStore, producerServicesStore, radioAnalyticsStore, serviceOrdersByProducerStore } from './db.tsx';
import { reseedDemoData } from './demo-seed.tsx';
import { requireAuth, requireAdmin } from './auth-middleware.tsx';
import { sendEmail } from './email-helper.tsx';

const ADMIN_INTERNAL_KEY = Deno.env.get('VPS_INTERNAL_KEY') || '';

/** Admin auth: either JWT admin or X-Internal-Key header */
async function requireAdminOrKey(c: any, next: any) {
  const internalKey = c.req.header('X-Internal-Key');
  if (internalKey && ADMIN_INTERNAL_KEY && internalKey === ADMIN_INTERNAL_KEY) {
    return next();
  }
  return requireAuth(c, () => requireAdmin(c, next));
}

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
    const raw = await platformStatsStore.get('artists:popular');
    const artists = raw || [];

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
      const resolvedId = await artistAnalyticsCacheStore.get(param);
      if (resolvedId) {
        artistId = typeof resolvedId === 'string' ? resolvedId : resolvedId;
      }
    }

    const raw = await getArtistProfile(artistId);
    if (!raw) {
      return c.json({ success: false, error: 'Artist not found' }, 404);
    }

    const artist = raw;

    // Get artist's tracks
    const allPublicTracks = await getTracksByUser('public');
    const artistTracks = allPublicTracks
      .filter((t: any) => t && t.artistId === artistId)
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

    const allArtistData = await getAllArtistProfiles();
    let artists = allArtistData
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
    const raw = await platformStatsStore.get('chart:weekly:top20');
    const chart = raw || { entries: [] };

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
    const allTracks = await getTracksByUser("public");

    const tracks = allTracks
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
    const allTracks = await getTracksByUser("public");

    const tracks = allTracks
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
    const allTracks = await getTracksByUser("public");

    const tracks = allTracks
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

    const allNews = await newsPublicStore.getAll();

    let news = allNews
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
    const raw = await newsPublicStore.get(id);

    if (!raw) {
      return c.json({ success: false, error: 'News not found' }, 404);
    }

    const newsItem = raw;
    return c.json({ success: true, data: newsItem });
  } catch (error) {
    console.error('Error fetching news item:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================
// CONCERTS (PUBLIC)
// Два источника: сгенерированные концерты (concert:public:ai-*) +
// концерты артистов ПРОМО.МУЗЫКА (concert:public:*)
// ============================================

/**
 * GET /concerts
 * Предстоящие концерты из KV store
 * Источники: сгенерированные + концерты артистов ПРОМО.МУЗЫКА
 */
landing.get('/concerts', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '12');
    const city = c.req.query('city') || '';

    // 1. Концерты артистов из concerts_kv
    const allKvConcerts = await getAllConcerts();
    let concerts = allKvConcerts
      .filter((item: any) => item && item.id)
      .map((item: any) => ({
        ...item,
        source: item.source || (typeof item.id === 'string' && item.id.startsWith('ai-') ? 'generated' : 'promo_artist'),
      }));

    // 2. Концерты от concert-agent (KudaGo, Яндекс.Афиша, MTS Live)
    try {
      const agentConcerts = await concertAgentStore.getAll();
      const mapped = agentConcerts
        .filter((c: any) => c && c.status === 'published')
        .map((c: any) => ({
          id: c.id,
          title: c.title || '',
          artist: c.artist || '',
          artistId: '',
          artistAvatar: '',
          venue: c.venue || '',
          city: c.city || '',
          date: c.date || '',
          time: c.time || '',
          capacity: 0,
          ticketsSold: 0,
          ticketPriceFrom: ((c.price || '').match(/\d+/) || [''])[0],
          ticketPriceTo: '',
          status: 'published',
          views: 0,
          coverImage: c.imageUrl || '',
          description: c.description || '',
          source: c.source || 'external',
          genre: c.genre || '',
          ticketUrl: c.ticketUrl || '',
        }));
      concerts = [...concerts, ...mapped];
    } catch (e) {
      console.log('[landing] concert-agent data error:', e);
    }

    // Фильтр по городу
    if (city) {
      concerts = concerts.filter((item: any) =>
        item.city?.toLowerCase().includes(city.toLowerCase())
      );
    }

    // Только будущие
    const now = new Date().toISOString().split('T')[0];
    concerts = concerts
      .filter((item: any) => item.date >= now)
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Дедупликация по title + date
    const seen = new Set<string>();
    const deduped = concerts.filter((item: any) => {
      const key = `${item.title?.toLowerCase().trim()}::${item.date}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Подсчёт по источникам
    const generatedCount = deduped.filter((c: any) => c.source === 'generated').length;
    const promoCount = deduped.filter((c: any) => c.source === 'promo_artist').length;

    console.log(`Concerts: ${promoCount} promo + ${generatedCount} generated = ${deduped.length} total`);

    return c.json({
      success: true,
      data: deduped.slice(0, limit),
      meta: {
        total: deduped.length,
        sources: { promo: promoCount, generated: generatedCount },
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
    const allStations = await radioAnalyticsStore.getAll();

    const stations = allStations
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
    const raw = await platformStatsStore.get('platform');
    const stats = raw || {
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
    const raw = await platformStatsStore.get('genres');
    const genres = raw || {};

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
    const allArtists = await getAllArtistProfiles();
    const matchedArtists = allArtists
      .filter((a: any) => a && a.name &&
        (a.name.toLowerCase().includes(query) ||
         a.genre?.toLowerCase().includes(query) ||
         a.city?.toLowerCase().includes(query))
      )
      .slice(0, 5);

    // Search tracks
    const allTracks = await getTracksByUser("public");
    const matchedTracks = allTracks
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
 * Каталог битов с фильтрацией и сортировко��
 */
landing.get('/beats', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '20');
    const genre = c.req.query('genre');
    const sort = c.req.query('sort') || 'newest';

    const allBeats = await getBeats();

    let beats = allBeats
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

    const allServices = await producerServicesStore.getAll();

    let services = allServices
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
    const raw = await platformStatsStore.get('portfolio:public:all');
    const items = raw || [];

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

    const allProfiles = await getAllProducerProfiles();

    let profiles = allProfiles
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
    const raw = await getProducerProfile(id);

    if (!raw) {
      return c.json({ success: false, error: 'Producer profile not found' }, 404);
    }

    const profile = raw;
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
    const allReviews = await beatReviewsStore.getAll();

    const reviews = allReviews
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
    const allOrders = await serviceOrdersByProducerStore.get(producerId);

    let orders = allOrders
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
    const raw = await paymentBalancesStore.get(producerId);

    if (!raw) {
      return c.json({ success: false, error: 'Wallet not found' }, 404);
    }

    const wallet = raw;
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

// ============================================
// CONTACT FORM
// ============================================

/**
 * POST /contact
 * Сохранение обращения из формы контактов
 */
landing.post('/contact', async (c) => {
  try {
    const body = await c.req.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return c.json({ success: false, error: 'Все поля обязательны для заполнения' }, 400);
    }

    const id = `contact-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const contactData = {
      id,
      name,
      email,
      subject,
      message,
      createdAt: new Date().toISOString(),
      status: 'new',
    };

    await contactFormsStore.set(id, contactData);

    console.log(`Contact form submission saved: ${id} from ${email}`);

    // Send email notification to admin
    await sendEmail({
      to: 'info@promofm.ru',
      subject: `[Контакт] ${subject} — от ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2 style="color: #FF577F;">Новое обращение с сайта</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px; font-weight: bold;">Имя:</td><td style="padding: 8px;">${name}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Email:</td><td style="padding: 8px;">${email}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Тема:</td><td style="padding: 8px;">${subject}</td></tr>
          </table>
          <div style="margin-top: 16px; padding: 16px; background: #f5f5f5; border-radius: 8px;">
            <p style="margin: 0; white-space: pre-wrap;">${message}</p>
          </div>
          <p style="color: #888; font-size: 12px; margin-top: 20px;">ПРОМО.МУЗЫКА — автоматическое уведомление</p>
        </div>
      `,
    }).catch((err: unknown) => console.error('Failed to send contact email:', err));

    return c.json({ success: true, message: 'Сообщение успешно отправлено' });
  } catch (error) {
    console.error('Error saving contact form:', error);
    return c.json({ success: false, error: `Ошибка при отправке сообщения: ${String(error)}` }, 500);
  }
});

/**
 * POST /investor-inquiry
 * Сохранение запроса инвестиционной презентации
 */
landing.post('/investor-inquiry', async (c) => {
  try {
    const body = await c.req.json();
    const { name, email, company, message } = body;

    if (!name || !email) {
      return c.json({ success: false, error: 'Имя и email обязательны для заполнения' }, 400);
    }

    const id = `investor-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const inquiryData = {
      id,
      name,
      email,
      company: company || '',
      message: message || 'Прошу направить инвестиционную презентацию ПРОМО.МУЗЫКА.',
      createdAt: new Date().toISOString(),
      status: 'new',
    };

    await investorInquiriesStore.set(id, inquiryData);

    console.log(`Investor inquiry saved: ${id} from ${email}`);

    // Send email notification to admin
    await sendEmail({
      to: 'info@promofm.ru',
      subject: `[Инвестор] Запрос от ${name}${company ? ` (${company})` : ''}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2 style="color: #7C3AED;">Запрос инвестиционной презентации</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px; font-weight: bold;">Имя:</td><td style="padding: 8px;">${name}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Email:</td><td style="padding: 8px;">${email}</td></tr>
            ${company ? `<tr><td style="padding: 8px; font-weight: bold;">Компания:</td><td style="padding: 8px;">${company}</td></tr>` : ''}
          </table>
          ${inquiryData.message ? `<div style="margin-top: 16px; padding: 16px; background: #f5f5f5; border-radius: 8px;"><p style="margin: 0; white-space: pre-wrap;">${inquiryData.message}</p></div>` : ''}
          <p style="color: #888; font-size: 12px; margin-top: 20px;">ПРОМО.МУЗЫКА — автоматическое уведомление</p>
        </div>
      `,
    }).catch((err: unknown) => console.error('Failed to send investor email:', err));

    return c.json({ success: true, message: 'Запрос успешно отправлен' });
  } catch (error) {
    console.error('Error saving investor inquiry:', error);
    return c.json({ success: false, error: `Ошибка при отправке запроса: ${String(error)}` }, 500);
  }
});

// ============================================
// ADMIN: SEED LIVE DATA
// ============================================

/**
 * POST /seed-live
 * Наполнить platform_stats реальными данными из БД
 */
landing.post('/seed-live', requireAdminOrKey, async (c) => {
  try {
    const results: Record<string, any> = {};

    // 1. Popular Artists — из Supabase profiles
    const allArtists = await getAllArtistProfiles();
    const validArtists = allArtists
      .filter((a: any) => a && a.id && a.name)
      .sort((a: any, b: any) => (b.monthlyListeners || b.plays || 0) - (a.monthlyListeners || a.plays || 0))
      .slice(0, 20)
      .map((a: any) => ({
        id: a.id,
        name: a.name,
        genre: a.genre || '',
        city: a.city || '',
        avatar: a.avatar || a.avatarUrl || '',
        monthlyListeners: a.monthlyListeners || 0,
        plays: a.plays || 0,
        verified: a.verified || false,
      }));
    await platformStatsStore.set('artists:popular', validArtists);
    results.popularArtists = validArtists.length;

    // 2. Platform Stats
    const allTracks = await getTracksByUser('public');
    const radioStations = await radioAnalyticsStore.getAll();
    const stats = {
      totalArtists: allArtists.length,
      totalTracks: allTracks.length,
      totalPlays: allTracks.reduce((sum: number, t: any) => sum + (t?.plays || 0), 0),
      totalRadioStations: radioStations.length,
      updatedAt: new Date().toISOString(),
    };
    await platformStatsStore.set('platform', stats);
    results.platformStats = stats;

    // 3. Genres
    const genreMap: Record<string, number> = {};
    for (const a of allArtists) {
      if ((a as any)?.genre) {
        const g = (a as any).genre;
        genreMap[g] = (genreMap[g] || 0) + 1;
      }
    }
    for (const t of allTracks) {
      if ((t as any)?.genre) {
        const g = (t as any).genre;
        genreMap[g] = (genreMap[g] || 0) + 1;
      }
    }
    await platformStatsStore.set('genres', genreMap);
    results.genres = Object.keys(genreMap).length;

    // 4. Weekly Chart TOP-20 from chart_sources
    const chartSources = await chartSourcesStore.getAll();
    const trackScores: Record<string, { artist: string; title: string; score: number; sources: string[] }> = {};
    for (const src of chartSources) {
      const tracks = (src as any)?.tracks || [];
      const sourceMax = tracks.length;
      for (const t of tracks) {
        if (!t.artist || !t.title) continue;
        const key = `${t.artist.toLowerCase()}|||${t.title.toLowerCase()}`;
        if (!trackScores[key]) {
          trackScores[key] = { artist: t.artist, title: t.title, score: 0, sources: [] };
        }
        trackScores[key].score += (sourceMax - (t.position || 0) + 1);
        trackScores[key].sources.push((src as any).sourceId || 'unknown');
      }
    }
    const top20 = Object.values(trackScores)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20)
      .map((t, idx) => ({
        position: idx + 1,
        artist: t.artist,
        title: t.title,
        score: t.score,
        sources: [...new Set(t.sources)],
      }));
    await platformStatsStore.set('chart:weekly:top20', { entries: top20, updatedAt: new Date().toISOString() });
    results.weeklyChart = top20.length;

    console.log(`[seed-live] Done: ${validArtists.length} artists, ${Object.keys(genreMap).length} genres, ${top20.length} chart entries`);

    return c.json({ success: true, results });
  } catch (error) {
    console.error('[seed-live] Error:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================
// ADMIN: NEWS CRUD
// ============================================

/** POST /admin/news — создать новость */
landing.post('/admin/news', requireAdminOrKey, async (c) => {
  try {
    const body = await c.req.json();
    const id = body.id || `news-manual-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const newsItem = {
      id,
      title: body.title || '',
      excerpt: body.excerpt || '',
      content: body.content || '',
      category: body.category || 'industry',
      tags: body.tags || [],
      source: body.source || 'admin',
      sourceId: 'manual',
      sourceUrl: body.sourceUrl || '',
      imageUrl: body.imageUrl || '',
      publishedAt: body.publishedAt || new Date().toISOString(),
      status: body.status || 'published',
      createdAt: new Date().toISOString(),
    };
    await newsPublicStore.set(id, newsItem);
    return c.json({ success: true, data: newsItem });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

/** PUT /admin/news/:id — обновить новость */
landing.put('/admin/news/:id', requireAdminOrKey, async (c) => {
  try {
    const id = c.req.param('id');
    const existing = await newsPublicStore.get(id);
    if (!existing) return c.json({ success: false, error: 'Not found' }, 404);
    const body = await c.req.json();
    const updated = { ...existing, ...body, id, updatedAt: new Date().toISOString() };
    await newsPublicStore.set(id, updated);
    return c.json({ success: true, data: updated });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

/** DELETE /admin/news/:id — удалить новость */
landing.delete('/admin/news/:id', requireAdminOrKey, async (c) => {
  try {
    const id = c.req.param('id');
    await newsPublicStore.del(id);
    return c.json({ success: true });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

/** GET /admin/news — все новости включая черновики */
landing.get('/admin/news', requireAdminOrKey, async (c) => {
  try {
    const all = await newsPublicStore.getAll();
    return c.json({ success: true, data: all });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================
// ADMIN: PUBLIC TRACKS CRUD
// ============================================

/** POST /admin/tracks — загрузить трек в публичный каталог */
landing.post('/admin/tracks', requireAdminOrKey, async (c) => {
  try {
    const body = await c.req.json();
    const trackId = body.trackId || `trk-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const track = {
      id: trackId,
      title: body.title || 'Untitled',
      artist: body.artist || 'Unknown',
      genre: body.genre || '',
      duration: body.duration || 0,
      audioUrl: body.audioUrl || '',
      coverUrl: body.coverUrl || '',
      plays: body.plays || 0,
      createdAt: new Date().toISOString(),
    };
    await upsertTrack('public', trackId, track);
    return c.json({ success: true, data: track });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

/** PUT /admin/tracks/:id — обновить публичный трек */
landing.put('/admin/tracks/:id', requireAdminOrKey, async (c) => {
  try {
    const trackId = c.req.param('id');
    const existing = await getTrack('public', trackId);
    if (!existing) return c.json({ success: false, error: 'Not found' }, 404);
    const body = await c.req.json();
    const updated = { ...existing, ...body, id: trackId, updatedAt: new Date().toISOString() };
    await upsertTrack('public', trackId, updated);
    return c.json({ success: true, data: updated });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

/** DELETE /admin/tracks/:id — удалить публичный трек */
landing.delete('/admin/tracks/:id', requireAdminOrKey, async (c) => {
  try {
    const trackId = c.req.param('id');
    await deleteTrack('public', trackId);
    return c.json({ success: true });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

/** GET /admin/tracks — все публичные треки */
landing.get('/admin/tracks', requireAdminOrKey, async (c) => {
  try {
    const tracks = await getTracksByUser('public');
    return c.json({ success: true, data: tracks });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

/** POST /admin/tracks/publish — скопировать трек артиста в публичный каталог */
landing.post('/admin/tracks/publish', requireAdminOrKey, async (c) => {
  try {
    const { userId, trackId } = await c.req.json();
    if (!userId || !trackId) {
      return c.json({ success: false, error: 'userId and trackId required' }, 400);
    }
    const original = await getTrack(userId, trackId);
    if (!original) return c.json({ success: false, error: 'Track not found' }, 404);
    const publicId = `pub-${trackId}`;
    const publicTrack = { ...original, id: publicId, artistId: userId, publishedAt: new Date().toISOString() };
    await upsertTrack('public', publicId, publicTrack);
    return c.json({ success: true, data: publicTrack });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

export default landing;