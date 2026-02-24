/**
 * SSE PUSH HANDLER - Обработчик SSE-событий для тостов и push-уведомлений
 *
 * Универсальный компонент, подписывается на SSE-события внутри SSEProvider.
 * Адаптируется под роль кабинета (artist / producer / dj / admin / radio / venue).
 * Рендерит null - чистый side-effect компонент.
 *
 * ВАЖНО: все уведомления показываются через sonner toast (всегда видны),
 * дополнительно пытается отправить browser push (если разрешение дано).
 *
 * Также экспортирует хук useSSENotificationCount для отображения бейджа
 * непрочитанных SSE-событий на иконке колокольчика.
 */

import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useSSEContext } from '@/utils/contexts/SSEContext';
import { playStatusSound } from '@/utils/notification-sound';
import { sendPushNotification } from '@/utils/push-notifications';

export type CabinetRole = 'artist' | 'producer' | 'dj' | 'admin' | 'radio' | 'venue';

interface SSEPushHandlerProps {
  /** Роль кабинета для адаптации уведомлений */
  role: CabinetRole;
  /** Колбэк при получении любого SSE-события (для счётчика) */
  onEvent?: () => void;
}

// ── Иконки по типу события ──
const TYPE_ICONS: Record<string, string> = {
  system_alert: '🔔',
  publish_status: '📢',
  payment_received: '💰',
  booking_update: '📅',
  collab_offer: '🤝',
  collab_response: '🤝',
  collab_message: '💬',
  order_update: '📦',
  service_order_new: '🛒',
  service_order_update: '📦',
  beat_purchased: '🎵',
  beat_review_new: '⭐',
  new_direct_message: '💬',
  track_test_available: '🎧',
  moderation_update: '🛡️',
  artist_request: '📨',
  chat_message: '💬',
  notification: '🔔',
  subscription_updated: '👑',
  subscription_payment: '💳',
};

/**
 * Показать sonner toast для SSE-уведомления.
 * Это основной способ визуализации - работает без разрешений.
 */
function showNotificationToast(title: string, message: string, icon: string) {
  toast(title, {
    description: message,
    icon,
    duration: 6000,
  });
}

