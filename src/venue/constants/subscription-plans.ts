/**
 * SUBSCRIPTION PLANS - Константы тарифных планов для заведений
 * Унифицированная структура: Старт / Бизнес / Сеть / Enterprise
 */

import type { SubscriptionPlanDetails } from '../types/venue-types';

export const SUBSCRIPTION_PLANS: SubscriptionPlanDetails[] = [
  {
    id: 'start',
    name: 'Старт',
    description: 'Для небольших кафе и баров',
    monthlyPrice: 4990,
    yearlyPrice: 49900,
    zones: 1,
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
    id: 'business',
    name: 'Бизнес',
    description: 'Для ресторанов и клубов',
    monthlyPrice: 9990,
    yearlyPrice: 99900,
    zones: 4,
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
    id: 'network',
    name: 'Сеть',
    description: 'Для сетей заведений',
    monthlyPrice: 14990,
    yearlyPrice: 149900,
    zones: 'unlimited',
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
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Для сетей 10+ заведений',
    monthlyPrice: null,
    yearlyPrice: null,
    zones: 'unlimited',
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
      sla: true,
      dedicatedApp: true,
      concierge: true,
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
  sla: 'SLA 99.9%',
  dedicatedApp: 'Брендированное приложение',
  concierge: 'Выделенный консьерж',
};

export const LIBRARY_ACCESS_LABELS = {
  basic: 'Базовая библиотека (5 000+ треков)',
  full: 'Полная библиотека (20 000+ треков)',
  premium: 'Премиум библиотека (50 000+ треков + эксклюзивы)',
};

// Скидка при оплате за год
export const YEARLY_DISCOUNT_PERCENT = 17;

// Пробный период (дни)
export const TRIAL_PERIOD_DAYS = 14;
