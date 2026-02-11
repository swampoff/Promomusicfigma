/**
 * MANAGE BANNER AD - SQL VERSION
 * Управление баннерными кампаниями с использованием PostgreSQL
 */

import { createClient } from 'jsr:@supabase/supabase-js@2';

/**
 * Управление баннерной кампанией (админ функции)
 * Actions: approve, reject, confirm_payment, cancel
 */
export async function manageBannerAd(action: string, payload: any) {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const { bannerId } = payload;

  if (!bannerId) {
    throw new Error('Banner ID is required');
  }

  try {
    // Получаем текущий баннер
    const { data: banner, error: fetchError } = await supabase
      .from('banner_ads')
      .select('*')
      .eq('id', bannerId)
      .single();

    if (fetchError || !banner) {
      throw new Error('Banner not found');
    }

    let updateData: any = {};
    let message = '';

    switch (action) {
      case 'approve':
        // Одобрить баннер (после модерации)
        if (banner.status !== 'pending_moderation') {
          throw new Error('Can only approve banners in pending_moderation status');
        }
        
        updateData = {
          status: 'payment_pending',
          moderated_at: new Date().toISOString(),
        };
        
        if (payload.moderatorId) {
          updateData.moderated_by = payload.moderatorId;
        }
        
        if (payload.notes) {
          updateData.admin_notes = payload.notes;
        }
        
        message = 'Banner approved and moved to payment_pending';
        break;

      case 'reject':
        // Отклонить баннер
        if (banner.status !== 'pending_moderation') {
          throw new Error('Can only reject banners in pending_moderation status');
        }
        
        if (!payload.reason) {
          throw new Error('Rejection reason is required');
        }
        
        updateData = {
          status: 'rejected',
          rejection_reason: payload.reason,
          moderated_at: new Date().toISOString(),
        };
        
        if (payload.moderatorId) {
          updateData.moderated_by = payload.moderatorId;
        }
        
        message = 'Banner rejected';
        break;

      case 'confirm_payment':
        // Подтвердить оплату и активировать баннер
        if (banner.status !== 'payment_pending' && banner.status !== 'approved') {
          throw new Error('Can only confirm payment for banners in payment_pending or approved status');
        }
        
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + banner.duration_days);
        
        updateData = {
          status: 'active',
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
        };
        
        message = 'Payment confirmed, banner is now active';
        break;

      case 'cancel':
        // Отменить баннер
        if (banner.status === 'active' || banner.status === 'payment_pending') {
          updateData = {
            status: 'cancelled',
          };
          message = 'Banner cancelled';
        } else {
          throw new Error('Can only cancel active or payment_pending banners');
        }
        break;

      case 'pause':
        // Приостановить активный баннер
        if (banner.status !== 'active') {
          throw new Error('Can only pause active banners');
        }
        
        updateData = {
          status: 'approved', // Возвращаем в approved для возможности повторной активации
        };
        
        message = 'Banner paused';
        break;

      case 'extend':
        // Продлить баннер
        if (banner.status !== 'active' && banner.status !== 'expired') {
          throw new Error('Can only extend active or expired banners');
        }
        
        if (!payload.additionalDays || payload.additionalDays < 1) {
          throw new Error('Additional days must be at least 1');
        }
        
        const currentEndDate = new Date(banner.end_date || new Date());
        const newEndDate = new Date(currentEndDate);
        newEndDate.setDate(newEndDate.getDate() + payload.additionalDays);
        
        updateData = {
          end_date: newEndDate.toISOString(),
          duration_days: banner.duration_days + payload.additionalDays,
          status: 'active', // Активируем если был expired
        };
        
        message = `Banner extended by ${payload.additionalDays} days`;
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    // Обновляем баннер в базе данных
    const { data: updatedBanner, error: updateError } = await supabase
      .from('banner_ads')
      .update(updateData)
      .eq('id', bannerId)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error updating banner:', updateError);
      throw new Error(`Failed to update banner: ${updateError.message}`);
    }

    console.log(`✅ Banner ${action} successful:`, bannerId);

    return {
      success: true,
      bannerId,
      action,
      newStatus: updatedBanner.status,
      message,
      banner: updatedBanner,
    };

  } catch (error) {
    console.error(`❌ Error in manageBannerAd (${action}):`, error);
    throw error;
  }
}

/**
 * Регистрация события баннера (показ или клик)
 */
export async function recordBannerEvent(bannerId: string, eventType: 'view' | 'click', context?: any) {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    // 1. Записываем событие в таблицу событий
    const { error: eventError } = await supabase
      .from('banner_events')
      .insert({
        banner_id: bannerId,
        event_type: eventType,
        user_agent: context?.userAgent || null,
        ip_address: context?.ipAddress || null,
        referrer: context?.referrer || null,
        session_id: context?.sessionId || null,
        country: context?.country || null,
        city: context?.city || null,
      });

    if (eventError) {
      console.error('❌ Error inserting event:', eventError);
      // Не бросаем ошибку, продолжаем обновлять счётчики
    }

    // 2. Атомарно обновляем счётчики используя database function (избегаем race condition)
    const { data: updatedCounters, error: rpcError } = await supabase
      .rpc('increment_banner_counter', {
        p_banner_id: bannerId,
        p_counter_type: eventType
      })
      .single();

    if (rpcError) {
      console.error('❌ Error incrementing counter:', rpcError);
      // Fallback: try to get current values
      const { data: banner } = await supabase
        .from('banner_ads')
        .select('views, clicks')
        .eq('id', bannerId)
        .single();
      
      return {
        success: true,
        bannerId,
        eventType,
        views: banner?.views || 0,
        clicks: banner?.clicks || 0,
      };
    }

    console.log(`✅ ${eventType} recorded for banner:`, bannerId);

    return {
      success: true,
      bannerId,
      eventType,
      views: updatedCounters.views,
      clicks: updatedCounters.clicks,
    };

  } catch (error) {
    console.error('❌ Error recording banner event:', error);
    throw error;
  }
}

