/**
 * TOP CHARTS SECTION - TOP 20 из чартов радиостанций
 * Данные из таблицы radio_charts (или mock данные если таблица не создана)
 */

import { useState, useEffect } from 'react';
import { TrendingUp, Radio, Play, ChevronUp, ChevronDown, Minus } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '@/lib/supabase-client';
import { DataSourceIndicator } from './DataSourceIndicator';

interface ChartTrack {
  id: string;
  position: number;
  track_title: string;
  artist_name: string;
  previous_position: number | null;
  weeks_in_chart: number;
  source: string;
}

// Mock данные для демонстрации (если таблица не создана)
const mockChartData: ChartTrack[] = [
  { id: '1', position: 1, track_title: 'Мой рок-н-ролл', artist_name: 'Кино', previous_position: 2, weeks_in_chart: 3, source: 'russkoe-radio' },
  { id: '2', position: 2, track_title: 'Группа крови', artist_name: 'Кино', previous_position: 1, weeks_in_chart: 5, source: 'russkoe-radio' },
  { id: '3', position: 3, track_title: 'Звезда по имени Солнце', artist_name: 'Кино', previous_position: 4, weeks_in_chart: 2, source: 'nashe-radio' },
  { id: '4', position: 4, track_title: 'Владивосток 2000', artist_name: 'Мумий Тролль', previous_position: 5, weeks_in_chart: 4, source: 'radio-maximum' },
  { id: '5', position: 5, track_title: 'Лето', artist_name: 'ДДТ', previous_position: 3, weeks_in_chart: 6, source: 'nashe-radio' },
  { id: '6', position: 6, track_title: 'Танцуй', artist_name: 'Градусы', previous_position: 8, weeks_in_chart: 1, source: 'dfm-radio' },
  { id: '7', position: 7, track_title: 'Небо славян', artist_name: 'Алиса', previous_position: 7, weeks_in_chart: 3, source: 'nashe-radio' },
  { id: '8', position: 8, track_title: 'Я свободен', artist_name: 'Кипелов', previous_position: 10, weeks_in_chart: 2, source: 'radio-maximum' },
];

