/**
 * PRODUCT BANNERS - Баннеры продуктовых страниц
 * Promo.air, Promo.lab, Promo.guide
 * Источник: Figma-дизайн
 */

import type { BannerConfig } from './types';

// ── Figma-ассеты продуктов ──
import promoAirImage from "figma:asset/cfe42fd2a3ee537de86c58cb16e8cc5f2cb0ac63.png";
import promoLabImage from "figma:asset/ceecd0e5a020ec7c970930102c62b3027c2da4bb.png";
import promoGuideImage from "figma:asset/2f8f4b1dc7217a125294e76c78441a874b7152c8.png";

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
