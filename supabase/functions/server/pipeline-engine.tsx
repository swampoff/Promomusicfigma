/**
 * PIPELINE ENGINE — Единый движок пайплайна для всех типов контента
 *
 * 1. State Machine — допустимые переходы статусов
 * 2. Audit Log — история всех действий пайплайна
 * 3. SLA Tracking — дедлайны и просрочки
 * 4. Unified helpers — общие функции для всех пайплайнов
 */

// ============================================
// 1. STATE MACHINE — ДОПУСТИМЫЕ ПЕРЕХОДЫ
// ============================================

/** Допустимые переходы для пайплайна треков/клипов */
const CONTENT_TRANSITIONS: Record<string, string[]> = {
  awaiting_moderation: ['moderated', 'rejected'],
  moderated:           ['in_novelty', 'in_newsletter', 'exclusive_pitched'],
  rejected:            ['awaiting_moderation'], // повторная подача
  in_novelty:          ['moderated', 'in_newsletter', 'exclusive_pitched', 'completed'],
  in_newsletter:       ['moderated', 'exclusive_pitched', 'completed'],
  exclusive_pitched:   ['completed'],
  completed:           [],
};

/** Допустимые переходы для пайплайна тест-трека */
const TRACK_TEST_TRANSITIONS: Record<string, string[]> = {
  pending_payment:          ['payment_succeeded', 'cancelled'],
  payment_succeeded:        ['pending_moderation'],
  pending_moderation:       ['moderation_rejected', 'pending_expert_assignment'],
  moderation_rejected:      [],
  pending_expert_assignment:['experts_assigned'],
  experts_assigned:         ['in_review', 'review_in_progress'],
  in_review:                ['review_in_progress', 'analysis_generated'],
  review_in_progress:       ['analysis_generated'],
  analysis_generated:       ['pending_admin_approval', 'pending_admin_review'],
  pending_admin_approval:   ['completed', 'rejected'],
  pending_admin_review:     ['completed', 'rejected'],
  completed:                [],
  rejected:                 [],
  cancelled:                [],
};

/** Допустимые переходы для питчинга */
const PITCHING_TRANSITIONS: Record<string, string[]> = {
  draft:          ['pending_payment', 'pending_review'],
  pending_payment:['pending_review', 'cancelled'],
  pending_review: ['in_progress', 'rejected'],
  in_progress:    ['completed', 'cancelled'],
  completed:      [],
  rejected:       ['pending_review'], // повторная подача
  cancelled:      [],
};

/** Допустимые переходы для маркетинговых кампаний */
const MARKETING_TRANSITIONS: Record<string, string[]> = {
  pending_review: ['approved', 'rejected'],
  approved:       ['active', 'cancelled'],
  rejected:       ['pending_review'],  // повторная подача после доработки
  active:         ['paused', 'completed'],
  paused:         ['active', 'cancelled'],
  completed:      [],
  cancelled:      [],
};

type PipelineType = 'content' | 'track_test' | 'pitching' | 'marketing';

const TRANSITION_MAPS: Record<PipelineType, Record<string, string[]>> = {
  content: CONTENT_TRANSITIONS,
  track_test: TRACK_TEST_TRANSITIONS,
  pitching: PITCHING_TRANSITIONS,
  marketing: MARKETING_TRANSITIONS,
};

/**
 * Проверяет, допустим ли переход из текущего статуса в новый
 */
export function canTransition(pipelineType: PipelineType, currentStatus: string, newStatus: string): boolean {
  const map = TRANSITION_MAPS[pipelineType];
  const allowed = map[currentStatus];
  if (!allowed) return false;
  return allowed.includes(newStatus);
}

/**
 * Валидирует переход и возвращает ошибку, если недопустим
 */
