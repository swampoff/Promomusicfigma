/**
 * SUBSCRIPTION CONTEXT
 * Централизованное управление подписками пользователя
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { projectId, publicAnonKey } from '@/utils/supabase/info';

interface SubscriptionLimits {
  credits_per_month: number;
  credits_remaining: number;
  extra_mailing_price: number;
  discounts: {
    pitching: number;
    marketing: number;
    track_test: number;
    banners: number;
  };
  donation_fee: number;
  coins_bonus: number;
}

interface UserSubscription {
  tier: 'spark' | 'start' | 'pro' | 'elite';
  tierName?: string;
  expires_at: string;
  features: string[];
  limits: SubscriptionLimits;
  price?: number;
  interval?: 'month' | 'year';
  status?: 'active' | 'cancelled' | 'expired';
}

interface SubscriptionContextType {
  subscription: UserSubscription | null;
  loading: boolean;
  error: string | null;
  refreshSubscription: () => Promise<void>;
  setSubscription: (sub: UserSubscription) => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

const DEFAULT_SUBSCRIPTION: UserSubscription = {
  tier: 'spark',
  tierName: 'Тест-драйв',
  expires_at: '2099-12-31',
  features: [],
  limits: {
    credits_per_month: 0,
    credits_remaining: 0,
    extra_mailing_price: 7000,
    discounts: {
      pitching: 0,
      marketing: 0,
      track_test: 0,
      banners: 0,
    },
    donation_fee: 0.10,
    coins_bonus: 0,
  },
  status: 'active',
};

interface SubscriptionProviderProps {
  children: ReactNode;
  userId?: string; // Теперь optional
  initialSubscription?: UserSubscription;
}

export function SubscriptionProvider({ children, userId: providedUserId, initialSubscription }: SubscriptionProviderProps) {
  // Используем предоставленный userId или demo userId
  const userId = providedUserId || 'demo-user-123';
  
  // Уменьшено логирование для production
  
  const [subscription, setSubscription] = useState<UserSubscription | null>(
    initialSubscription || DEFAULT_SUBSCRIPTION
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshSubscription = async () => {
    if (!userId) {
      setSubscription(DEFAULT_SUBSCRIPTION);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // IMPORTANT: Добавляем timeout для предотвращения зависания
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 секунд

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84730125/subscriptions/${userId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('Failed to fetch subscription');
      }

      const data = await response.json();

      if (data.success && data.data) {
        // Проверка истечения подписки
        const expiresAt = new Date(data.data.expires_at);
        const now = new Date();
        const isExpired = expiresAt < now;

        if (isExpired && data.data.tier !== 'spark') {
          console.warn('[SubscriptionContext] Subscription expired, reverting to spark tier');
          setSubscription(DEFAULT_SUBSCRIPTION);
        } else {
          // Трансформация: сервер возвращает плоскую структуру,
          // UI ожидает вложенную `limits` (discounts, credits, etc.)
          const raw = data.data;
          const transformed: UserSubscription = {
            tier: raw.tier || 'spark',
            tierName: raw.tierName,
            expires_at: raw.expires_at || '2099-12-31',
            features: raw.features || [],
            price: raw.price,
            interval: raw.interval,
            status: raw.status,
            limits: raw.limits || {
              credits_per_month: raw.credits_per_month ?? 0,
              credits_remaining: raw.credits_remaining ?? 0,
              extra_mailing_price: raw.extra_mailing_price ?? 7000,
              discounts: raw.discounts || { pitching: 0, marketing: 0, track_test: 0, banners: 0 },
              donation_fee: raw.donation_fee ?? 0.10,
              coins_bonus: raw.coins_bonus ?? 0,
            },
          };
          console.log('[SubscriptionContext] ✅ Subscription loaded from server:', transformed.tier);
          setSubscription(transformed);
        }
      } else {
        // Если нет подписки, используем Тест-драйв tier
        console.log('[SubscriptionContext] No subscription found, using SPARK tier');
        setSubscription(DEFAULT_SUBSCRIPTION);
      }
    } catch (err) {
      // ✨ GRACEFUL ERROR HANDLING - показываем пустое состояние вместо ошибки
      if (err instanceof Error && err.name === 'AbortError') {
        console.warn('[SubscriptionContext] ⏱️ Request timeout - using local SPARK tier');
      } else {
        console.warn('[SubscriptionContext] ⚠️ Failed to load subscription - using local SPARK tier:', err);
      }
      setError(null); // Не показываем ошибку пользователю
      // В случае ошибки используем Тест-драйв tier
      setSubscription(DEFAULT_SUBSCRIPTION);
    } finally {
      setLoading(false);
    }
  };

  // ОПТИМИЗАЦИЯ: НЕ загружаем при монтировании, используем DEFAULT_SUBSCRIPTION
  // Загрузка произойдет только при явном вызове refreshSubscription()
  useEffect(() => {
    // Проверяем есть ли сохраненная подписка в localStorage
    const savedSub = localStorage.getItem('user_subscription');
    if (savedSub) {
      try {
        const parsed = JSON.parse(savedSub);
        setSubscription(parsed);
      } catch (e) {
        setSubscription(DEFAULT_SUBSCRIPTION);
      }
    } else {
      setSubscription(DEFAULT_SUBSCRIPTION);
    }
    // Не делаем автоматический запрос к серверу
  }, [userId]);

  // Сохраняем подписку в localStorage при изменении
  useEffect(() => {
    if (subscription) {
      localStorage.setItem('user_subscription', JSON.stringify(subscription));
    }
  }, [subscription]);

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        loading,
        error,
        refreshSubscription,
        setSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  // Убрали лишнее логирование
  if (!context) {
    console.error('[useSubscription] ERROR: Context is null! Provider not found in component tree.');
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}

// Хелперы для проверки возможностей подписки
export const subscriptionHelpers = {
  getCreditsRemaining: (subscription: UserSubscription | null): number => {
    return subscription?.limits?.credits_remaining ?? 0;
  },

  getCreditsPerMonth: (subscription: UserSubscription | null): number => {
    return subscription?.limits?.credits_per_month ?? 0;
  },

  getExtraMailingPrice: (subscription: UserSubscription | null): number => {
    return subscription?.limits?.extra_mailing_price ?? 7000;
  },

  getDonationFee: (subscription: UserSubscription | null): number => {
    return subscription?.limits?.donation_fee ?? 0.10;
  },

  getCoinsBonus: (subscription: UserSubscription | null): number => {
    return subscription?.limits?.coins_bonus ?? 0;
  },

  getMarketingDiscount: (subscription: UserSubscription | null): number => {
    return subscription?.limits?.discounts?.marketing ?? 0;
  },

  getPitchingDiscount: (subscription: UserSubscription | null): number => {
    return subscription?.limits?.discounts?.pitching ?? 0;
  },

  getTrackTestDiscount: (subscription: UserSubscription | null): number => {
    return subscription?.limits?.discounts?.track_test ?? 0;
  },

  getBannerDiscount: (subscription: UserSubscription | null): number => {
    return subscription?.limits?.discounts?.banners ?? 0;
  },

  getTierLabel: (tier: string): string => {
    const labels: Record<string, string> = {
      spark: 'Тест-драйв',
      start: 'Старт',
      pro: 'Про',
      elite: 'Бизнес',
      // Обратная совместимость со старыми ID
      free: 'Тест-драйв',
      basic: 'Старт',
      premium: 'Бизнес',
    };
    return labels[tier] || tier;
  },

  getTierColor: (tier: string): string => {
    const colors: Record<string, string> = {
      spark: 'text-gray-400',
      start: 'text-green-400',
      pro: 'text-purple-400',
      elite: 'text-yellow-400',
      free: 'text-gray-400',
      basic: 'text-green-400',
      premium: 'text-yellow-400',
    };
    return colors[tier] || 'text-gray-400';
  },

  getTierBadgeColor: (tier: string): string => {
    const colors: Record<string, string> = {
      spark: 'bg-gray-500/20 border-gray-500/30',
      start: 'bg-green-500/20 border-green-500/30',
      pro: 'bg-purple-500/20 border-purple-500/30',
      elite: 'bg-yellow-500/20 border-yellow-500/30',
      free: 'bg-gray-500/20 border-gray-500/30',
      basic: 'bg-green-500/20 border-green-500/30',
      premium: 'bg-yellow-500/20 border-yellow-500/30',
    };
    return colors[tier] || 'bg-gray-500/20 border-gray-500/30';
  },
};