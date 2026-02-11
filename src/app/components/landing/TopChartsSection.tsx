/**
 * TOP CHARTS SECTION - TOP 20 из Promo.music
 * Данные из API (KV Store) через useWeeklyChart hook с fallback на mock
 * Используется в MainLandingPage
 */

import { TrendingUp, Radio, Play, ChevronUp, ChevronDown, Minus, Wifi, WifiOff, Loader2, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { useWeeklyChart } from '@/hooks/useLandingData';
import type { ChartEntry } from '@/utils/api/landing-data';

interface ChartTrack {
  id: string;
  position: number;
  track_title: string;
  artist_name: string;
  previous_position: number;
  weeks_in_chart: number;
  plays: number;
  genre: string;
}

// Mock данные - артисты Promo.music
const mockChartData: ChartTrack[] = [
  { id: 'tc-1', position: 1, track_title: 'Огни города', artist_name: 'Сандра', previous_position: 2, weeks_in_chart: 5, plays: 354000, genre: 'Pop' },
  { id: 'tc-2', position: 2, track_title: 'FLEX', artist_name: 'Тимур', previous_position: 1, weeks_in_chart: 7, plays: 312000, genre: 'Hip-Hop' },
  { id: 'tc-3', position: 3, track_title: 'Neon Dreams', artist_name: 'Дэн', previous_position: 5, weeks_in_chart: 3, plays: 298000, genre: 'Electronic' },
  { id: 'tc-4', position: 4, track_title: 'Ночные волны', artist_name: 'Стелла', previous_position: 3, weeks_in_chart: 6, plays: 267000, genre: 'Deep House' },
  { id: 'tc-5', position: 5, track_title: 'На бите', artist_name: 'Максам', previous_position: 7, weeks_in_chart: 4, plays: 245000, genre: 'Trap' },
  { id: 'tc-6', position: 6, track_title: 'Midnight Soul', artist_name: 'Лиана', previous_position: 4, weeks_in_chart: 8, plays: 215000, genre: 'R&B' },
  { id: 'tc-7', position: 7, track_title: 'Feel the Groove', artist_name: 'Марк', previous_position: 8, weeks_in_chart: 2, plays: 187000, genre: 'Funk' },
  { id: 'tc-8', position: 8, track_title: 'Signal', artist_name: 'Ева', previous_position: 6, weeks_in_chart: 5, plays: 167000, genre: 'Indie Pop' },
  { id: 'tc-9', position: 9, track_title: 'Мост', artist_name: 'Роман', previous_position: 10, weeks_in_chart: 3, plays: 145000, genre: 'Rock' },
  { id: 'tc-10', position: 10, track_title: 'Rainy Afternoon', artist_name: 'Артём', previous_position: 9, weeks_in_chart: 4, plays: 134000, genre: 'Jazz' },
  { id: 'tc-11', position: 11, track_title: 'Gravity', artist_name: 'Кира', previous_position: 14, weeks_in_chart: 2, plays: 123000, genre: 'Pop' },
  { id: 'tc-12', position: 12, track_title: 'Bassline Theory', artist_name: 'Влад', previous_position: 11, weeks_in_chart: 6, plays: 112000, genre: 'Drum & Bass' },
  { id: 'tc-13', position: 13, track_title: 'Рассвет', artist_name: 'Сандра', previous_position: 15, weeks_in_chart: 1, plays: 105000, genre: 'Pop' },
  { id: 'tc-14', position: 14, track_title: 'Двигай', artist_name: 'Тимур', previous_position: 12, weeks_in_chart: 3, plays: 98000, genre: 'Hip-Hop' },
  { id: 'tc-15', position: 15, track_title: 'Afterglow', artist_name: 'Дэн', previous_position: 13, weeks_in_chart: 4, plays: 91000, genre: 'Electronic' },
  { id: 'tc-16', position: 16, track_title: 'Deep Water', artist_name: 'Стелла', previous_position: 18, weeks_in_chart: 2, plays: 84000, genre: 'Deep House' },
  { id: 'tc-17', position: 17, track_title: 'Freestyle', artist_name: 'Максам', previous_position: 16, weeks_in_chart: 5, plays: 77000, genre: 'Trap' },
  { id: 'tc-18', position: 18, track_title: 'Golden Hour', artist_name: 'Лиана', previous_position: 20, weeks_in_chart: 1, plays: 70000, genre: 'R&B' },
  { id: 'tc-19', position: 19, track_title: 'Retro Funk', artist_name: 'Марк', previous_position: 17, weeks_in_chart: 3, plays: 63000, genre: 'Funk' },
  { id: 'tc-20', position: 20, track_title: 'Pixel Storm', artist_name: 'Ева', previous_position: 19, weeks_in_chart: 2, plays: 56000, genre: 'Indie Pop' },
];

function formatNumber(num: number) {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
  return num.toString();
}

export function TopChartsSection() {
  const { data: weeklyChart, isLoading, error, refetch } = useWeeklyChart();

  // Конвертация серверного чарта
  const apiTracks: ChartTrack[] = weeklyChart?.entries
    ? weeklyChart.entries.map((e: ChartEntry) => ({
        id: e.trackId,
        position: e.position,
        track_title: e.title,
        artist_name: e.artist,
        previous_position: e.previousPosition,
        weeks_in_chart: e.weeksOnChart || 1,
        plays: e.plays || 0,
        genre: e.genre || 'Music',
      }))
    : [];

  const tracks = apiTracks.length > 0 ? apiTracks : mockChartData;
  const fromServer = apiTracks.length > 0;

  const getPositionChange = (current: number, previous: number) => {
    const change = previous - current;
    if (change > 0) return { type: 'up', value: change };
    if (change < 0) return { type: 'down', value: Math.abs(change) };
    return { type: 'same', value: 0 };
  };

  return (
    <section className="relative py-12 xs:py-16 sm:py-20 px-3 xs:px-4 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-purple-950/10 to-slate-950" />

      {/* Animated Grid Pattern */}
      <motion.div
        animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-6 xs:mb-8 sm:mb-10 md:mb-12 px-2 xs:px-4"
        >
          <motion.div
            className="inline-flex items-center gap-2 xs:gap-2.5 px-4 xs:px-5 sm:px-6 py-2 xs:py-2.5 sm:py-3 mb-4 xs:mb-6 sm:mb-8 rounded-full bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 backdrop-blur-xl border border-purple-500/30 text-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.3)]"
          >
            <TrendingUp className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
            <span className="text-[10px] xs:text-xs sm:text-sm font-bold tracking-wide">Promo.music TOP 20</span>
          </motion.div>

          <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-2 xs:mb-3 sm:mb-4 md:mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600">
              Топ Чарты
            </span>
          </h2>
          <p className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
            Еженедельный чарт от Promo.music - {weeklyChart?.period || 'Текущая неделя'}
          </p>
        </motion.div>

        {/* Data Source Indicator */}
        <div className="flex justify-center items-center gap-2 xs:gap-3 mb-6 xs:mb-8 sm:mb-10 md:mb-12">
          {isLoading ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-[10px] xs:text-xs">
              <Loader2 className="w-3 h-3 animate-spin" />
              Загрузка чарта...
            </span>
          ) : fromServer ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-[10px] xs:text-xs">
              <Wifi className="w-3 h-3" />
              Supabase KV - {tracks.length} позиций
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-yellow-400 text-[10px] xs:text-xs">
              <WifiOff className="w-3 h-3" />
              Демо-данные
              {error && <span className="text-yellow-500/60 ml-1">- {error}</span>}
            </span>
          )}
          <button
            onClick={() => refetch()}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title="Обновить чарт"
          >
            <RefreshCw className="w-3 h-3 xs:w-3.5 xs:h-3.5" />
          </button>
        </div>

        {/* Tracks List */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 xs:gap-3 sm:gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="animate-pulse p-3 xs:p-4 sm:p-5 rounded-lg xs:rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-3 xs:gap-4">
                  <div className="w-10 xs:w-12 sm:w-16 flex-shrink-0">
                    <div className="h-7 xs:h-8 bg-white/5 rounded w-full mb-1" />
                    <div className="h-4 bg-white/5 rounded w-2/3 mx-auto" />
                  </div>
                  <div className="flex-1">
                    <div className="h-4 xs:h-5 bg-white/5 rounded mb-1.5 w-3/4" />
                    <div className="h-3 xs:h-4 bg-white/5 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 xs:gap-3 sm:gap-4">
            {tracks.map((track, index) => {
              const positionChange = getPositionChange(track.position, track.previous_position);

              return (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.03 }}
                  whileHover={{ y: -4, scale: 1.01 }}
                  className="group relative overflow-hidden"
                >
                  {/* Gradient Border Effect */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg xs:rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity" />

                  <div className="relative p-3 xs:p-4 sm:p-5 rounded-lg xs:rounded-xl bg-gradient-to-br from-white/[0.07] to-white/[0.03] backdrop-blur-xl border border-white/10 group-hover:border-purple-500/30 transition-all cursor-pointer">
                    <div className="flex items-center gap-2.5 xs:gap-3 sm:gap-4">
                      {/* Position Badge */}
                      <div className="flex-shrink-0 text-center" style={{ width: 48 }}>
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          className={`text-xl xs:text-2xl sm:text-3xl font-black mb-0.5 xs:mb-1 ${
                            track.position <= 3
                              ? 'text-transparent bg-clip-text bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500'
                              : track.position <= 10
                              ? 'text-transparent bg-clip-text bg-gradient-to-br from-purple-400 to-pink-500'
                              : 'text-slate-400'
                          }`}
                        >
                          {track.position}
                        </motion.div>

                        {/* Position Change */}
                        {positionChange.type === 'up' && (
                          <div className="flex items-center justify-center gap-0.5 px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-400 font-bold" style={{ fontSize: '9px' }}>
                            <ChevronUp className="w-2.5 h-2.5" />
                            <span>{positionChange.value}</span>
                          </div>
                        )}
                        {positionChange.type === 'down' && (
                          <div className="flex items-center justify-center gap-0.5 px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 font-bold" style={{ fontSize: '9px' }}>
                            <ChevronDown className="w-2.5 h-2.5" />
                            <span>{positionChange.value}</span>
                          </div>
                        )}
                        {positionChange.type === 'same' && (
                          <div className="flex items-center justify-center px-1.5 py-0.5 rounded-full bg-slate-500/20 text-slate-400" style={{ fontSize: '9px' }}>
                            <Minus className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </div>

                      {/* Track Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-bold text-sm xs:text-base sm:text-lg truncate group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 transition-all">
                          {track.track_title}
                        </h3>
                        <p className="text-slate-300 text-[11px] xs:text-xs sm:text-sm truncate font-medium">{track.artist_name}</p>
                        <div className="flex items-center gap-1.5 xs:gap-2 mt-1 xs:mt-2">
                          <span className="px-1.5 xs:px-2 py-0.5 rounded-md bg-white/5 text-slate-400 font-medium" style={{ fontSize: '9px' }}>
                            {track.weeks_in_chart} нед.
                          </span>
                          {track.plays > 0 && (
                            <span className="text-slate-500 font-mono font-bold" style={{ fontSize: '9px' }}>
                              {formatNumber(track.plays)} plays
                            </span>
                          )}
                          {track.position <= 5 && (
                            <span className="px-1.5 py-0.5 rounded-md bg-yellow-500/10 text-yellow-400 font-bold" style={{ fontSize: '9px' }}>
                              HOT
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Genre + Play Button */}
                      <div className="flex items-center gap-1.5 xs:gap-2 flex-shrink-0">
                        <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-white/5 text-slate-500 font-medium" style={{ fontSize: '9px' }}>
                          {track.genre}
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex-shrink-0 flex items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30 opacity-0 group-hover:opacity-100 transition-all"
                          style={{ width: 36, height: 36 }}
                        >
                          <Play className="w-4 h-4 ml-0.5" fill="white" />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {!isLoading && tracks.length === 0 && (
          <div className="text-center py-12">
            <Radio className="w-12 h-12 xs:w-16 xs:h-16 text-slate-600 mx-auto mb-3 xs:mb-4" />
            <p className="text-slate-400 text-sm xs:text-base">Чарты скоро появятся</p>
          </div>
        )}
      </div>
    </section>
  );
}