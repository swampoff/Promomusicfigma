/**
 * VENUE ROUTES - API для кабинета заведений
 * Миграция на KV Store (вместо SQL таблиц)
 * 
 * KV ключи:
 * - venue_profile:{userId} - профиль заведения
 * - venue_analytics:{venueId} - аналитика
 * - venue_campaigns:{venueId} - рекламные кампании
 * - venue_settings:{venueId} - настройки
 * - venue_notifications:{venueId} - уведомления (JSON массив)
 * - venue_bookings:{venueId} - список букингов (JSON массив ID)
 * 
 * Endpoints:
 * - GET /profile - Профиль заведения
 * - PUT /profile - Обновить профиль
 * - GET /stats - Статистика заведения
 * - GET /analytics/overview - Общая сводка аналитики
 * - GET /analytics/campaigns - Рекламные кампании
 * - GET /analytics/spending - График затрат
 * - GET /analytics/roi - ROI аналитика
 * - GET /analytics/radio-compare - Сравнение радиостанций
 * - POST /analytics/export - Экспорт отчетов
 * - GET /notifications - Уведомления заведения
 * - PUT /notifications/:id/read - Отметить уведомление прочитанным
 * - GET /bookings - Список букингов заведения
 */

import { Hono } from 'npm:hono@4';
import * as kv from './kv_store.tsx';
import { getSupabaseClient } from './supabase-client.tsx';

const app = new Hono();
const supabase = getSupabaseClient();

// Helper: Get user from token
async function getUserFromToken(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    return null;
  }
  return data.user;
}

// Helper: Get or create venue profile from KV
async function getVenueProfile(userId: string) {
  const data = await kv.get(`venue_profile:${userId}`);
  if (data) {
    return JSON.parse(data);
  }
  return null;
}

// =====================================================
// PROFILE ENDPOINTS
// =====================================================

