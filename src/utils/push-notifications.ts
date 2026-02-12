/**
 * PUSH NOTIFICATIONS - Browser Push API
 * Нативные push-уведомления даже при закрытой вкладке
 */

const LS_PUSH_KEY = 'promo_push_enabled';

export function isPushSupported(): boolean {
  return 'Notification' in window && 'serviceWorker' in navigator;
}

export function getPushPermission(): NotificationPermission {
  if (!isPushSupported()) return 'denied';
  return Notification.permission;
}

export function isPushEnabled(): boolean {
  return localStorage.getItem(LS_PUSH_KEY) === 'true' && getPushPermission() === 'granted';
}

export async function requestPushPermission(): Promise<boolean> {
  if (!isPushSupported()) return false;

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      localStorage.setItem(LS_PUSH_KEY, 'true');
      return true;
    }
    localStorage.setItem(LS_PUSH_KEY, 'false');
    return false;
  } catch (err) {
    console.error('Push permission request failed:', err);
    return false;
  }
}

export function disablePush(): void {
  localStorage.setItem(LS_PUSH_KEY, 'false');
}

/**
 * Отправляет нативное push-уведомление (если разрешено)
 */
export function sendPushNotification(
  title: string,
  options?: {
    body?: string;
    icon?: string;
    badge?: string;
    tag?: string;
    data?: any;
    requireInteraction?: boolean;
    silent?: boolean;
    onClick?: () => void;
  },
): Notification | null {
  if (!isPushEnabled()) return null;
  if (getPushPermission() !== 'granted') return null;

  try {
    const notification = new Notification(title, {
      body: options?.body,
      icon: options?.icon || '/vite.svg',
      badge: options?.badge,
      tag: options?.tag,
      data: options?.data,
      requireInteraction: options?.requireInteraction ?? false,
      silent: options?.silent ?? false,
    });

    if (options?.onClick) {
      notification.onclick = () => {
        window.focus();
        options.onClick!();
        notification.close();
      };
    }

    // Автозакрытие через 8 секунд
    setTimeout(() => notification.close(), 8000);

    return notification;
  } catch (err) {
    console.warn('Push notification failed:', err);
    return null;
  }
}

// Маппинг статусов для push
const STATUS_PUSH_MAP: Record<string, { title: string; icon: string }> = {
  approved: { title: 'Публикация одобрена', icon: '/vite.svg' },
  rejected: { title: 'Публикация отклонена', icon: '/vite.svg' },
  revision: { title: 'Требуется доработка', icon: '/vite.svg' },
  published: { title: 'Контент опубликован', icon: '/vite.svg' },
  in_review: { title: 'Начата проверка', icon: '/vite.svg' },
  paid: { title: 'Оплата подтверждена', icon: '/vite.svg' },
};

/**
 * Отправляет push для статуса публикации
 */
export function sendStatusPush(status: string, orderTitle: string, comment?: string): void {
  const info = STATUS_PUSH_MAP[status];
  if (!info) return;

  sendPushNotification(`promo.music - ${info.title}`, {
    body: comment ? `${orderTitle}: ${comment}` : orderTitle,
    tag: `status-${status}-${Date.now()}`,
  });
}

/**
 * Отправляет push для сообщения коллаборации
 */
export function sendCollabPush(senderName: string, message: string): void {
  sendPushNotification(`promo.music - ${senderName}`, {
    body: message,
    tag: `collab-${Date.now()}`,
  });
}

/**
 * Отправляет push для чат-сообщения
 */
export function sendChatPush(senderName: string, text: string, orderId?: string): void {
  sendPushNotification(`promo.music - Сообщение от ${senderName}`, {
    body: text,
    tag: `chat-${orderId || Date.now()}`,
  });
}
