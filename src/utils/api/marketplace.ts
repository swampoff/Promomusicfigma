/**
 * MARKETPLACE API - Frontend клиент для маркетплейса битов и услуг
 * Endpoint: /api/marketplace
 */

import { projectId, publicAnonKey } from '@/utils/supabase/info';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/server/api/marketplace`;

async function apiFetch<T = any>(path: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
        ...(options?.headers || {}),
      },
    });
    const json = await res.json();
    if (!json.success) {
      console.error(`Marketplace API error (${path}):`, json.error);
      return null;
    }
    return json.data as T;
  } catch (err) {
    console.error(`Marketplace API network error (${path}):`, err);
    return null;
  }
}

async function apiFetchFull<T = any>(path: string, options?: RequestInit): Promise<{ data: T | null; pagination?: any }> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
        ...(options?.headers || {}),
      },
    });
    const json = await res.json();
    if (!json.success) {
      console.error(`Marketplace API error (${path}):`, json.error);
      return { data: null };
    }
    return { data: json.data as T, pagination: json.pagination };
  } catch (err) {
    console.error(`Marketplace API network error (${path}):`, err);
    return { data: null };
  }
}

// ═══════════════════════════════════════
// TYPES
// ═══════════════════════════════════════

export interface Beat {
  id: string;
  title: string;
  producer: string;
  producerId: string;
  genre: string;
  bpm: number;
  key: string;
  tags: string[];
  duration: string;
  price: number;
  plays: number;
  purchases: number;
  likes?: number;
  rating: number;
  status: 'active' | 'sold' | 'inactive';
  licenseTypes: {
    basic: number;
    premium: number;
    exclusive: number;
  };
  createdAt: string;
}

export interface ProducerServicePublic {
  id: string;
  type: string;
  title: string;
  description: string;
  producer: string;
  producerId: string;
  basePrice: number;
  minPrice?: number;
  maxPrice?: number;
  deliveryDays: number;
  revisions?: number;
  rating: number;
  orders: number;
  status: string;
  includes: string[];
  requirements?: string;
  technicalSpecs?: Record<string, any>;
  createdAt: string;
}

export interface BeatPurchase {
  id: string;
  beatId: string;
  beatTitle: string;
  producerId: string;
  producerName: string;
  buyerId: string;
  buyerName: string;
  licenseType: 'basic' | 'premium' | 'exclusive';
  price: number;
  commission: number;
  producerPayout: number;
  status: string;
  createdAt: string;
}

export interface ServiceOrder {
  id: string;
  serviceId: string;
  serviceTitle: string;
  serviceType: string;
  producerId: string;
  producerName: string;
  clientId: string;
  clientName: string;
  message: string;
  urgency: 'normal' | 'fast' | 'urgent';
  price: number;
  commission: number;
  producerPayout: number;
  status: 'pending' | 'accepted' | 'rejected' | 'in_progress' | 'revision' | 'completed' | 'reviewed';
  progress: number;
  deliveryDays: number;
  deadline: string | null;
  createdAt: string;
}

export interface BeatsStats {
  totalBeats: number;
  totalPlays: number;
  totalSold: number;
  activeProducers: number;
  avgRating: number;
  genres: string[];
}

export interface ServicesStats {
  totalServices: number;
  totalOrders: number;
  activeProducers: number;
  avgRating: number;
  serviceTypes: string[];
}

export interface Pagination {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

// ═══════════════════════════════════════
// BEATS API
// ═══════════════════════════════════════

export interface BeatsFilter {
  search?: string;
  genre?: string;
  key?: string;
  bpm_min?: number;
  bpm_max?: number;
  price_min?: number;
  price_max?: number;
  producerId?: string;
  sort?: 'new' | 'popular' | 'rating' | 'price_asc' | 'price_desc';
  limit?: number;
  offset?: number;
}

export async function fetchBeats(filters: BeatsFilter = {}): Promise<{ beats: Beat[]; pagination: Pagination | null }> {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.genre) params.set('genre', filters.genre);
  if (filters.key) params.set('key', filters.key);
  if (filters.bpm_min) params.set('bpm_min', String(filters.bpm_min));
  if (filters.bpm_max) params.set('bpm_max', String(filters.bpm_max));
  if (filters.price_min) params.set('price_min', String(filters.price_min));
  if (filters.price_max) params.set('price_max', String(filters.price_max));
  if (filters.producerId) params.set('producerId', filters.producerId);
  if (filters.sort) params.set('sort', filters.sort);
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.offset) params.set('offset', String(filters.offset));

  const qs = params.toString();
  const result = await apiFetchFull<Beat[]>(`/beats${qs ? `?${qs}` : ''}`);
  return { beats: result.data || [], pagination: result.pagination || null };
}

export async function fetchBeatById(id: string): Promise<Beat | null> {
  return apiFetch<Beat>(`/beats/${id}`);
}

export async function fetchBeatsStats(): Promise<BeatsStats | null> {
  return apiFetch<BeatsStats>('/beats/stats');
}

export async function purchaseBeat(beatId: string, buyerId: string, buyerName: string, licenseType: 'basic' | 'premium' | 'exclusive'): Promise<{ purchase: BeatPurchase; message: string } | null> {
  return apiFetch(`/beats/${beatId}/purchase`, {
    method: 'POST',
    body: JSON.stringify({ buyerId, buyerName, licenseType }),
  });
}

export async function toggleBeatFavorite(beatId: string, userId: string): Promise<{ added: boolean; favorites: string[] } | null> {
  return apiFetch(`/beats/${beatId}/favorite`, {
    method: 'POST',
    body: JSON.stringify({ userId }),
  });
}

export async function fetchBeatFavorites(userId: string): Promise<string[]> {
  const data = await apiFetch<string[]>(`/beats/favorites?userId=${userId}`);
  return data || [];
}

export async function fetchBeatPurchases(userId: string): Promise<BeatPurchase[]> {
  const data = await apiFetch<BeatPurchase[]>(`/beats/purchases?userId=${userId}`);
  return data || [];
}

export async function createBeat(beat: Partial<Beat>): Promise<Beat | null> {
  return apiFetch<Beat>('/beats', {
    method: 'POST',
    body: JSON.stringify(beat),
  });
}

export async function updateBeat(id: string, updates: Partial<Beat>): Promise<Beat | null> {
  return apiFetch<Beat>(`/beats/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function deleteBeat(id: string, producerId: string): Promise<boolean> {
  const result = await apiFetch(`/beats/${id}?producerId=${producerId}`, {
    method: 'DELETE',
  });
  return result !== null;
}

