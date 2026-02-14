/**
 * CONTENT BANNERS - Баннеры контентных страниц
 * Концерты, Чарты, Новости
 * Источник: Figma-дизайн
 */

import type { BannerConfig } from './types';

// ── Figma-ассеты контента ──
import concertsImage from "figma:asset/bb62fb02deb508e9a701caff0b2199cf4e00ad4a.png";
import chartsImage from "figma:asset/d44ed2af26df81c36f406412441f2c272aa378a0.png";
import newsImage from "figma:asset/b2538c870893a6984e9fa9e7ffb86c045dc60e58.png";

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
};
