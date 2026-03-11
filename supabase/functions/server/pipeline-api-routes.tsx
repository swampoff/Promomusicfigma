/**
 * PIPELINE API ROUTES
 *
 * Общие эндпоинты для:
 * 1. Аудит-лог — GET /pipeline/audit
 * 2. SLA мониторинг — GET /pipeline/sla
 * 3. Аналитика — GET /pipeline/analytics
 * 4. Состояние пайплайна — GET /pipeline/transitions
 */

import { Hono } from 'npm:hono@4';
import {
  getAuditLog,
  getAuditForItem,
  computeAnalytics,
  calculateSLA,
  getNextStatuses,
  CONTENT_TRANSITIONS,
  TRACK_TEST_TRANSITIONS,
  PITCHING_TRANSITIONS,
} from './pipeline-engine.tsx';
import type { PipelineType } from './pipeline-engine.tsx';

const pipelineApi = new Hono();

// ============================================
// AUDIT LOG
// ============================================

/**
 * GET /pipeline/audit
 * Получить аудит-лог с фильтрами
 *
 * Query params:
 *   pipeline_type — content | track_test | pitching
 *   content_type — track | video | track_test | pitching
 *   actor_id — ID автора действия
 *   action — конкретное действие
 *   from / to — ISO дата (диапазон)
 *   limit — кол-во записей (default 50)
 *   offset — смещение
 */
pipelineApi.get('/audit', (c) => {
  const filters = {
    pipeline_type: c.req.query('pipeline_type') as PipelineType | undefined,
    content_type: c.req.query('content_type'),
    actor_id: c.req.query('actor_id'),
    action: c.req.query('action'),
    from: c.req.query('from'),
    to: c.req.query('to'),
    limit: parseInt(c.req.query('limit') || '50'),
    offset: parseInt(c.req.query('offset') || '0'),
  };

  const result = getAuditLog(filters);

  return c.json({
    success: true,
    ...result,
    filters,
  });
});

/**
 * GET /pipeline/audit/:itemId
 * Получить аудит-лог для конкретного элемента (трек, клип, заявка)
 */
pipelineApi.get('/audit/:itemId', (c) => {
  const itemId = c.req.param('itemId');
  const entries = getAuditForItem(itemId);

  return c.json({
    success: true,
    item_id: itemId,
    entries,
    total: entries.length,
  });
});

// ============================================
// ANALYTICS
// ============================================

/**
 * GET /pipeline/analytics
 * Аналитика пайплайна для всех типов контента
 */
pipelineApi.get('/analytics', (c) => {
  const contentType = c.req.query('content_type');

  if (contentType) {
    const analytics = computeAnalytics(contentType);
    return c.json({ success: true, content_type: contentType, ...analytics });
  }

  // Все типы контента
  const all = {
    track: computeAnalytics('track'),
    video: computeAnalytics('video'),
    track_test: computeAnalytics('track_test'),
    pitching: computeAnalytics('pitching'),
  };

  const summary = {
    total_actions: Object.values(all).reduce((s, a) => s + a.total_actions, 0),
    actions_today: Object.values(all).reduce((s, a) => s + a.actions_today, 0),
    actions_this_week: Object.values(all).reduce((s, a) => s + a.actions_this_week, 0),
    revenue_total: Object.values(all).reduce((s, a) => s + a.revenue_from_actions, 0),
  };

  return c.json({ success: true, analytics: all, summary });
});

// ============================================
// STATE MACHINE — TRANSITIONS MAP
// ============================================

/**
 * GET /pipeline/transitions
 * Вернуть карту допустимых переходов для всех пайплайнов
 */
pipelineApi.get('/transitions', (c) => {
  return c.json({
    success: true,
    transitions: {
      content: CONTENT_TRANSITIONS,
      track_test: TRACK_TEST_TRANSITIONS,
      pitching: PITCHING_TRANSITIONS,
    },
  });
});

/**
 * GET /pipeline/transitions/:pipelineType/:currentStatus
 * Следующие допустимые статусы
 */
pipelineApi.get('/transitions/:pipelineType/:currentStatus', (c) => {
  const pipelineType = c.req.param('pipelineType') as PipelineType;
  const currentStatus = c.req.param('currentStatus');

  const nextStatuses = getNextStatuses(pipelineType, currentStatus);

  return c.json({
    success: true,
    pipeline_type: pipelineType,
    current_status: currentStatus,
    next_statuses: nextStatuses,
    is_final: nextStatuses.length === 0,
  });
});

// ============================================
// SLA MONITORING
// ============================================

/**
 * GET /pipeline/sla
 * Получить информацию о SLA (дедлайнах) для элементов
 *
 * Body: { items: [{ pipeline_type, item_id, current_status, status_entered_at }] }
 */
pipelineApi.post('/sla/check', async (c) => {
  try {
    const body = await c.req.json();
    const { items } = body;

    if (!items || !Array.isArray(items)) {
      return c.json({ success: false, error: 'items array required' }, 400);
    }

    const results = items.map((item: any) => {
      return calculateSLA(
        item.pipeline_type || 'content',
        item.item_id,
        item.current_status,
        item.status_entered_at
      );
    }).filter(Boolean);

    const overdue = results.filter((r: any) => r.is_overdue);
    const warning = results.filter((r: any) => r.urgency === 'warning');

    return c.json({
      success: true,
      sla: results,
      summary: {
        total_checked: results.length,
        overdue: overdue.length,
        warning: warning.length,
        ok: results.length - overdue.length - warning.length,
      },
    });
  } catch (error) {
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
});

export default pipelineApi;
