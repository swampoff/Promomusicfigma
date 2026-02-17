/**
 * RADIO CABINET API CLIENT
 * API для операционных данных кабинета радиостанции:
 * - Рекламные слоты (ad-slots)
 * - Заявки артистов (artist-requests)
 * - Финансы (finance)
 * - Уведомления (notifications)
 */

import { apiFetch } from './api-cache';

const API_PREFIX = '/api/radio';

// Helper to parse response
async function apiGet<T>(path: string): Promise<T | null> {
  try {
    const res = await apiFetch(API_PREFIX, path);
    if (!res.ok) {
      console.error(`Radio API error ${res.status} for ${path}:`, await res.text().catch(() => ''));
      return null;
    }
    return await res.json();
  } catch (error) {
    console.error(`Radio API fetch error for ${path}:`, error);
    return null;
  }
}

async function apiMutate<T>(path: string, method: string, body?: any): Promise<T | null> {
  try {
    const options: RequestInit = { method };
    if (body !== undefined) {
      options.body = JSON.stringify(body);
    }
    const res = await apiFetch(API_PREFIX, path, options);
    if (!res.ok) {
      console.error(`Radio API error ${res.status} for ${method} ${path}:`, await res.text().catch(() => ''));
      return null;
    }
    return await res.json();
  } catch (error) {
    console.error(`Radio API fetch error for ${method} ${path}:`, error);
    return null;
  }
}

// =====================================================
// AD SLOTS
// =====================================================

export interface RadioAdSlot {
  id: string;
  stationId: string;
  slotType: 'premium' | 'standard' | 'economy';
  timeSlot: string;
  price: number;
  duration: number;
  maxPerHour: number;
  description: string;
  status: 'available' | 'booked' | 'disabled';
  createdAt: string;
  updatedAt: string;
}

export async function fetchAdSlots(): Promise<RadioAdSlot[]> {
  const data = await apiGet<{ success: boolean; adSlots: RadioAdSlot[] }>('/ad-slots/list');
  return data?.adSlots || [];
}

export async function createAdSlot(params: {
  slotType: string;
  timeSlot: string;
  price: number;
  duration: number;
  maxPerHour: number;
  description?: string;
}): Promise<RadioAdSlot | null> {
  const data = await apiMutate<{ success: boolean; adSlot: RadioAdSlot }>('/ad-slots/create', 'POST', params);
  return data?.adSlot || null;
}

export async function updateAdSlot(slotId: string, params: Partial<RadioAdSlot>): Promise<RadioAdSlot | null> {
  const data = await apiMutate<{ success: boolean; adSlot: RadioAdSlot }>(`/ad-slots/${slotId}`, 'PUT', params);
  return data?.adSlot || null;
}

export async function deleteAdSlot(slotId: string): Promise<boolean> {
  const data = await apiMutate<{ success: boolean }>(`/ad-slots/${slotId}`, 'DELETE');
  return data?.success || false;
}

// =====================================================
// ARTIST REQUESTS
// =====================================================

export interface RadioArtistRequest {
  id: string;
  artistId: string;
  artistName: string;
  artistAvatar: string;
  genre: string;
  trackTitle: string;
  trackId: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  respondedAt: string | null;
  createdAt: string;
}

export async function fetchArtistRequests(): Promise<RadioArtistRequest[]> {
  const data = await apiGet<{ success: boolean; data: RadioArtistRequest[] }>('/artist-requests');
  return data?.data || [];
}

export async function acceptArtistRequest(requestId: string): Promise<boolean> {
  const data = await apiMutate<{ success: boolean }>(`/artist-requests/${requestId}/accept`, 'PUT');
  return data?.success || false;
}

export async function rejectArtistRequest(requestId: string, reason?: string): Promise<boolean> {
  const data = await apiMutate<{ success: boolean }>(`/artist-requests/${requestId}/reject`, 'PUT', { reason });
  return data?.success || false;
}

// =====================================================
// VENUE REQUESTS
// =====================================================

export interface RadioVenueRequest {
  id: string;
  venueId: string;
  venueName: string;
  venueType: string;
  venueCity: string;
  venuePhone?: string;
  venueRating?: number;
  packageId: string;
  packageType: string;
  duration: number;
  audioUrl: string;
  audioFileName: string;
  audioDuration: number;
  timeSlots: string[];
  playsPerDay: number;
  durationDays: number;
  startDate: string;
  endDate: string;
  totalPrice: number;
  stationPayout: number;
  platformFee: number;
  totalPlays: number;
  targetPlays: number;
  completedPlays: number;
  impressions: number;
  status: string;
  moderationNote?: string;
  rejectionReason?: string;
  submittedAt: string;
  reviewedAt?: string;
  approvedAt?: string;
  completedAt?: string;
}

