/**
 * SUBSCRIPTION PLANS - Константы тарифных планов для заведений
 * Согласно анализу системы
 */

import type { SubscriptionPlanDetails } from '../types/venue-types';

export const SUBSCRIPTION_PLANS: SubscriptionPlanDetails[] = [
  {
    id: 'basic',
    name: 'Базовый',
    description: 'Для небольших кафе и баров',
    monthlyPrice: 2990,
    yearlyPrice: 29900,
    features: {
      maxPlaylists: 5,
      maxTracks: 500,
      libraryAccess: 'basic',
      analytics: false,
      scheduling: false,
      multiLocation: false,
      apiAccess: false,
      prioritySupport: false,
      customBranding: false,
    },
  },
  {
    id: 'professional',
    name: 'Профессиональный',
    description: 'Для ресторанов и клубов',
    monthlyPrice: 5990,
    yearlyPrice: 59900,
    popular: true,
    features: {
      maxPlaylists: 20,
      maxTracks: 2000,
      libraryAccess: 'full',
      analytics: true,
      scheduling: true,
      multiLocation: false,
      apiAccess: false,
      prioritySupport: true,
      customBranding: true,
    },
  },
  {
    id: 'enterprise',
    name: 'Корпоративный',
    description: 'Для сетей заведений',
    monthlyPrice: 14990,
    yearlyPrice: 149900,
    features: {
      maxPlaylists: 'unlimited',
      maxTracks: 'unlimited',
      libraryAccess: 'premium',
      analytics: true,
      scheduling: true,
      multiLocation: true,
      apiAccess: true,
      prioritySupport: true,
      customBranding: true,
    },
  },
];

export const SUBSCRIPTION_FEATURES = {
  maxPlaylists: 'Количество плейлистов',
  maxTracks: 'Количество треков',
  libraryAccess: 'Доступ к библиотеке',
  analytics: 'Аналитика',
  scheduling: 'Расписание воспроизведения',
  multiLocation: 'Мультилокация',
  apiAccess: 'API доступ',
  prioritySupport: 'Приоритетная поддержка',
  customBranding: 'Брендированный контент',
};

export const LIBRARY_ACCESS_LABELS = {
  basic: 'Базовая библиотека (5000+ треков)',
  full: 'Полная библиотека (20000+ треков)',
  premium: 'Премиум библиотека (50000+ треков + эксклюзивы)',
};

// Скидка при оплате за год
export const YEARLY_DISCOUNT_PERCENT = 17;

// Пробный период (дни)
export const TRIAL_PERIOD_DAYS = 14;
