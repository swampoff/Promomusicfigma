/**
 * PRODUCT BANNERS - Баннеры продуктовых страниц
 * Promo.air, Promo.lab, Promo.guide
 * Источник: Figma-дизайн
 */

import type { BannerConfig } from './types';

// ── Unsplash-ассеты продуктов (заменяют Figma) ──
const promoAirImage = 'https://images.unsplash.com/photo-1767474833531-c1be2788064a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyYWRpbyUyMGJyb2FkY2FzdCUyMHN0dWRpbyUyMGVxdWlwbWVudHxlbnwxfHx8fDE3NzE3ODU1NTZ8MA&ixlib=rb-4.1.0&q=80&w=1080';
const promoLabImage = 'https://images.unsplash.com/photo-1552174588-6733961c358e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMHN0dWRpbyUyMHJlY29yZGluZyUyMG1pY3JvcGhvbmUlMjBkYXJrfGVufDF8fHx8MTc3MTc4NTU1OHww&ixlib=rb-4.1.0&q=80&w=1080';
const promoGuideImage = 'https://images.unsplash.com/photo-1759771963975-8a4885446f1f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb3VuZCUyMHdhdmUlMjBhdWRpbyUyMHRlY2hub2xvZ3klMjBkYXJrfGVufDF8fHx8MTc3MTc4NTU1OHww&ixlib=rb-4.1.0&q=80&w=1080';

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