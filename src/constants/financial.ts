/**
 * FINANCIAL CONSTANTS
 * Все финансовые константы и функции расчёта
 * Extracted from DataContext for better maintainability
 */

// ==================== ПОДПИСКИ ====================

/**
 * КАНОНИЧНАЯ СИСТЕМА ПОДПИСОК АРТИСТА (v19)
 * 
 * Кредитная модель: подписка = кредиты на рассылки + скидки на услуги.
 * Годовая оплата = 10 месяцев по цене (экономия ~17%).
 */

// Подписки для артистов (цены за месяц)
export const SUBSCRIPTION_PRICES = {
  spark: 0,        // Тест-драйв (бесплатно)
  start: 8990,     // Старт
  pro: 39990,      // Про
  elite: 149990,   // Бизнес
};

// Годовые цены (10 месяцев по цене)
export const SUBSCRIPTION_YEARLY_PRICES = {
  spark: 0,
  start: 89900,
  pro: 399900,
  elite: 1499900,
};

// Русские названия тарифов
export const SUBSCRIPTION_NAMES: Record<string, string> = {
  spark: 'Тест-драйв',
  start: 'Старт',
  pro: 'Про',
  elite: 'Бизнес',
};

// Кредиты рассылок в месяц
export const SUBSCRIPTION_CREDITS = {
  spark: 0,
  start: 1,
  pro: 3,
  elite: 10,
};

// Цена доп. рассылки
export const EXTRA_MAILING_PRICES = {
  spark: 7000,
  start: 5000,
  pro: 4000,
  elite: 3000,
};

// Скидки по подпискам (на питчинг)
export const SUBSCRIPTION_DISCOUNTS = {
  none: 0,
  spark: 0,
  start: 0.05,
  pro: 0.10,
  elite: 0.15,
};

// Скидки на маркетинг по подпискам
export const MARKETING_DISCOUNTS = {
  none: 0,
  spark: 0,
  start: 0.05,
  pro: 0.15,
  elite: 0.25,
};

// Скидки на тест трека по подпискам
export const TRACK_TEST_DISCOUNTS = {
  none: 0,
  spark: 0,
  start: 0,
  pro: 0.10,
  elite: 0.20,
};

// Скидки на баннеры по подпискам
export const BANNER_DISCOUNTS = {
  none: 0,
  spark: 0,
  start: 0.05,
  pro: 0.10,
  elite: 0.15,
};

// ==================== БАННЕРЫ ====================

// Баннерная реклама (7 дней, базовые цены без подписки)
export const BANNER_PRICES = {
  billboard_main: 15000,        // #1 Billboard Главная TOP (970×250)
  leaderboard_main: 10000,      // #2 Leaderboard Главная (728×90)
  category_top: 7000,           // #3 Category Top (728×90)
  sidebar_half_page: 8000,      // #4 Sidebar Half Page (300×600)
  in_feed_rectangle: 5000,      // #5 In-Feed Rectangle (300×250)
  profile_top: 6000,            // #6 Profile Top (728×90)
  sidebar_rectangle: 5000,      // #7 Sidebar Rectangle (336×280)
  mobile_large: 4000,           // #8 Mobile Large (320×100)
  mobile_banner: 3000,          // #9 Mobile Banner (320×50)
};

// Скидки за период (баннеры)
export const BANNER_PERIOD_DISCOUNTS = {
  1: 0,      // 1 день: +20% к дневной
  3: 0.10,   // 3 дня: -10%
  7: 0,      // 7 дней: базовая цена
  14: 0.15,  // 14 дней: -15%
  30: 0.25,  // 30 дней: -25%
  90: 0.35,  // 90 дней: -35%
};

// ==================== ПЛЕЙЛИСТЫ ====================

// Плейлист-питчинг (1 трек, базовые цены)
export const PLAYLIST_PITCHING_PRICES = {
  yandex: 5000,      // Яндекс.Музыка
  vk: 5000,          // VK Музыка
  zvuk_mts: 5000,    // Звук/МТС (вместо Spotify)
  all: 13000,        // Пакет Single Boost (все 3)
  ep: 30000,         // EP Campaign (3 трека на все)
  album: 70000,      // Album Domination (8+ треков)
};

