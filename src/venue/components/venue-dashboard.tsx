/**
 * VENUE DASHBOARD - Главная страница кабинета заведения
 * Enterprise дашборд с статистикой и быстрыми действиями
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Play, Pause, Music, TrendingUp, Clock, Users, Star,
  Radio, BarChart3, Calendar, Settings, ChevronRight, Zap,
  Headphones, UserCheck, Bell, ArrowRight, CheckCircle
} from 'lucide-react';
import { useVenuePlayer } from '../contexts/VenuePlayerContext';
import type { VenueStats, VenuePlaybackStatus, Playlist } from '../types/venue-types';

export function VenueDashboard() {
  const [stats, setStats] = useState<VenueStats>({
    totalPlaylists: 12,
    totalTracks: 456,
    totalPlaytime: 28500, // minutes
    activeBookings: 3,
    completedBookings: 24,
    averageRating: 4.7,
    totalReviews: 18,
    connectedRadios: 2,
  });

  const [playbackStatus, setPlaybackStatus] = useState<VenuePlaybackStatus>({
    venueId: 'venue1',
    isOnline: true,
    isPlaying: true,
    currentPlaylistId: 'playlist1',
    currentTrackId: 'track123',
    currentTrackTitle: 'Smooth Jazz Evening',
    currentTrackArtist: 'Marcus Miller',
    currentTrackStartedAt: new Date().toISOString(),
    lastHeartbeat: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const [recentPlaylists, setRecentPlaylists] = useState<Playlist[]>([
    {
      id: 'playlist1',
      venueId: 'venue1',
      ownerId: 'user1',
      title: 'Вечерний джаз',
      description: 'Расслабляющая джазовая музыка для вечера',
      coverImageUrl: null,
      contentItems: [],
      trackCount: 45,
      totalDuration: 180,
      isPublic: true,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'playlist2',
      venueId: 'venue1',
      ownerId: 'user1',
      title: 'Утренний чилл',
      description: 'Легкая фоновая музыка для утра',
      coverImageUrl: null,
      contentItems: [],
      trackCount: 32,
      totalDuration: 128,
      isPublic: true,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]);

  // Mock: форматирование времени
  const formatPlaytime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days} дн.`;
    if (hours > 0) return `${hours} ч.`;
    return `${minutes} мин.`;
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Добро пожаловать! 👋
        </h2>
        <p className="text-sm sm:text-base text-slate-400">
          Вот краткий обзор активности вашего заведения
        </p>
      </div>

      {/* Current Playback */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border border-indigo-500/30"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex-shrink-0">
              {playbackStatus.isPlaying ? (
                <Play className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              ) : (
                <Pause className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  {playbackStatus.isPlaying ? 'Сейчас играет' : 'Воспроизведение на паузе'}
                </h3>
                {playbackStatus.isOnline && (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/20 text-green-300 text-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                    Online
                  </div>
                )}
              </div>
              
              {playbackStatus.isPlaying && (
                <>
                  <p className="text-white font-medium truncate">{playbackStatus.currentTrackTitle}</p>
                  <p className="text-slate-400 text-sm truncate">{playbackStatus.currentTrackArtist}</p>
                </>
              )}
            </div>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all text-sm sm:text-base">
              {playbackStatus.isPlaying ? 'Пауза' : 'Играть'}
            </button>
            <button className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white transition-all text-sm sm:text-base">
              Сменить плейлист
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={Music}
          label="Плейлистов"
          value={stats.totalPlaylists.toString()}
          color="blue"
          trend="+2 за неделю"
        />
        <StatCard
          icon={Headphones}
          label="Треков"
          value={stats.totalTracks.toString()}
          color="purple"
          trend="В библиотеке"
        />
        <StatCard
          icon={Clock}
          label="Воспроизведено"
          value={formatPlaytime(stats.totalPlaytime)}
          color="green"
          trend="За месяц"
        />
        <StatCard
          icon={UserCheck}
          label="Букингов"
          value={stats.activeBookings.toString()}
          color="orange"
          trend={`${stats.completedBookings} завершено`}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3 mb-2">
            <Star className="w-5 h-5 text-amber-400" />
            <span className="text-slate-400 text-sm">Рейтинг</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.averageRating?.toFixed(1) || 'N/A'}</p>
          <p className="text-xs text-slate-500 mt-1">{stats.totalReviews} отзывов</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3 mb-2">
            <Radio className="w-5 h-5 text-indigo-400" />
            <span className="text-slate-400 text-sm">Радио</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.connectedRadios}</p>
          <p className="text-xs text-slate-500 mt-1">Подключено</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <span className="text-slate-400 text-sm">Активность</span>
          </div>
          <p className="text-2xl font-bold text-white">+24%</p>
          <p className="text-xs text-slate-500 mt-1">За последний месяц</p>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Быстрые действия</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <QuickActionCard
            icon={Music}
            title="Управление музыкой"
            description="Плейлисты и треки"
            color="from-blue-500/10 to-blue-600/5"
            borderColor="border-blue-500/20"
          />
          <QuickActionCard
            icon={UserCheck}
            title="Букинг DJ"
            description="Найти диджея"
            color="from-purple-500/10 to-purple-600/5"
            borderColor="border-purple-500/20"
            badge={stats.activeBookings > 0 ? stats.activeBookings.toString() : undefined}
          />
          <QuickActionCard
            icon={BarChart3}
            title="Аналитика"
            description="Статистика воспроизведений"
            color="from-green-500/10 to-green-600/5"
            borderColor="border-green-500/20"
          />
          <QuickActionCard
            icon={Radio}
            title="Интеграция с радио"
            description="Получать треки"
            color="from-indigo-500/10 to-indigo-600/5"
            borderColor="border-indigo-500/20"
          />
          <QuickActionCard
            icon={Star}
            title="Подписка"
            description="Управление тарифом"
            color="from-amber-500/10 to-amber-600/5"
            borderColor="border-amber-500/20"
          />
          <QuickActionCard
            icon={Bell}
            title="Уведомления"
            description="3 непрочитанных"
            color="from-red-500/10 to-red-600/5"
            borderColor="border-red-500/20"
            badge="3"
          />
        </div>
      </div>

      {/* Recent Playlists */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg sm:text-xl font-bold text-white">Последние плейлисты</h3>
          <button className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-1">
            Все плейлисты
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {recentPlaylists.map((playlist) => (
            <PlaylistCard key={playlist.id} playlist={playlist} />
          ))}
        </div>
      </div>
    </div>
  );
}

