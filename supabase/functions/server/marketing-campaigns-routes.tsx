/**
 * MARKETING CAMPAIGNS ROUTES
 * Промо-кампании: артист создаёт → админ одобряет → запуск
 *
 * Production-ready: server-side pricing, state machine, SSE, revenue, audit log
 *
 * Endpoints:
 * GET    /campaigns/:userId              - кампании пользователя
 * GET    /campaigns/all                  - все кампании (админ)
 * GET    /campaigns/pending              - ожидающие модерации (админ)
 * GET    /campaigns/detail/:campaignId   - детали кампании
 * POST   /campaigns                      - создать кампанию (артист)
 * PATCH  /campaigns/:campaignId          - обновить кампанию
 * DELETE /campaigns/:campaignId          - удалить кампанию
 * POST   /campaigns/:campaignId/approve  - одобрить (админ)
 * POST   /campaigns/:campaignId/reject   - отклонить (админ)
 * POST   /campaigns/:campaignId/launch   - запустить (админ)
 * POST   /campaigns/:campaignId/pause    - приостановить (админ)
 * POST   /campaigns/:campaignId/resume   - возобновить (админ)
 * POST   /campaigns/:campaignId/complete - завершить (админ)
 */

import { Hono } from 'npm:hono@4';
import { notificationCampaignsStore, getNotificationCampaignsByUser, upsertNotificationCampaign, getSubscription } from './db.tsx';
import { notifyCrossCabinet } from './cross-cabinet-notify.tsx';
import { emitSSE } from './sse-routes.tsx';
import { recordRevenue } from './platform-revenue.tsx';
import { validateTransition, logAudit } from './pipeline-engine.tsx';
import { MARKETING_PRICES, MARKETING_DISCOUNTS } from '../../src/constants/financial.ts';

const marketing = new Hono();

// ── Серверный расчёт цены маркетинга ──

function calculateMarketingPriceServer(
  selectedServices: string[],
  subscriptionTier: string,
): { baseTotal: number; discountedTotal: number; discount: number; breakdown: { service: string; price: number }[] } {
  const breakdown: { service: string; price: number }[] = [];
  let baseTotal = 0;

  for (const service of selectedServices) {
    const price = (MARKETING_PRICES as Record<string, number>)[service] || 0;
    breakdown.push({ service, price });
    baseTotal += price;
  }

  const discount = (MARKETING_DISCOUNTS as Record<string, number>)[subscriptionTier] || 0;
  const discountedTotal = Math.round(baseTotal * (1 - discount));

  return { baseTotal, discountedTotal, discount, breakdown };
}

// ── GET /campaigns/:userId - кампании пользователя ──

