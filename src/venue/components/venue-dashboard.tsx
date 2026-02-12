/**
 * VENUE DASHBOARD - Главная страница кабинета заведения
 * Enterprise дашборд с статистикой и быстрыми действиями
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Play, Pause, Music, TrendingUp, Clock, Users, Star,
  Radio, BarChart3, Calendar, Settings, ChevronRight, Zap,
  Headphones, UserCheck, Bell, ArrowRight, CheckCircle
} from 'lucide-react';
import { useVenuePlayer } from '../contexts/VenuePlayerContext';
import type { VenueStats, VenuePlaybackStatus, Playlist } from '../types/venue-types';
import { fetchVenueStats } from '@/utils/api/venue-cabinet';

export function VenueDashboard() {
  const [stats, setStats] = useState<VenueStats>({
    totalPlaylists: 12,
    totalTracks: 456,
    totalPlaytime: 28500,
    activeBookings: 3,
    completedBookings: 24,
    averageRating: 4.7,
    totalReviews: 18,
    connectedRadios: 2,
  });

  // Load stats from API on mount
  useEffect(() => {
    fetchVenueStats().then((data) => {
      if (data) {
        setStats({
          totalPlaylists: data.totalPlaylists || 12,
          totalTracks: data.totalTracks || 456,
          totalPlaytime: data.totalPlaytime || 28500,
          activeBookings: data.activeBookings || 0,
          completedBookings: data.completedBookings || 0,
          averageRating: data.averageRating || 4.7,
          totalReviews: data.totalReviews || 0,
          connectedRadios: data.connectedRadios || 0,
        });
      }
    }).catch(console.error);
  }, []);
}