// =====================================================
// SUB-COMPONENTS
// =====================================================

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  color: 'blue' | 'purple' | 'green' | 'orange';
  trend?: string;
}

function StatCard({ icon: Icon, label, value, color, trend }: StatCardProps) {
  const colorClasses = {
    blue: 'from-blue-500/10 to-blue-600/5 border-blue-500/20 text-blue-400',
    purple: 'from-purple-500/10 to-purple-600/5 border-purple-500/20 text-purple-400',
    green: 'from-green-500/10 to-green-600/5 border-green-500/20 text-green-400',
    orange: 'from-orange-500/10 to-orange-600/5 border-orange-500/20 text-orange-400',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`p-4 rounded-xl bg-gradient-to-br border ${colorClasses[color]}`}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-5 h-5" />
        <span className="text-slate-400 text-sm">{label}</span>
      </div>
      <p className="text-2xl sm:text-3xl font-bold text-white mb-1">{value}</p>
      {trend && <p className="text-xs text-slate-500">{trend}</p>}
    </motion.div>
  );
}

interface QuickActionCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  borderColor: string;
  badge?: string;
}

function QuickActionCard({ icon: Icon, title, description, color, borderColor, badge }: QuickActionCardProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`p-4 rounded-xl bg-gradient-to-br border ${color} ${borderColor} text-left hover:border-opacity-50 transition-all relative`}
    >
      {badge && (
        <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold">
          {badge}
        </span>
      )}
      <Icon className="w-6 h-6 text-white mb-3" />
      <h4 className="text-white font-medium mb-1">{title}</h4>
      <p className="text-sm text-slate-400">{description}</p>
    </motion.button>
  );
}

interface PlaylistCardProps {
  playlist: Playlist;
}

function PlaylistCard({ playlist }: PlaylistCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
    >
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
          <Music className="w-8 h-8 text-white" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-medium mb-1 truncate">{playlist.title}</h4>
          <p className="text-sm text-slate-400 mb-2 line-clamp-1">{playlist.description}</p>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>{playlist.trackCount} треков</span>
            <span>•</span>
            <span>{Math.floor(playlist.totalDuration / 60)} мин</span>
            {playlist.status === 'active' && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1 text-green-400">
                  <CheckCircle className="w-3 h-3" />
                  Активен
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}