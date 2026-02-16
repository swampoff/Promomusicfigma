/**
 * LANDING DATA API CLIENT
 * Фронтенд-клиент для получения публичных данных лендинга с сервера
 * Артисты, чарты, треки, новости, концерты
 */

import { projectId, publicAnonKey } from '@/utils/supabase/info';
import { waitForServer } from './server-warmup';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-84730125/api/landing-data`;

// Cache для предотвращения лишних запросов
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 60_000; // 1 минута

async function fetchLanding<T>(
  endpoint: string,
  options?: { cacheTtl?: number; signal?: AbortSignal }
): Promise<{ success: boolean; data?: T; error?: string }> {
  const cacheKey = endpoint;
  const ttl = options?.cacheTtl ?? CACHE_TTL;

  // Check cache
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return { success: true, data: cached.data };
  }

  // Wait for server to be ready before first real fetch
  await waitForServer();

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      },
      signal: options?.signal,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: response.statusText }));
      console.error(`Landing API error [${endpoint}]:`, err);
      return { success: false, error: err.error || `HTTP ${response.status}` };
    }

    const result = await response.json();

    // Cache successful responses
    if (result.success && result.data) {
      cache.set(cacheKey, { data: result.data, timestamp: Date.now() });
    }

    return result;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return { success: false, error: 'Request aborted' };
    }
    console.error(`Landing API network error [${endpoint}]:`, error);
    return { success: false, error: String(error) };
  }
}

// ============================================
// TYPES
// ============================================

export interface LandingArtist {
  id: string;
  name: string;
  slug: string;
  genre: string;
  city: string;
  bio: string;
  avatar: string;
  coverImage: string;
  subscribers: number;
  monthlyListeners: number;
  totalPlays: number;
  isVerified: boolean;
  socialLinks: Record<string, string>;
  accentColor: string;
  tracks?: LandingTrack[];
}

export interface PopularArtistEntry {
  position: number;
  artistId: string;
  name: string;
  genre: string;
  avatar: string;
  monthlyListeners: number;
  isVerified: boolean;
}

export interface LandingTrack {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  genre: string;
  cover: string;
  duration: string;
  plays: number;
  likes: number;
  downloads: number;
  status: string;
  releaseDate: string;
  createdAt: string;
}

export interface ChartEntry {
  position: number;
  previousPosition: number;
  trackId: string;
  title: string;
  artist: string;
  artistId: string;
  genre: string;
  plays: number;
  likes: number;
  cover: string;
  duration: string;
  weeksOnChart: number;
}

export interface WeeklyChart {
  id: string;
  title: string;
  period: string;
  updatedAt: string;
  entries: ChartEntry[];
}

export interface LandingNews {
  id: string;
  title: string;
  tag: string;
  artistId: string;
  artistName: string;
  artistAvatar: string;
  coverImage: string;
  excerpt: string;
  content: string;
  views: number;
  likes: number;
  publishedAt: string;
  status: string;
}

export interface LandingConcert {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  artistAvatar: string;
  venue: string;
  city: string;
  date: string;
  time: string;
  capacity: number;
  ticketsSold: number;
  ticketPriceFrom: string;
  ticketPriceTo: string;
  status: string;
  views: number;
  coverImage: string;
  description: string;
  source?: 'promo_artist' | 'generated';
  genre?: string;
}

export interface RadioPartner {
  id: string;
  stationName: string;
  description: string;
  frequency: string;
  city: string;
  country: string;
  formats: string[];
  audienceSize: number;
  logoUrl: string;
  isOnline: boolean;
  createdAt: string;
}

export interface PlatformStats {
  totalArtists: number;
  totalTracks: number;
  totalPlays: number;
  totalSubscribers: number;
}

export interface SearchResults {
  artists: LandingArtist[];
  tracks: LandingTrack[];
}

export interface MarketplaceBeat {
  id: string;
  title: string;
  producerName: string;
  producerId: string;
  genre: string;
  bpm: number;
  key: string;
  price: number;
  plays: number;
  rating: number;
  coverImage: string;
  previewUrl: string;
  status: string;
  createdAt: string;
}

export interface ProducerService {
  id: string;
  title: string;
  type: string;
  producerName: string;
  producerId: string;
  description: string;
  price: number;
  deliveryDays: number;
  rating: number;
  orders: number;
  coverImage: string;
  status: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  producerName: string;
  beforeUrl: string;
  afterUrl: string;
  description: string;
  genre: string;
}

export interface ProducerProfile {
  id: string;
  name: string;
  avatar: string;
  specializations: string[];
  bio: string;
  averageRating: number;
  totalOrders: number;
  city: string;
  equipment: string[];
  portfolio: string[];
}

export interface ProducerReview {
  id: string;
  producerId: string;
  clientName: string;
  clientAvatar: string;
  rating: number;
  text: string;
  serviceName: string;
  createdAt: string;
}

export interface ProducerOrder {
  id: string;
  producerId: string;
  clientName: string;
  clientAvatar: string;
  serviceName: string;
  serviceType: string;
  status: 'pending' | 'in_progress' | 'review' | 'revision' | 'completed' | 'cancelled';
  price: number;
  deadline: string;
  description: string;
  createdAt: string;
  completedAt?: string;
}

export interface WalletTransaction {
  id: string;
  type: 'income' | 'withdrawal' | 'refund' | 'fee';
  amount: number;
  description: string;
  orderId?: string;
  status: 'completed' | 'pending' | 'failed';
  createdAt: string;
}

export interface PayoutMethod {
  id: string;
  type: 'card' | 'bank' | 'paypal' | 'crypto';
  details: string;
  isDefault: boolean;
}

export interface ProducerWallet {
  producerId: string;
  balance: number;
  totalEarned: number;
  pendingAmount: number;
  transactions: WalletTransaction[];
  payoutMethods: PayoutMethod[];
}

// ============================================
// API FUNCTIONS
// ============================================

/** Популярные артисты (отсортированы по monthly listeners) */
export const getPopularArtists = () =>
  fetchLanding<PopularArtistEntry[]>('/popular-artists');

/** Все артисты (каталог) */
export const getArtists = (params?: { genre?: string; search?: string; limit?: number }) => {
  const searchParams = new URLSearchParams();
  if (params?.genre) searchParams.set('genre', params.genre);
  if (params?.search) searchParams.set('search', params.search);
  if (params?.limit) searchParams.set('limit', String(params.limit));
  const qs = searchParams.toString();
  return fetchLanding<LandingArtist[]>(`/artists${qs ? `?${qs}` : ''}`);
};

/** Профиль артиста по ID или slug */
export const getArtistProfile = (idOrSlug: string) =>
  fetchLanding<LandingArtist>(`/artists/${idOrSlug}`, { cacheTtl: 120_000 });

/** Алиас для getArtistProfile (обратная совместимость) */
export const getArtist = getArtistProfile;

/** Еженедельный чарт TOP 20 */
export const getWeeklyChart = () =>
  fetchLanding<WeeklyChart>('/charts/weekly', { cacheTtl: 300_000 });

/** Новые треки */
export const getNewTracks = (limit = 10) =>
  fetchLanding<LandingTrack[]>(`/tracks/new?limit=${limit}`);

/** Трендовые треки */
export const getTrendingTracks = (limit = 10) =>
  fetchLanding<LandingTrack[]>(`/tracks/trending?limit=${limit}`);

/** Треки по жанру */
export const getTracksByGenre = (genre: string, limit = 20) =>
  fetchLanding<LandingTrack[]>(`/tracks/by-genre/${genre}?limit=${limit}`);

/** Публичные новости */
export const getNews = (params?: { limit?: number; tag?: string }) => {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.tag) searchParams.set('tag', params.tag);
  const qs = searchParams.toString();
  return fetchLanding<LandingNews[]>(`/news${qs ? `?${qs}` : ''}`);
};

/** Одна новость */
export const getNewsById = (id: string) =>
  fetchLanding<LandingNews>(`/news/${id}`);

/** Предстоящие концерты */
export const getConcerts = (params?: { limit?: number; city?: string }) => {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.city) searchParams.set('city', params.city);
  const qs = searchParams.toString();
  return fetchLanding<LandingConcert[]>(`/concerts${qs ? `?${qs}` : ''}`);
};

/** Радиостанции-партнёры */
export const getRadioPartners = () =>
  fetchLanding<RadioPartner[]>('/radio-partners', { cacheTtl: 300_000 });

/** Статистика платформы */
export const getPlatformStats = () =>
  fetchLanding<PlatformStats>('/stats', { cacheTtl: 300_000 });

/** Жанры */
export const getGenres = () =>
  fetchLanding<Record<string, number>>('/genres', { cacheTtl: 300_000 });

/** Поиск */
export const search = (query: string) =>
  fetchLanding<SearchResults>(`/search?q=${encodeURIComponent(query)}`);

/** Биты (маркетплейс) */
export const getBeats = (params?: { limit?: number; genre?: string; sort?: string }) => {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.genre) searchParams.set('genre', params.genre);
  if (params?.sort) searchParams.set('sort', params.sort);
  const qs = searchParams.toString();
  return fetchLanding<MarketplaceBeat[]>(`/beats${qs ? `?${qs}` : ''}`);
};

/** Услуги продюсеров */
export const getProducerServices = (params?: { limit?: number; type?: string }) => {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.type) searchParams.set('type', params.type);
  const qs = searchParams.toString();
  return fetchLanding<ProducerService[]>(`/producer-services${qs ? `?${qs}` : ''}`);
};

/** Портфолио (до/после) */
export const getPortfolio = () =>
  fetchLanding<PortfolioItem[]>('/portfolio');

/** Профили продюсеров */
export const getProducerProfiles = (params?: { limit?: number; specialization?: string }) => {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.specialization) searchParams.set('specialization', params.specialization);
  const qs = searchParams.toString();
  return fetchLanding<ProducerProfile[]>(`/producer-profiles${qs ? `?${qs}` : ''}`);
};

/** Профиль продюсера */
export const getProducerProfile = (id: string) =>
  fetchLanding<ProducerProfile>(`/producer-profile/${id}`);

/** Отзывы о продюсере */
export const getProducerReviews = (producerId: string) =>
  fetchLanding<ProducerReview[]>(`/producer-reviews/${producerId}`);

/** Заказы продюсера */
export const getProducerOrders = (producerId: string, params?: { status?: string }) => {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set('status', params.status);
  const qs = searchParams.toString();
  return fetchLanding<ProducerOrder[]>(`/producer-orders/${producerId}${qs ? `?${qs}` : ''}`);
};

/** Кошелёк продюсера */
export const getProducerWallet = (producerId: string) =>
  fetchLanding<ProducerWallet>(`/producer-wallet/${producerId}`);