marketing.get('/campaigns/:userId', async (c) => {
  const userId = c.req.param('userId');
  try {
    const campaigns = await getNotificationCampaignsByUser(userId);
    const valid = (campaigns || []).filter(Boolean);
    valid.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return c.json({ success: true, data: valid });
  } catch (error) {
    console.log('Marketing GET /campaigns/:userId error:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ── GET /campaigns/all - все кампании (админ) ──

marketing.get('/campaigns/all', async (c) => {
  try {
    const campaigns = await notificationCampaignsStore.getAll();
    const valid = (campaigns || []).filter(Boolean);
    valid.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return c.json({ success: true, data: valid });
  } catch (error) {
    console.log('Marketing GET /campaigns/all error:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ── GET /campaigns/pending - ожидающие модерации (админ) ──

marketing.get('/campaigns/pending', async (c) => {
  try {
    const campaigns = await notificationCampaignsStore.getAll();
    const pending = (campaigns || []).filter((c: any) => c && c.status === 'pending_review');
    pending.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return c.json({ success: true, data: pending, count: pending.length });
  } catch (error) {
    console.log('Marketing GET /campaigns/pending error:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ── GET /campaigns/detail/:campaignId ──

marketing.get('/campaigns/detail/:campaignId', async (c) => {
  const campaignId = c.req.param('campaignId');
  try {
    const campaign = await notificationCampaignsStore.get(campaignId);
    if (!campaign) return c.json({ success: false, error: 'Кампания не найдена' }, 404);
    return c.json({ success: true, data: campaign });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ── POST /campaigns - создать кампанию (артист) с серверным расчётом цены ──

marketing.post('/campaigns', async (c) => {
  try {
    const body = await c.req.json();
    if (!body.campaign_name || !body.user_id) {
      return c.json({ success: false, error: 'Обязательные поля: campaign_name, user_id' }, 400);
    }

    // Получаем подписку для серверного расчёта цены
    let subscriptionTier = 'none';
    try {
      const sub = await getSubscription(body.user_id);
      if (sub?.tier) subscriptionTier = sub.tier;
      else if (sub?.plan) subscriptionTier = sub.plan;
    } catch (e) {
      console.log('Get subscription error (non-critical):', e);
    }

    // Серверный расчёт цены — клиентские цены НЕ доверяем
    const selectedServices: string[] = body.selected_services || body.channels || [];
    const pricing = calculateMarketingPriceServer(selectedServices, subscriptionTier);

    const campaignId = `campaign_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    const campaign = {
      id: campaignId,
      campaign_name: body.campaign_name,
      user_id: body.user_id,
      artist_name: body.artist_name || 'Артист',
      description: body.description || '',
      content_ids: body.content_ids || [],
      selected_services: selectedServices,
      start_date: body.start_date || null,
      end_date: body.end_date || null,
      channels: body.channels || [],
      target_audience: body.target_audience || {
        age_range: '18-45',
        gender: 'all',
        geography: ['Россия'],
        interests: [],
      },
      budget_preference: body.budget_preference || 'medium',
      // Серверные цены (source of truth)
      base_price: pricing.baseTotal,
      final_price: pricing.discountedTotal,
      discount_applied: pricing.discount,
      price_breakdown: pricing.breakdown,
      subscription_tier: subscriptionTier,
      custom_budget: body.custom_budget || 0,
      status: 'pending_review',
      rejection_reason: null,
      additional_materials: body.additional_materials || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await upsertNotificationCampaign(body.user_id, campaignId, campaign);

    // Audit log
    logAudit({
      pipeline_type: 'marketing',
      content_type: 'marketing',
      item_id: campaignId,
      item_title: campaign.campaign_name,
      action: 'campaign_created',
      from_status: null,
      to_status: 'pending_review',
      actor_id: body.user_id,
      actor_role: 'artist',
      price: pricing.discountedTotal,
      details: `Кампания создана. Базовая: ${pricing.baseTotal}₽, со скидкой ${Math.round(pricing.discount * 100)}%: ${pricing.discountedTotal}₽`,
      metadata: { selectedServices, subscriptionTier, pricing },
    });

    // SSE: notify admin about new campaign
    emitSSE('admin-1', {
      type: 'marketing_campaign_created',
      data: {
        campaignId,
        campaignName: campaign.campaign_name,
        artistName: campaign.artist_name,
        userId: body.user_id,
        finalPrice: pricing.discountedTotal,
        status: 'pending_review',
      },
    });

    // Cross-cabinet: notify admin
    try {
      await notifyCrossCabinet({
        targetUserId: 'admin-1',
        targetRole: 'admin',
        sourceRole: 'artist',
        type: 'admin_action',
        title: 'Новая промо-кампания',
        message: `Артист «${campaign.artist_name}» создал кампанию «${campaign.campaign_name}» (${pricing.discountedTotal}₽) - ожидает модерации`,
        link: 'moderation',
        metadata: { campaignId, artistName: campaign.artist_name, price: pricing.discountedTotal },
      });
    } catch (e) {
      console.log('Notify admin error (non-critical):', e);
    }

    return c.json({ success: true, data: campaign }, 201);
  } catch (error) {
    console.log('Marketing POST /campaigns error:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ── PATCH /campaigns/:campaignId ──

marketing.patch('/campaigns/:campaignId', async (c) => {
  const campaignId = c.req.param('campaignId');
  try {
    const body = await c.req.json();
    const campaign = await notificationCampaignsStore.get(campaignId) as any;
    if (!campaign) return c.json({ success: false, error: 'Кампания не найдена' }, 404);

    // Запрещаем менять цены через PATCH — только через пересоздание
    delete body.base_price;
    delete body.final_price;
    delete body.discount_applied;
    delete body.price_breakdown;

    // Если меняются услуги — пересчитываем цену серверно
    if (body.selected_services || body.channels) {
      let subscriptionTier = campaign.subscription_tier || 'none';
      try {
        const sub = await getSubscription(campaign.user_id);
        if (sub?.tier) subscriptionTier = sub.tier;
        else if (sub?.plan) subscriptionTier = sub.plan;
      } catch (_) {}

      const services = body.selected_services || body.channels || campaign.selected_services || [];
      const pricing = calculateMarketingPriceServer(services, subscriptionTier);
      body.base_price = pricing.baseTotal;
      body.final_price = pricing.discountedTotal;
      body.discount_applied = pricing.discount;
      body.price_breakdown = pricing.breakdown;
      body.selected_services = services;
    }

    const updated = { ...campaign, ...body, updated_at: new Date().toISOString() };
    await upsertNotificationCampaign(updated.user_id, campaignId, updated);

    // Audit log
    logAudit({
      pipeline_type: 'marketing',
      content_type: 'marketing',
      item_id: campaignId,
      item_title: updated.campaign_name,
      action: 'campaign_updated',
      from_status: campaign.status,
      to_status: updated.status,
      actor_id: updated.user_id,
      actor_role: 'artist',
      details: `Кампания обновлена`,
    });

    return c.json({ success: true, data: updated });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ── DELETE /campaigns/:campaignId ──

marketing.delete('/campaigns/:campaignId', async (c) => {
  const campaignId = c.req.param('campaignId');
  try {
    const campaign = await notificationCampaignsStore.get(campaignId) as any;
    if (!campaign) return c.json({ success: false, error: 'Кампания не найдена' }, 404);

    await notificationCampaignsStore.del(campaignId);

    // Audit log
    logAudit({
      pipeline_type: 'marketing',
      content_type: 'marketing',
      item_id: campaignId,
      item_title: campaign.campaign_name || campaignId,
      action: 'campaign_deleted',
      from_status: campaign.status,
      to_status: 'deleted',
      actor_id: campaign.user_id || 'unknown',
      actor_role: 'artist',
    });

    return c.json({ success: true });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ── POST /campaigns/:campaignId/approve - одобрить (админ) ──

marketing.post('/campaigns/:campaignId/approve', async (c) => {
  const campaignId = c.req.param('campaignId');
  try {
    const body = await c.req.json().catch(() => ({}));
    const campaign = await notificationCampaignsStore.get(campaignId) as any;
    if (!campaign) return c.json({ success: false, error: 'Кампания не найдена' }, 404);

    // State machine validation
    const transition = validateTransition('marketing', campaign.status, 'approved');
    if (!transition.valid) {
      return c.json({ success: false, error: transition.error }, 400);
    }

    campaign.status = 'approved';
    // Админ может скорректировать цену, но не ниже серверного расчёта
    if (body.final_price && body.final_price >= campaign.final_price) {
      campaign.final_price = body.final_price;
    }
    campaign.approved_at = new Date().toISOString();
    campaign.updated_at = new Date().toISOString();
    campaign.approved_by = body.admin_id || 'admin-1';
    await upsertNotificationCampaign(campaign.user_id, campaignId, campaign);

    // Audit log
    logAudit({
      pipeline_type: 'marketing',
      content_type: 'marketing',
      item_id: campaignId,
      item_title: campaign.campaign_name,
      action: 'campaign_approved',
      from_status: 'pending_review',
      to_status: 'approved',
      actor_id: body.admin_id || 'admin-1',
      actor_role: 'admin',
      price: campaign.final_price,
      details: `Кампания одобрена. Финальная цена: ${campaign.final_price}₽`,
    });

    // SSE: notify artist
    emitSSE(campaign.user_id, {
      type: 'marketing_campaign_approved',
      data: {
        campaignId,
        campaignName: campaign.campaign_name,
        status: 'approved',
        finalPrice: campaign.final_price,
      },
    });

    // SSE: notify admin panel
    emitSSE('admin-1', {
      type: 'marketing_campaign_status_changed',
      data: { campaignId, status: 'approved', campaignName: campaign.campaign_name },
    });

    // Cross-cabinet: notify artist
    try {
      await notifyCrossCabinet({
        targetUserId: campaign.user_id,
        targetRole: 'artist',
        sourceRole: 'admin',
        type: 'admin_action',
        title: 'Кампания одобрена',
        message: `Ваша промо-кампания «${campaign.campaign_name}» одобрена администратором и готова к запуску`,
        link: 'campaigns',
        metadata: { campaignId, status: 'approved' },
      });
    } catch (e) {
      console.log('Notify artist (approve) error:', e);
    }

    return c.json({ success: true, data: campaign });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ── POST /campaigns/:campaignId/reject - отклонить (админ) ──

marketing.post('/campaigns/:campaignId/reject', async (c) => {
  const campaignId = c.req.param('campaignId');
  try {
    const body = await c.req.json().catch(() => ({}));
    const campaign = await notificationCampaignsStore.get(campaignId) as any;
    if (!campaign) return c.json({ success: false, error: 'Кампания не найдена' }, 404);

    // State machine validation
    const transition = validateTransition('marketing', campaign.status, 'rejected');
    if (!transition.valid) {
      return c.json({ success: false, error: transition.error }, 400);
    }

    campaign.status = 'rejected';
    campaign.rejection_reason = body.reason || 'Не указана';
    campaign.rejected_at = new Date().toISOString();
    campaign.updated_at = new Date().toISOString();
    campaign.rejected_by = body.admin_id || 'admin-1';
    await upsertNotificationCampaign(campaign.user_id, campaignId, campaign);

    // Audit log
    logAudit({
      pipeline_type: 'marketing',
      content_type: 'marketing',
      item_id: campaignId,
      item_title: campaign.campaign_name,
      action: 'campaign_rejected',
      from_status: 'pending_review',
      to_status: 'rejected',
      actor_id: body.admin_id || 'admin-1',
      actor_role: 'admin',
      details: `Кампания отклонена. Причина: ${campaign.rejection_reason}`,
    });

    // SSE: notify artist
    emitSSE(campaign.user_id, {
      type: 'marketing_campaign_rejected',
      data: {
        campaignId,
        campaignName: campaign.campaign_name,
        status: 'rejected',
        reason: campaign.rejection_reason,
      },
    });

    // SSE: notify admin panel
    emitSSE('admin-1', {
      type: 'marketing_campaign_status_changed',
      data: { campaignId, status: 'rejected', campaignName: campaign.campaign_name },
    });

    // Cross-cabinet: notify artist
    try {
      await notifyCrossCabinet({
        targetUserId: campaign.user_id,
        targetRole: 'artist',
        sourceRole: 'admin',
        type: 'admin_action',
        title: 'Кампания отклонена',
        message: `Промо-кампания «${campaign.campaign_name}» отклонена. Причина: ${campaign.rejection_reason}`,
        link: 'campaigns',
        metadata: { campaignId, status: 'rejected', reason: campaign.rejection_reason },
      });
    } catch (e) {
      console.log('Notify artist (reject) error:', e);
    }

    return c.json({ success: true, data: campaign });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ── POST /campaigns/:campaignId/launch - запустить кампанию (админ) ──

marketing.post('/campaigns/:campaignId/launch', async (c) => {
  const campaignId = c.req.param('campaignId');
  try {
    const body = await c.req.json().catch(() => ({}));
    const campaign = await notificationCampaignsStore.get(campaignId) as any;
    if (!campaign) return c.json({ success: false, error: 'Кампания не найдена' }, 404);

    // State machine validation
    const transition = validateTransition('marketing', campaign.status, 'active');
    if (!transition.valid) {
      return c.json({ success: false, error: transition.error }, 400);
    }

    campaign.status = 'active';
    campaign.launched_at = new Date().toISOString();
    campaign.updated_at = new Date().toISOString();
    campaign.launched_by = body.admin_id || 'admin-1';
    await upsertNotificationCampaign(campaign.user_id, campaignId, campaign);

    // Record revenue — маркетинг = 100% дохода платформы
    try {
      await recordRevenue({
        channel: 'marketing_campaign',
        description: `Промо-кампания «${campaign.campaign_name}» от ${campaign.artist_name}`,
        grossAmount: campaign.final_price,
        platformRevenue: campaign.final_price,
        payoutAmount: 0,
        commissionRate: 1.0,
        payerId: campaign.user_id,
        payerName: campaign.artist_name,
        metadata: {
          campaignId,
          campaignName: campaign.campaign_name,
          selectedServices: campaign.selected_services,
          subscriptionTier: campaign.subscription_tier,
          basePrice: campaign.base_price,
          discount: campaign.discount_applied,
        },
      });
    } catch (e) {
      console.log('Record revenue error (non-critical):', e);
    }

    // Audit log
    logAudit({
      pipeline_type: 'marketing',
      content_type: 'marketing',
      item_id: campaignId,
      item_title: campaign.campaign_name,
      action: 'campaign_launched',
      from_status: 'approved',
      to_status: 'active',
      actor_id: body.admin_id || 'admin-1',
      actor_role: 'admin',
      price: campaign.final_price,
      details: `Кампания запущена. Revenue: ${campaign.final_price}₽`,
    });

    // SSE: notify artist about launch
    emitSSE(campaign.user_id, {
      type: 'marketing_campaign_launched',
      data: {
        campaignId,
        campaignName: campaign.campaign_name,
        status: 'active',
      },
    });

    // SSE: notify admin panel
    emitSSE('admin-1', {
      type: 'marketing_campaign_status_changed',
      data: { campaignId, status: 'active', campaignName: campaign.campaign_name, revenue: campaign.final_price },
    });

    // Cross-cabinet: notify artist about launch
    try {
      await notifyCrossCabinet({
        targetUserId: campaign.user_id,
        targetRole: 'artist',
        sourceRole: 'admin',
        type: 'admin_action',
        title: 'Кампания запущена!',
        message: `Ваша промо-кампания «${campaign.campaign_name}» успешно запущена. Отслеживайте результаты в личном кабинете.`,
        link: 'campaigns',
        metadata: { campaignId, status: 'active' },
      });
    } catch (e) {
      console.log('Notify artist (launch) error:', e);
    }

    return c.json({ success: true, data: campaign });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ── POST /campaigns/:campaignId/pause - приостановить (админ) ──

marketing.post('/campaigns/:campaignId/pause', async (c) => {
  const campaignId = c.req.param('campaignId');
  try {
    const body = await c.req.json().catch(() => ({}));
    const campaign = await notificationCampaignsStore.get(campaignId) as any;
    if (!campaign) return c.json({ success: false, error: 'Кампания не найдена' }, 404);

    const transition = validateTransition('marketing', campaign.status, 'paused');
    if (!transition.valid) {
      return c.json({ success: false, error: transition.error }, 400);
    }

    const prevStatus = campaign.status;
    campaign.status = 'paused';
    campaign.paused_at = new Date().toISOString();
    campaign.updated_at = new Date().toISOString();
    campaign.pause_reason = body.reason || '';
    await upsertNotificationCampaign(campaign.user_id, campaignId, campaign);

    logAudit({
      pipeline_type: 'marketing',
      content_type: 'marketing',
      item_id: campaignId,
      item_title: campaign.campaign_name,
      action: 'campaign_paused',
      from_status: prevStatus,
      to_status: 'paused',
      actor_id: body.admin_id || 'admin-1',
      actor_role: 'admin',
      details: body.reason ? `Приостановлена: ${body.reason}` : 'Кампания приостановлена',
    });

    emitSSE(campaign.user_id, {
      type: 'marketing_campaign_paused',
      data: { campaignId, campaignName: campaign.campaign_name, status: 'paused' },
    });
    emitSSE('admin-1', {
      type: 'marketing_campaign_status_changed',
      data: { campaignId, status: 'paused', campaignName: campaign.campaign_name },
    });

    try {
      await notifyCrossCabinet({
        targetUserId: campaign.user_id,
        targetRole: 'artist',
        sourceRole: 'admin',
        type: 'admin_action',
        title: 'Кампания приостановлена',
        message: `Промо-кампания «${campaign.campaign_name}» приостановлена.${body.reason ? ` Причина: ${body.reason}` : ''}`,
        link: 'campaigns',
        metadata: { campaignId, status: 'paused' },
      });
    } catch (e) {
      console.log('Notify artist (pause) error:', e);
    }

    return c.json({ success: true, data: campaign });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ── POST /campaigns/:campaignId/resume - возобновить (админ) ──

marketing.post('/campaigns/:campaignId/resume', async (c) => {
  const campaignId = c.req.param('campaignId');
  try {
    const body = await c.req.json().catch(() => ({}));
    const campaign = await notificationCampaignsStore.get(campaignId) as any;
    if (!campaign) return c.json({ success: false, error: 'Кампания не найдена' }, 404);

    const transition = validateTransition('marketing', campaign.status, 'active');
    if (!transition.valid) {
      return c.json({ success: false, error: transition.error }, 400);
    }

    campaign.status = 'active';
    campaign.resumed_at = new Date().toISOString();
    campaign.updated_at = new Date().toISOString();
    await upsertNotificationCampaign(campaign.user_id, campaignId, campaign);

    logAudit({
      pipeline_type: 'marketing',
      content_type: 'marketing',
      item_id: campaignId,
      item_title: campaign.campaign_name,
      action: 'campaign_resumed',
      from_status: 'paused',
      to_status: 'active',
      actor_id: body.admin_id || 'admin-1',
      actor_role: 'admin',
      details: 'Кампания возобновлена',
    });

    emitSSE(campaign.user_id, {
      type: 'marketing_campaign_resumed',
      data: { campaignId, campaignName: campaign.campaign_name, status: 'active' },
    });
    emitSSE('admin-1', {
      type: 'marketing_campaign_status_changed',
      data: { campaignId, status: 'active', campaignName: campaign.campaign_name },
    });

    try {
      await notifyCrossCabinet({
        targetUserId: campaign.user_id,
        targetRole: 'artist',
        sourceRole: 'admin',
        type: 'admin_action',
        title: 'Кампания возобновлена',
        message: `Промо-кампания «${campaign.campaign_name}» возобновлена и снова активна.`,
        link: 'campaigns',
        metadata: { campaignId, status: 'active' },
      });
    } catch (e) {
      console.log('Notify artist (resume) error:', e);
    }

    return c.json({ success: true, data: campaign });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ── POST /campaigns/:campaignId/complete - завершить (админ) ──

marketing.post('/campaigns/:campaignId/complete', async (c) => {
  const campaignId = c.req.param('campaignId');
  try {
    const body = await c.req.json().catch(() => ({}));
    const campaign = await notificationCampaignsStore.get(campaignId) as any;
    if (!campaign) return c.json({ success: false, error: 'Кампания не найдена' }, 404);

    const transition = validateTransition('marketing', campaign.status, 'completed');
    if (!transition.valid) {
      return c.json({ success: false, error: transition.error }, 400);
    }

    const prevStatus = campaign.status;
    campaign.status = 'completed';
    campaign.completed_at = new Date().toISOString();
    campaign.updated_at = new Date().toISOString();
    campaign.results_summary = body.results_summary || null;
    await upsertNotificationCampaign(campaign.user_id, campaignId, campaign);

    logAudit({
      pipeline_type: 'marketing',
      content_type: 'marketing',
      item_id: campaignId,
      item_title: campaign.campaign_name,
      action: 'campaign_completed',
      from_status: prevStatus,
      to_status: 'completed',
      actor_id: body.admin_id || 'admin-1',
      actor_role: 'admin',
      price: campaign.final_price,
      details: 'Кампания завершена',
    });

    emitSSE(campaign.user_id, {
      type: 'marketing_campaign_completed',
      data: { campaignId, campaignName: campaign.campaign_name, status: 'completed' },
    });
    emitSSE('admin-1', {
      type: 'marketing_campaign_status_changed',
      data: { campaignId, status: 'completed', campaignName: campaign.campaign_name },
    });

    try {
      await notifyCrossCabinet({
        targetUserId: campaign.user_id,
        targetRole: 'artist',
        sourceRole: 'admin',
        type: 'admin_action',
        title: 'Кампания завершена',
        message: `Промо-кампания «${campaign.campaign_name}» завершена. Ознакомьтесь с результатами в личном кабинете.`,
        link: 'campaigns',
        metadata: { campaignId, status: 'completed' },
      });
    } catch (e) {
      console.log('Notify artist (complete) error:', e);
    }

    return c.json({ success: true, data: campaign });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

export default marketing;
