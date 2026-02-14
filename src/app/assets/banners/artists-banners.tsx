/**
 * ARTISTS BANNERS - Баннеры страниц «Для артистов»
 * Музыканты, DJs, Продюсеры, Звукоинженеры
 * Источник: Figma (артисты) + Unsplash (остальные)
 */

import type { BannerConfig } from './types';

// ── Изображения ──
/** Для артистов - Figma-ассет (жёсткая привязка) */
import forArtistsImage from 'figma:asset/e4fa1284c96a6f61fa83f01509505121b27c0ac0.png';
export { forArtistsImage };

export const forProducersImage = 'https://images.unsplash.com/photo-1757612550685-d15d473f2e85?w=1200&q=80';
export const forEngineersImage = 'https://images.unsplash.com/photo-1624252447862-6c904f09286a?w=1200&q=80';

// ── Привязка к маршрутам ──
// Баннеры /for-artists, /for-djs, /for-producers, /for-engineers вынесены в hero-секции соответствующих страниц
export const artistsBanners: Record<string, BannerConfig> = {};