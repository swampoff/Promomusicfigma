/**
 * PRODUCT BANNERS - Баннеры продуктовых страниц
 * Promo.air, Promo.lab, Promo.guide
 * Источник: Figma-дизайн
 */

import type { BannerConfig } from './types';

// ── Оригинальные баннеры разделов ──
const promoAirImage = '/banners/promo-air.png';
const promoLabImage = '/banners/promo-lab.png';
const promoGuideImage = '/banners/promo-guide.png';

// ── Экспорт отдельных изображений для прямого импорта ──
export { promoAirImage, promoLabImage, promoGuideImage };

// ── Привязка к маршрутам ──
export const productBanners: Record<string, BannerConfig> = {
  '/promo-air': {
    image: promoAirImage,
    title: 'Promo.air',
    accent: '- аудиобрендирование',
    description: 'Единое радио для заведений с легальной музыкой',
    gradient: 'from-cyan-600/80 via-black/60 to-transparent',
    fullImage: true,
  },
  '/promo-lab': {
    image: promoLabImage,
    title: 'Promo.lab',
    accent: '- тест трека',
    description: 'Эксперты оценят ваш трек перед релизом',
    gradient: 'from-pink-600/80 via-black/60 to-transparent',
    fullImage: true,
  },
  '/promo-guide': {
    image: promoGuideImage,
    title: 'Promo.guide',
    accent: '- Shazam наоборот',
    description: 'Узнайте, какая музыка играет в вашем любимом месте',
    gradient: 'from-indigo-600/80 via-black/60 to-transparent',
    fullImage: true,
  },
};