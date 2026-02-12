/**
 * VENUE CABINET API CLIENT
 * API для кабинета заведений:
 * - Профиль (profile)
 * - Статистика (stats)
 * - Аналитика (analytics)
 * - Уведомления (notifications)
 * - Букинги (bookings)
 */

import { apiFetch } from './api-cache';

const API_PREFIX = '/api/venue';

// Helper to parse response
async function apiGet<T>(path: string): Promise<T | null> {
  try {
    const res = await apiFetch(API_PREFIX, path);
    if (!res.ok) {
      console.error(`Venue API error ${res.status} for ${path}:`, await res.text().catch(() => ''));
      return null;
    }
    return await res.json();
  } catch (error) {
    console.error(`Venue API fetch error for ${path}:`, error);
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
      console.error(`Venue API error ${res.status} for ${method} ${path}:`, await res.text().catch(() => ''));
      return null;
    }
    return await res.json();
  } catch (error) {
    console.error(`Venue API fetch error for ${method} ${path}:`, error);
    return null;
  }
}

// =====================================================
// PROFILE
// =====================================================

export interface VenueProfileData {
  id: string;
  userId: string;
  venueName: string;
  description: string | null;
  venueType: string;
  address: string;
  city: string;
  country: string;
  capacity: number | null;
  logoUrl: string | null;
  coverImageUrl: string | null;
  genres: string[];
  socialLinks: Record<string, string>;
  workingHours: string | null;
  status: string;
  verified: boolean;
  subscriptionStatus: string;
  subscriptionPlan: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function fetchVenueProfile(): Promise<VenueProfileData | null> {
  return await apiGet<VenueProfileData>('/profile');
}

export async function updateVenueProfile(params: Partial<VenueProfileData>): Promise<VenueProfileData | null> {
  return await apiMutate<VenueProfileData>('/profile', 'PUT', params);
}

// =====================================================
// STATS
// =====================================================

export interface VenueStatsData {
  totalPlaylists: number;
  totalTracks: number;
  totalPlaytime: number;
  activeBookings: number;
  completedBookings: number;
  averageRating: number;
  totalReviews: number;
  connectedRadios: number;
}

export async function fetchVenueStats(): Promise<VenueStatsData | null> {
  return await apiGet<VenueStatsData>('/stats');
}

// =====================================================
// ANALYTICS
// =====================================================

export interface AnalyticsOverview {
  spending: { total: number; growth: number; thisMonth: number };
  campaigns: { active: number; total: number; completed: number; successRate: number };
  reach: { totalImpressions: number; uniqueListeners: number; growth: number; avgPerCampaign: number };
  performance: { avgROI: number; conversionRate: number; engagementRate: number };
}

export async function fetchAnalyticsOverview(period?: string): Promise<AnalyticsOverview | null> {
  const path = period ? `/analytics/overview?period=${period}` : '/analytics/overview';
  const data = await apiGet<{ success: boolean; data: AnalyticsOverview }>(path);
  return data?.data || null;
}

export interface VenueCampaign {
  id: string;
  name: string;
  radioStation: string;
  status: string;
  totalSpent: number;
  impressions: number;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export async function fetchCampaigns(): Promise<VenueCampaign[]> {
  const data = await apiGet<{ success: boolean; campaigns: VenueCampaign[] }>('/analytics/campaigns');
  return data?.campaigns || [];
}

export async function fetchSpendingHistory(period?: string): Promise<any[]> {
  const path = period ? `/analytics/spending?period=${period}` : '/analytics/spending';
  const data = await apiGet<{ success: boolean; data: any[] }>(path);
  return data?.data || [];
}

export async function fetchROIData(): Promise<any[]> {
  const data = await apiGet<{ success: boolean; data: any[] }>('/analytics/roi');
  return data?.data || [];
}

export async function fetchRadioCompare(): Promise<any[]> {
  const data = await apiGet<{ success: boolean; data: any[] }>('/analytics/radio-compare');
  return data?.data || [];
}

// =====================================================
// NOTIFICATIONS
// =====================================================

export interface VenueNotificationData {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  priority?: string;
  createdAt: string;
}

export async function fetchVenueNotifications(): Promise<VenueNotificationData[]> {
  const data = await apiGet<{ success: boolean; notifications: VenueNotificationData[] }>('/notifications');
  return data?.notifications || [];
}

export async function markVenueNotificationRead(notifId: string): Promise<boolean> {
  const data = await apiMutate<{ success: boolean }>(`/notifications/${notifId}/read`, 'PUT');
  return data?.success || false;
}

// =====================================================
// BOOKINGS
// =====================================================

export interface VenueBookingData {
  id: string;
  requesterId: string;
  performerId: string;
  eventType: string;
  eventTitle: string;
  eventDescription?: string;
  eventDate: string;
  startTime: string;
  durationHours: number;
  venueName: string;
  venueCity?: string;
  offeredPrice: number;
  depositAmount: number;
  finalAmount: number;
  status: string;
  performer?: { id: string; displayName: string; avatarUrl?: string };
  requester?: { id: string; displayName: string; avatarUrl?: string };
  createdAt: string;
  updatedAt: string;
}

export async function fetchVenueBookings(status?: string): Promise<VenueBookingData[]> {
  const path = status ? `/bookings?status=${status}` : '/bookings';
  const data = await apiGet<{ success: boolean; bookings: VenueBookingData[] }>(path);
  return data?.bookings || [];
}

// =====================================================
// PLAYLISTS (MusicSection)
// =====================================================

export interface VenuePlaylistData {
  id: string;
  venueId: string;
  ownerId: string;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  contentItems: {
    id: string;
    trackId: string;
    title: string;
    artist: string;
    duration: number;
    coverUrl: string | null;
    addedAt: string;
  }[];
  trackCount: number;
  totalDuration: number;
  isPublic: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export async function fetchVenuePlaylists(): Promise<VenuePlaylistData[]> {
  const data = await apiGet<{ success: boolean; playlists: VenuePlaylistData[] }>('/playlists');
  return data?.playlists || [];
}

export async function createVenuePlaylist(params: Partial<VenuePlaylistData>): Promise<VenuePlaylistData | null> {
  const data = await apiMutate<{ success: boolean; playlist: VenuePlaylistData }>('/playlists', 'POST', params);
  return data?.playlist || null;
}

export async function updateVenuePlaylist(id: string, params: Partial<VenuePlaylistData>): Promise<VenuePlaylistData | null> {
  const data = await apiMutate<{ success: boolean; playlist: VenuePlaylistData }>(`/playlists/${id}`, 'PUT', params);
  return data?.playlist || null;
}

export async function deleteVenuePlaylist(id: string): Promise<boolean> {
  const data = await apiMutate<{ success: boolean }>(`/playlists/${id}`, 'DELETE');
  return data?.success || false;
}

// =====================================================
// RADIO CATALOG & CAMPAIGNS (RadioSection)
// =====================================================

export interface RadioCatalogStation {
  id: string;
  stationName: string;
  slug: string;
  type: string;
  primaryGenre: string;
  country: string;
  city: string;
  frequency?: string;
  listenersCount: number;
  monthlyListeners: number;
  audienceSize: string;
  rating: number;
  verified: boolean;
  description: string;
  broadcastUrl?: string;
  adPackages: {
    id: string;
    type: string;
    duration: number;
    price: number;
    currency: string;
    timeSlots: string[];
    playsPerDay: number;
    durationDays: number;
    description: string;
    features: string[];
  }[];
}

export interface VenueAdCampaign {
  id: string;
  stationId: string;
  stationName: string;
  packageType: string;
  status: string;
  audioUrl: string;
  startDate: string;
  endDate: string;
  totalPlays: number;
  targetPlays: number;
  budget: number;
  spent: number;
  impressions: number;
  ctr: number;
  timeSlots: string[];
  createdAt: string;
}

export async function fetchRadioCatalog(): Promise<RadioCatalogStation[]> {
  const data = await apiGet<{ success: boolean; stations: RadioCatalogStation[] }>('/radio-catalog');
  return data?.stations || [];
}

export async function fetchRadioCampaigns(): Promise<VenueAdCampaign[]> {
  const data = await apiGet<{ success: boolean; campaigns: VenueAdCampaign[] }>('/radio-campaigns');
  return data?.campaigns || [];
}

export async function createRadioCampaign(params: Partial<VenueAdCampaign>): Promise<VenueAdCampaign | null> {
  const data = await apiMutate<{ success: boolean; campaign: VenueAdCampaign }>('/radio-campaigns', 'POST', params);
  return data?.campaign || null;
}

export async function updateRadioCampaign(id: string, params: Partial<VenueAdCampaign>): Promise<VenueAdCampaign | null> {
  const data = await apiMutate<{ success: boolean; campaign: VenueAdCampaign }>(`/radio-campaigns/${id}`, 'PUT', params);
  return data?.campaign || null;
}

// =====================================================
// RADIO BRAND (RadioBrandSection)
// =====================================================

export interface VenueRadioBrandData {
  isEnabled: boolean;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  currentTrack: {
    title: string;
    artist: string;
    type: string;
    duration: number;
    currentTime: number;
  };
  settings: {
    quietMode: {
      enabled: boolean;
      startTime: string;
      endTime: string;
      days: string;
    };
    autoInsert: {
      jingleFrequency: number;
      adFrequency: number;
      announcementFrequency: number;
    };
  };
  schedule: {
    id: string;
    playlistId: string;
    time: string;
    days: string[];
    label: string;
  }[];
  content: {
    id: string;
    type: string;
    title: string;
    duration: number;
    plays: number;
    status: string;
  }[];
  analytics: {
    totalPlaytime: number;
    tracksPlayed: number;
    avgListeners: number;
    peakListeners: number;
    topGenres: { genre: string; percentage: number }[];
  };
  updatedAt: string;
}

export async function fetchRadioBrand(): Promise<VenueRadioBrandData | null> {
  const data = await apiGet<{ success: boolean; data: VenueRadioBrandData }>('/radio-brand');
  return data?.data || null;
}

export async function updateRadioBrand(params: Partial<VenueRadioBrandData>): Promise<VenueRadioBrandData | null> {
  const data = await apiMutate<{ success: boolean; data: VenueRadioBrandData }>('/radio-brand', 'PUT', params);
  return data?.data || null;
}
