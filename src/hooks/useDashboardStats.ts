/**
 * DASHBOARD STATS HOOK
 * Централизованная логика для статистики админского дашборда
 * v2: Real API calls to /stats endpoints
 */

import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '@/utils/supabase/info';
import { supabase } from '@/utils/supabase/client';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/server/api`;

async function statsFetch(path: string) {
  const token = (await supabase.auth.getSession()).data.session?.access_token || publicAnonKey;
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return res.json();
}

export interface DashboardStats {
  // Пользователи
  totalUsers: number;
  activeArtists: number;
  usersGrowth: string;
  artistsGrowth: string;

  // Модерация
  pendingTracks: number;
  pendingVideos: number;
  pendingConcerts: number;
  pendingNews: number;
  totalPending: number;

  // Модерация за сегодня
  tracksModeratedToday: number;
  videosModeratedToday: number;
  concertsModeratedToday: number;
  newsModeratedToday: number;

  // Финансы
  monthlyRevenue: number;
  revenueGrowth: string;
  totalTransactions: number;

  // Поддержка
  openTickets: number;
  ticketsToday: number;
  ticketsGrowth: string;
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeArtists: 0,
    usersGrowth: '-',
    artistsGrowth: '-',

    pendingTracks: 0,
    pendingVideos: 0,
    pendingConcerts: 0,
    pendingNews: 0,
    totalPending: 0,

    tracksModeratedToday: 0,
    videosModeratedToday: 0,
    concertsModeratedToday: 0,
    newsModeratedToday: 0,

    monthlyRevenue: 0,
    revenueGrowth: '-',
    totalTransactions: 0,

    openTickets: 0,
    ticketsToday: 0,
    ticketsGrowth: '-',
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch track and concert moderation stats in parallel
        const [trackStats, concertStats] = await Promise.all([
          statsFetch('/track-moderation/stats').catch(() => ({})),
          statsFetch('/concert-moderation/stats').catch(() => ({})),
        ]);

        const pendingTracks = trackStats?.data?.pending || trackStats?.pending || 0;
        const pendingConcerts = concertStats?.data?.pending || concertStats?.pending || 0;
        const totalTracks = trackStats?.data?.total || trackStats?.total || 0;
        const totalConcerts = concertStats?.data?.total || concertStats?.total || 0;
        const approvedTracks = trackStats?.data?.approved || trackStats?.approved || 0;
        const approvedConcerts = concertStats?.data?.approved || concertStats?.approved || 0;

        setStats(prev => ({
          ...prev,
          pendingTracks,
          pendingConcerts,
          totalPending: pendingTracks + prev.pendingVideos + pendingConcerts + prev.pendingNews,

          // Use total counts as proxy for user/artist counts
          totalUsers: totalTracks + totalConcerts,
          activeArtists: approvedTracks + approvedConcerts,

          tracksModeratedToday: trackStats?.data?.moderated_today || 0,
          concertsModeratedToday: concertStats?.data?.moderated_today || 0,
        }));
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    fetchStats();
  }, []);

  return stats;
}

/**
 * RECENT ACTIVITY HOOK
 * Последняя активность на платформе — from real API
 */

export interface ActivityItem {
  id: string;
  type: 'track' | 'video' | 'concert' | 'news' | 'user' | 'support';
  action: string;
  user: string;
  title: string;
  time: string;
  status: 'pending' | 'approved' | 'rejected';
}

export function useRecentActivity(limit: number = 10): ActivityItem[] {
  const [activity, setActivity] = useState<ActivityItem[]>([]);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        // Fetch recent tracks and concerts
        const [tracksData, concertsData] = await Promise.all([
          statsFetch('/track-moderation/pendingTracks?status=all&limit=5').catch(() => ({ data: [] })),
          statsFetch('/concert-moderation/pending?status=all&limit=5').catch(() => ({ data: [] })),
        ]);

        const items: ActivityItem[] = [];

        // Tracks
        const tracks = tracksData?.data || [];
        tracks.slice(0, 5).forEach((track: any) => {
          const status = track.moderation_status || track.status || 'pending';
          items.push({
            id: `track-${track.id}`,
            type: 'track',
            action: status === 'approved' ? 'Трек одобрен' : status === 'rejected' ? 'Трек отклонён' : 'Новый трек на модерацию',
            user: track.artist_name || track.artist || 'Артист',
            title: track.title || '',
            time: getRelativeTime(track.created_at || track.uploaded_at || new Date().toISOString()),
            status: status as any,
          });
        });

        // Concerts
        const concerts = concertsData?.data || [];
        concerts.slice(0, 5).forEach((concert: any) => {
          const status = concert.moderation_status || concert.status || 'pending';
          items.push({
            id: `concert-${concert.id}`,
            type: 'concert',
            action: status === 'approved' ? 'Концерт одобрен' : status === 'rejected' ? 'Концерт отклонён' : 'Новый концерт на модерацию',
            user: concert.artist || concert.artist_name || 'Организатор',
            title: concert.title || '',
            time: getRelativeTime(concert.created_at || new Date().toISOString()),
            status: status as any,
          });
        });

        // Sort by time and take first N
        const sorted = items.slice(0, limit);
        setActivity(sorted);
      } catch (error) {
        console.error('Error fetching recent activity:', error);
      }
    };

    fetchActivity();
  }, [limit]);

  return activity;
}

/**
 * Утилита для вычисления относительного времени
 */
function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Только что';
  if (diffMins < 60) return `${diffMins} ${getDeclension(diffMins, 'минута', 'минуты', 'минут')} назад`;
  if (diffHours < 24) return `${diffHours} ${getDeclension(diffHours, 'час', 'часа', 'часов')} назад`;
  if (diffDays < 30) return `${diffDays} ${getDeclension(diffDays, 'день', 'дня', 'дней')} назад`;

  return date.toLocaleDateString('ru-RU');
}

/**
 * Склонение русских слов
 */
function getDeclension(n: number, one: string, two: string, five: string): string {
  n = Math.abs(n) % 100;
  const n1 = n % 10;
  if (n > 10 && n < 20) return five;
  if (n1 > 1 && n1 < 5) return two;
  if (n1 === 1) return one;
  return five;
}