// GET /profile - Получить профиль заведения
app.get('/profile', async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const profile = await getVenueProfile(user.id);
    if (!profile) {
      // Создаем дефолтный профиль, если не найден
      const defaultProfile = {
        id: `venue-${user.id}`,
        userId: user.id,
        venueName: user.user_metadata?.name || 'Мое заведение',
        description: null,
        venueType: 'bar',
        address: '',
        city: 'Москва',
        country: 'Россия',
        capacity: null,
        logoUrl: null,
        coverImageUrl: null,
        genres: [],
        socialLinks: {},
        workingHours: null,
        status: 'active',
        verified: false,
        subscriptionStatus: 'trial',
        subscriptionPlan: 'basic',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await kv.set(`venue_profile:${user.id}`, JSON.stringify(defaultProfile));
      return c.json(defaultProfile);
    }

    return c.json(profile);
  } catch (error: any) {
    console.error('Error in GET /venue/profile:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

// PUT /profile - Обновить профиль заведения
app.put('/profile', async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    let profile = await getVenueProfile(user.id);

    if (!profile) {
      profile = {
        id: `venue-${user.id}`,
        userId: user.id,
        createdAt: new Date().toISOString(),
      };
    }

    // Обновляем поля
    if (body.venueName !== undefined) profile.venueName = body.venueName;
    if (body.description !== undefined) profile.description = body.description;
    if (body.venueType !== undefined) profile.venueType = body.venueType;
    if (body.address !== undefined) profile.address = body.address;
    if (body.city !== undefined) profile.city = body.city;
    if (body.country !== undefined) profile.country = body.country;
    if (body.capacity !== undefined) profile.capacity = body.capacity;
    if (body.genres !== undefined) profile.genres = body.genres;
    if (body.logoUrl !== undefined) profile.logoUrl = body.logoUrl;
    if (body.coverImageUrl !== undefined) profile.coverImageUrl = body.coverImageUrl;
    if (body.socialLinks !== undefined) profile.socialLinks = body.socialLinks;
    if (body.workingHours !== undefined) profile.workingHours = body.workingHours;
    if (body.settings !== undefined) profile.settings = body.settings;
    profile.updatedAt = new Date().toISOString();

    await kv.set(`venue_profile:${user.id}`, JSON.stringify(profile));
    return c.json(profile);
  } catch (error: any) {
    console.error('Error in PUT /venue/profile:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

// POST /profile/logo - Загрузить логотип (placeholder)
app.post('/profile/logo', async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    return c.json({ 
      message: 'Logo upload endpoint - to be implemented with Supabase Storage',
    });
  } catch (error: any) {
    console.error('Error in POST /venue/profile/logo:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

// POST /profile/cover - Загрузить обложку (placeholder)
app.post('/profile/cover', async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    return c.json({ 
      message: 'Cover upload endpoint - to be implemented with Supabase Storage',
    });
  } catch (error: any) {
    console.error('Error in POST /venue/profile/cover:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

// =====================================================
// STATS ENDPOINT
// =====================================================

app.get('/stats', async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const profile = await getVenueProfile(user.id);
    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    // Получить аналитику из KV
    const analyticsData = await kv.get(`venue_analytics:${profile.id}`);
    const analytics = analyticsData ? JSON.parse(analyticsData) : null;

    // Получить букинги для подсчёта
    const bookingIdsData = await kv.get(`bookings_by_user:${user.id}`);
    const bookingIds: string[] = bookingIdsData ? JSON.parse(bookingIdsData) : [];
    
    let activeBookings = 0;
    let completedBookings = 0;
    
    if (bookingIds.length > 0) {
      const bookingKeys = bookingIds.slice(0, 50).map(id => `booking:${id}`);
      const bookingValues = await kv.mget(bookingKeys);
      for (const val of bookingValues) {
        if (val) {
          const b = JSON.parse(val);
          if (['pending', 'accepted', 'deposit_paid', 'confirmed'].includes(b.status)) {
            activeBookings++;
          }
          if (b.status === 'completed') {
            completedBookings++;
          }
        }
      }
    }

    return c.json({
      totalPlaylists: analytics?.totalPlaylists || 0,
      totalTracks: analytics?.totalTracks || 0,
      totalPlaytime: analytics?.totalPlaytime || 0,
      activeBookings,
      completedBookings,
      averageRating: analytics?.averageRating || 0,
      totalReviews: analytics?.totalReviews || 0,
      connectedRadios: analytics?.connectedRadios || 0,
    });
  } catch (error: any) {
    console.error('Error in GET /venue/stats:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

// =====================================================
// ANALYTICS ENDPOINTS
// =====================================================

// GET /analytics/overview
app.get('/analytics/overview', async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const period = c.req.query('period') || 'month';
    const profile = await getVenueProfile(user.id);
    if (!profile) {
      return c.json({ error: 'Venue profile not found' }, 404);
    }

    // Получить аналитику из KV
    const analyticsData = await kv.get(`venue_analytics:${profile.id}`);
    const analytics = analyticsData ? JSON.parse(analyticsData) : {};

    // Получить кампании
    const campaignsData = await kv.get(`venue_campaigns:${profile.id}`);
    const campaigns = campaignsData ? JSON.parse(campaignsData) : [];

    const activeCampaigns = campaigns.filter((c: any) => c.status === 'active').length;
    const completedCampaigns = campaigns.filter((c: any) => c.status === 'completed').length;
    const totalSpending = campaigns.reduce((sum: number, c: any) => sum + (c.totalSpent || 0), 0);

    return c.json({
      success: true,
      period,
      data: {
        spending: {
          total: Math.round(totalSpending * 100) / 100,
          growth: analytics?.spendingGrowth || -5.2,
          thisMonth: Math.round((analytics?.monthlySpending || totalSpending) * 100) / 100,
        },
        campaigns: {
          active: activeCampaigns,
          total: campaigns.length,
          completed: completedCampaigns,
          successRate: campaigns.length ? Math.round((completedCampaigns / campaigns.length) * 100 * 10) / 10 : 0,
        },
        reach: {
          totalImpressions: analytics?.totalImpressions || 0,
          uniqueListeners: analytics?.uniqueListeners || 0,
          growth: analytics?.reachGrowth || 32.5,
          avgPerCampaign: campaigns.length ? Math.round((analytics?.totalImpressions || 0) / campaigns.length) : 0,
        },
        performance: {
          avgROI: analytics?.avgROI || 0,
          conversionRate: analytics?.conversionRate || 0,
          engagementRate: analytics?.engagementRate || 82.3,
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching venue analytics:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// GET /analytics/campaigns
app.get('/analytics/campaigns', async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const profile = await getVenueProfile(user.id);
    if (!profile) {
      return c.json({ error: 'Venue profile not found' }, 404);
    }

    const campaignsData = await kv.get(`venue_campaigns:${profile.id}`);
    const campaigns = campaignsData ? JSON.parse(campaignsData) : [];

    return c.json({ success: true, campaigns });
  } catch (error: any) {
    console.error('Error fetching campaigns:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// GET /analytics/spending
app.get('/analytics/spending', async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const period = c.req.query('period') || 'month';
    const profile = await getVenueProfile(user.id);
    if (!profile) {
      return c.json({ error: 'Venue profile not found' }, 404);
    }

    // Получить историю расходов из KV
    const spendingData = await kv.get(`venue_spending:${profile.id}`);
    const spending = spendingData ? JSON.parse(spendingData) : [];

    return c.json({ success: true, period, data: spending });
  } catch (error: any) {
    console.error('Error fetching spending data:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// GET /analytics/roi
app.get('/analytics/roi', async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const profile = await getVenueProfile(user.id);
    if (!profile) {
      return c.json({ error: 'Venue profile not found' }, 404);
    }

    const roiData = await kv.get(`venue_roi:${profile.id}`);
    const roi = roiData ? JSON.parse(roiData) : [];

    return c.json({ success: true, data: roi });
  } catch (error: any) {
    console.error('Error fetching ROI data:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// GET /analytics/radio-compare
app.get('/analytics/radio-compare', async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const profile = await getVenueProfile(user.id);
    if (!profile) {
      return c.json({ error: 'Venue profile not found' }, 404);
    }

    const compareData = await kv.get(`venue_radio_compare:${profile.id}`);
    const comparison = compareData ? JSON.parse(compareData) : [];

    return c.json({ success: true, data: comparison });
  } catch (error: any) {
    console.error('Error fetching radio comparison:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// POST /analytics/export
app.post('/analytics/export', async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const { format, period } = body;

    return c.json({
      success: true,
      message: `Export in ${format || 'CSV'} format will be sent to your email`,
      format: format || 'CSV',
      period: period || 'month',
    });
  } catch (error: any) {
    console.error('Error exporting analytics:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// =====================================================
// NOTIFICATIONS ENDPOINTS
// =====================================================

// GET /notifications
app.get('/notifications', async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Получить уведомления из KV по prefix
    const notificationsData = await kv.getByPrefix(`notification:${user.id}:`);
    const notifications = notificationsData
      .map((n: any) => {
        try { return JSON.parse(n.value); } catch { return null; }
      })
      .filter(Boolean)
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return c.json({ success: true, notifications });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// PUT /notifications/:id/read
app.put('/notifications/:id/read', async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const notifId = c.req.param('id');
    const notifData = await kv.get(`notification:${user.id}:${notifId}`);
    
    if (notifData) {
      const notif = JSON.parse(notifData);
      notif.read = true;
      await kv.set(`notification:${user.id}:${notifId}`, JSON.stringify(notif));
    }

    return c.json({ success: true });
  } catch (error: any) {
    console.error('Error marking notification as read:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// =====================================================
// PLAYLISTS ENDPOINTS (for MusicSection)
// =====================================================

// GET /playlists - Получить плейлисты заведения
app.get('/playlists', async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const profile = await getVenueProfile(user.id);
    if (!profile) {
      return c.json({ success: true, playlists: [] });
    }

    const raw = await kv.get(`venue_playlists:${profile.id}`);
    const playlists = raw ? JSON.parse(raw) : [];

    return c.json({ success: true, playlists });
  } catch (error: any) {
    console.error('Error fetching venue playlists:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// POST /playlists - Создать плейлист
app.post('/playlists', async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const profile = await getVenueProfile(user.id);
    if (!profile) {
      return c.json({ error: 'Venue profile not found' }, 404);
    }

    const body = await c.req.json();
    const now = new Date().toISOString();
    const playlist = {
      id: `pl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      venueId: profile.id,
      ownerId: user.id,
      title: body.title || 'Новый плейлист',
      description: body.description || null,
      coverImageUrl: body.coverImageUrl || null,
      contentItems: body.contentItems || [],
      trackCount: body.trackCount || 0,
      totalDuration: body.totalDuration || 0,
      isPublic: body.isPublic ?? true,
      status: body.status || 'draft',
      createdAt: now,
      updatedAt: now,
    };

    const raw = await kv.get(`venue_playlists:${profile.id}`);
    const playlists = raw ? JSON.parse(raw) : [];
    playlists.push(playlist);
    await kv.set(`venue_playlists:${profile.id}`, JSON.stringify(playlists));

    return c.json({ success: true, playlist });
  } catch (error: any) {
    console.error('Error creating playlist:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// PUT /playlists/:id - Обновить плейлист
app.put('/playlists/:id', async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const profile = await getVenueProfile(user.id);
    if (!profile) {
      return c.json({ error: 'Venue profile not found' }, 404);
    }

    const playlistId = c.req.param('id');
    const body = await c.req.json();

    const raw = await kv.get(`venue_playlists:${profile.id}`);
    const playlists: any[] = raw ? JSON.parse(raw) : [];
    const idx = playlists.findIndex((p: any) => p.id === playlistId);
    if (idx === -1) {
      return c.json({ error: 'Playlist not found' }, 404);
    }

    playlists[idx] = { ...playlists[idx], ...body, updatedAt: new Date().toISOString() };
    await kv.set(`venue_playlists:${profile.id}`, JSON.stringify(playlists));

    return c.json({ success: true, playlist: playlists[idx] });
  } catch (error: any) {
    console.error('Error updating playlist:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// DELETE /playlists/:id - Удалить плейлист
app.delete('/playlists/:id', async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const profile = await getVenueProfile(user.id);
    if (!profile) {
      return c.json({ error: 'Venue profile not found' }, 404);
    }

    const playlistId = c.req.param('id');
    const raw = await kv.get(`venue_playlists:${profile.id}`);
    const playlists: any[] = raw ? JSON.parse(raw) : [];
    const filtered = playlists.filter((p: any) => p.id !== playlistId);
    await kv.set(`venue_playlists:${profile.id}`, JSON.stringify(filtered));

    return c.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting playlist:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// =====================================================
// RADIO CATALOG ENDPOINTS (for RadioSection)
// =====================================================

// GET /radio-catalog - Каталог радиостанций для рекламы
app.get('/radio-catalog', async (c) => {
  try {
    const raw = await kv.get('venue_radio_catalog');
    const stations = raw ? JSON.parse(raw) : [];
    return c.json({ success: true, stations });
  } catch (error: any) {
    console.error('Error fetching radio catalog:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// GET /radio-campaigns - Рекламные кампании заведения
app.get('/radio-campaigns', async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const profile = await getVenueProfile(user.id);
    if (!profile) {
      return c.json({ success: true, campaigns: [] });
    }

    const raw = await kv.get(`venue_ad_campaigns:${profile.id}`);
    const campaigns = raw ? JSON.parse(raw) : [];
    return c.json({ success: true, campaigns });
  } catch (error: any) {
    console.error('Error fetching radio campaigns:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// POST /radio-campaigns - Создать рекламную кампанию
app.post('/radio-campaigns', async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const profile = await getVenueProfile(user.id);
    if (!profile) {
      return c.json({ error: 'Venue profile not found' }, 404);
    }

    const body = await c.req.json();
    const campaign = {
      id: `camp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      stationId: body.stationId,
      stationName: body.stationName || '',
      packageType: body.packageType || 'slot_15sec',
      status: 'pending',
      audioUrl: body.audioUrl || '',
      startDate: body.startDate,
      endDate: body.endDate,
      totalPlays: 0,
      targetPlays: body.targetPlays || 0,
      budget: body.budget || 0,
      spent: 0,
      impressions: 0,
      ctr: 0,
      timeSlots: body.timeSlots || [],
      createdAt: new Date().toISOString(),
    };

    const raw = await kv.get(`venue_ad_campaigns:${profile.id}`);
    const campaigns = raw ? JSON.parse(raw) : [];
    campaigns.push(campaign);
    await kv.set(`venue_ad_campaigns:${profile.id}`, JSON.stringify(campaigns));

    return c.json({ success: true, campaign });
  } catch (error: any) {
    console.error('Error creating radio campaign:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// PUT /radio-campaigns/:id - Обновить кампанию (пауза/возобновление/отмена)
app.put('/radio-campaigns/:id', async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const profile = await getVenueProfile(user.id);
    if (!profile) {
      return c.json({ error: 'Venue profile not found' }, 404);
    }

    const campaignId = c.req.param('id');
    const body = await c.req.json();

    const raw = await kv.get(`venue_ad_campaigns:${profile.id}`);
    const campaigns: any[] = raw ? JSON.parse(raw) : [];
    const idx = campaigns.findIndex((c: any) => c.id === campaignId);
    if (idx === -1) {
      return c.json({ error: 'Campaign not found' }, 404);
    }

    campaigns[idx] = { ...campaigns[idx], ...body, updatedAt: new Date().toISOString() };
    await kv.set(`venue_ad_campaigns:${profile.id}`, JSON.stringify(campaigns));

    return c.json({ success: true, campaign: campaigns[idx] });
  } catch (error: any) {
    console.error('Error updating radio campaign:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// =====================================================
// RADIO BRAND ENDPOINTS (for RadioBrandSection)
// =====================================================

// GET /radio-brand - Настройки радиобренда заведения
app.get('/radio-brand', async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const profile = await getVenueProfile(user.id);
    if (!profile) {
      return c.json({ success: true, data: null });
    }

    const raw = await kv.get(`venue_radio_brand:${profile.id}`);
    const data = raw ? JSON.parse(raw) : null;
    return c.json({ success: true, data });
  } catch (error: any) {
    console.error('Error fetching radio brand:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// PUT /radio-brand - Обновить настройки радиобренда
app.put('/radio-brand', async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const profile = await getVenueProfile(user.id);
    if (!profile) {
      return c.json({ error: 'Venue profile not found' }, 404);
    }

    const body = await c.req.json();
    const raw = await kv.get(`venue_radio_brand:${profile.id}`);
    const current = raw ? JSON.parse(raw) : {};
    const updated = { ...current, ...body, updatedAt: new Date().toISOString() };
    await kv.set(`venue_radio_brand:${profile.id}`, JSON.stringify(updated));

    return c.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error updating radio brand:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// =====================================================
// BOOKINGS LIST (for Venue cabinet)
// =====================================================

app.get('/bookings', async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const statusFilter = c.req.query('status');
    const indexData = await kv.get(`bookings_by_user:${user.id}`);
    const bookingIds: string[] = indexData ? JSON.parse(indexData) : [];

    if (bookingIds.length === 0) {
      return c.json({ success: true, bookings: [] });
    }

    const bookingKeys = bookingIds.map(id => `booking:${id}`);
    const bookingValues = await kv.mget(bookingKeys);
    
    let bookings = bookingValues
      .filter(v => v !== null)
      .map(v => JSON.parse(v!))
      .filter(b => b.requesterId === user.id); // only as requester (venue)

    if (statusFilter) {
      bookings = bookings.filter(b => b.status === statusFilter);
    }

    bookings.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return c.json({ success: true, bookings });
  } catch (error: any) {
    console.error('Error fetching venue bookings:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

export default app;