/**
 * Проверка и автоматическое истечение баннеров
 * (вызывается по cron или вручную)
 */
export async function checkAndExpireBanners() {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    // Используем SQL функцию для истечения баннеров
    const { data, error } = await supabase.rpc('expire_banner_ads');

    if (error) {
      console.error('❌ Error expiring banners:', error);
      throw new Error(`Failed to expire banners: ${error.message}`);
    }

    const expiredCount = data || 0;
    console.log(`✅ Expired ${expiredCount} banners`);

    return expiredCount;

  } catch (error) {
    console.error('❌ Error in checkAndExpireBanners:', error);
    return 0;
  }
}

/**
 * Получить дневную аналитику баннера
 */
export async function getBannerDailyAnalytics(bannerId: string, startDate?: string, endDate?: string) {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    let query = supabase
      .from('banner_analytics_daily')
      .select('*')
      .eq('banner_id', bannerId)
      .order('date', { ascending: false });

    if (startDate) {
      query = query.gte('date', startDate);
    }

    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Error fetching daily analytics:', error);
      throw new Error(`Failed to fetch analytics: ${error.message}`);
    }

    return data || [];

  } catch (error) {
    console.error('❌ Error in getBannerDailyAnalytics:', error);
    return [];
  }
}

/**
 * Агрегация событий в дневную аналитику
 * (вызывается по cron в конце каждого дня)
 */
export async function aggregateBannerAnalytics(date?: string) {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const targetDate = date || new Date().toISOString().split('T')[0];

  try {
    // Получаем все активные баннеры за день
    const { data: banners, error: bannersError } = await supabase
      .from('banner_ads')
      .select('id, price, duration_days')
      .eq('status', 'active')
      .lte('start_date', targetDate)
      .gte('end_date', targetDate);

    if (bannersError) {
      throw new Error(`Failed to fetch banners: ${bannersError.message}`);
    }

    if (!banners || banners.length === 0) {
      console.log('ℹ️  No active banners for date:', targetDate);
      return 0;
    }

    // Extract banner IDs for batch query
    const bannerIds = banners.map(b => b.id);

    // Batch query for all events in one go - optimized to avoid N+1 problem
    const { data: events, error: eventsError } = await supabase
      .from('banner_events')
      .select('banner_id, event_type, session_id')
      .in('banner_id', bannerIds)
      .gte('created_at', `${targetDate}T00:00:00Z`)
      .lt('created_at', `${targetDate}T23:59:59Z`);

    if (eventsError) {
      throw new Error(`Failed to fetch events: ${eventsError.message}`);
    }

    let aggregatedCount = 0;

    // Aggregate events by banner_id in memory (single pass)
    const eventsByBanner = new Map<string, {
      views: number;
      clicks: number;
      uniqueViews: Set<string>;
      uniqueClicks: Set<string>;
    }>();

    // Initialize map for all banners
    for (const banner of banners) {
      eventsByBanner.set(banner.id, {
        views: 0,
        clicks: 0,
        uniqueViews: new Set(),
        uniqueClicks: new Set(),
      });
    }

    // Single pass through events to build aggregations
    for (const event of events || []) {
      const stats = eventsByBanner.get(event.banner_id);
      if (!stats) continue;

      if (event.event_type === 'view') {
        stats.views++;
        if (event.session_id) {
          stats.uniqueViews.add(event.session_id);
        }
      } else if (event.event_type === 'click') {
        stats.clicks++;
        if (event.session_id) {
          stats.uniqueClicks.add(event.session_id);
        }
      }
    }

    // Insert/update daily statistics for all banners
    for (const banner of banners) {
      const stats = eventsByBanner.get(banner.id);
      if (!stats) continue;

      const views = stats.views;
      const clicks = stats.clicks;
      const uniqueViewsCount = stats.uniqueViews.size;
      const uniqueClicksCount = stats.uniqueClicks.size;

      // Расчёт стоимости клика
      const costPerClick = clicks > 0 ? banner.price / clicks : 0;

      // Вставка/обновление дневной статистики
      const { error: upsertError } = await supabase
        .from('banner_analytics_daily')
        .upsert({
          banner_id: banner.id,
          date: targetDate,
          views,
          clicks,
          unique_views: uniqueViewsCount,
          unique_clicks: uniqueClicksCount,
          cost_per_click: costPerClick,
          // CTR будет рассчитан автоматически через триггер
        }, {
          onConflict: 'banner_id,date',
        });

      if (upsertError) {
        console.error(`❌ Error upserting analytics for banner ${banner.id}:`, upsertError);
      } else {
        aggregatedCount++;
      }
    }

    console.log(`✅ Aggregated analytics for ${aggregatedCount} banners on ${targetDate}`);
    return aggregatedCount;

  } catch (error) {
    console.error('❌ Error in aggregateBannerAnalytics:', error);
    return 0;
  }
}
