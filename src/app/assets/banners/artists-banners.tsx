/**
 * ARTISTS BANNERS - Баннеры страниц «Для артистов»
 * Музыканты, DJs, Продюсеры, Звукоинженеры
 * Источник: Unsplash
 */

import type { BannerConfig } from './types';

// ── Оригинальные баннеры разделов ──
const forArtistsImage = '/banners/artists.png';
export { forArtistsImage };

export const forProducersImage = '/banners/producers.png';
export const forEngineersImage = '/banners/engineers.png';

// ── Привязка к маршрутам ──
// Баннеры /for-artists, /for-djs, /for-producers, /for-engineers вынесены в hero-секции соответствующихстраниц
export const artistsBanners: Record<string, BannerConfig> = {};