export function validateTransition(
  pipelineType: PipelineType,
  currentStatus: string,
  newStatus: string
): { valid: boolean; error?: string } {
  if (!TRANSITION_MAPS[pipelineType][currentStatus]) {
    return { valid: false, error: `Неизвестный статус: "${currentStatus}"` };
  }
  if (!canTransition(pipelineType, currentStatus, newStatus)) {
    const allowed = TRANSITION_MAPS[pipelineType][currentStatus];
    return {
      valid: false,
      error: `Переход "${currentStatus}" → "${newStatus}" запрещён. Допустимые: ${allowed.join(', ') || 'нет (финальный статус)'}`,
    };
  }
  return { valid: true };
}

/**
 * Возвращает все допустимые следующие статусы
 */
export function getNextStatuses(pipelineType: PipelineType, currentStatus: string): string[] {
  return TRANSITION_MAPS[pipelineType][currentStatus] || [];
}

// ============================================
// 2. AUDIT LOG — ИСТОРИЯ ДЕЙСТВИЙ
// ============================================

export interface AuditEntry {
  id: string;
  timestamp: string;
  pipeline_type: PipelineType;
  content_type: 'track' | 'video' | 'track_test' | 'pitching';
  item_id: string;
  item_title: string;
  action: string;
  from_status: string | null;
  to_status: string;
  actor_id: string;           // кто совершил действие
  actor_role: 'admin' | 'artist' | 'expert' | 'system';
  details?: string;           // дополнительные детали
  price?: number;             // сумма операции (если есть)
  metadata?: Record<string, any>;
}

// In-memory audit log (хранится в памяти воркера, для persistence нужна БД)
const auditLog: AuditEntry[] = [];

/**
 * Записывает действие в аудит-лог
 */
export function logAudit(entry: Omit<AuditEntry, 'id' | 'timestamp'>): AuditEntry {
  const full: AuditEntry = {
    ...entry,
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    timestamp: new Date().toISOString(),
  };
  auditLog.push(full);

  // Ограничиваем размер in-memory лога (последние 10 000 записей)
  if (auditLog.length > 10000) {
    auditLog.splice(0, auditLog.length - 10000);
  }

  return full;
}

/**
 * Получить аудит-лог для конкретного элемента
 */
export function getAuditForItem(itemId: string): AuditEntry[] {
  return auditLog.filter(e => e.item_id === itemId);
}

/**
 * Получить аудит-лог с фильтрами
 */
export function getAuditLog(filters?: {
  pipeline_type?: PipelineType;
  content_type?: string;
  actor_id?: string;
  action?: string;
  from?: string;  // ISO date
  to?: string;    // ISO date
  limit?: number;
  offset?: number;
}): { entries: AuditEntry[]; total: number } {
  let result = [...auditLog];

  if (filters?.pipeline_type) {
    result = result.filter(e => e.pipeline_type === filters.pipeline_type);
  }
  if (filters?.content_type) {
    result = result.filter(e => e.content_type === filters.content_type);
  }
  if (filters?.actor_id) {
    result = result.filter(e => e.actor_id === filters.actor_id);
  }
  if (filters?.action) {
    result = result.filter(e => e.action === filters.action);
  }
  if (filters?.from) {
    result = result.filter(e => e.timestamp >= filters.from!);
  }
  if (filters?.to) {
    result = result.filter(e => e.timestamp <= filters.to!);
  }

  // Последние записи первыми
  result.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  const total = result.length;
  const offset = filters?.offset || 0;
  const limit = filters?.limit || 50;

  return {
    entries: result.slice(offset, offset + limit),
    total,
  };
}

// ============================================
// 3. SLA TRACKING — ДЕДЛАЙНЫ И ПРОСРОЧКИ
// ============================================

