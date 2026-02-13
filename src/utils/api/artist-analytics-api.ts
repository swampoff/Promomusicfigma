/**
 * ARTIST ANALYTICS API - Клиент аналитики артиста
 */

import { projectId, publicAnonKey } from '@/utils/supabase/info';

const BASE = `https://${projectId}.supabase.co/functions/v1/make-server-84730125/api/artist-analytics`;

const headers = () => ({
  'Authorization': `Bearer ${publicAnonKey}`,
  'Content-Type': 'application/json',
});

export interface AnalyticsOverview {
  period: string;
  totalPlays: number;
  activeListeners: number;
  totalLikes: number;
  revenue: number;
  followers: number;
  followersGrowth: number;
  playsGrowth: number;
  likesGrowth: number;
  revenueGrowth: number;
  engagementRate: number;
  avgListenDuration: string;
  completionRate: number;
  peakHour: string;
  platforms: { name: string; percentage: number; plays: number }[];
  geography: { country: string; percentage: number; listeners: number }[];
  demographics: { age: string; percentage: number }[];
  hourlyActivity: { hour: string; plays: number }[];
}

export interface TimelinePoint {
  label: string;
  plays: number;
  likes: number;
  shares: number;
  revenue: number;
  followers: number;
}

export interface TrackStats {
  id: string;
  title: string;
  plays: number;
  likes: number;
  shares: number;
  saves: number;
  completionRate: number;
  avgListenTime: string;
  trend: 'up' | 'stable' | 'down';
  trendValue: number;
}

export async function fetchAnalyticsOverview(artistId: string, period: string = 'month'): Promise<AnalyticsOverview | null> {
  try {
    const res = await fetch(`${BASE}/overview/${artistId}?period=${period}`, { headers: headers() });
    const json = await res.json();
    return json?.analytics || null;
  } catch (err) {
    console.error('Analytics API overview error:', err);
    return null;
  }
}

export async function fetchAnalyticsTimeline(artistId: string, period: string = 'month'): Promise<TimelinePoint[]> {
  try {
    const res = await fetch(`${BASE}/timeline/${artistId}?period=${period}`, { headers: headers() });
    const json = await res.json();
    return json?.timeline || [];
  } catch (err) {
    console.error('Analytics API timeline error:', err);
    return [];
  }
}

export async function fetchTrackStats(artistId: string): Promise<TrackStats[]> {
  try {
    const res = await fetch(`${BASE}/tracks/${artistId}`, { headers: headers() });
    const json = await res.json();
    return json?.tracks || [];
  } catch (err) {
    console.error('Analytics API tracks error:', err);
    return [];
  }
}