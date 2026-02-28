/**
 * Checkout API — клиент для платёжных эндпоинтов
 *
 * Используется на фронтенде для:
 * - Создания платёжных сессий (ЮКасса / Т-Банк)
 * - Проверки статуса платежа
 * - Управления сохранёнными способами оплаты
 * - Пополнения монет
 * - Подписок
 */

import { projectId, publicAnonKey } from '@/utils/supabase/info';

const SERVER_BASE = `https://${projectId}.supabase.co/functions/v1/server`;

type Gateway = 'yookassa' | 'tbank';
type PaymentType = 'purchase' | 'subscription' | 'donation' | 'topup';

interface CreateSessionParams {
  gateway: Gateway;
  amount: number;
  type: PaymentType;
  description?: string;
  returnUrl?: string;
  savePaymentMethod?: boolean;
  metadata?: Record<string, string>;
}

interface PaymentSessionStatus {
  orderId: string;
  status: 'pending' | 'succeeded' | 'canceled' | 'refunded';
  amount: number;
  currency: string;
  type: PaymentType;
  gateway: Gateway;
  createdAt: string;
  completedAt?: string;
}

interface SavedMethod {
  id: string;
  gateway: Gateway;
  type: string;
  title: string;
  createdAt: string;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
}

// ── Helpers ──

function getHeaders(): Record<string, string> {
  const accessToken = localStorage.getItem('promo-music-access-token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken || publicAnonKey}`,
    'X-User-Id': localStorage.getItem('promo-music-user-id') || '',
  };
}

async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const response = await fetch(`${SERVER_BASE}${endpoint}`, {
      ...options,
      headers: { ...getHeaders(), ...options.headers as Record<string, string> },
    });
    return await response.json();
  } catch (error) {
    console.error(`Checkout API error [${endpoint}]:`, error);
    return { success: false, error: String(error) };
  }
}

// ── Checkout API ──

export const checkoutApi = {
  /**
   * Создать платёжную сессию. Возвращает URL для редиректа на страницу оплаты.
   */
  createSession: (params: CreateSessionParams) =>
    apiCall<{ orderId: string; confirmationUrl: string; gateway: Gateway; status: string }>(
      '/api/checkout/create-session',
      {
        method: 'POST',
        body: JSON.stringify({
          gateway: params.gateway,
          amount: params.amount,
          type: params.type,
          description: params.description || 'Оплата на promo.music',
          returnUrl: params.returnUrl || `${window.location.origin}/payment/result`,
          savePaymentMethod: params.savePaymentMethod || false,
          metadata: params.metadata || {},
        }),
      }
    ),

  /**
   * Проверить статус платёжной сессии (polling после redirect).
   */
  getSessionStatus: (orderId: string) =>
    apiCall<PaymentSessionStatus>(`/api/checkout/session/${orderId}`),

  /**
   * Получить список сохранённых способов оплаты.
   */
  getSavedMethods: () =>
    apiCall<SavedMethod[]>('/api/checkout/methods'),

  /**
   * Удалить сохранённый способ оплаты.
   */
  deleteSavedMethod: (methodId: string) =>
    apiCall<void>(`/api/checkout/methods/${methodId}`, { method: 'DELETE' }),

  /**
   * Получить список тарифных планов подписок.
   */
  getPlans: () =>
    apiCall<SubscriptionPlan[]>('/api/checkout/plans'),

  /**
   * Пополнить монеты через оплату.
   * Курс: 1 ₽ = 10 монет.
   */
  topUpCoins: (amount: number, gateway: Gateway) =>
    apiCall<{ orderId: string; confirmationUrl: string; coinAmount: number; rubleAmount: number }>(
      '/api/coins/topup',
      {
        method: 'POST',
        body: JSON.stringify({
          gateway,
          amount,
          returnUrl: `${window.location.origin}/payment/result`,
        }),
      }
    ),
};

// ── Convenience: redirect to payment ──

/**
 * Создать сессию и перенаправить пользователя на страницу оплаты.
 * Используйте для кнопок "Оплатить через ЮКасса" / "Оплатить через Т-Банк".
 */
export async function redirectToPayment(params: CreateSessionParams): Promise<void> {
  const result = await checkoutApi.createSession(params);
  if (result.success && result.data?.confirmationUrl) {
    // Save orderId for polling on return
    sessionStorage.setItem('pending-payment-order', result.data.orderId);
    window.location.href = result.data.confirmationUrl;
  } else {
    throw new Error(result.error || 'Не удалось создать платёж');
  }
}

/**
 * Поллинг статуса платежа после возврата со страницы оплаты.
 * Вызывайте на странице /payment/result.
 */
export async function pollPaymentStatus(orderId: string, maxAttempts = 30, intervalMs = 2000): Promise<PaymentSessionStatus> {
  for (let i = 0; i < maxAttempts; i++) {
    const result = await checkoutApi.getSessionStatus(orderId);
    if (result.success && result.data) {
      if (result.data.status !== 'pending') {
        return result.data;
      }
    }
    await new Promise(r => setTimeout(r, intervalMs));
  }
  throw new Error('Таймаут ожидания статуса платежа');
}
