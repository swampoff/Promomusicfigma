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
  source?: 'promo_artist' | 'yandex_afisha';
  yandexUrl?: string;
  contentRating?: string;
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
  updatedAt: string;
}

export interface SearchResults {
  artists: LandingArtist[];
  tracks: LandingTrack[];
}

// ============================================
// API FUNCTIONS
// ============================================

/** Популярные артисты (отсортированы по monthly listeners) */
export const getPopularArtists = () =>
  fetchLanding<PopularArtistEntry[]>('/popular-artists', { cacheTtl: 120_000 });

/** Профиль артиста по ID или slug */
export const getArtist = (idOrSlug: string) =>
  fetchLanding<LandingArtist>(`/artists/${encodeURIComponent(idOrSlug)}`);

/** Все артисты с фильтрацией */
export const getArtists = (params?: { genre?: string; search?: string; limit?: number }) => {
  const searchParams = new URLSearchParams();
  if (params?.genre) searchParams.set('genre', params.genre);
  if (params?.search) searchParams.set('search', params.search);
  if (params?.limit) searchParams.set('limit', String(params.limit));
  const qs = searchParams.toString();
  return fetchLanding<LandingArtist[]>(`/artists${qs ? `?${qs}` : ''}`);
};

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
  fetchLanding<LandingTrack[]>(`/tracks/by-genre/${encodeURIComponent(genre)}?limit=${limit}`);

/** Публичные новости */
export const getNews = (params?: { limit?: number; tag?: string }) => {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.tag) searchParams.set('tag', params.tag);
  const qs = searchParams.toString();
  return fetchLanding<LandingNews[]>(`/news${qs ? `?${qs}` : ''}`);
};

/** Одна новость */
export const getNewsItem = (id: string) =>
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

/** Очистить кэш (для принудительного обновления) */
export function clearLandingCache() {
  cache.clear();
}

// ============================================
// BEATS MARKETPLACE
// ============================================

export interface MarketplaceBeat {
  id: string;
  title: string;
  producer: string;
  producerId?: string;
  bpm: number;
  key: string;
  genre: string;
  tags: string[];
  duration: string;
  price: number;
  plays: number;
  purchases: number;
  rating: number;
  status: string;
  coverUrl?: string;
  licenseTypes?: {
    basic: number;
    premium: number;
    exclusive: number;
  };
  createdAt: string;
}

/** Каталог битов */
export const getBeats = (params?: { genre?: string; sort?: string; limit?: number }) => {
  const searchParams = new URLSearchParams();
  if (params?.genre) searchParams.set('genre', params.genre);
  if (params?.sort) searchParams.set('sort', params.sort);
  if (params?.limit) searchParams.set('limit', String(params.limit));
  const qs = searchParams.toString();
  return fetchLanding<MarketplaceBeat[]>(`/beats${qs ? `?${qs}` : ''}`);
};

// ============================================
// PRODUCER SERVICES
// ============================================

export interface ProducerService {
  id: string;
  type: string;
  title: string;
  description?: string;
  producer: string;
  producerId: string;
  basePrice: number;
  minPrice?: number;
  maxPrice?: number;
  deliveryDays: number;
  revisions: number;
  rating: number;
  orders: number;
  status: string;
  coverImageUrl?: string;
  includes?: string[];
  requirements?: string;
  technicalSpecs?: {
    inputFormats?: string[];
    outputFormats?: string[];
    sampleRate?: string;
    bitDepth?: string;
    deliveryMethod?: string;
  };
  createdAt: string;
}

/** Каталог услуг продюсеров */
export const getProducerServices = (params?: { type?: string; limit?: number }) => {
  const searchParams = new URLSearchParams();
  if (params?.type) searchParams.set('type', params.type);
  if (params?.limit) searchParams.set('limit', String(params.limit));
  const qs = searchParams.toString();
  return fetchLanding<ProducerService[]>(`/producer-services${qs ? `?${qs}` : ''}`);
};

// ============================================
// PORTFOLIO BEFORE/AFTER
// ============================================

export interface PortfolioItem {
  id: string;
  title: string;
  artist: string;
  type: string;
  year: string;
  description: string;
  producerId: string;
  producerName?: string;
  beforeAudioUrl?: string;
  afterAudioUrl?: string;
  beforeAfterDescription?: string;
  coverImageUrl?: string;
}