export function SSEPushHandler({ role, onEvent }: SSEPushHandlerProps) {
  const sseCtx = useSSEContext();

  useEffect(() => {
    if (!sseCtx) return;

    const fire = () => onEvent?.();

    // ── Универсальный обработчик для cross-cabinet уведомлений ──
    // Данные от cross-cabinet-notify: { notificationId, type, title, message, sourceRole, ... }
    function makeCrossCabinetHandler(eventType: string) {
      return (data: any) => {
        const icon = TYPE_ICONS[eventType] || TYPE_ICONS[data?.type] || '🔔';
        const title = data?.title || 'ПРОМО.МУЗЫКА';
        const message = data?.message || data?.text || data?.body || '';

        // 1. Sonner toast (всегда видно)
        showNotificationToast(title, message, icon);

        // 2. Звук
        try { playStatusSound(data?.status || data?.newStatus || 'in_review'); } catch {}

        // 3. Browser push (если разрешено - бонус)
        try {
          sendPushNotification(`ПРОМО.МУЗЫКА - ${title}`, {
            body: message,
            tag: `${eventType}-${data?.notificationId || Date.now()}`,
          });
        } catch {}

        fire();
      };
    }

    // ── Специальные обработчики для событий с уникальной структурой данных ──

    const handleChatMessage = (data: any) => {
      const sender = data?.senderName || 'Собеседник';
      const text = data?.text || 'Новое сообщение';
      showNotificationToast(`Сообщение от ${sender}`, text, '💬');
      try { playStatusSound('in_review'); } catch {}
      try {
        sendPushNotification(`ПРОМО.МУЗЫКА - ${sender}`, {
          body: text,
          tag: `chat-${data?.orderId || Date.now()}`,
        });
      } catch {}
      fire();
    };

    const handleCollabOffer = (data: any) => {
      const senderLabels: Record<CabinetRole, string> = {
        artist: data?.producerName || 'Продюсер',
        producer: data?.artistName || 'Артист',
        dj: data?.senderName || 'Пользователь',
        admin: data?.senderName || 'Пользователь',
        radio: data?.artistName || 'Артист',
        venue: data?.artistName || 'Артист',
      };
      const sender = senderLabels[role];
      const msg = data?.message || 'Новое предложение коллаборации';
      showNotificationToast(`Коллаборация - ${sender}`, msg, '🤝');
      try { playStatusSound('in_review'); } catch {}
      try {
        sendPushNotification(`ПРОМО.МУЗЫКА - ${sender}`, {
          body: msg,
          tag: `collab-${Date.now()}`,
        });
      } catch {}
      fire();
    };

    const handleDirectMessage = (data: any) => {
      const roleLabels: Record<string, string> = {
        artist: 'Артист', producer: 'Продюсер', dj: 'DJ',
        admin: 'ПРОМО.МУЗЫКА', radio: 'Радио', venue: 'Заведение',
      };
      const sender = data?.senderName || roleLabels[data?.senderRole] || 'Пользователь';
      const text = data?.text || 'Новое сообщение';
      const sourceLabel = data?.source === 'collab' ? ' (коллаборация)' : data?.source === 'support' ? ' (поддержка)' : '';
      showNotificationToast(`Сообщение${sourceLabel}`, `${sender}: ${text}`, '💬');
      try { playStatusSound('in_review'); } catch {}
      try {
        sendPushNotification(`ПРОМО.МУЗЫКА - ${sender}`, {
          body: text,
          tag: `dm-${data?.conversationId || Date.now()}`,
        });
      } catch {}
      fire();
    };

    // ── Создаём обработчики со стабильными ссылками ──
    const genericEvents = [
      'system_alert', 'publish_status', 'payment_received', 'notification',
      'order_update', 'booking_update', 'moderation_update', 'artist_request',
      'track_test_available', 'beat_purchased', 'beat_review_new',
      'service_order_new', 'service_order_update',
      'subscription_updated', 'subscription_payment',
    ] as const;

    const genericHandlerMap = new Map<string, (data: any) => void>();
    for (const evt of genericEvents) {
      const handler = makeCrossCabinetHandler(evt);
      genericHandlerMap.set(evt, handler);
      sseCtx.on(evt, handler);
    }

    // Специальные (свой формат данных)
    sseCtx.on('chat_message', handleChatMessage);
    sseCtx.on('collab_offer', handleCollabOffer);
    sseCtx.on('collab_response', handleCollabOffer);
    sseCtx.on('new_direct_message', handleDirectMessage);

    return () => {
      for (const [evt, handler] of genericHandlerMap) {
        sseCtx.off(evt, handler);
      }
      sseCtx.off('chat_message', handleChatMessage);
      sseCtx.off('collab_offer', handleCollabOffer);
      sseCtx.off('collab_response', handleCollabOffer);
      sseCtx.off('new_direct_message', handleDirectMessage);
    };
  }, [sseCtx, role, onEvent]);

  return null;
}

// ─── Hook: SSE Notification Count ────────────────────────────────

/**
 * Хук для подсчёта SSE-событий с момента монтирования.
 * Используется в bell-иконках для отображения бейджа непрочитанных.
 */
export function useSSENotificationCount() {
  const sseCtx = useSSEContext();
  const [count, setCount] = useState(0);

  const increment = useCallback(() => {
    setCount((c) => c + 1);
  }, []);

  const reset = useCallback(() => {
    setCount(0);
  }, []);

  useEffect(() => {
    if (!sseCtx) return;

    const events = [
      'notification',
      'collab_offer',
      'collab_response',
      'chat_message',
      'order_update',
      'booking_update',
      'moderation_update',
      'artist_request',
      'new_direct_message',
      'track_test_available',
      'beat_purchased',
      'beat_review_new',
      'service_order_new',
      'service_order_update',
      'system_alert',
      'publish_status',
      'payment_received',
      'subscription_updated',
      'subscription_payment',
    ];

    for (const evt of events) {
      sseCtx.on(evt, increment);
    }

    return () => {
      for (const evt of events) {
        sseCtx.off(evt, increment);
      }
    };
  }, [sseCtx, increment]);

  return { count, reset };
}