// ==================== МАРКЕТИНГ ====================

// Маркетинговые слоты (блогеры/соцсети)
export const MARKETING_SLOT_PRICES = {
  post: 5000,          // Пост в ленте
  stories: 3000,       // Stories (24 часа)
  video: 15000,        // Полноценное видео
  reels: 8000,         // Reels/Shorts
  integration: 20000,  // Нативная интеграция
};

// Маркетинговые инструменты
export const MARKETING_PRICES = {
  // Автопостинг
  autopost_1_social: 3000,     // 1 соцсеть/мес
  autopost_5_socials: 10000,   // 5 соцсетей/мес
  autopost_all: 15000,         // Все соцсети/мес
  stories_reels: 5000,         // Stories/Reels (10 шт)
  
  // Email
  email_platform_10k: 15000,   // Рассылка 10k юзеров (1 раз)
  email_platform_50k: 50000,   // Рассылка 50k юзеров (1 раз)
  
  // SMS и Push
  sms_1000: 10000,             // 1,000 SMS
  sms_10000: 70000,            // 10,000 SMS
  push_10000: 14000,           // 10,000 Push
  
  // Featured
  featured_main_3days: 20000,  // Featured на главной (3 дня)
};

// Функция расчёта цены маркетинговой кампании с подпиской
export function calculateMarketingPrice(
  selectedServices: (keyof typeof MARKETING_PRICES)[],
  subscription: 'none' | 'spark' | 'start' | 'pro' | 'elite'
): { baseTotal: number; discountedTotal: number; discount: number; breakdown: { service: string; price: number }[] } {
  const breakdown: { service: string; price: number }[] = [];
  let baseTotal = 0;

  for (const service of selectedServices) {
    const price = MARKETING_PRICES[service] || 0;
    breakdown.push({ service, price });
    baseTotal += price;
  }

  const discount = MARKETING_DISCOUNTS[subscription] || 0;
  const discountedTotal = Math.round(baseTotal * (1 - discount));

  return { baseTotal, discountedTotal, discount, breakdown };
}

// ==================== ПИТЧИНГ ====================

// Питчинг (радио, лейблы, sync, инфлюенсеры, ТВ)
export const PITCHING_PRICES = {
  // Радио
  radio_federal: 80000,        // Федеральное FM (15 станций)
  radio_regional: 40000,       // Региональное FM (80 станций)
  radio_thematic: 30000,       // Тематическое FM (30 станций)
  radio_online: 35000,         // Онлайн-радио ТОП (50)
  
  // Лейблы
  labels_major: 150000,        // Major labels (5)
  labels_indie_large: 80000,   // Крупные инди (20)
  labels_medium: 40000,        // Средние (50)
  labels_all_premium: 350000,  // Все (Премиум пакет)
  
  // Sync Licensing
  sync_agencies: 50000,        // Рекламные агентства (70)
  sync_tv: 60000,              // ТВ и стриминги (40)
  sync_brands: 80000,          // Бренды прямо (80)
  sync_all_premium: 250000,    // Все (Премиум)
  
  // Инфлюенсеры
  influencers_youtube: 25000,  // YouTube (80 блогеров)
  influencers_vk: 20000,       // VK паблики (150)
  influencers_tiktok: 30000,   // TikTok (50)
  influencers_all: 80000,      // Все платформы
  
  // ТВ-шоу
  tv_music_shows: 100000,      // Музыкальные ТВ-шоу (15)
  tv_online: 60000,            // Онлайн-ТВ шоу
  tv_all: 150000,              // Все категории
};

// ==================== ПИТЧИНГ КАНАЛЫ ====================

// Типы питчинга (базовые цены)
export const PITCHING_TYPE_PRICES = {
  standard: 5000,                      // Стандартный питчинг
  premium_direct_to_editor: 5000,      // Premium база (без надбавки)
  premium_addon: 15000,                // Premium надбавка (бесплатно для elite)
};