/** Портфолио до/после */
export const getPortfolio = () =>
  fetchLanding<PortfolioItem[]>('/portfolio', { cacheTtl: 120_000 });

// ============================================
// PRODUCER PROFILES
// ============================================

export interface ProducerProfile {
  id: string;
  userId: string;
  producerName: string;
  bio: string;
  bioShort?: string;
  profilePictureUrl?: string;
  coverImageUrl?: string;
  videoPresentationUrl?: string;
  specializations: string[];
  genres: string[];
  city?: string;
  country?: string;
  averageRating: number;
  reviewCount: number;
  experienceYears?: number;
  languages?: string[];
  education?: string;
  certifications?: string[];
  softwareUsed?: string[];
  hardwareUsed?: string[];
  awardsAchievements?: string[];
  notableClients?: string[];
  availability?: string;
  deliveryTimeDays?: number;
  hourlyRate?: number;
  workPhilosophy?: string;
  responseTimeHours?: number;
  acceptsRushOrders?: boolean;
  rushOrderSurchargePercent?: number;
  totalServices?: number;
  totalOrders?: number;
  totalEarnings?: number;
  createdAt: string;
}

/** Получить профиль продюсера/инженера */
export const getProducerProfile = (id: string) =>
  fetchLanding<ProducerProfile>(`/producer-profile/${id}`, { cacheTtl: 120_000 });

/** Список всех продюсеров/инженеров */
export const getProducerProfiles = (params?: { specialization?: string; limit?: number }) => {
  const searchParams = new URLSearchParams();
  if (params?.specialization) searchParams.set('specialization', params.specialization);
  if (params?.limit) searchParams.set('limit', String(params.limit));
  const qs = searchParams.toString();
  return fetchLanding<ProducerProfile[]>(`/producer-profiles${qs ? `?${qs}` : ''}`);
};

// ============================================
// PRODUCER REVIEWS
// ============================================

export interface ProducerReview {
  id: string;
  producerId: string;
  reviewerName: string;
  reviewerEmail?: string;
  serviceType: string;
  rating: number;
  reviewText: string;
  qualityScore?: number;
  communicationScore?: number;
  timelinessScore?: number;
  wouldRecommend: boolean;
  createdAt: string;
}

/** Отзывы о продюсере/инженере */
export const getProducerReviews = (producerId: string) =>
  fetchLanding<ProducerReview[]>(`/producer-reviews/${producerId}`, { cacheTtl: 120_000 });

// ============================================
// PRODUCER ORDERS
// ============================================

export interface ProducerOrder {
  id: string;
  producerId: string;
  producerUserId: string;
  client: string;
  clientId: string | null;
  serviceType: string;
  serviceTitle: string;
  price: number;
  status: 'pending' | 'in_progress' | 'review' | 'revision' | 'completed' | 'cancelled';
  progress: number;
  deadline: string;
  completedAt?: string;
  createdAt: string;
  notes?: string;
}

/** Заказы продюсера */
export const getProducerOrders = (producerId: string, params?: { status?: string }) => {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set('status', params.status);
  const qs = searchParams.toString();
  return fetchLanding<ProducerOrder[]>(`/producer-orders/${producerId}${qs ? `?${qs}` : ''}`, { cacheTtl: 30_000 });
};

// ============================================
// PRODUCER WALLET
// ============================================

export interface WalletTransaction {
  id: string;
  type: 'income' | 'commission' | 'payout';
  amount: number;
  description: string;
  orderId?: string;
  date: string;
  status: 'pending' | 'confirmed' | 'completed';
}

export interface PayoutMethod {
  id: string;
  type: string;
  label: string;
  isDefault: boolean;
}

export interface ProducerWallet {
  producerId: string;
  balance: number;
  pendingPayout: number;
  totalEarned: number;
  monthlyEarnings: number;
  commissionRate: number;
  lastPayout: { amount: number; date: string; method: string };
  payoutMethods: PayoutMethod[];
  transactions: WalletTransaction[];
  updatedAt: string;
}

/** Кошелёк продюсера */
export const getProducerWallet = (producerId: string) =>
  fetchLanding<ProducerWallet>(`/producer-wallet/${producerId}`, { cacheTtl: 30_000 });