/**
 * PRODUCT BANNERS - Баннеры продуктовых страниц
 * Promo.air, Promo.lab, Promo.guide + SEO подстраницы
 * Источник: Figma-дизайн
 */

import type { BannerConfig } from './types';

// ── Оригинальные баннеры разделов ──
const promoAirImage = '/banners/branding/promo_air.png';
const promoLabImage = '/banners/branding/promo_lab.png';
const promoGuideImage = '/banners/branding/promo_guide.png';

// ── SEO-подстраницы Promo.Air ──
const audioBrandingImage = '/banners/audiobranding.jpg';
const musicForRestaurantsImage = '/banners/music-for-restaurants.jpg';
const radioAdvertisingImage = '/banners/radio-advertising.jpg';

// ── Экспорт отдельных изображений для прямого импорта ──
export { promoAirImage, promoLabImage, promoGuideImage, audioBrandingImage, musicForRestaurantsImage, radioAdvertisingImage };

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
    description: 'Узнайте, какая музыка игрстет в вашем любимом месте',
    gradient: 'from-indigo-600/80 via-black/60 to-transparent',
    fullImage: true,
  },
  '/audiobranding': {
    image: audioBrandingImage,
    title: 'Аудиобрендинг',
    accent: '- для бизнеса',
    description: 'Фирменный звук бренда: джинглы, аудиологотип, звуковая идентичность',
    gradient: 'from-[#FF577F]/80 via-black/60 to-transparent',
    fullImage: true,
  },
  '/music-for-restaurants': {
    image: musicForRestaurantsImage,
    title: 'Музыка для ресторанов',
    accent: '- легально',
    description: 'Фоновая музыка для ресторанов, кафе, баров без РАО',
    gradient: 'from-emerald-600/80 via-black/60 to-transparent',
    fullImage: true,
  },
  '/radio-advertising': {
    image: radioAdvertisingImage,
    title: 'Радиореклама',
    accent: '- полный цикл',
    description: 'Создание рекламных роликов для радио: сценарий, озвучка, продакшн',
    gradient: 'from-cyan-600/80 via-black/60 to-transparent',
    fullImage: true,
  },
};
