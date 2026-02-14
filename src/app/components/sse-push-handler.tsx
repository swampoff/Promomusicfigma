/**
 * SSE PUSH HANDLER - Обработчик SSE-событий для звуков и push-уведомлений
 * 
 * Универсальный компонент, подписывается на SSE-события внутри SSEProvider.
 * Адаптируется под роль кабинета (artist / producer / dj / admin / radio / venue).
 * Рендерит null - чистый side-effect компонент.
 * 
 * Также экспортирует хук useSSENotificationCount для отображения бейджа
 * непрочитанных SSE-событий на иконке колокольчика.
 */

import { useEffect, useState, useCallback } from 'react';
import { useSSEContext } from '@/utils/contexts/SSEContext';
import { playStatusSound } from '@/utils/notification-sound';
import {
  sendStatusPush,
  sendCollabPush,
  sendChatPush,
  sendPushNotification,
} from '@/utils/push-notifications';

export type CabinetRole = 'artist' | 'producer' | 'dj' | 'admin' | 'radio' | 'venue';

interface SSEPushHandlerProps {
  /** Роль кабинета для адаптации уведомлений */
  role: CabinetRole;
  /** Колбэк при получении любого SSE-события (для счётчика) */
  onEvent?: () => void;
}

export function SSEPushHandler({ role, onEvent }: SSEPushHandlerProps) {
  const sseCtx = useSSEContext();

  useEffect(() => {
    if (!sseCtx) return;

    const fire = () => onEvent?.();

    // ── Общие обработчики (все роли) ──

    const handleChatMessage = (data: any) => {
      playStatusSound('in_review');
      sendChatPush(
        data.senderName || 'Собеседник',
        data.text || 'Новое сообщение',
        data.orderId,
      );
      fire();
    };

    const handleNotification = (data: any) => {
      playStatusSound(data.newStatus || 'in_review');
      sendStatusPush(
        data.newStatus || 'notification',
        data.orderTitle || '',
        data.comment,
      );
      fire();
    };

    // ── Роль-специфичные обработчики ──

    const handleCollabOffer = (data: any) => {
      playStatusSound('in_review');
      const senderLabels: Record<CabinetRole, string> = {
        artist: data.producerName || 'Продюсер',
        producer: data.artistName || 'Артист',
        dj: data.senderName || 'Пользователь',
        admin: data.senderName || 'Пользователь',
        radio: data.artistName || 'Артист',
        venue: data.artistName || 'Артист',
      };
      sendCollabPush(
        senderLabels[role],
        data.message || 'Новое предложение коллаборации',
      );
      fire();
    };

    const handleOrderUpdate = (data: any) => {
      playStatusSound(data.status || 'in_review');
      const titles: Record<CabinetRole, string> = {
        producer: 'Promo.music - Обновление заказа',
        dj: 'Promo.music - Обновление букинга',
        artist: 'Promo.music - Обновление публикации',
        admin: 'Promo.music - Обновление контента',
        radio: 'Promo.music - Обновление заявки',
        venue: 'Promo.music - Обновление бронирования',
      };
      sendPushNotification(titles[role], {
        body: data.title || data.orderTitle || 'Статус изменён',
        tag: `order-${data.orderId || Date.now()}`,
      });
      fire();
    };

    const handleBookingUpdate = (data: any) => {
      playStatusSound(data.status === 'confirmed' ? 'approved' : 'in_review');
      sendPushNotification('Promo.music - Букинг', {
        body: data.venueName
          ? `${data.venueName} - ${data.message || 'обновление'}`
          : data.message || 'Обновление букинга',
        tag: `booking-${data.bookingId || Date.now()}`,
      });
      fire();
    };

    const handleModerationUpdate = (data: any) => {
      playStatusSound(data.status === 'approved' ? 'approved' : 'in_review');
      sendPushNotification('Promo.music - Модерация', {
        body: data.message || `Новый контент для модерации`,
        tag: `moderation-${data.contentId || Date.now()}`,
      });
      fire();
    };

    const handleArtistRequest = (data: any) => {
      playStatusSound('in_review');
      sendPushNotification('Promo.music - Новая заявка', {
        body: data.artistName
          ? `${data.artistName} - ${data.message || 'новая заявка'}`
          : data.message || 'Получена новая заявка',
        tag: `artist-req-${data.requestId || Date.now()}`,
      });
      fire();
    };

    // ── Обработчик доступных тестов треков (DJ / Producer / Engineer) ──

    const handleTrackTestAvailable = (data: any) => {
      playStatusSound('in_review');
      sendPushNotification('Promo.music - Тест трека', {
        body: data.message || `Новый трек доступен для рецензирования`,
        tag: `track-test-${data.requestId || Date.now()}`,
      });
      fire();
    };

    // ── Обработчики маркетплейса ──

    const handleBeatPurchased = (data: any) => {
      playStatusSound('approved');
      sendPushNotification('Promo.music - Продажа бита', {
        body: data.message || 'Ваш бит куплен',
        tag: `beat-purchase-${data.purchaseId || Date.now()}`,
      });
      fire();
    };

    const handleBeatReviewNew = (data: any) => {
      playStatusSound('in_review');
      sendPushNotification('Promo.music - Новый отзыв', {
        body: data.message || 'Получен новый отзыв на бит',
        tag: `beat-review-${data.reviewId || Date.now()}`,
      });
      fire();
    };

    const handleServiceOrderNew = (data: any) => {
      playStatusSound('in_review');
      sendPushNotification('Promo.music - Новый заказ', {
        body: data.message || 'Получен новый заказ на услугу',
        tag: `service-order-${data.orderId || Date.now()}`,
      });
      fire();
    };

    const handleServiceOrderUpdate = (data: any) => {
      const soundMap: Record<string, string> = {
        accepted: 'approved',
        rejected: 'rejected',
        in_progress: 'in_review',
        revision: 'in_review',
        completed: 'approved',
      };
      playStatusSound(soundMap[data.status] || 'in_review');
      sendPushNotification('Promo.music - Обновление заказа', {
        body: data.message || `Статус заказа изменён: ${data.status || 'обновлён'}`,
        tag: `service-order-upd-${data.orderId || Date.now()}`,
      });
      fire();
    };

    // ── Обработчик входящих личных сообщений (все роли) ──

    const handleDirectMessage = (data: any) => {
      // Ролевые метки отправителя для push
      const roleLabels: Record<string, string> = {
        artist: 'Артист',
        producer: 'Продюсер',
        dj: 'DJ',
        admin: 'Promo.music',
        radio: 'Радио',
        venue: 'Заведение',
      };
      const senderLabel = data.senderName || roleLabels[data.senderRole] || 'Пользователь';
      const sourceLabel = data.source === 'collab' ? ' (коллаборация)' : data.source === 'support' ? ' (поддержка)' : '';

      playStatusSound('in_review');
      sendPushNotification(`Promo.music - Сообщение${sourceLabel}`, {
        body: `${senderLabel}: ${data.text || 'Новое сообщение'}`,
        tag: `dm-${data.conversationId || Date.now()}`,
      });
      fire();
    };

    // ── Подписка (общие) ──
    sseCtx.on('chat_message', handleChatMessage);
    sseCtx.on('notification', handleNotification);
    sseCtx.on('collab_offer', handleCollabOffer);
    sseCtx.on('order_update', handleOrderUpdate);
    sseCtx.on('new_direct_message', handleDirectMessage);

    // ── Подписка (роль-специфичные) ──
    if (role === 'dj' || role === 'venue') {
      sseCtx.on('booking_update', handleBookingUpdate);
    }
    if (role === 'dj' || role === 'producer') {
      sseCtx.on('track_test_available', handleTrackTestAvailable);
    }
    if (role === 'admin') {
      sseCtx.on('moderation_update', handleModerationUpdate);
    }
    if (role === 'radio') {
      sseCtx.on('artist_request', handleArtistRequest);
    }

    // ── Подписка (маркетплейс) ──
    sseCtx.on('beat_purchased', handleBeatPurchased);
    sseCtx.on('beat_review_new', handleBeatReviewNew);
    sseCtx.on('service_order_new', handleServiceOrderNew);
    sseCtx.on('service_order_update', handleServiceOrderUpdate);

    return () => {
      sseCtx.off('chat_message', handleChatMessage);
      sseCtx.off('notification', handleNotification);
      sseCtx.off('collab_offer', handleCollabOffer);
      sseCtx.off('order_update', handleOrderUpdate);
      sseCtx.off('new_direct_message', handleDirectMessage);

      if (role === 'dj' || role === 'venue') {
        sseCtx.off('booking_update', handleBookingUpdate);
      }
      if (role === 'dj' || role === 'producer') {
        sseCtx.off('track_test_available', handleTrackTestAvailable);
      }
      if (role === 'admin') {
        sseCtx.off('moderation_update', handleModerationUpdate);
      }
      if (role === 'radio') {
        sseCtx.off('artist_request', handleArtistRequest);
      }

      // ── Отписка (маркетплейс) ──
      sseCtx.off('beat_purchased', handleBeatPurchased);
      sseCtx.off('beat_review_new', handleBeatReviewNew);
      sseCtx.off('service_order_new', handleServiceOrderNew);
      sseCtx.off('service_order_update', handleServiceOrderUpdate);
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