export async function fetchVenueRequests(): Promise<RadioVenueRequest[]> {
  const data = await apiGet<{ success: boolean; data: RadioVenueRequest[] }>('/venue-requests');
  return data?.data || [];
}

export async function approveVenueRequest(requestId: string): Promise<boolean> {
  const data = await apiMutate<{ success: boolean }>(`/venue-requests/${requestId}/approve`, 'PUT');
  return data?.success || false;
}

export async function rejectVenueRequest(requestId: string, reason?: string): Promise<boolean> {
  const data = await apiMutate<{ success: boolean }>(`/venue-requests/${requestId}/reject`, 'PUT', { reason });
  return data?.success || false;
}

export async function startVenueRequestBroadcast(requestId: string): Promise<boolean> {
  const data = await apiMutate<{ success: boolean }>(`/venue-requests/${requestId}/start-broadcast`, 'PUT');
  return data?.success || false;
}

export async function completeVenueRequest(requestId: string): Promise<boolean> {
  const data = await apiMutate<{ success: boolean }>(`/venue-requests/${requestId}/complete`, 'PUT');
  return data?.success || false;
}

// =====================================================
// FINANCE
// =====================================================

export interface RadioFinanceOverview {
  totalRevenue: number;
  monthlyRevenue: number;
  adRevenue: number;
  subscriptionRevenue: number;
  pendingPayments: number;
  growth: number;
}

export interface RadioTransaction {
  id: string;
  type: 'ad_payment' | 'subscription' | 'payout' | 'commission';
  amount: number;
  description: string;
  status: 'pending' | 'completed';
  date: string;
}

export async function fetchFinanceOverview(): Promise<RadioFinanceOverview | null> {
  const data = await apiGet<{ success: boolean; finance: RadioFinanceOverview }>('/finance/overview');
  return data?.finance || null;
}

export async function fetchFinanceTransactions(): Promise<RadioTransaction[]> {
  const data = await apiGet<{ success: boolean; transactions: RadioTransaction[] }>('/finance/transactions');
  return data?.transactions || [];
}

// =====================================================
// NOTIFICATIONS
// =====================================================

export interface RadioNotificationData {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  priority: 'low' | 'normal' | 'high';
  createdAt: string;
}

export async function fetchRadioNotifications(): Promise<RadioNotificationData[]> {
  const data = await apiGet<{ success: boolean; notifications: RadioNotificationData[] }>('/notifications');
  return data?.notifications || [];
}

export async function markNotificationRead(notifId: string): Promise<boolean> {
  const data = await apiMutate<{ success: boolean }>(`/notifications/${notifId}/read`, 'PUT');
  return data?.success || false;
}

export async function markAllNotificationsRead(): Promise<boolean> {
  const data = await apiMutate<{ success: boolean }>('/notifications/read-all', 'PUT');
  return data?.success || false;
}

// =====================================================
// ANALYTICS
// =====================================================

export interface RadioAnalyticsData {
  artistStats: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  venueStats: {
    total: number;
    pending: number;
    approved: number;
    inProgress: number;
    completed: number;
    rejected: number;
    totalRevenue: number;
    stationRevenue: number;
    totalImpressions: number;
    totalPlays: number;
  };
  revenue: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    pendingPayout: number;
    totalTransactions: number;
  };
  adSlotsCount: number;
  topVenues: Array<{
    name: string;
    city: string;
    revenue: number;
    plays: number;
    status: string;
  }>;
  topArtists: Array<{
    name: string;
    genre: string;
    plays: number;
    track: string;
  }>;
  recentActivity: Array<{
    type: string;
    title: string;
    status: string;
    date: string;
  }>;
  generatedAt: string;
  detailedAnalytics?: {
    overview?: any;
    listenersChart?: any[];
    revenueChart?: any[];
    topTracks?: any[];
    genreDistribution?: any[];
    peakHours?: any[];
    geography?: any[];
    devices?: any[];
  };
}

export async function fetchRadioAnalytics(): Promise<RadioAnalyticsData | null> {
  const data = await apiGet<{ success: boolean; analytics: RadioAnalyticsData }>('/analytics');
  return data?.analytics || null;
}