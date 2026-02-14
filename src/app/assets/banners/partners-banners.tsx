/**
 * PARTNERS BANNERS - Баннеры страниц «Для партнёров»
 * Радиостанции, Телеканалы, Лейблы, СМИ, Блогеры
 * Источник: Unsplash
 */

import type { BannerConfig } from './types';

// ── Изображения ──
export const forBusinessImage = 'https://images.unsplash.com/photo-1713281318623-eb73e86e23c2?w=1200&q=80';
export const forTvImage = 'https://images.unsplash.com/photo-1671575584088-03eb2811c30f?w=1200&q=80';
export const forLabelsImage = 'https://images.unsplash.com/photo-1748781208325-18107f54fa57?w=1200&q=80';
export const forMediaImage = 'https://images.unsplash.com/photo-1709377583121-576ad11b3849?w=1200&q=80';
export const forBloggersImage = 'https://images.unsplash.com/photo-1758273239210-59fea02475eb?w=1200&q=80';

// ── Привязка к маршрутам ──
// Баннер /for-business вынесен в hero-секцию ForBusinessPage (Figma-ассет)
export const partnersBanners: Record<string, BannerConfig> = {
  '/for-tv': {
    image: forTvImage,
    title: 'Для',
    accent: 'телеканалов',
    description: 'Музыкальный контент для эфира и программ',
    gradient: 'from-cyan-600/80 via-black/60 to-transparent',
  },
  '/for-labels': {
    image: forLabelsImage,
    title: 'Для',
    accent: 'лейблов',
    description: 'Управление ростером и продвижение каталога',
    gradient: 'from-amber-600/80 via-black/60 to-transparent',
  },
  '/for-media': {
    image: forMediaImage,
    title: 'Для',
    accent: 'СМИ',
    description: 'Пресс-материалы и эксклюзивный контент',
    gradient: 'from-rose-600/80 via-black/60 to-transparent',
  },
  '/for-bloggers': {
    image: forBloggersImage,
    title: 'Для',
    accent: 'блогеров',
    description: 'Музыка для контента и коллаборации с артистами',
    gradient: 'from-fuchsia-600/80 via-black/60 to-transparent',
  },
};