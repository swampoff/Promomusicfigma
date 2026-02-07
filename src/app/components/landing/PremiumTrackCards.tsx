/**
 * PREMIUM TRACK CARDS - Премиум карточки треков с glassmorphism
 */

import { motion } from 'motion/react';
import { Play, Pause, Heart, Share2, MoreHorizontal, TrendingUp, TrendingDown, Music, Headphones, Eye } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { useState } from 'react';

interface Track {
  id: string;
  title: string;
  artist: string;
  cover?: string;
  plays?: number;
  duration?: string;
  trend?: 'up' | 'down';
  trendValue?: number;
  rank?: number;
}

/**
 * TRACK CARD - Карточка трека в списке
 */
export function TrackCard({ track, index, isPlaying }: { track: Track; index: number; isPlaying?: boolean }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group"
    >
      <GlassCard 
        variant="hover" 
        blur="md" 
        className="p-3 relative overflow-hidden"
        hoverScale={false}
      >
        {/* Анимированный фон при hover */}
        <motion.div
          animate={{
            opacity: isHovered ? 1 : 0,
            scale: isHovered ? 1 : 0.8,
          }}
          className="absolute inset-0 bg-gradient-to-r from-[#FF577F]/10 to-purple-500/10"
        />

        <div className="relative z-10 flex items-center gap-3">
          {/* Ранг */}
          <div className="flex-shrink-0 w-8">
            {track.rank && track.rank <= 3 ? (
              <motion.div
                animate={{ rotate: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className={`
                  w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black
                  ${track.rank === 1 ? 'bg-gradient-to-br from-yellow-500 to-orange-500 shadow-lg shadow-yellow-500/50' : ''}
                  ${track.rank === 2 ? 'bg-gradient-to-br from-slate-300 to-slate-400 shadow-lg shadow-slate-400/50' : ''}
                  ${track.rank === 3 ? 'bg-gradient-to-br from-orange-600 to-orange-700 shadow-lg shadow-orange-600/50' : ''}
                `}
              >
                {track.rank}
              </motion.div>
            ) : (
              <span className="text-sm font-bold text-slate-500">{track.rank}</span>
            )}
          </div>

          {/* Кавер и кнопка play */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative flex-shrink-0"
          >
            {track.cover ? (
              <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                <img 
                  src={track.cover} 
                  alt={track.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#FF577F]/20 to-purple-500/20 flex items-center justify-center backdrop-blur-sm border border-white/10">
                <Music className="w-5 h-5 text-white/60" />
              </div>
            )}

            {/* Кнопка Play/Pause */}
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: isHovered ? 1 : 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-lg"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-white" fill="white" />
              ) : (
                <Play className="w-5 h-5 text-white" fill="white" />
              )}
            </motion.button>
          </motion.div>

          {/* Информация о треке */}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold truncate mb-0.5 group-hover:text-[#FF577F] transition-colors">
              {track.title}
            </h4>
            <p className="text-xs text-slate-400 truncate">{track.artist}</p>
          </div>

          {/* Тренд */}
          {track.trend && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
                track.trend === 'up' 
                  ? 'bg-emerald-500/20 text-emerald-400' 
                  : 'bg-red-500/20 text-red-400'
              }`}
            >
              {track.trend === 'up' ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span className="text-xs font-bold">{track.trendValue}</span>
            </motion.div>
          )}

          {/* Длительность */}
          {track.duration && (
            <span className="text-xs text-slate-500 font-mono">{track.duration}</span>
          )}

          {/* Действия при hover */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : -10 }}
            className="flex items-center gap-2"
          >
            <motion.button
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsFavorite(!isFavorite)}
              className={`transition-colors ${
                isFavorite ? 'text-[#FF577F]' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Heart className="w-4 h-4" fill={isFavorite ? 'currentColor' : 'none'} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
            </motion.button>
          </motion.div>
        </div>

        {/* Прогресс бар при проигрывании */}
        {isPlaying && (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 3, ease: "linear" }}
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#FF577F] to-purple-500 origin-left"
          />
        )}
      </GlassCard>
    </motion.div>
  );
}

/**
 * FEATURED TRACK CARD - Большая карточка featured трека
 */
export function FeaturedTrackCard({ track }: { track: Track & { description?: string; image?: string } }) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <GlassCard variant="premium" blur="lg" className="relative overflow-hidden group">
      {/* Фоновое изображение */}
      {track.image && (
        <>
          <div className="absolute inset-0">
            <img 
              src={track.image} 
              alt={track.title}
              className="w-full h-full object-cover opacity-30"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/60 backdrop-blur-sm" />
        </>
      )}

      {/* Контент */}
      <div className="relative z-10 p-6">
        {/* Бейдж Featured */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#FF577F] to-purple-500 mb-4 shadow-lg shadow-[#FF577F]/30"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </motion.div>
          <span className="text-xs font-black text-white">FEATURED</span>
        </motion.div>

        {/* Информация */}
        <h3 className="text-2xl font-black mb-2 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
          {track.title}
        </h3>
        <p className="text-lg text-slate-300 mb-3">{track.artist}</p>

        {track.description && (
          <p className="text-sm text-slate-400 mb-4 line-clamp-2">{track.description}</p>
        )}

        {/* Статистика */}
        <div className="flex items-center gap-4 mb-6">
          {track.plays && (
            <div className="flex items-center gap-1.5 text-slate-400">
              <Headphones className="w-4 h-4" />
              <span className="text-sm font-bold">{(track.plays / 1000000).toFixed(1)}M</span>
            </div>
          )}
          {track.trend && (
            <div className={`flex items-center gap-1 ${
              track.trend === 'up' ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {track.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span className="text-sm font-bold">#{track.rank}</span>
            </div>
          )}
        </div>

        {/* Кнопка воспроизведения */}
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-8 py-3 rounded-full bg-gradient-to-r from-[#FF577F] to-purple-500 text-white font-bold shadow-lg shadow-[#FF577F]/30 flex items-center gap-2"
          >
            {isPlaying ? (
              <>
                <Pause className="w-5 h-5" fill="white" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-5 h-5" fill="white" />
                Play Now
              </>
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <Heart className="w-5 h-5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <Share2 className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Плавающие частицы */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 10 }).map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              delay: i * 0.5,
            }}
            className="absolute w-1 h-1 bg-white/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>
    </GlassCard>
  );
}

/**
 * COMPACT TRACK CARD - Компактная карточка трека
 */
export function CompactTrackCard({ track }: { track: Track }) {
  return (
    <motion.div
      whileHover={{ x: 4 }}
      className="group"
    >
      <GlassCard variant="hover" blur="sm" className="p-2.5 flex items-center gap-2.5" hoverScale={false}>
        {/* Иконка или кавер */}
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FF577F]/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
          <Music className="w-4 h-4 text-white/60" />
        </div>

        {/* Информация */}
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold truncate group-hover:text-[#FF577F] transition-colors">
            {track.title}
          </h4>
          <p className="text-[10px] text-slate-400 truncate">{track.artist}</p>
        </div>

        {/* Кнопка play */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-8 h-8 rounded-full bg-[#FF577F]/20 hover:bg-[#FF577F] flex items-center justify-center flex-shrink-0 transition-colors group"
        >
          <Play className="w-3.5 h-3.5 text-white" fill="white" />
        </motion.button>
      </GlassCard>
    </motion.div>
  );
}

import { Sparkles } from 'lucide-react';
