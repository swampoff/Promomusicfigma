/**
 * CONTENT BANNERS - Баннеры контентных страниц
 * Концерты, Чарты, Новости, Каталог DJs
 * Источник: Unsplash
 */

import type { BannerConfig } from './types';

// ── Оригинальные баннеры разделов ──
const concertsImage = '/banners/concerts.png';
const chartsImage = '/banners/charts.png';
const newsImage = '/banners/news.png';

// ── Unsplash-ассеты ──
export const djCatalogImage = '/banners/for-djs.png';

// ── Экспорт отдельных изображений для прямого импорта ──
export { concertsImage, chartsImage, newsImage };

// ── Привязка к маршрутам ──
export const contentBanners: Record<string, BannerConfig> = {
  '/concerts': {
    image: concertsImage,
    title: 'Афиша',
    accent: 'концертов',
    description: 'Лучшие музыкальные события в вашем городе',
    gradient: 'from-orange-500/80 via-black/60 to-transparent',
    fullImage: true,
  },
  '/charts': {
    image: chartsImage,
    title: 'Музыкальные',
    accent: 'чарты',
    description: 'Рейтинги самых популярных треков и артистов',
    gradient: 'from-purple-600/80 via-black/60 to-transparent',
    fullImage: true,
  },
  '/news': {
    image: newsImage,
    title: 'Музыкальные',
    accent: 'новости',
    description: 'Главные события индустрии и релизы',
    gradient: 'from-blue-600/80 via-black/60 to-transparent',
    fullImage: true,
  },
  '/djs': {
    image: djCatalogImage,
    title: 'Каталог',
    accent: 'DJs',
    description: 'Найдите диджея для вашего мероприятия',
    gradient: 'from-violet-600/80 via-black/60 to-transparent',
  },
};