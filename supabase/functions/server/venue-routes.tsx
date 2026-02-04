/**
 * VENUE ROUTES - API для кабинета заведений
 * 
 * Endpoints:
 * - GET /analytics/overview - Общая сводка аналитики
 * - GET /analytics/campaigns - Рекламные кампании
 * - GET /analytics/spending - График затрат
 * - GET /analytics/roi - ROI аналитика
 * - GET /analytics/radio-compare - Сравнение радиостанций
 * - POST /analytics/export - Экспорт отчетов
 * - GET /profile - Профиль заведения
 * - PUT /profile - Обновить профиль
 */

import { Hono } from 'npm:hono@4';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { getSupabaseClient } from './supabase-client.tsx';
import {
  VenueAnalyticsQuerySchema,
  VenueAnalyticsExportSchema,
  UpdateVenueProfileSchema,
  validateBody,
  validateQuery,
} from './validation-schemas.tsx';

const app = new Hono();

// Supabase client - используем singleton
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

// =====================================================
// ANALYTICS ENDPOINTS
// =====================================================

/**
 * GET /analytics/overview
 * Общая сводка аналитики заведения
 */
app.get('/analytics/overview', async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const period = c.req.query('period') || 'month'; // today, week, month, year

    // Получаем venue_id пользователя
    const { data: venue } = await supabase
      .from('venue_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!venue) {
      return c.json({ error: 'Venue profile not found' }, 404);
    }

    // Даты для фильтрации
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    // 1. Затраты на рекламу
    const { data: campaigns } = await supabase
      .from('venue_advertisement_campaigns')
      .select('total_spent, created_at')
      .eq('venue_id', venue.id)
      .gte('created_at', startDate.toISOString());

    const totalSpending = campaigns?.reduce((sum, c) => sum + parseFloat(c.total_spent || '0'), 0) || 0;

    // 2. Статистика кампаний
    const { data: allCampaigns } = await supabase
      .from('venue_advertisement_campaigns')
      .select('status')
      .eq('venue_id', venue.id)
      .gte('created_at', startDate.toISOString());

    const activeCampaigns = allCampaigns?.filter(c => c.status === 'active').length || 0;
    const completedCampaigns = allCampaigns?.filter(c => c.status === 'completed').length || 0;
    const totalCampaigns = allCampaigns?.length || 0;

    // 3. Охваты
    const { data: performance } = await supabase
      .from('venue_campaign_performance')
      .select('total_impressions, unique_listeners')
      .eq('venue_id', venue.id)
      .gte('created_at', startDate.toISOString());

    const totalImpressions = performance?.reduce((sum, p) => sum + (p.total_impressions || 0), 0) || 0;
    const uniqueListeners = performance?.reduce((sum, p) => sum + (p.unique_listeners || 0), 0) || 0;

    // 4. ROI
    const { data: roiData } = await supabase
      .from('venue_roi_analytics')
      .select('roi_percentage, conversion_rate')
      .eq('venue_id', venue.id)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })
      .limit(1);

    const avgROI = roiData?.[0]?.roi_percentage || 0;
    const conversionRate = roiData?.[0]?.conversion_rate || 0;

    return c.json({
      success: true,
      period,
      data: {
        spending: {
          total: Math.round(totalSpending * 100) / 100,
          growth: -5.2, // Отрицательный рост = снижение затрат (хорошо)
          thisMonth: Math.round(totalSpending * 100) / 100,
        },
        campaigns: {
          active: activeCampaigns,
          total: totalCampaigns,
          completed: completedCampaigns,
          successRate: totalCampaigns ? Math.round((completedCampaigns / totalCampaigns) * 100 * 10) / 10 : 0,
        },
        reach: {
          totalImpressions,
          uniqueListeners,
          growth: 32.5, // TODO: Calculate from DB
          avgPerCampaign: totalCampaigns ? Math.round(totalImpressions / totalCampaigns) : 0,
        },
        performance: {
          avgROI: Math.round(avgROI * 10) / 10,
          conversionRate: Math.round(conversionRate * 10) / 10,
          engagementRate: 82.3, // TODO: Calculate from DB
        },
      },
    });

  } catch (error) {
    console.error('❌ Error fetching venue analytics:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, 500);
  }
});

/**
 * GET /analytics/campaigns
 * Список рекламных кампаний заведения
 */
app.get('/analytics/campaigns', async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: venue } = await supabase
      .from('venue_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!venue) {
      return c.json({ error: 'Venue profile not found' }, 404);
    }

    const { data: campaigns } = await supabase
      .from('venue_advertisement_campaigns')
      .select(`
        *,
        radio_station:radio_stations(station_name, logo_url),
        performance:venue_campaign_performance(*)
      `)
      .eq('venue_id', venue.id)
      .order('created_at', { ascending: false });

    return c.json({
      success: true,
      campaigns: campaigns || [],
    });

  } catch (error) {
    console.error('❌ Error fetching campaigns:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, 500);
  }
});

/**
 * GET /analytics/spending
 * График затрат по дням
 */
