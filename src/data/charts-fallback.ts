/**
 * Fallback metadata for chart sources (radio stations and streaming platforms)
 * Track data comes from API only — no demo/fake data.
 */

export interface FallbackChartTrack {
  id: string;
  position: number;
  previousPosition: number;
  title: string;
  artist: string;
  plays?: number;
  likes?: number;
  trend: 'up' | 'down' | 'same' | 'new';
  trendValue: number;
}

export interface FallbackChartSource {
  id: string;
  name: string;
  logo: string;
  type: 'radio' | 'streaming';
  gradient: string;
  borderColor: string;
  tracks: FallbackChartTrack[];
}

// No demo tracks — only real API data
export const promoFallbackTracks: FallbackChartTrack[] = [];

export const fallbackChartSources: Omit<FallbackChartSource, 'tracks'>[] = [
  {
    id: 'russkoe',
    name: 'Русское Радио',
    logo: '🇷🇺',
    type: 'radio',
    gradient: 'from-red-500/20 to-blue-500/20',
    borderColor: 'border-red-500/30',
  },
  {
    id: 'nashe',
    name: 'Наше Радио',
    logo: '🎸',
    type: 'radio',
    gradient: 'from-orange-500/20 to-red-500/20',
    borderColor: 'border-orange-500/30',
  },
  {
    id: 'dfm',
    name: 'DFM',
    logo: '🎧',
    type: 'radio',
    gradient: 'from-cyan-500/20 to-blue-500/20',
    borderColor: 'border-cyan-500/30',
  },
  {
    id: 'europa',
    name: 'Europa Plus',
    logo: '🌍',
    type: 'radio',
    gradient: 'from-yellow-500/20 to-orange-500/20',
    borderColor: 'border-yellow-500/30',
  },
  {
    id: 'yandex',
    name: 'Яндекс Музыка',
    logo: '🔴',
    type: 'streaming',
    gradient: 'from-red-600/20 to-yellow-600/20',
    borderColor: 'border-red-600/30',
  },
  {
    id: 'shazam',
    name: 'Shazam Россия',
    logo: '🤙',
    type: 'streaming',
    gradient: 'from-blue-500/20 to-cyan-500/20',
    borderColor: 'border-blue-500/30',
  },
];

// No fallback tracks — API data only
export const fallbackChartTracks: Record<string, FallbackChartTrack[]> = {};
