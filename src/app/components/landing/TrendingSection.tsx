/**
 * TRENDING SECTION - Популярные треки
 * Комбинация данных из чартов + популярных треков платформы
 */

import { useState, useEffect } from 'react';
import { Flame, Play, Heart, Share2, BarChart3 } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '@/lib/supabase-client';

interface TrendingTrack {
  id: string;
  title: string;
  artist: string;
  plays?: number;
  trend_score?: number;
  source?: string;
}

// Mock данные для демонстрации
const mockTrendingData: TrendingTrack[] = [
  { id: '1', title: 'Viral Hit 2026', artist: 'Trending Artist', plays: 15000, trend_score: 95, source: 'russkoe-radio' },
  { id: '2', title: 'Танцевальный хит', artist: 'Party Band', plays: 12500, trend_score: 88, source: 'dfm-radio' },
  { id: '3', title: 'Рок-баллада', artist: 'Rock Legends', plays: 11000, trend_score: 82, source: 'radio-maximum' },
  { id: '4', title: 'Городской стиль', artist: 'Urban Flow', plays: 9500, trend_score: 76, source: 'nashe-radio' },
  { id: '5', title: 'Летняя мелодия', artist: 'Summer Band', plays: 8200, trend_score: 70, source: 'russkoe-radio' },
  { id: '6', title: 'Ночной драйв', artist: 'Night Riders', plays: 7600, trend_score: 65, source: 'dfm-radio' },
  { id: '7', title: 'Классика жанра', artist: 'Genre Masters', plays: 6800, trend_score: 60, source: 'radio-maximum' },
  { id: '8', title: 'Новая волна', artist: 'Wave Makers', plays: 5900, trend_score: 55, source: 'nashe-radio' },
];

export function TrendingSection() {
  const [tracks, setTracks] = useState<TrendingTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<'day' | 'week' | 'month'>('week');
  const [useMockData, setUseMockData] = useState(false);

  useEffect(() => {
    loadTrending();
  }, [timeFilter]);

  const loadTrending = async () => {
    try {
      setLoading(true);
      
      // Пытаемся загрузить из Supabase
      const { data, error } = await supabase
        .from('radio_charts')
        .select('*')
        .order('weeks_in_chart', { ascending: false })
        .limit(8);

      if (error) {
        // Таблица не создана - используем mock данные (это нормально для demo режима)
        if (import.meta.env.DEV) {
          console.info('🔥 Demo mode: using mock trending data');
        }
        setUseMockData(true);
        setTracks(mockTrendingData);
        return;
      }

      // Преобразуем в формат TrendingTrack
      const trendingTracks: TrendingTrack[] = (data || []).map(track => ({
        id: track.id,
        title: track.track_title,
        artist: track.artist_name,
        plays: track.weeks_in_chart * 1000,
        trend_score: 100 - (track.position * 2),
        source: track.source,
      }));

      setUseMockData(false);
      setTracks(trendingTracks);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error loading trending:', error);
      }
      setUseMockData(true);
      setTracks(mockTrendingData);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <section className="relative py-20 px-4 overflow-hidden">
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
        className="absolute top-10 right-10 w-[400px] h-[400px] bg-gradient-to-br from-orange-600/30 to-red-600/30 rounded-full blur-3xl"
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
        className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-gradient-to-tl from-yellow-600/20 to-orange-600/20 rounded-full blur-3xl"
      />
      
      <div className="relative max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-flex items-center gap-2 px-6 py-3 mb-6 rounded-full bg-gradient-to-r from-orange-500/20 via-red-500/20 to-orange-500/20 backdrop-blur-xl border border-orange-500/30 text-orange-300 shadow-lg shadow-orange-500/20"
          >
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Flame className="w-5 h-5" />
            </motion.div>
            <span className="text-sm font-bold">Горячие треки</span>
          </motion.div>
          
          <h2 className="text-5xl xs:text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-orange-400 mb-4">
            Trending
          </h2>
          <p className="text-lg xs:text-xl text-slate-400 max-w-2xl mx-auto font-medium">
            Самые обсуждаемые и популярные треки прямо сейчас
          </p>
        </motion.div>

        {/* Enhanced Time Filter */}
        <div className="flex justify-center gap-3 mb-12">
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
              className={`relative px-8 py-3 rounded-xl text-sm font-bold transition-all overflow-hidden ${
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
              <span className="relative flex items-center gap-2">
                <span>{filter.icon}</span>
                {filter.label}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Tracks Grid */}
        {loading ? (
          <div className="text-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="inline-block w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full"
            />
            <p className="text-slate-400 mt-4 font-medium">Загрузка трендов...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 via-red-600 to-orange-600 rounded-2xl opacity-0 group-hover:opacity-40 blur-xl transition-opacity" />
                
                <div className="relative p-6 rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.03] backdrop-blur-xl border border-white/10 group-hover:border-orange-500/40 transition-all cursor-pointer overflow-hidden">
                  {/* Enhanced Rank Badge */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.08 + 0.2, type: "spring" }}
                    className="absolute -top-3 -left-3 w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 via-red-600 to-orange-500 flex items-center justify-center text-white font-black shadow-2xl shadow-orange-500/50 border-2 border-white/20"
                  >
                    {index + 1}
                  </motion.div>

                  {/* Enhanced Trend Score */}
                  {track.trend_score && (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/20 text-orange-300 text-sm font-bold mb-4 w-fit border border-orange-500/30"
                    >
                      <BarChart3 className="w-4 h-4" />
                      <span>{track.trend_score}%</span>
                      <span>🔥</span>
                    </motion.div>
                  )}

                  {/* Track Info */}
                  <h3 className="text-white font-bold text-lg mb-2 line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-orange-400 group-hover:to-red-400 transition-all">
                    {track.title}
                  </h3>
                  <p className="text-slate-300 text-sm mb-4 truncate font-medium">{track.artist}</p>

                  {/* Enhanced Stats */}
                  <div className="flex items-center justify-between mb-4 text-xs">
                    <span className="px-2 py-1 rounded-md bg-white/5 text-slate-400 font-bold">
                      {track.plays ? formatNumber(track.plays) : '—'} plays
                    </span>
                    {track.source && (
                      <span className="text-slate-500 truncate ml-2 text-[10px]">{track.source}</span>
                    )}
                  </div>

                  {/* Enhanced Actions */}
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-700 hover:to-red-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30 font-bold"
                    >
                      <Play className="w-4 h-4" fill="white" />
                      <span className="text-sm">Play</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-10 h-10 rounded-lg bg-white/5 text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-all flex items-center justify-center border border-white/10"
                    >
                      <Heart className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-10 h-10 rounded-lg bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center border border-white/10"
                    >
                      <Share2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && tracks.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Flame className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">Тренды скоро появятся</p>
          </motion.div>
        )}
      </div>
    </section>
  );
}