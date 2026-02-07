/**
 * NEW RELEASES SECTION - Новинки от музыкантов
 * Данные из таблицы tracks (или mock данные если таблица не готова)
 */

import { useState, useEffect } from 'react';
import { Sparkles, Play, Music2, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '@/lib/supabase-client';

interface Track {
  id: string;
  title: string;
  artist: string;
  cover_url: string | null;
  genre: string[] | null;
  release_date: string | null;
  created_at: string;
}

// Mock данные для демонстрации
const mockTracksData: Track[] = [
  { id: '1', title: 'Новый трек 2026', artist: 'Indie Band', cover_url: null, genre: ['Rock'], release_date: '2026-02-01', created_at: '2026-02-01' },
  { id: '2', title: 'Электронная мечта', artist: 'DJ Producer', cover_url: null, genre: ['Electronic'], release_date: '2026-02-03', created_at: '2026-02-03' },
  { id: '3', title: 'Летний вайб', artist: 'Summer Vibes', cover_url: null, genre: ['Pop'], release_date: '2026-02-04', created_at: '2026-02-04' },
  { id: '4', title: 'Городские огни', artist: 'City Lights', cover_url: null, genre: ['Hip-Hop'], release_date: '2026-02-05', created_at: '2026-02-05' },
  { id: '5', title: 'Ночная дорога', artist: 'Midnight Drive', cover_url: null, genre: ['Electronic'], release_date: '2026-02-06', created_at: '2026-02-06' },
  { id: '6', title: 'Свобода', artist: 'Freedom Sounds', cover_url: null, genre: ['Rock'], release_date: '2026-02-06', created_at: '2026-02-06' },
];

export function NewReleasesSection() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [useMockData, setUseMockData] = useState(false);

  useEffect(() => {
    loadNewReleases();
  }, []);

  const loadNewReleases = async () => {
    try {
      setLoading(true);
      
      // Пытаемся загрузить из Supabase (без фильтра по status)
      const { data, error } = await supabase
        .from('tracks')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(12);

      if (error) {
        // Таблица не готова - используем mock данные (это нормально для demo режима)
        if (import.meta.env.DEV) {
          console.info('🎵 Demo mode: using mock tracks data');
        }
        setUseMockData(true);
        setTracks(mockTracksData);
        return;
      }

      setUseMockData(false);
      setTracks(data || []);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error loading new releases:', error);
      }
      setUseMockData(true);
      setTracks(mockTracksData);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Недавно';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Сегодня';
    if (diffDays === 1) return 'Вчера';
    if (diffDays < 7) return `${diffDays} дней назад`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} недель назад`;
    return date.toLocaleDateString('ru-RU', { month: 'short', year: 'numeric' });
  };

  return (
    <section className="relative py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Свежие релизы</span>
          </div>
          
          <h2 className="text-4xl xs:text-5xl md:text-6xl font-bold text-white mb-4">
            Новинки
          </h2>
          <p className="text-lg xs:text-xl text-slate-400 max-w-2xl mx-auto">
            Последние треки от независимых артистов платформы
          </p>
        </motion.div>

        {/* Tracks Grid */}
        {loading ? (
          <div className="text-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="inline-block w-12 h-12 border-4 border-pink-500/20 border-t-pink-500 rounded-full"
            />
            <p className="text-slate-400 mt-4 font-medium">Загрузка новинок...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 xs:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {tracks.map((track, index) => (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -8, scale: 1.03 }}
                className="group relative cursor-pointer"
              >
                {/* Glow Effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-30 blur-lg transition-opacity" />
                
                {/* Cover Container */}
                <div className="relative">
                  {/* Cover */}
                  <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 bg-gradient-to-br from-slate-800 to-slate-900 border border-white/5 shadow-2xl">
                    {track.cover_url ? (
                      <img 
                        src={track.cover_url} 
                        alt={track.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600/30 via-pink-600/20 to-purple-600/30">
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Music2 className="w-12 h-12 text-slate-500" />
                        </motion.div>
                      </div>
                    )}
                    
                    {/* Enhanced Overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-600 to-purple-600 flex items-center justify-center text-white shadow-2xl shadow-pink-500/50 transform scale-75 group-hover:scale-100 transition-transform"
                      >
                        <Play className="w-7 h-7 ml-1" fill="white" />
                      </motion.button>
                    </div>

                    {/* Enhanced New Badge */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.05 + 0.2, type: "spring" }}
                      className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs font-black shadow-lg shadow-pink-500/50"
                    >
                      ✨ NEW
                    </motion.div>
                  </div>

                  {/* Enhanced Track Info */}
                  <div className="px-1">
                    <h3 className="text-white font-bold text-sm truncate mb-1.5 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-pink-400 group-hover:to-purple-400 transition-all">
                      {track.title}
                    </h3>
                    <p className="text-slate-300 text-xs truncate mb-2 font-medium">{track.artist}</p>
                    
                    {/* Enhanced Genre & Date */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {track.genre && track.genre.length > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-white/5 text-xs text-slate-400 font-medium">
                          {track.genre[0]}
                        </span>
                      )}
                      <span className="text-xs text-slate-500 font-medium">{formatDate(track.release_date || track.created_at)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && tracks.length === 0 && (
          <div className="text-center py-12">
            <Music2 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">Новинки скоро появятся</p>
          </div>
        )}

        {/* View All Button */}
        {tracks.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <button className="px-8 py-3 rounded-lg bg-white/5 backdrop-blur-xl border border-white/10 text-white hover:bg-white/10 hover:border-pink-500/30 transition-all">
              Показать все новинки
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
}