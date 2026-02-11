/**
 * TRENDING SECTION - Популярные треки Promo.music
 * Данные из API (KV Store) через useTrendingTracks hook с fallback на mock
 */

import { useState } from 'react';
import { Flame, Play, Heart, Share2, BarChart3, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useTrendingTracks } from '@/hooks/useLandingData';
import type { LandingTrack } from '@/hooks/useLandingData';

interface TrendingTrack {
  id: string;
  title: string;
  artist: string;
  plays: number;
  trend_score: number;
  genre: string;
}

// Mock данные - артисты Promo.music
const mockTrendingData: TrendingTrack[] = [
  { id: 'tr-1', title: 'Огни города', artist: 'Сандра', plays: 354000, trend_score: 95, genre: 'Pop' },
  { id: 'tr-2', title: 'FLEX', artist: 'Тимур', plays: 312000, trend_score: 88, genre: 'Hip-Hop' },
  { id: 'tr-3', title: 'Neon Dreams', artist: 'Дэн', plays: 298000, trend_score: 82, genre: 'Electronic' },
  { id: 'tr-4', title: 'Ночные волны', artist: 'Стелла', plays: 267000, trend_score: 76, genre: 'Deep House' },
  { id: 'tr-5', title: 'На бите', artist: 'Максам', plays: 245000, trend_score: 70, genre: 'Trap' },
  { id: 'tr-6', title: 'Midnight Soul', artist: 'Лиана', plays: 215000, trend_score: 65, genre: 'R&B' },
  { id: 'tr-7', title: 'Feel the Groove', artist: 'Марк', plays: 187000, trend_score: 60, genre: 'Funk' },
  { id: 'tr-8', title: 'Signal', artist: 'Ева', plays: 167000, trend_score: 55, genre: 'Indie Pop' },
];

