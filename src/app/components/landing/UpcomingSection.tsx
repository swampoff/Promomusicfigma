import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Music, Play, User } from 'lucide-react';

interface NewRelease {
  id: string;
  title: string;
  artist_name?: string;
  genre?: string;
  cover_url?: string;
  audio_url?: string;
  created_at?: string;
}

export function UpcomingSection() {
  const [releases, setReleases] = useState<NewRelease[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReleases();
  }, []);

  async function loadReleases() {
    try {
      const res = await fetch('/server/api/landing-data/tracks/new?limit=6');
      const data = await res.json();
      if (data.success && data.data) {
        setReleases(data.data.slice(0, 6));
      }
    } catch (err) {
      console.error('Failed to load new releases:', err);
    } finally {
      setIsLoading(false);
    }
  }

  function timeAgo(dateStr?: string) {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'только что';
    if (hours < 24) return `${hours}ч назад`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'вчера';
    if (days < 7) return `${days}д назад`;
    return `${Math.floor(days / 7)}нед назад`;
  }

  if (!isLoading && releases.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <div className="flex items-center justify-between mb-4 xs:mb-5 sm:mb-6">
        <h2 className="text-xl xs:text-2xl sm:text-3xl font-black flex items-center gap-2 xs:gap-3">
          <Sparkles className="w-5 h-5 xs:w-6 xs:h-6 text-[#FF577F]" />
          <span className="bg-gradient-to-r from-[#FF577F] to-purple-500 text-transparent bg-clip-text">Скоро</span>
        </h2>
        <span className="text-xs xs:text-sm text-slate-500 font-medium">Новые релизы</span>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {releases.map((track, idx) => (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * idx }}
              className="group relative rounded-xl overflow-hidden bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] hover:border-[#FF577F]/30 transition-all duration-300 cursor-pointer"
            >
              <div className="flex gap-3 p-3 xs:p-4">
                {/* Cover */}
                <div className="flex-shrink-0 w-14 h-14 xs:w-16 xs:h-16 rounded-xl overflow-hidden bg-gradient-to-br from-[#FF577F]/20 to-purple-500/20 border border-[#FF577F]/20 relative">
                  {track.cover_url ? (
                    <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Music className="w-6 h-6 text-white/40" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-5 h-5 text-white" />
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm xs:text-base font-bold text-white truncate mb-1">
                    {track.title}
                  </h3>
                  {track.artist_name && (
                    <p className="text-xs text-white/50 truncate flex items-center gap-1 mb-1">
                      <User className="w-3 h-3 flex-shrink-0" />
                      {track.artist_name}
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    {track.genre && (
                      <span className="text-[10px] xs:text-xs px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 font-medium">
                        {track.genre}
                      </span>
                    )}
                    {track.created_at && (
                      <span className="text-[10px] xs:text-xs text-white/30">
                        {timeAgo(track.created_at)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