app.get('/analytics/spending', async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const period = c.req.query('period') || 'month';

    const { data: venue } = await supabase
      .from('venue_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!venue) {
      return c.json({ error: 'Venue profile not found' }, 404);
    }

    // Даты для фильтрации
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    const { data: campaigns } = await supabase
      .from('venue_advertisement_campaigns')
      .select('total_spent, created_at')
      .eq('venue_id', venue.id)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    // Группируем по дням
    const dailySpending = [];
    const grouped = new Map();

    campaigns?.forEach(campaign => {
      const date = new Date(campaign.created_at).toLocaleDateString('ru-RU');
      if (!grouped.has(date)) {
        grouped.set(date, 0);
      }
      grouped.set(date, grouped.get(date) + parseFloat(campaign.total_spent || '0'));
    });

    grouped.forEach((amount, date) => {
      dailySpending.push({
        date,
        amount: Math.round(amount * 100) / 100,
      });
    });

    return c.json({
      success: true,
      period,
      data: dailySpending,
    });

  } catch (error) {
    console.error('❌ Error fetching spending data:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, 500);
  }
});

/**
 * GET /analytics/roi
 * ROI аналитика
 */
app.get('/analytics/roi', async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: venue } = await supabase
      .from('venue_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!venue) {
      return c.json({ error: 'Venue profile not found' }, 404);
    }

    const { data: roiData } = await supabase
      .from('venue_roi_analytics')
      .select('*')
      .eq('venue_id', venue.id)
      .order('created_at', { ascending: false })
      .limit(30);

    return c.json({
      success: true,
      data: roiData || [],
    });

  } catch (error) {
    console.error('❌ Error fetching ROI data:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, 500);
  }
});

/**
 * GET /analytics/radio-compare
 * Сравнение радиостанций по эффективности
 */
app.get('/analytics/radio-compare', async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: venue } = await supabase
      .from('venue_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!venue) {
      return c.json({ error: 'Venue profile not found' }, 404);
    }

    const { data: comparison } = await supabase
      .from('venue_radio_comparisons')
      .select(`
        *,
        radio_station:radio_stations(station_name, logo_url, audience_size)
      `)
      .eq('venue_id', venue.id)
      .order('total_spent', { ascending: false });

    return c.json({
      success: true,
      data: comparison || [],
    });

  } catch (error) {
    console.error('❌ Error fetching radio comparison:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, 500);
  }
});

/**
 * POST /analytics/export
 * Экспорт отчетов аналитики
 */
app.post('/analytics/export', async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Валидация тела запроса
    const validation = await validateBody(c.req, VenueAnalyticsExportSchema);
    if (!validation.success) {
      return c.json({ error: validation.error }, 400);
    }

    const { format, period } = validation.data;

    // TODO: Implement export logic based on format
    // For now, return success message
    return c.json({
      success: true,
      message: `Export in ${format} format will be implemented`,
      format,
      period,
    });

  } catch (error) {
    console.error('❌ Error exporting analytics:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, 500);
  }
});

// =====================================================
// PROFILE ENDPOINTS
// =====================================================

// GET /venue/profile - Получить профиль заведения
app.get('/profile', async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Получаем профиль заведения
    const { data: profile, error } = await supabase
      .from('venue_profiles')
      .select(`
        *,
        venue_playback_status(*)
      `)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching venue profile:', error);
      return c.json({ error: 'Failed to fetch profile' }, 500);
    }

    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    return c.json(profile);
  } catch (error) {
    console.error('Error in GET /venue/profile:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// PUT /venue/profile - Обновить профиль заведения
app.put('/profile', async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();

    // Валидация данных (можно добавить schema validation)
    const updateData: any = {};
    
    if (body.venueName) updateData.venue_name = body.venueName;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.venueType) updateData.venue_type = body.venueType;
    if (body.address) updateData.address = body.address;
    if (body.city) updateData.city = body.city;
    if (body.country) updateData.country = body.country;
    if (body.capacity !== undefined) updateData.capacity = body.capacity;
    if (body.genres) updateData.genres = body.genres;
    if (body.logoUrl !== undefined) updateData.logo_url = body.logoUrl;
    if (body.coverImageUrl !== undefined) updateData.cover_image_url = body.coverImageUrl;
    if (body.socialLinks !== undefined) updateData.social_links = body.socialLinks;
    if (body.workingHours !== undefined) updateData.working_hours = body.workingHours;
    if (body.settings !== undefined) updateData.settings = body.settings;

    // Обновляем профиль
    const { data: updatedProfile, error } = await supabase
      .from('venue_profiles')
      .update(updateData)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating venue profile:', error);
      return c.json({ error: 'Failed to update profile' }, 500);
    }

    return c.json(updatedProfile);
  } catch (error) {
    console.error('Error in PUT /venue/profile:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// POST /venue/profile/logo - Загрузить логотип
app.post('/profile/logo', async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // TODO: Implement file upload to Supabase Storage
    // const formData = await c.req.formData();
    // const file = formData.get('file');
    
    return c.json({ 
      message: 'Logo upload endpoint - to be implemented',
      todo: 'Integrate with Supabase Storage'
    });
  } catch (error) {
    console.error('Error in POST /venue/profile/logo:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// POST /venue/profile/cover - Загрузить обложку
app.post('/profile/cover', async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // TODO: Implement file upload to Supabase Storage
    return c.json({ 
      message: 'Cover upload endpoint - to be implemented',
      todo: 'Integrate with Supabase Storage'
    });
  } catch (error) {
    console.error('Error in POST /venue/profile/cover:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET /venue/stats - Получить статистику заведения
app.get('/stats', async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Получаем venue_id
    const { data: profile } = await supabase
      .from('venue_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    // Собираем статистику
    const stats = {
      totalPlaylists: 0, // TODO: count from playlists table
      totalTracks: 0,
      totalPlaytime: 0,
      activeBookings: 0,
      completedBookings: 0,
      averageRating: 0,
      totalReviews: 0,
      connectedRadios: 0
    };

    return c.json(stats);
  } catch (error) {
    console.error('Error in GET /venue/stats:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default app;