export function TopChartsSection() {
  const [tracks, setTracks] = useState<ChartTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [useMockData, setUseMockData] = useState(false);

  const sources = [
    { id: 'all', name: 'Все радио', icon: '📻' },
    { id: 'russkoe-radio', name: 'Русское Радио', icon: '🇷🇺' },
    { id: 'radio-maximum', name: 'Maximum', icon: '🎸' },
    { id: 'nashe-radio', name: 'Наше Радио', icon: '🎤' },
    { id: 'dfm-radio', name: 'DFM', icon: '' },
  ];

  useEffect(() => {
    loadTopTracks();
  }, [selectedSource]);

  const loadTopTracks = async () => {
    try {
      setLoading(true);
      
      // Пытаемся загрузить из Supabase
      let query = supabase
        .from('radio_charts')
        .select('*')
        .order('chart_date', { ascending: false })
        .order('position', { ascending: true })
        .limit(20);

      if (selectedSource !== 'all') {
        query = query.eq('source', selectedSource);
      }

      const { data, error } = await query;

      if (error) {
        // Таблица не создана - используем mock данные (это нормально для demo режима)
        if (import.meta.env.DEV) {
          console.info('📊 Demo mode: using mock chart data');
        }
        setUseMockData(true);
        const filteredMockData = selectedSource === 'all' 
          ? mockChartData 
          : mockChartData.filter(t => t.source === selectedSource);
        setTracks(filteredMockData);
        return;
      }

      setUseMockData(false);
      setTracks(data || []);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error loading charts:', error);
      }
      // Fallback to mock data
      setUseMockData(true);
      const filteredMockData = selectedSource === 'all' 
        ? mockChartData 
        : mockChartData.filter(t => t.source === selectedSource);
      setTracks(filteredMockData);
    } finally {
      setLoading(false);
    }
  };

  const getPositionChange = (current: number, previous: number | null) => {
    if (!previous) return { type: 'new', value: 0 };
    const change = previous - current;
    if (change > 0) return { type: 'up', value: change };
    if (change < 0) return { type: 'down', value: Math.abs(change) };
    return { type: 'same', value: 0 };
  };

  return (
    <section className="relative py-20 px-4 overflow-hidden">
      {/* Enhanced Background with parallax effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-purple-950/10 to-slate-950" />
      
      {/* Animated Grid Pattern */}
      <motion.div
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')`,
          backgroundSize: '60px 60px',
        }}
      />
      
      {/* Floating Music Notes */}
      {[...Array(10)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl opacity-10"
          animate={{
            y: [0, -100, 0],
            x: Math.random() * 50 - 25,
            opacity: [0, 0.2, 0],
            rotate: [0, 360],
          }}
          transition={{
            duration: 5 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 5,
          }}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        >
          {['🎵', '🎶', '🎸', '🎹', '🎤'][Math.floor(Math.random() * 5)]}
        </motion.div>
      ))}

      <div className="relative max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-12 px-4"
        >
          <motion.div
            animate={{
              boxShadow: [
                '0 0 20px rgba(168, 85, 247, 0.3)',
                '0 0 40px rgba(236, 72, 153, 0.4)',
                '0 0 20px rgba(168, 85, 247, 0.3)',
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="inline-flex items-center gap-2.5 px-5 py-2.5 sm:px-6 sm:py-3 mb-6 sm:mb-8 rounded-full bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 backdrop-blur-xl border border-purple-500/30 text-purple-300 text-xs sm:text-sm"
          >
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="font-bold tracking-wide">TOP 20 Charts</span>
            <motion.span
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="text-xs"
            >
              ⭐
            </motion.span>
          </motion.div>
          
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-4 sm:mb-6">
            <motion.span
              className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{
                backgroundSize: '200% 200%',
              }}
            >
              Топ Чарты
            </motion.span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
            Актуальные хиты из ротаций ведущих радиостанций России
          </p>
        </motion.div>

        {/* Enhanced Source Filter with animations */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10 sm:mb-12 px-4">
          {sources.map((source) => (
            <motion.button
              key={source.id}
              onClick={() => setSelectedSource(source.id)}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className={`relative px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all overflow-hidden ${
                selectedSource === source.id
                  ? 'text-white shadow-2xl'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10 backdrop-blur-xl border border-white/10'
              }`}
            >
              {selectedSource === source.id && (
                <>
                  <motion.div
                    layoutId="activeSource"
                    className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                  <motion.div
                    animate={{
                      x: ['-100%', '100%'],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  />
                </>
              )}
              <span className="relative flex items-center gap-2">
                <span className="text-base sm:text-lg">{source.icon}</span>
                <span className="hidden xs:inline font-semibold tracking-wide">{source.name}</span>
              </span>
            </motion.button>
          ))}
        </div>

        {/* Tracks List */}
        {loading ? (
          <div className="text-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="inline-block w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full"
            />
            <p className="text-slate-400 mt-4 font-medium">Загрузка чартов...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity" />
                  
                  <div className="relative p-5 rounded-xl bg-gradient-to-br from-white/[0.07] to-white/[0.03] backdrop-blur-xl border border-white/10 group-hover:border-purple-500/30 transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                      {/* Enhanced Position Badge */}
                      <div className="flex-shrink-0 w-16 text-center">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          className={`text-3xl font-black mb-1 ${
                            track.position <= 3 
                              ? 'text-transparent bg-clip-text bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500'
                              : track.position <= 10
                              ? 'text-transparent bg-clip-text bg-gradient-to-br from-purple-400 to-pink-500'
                              : 'text-slate-400'
                          }`}
                        >
                          {track.position}
                        </motion.div>
                        
                        {/* Enhanced Position Change Indicator */}
                        {positionChange.type === 'up' && (
                          <div className="flex items-center justify-center gap-0.5 px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-bold">
                            <ChevronUp className="w-3 h-3" />
                            <span>{positionChange.value}</span>
                          </div>
                        )}
                        {positionChange.type === 'down' && (
                          <div className="flex items-center justify-center gap-0.5 px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-bold">
                            <ChevronDown className="w-3 h-3" />
                            <span>{positionChange.value}</span>
                          </div>
                        )}
                        {positionChange.type === 'same' && (
                          <div className="flex items-center justify-center px-2 py-0.5 rounded-full bg-slate-500/20 text-slate-400 text-xs">
                            <Minus className="w-3 h-3" />
                          </div>
                        )}
                        {positionChange.type === 'new' && (
                          <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-300 text-xs font-black"
                          >
                            NEW
                          </motion.div>
                        )}
                      </div>

                      {/* Enhanced Track Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-bold text-lg truncate group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 transition-all">
                          {track.track_title}
                        </h3>
                        <p className="text-slate-300 text-sm truncate font-medium">{track.artist_name}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="px-2 py-0.5 rounded-md bg-white/5 text-xs text-slate-400 font-medium">
                            {track.weeks_in_chart} {track.weeks_in_chart === 1 ? 'неделя' : 'недель'}
                          </span>
                          {track.position <= 5 && (
                            <span className="px-2 py-0.5 rounded-md bg-yellow-500/10 text-yellow-400 text-xs font-bold">
                              🔥 HOT
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Enhanced Play Button */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/30 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Play className="w-5 h-5 ml-0.5" fill="white" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {!loading && tracks.length === 0 && (
          <div className="text-center py-12">
            <Radio className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">Чарты скоро появятся</p>
          </div>
        )}
      </div>
    </section>
  );
}