// Целевые каналы питчинга (доплата за каждый канал)
export const PITCHING_CHANNEL_PRICES = {
  radio: 3000,       // Радиостанции (FM + онлайн)
  streaming: 5000,   // Стриминги (Яндекс, VK, Звук)
  venues: 1500,      // Заведения (клубы, бары, кафе)
  tv: 7000,          // Телевидение (ТВ каналы и шоу)
};

// Функция расчёта цены питчинга с подпиской
export function calculatePitchingPrice(
  pitchType: 'standard' | 'premium_direct_to_editor',
  channels: string[],
  subscription: 'none' | 'spark' | 'start' | 'pro' | 'elite'
): { baseTotal: number; discountedTotal: number; discount: number } {
  let baseTotal = PITCHING_TYPE_PRICES[pitchType] || PITCHING_TYPE_PRICES.standard;

  // Premium надбавка (бесплатно для elite)
  if (pitchType === 'premium_direct_to_editor' && subscription !== 'elite') {
    baseTotal += PITCHING_TYPE_PRICES.premium_addon;
  }

  // Каналы
  channels.forEach(ch => {
    baseTotal += (PITCHING_CHANNEL_PRICES as Record<string, number>)[ch] || 0;
  });

  const discount = SUBSCRIPTION_DISCOUNTS[subscription] || 0;
  const discountedTotal = Math.round(baseTotal * (1 - discount));

  return { baseTotal, discountedTotal, discount };
}

// ==================== 360° ПРОДАКШН ====================

// Типы услуг 360° продакшна (базовые цены)
export const PRODUCTION_360_SERVICE_PRICES = {
  video_shooting: 50000,       // Съёмка видеоклипа
  video_editing: 25000,        // Монтаж и постпродакшн
  cover_design: 5000,          // Дизайн обложки
  full_package: 150000,        // Полный пакет 360°
  concept_only: 15000,         // Только концепция/стратегия
  recording_mixing: 40000,     // Запись + сведение + мастеринг
  distribution_promo: 35000,   // Дистрибуция + продвижение
};

// Опции продакшна (доп. услуги)
export const PRODUCTION_360_ADDON_PRICES = {
  extra_shooting_day: 25000,   // Доп. день съёмки
  drone_filming: 15000,        // Съёмка с дрона
  animation_2d: 20000,         // 2D анимация
  animation_3d: 40000,         // 3D анимация
  color_grading_premium: 10000, // Премиум цветокоррекция
  social_teasers: 8000,        // Тизеры для соцсетей (5 шт)
  smm_consultation: 5000,      // SMM консультация
  lyric_video: 10000,          // Лирик-видео
};

// Скидки по подпискам на 360° продакшн
export const PRODUCTION_360_DISCOUNTS = {
  none: 0,
  spark: 0,
  start: 0.05,
  pro: 0.10,
  elite: 0.15,
};

// Функция расчёта цены 360° продакшна
export function calculateProduction360Price(
  serviceType: keyof typeof PRODUCTION_360_SERVICE_PRICES,
  addons: (keyof typeof PRODUCTION_360_ADDON_PRICES)[],
  subscription: 'none' | 'spark' | 'start' | 'pro' | 'elite',
): {
  servicePrice: number;
  addonsTotal: number;
  addonsBreakdown: { addon: string; price: number }[];
  subtotal: number;
  discount: number;
  finalPrice: number;
} {
  const servicePrice = PRODUCTION_360_SERVICE_PRICES[serviceType] || PRODUCTION_360_SERVICE_PRICES.full_package;

  const addonsBreakdown: { addon: string; price: number }[] = [];
  let addonsTotal = 0;
  for (const addon of addons) {
    const price = PRODUCTION_360_ADDON_PRICES[addon] || 0;
    if (price > 0) {
      addonsBreakdown.push({ addon, price });
      addonsTotal += price;
    }
  }

  const subtotal = servicePrice + addonsTotal;
  const discount = PRODUCTION_360_DISCOUNTS[subscription] || 0;
  const finalPrice = Math.round(subtotal * (1 - discount));

  return { servicePrice, addonsTotal, addonsBreakdown, subtotal, discount, finalPrice };
}

