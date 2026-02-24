/**
 * CONTENT BANNERS - Баннеры контентных страниц
 * Концерты, Чарты, Новости, Каталог DJs
 * Источник: Unsplash
 */

import type { BannerConfig } from './types';

// ── Unsplash-ассеты контента (заменяют Figma) ──
const concertsImage = 'https://images.unsplash.com/photo-1619973226698-b77a5b5dd14b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25jZXJ0JTIwY3Jvd2QlMjBsaXZlJTIwcGVyZm9ybWFuY2V8ZW58MXx8fHwxNzcxNzg1NTU3fDA&ixlib=rb-4.1.0&q=80&w=1080';
const chartsImage = 'https://images.unsplash.com/photo-1557173135-7336e73d53d3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGNoYXJ0cyUyMHN0cmVhbWluZyUyMGhlYWRwaG9uZXN8ZW58MXx8fHwxNzcxNzg1NTU3fDA&ixlib=rb-4.1.0&q=80&w=1080';
const newsImage = 'https://images.unsplash.com/photo-1760302356446-5d12faf18029?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZXdzJTIwbXVzaWMlMjBpbmR1c3RyeSUyMG1hZ2F6aW5lfGVufDF8fHx8MTc3MTc4NTU1OHww&ixlib=rb-4.1.0&q=80&w=1080';

// ── Unsplash-ассеты ──
export const djCatalogImage = 'https://images.unsplash.com/photo-1764510383709-14be6ec28548?w=1200&q=80';

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