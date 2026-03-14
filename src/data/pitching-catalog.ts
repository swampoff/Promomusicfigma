/**
 * Каталог площадок для питчинга
 *
 * Справочные данные площадок доступных для продвижения.
 * Используются в PitchingPage как каталог для выбора.
 *
 * Последнее обновление: 2026-03-11
 */

export interface CatalogPlaylist {
  id: number;
  name: string;
  followers: number;
  acceptance: number;
  coins: number;
  curator: string;
  image: string;
}

export interface CatalogStation {
  id: number;
  name: string;
  listeners: number;
  genre: string;
  coins: number;
  slots: number;
  image: string;
}

export interface CatalogInfluencer {
  id: number;
  name: string;
  followers: number;
  platform: string;
  engagement: number;
  coins: number;
  category: string;
  image: string;
}

export interface CatalogMediaOutlet {
  id: number;
  name: string;
  readers: number;
  type: string;
  coins: number;
  reach: string;
  image: string;
}

export const catalogPlaylists: CatalogPlaylist[] = [];

export const catalogStations: CatalogStation[] = [];

export const catalogInfluencers: CatalogInfluencer[] = [];

export const catalogMediaOutlets: CatalogMediaOutlet[] = [];
