/**
 * useNotificationSSE - Hook for real-time notifications via SSE
 *
 * Uses SSEContext for a single shared SSE connection.
 * Falls back to creating its own connection if no SSEProvider is present.
 * Falls back to polling if SSE connection fails.
 *
 * Features:
 * - Type-based filtering via NotificationTypePrefs (persisted in localStorage)
 * - Custom event sync: prefs changes in Settings instantly reflect in hook
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  fetchArtistNotifications,
  markNotificationsRead,
  type PublishNotification,
} from '@/utils/api/publish-api';
import { createSSEClient } from '@/utils/sse-client';
import { playStatusSound, isSoundEnabled } from '@/utils/notification-sound';
import { useSSEContext } from '@/utils/contexts/SSEContext';

// ── Unified notification type (publish + system + collab + finance) ──

export type NotificationCategory = 'publish' | 'collab' | 'finance' | 'system';

export interface UnifiedNotification {
  id: string;
  category: NotificationCategory;
  type: string;
  title: string;
  message: string;
  comment?: string;
  read: boolean;
  createdAt: string;
  /** For publish: orderId */
  linkedId?: string;
  /** Status badge for publish notifications */
  status?: string;
}

const FALLBACK_POLL_INTERVAL = 60_000; // 60 sec fallback when SSE connected
const POLL_INTERVAL_NO_SSE = 15_000;   // 15 sec polling when SSE fails

// ── Notification type preferences ──

const LS_KEY_NOTIF_PREFS = 'promo_notification_type_prefs';
const PREFS_CHANGED_EVENT = 'promo:notif-prefs-changed';

export interface NotificationTypePrefs {
  publish_approved: boolean;
  publish_rejected: boolean;
  publish_revision: boolean;
  publish_published: boolean;
  publish_in_review: boolean;
  collab_offers: boolean;
  collab_responses: boolean;
  collab_messages: boolean;
  finance_payments: boolean;
  finance_withdrawals: boolean;
  system_updates: boolean;
  system_security: boolean;
}

const DEFAULT_PREFS: NotificationTypePrefs = {
  publish_approved: true,
  publish_rejected: true,
  publish_revision: true,
  publish_published: true,
  publish_in_review: true,
  collab_offers: true,
  collab_responses: true,
  collab_messages: true,
  finance_payments: true,
  finance_withdrawals: true,
  system_updates: true,
  system_security: true,
};