// ==================== АУДИОБРЕНДИРОВАНИЕ ====================

// Стили аудиобрендинга (базовые цены)
export const AUDIO_BRANDING_STYLE_PRICES = {
  energetic: 2000,       // Энергичный
  professional: 3000,    // Профессиональный
  friendly: 2500,        // Дружелюбный
  luxury: 5000,          // Премиум/Люкс
  custom: 10000,         // Полностью кастомный
};

// Типы контента аудиобрендинга
export const AUDIO_BRANDING_CONTENT_PRICES = {
  jingle: 5000,           // Джингл (10-30 сек)
  audio_logo: 8000,       // Аудиологотип (3-5 сек)
  brand_theme: 15000,     // Фирменная мелодия (30-60 сек)
  sound_design: 12000,    // Саунд-дизайн (набор звуков)
  voice_branding: 7000,   // Голосовой брендинг (озвучка + интонация)
  sound_strategy: 25000,  // Звуковая стратегия (полный пакет)
  full_package: 50000,    // Полный аудиобренд (всё вместе)
};

// Множители за длительность (базовая = 15 сек)
export const AUDIO_BRANDING_DURATION_MULTIPLIERS = {
  5: 0.6,    // 5 сек (аудиолого)
  10: 0.8,   // 10 сек
  15: 1.0,   // 15 сек (базовая)
  20: 1.2,   // 20 сек
  30: 1.5,   // 30 сек
  60: 2.0,   // 60 сек (фирменная тема)
};

// Типы голоса (множитель к цене)
export const AUDIO_BRANDING_VOICE_MULTIPLIERS = {
  none: 1.0,       // Без голоса (инструментал)
  male: 1.0,       // Мужской голос
  female: 1.0,     // Женский голос
  neutral: 1.0,    // Нейтральный голос
  celebrity: 2.5,  // Известный голос/диктор
};

// Скидки по подпискам на аудиобрендирование
export const AUDIO_BRANDING_DISCOUNTS = {
  none: 0,
  spark: 0,
  start: 0.05,
  pro: 0.10,
  elite: 0.20,
};

// Функция расчёта цены аудиобрендинга
export function calculateAudioBrandingPrice(
  contentType: keyof typeof AUDIO_BRANDING_CONTENT_PRICES,
  style: keyof typeof AUDIO_BRANDING_STYLE_PRICES,
  duration: keyof typeof AUDIO_BRANDING_DURATION_MULTIPLIERS,
  voiceType: keyof typeof AUDIO_BRANDING_VOICE_MULTIPLIERS,
  subscription: 'none' | 'spark' | 'start' | 'pro' | 'elite',
): {
  basePrice: number;
  stylePrice: number;
  durationMultiplier: number;
  voiceMultiplier: number;
  subtotal: number;
  discount: number;
  finalPrice: number;
} {
  const basePrice = AUDIO_BRANDING_CONTENT_PRICES[contentType] || AUDIO_BRANDING_CONTENT_PRICES.jingle;
  const stylePrice = AUDIO_BRANDING_STYLE_PRICES[style] || AUDIO_BRANDING_STYLE_PRICES.professional;
  const durationMultiplier = AUDIO_BRANDING_DURATION_MULTIPLIERS[duration] || 1.0;
  const voiceMultiplier = AUDIO_BRANDING_VOICE_MULTIPLIERS[voiceType] || 1.0;

  const subtotal = Math.round((basePrice + stylePrice) * durationMultiplier * voiceMultiplier);
  const discount = AUDIO_BRANDING_DISCOUNTS[subscription] || 0;
  const finalPrice = Math.round(subtotal * (1 - discount));

  return { basePrice, stylePrice, durationMultiplier, voiceMultiplier, subtotal, discount, finalPrice };
}

