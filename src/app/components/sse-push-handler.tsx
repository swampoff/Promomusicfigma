/**
 * SSE PUSH HANDLER - Обработчик SSE-событий для звуков и push-уведомлений
 * 
 * Универсальный компонент, подписывается на SSE-события внутри SSEProvider.
 * Адаптируется под роль кабинета (artist / producer / dj).
 * Рендерит null - чистый side-effect компонент.
 */

import { useEffect } from 'react';
import { useSSEContext } from '@/utils/contexts/SSEContext';
import { playStatusSound } from '@/utils/notification-sound';
import {
  sendStatusPush,
  sendCollabPush,
  sendChatPush,
  sendPushNotification,
} from '@/utils/push-notifications';

type CabinetRole = 'artist' | 'producer' | 'dj';

interface SSEPushHandlerProps {
  /** Роль кабинета для адаптации уведомлений */
  role: CabinetRole;
}

export function SSEPushHandler({ role }: SSEPushHandlerProps) {
  const sseCtx = useSSEContext();

  useEffect(() => {
    if (!sseCtx) return;

    // ── Общие обработчики (все роли) ──

    const handleChatMessage = (data: any) => {
      playStatusSound('in_review');
      sendChatPush(
        data.senderName || 'Собеседник',
        data.text || 'Новое сообщение',
        data.orderId,
      );
    };

    const handleNotification = (data: any) => {
      playStatusSound(data.newStatus || 'in_review');
      sendStatusPush(
        data.newStatus || 'notification',
        data.orderTitle || '',
        data.comment,
      );
    };

    // ── Роль-специфичные обработчики ──

    const handleCollabOffer = (data: any) => {
      playStatusSound('in_review');
      if (role === 'artist') {
        sendCollabPush(
          data.producerName || 'Продюсер',
          data.message || 'Новое предложение коллаборации',
        );
      } else if (role === 'producer') {
        sendCollabPush(
          data.artistName || 'Артист',
          data.message || 'Запрос на коллаборацию',
        );
      } else {
        sendCollabPush(
          data.senderName || 'Пользователь',
          data.message || 'Новое предложение',
        );
      }
    };

    const handleOrderUpdate = (data: any) => {
      playStatusSound(data.status || 'in_review');
      const titles: Record<CabinetRole, string> = {
        producer: 'Promo.music - Обновление заказа',
        dj: 'Promo.music - Обновление букинга',
        artist: 'Promo.music - Обновление публикации',
      };
      sendPushNotification(titles[role], {
        body: data.title || data.orderTitle || 'Статус изменён',
        tag: `order-${data.orderId || Date.now()}`,
      });
    };

    const handleBookingUpdate = (data: any) => {
      playStatusSound(data.status === 'confirmed' ? 'approved' : 'in_review');
      sendPushNotification('Promo.music - Букинг', {
        body: data.venueName
          ? `${data.venueName} - ${data.message || 'обновление'}`
          : data.message || 'Обновление букинга',
        tag: `booking-${data.bookingId || Date.now()}`,
      });
    };

    // ── Подписка ──

    sseCtx.on('chat_message', handleChatMessage);
    sseCtx.on('notification', handleNotification);
    sseCtx.on('collab_offer', handleCollabOffer);
    sseCtx.on('order_update', handleOrderUpdate);

    if (role === 'dj') {
      sseCtx.on('booking_update', handleBookingUpdate);
    }

    return () => {
      sseCtx.off('chat_message', handleChatMessage);
      sseCtx.off('notification', handleNotification);
      sseCtx.off('collab_offer', handleCollabOffer);
      sseCtx.off('order_update', handleOrderUpdate);

      if (role === 'dj') {
        sseCtx.off('booking_update', handleBookingUpdate);
      }
    };
  }, [sseCtx, role]);

  return null;
}
