/**
 * MARKETING CAMPAIGNS ROUTES
 * Промо-кампании: артист создаёт → админ одобряет → запуск
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
 */

import { Hono } from 'npm:hono@4';
import * as db from './db.tsx';
import { notifyCrossCabinet } from './cross-cabinet-notify.tsx';

const marketing = new Hono();

const MARKETING_PREFIX = 'marketing_campaign:';
const USER_CAMPAIGNS_PREFIX = 'user_campaigns:';

// ── GET /campaigns/:userId - кампании пользователя ──

marketing.get('/campaigns/:userId', async (c) => {
  const userId = c.req.param('userId');
  try {
    const userCampaignsKey = `${USER_CAMPAIGNS_PREFIX}${userId}`;
    const campaignIds = await db.kvGet(userCampaignsKey) || [];
    if (!Array.isArray(campaignIds) || campaignIds.length === 0) {
      return c.json({ success: true, data: [] });
    }
    const campaignKeys = campaignIds.map((id: string) => `${MARKETING_PREFIX}${id}`);
    const campaigns = await db.kvMget(campaignKeys);
    const valid = campaigns.filter(Boolean);
    // Sort by created_at desc
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
    const campaigns = await db.kvGetByPrefix(MARKETING_PREFIX);
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
    const campaigns = await db.kvGetByPrefix(MARKETING_PREFIX);
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
    const campaign = await db.kvGet(`${MARKETING_PREFIX}${campaignId}`);
    if (!campaign) return c.json({ success: false, error: 'Кампания не найдена' }, 404);
    return c.json({ success: true, data: campaign });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ── POST /campaigns - создать кампанию (артист) ──

marketing.post('/campaigns', async (c) => {
  try {
    const body = await c.req.json();
    if (!body.campaign_name || !body.user_id) {
      return c.json({ success: false, error: 'Обязательные поля: campaign_name, user_id' }, 400);
    }

    const campaignId = `campaign_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    const campaign = {
      id: campaignId,
      campaign_name: body.campaign_name,
      user_id: body.user_id,
      artist_name: body.artist_name || 'Артист',
      description: body.description || '',
      content_ids: body.content_ids || [],
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
      custom_budget: body.custom_budget || 0,
      base_price: body.base_price || 0,
      final_price: body.final_price || 0,
      discount_applied: body.discount_applied || 0,
      status: 'pending_review',
      rejection_reason: null,
      additional_materials: body.additional_materials || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await db.kvSet(`${MARKETING_PREFIX}${campaignId}`, campaign);

    // Add to user's campaign list
    const userKey = `${USER_CAMPAIGNS_PREFIX}${body.user_id}`;
    const list: string[] = (await db.kvGet(userKey) as string[]) || [];
    list.push(campaignId);
    await db.kvSet(userKey, list);

    // Cross-cabinet: notify admin about new campaign
    try {
      await notifyCrossCabinet({
        targetUserId: 'admin-1',
        targetRole: 'admin',
        sourceRole: 'artist',
        type: 'admin_action',
        title: 'Новая промо-кампания',
        message: `Артист «${campaign.artist_name}» создал кампанию «${campaign.campaign_name}» - ожидает модерации`,
        link: 'moderation',
        metadata: { campaignId, artistName: campaign.artist_name },
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
    const key = `${MARKETING_PREFIX}${campaignId}`;
    const campaign = await db.kvGet(key) as any;
    if (!campaign) return c.json({ success: false, error: 'Кампания не найдена' }, 404);

    const updated = { ...campaign, ...body, updated_at: new Date().toISOString() };
    await db.kvSet(key, updated);
    return c.json({ success: true, data: updated });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ── DELETE /campaigns/:campaignId ──

marketing.delete('/campaigns/:campaignId', async (c) => {
  const campaignId = c.req.param('campaignId');
  try {
    const key = `${MARKETING_PREFIX}${campaignId}`;
    const campaign = await db.kvGet(key) as any;
    if (!campaign) return c.json({ success: false, error: 'Кампания не найдена' }, 404);

    await db.kvDel(key);

    // Remove from user list
    const userKey = `${USER_CAMPAIGNS_PREFIX}${campaign.user_id}`;
    const list: string[] = (await db.kvGet(userKey) as string[]) || [];
    await db.kvSet(userKey, list.filter(id => id !== campaignId));

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
    const key = `${MARKETING_PREFIX}${campaignId}`;
    const campaign = await db.kvGet(key) as any;
    if (!campaign) return c.json({ success: false, error: 'Кампания не найдена' }, 404);

    campaign.status = 'approved';
    if (body.final_price) campaign.final_price = body.final_price;
    campaign.approved_at = new Date().toISOString();
    campaign.updated_at = new Date().toISOString();
    await db.kvSet(key, campaign);

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
    const key = `${MARKETING_PREFIX}${campaignId}`;
    const campaign = await db.kvGet(key) as any;
    if (!campaign) return c.json({ success: false, error: 'Кампания не найдена' }, 404);

    campaign.status = 'rejected';
    campaign.rejection_reason = body.reason || 'Не указана';
    campaign.rejected_at = new Date().toISOString();
    campaign.updated_at = new Date().toISOString();
    await db.kvSet(key, campaign);

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
    const key = `${MARKETING_PREFIX}${campaignId}`;
    const campaign = await db.kvGet(key) as any;
    if (!campaign) return c.json({ success: false, error: 'Кампания не найдена' }, 404);

    if (campaign.status !== 'approved') {
      return c.json({ success: false, error: 'Кампания должна быть одобрена перед запуском' }, 400);
    }

    campaign.status = 'active';
    campaign.launched_at = new Date().toISOString();
    campaign.updated_at = new Date().toISOString();
    await db.kvSet(key, campaign);

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

export default marketing;