/** SLA по умолчанию (в часах) для каждого статуса */
const DEFAULT_SLA: Record<string, Record<string, number>> = {
  content: {
    awaiting_moderation: 24,   // 24 часа на модерацию
    moderated: 72,             // 3 дня на принятие решения
    in_novelty: 336,           // 14 дней (экспозиция)
    in_newsletter: 168,        // 7 дней (неделя)
    exclusive_pitched: 168,    // 7 дней на ответ
  },
  track_test: {
    pending_payment: 48,       // 2 дня на оплату
    payment_succeeded: 12,     // 12 часов на начало модерации
    pending_moderation: 24,    // 24 часа на модерацию
    pending_expert_assignment: 24, // 24 часа на назначение экспертов
    experts_assigned: 72,      // 3 дня на рецензии
    review_in_progress: 72,    // 3 дня
    analysis_generated: 24,    // 24 часа на одобрение
    pending_admin_approval: 24,
  },
  pitching: {
    pending_review: 48,        // 2 дня на модерацию
    in_progress: 168,          // 7 дней на выполнение
  },
  marketing: {
    pending_review: 48,        // 2 дня на модерацию кампании
    approved: 72,              // 3 дня на запуск после одобрения
    active: 720,               // 30 дней (макс. длительность кампании)
    paused: 168,               // 7 дней пауза
  },
};

export interface SLAStatus {
  item_id: string;
  current_status: string;
  status_entered_at: string;
  sla_hours: number;
  sla_deadline: string;
  is_overdue: boolean;
  hours_remaining: number;
  urgency: 'ok' | 'warning' | 'overdue';
}

/**
 * Рассчитать SLA для элемента
 */
export function calculateSLA(
  pipelineType: PipelineType,
  itemId: string,
  currentStatus: string,
  statusEnteredAt: string,
): SLAStatus | null {
  const slaMap = DEFAULT_SLA[pipelineType];
  if (!slaMap || !slaMap[currentStatus]) return null;

  const slaHours = slaMap[currentStatus];
  const entered = new Date(statusEnteredAt).getTime();
  const deadline = entered + slaHours * 60 * 60 * 1000;
  const now = Date.now();
  const hoursRemaining = Math.round((deadline - now) / (60 * 60 * 1000) * 10) / 10;
  const isOverdue = now > deadline;

  let urgency: 'ok' | 'warning' | 'overdue' = 'ok';
  if (isOverdue) urgency = 'overdue';
  else if (hoursRemaining < slaHours * 0.25) urgency = 'warning'; // <25% осталось

  return {
    item_id: itemId,
    current_status: currentStatus,
    status_entered_at: statusEnteredAt,
    sla_hours: slaHours,
    sla_deadline: new Date(deadline).toISOString(),
    is_overdue: isOverdue,
    hours_remaining: hoursRemaining,
    urgency,
  };
}

// ============================================
// 4. ANALYTICS HELPERS
// ============================================

export interface PipelineAnalytics {
  total_items: number;
  by_status: Record<string, number>;
  avg_time_in_status: Record<string, number>; // средние часы
  overdue_count: number;
  completed_today: number;
  completed_this_week: number;
  revenue_total: number;
}

/**
 * Вычислить аналитику пайплайна на основе аудит-лога
 */
export function computeAnalytics(contentType: string): {
  total_actions: number;
  actions_today: number;
  actions_this_week: number;
  top_actions: { action: string; count: number }[];
  revenue_from_actions: number;
} {
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - 7);

  const entries = auditLog.filter(e => e.content_type === contentType);
  const todayEntries = entries.filter(e => e.timestamp >= todayStart.toISOString());
  const weekEntries = entries.filter(e => e.timestamp >= weekStart.toISOString());

  // Top actions
  const actionCounts: Record<string, number> = {};
  for (const e of entries) {
    actionCounts[e.action] = (actionCounts[e.action] || 0) + 1;
  }
  const topActions = Object.entries(actionCounts)
    .map(([action, count]) => ({ action, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const revenue = entries.reduce((sum, e) => sum + (e.price || 0), 0);

  return {
    total_actions: entries.length,
    actions_today: todayEntries.length,
    actions_this_week: weekEntries.length,
    top_actions: topActions,
    revenue_from_actions: revenue,
  };
}

// ============================================
// EXPORTS
// ============================================

export { CONTENT_TRANSITIONS, TRACK_TEST_TRANSITIONS, PITCHING_TRANSITIONS, MARKETING_TRANSITIONS };
export type { PipelineType };
