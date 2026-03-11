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

export const catalogPlaylists: CatalogPlaylist[] = [
  { id: 1, name: 'Top Hits 2026', followers: 125000, acceptance: 45, coins: 150, curator: 'MusicFlow', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800' },
  { id: 2, name: 'Indie Vibes', followers: 87000, acceptance: 62, coins: 120, curator: 'IndieStation', image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800' },
  { id: 3, name: 'Electronic Dreams', followers: 210000, acceptance: 28, coins: 250, curator: 'ElectroHub', image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800' },
  { id: 4, name: 'Chill Lounge', followers: 156000, acceptance: 71, coins: 100, curator: 'ChillBeats', image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800' },
];

export const catalogStations: CatalogStation[] = [
  { id: 1, name: 'Energy FM', listeners: 450000, genre: 'Dance/Electronic', coins: 300, slots: 12, image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800' },
  { id: 2, name: 'Rock Nation', listeners: 320000, genre: 'Rock/Alternative', coins: 250, slots: 8, image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800' },
  { id: 3, name: 'Chill Waves', listeners: 280000, genre: 'Chill/Lounge', coins: 200, slots: 15, image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800' },
  { id: 4, name: 'Hip-Hop Central', listeners: 590000, genre: 'Hip-Hop/Rap', coins: 350, slots: 5, image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800' },
];

export const catalogInfluencers: CatalogInfluencer[] = [
  { id: 1, name: 'DJ MaxFlow', followers: 856000, platform: 'Instagram + YouTube', engagement: 8.5, coins: 500, category: 'Electronic/Dance', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800' },
  { id: 2, name: 'MusicReview Pro', followers: 620000, platform: 'YouTube', engagement: 12.3, coins: 400, category: 'Reviews', image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800' },
  { id: 3, name: 'IndieDiscovery', followers: 425000, platform: 'TikTok', engagement: 15.8, coins: 350, category: 'Indie', image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800' },
  { id: 4, name: 'BeatsDaily', followers: 1200000, platform: 'TikTok', engagement: 9.7, coins: 600, category: 'Hip-Hop', image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800' },
];

export const catalogMediaOutlets: CatalogMediaOutlet[] = [
  { id: 1, name: 'Music Today', readers: 520000, type: 'Онлайн-журнал', coins: 250, reach: 'Международный', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800' },
  { id: 2, name: 'Beat Magazine', readers: 350000, type: 'Печатный + Digital', coins: 300, reach: 'Национальный', image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800' },
  { id: 3, name: 'Indie Press', readers: 180000, type: 'Онлайн-платформа', coins: 180, reach: 'Специализированный', image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800' },
  { id: 4, name: 'Electronic Sound', readers: 420000, type: 'Онлайн + Podcast', coins: 280, reach: 'Международный', image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800' },
];
