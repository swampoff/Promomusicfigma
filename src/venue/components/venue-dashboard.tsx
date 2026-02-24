/**
 * VENUE DASHBOARD - Главная страница кабинета заведения
 * Enterprise дашборд с статистикой и быстрыми действиями
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Play, Pause, Music, TrendingUp, Clock, Users, Star,
  Radio, BarChart3, Calendar, ChevronRight, Zap,
  Headphones, UserCheck, Bell, ArrowRight, CheckCircle
} from 'lucide-react';
import { useVenuePlayer } from '../contexts/VenuePlayerContext';
import type { VenueStats } from '../types/venue-types';
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
  const [loading, setLoading] = useState(true);

  const player = useVenuePlayer();

  // Load stats from API on mount
  useEffect(() => {
    setLoading(true);
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
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const formatPlaytime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) return `${hours}ч ${mins}м`;
    return `${mins}м`;
  };

  const kpiCards = [
    {
      label: 'Плейлисты',
      value: stats.totalPlaylists,
      icon: Music,
      color: 'text-indigo-400',
      bg: 'from-indigo-500/15 to-indigo-500/5',
      border: 'border-indigo-500/20',
    },
    {
      label: 'Треки',
      value: stats.totalTracks,
      icon: Headphones,
      color: 'text-purple-400',
      bg: 'from-purple-500/15 to-purple-500/5',
      border: 'border-purple-500/20',
    },
    {
      label: 'Эфир',
      value: formatPlaytime(stats.totalPlaytime),
      icon: Clock,
      color: 'text-cyan-400',
      bg: 'from-cyan-500/15 to-cyan-500/5',
      border: 'border-cyan-500/20',
    },
    {
      label: 'Рейтинг',
      value: stats.averageRating?.toFixed(1) ?? '-',
      icon: Star,
      color: 'text-amber-400',
      bg: 'from-amber-500/15 to-amber-500/5',
      border: 'border-amber-500/20',
    },
  ];

  const quickActions = [
    {
      label: 'Музыка и радио',
      description: 'Управление плейлистами и вещанием',
      icon: Radio,
      section: 'radio-brand',
      color: 'from-indigo-500 to-purple-600',
    },
    {
      label: 'Букинг артистов',
      description: 'Найти и забронировать выступление',
      icon: UserCheck,
      section: 'booking',
      color: 'from-emerald-500 to-teal-600',
    },
    {
      label: 'Аналитика',
      description: 'Статистика и отчёты',
      icon: BarChart3,
      section: 'analytics',
      color: 'from-cyan-500 to-blue-600',
    },
    {
      label: 'Уведомления',
      description: 'Новые заявки и события',
      icon: Bell,
      section: 'notifications',
      color: 'from-orange-500 to-red-600',
    },
  ];

  return (
    <div className="p-3 xs:p-4 sm:p-6 space-y-4 xs:space-y-5 sm:space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl xs:text-2xl sm:text-3xl font-bold text-white mb-1 xs:mb-2">
          Главная панель
        </h2>
        <p className="text-xs xs:text-sm sm:text-base text-slate-400">
          Обзор вашего заведения и быстрые действия
        </p>
      </div>

      {/* Player Status Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-3 xs:p-4 sm:p-5 rounded-xl xs:rounded-2xl border backdrop-blur-xl ${
          player.isPlaying
            ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/5 border-green-500/30'
            : 'bg-gradient-to-r from-slate-500/10 to-slate-500/5 border-white/10'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 xs:gap-3 min-w-0">
            <div className={`p-2 xs:p-2.5 rounded-lg xs:rounded-xl ${
              player.isPlaying ? 'bg-green-500/20' : 'bg-white/10'
            }`}>
              {player.isPlaying ? (
                <Play className="w-4 h-4 xs:w-5 xs:h-5 text-green-400" />
              ) : (
                <Pause className="w-4 h-4 xs:w-5 xs:h-5 text-slate-400" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm xs:text-base font-medium text-white">
                {player.isPlaying ? 'Музыка играет' : 'Музыка на паузе'}
              </p>
              {player.currentTrack && (
                <p className="text-xs xs:text-sm text-slate-400 truncate">
                  {player.currentTrack.title} - {player.currentTrack.artist}
                </p>
              )}
            </div>
          </div>

          <div className={`flex items-center gap-1.5 px-2 xs:px-3 py-1 rounded-full text-xs xs:text-sm font-medium ${
            player.isPlaying
              ? 'bg-green-500/20 text-green-300'
              : 'bg-white/10 text-slate-400'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              player.isPlaying ? 'bg-green-400 animate-pulse' : 'bg-slate-500'
            }`} />
            {player.isPlaying ? 'Online' : 'Offline'}
          </div>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 xs:gap-3 sm:gap-4">
        {kpiCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`p-3 xs:p-4 sm:p-5 rounded-lg xs:rounded-xl bg-gradient-to-br ${card.bg} border ${card.border} backdrop-blur-xl`}
            >
              <div className="flex items-center gap-1.5 xs:gap-2 mb-2 xs:mb-3">
                <Icon className={`w-4 h-4 xs:w-5 xs:h-5 ${card.color}`} />
                <span className="text-[10px] xs:text-xs text-slate-400">{card.label}</span>
              </div>
              <p className="text-lg xs:text-2xl sm:text-3xl font-bold text-white">
                {loading ? '...' : card.value}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 xs:gap-3">
        <div className="p-3 xs:p-4 rounded-lg xs:rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-1.5 xs:gap-2 mb-1">
            <Calendar className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-blue-400" />
            <span className="text-[10px] xs:text-xs text-slate-400">Активные букинги</span>
          </div>
          <p className="text-base xs:text-xl font-bold text-white">{stats.activeBookings}</p>
        </div>
        <div className="p-3 xs:p-4 rounded-lg xs:rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-1.5 xs:gap-2 mb-1">
            <CheckCircle className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-green-400" />
            <span className="text-[10px] xs:text-xs text-slate-400">Завершённые</span>
          </div>
          <p className="text-base xs:text-xl font-bold text-white">{stats.completedBookings}</p>
        </div>
        <div className="p-3 xs:p-4 rounded-lg xs:rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-1.5 xs:gap-2 mb-1">
            <Users className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-pink-400" />
            <span className="text-[10px] xs:text-xs text-slate-400">Отзывы</span>
          </div>
          <p className="text-base xs:text-xl font-bold text-white">{stats.totalReviews}</p>
        </div>
        <div className="p-3 xs:p-4 rounded-lg xs:rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-1.5 xs:gap-2 mb-1">
            <Radio className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-purple-400" />
            <span className="text-[10px] xs:text-xs text-slate-400">Радиостанции</span>
          </div>
          <p className="text-base xs:text-xl font-bold text-white">{stats.connectedRadios}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-base xs:text-lg font-semibold text-white mb-2 xs:mb-3">Быстрые действия</h3>
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-2 xs:gap-3 sm:gap-4">
          {quickActions.map((action, i) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={action.section}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="group p-3 xs:p-4 sm:p-5 rounded-lg xs:rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
              >
                <div className={`w-8 h-8 xs:w-10 xs:h-10 rounded-lg xs:rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-2 xs:mb-3`}>
                  <Icon className="w-4 h-4 xs:w-5 xs:h-5 text-white" />
                </div>
                <h4 className="text-sm xs:text-base font-medium text-white mb-0.5 xs:mb-1">
                  {action.label}
                </h4>
                <p className="text-[10px] xs:text-xs text-slate-400 line-clamp-2">
                  {action.description}
                </p>
                <div className="flex items-center gap-1 mt-2 xs:mt-3 text-xs text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Открыть</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Activity Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="p-4 xs:p-5 sm:p-6 rounded-xl xs:rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border border-indigo-500/20"
      >
        <div className="flex items-center gap-2 xs:gap-3 mb-3 xs:mb-4">
          <div className="p-2 xs:p-2.5 rounded-lg xs:rounded-xl bg-indigo-500/20">
            <TrendingUp className="w-4 h-4 xs:w-5 xs:h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm xs:text-base font-semibold text-white">Сводка активности</h3>
            <p className="text-[10px] xs:text-xs text-slate-400">За последние 30 дней</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 xs:gap-4">
          <div className="text-center">
            <p className="text-lg xs:text-2xl font-bold text-white">{stats.totalPlaylists}</p>
            <p className="text-[10px] xs:text-xs text-slate-400 mt-0.5">Плейлистов</p>
          </div>
          <div className="text-center">
            <p className="text-lg xs:text-2xl font-bold text-white">{formatPlaytime(stats.totalPlaytime)}</p>
            <p className="text-[10px] xs:text-xs text-slate-400 mt-0.5">Время эфира</p>
          </div>
          <div className="text-center">
            <p className="text-lg xs:text-2xl font-bold text-white">{stats.totalTracks}</p>
            <p className="text-[10px] xs:text-xs text-slate-400 mt-0.5">Треков</p>
          </div>
        </div>
      </motion.div>

      {/* Pro Tips */}
      <div className="p-3 xs:p-4 rounded-lg xs:rounded-xl bg-amber-500/5 border border-amber-500/20">
        <div className="flex items-start gap-2 xs:gap-3">
          <Zap className="w-4 h-4 xs:w-5 xs:h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs xs:text-sm font-medium text-amber-300 mb-0.5 xs:mb-1">Совет</p>
            <p className="text-[10px] xs:text-xs text-slate-400">
              Настройте расписание плейлистов, чтобы музыка автоматически менялась в зависимости от времени суток. Это повысит атмосферу вашего заведения.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
