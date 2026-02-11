/**
 * NEW RELEASES SECTION - Новинки от музыкантов Promo.music
 * Данные из API (KV Store) через useNewTracks hook с fallback на mock
 */

import { useState } from 'react';
import { Sparkles, Play, Music2, Wifi, WifiOff, Loader2, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { useNewTracks } from '@/hooks/useLandingData';
import type { LandingTrack } from '@/hooks/useLandingData';

interface DisplayTrack {
  id: string;
  title: string;
  artist: string;
  cover_url: string | null;
  genre: string;
  plays: number;
  release_date: string;
}

// Mock данные - 12 артистов Promo.music
const mockTracksData: DisplayTrack[] = [
  { id: 'nr-1', title: 'Огни города', artist: 'Сандра', cover_url: null, genre: 'Pop', plays: 354000, release_date: '2026-02-08' },
  { id: 'nr-2', title: 'FLEX', artist: 'Тимур', cover_url: null, genre: 'Hip-Hop', plays: 312000, release_date: '2026-02-07' },
  { id: 'nr-3', title: 'Neon Dreams', artist: 'Дэн', cover_url: null, genre: 'Electronic', plays: 298000, release_date: '2026-02-06' },
  { id: 'nr-4', title: 'Ночные волны', artist: 'Стелла', cover_url: null, genre: 'Deep House', plays: 267000, release_date: '2026-02-05' },
  { id: 'nr-5', title: 'На бите', artist: 'Максам', cover_url: null, genre: 'Trap', plays: 245000, release_date: '2026-02-04' },
  { id: 'nr-6', title: 'Midnight Soul', artist: 'Лиана', cover_url: null, genre: 'R&B', plays: 215000, release_date: '2026-02-03' },
  { id: 'nr-7', title: 'Feel the Groove', artist: 'Марк', cover_url: null, genre: 'Funk', plays: 187000, release_date: '2026-02-02' },
  { id: 'nr-8', title: 'Signal', artist: 'Ева', cover_url: null, genre: 'Indie Pop', plays: 167000, release_date: '2026-02-01' },
  { id: 'nr-9', title: 'Мост', artist: 'Роман', cover_url: null, genre: 'Rock', plays: 145000, release_date: '2026-01-31' },
  { id: 'nr-10', title: 'Rainy Afternoon', artist: 'Артём', cover_url: null, genre: 'Jazz', plays: 134000, release_date: '2026-01-30' },
  { id: 'nr-11', title: 'Gravity', artist: 'Кира', cover_url: null, genre: 'Pop', plays: 123000, release_date: '2026-01-29' },
  { id: 'nr-12', title: 'Bassline Theory', artist: 'Влад', cover_url: null, genre: 'Drum & Bass', plays: 112000, release_date: '2026-01-28' },
];

// Цветовые градиенты для обложек
const COVER_GRADIENTS = [
  'from-pink-600/40 via-purple-600/30 to-pink-600/40',
  'from-cyan-600/40 via-blue-600/30 to-cyan-600/40',
  'from-violet-600/40 via-indigo-600/30 to-violet-600/40',
  'from-amber-600/40 via-orange-600/30 to-amber-600/40',
  'from-emerald-600/40 via-teal-600/30 to-emerald-600/40',
  'from-rose-600/40 via-red-600/30 to-rose-600/40',
  'from-indigo-600/40 via-purple-600/30 to-indigo-600/40',
  'from-fuchsia-600/40 via-pink-600/30 to-fuchsia-600/40',
  'from-sky-600/40 via-blue-600/30 to-sky-600/40',
  'from-lime-600/40 via-green-600/30 to-lime-600/40',
  'from-orange-600/40 via-amber-600/30 to-orange-600/40',
  'from-teal-600/40 via-cyan-600/30 to-teal-600/40',
];

function formatNumber(num: number) {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
  return num.toString();
}

export function NewReleasesSection() {
  const { data: serverTracks, isLoading, error } = useNewTracks(12);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Конвертация серверных треков в DisplayTrack[]
  const apiTracks: DisplayTrack[] = serverTracks
    ? serverTracks.map((t: LandingTrack) => ({
        id: t.id,
        title: t.title,
        artist: t.artist,
        cover_url: t.cover || null,
        genre: t.genre || 'Music',
        plays: t.plays || 0,
        release_date: t.releaseDate || t.createdAt || '2026-01-01',
      }))
    : [];

  const tracks = apiTracks.length > 0 ? apiTracks : mockTracksData;
  const fromServer = apiTracks.length > 0;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Сегодня';
    if (diffDays === 1) return 'Вчера';
    if (diffDays < 7) return `${diffDays} дн. назад`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} нед. назад`;
    return date.toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' });
  };

  return (
    <section className="relative py-12 xs:py-16 sm:py-20 px-3 xs:px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 xs:mb-10 sm:mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 xs:px-4 py-1.5 xs:py-2 mb-4 xs:mb-6 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300">
            <Sparkles className="w-3.5 h-3.5 xs:w-4 xs:h-4" />
            <span className="text-[11px] xs:text-xs sm:text-sm font-medium">Свежие релизы</span>
          </div>

          <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2 xs:mb-3 sm:mb-4">
            Новинки
          </h2>
          <p className="text-sm xs:text-base sm:text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
            Последние треки от артистов Promo.music
          </p>
        </motion.div>

        {/* Data Source Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center mb-4 xs:mb-6"
        >
          {isLoading ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-[10px] xs:text-xs">
              <Loader2 className="w-3 h-3 animate-spin" />
              Загрузка из API...
            </span>
          ) : fromServer ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-[10px] xs:text-xs">
              <Wifi className="w-3 h-3" />
              Supabase KV - {tracks.length} треков
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-yellow-400 text-[10px] xs:text-xs">
              <WifiOff className="w-3 h-3" />
              Демо-данные
              {error && <span className="text-yellow-500/60 ml-1">- {error}</span>}
            </span>
          )}
        </motion.div>

        {/* Tracks Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 xs:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 xs:gap-4 sm:gap-5 md:gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square rounded-xl xs:rounded-2xl bg-white/5 mb-2 xs:mb-3" style={{ animationDelay: `${i * 80}ms` }} />
                <div className="h-3 bg-white/5 rounded mb-1.5 w-3/4" />
                <div className="h-2.5 bg-white/5 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 xs:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 xs:gap-4 sm:gap-5 md:gap-6">
            {tracks.map((track, index) => (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.04 }}
                whileHover={{ y: -8, scale: 1.03 }}
                className="group relative cursor-pointer"
                onMouseEnter={() => setHoveredIdx(index)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Glow Effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl xs:rounded-2xl opacity-0 group-hover:opacity-30 blur-lg transition-opacity" />

                {/* Cover Container */}
                <div className="relative">
                  {/* Cover */}
                  <div className="relative aspect-square rounded-xl xs:rounded-2xl overflow-hidden mb-2 xs:mb-3 bg-gradient-to-br from-slate-800 to-slate-900 border border-white/5 shadow-2xl">
                    {track.cover_url ? (
                      <img
                        src={track.cover_url}
                        alt={track.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br ${COVER_GRADIENTS[index % COVER_GRADIENTS.length]}`}>
                        <Music2 className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 text-white/40 mb-1" />
                        <span className="text-[8px] xs:text-[9px] text-white/30 font-bold">{track.genre}</span>
                      </div>
                    )}

                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="flex items-center justify-center rounded-full bg-gradient-to-br from-pink-600 to-purple-600 text-white shadow-2xl shadow-pink-500/50 transform scale-75 group-hover:scale-100 transition-transform"
                        style={{ width: 48, height: 48 }}
                      >
                        <Play className="w-5 h-5 ml-0.5" fill="white" />
                      </motion.button>
                    </div>

                    {/* NEW Badge */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.04 + 0.2, type: "spring" }}
                      className="absolute top-1.5 right-1.5 xs:top-2 xs:right-2 sm:top-3 sm:right-3 px-1.5 xs:px-2 sm:px-3 py-0.5 xs:py-1 sm:py-1.5 rounded-md xs:rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 text-white font-black shadow-lg shadow-pink-500/50"
                      style={{ fontSize: '9px' }}
                    >
                      NEW
                    </motion.div>

                    {/* Play count badge */}
                    {track.plays > 0 && (
                      <div className="absolute bottom-1.5 left-1.5 xs:bottom-2 xs:left-2 px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-md bg-black/60 backdrop-blur-sm text-white/80 font-mono font-bold" style={{ fontSize: '9px' }}>
                        {formatNumber(track.plays)}
                      </div>
                    )}
                  </div>

                  {/* Track Info */}
                  <div className="px-0.5 xs:px-1">
                    <h3 className="text-white font-bold text-[11px] xs:text-xs sm:text-sm truncate mb-0.5 xs:mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-pink-400 group-hover:to-purple-400 transition-all">
                      {track.title}
                    </h3>
                    <p className="text-slate-400 text-[10px] xs:text-[11px] sm:text-xs truncate mb-1 xs:mb-1.5 font-medium">{track.artist}</p>

                    {/* Genre & Date */}
                    <div className="flex items-center gap-1 xs:gap-1.5 flex-wrap">
                      <span className="px-1.5 xs:px-2 py-0.5 rounded-md bg-white/5 text-slate-500 font-medium" style={{ fontSize: '8px' }}>
                        {track.genre}
                      </span>
                      <span className="text-slate-600 font-medium" style={{ fontSize: '8px' }}>
                        {formatDate(track.release_date)}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!isLoading && tracks.length === 0 && (
          <div className="text-center py-12">
            <Music2 className="w-12 h-12 xs:w-16 xs:h-16 text-slate-600 mx-auto mb-3 xs:mb-4" />
            <p className="text-slate-400 text-sm xs:text-base">Новинки скоро появятся</p>
          </div>
        )}

        {/* View All Button */}
        {tracks.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-8 xs:mt-10 sm:mt-12"
          >
            <button className="px-6 xs:px-8 py-2.5 xs:py-3 rounded-lg bg-white/5 backdrop-blur-xl border border-white/10 text-white text-xs xs:text-sm hover:bg-white/10 hover:border-pink-500/30 transition-all">
              Показать все новинки
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
}