// ═══════════════════════════════════════
// SERVICES API
// ═══════════════════════════════════════

export interface ServicesFilter {
  search?: string;
  type?: string;
  price_min?: number;
  price_max?: number;
  producerId?: string;
  sort?: 'recommended' | 'popular' | 'rating' | 'price_asc' | 'price_desc';
  limit?: number;
  offset?: number;
}

export async function fetchServices(filters: ServicesFilter = {}): Promise<{ services: ProducerServicePublic[]; pagination: Pagination | null }> {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.type) params.set('type', filters.type);
  if (filters.price_min) params.set('price_min', String(filters.price_min));
  if (filters.price_max) params.set('price_max', String(filters.price_max));
  if (filters.producerId) params.set('producerId', filters.producerId);
  if (filters.sort) params.set('sort', filters.sort);
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.offset) params.set('offset', String(filters.offset));

  const qs = params.toString();
  const result = await apiFetchFull<ProducerServicePublic[]>(`/services${qs ? `?${qs}` : ''}`);
  return { services: result.data || [], pagination: result.pagination || null };
}

export async function fetchServiceById(id: string): Promise<ProducerServicePublic | null> {
  return apiFetch<ProducerServicePublic>(`/services/${id}`);
}

export async function fetchServicesStats(): Promise<ServicesStats | null> {
  return apiFetch<ServicesStats>('/services/stats');
}

export async function submitServiceOrder(
  serviceId: string,
  clientId: string,
  clientName: string,
  message: string,
  urgency: 'normal' | 'fast' | 'urgent' = 'normal',
  details?: string,
): Promise<{ order: ServiceOrder; message: string } | null> {
  return apiFetch(`/services/${serviceId}/order`, {
    method: 'POST',
    body: JSON.stringify({ clientId, clientName, message, urgency, details }),
  });
}

