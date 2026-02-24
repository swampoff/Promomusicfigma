/**
 * ARTISTS BANNERS - Баннеры страниц «Для артистов»
 * Музыканты, DJs, Продюсеры, Звукоинженеры
 * Источник: Unsplash
 */

import type { BannerConfig } from './types';

// ── Unsplash-ассеты (заменяют Figma) ──
const forArtistsImage = 'https://images.unsplash.com/photo-1578385215219-086ac81983c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMHByb21vdGlvbiUyMGFydGlzdCUyMGNvbmNlcnQlMjBzdGFnZXxlbnwxfHx8fDE3NzE3ODU1NTd8MA&ixlib=rb-4.1.0&q=80&w=1080';
export { forArtistsImage };

export const forProducersImage = 'https://images.unsplash.com/photo-1757612550685-d15d473f2e85?w=1200&q=80';
export const forEngineersImage = 'https://images.unsplash.com/photo-1624252447862-6c904f09286a?w=1200&q=80';

// ── Привязка к маршрутам ──
// Баннеры /for-artists, /for-djs, /for-producers, /for-engineers вынесены в hero-секции соответствующих страниц
export const artistsBanners: Record<string, BannerConfig> = {};