// ==================== ТЕСТИРОВАНИЕ ====================

// Тестирование треков
export const TESTING_PRICES = {
  track_test: 3000,  // Тестирование любого трека
};

// ==================== ФАЗА 3 ====================

// Фаза 3: promo.discovery (отбор в каталог заведений)
export const DISCOVERY_PRICES = {
  none: 50000,     // Без подписки
  spark: 25000,    // Тест-драйв
  start: 15000,    // Старт
  pro: 0,          // Про: ВКЛЮЧЕНО (4 заявки/год)
  elite: 0,        // Бизнес: ВКЛЮЧЕНО (безлимит)
};

// Фаза 3: Тарифы для заведений
export const VENUE_PRICES = {
  basic: 4990,         // Заведение
  pro: 9990,           // Расширенный
  enterprise: 14990,   // Сеть
};

// Фаза 3: Комиссия платформы от revenue share
export const REVENUE_SHARE_COMMISSION = {
  none: 0.60,      // Без подписки: платформа берёт 60%, артист получает 40%
  spark: 0.45,     // Тест-драйв: 45% / 55%
  start: 0.35,     // Старт: 35% / 65%
  pro: 0.25,       // Про: 25% / 75%
  elite: 0.15,     // Бизнес: 15% / 85%
};

// ==================== DJ ПОДПИСКИ ====================

// DJ Subscription Plans (каноничные, source of truth)
export const DJ_SUBSCRIPTION_PRICES = {
  starter: 0,      // Starter (бесплатно)
  pro: 1990,       // Pro
  agency: 9990,    // Agency
};

export const DJ_SUBSCRIPTION_YEARLY_PRICES = {
  starter: 0,
  pro: 19900,      // 10 месяцев по цене (~17% экономия)
  agency: 99900,
};

export const DJ_SUBSCRIPTION_NAMES: Record<string, string> = {
  starter: 'Starter',
  pro: 'Pro',
  agency: 'Agency',
};

export const DJ_SUBSCRIPTION_FEATURES: Record<string, string[]> = {
  starter: [
    'Профиль в каталоге',
    'До 5 миксов',
    'До 5 букингов/мес',
    'Базовая аналитика',
  ],
  pro: [
    'Безлимит миксов',
    'Безлимит букингов',
    'Динамические цены',
    'ПРОМО.ЭИР интеграция',
    'Приоритет в каталоге',
    'Реферальная программа',
  ],
  agency: [
    'До 20 DJ в команде',
    'Единый дашборд',
    'Авто-распределение букингов',
    'API доступ',
    'Персональный менеджер',
  ],
};

// ==================== ФУНКЦИИ РАСЧЁТА ====================

// Функция расчёта цены с учётом подписки
export function calculatePrice(
  basePrice: number, 
  subscription: 'none' | 'spark' | 'start' | 'pro' | 'elite'
): number {
  const discount = SUBSCRIPTION_DISCOUNTS[subscription] || 0;
  return Math.round(basePrice * (1 - discount));
}

// Функция расчёта цены баннера с учётом подписки и периода
export function calculateBannerPrice(
  bannerType: keyof typeof BANNER_PRICES,
  days: 1 | 3 | 7 | 14 | 30 | 90,
  subscription: 'none' | 'spark' | 'start' | 'pro' | 'elite'
): number {
  const basePrice = BANNER_PRICES[bannerType];
  const basePricePerDay = basePrice / 7; // базовая цена за 7 дней
  
  let priceForPeriod: number;
  if (days === 1) {
    priceForPeriod = basePricePerDay * 1.2; // +20% за 1 день
  } else {
    priceForPeriod = (basePricePerDay * days) * (1 - (BANNER_PERIOD_DISCOUNTS[days] || 0));
  }
  
  const subscriptionDiscount = SUBSCRIPTION_DISCOUNTS[subscription] || 0;
  return Math.round(priceForPeriod * (1 - subscriptionDiscount));
}