export function TrendingSection() {
  const { data: serverTracks, isLoading, error } = useTrendingTracks(8);
  const [timeFilter, setTimeFilter] = useState<'day' | 'week' | 'month'>('week');

  // Конвертация серверных треков в TrendingTrack[]
  const apiTracks: TrendingTrack[] = serverTracks
    ? serverTracks.map((t: LandingTrack, i: number) => ({
        id: t.id,
        title: t.title,
        artist: t.artist,
        plays: t.plays || 0,
        trend_score: Math.max(50, 100 - (i * 6)),
        genre: t.genre || 'Music',
      }))
    : [];

  const tracks = apiTracks.length > 0 ? apiTracks : mockTrendingData;
  const fromServer = apiTracks.length > 0;

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <section className="relative py-12 xs:py-16 sm:py-20 px-3 xs:px-4 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 via-slate-900/30 to-slate-900/50" />

      {/* Animated Fire Orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
          x: [0, 100, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-10 right-10 bg-gradient-to-br from-orange-600/30 to-red-600/30 rounded-full blur-3xl"
        style={{ width: 300, height: 300 }}
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
          x: [0, -80, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
        className="absolute bottom-10 left-10 bg-gradient-to-tl from-yellow-600/20 to-orange-600/20 rounded-full blur-3xl"
        style={{ width: 400, height: 400 }}
      />

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 xs:mb-10 sm:mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 xs:px-6 py-2 xs:py-3 mb-4 xs:mb-6 rounded-full bg-gradient-to-r from-orange-500/20 via-red-500/20 to-orange-500/20 backdrop-blur-xl border border-orange-500/30 text-orange-300 shadow-lg shadow-orange-500/20">
            <Flame className="w-4 h-4 xs:w-5 xs:h-5" />
            <span className="text-[11px] xs:text-xs sm:text-sm font-bold">Горячие треки</span>
          </div>

          <h2 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-orange-400 mb-2 xs:mb-3 sm:mb-4">
            Trending
          </h2>
          <p className="text-sm xs:text-base sm:text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-medium">
            Самые популярные треки на Promo.music прямо сейчас
          </p>
        </motion.div>

        {/* Time Filter */}
        <div className="flex justify-center gap-2 xs:gap-3 mb-4 xs:mb-6">
          {[
            { id: 'day', label: 'Сегодня', icon: '⚡' },
            { id: 'week', label: 'Неделя', icon: '🔥' },
            { id: 'month', label: 'Месяц', icon: '🌟' },
          ].map((filter) => (
            <motion.button
              key={filter.id}
              onClick={() => setTimeFilter(filter.id as 'day' | 'week' | 'month')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`relative px-4 xs:px-6 sm:px-8 py-2 xs:py-2.5 sm:py-3 rounded-lg xs:rounded-xl text-[11px] xs:text-xs sm:text-sm font-bold transition-all overflow-hidden ${
                timeFilter === filter.id
                  ? 'text-white shadow-2xl shadow-orange-500/40'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10 backdrop-blur-xl border border-white/10'
              }`}
            >
              {timeFilter === filter.id && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-red-600 to-orange-600" />
                  <motion.div
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  />
                </>
              )}
              <span className="relative flex items-center gap-1.5 xs:gap-2">
                <span>{filter.icon}</span>
                {filter.label}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Data Source Indicator */}
        <div className="flex justify-center mb-6 xs:mb-8 sm:mb-12">
          {isLoading ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-[10px] xs:text-xs">
              <Loader2 className="w-3 h-3 animate-spin" />
              Загрузка трендов...
            </span>
          ) : fromServer ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-[10px] xs:text-xs">
              <Wifi className="w-3 h-3" />
              Supabase KV
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-yellow-400 text-[10px] xs:text-xs">
              <WifiOff className="w-3 h-3" />
              Демо-данные
            </span>
          )}
        </div>

        {/* Tracks Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 xs:gap-4 sm:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse p-4 xs:p-5 sm:p-6 rounded-xl xs:rounded-2xl bg-white/5 border border-white/5">
                <div className="h-5 bg-white/5 rounded mb-3 w-1/3" />
                <div className="h-5 bg-white/5 rounded mb-2 w-3/4" />
                <div className="h-4 bg-white/5 rounded mb-4 w-1/2" />
                <div className="flex gap-2">
                  <div className="h-8 bg-white/5 rounded flex-1" />
                  <div className="h-8 w-8 bg-white/5 rounded" />
                  <div className="h-8 w-8 bg-white/5 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 xs:gap-4 sm:gap-6">
            {tracks.map((track, index) => (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative"
              >
                {/* Fire Glow Effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 via-red-600 to-orange-600 rounded-xl xs:rounded-2xl opacity-0 group-hover:opacity-40 blur-xl transition-opacity" />

                <div className="relative p-4 xs:p-5 sm:p-6 rounded-xl xs:rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.03] backdrop-blur-xl border border-white/10 group-hover:border-orange-500/40 transition-all cursor-pointer overflow-hidden">
                  {/* Rank Badge */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.08 + 0.2, type: "spring" }}
                    className="absolute flex items-center justify-center rounded-full bg-gradient-to-br from-orange-500 via-red-600 to-orange-500 text-white font-black shadow-2xl shadow-orange-500/50 border-2 border-white/20"
                    style={{ top: -10, left: -10, width: 40, height: 40, fontSize: 14 }}
                  >
                    {index + 1}
                  </motion.div>

                  {/* Trend Score */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-1.5 px-2 xs:px-3 py-1 xs:py-1.5 rounded-md xs:rounded-lg bg-orange-500/20 text-orange-300 font-bold mb-3 xs:mb-4 w-fit border border-orange-500/30"
                    style={{ fontSize: '11px' }}
                  >
                    <BarChart3 className="w-3 h-3 xs:w-4 xs:h-4" />
                    <span>{track.trend_score}%</span>
                    <span>🔥</span>
                  </motion.div>

                  {/* Track Info */}
                  <h3 className="text-white font-bold text-sm xs:text-base sm:text-lg mb-1 xs:mb-2 line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-orange-400 group-hover:to-red-400 transition-all">
                    {track.title}
                  </h3>
                  <p className="text-slate-300 text-xs xs:text-sm mb-3 xs:mb-4 truncate font-medium">{track.artist}</p>

                  {/* Stats */}
                  <div className="flex items-center justify-between mb-3 xs:mb-4 text-[10px] xs:text-xs">
                    <span className="px-2 py-1 rounded-md bg-white/5 text-slate-400 font-bold">
                      {formatNumber(track.plays)} plays
                    </span>
                    <span className="px-2 py-0.5 rounded bg-white/5 text-slate-500" style={{ fontSize: '9px' }}>
                      {track.genre}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 xs:gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 py-2 xs:py-2.5 rounded-lg bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-700 hover:to-red-700 transition-all flex items-center justify-center gap-1.5 xs:gap-2 shadow-lg shadow-orange-500/30 font-bold text-[11px] xs:text-xs sm:text-sm"
                    >
                      <Play className="w-3 h-3 xs:w-4 xs:h-4" fill="white" />
                      <span>Play</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="flex items-center justify-center rounded-lg bg-white/5 text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-all border border-white/10"
                      style={{ width: 36, height: 36 }}
                    >
                      <Heart className="w-3.5 h-3.5 xs:w-4 xs:h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="flex items-center justify-center rounded-lg bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-all border border-white/10"
                      style={{ width: 36, height: 36 }}
                    >
                      <Share2 className="w-3.5 h-3.5 xs:w-4 xs:h-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!isLoading && tracks.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Flame className="w-12 h-12 xs:w-16 xs:h-16 text-slate-600 mx-auto mb-3 xs:mb-4" />
            <p className="text-slate-400 text-sm xs:text-base">Тренды скоро появятся</p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