export async function fetchMyOrders(userId: string, role: 'client' | 'producer' = 'client'): Promise<ServiceOrder[]> {
  const data = await apiFetch<ServiceOrder[]>(`/orders?userId=${userId}&role=${role}`);
  return data || [];
}

export async function updateOrderStatus(
  orderId: string,
  producerId: string,
  status: string,
  progress?: number,
  message?: string,
): Promise<ServiceOrder | null> {
  return apiFetch<ServiceOrder>(`/orders/${orderId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ producerId, status, progress, message }),
  });
}

// ═══════════════════════════════════════
// BEAT REVIEWS API
// ═══════════════════════════════════════

export interface BeatReview {
  id: string;
  beatId: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  text: string;
  licenseType: string;
  helpful: number;
  helpfulUsers?: string[];
  createdAt: string;
}

export interface ReviewStats {
  total: number;
  avgRating: number;
  distribution: Record<number, number>;
}

export interface BeatReviewsResponse {
  reviews: BeatReview[];
  stats: ReviewStats;
}

export async function fetchBeatReviews(beatId: string, limit = 50, offset = 0): Promise<BeatReviewsResponse | null> {
  return apiFetch<BeatReviewsResponse>(`/beats/${beatId}/reviews?limit=${limit}&offset=${offset}`);
}

export async function submitBeatReview(
  beatId: string,
  userId: string,
  userName: string,
  rating: number,
  text: string,
  title?: string,
  licenseType?: string,
): Promise<{ review: BeatReview; newRating: number; totalReviews: number; message: string } | null> {
  return apiFetch(`/beats/${beatId}/review`, {
    method: 'POST',
    body: JSON.stringify({ userId, userName, rating, text, title, licenseType }),
  });
}

export async function toggleReviewHelpful(beatId: string, reviewId: string, userId: string): Promise<{ helpful: number; isHelpful: boolean } | null> {
  return apiFetch(`/beats/${beatId}/reviews/${reviewId}/helpful`, {
    method: 'POST',
    body: JSON.stringify({ userId }),
  });
}

// ═══════════════════════════════════════
// CONTRACTS / MILESTONES API
// ═══════════════════════════════════════

export interface Milestone {
  id: string;
  index: number;
  title: string;
  description: string;
  amount: number;
  dueDate: string | null;
  status: 'pending' | 'in_progress' | 'submitted' | 'approved' | 'revision';
  paidAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface ServiceContract {
  id: string;
  orderId: string;
  serviceTitle: string;
  producerId: string;
  producerName: string;
  clientId: string;
  clientName: string;
  totalAmount: number;
  paidAmount: number;
  status: 'active' | 'completed' | 'cancelled';
  milestones: Milestone[];
  createdAt: string;
  completedAt?: string;
}

export async function createContract(
  orderId: string,
  milestones: Array<{ title: string; description?: string; amount: number; dueDate?: string }>,
): Promise<ServiceContract | null> {
  return apiFetch<ServiceContract>(`/orders/${orderId}/contract`, {
    method: 'POST',
    body: JSON.stringify({ milestones }),
  });
}

export async function fetchContract(orderId: string): Promise<ServiceContract | null> {
  return apiFetch<ServiceContract>(`/contracts/${orderId}`);
}

export async function updateMilestoneStatus(
  orderId: string,
  milestoneId: string,
  action: 'start' | 'submit' | 'approve' | 'revision',
  userId: string,
): Promise<ServiceContract | null> {
  return apiFetch<ServiceContract>(`/contracts/${orderId}/milestones/${milestoneId}`, {
    method: 'PUT',
    body: JSON.stringify({ action, userId }),
  });
}

// ═══════════════════════════════════════
// DIGITAL GOODS API
// ═══════════════════════════════════════

export interface DigitalGood {
  id: string;
  title: string;
  producer: string;
  producerId: string;
  category: string;
  description: string;
  price: number;
  tags: string[];
  fileSize: string;
  format: string;
  rating: number;
  sales: number;
  views: number;
  status: string;
  createdAt: string;
}

export interface DigitalGoodsFilter {
  search?: string;
  category?: string;
  price_min?: number;
  price_max?: number;
  producerId?: string;
  sort?: 'new' | 'popular' | 'rating' | 'price_asc' | 'price_desc';
  limit?: number;
  offset?: number;
}

export async function fetchDigitalGoods(filters: DigitalGoodsFilter = {}): Promise<{ goods: DigitalGood[]; pagination: Pagination | null }> {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.category) params.set('category', filters.category);
  if (filters.price_min) params.set('price_min', String(filters.price_min));
  if (filters.price_max) params.set('price_max', String(filters.price_max));
  if (filters.producerId) params.set('producerId', filters.producerId);
  if (filters.sort) params.set('sort', filters.sort);
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.offset) params.set('offset', String(filters.offset));

  const qs = params.toString();
  const result = await apiFetchFull<DigitalGood[]>(`/digital-goods${qs ? `?${qs}` : ''}`);
  return { goods: result.data || [], pagination: result.pagination || null };
}

export async function fetchDigitalGoodById(id: string): Promise<DigitalGood | null> {
  return apiFetch<DigitalGood>(`/digital-goods/${id}`);
}

export async function purchaseDigitalGood(
  id: string,
  buyerId: string,
  buyerName: string,
): Promise<{ purchase: any; message: string } | null> {
  return apiFetch(`/digital-goods/${id}/purchase`, {
    method: 'POST',
    body: JSON.stringify({ buyerId, buyerName }),
  });
}

// ═══════════════════════════════════════
// ADMIN - MARKETPLACE API
// ═══════════════════════════════════════

export interface MarketplaceTransaction {
  id: string;
  type: 'beat' | 'service' | 'digital_good';
  itemTitle: string;
  totalPrice: number;
  commission: number;
  producerPayout: number;
  producerId: string;
  producerName: string;
  buyerId: string;
  buyerName: string;
  status: string;
  createdAt: string;
  orderId?: string;
  milestoneId?: string;
  contractId?: string;
}

export interface MarketplaceAdminStats {
  totalTransactions: number;
  totalGross: number;
  totalRevenue: number;
  totalPayouts: number;
  platformBalance: number;
  transactionCount: number;
  byChannel: Array<{
    channel: string;
    label: string;
    count: number;
    gross: number;
    revenue: number;
  }>;
  // Backward compat aliases
  totalCommission: number;
  byType: Array<{
    type: string;
    label: string;
    count: number;
    revenue: number;
    commission: number;
  }>;
}

export async function fetchMarketplaceAdminStats(): Promise<MarketplaceAdminStats | null> {
  const raw = await apiFetch<any>('/admin/stats');
  if (!raw) return null;
  // Normalize unified revenue stats to MarketplaceAdminStats shape
  return {
    totalTransactions: raw.transactionCount || raw.totalTransactions || 0,
    totalGross: raw.totalGross || 0,
    totalRevenue: raw.totalGross || raw.totalRevenue || 0,
    totalPayouts: raw.totalPayouts || 0,
    platformBalance: raw.platformBalance || 0,
    transactionCount: raw.transactionCount || 0,
    byChannel: (raw.byChannel || []).map((c: any) => ({
      channel: c.channel,
      label: c.label,
      count: c.count,
      gross: c.gross,
      revenue: c.revenue,
    })),
    // Aliases
    totalCommission: raw.totalRevenue || 0,
    byType: (raw.byChannel || []).map((c: any) => ({
      type: c.channel,
      label: c.label,
      count: c.count,
      revenue: c.gross,
      commission: c.revenue,
    })),
  };
}

export async function fetchMarketplaceAdminTransactions(
  type?: string,
  limit = 100,
  offset = 0,
): Promise<{ transactions: MarketplaceTransaction[]; pagination: Pagination | null }> {
  const params = new URLSearchParams();
  if (type) params.set('type', type);
  params.set('limit', String(limit));
  params.set('offset', String(offset));

  const qs = params.toString();
  const result = await apiFetchFull<MarketplaceTransaction[]>(`/admin/transactions${qs ? `?${qs}` : ''}`);
  return { transactions: result.data || [], pagination: result.pagination || null };
}