export function getNotificationTypePrefs(): NotificationTypePrefs {
  try {
    const raw = localStorage.getItem(LS_KEY_NOTIF_PREFS);
    if (raw) return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_PREFS;
}

export function setNotificationTypePrefs(prefs: Partial<NotificationTypePrefs>): NotificationTypePrefs {
  const current = getNotificationTypePrefs();
  const updated = { ...current, ...prefs };
  localStorage.setItem(LS_KEY_NOTIF_PREFS, JSON.stringify(updated));
  // Dispatch custom event so all useNotificationSSE instances pick up changes
  window.dispatchEvent(new CustomEvent(PREFS_CHANGED_EVENT, { detail: updated }));
  return updated;
}

// ── Mapping: notification.type -> preference key ──

const TYPE_TO_PREF_KEY: Record<string, keyof NotificationTypePrefs> = {
  publish_approved: 'publish_approved',
  publish_rejected: 'publish_rejected',
  publish_revision: 'publish_revision',
  publish_published: 'publish_published',
  publish_in_review: 'publish_in_review',
  publish_pending_payment: 'publish_approved',
  publish_paid: 'publish_approved',
  collab_offer: 'collab_offers',
  collab_response: 'collab_responses',
  collab_message: 'collab_messages',
  finance_payment: 'finance_payments',
  finance_withdrawal: 'finance_withdrawals',
  system_update: 'system_updates',
  system_security: 'system_security',
};

function isNotifAllowedByPrefs(notif: UnifiedNotification, prefs: NotificationTypePrefs): boolean {
  const prefKey = TYPE_TO_PREF_KEY[notif.type];
  if (!prefKey) return true; // Unknown types are always shown
  return prefs[prefKey];
}

// ── System / Collab / Finance demo notifications ──

function generateDemoNotifications(): UnifiedNotification[] {
  const now = Date.now();
  const h = 3600_000;
  const d = 86400_000;

  return [
    {
      id: 'sys-welcome',
      category: 'system',
      type: 'system_update',
      title: 'Добро пожаловать на ПРОМО.МУЗЫКА',
      message: 'Ваш аккаунт успешно создан. Заполните профиль, чтобы начать продвижение.',
      read: true,
      createdAt: new Date(now - 5 * d).toISOString(),
    },
    {
      id: 'sys-update-feb',
      category: 'system',
      type: 'system_update',
      title: 'Обновление платформы v2.8',
      message: 'Добавлены: SSE real-time уведомления, настройки по типу, улучшен интерфейс аналитики.',
      read: false,
      createdAt: new Date(now - 2 * h).toISOString(),
    },
    {
      id: 'sys-security',
      category: 'system',
      type: 'system_security',
      title: 'Вход из нового устройства',
      message: 'Зафиксирован вход с устройства Chrome/macOS. Если это не вы - смените пароль.',
      read: true,
      createdAt: new Date(now - 1 * d).toISOString(),
    },
    {
      id: 'collab-offer-1',
      category: 'collab',
      type: 'collab_offer',
      title: 'Новое предложение коллаборации',
      message: 'Продюсер Максам предлагает совместную работу над треком "Night City".',
      read: false,
      createdAt: new Date(now - 4 * h).toISOString(),
      linkedId: 'collab-maxam-1',
    },
    {
      id: 'collab-response-1',
      category: 'collab',
      type: 'collab_response',
      title: 'Ответ на коллаборацию',
      message: 'DJ Phoenix принял ваше предложение ремикса.',
      read: true,
      createdAt: new Date(now - 2 * d).toISOString(),
      linkedId: 'collab-phoenix-1',
    },
    {
      id: 'fin-payment-1',
      category: 'finance',
      type: 'finance_payment',
      title: 'Поступление средств',
      message: 'Зачислено 3 500 руб. за публикацию видеоклипа "Рассвет".',
      read: true,
      createdAt: new Date(now - 3 * d).toISOString(),
    },
    {
      id: 'fin-coins-1',
      category: 'finance',
      type: 'finance_payment',
      title: 'Начислены Promo-коины',
      message: '+250 коинов за активность на платформе в январе.',
      read: false,
      createdAt: new Date(now - 6 * h).toISOString(),
    },
    {
      id: 'collab-msg-1',
      category: 'collab',
      type: 'collab_message',
      title: 'Новое сообщение в коллаборации',
      message: 'Максам: "Отправил обновленную версию аранжировки. Послушай и скажи, что думаешь."',
      read: false,
      createdAt: new Date(now - 1 * h).toISOString(),
      linkedId: 'collab-maxam-1',
    },
  ];
}

function publishToUnified(n: PublishNotification): UnifiedNotification {
  return {
    id: n.id,
    category: 'publish',
    type: `publish_${n.newStatus}`,
    title: n.orderTitle || 'Публикация',
    message: n.message,
    comment: n.comment,
    read: n.read,
    createdAt: n.createdAt,
    linkedId: n.orderId,
    status: n.newStatus,
  };
}

// ── Hook ──

interface UseNotificationSSEOptions {
  userId: string;
  enabled?: boolean;
}

interface UseNotificationSSEResult {
  /** Filtered notifications (respects typePrefs) */
  notifications: UnifiedNotification[];
  /** All notifications (ignores typePrefs) */
  allNotifications: UnifiedNotification[];
  unreadCount: number;
  loading: boolean;
  sseConnected: boolean;
  refresh: () => Promise<void>;
  markAllRead: () => Promise<void>;
  /** Filter notifications by category (uses filtered list) */
  byCategory: (cat: NotificationCategory | 'all') => UnifiedNotification[];
  /** Current type preferences */
  typePrefs: NotificationTypePrefs;
}

export function useNotificationSSE({ userId, enabled = true }: UseNotificationSSEOptions): UseNotificationSSEResult {
  const [publishNotifs, setPublishNotifs] = useState<PublishNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [sseConnectedLocal, setSseConnectedLocal] = useState(false);
  const [typePrefs, setTypePrefsState] = useState<NotificationTypePrefs>(getNotificationTypePrefs);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevIdsRef = useRef<Set<string>>(new Set());

  // Try to use shared SSE context (provided by SSEProvider in ArtistApp)
  const sseCtx = useSSEContext();
  const hasContext = sseCtx !== null;

  // Fallback: own SSE client when no context is available
  const ownSseRef = useRef<ReturnType<typeof createSSEClient> | null>(null);

  // SSE connected state: prefer context, fallback to local
  const sseConnected = hasContext ? sseCtx.sseConnected : sseConnectedLocal;

  // Demo notifications (system, collab, finance) - stable reference
  const demoNotifs = useMemo(() => generateDemoNotifications(), []);

  // Listen for typePrefs changes from Settings (custom event)
  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<NotificationTypePrefs>;
      if (ce.detail) {
        setTypePrefsState(ce.detail);
      }
    };
    window.addEventListener(PREFS_CHANGED_EVENT, handler);
    return () => window.removeEventListener(PREFS_CHANGED_EVENT, handler);
  }, []);

  // Load publish notifications from API
  const loadPublish = useCallback(async (silent = false) => {
    if (!userId) return;
    if (!silent) setLoading(true);
    try {
      const { notifications: data } = await fetchArtistNotifications(userId);
      setPublishNotifs(data);

      // Detect new notifications for sound
      if (prevIdsRef.current.size > 0) {
        const newItems = data.filter(n => !prevIdsRef.current.has(n.id) && !n.read);
        if (newItems.length > 0 && isSoundEnabled()) {
          const currentPrefs = getNotificationTypePrefs();
          const unified = publishToUnified(newItems[0]);
          if (isNotifAllowedByPrefs(unified, currentPrefs)) {
            playStatusSound(newItems[0].newStatus);
          }
        }
      }
      prevIdsRef.current = new Set(data.map(n => n.id));
    } catch (err) {
      console.error('[useNotificationSSE] Failed to load:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [userId]);

  // SSE event handlers - subscribe to realtime events
  useEffect(() => {
    if (!enabled || !userId) return;

    const handleRealtime = () => {
      loadPublish(true);
    };

    const events = ['notification', 'status_change', 'collab_offer', 'collab_response', 'collab_message', 'chat_message', 'subscription_updated', 'subscription_payment', 'payment_received'];

    if (hasContext) {
      // Use shared SSE context
      for (const ev of events) {
        sseCtx.on(ev, handleRealtime);
      }

      return () => {
        for (const ev of events) {
          sseCtx.off(ev, handleRealtime);
        }
      };
    } else {
      // Fallback: create own SSE client
      const sse = createSSEClient(userId);
      ownSseRef.current = sse;

      sse.on('connected', () => {
        setSseConnectedLocal(true);
        // When SSE connects, reduce polling to fallback rate
        if (pollTimerRef.current) {
          clearInterval(pollTimerRef.current);
          pollTimerRef.current = setInterval(() => loadPublish(true), FALLBACK_POLL_INTERVAL);
        }
      });

      sse.on('disconnected', () => {
        setSseConnectedLocal(false);
        // Speed up polling while disconnected
        if (pollTimerRef.current) {
          clearInterval(pollTimerRef.current);
          pollTimerRef.current = setInterval(() => loadPublish(true), POLL_INTERVAL_NO_SSE);
        }
      });

      for (const ev of events) {
        sse.on(ev, handleRealtime);
      }

      sse.connect();

      return () => {
        sse.disconnect();
        ownSseRef.current = null;
        setSseConnectedLocal(false);
      };
    }
  }, [userId, enabled, loadPublish, hasContext, sseCtx]);

  // Polling (fallback / supplementary)
  useEffect(() => {
    if (!enabled || !userId) return;

    // Initial load
    loadPublish();

    // Start polling - rate depends on SSE connection
    const interval = sseConnected ? FALLBACK_POLL_INTERVAL : POLL_INTERVAL_NO_SSE;
    pollTimerRef.current = setInterval(() => loadPublish(true), interval);

    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, [userId, enabled, sseConnected, loadPublish]);

  // Merge publish + demo into unified list, sorted by date (ALL - unfiltered)
  const allNotifications = useMemo(() => {
    const publishUnified = publishNotifs.map(publishToUnified);
    const all = [...publishUnified, ...demoNotifs];
    all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return all;
  }, [publishNotifs, demoNotifs]);

  // Filtered by typePrefs
  const notifications = useMemo(() => {
    return allNotifications.filter(n => isNotifAllowedByPrefs(n, typePrefs));
  }, [allNotifications, typePrefs]);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const refresh = useCallback(async () => {
    await loadPublish();
  }, [loadPublish]);

  const markAllRead = useCallback(async () => {
    try {
      await markNotificationsRead(userId);
      setPublishNotifs(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('[useNotificationSSE] Failed to mark read:', err);
    }
  }, [userId]);

  const byCategory = useCallback((cat: NotificationCategory | 'all') => {
    if (cat === 'all') return notifications;
    return notifications.filter(n => n.category === cat);
  }, [notifications]);

  return {
    notifications,
    allNotifications,
    unreadCount,
    loading,
    sseConnected,
    refresh,
    markAllRead,
    byCategory,
    typePrefs,
  };
}