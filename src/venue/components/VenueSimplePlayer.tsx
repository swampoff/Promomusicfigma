/**
 * VENUE SIMPLE PLAYER - Упрощённый плеер для заведения
 * 
 * Минимальное управление:
 * - Play/Pause
 * - Stop
 * - Volume
 * 
 * Реальное управление контентом - через админ-панель платформы
 */

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Play, Pause, Square, Volume2, VolumeX, Volume1, Music, Radio as RadioIcon } from 'lucide-react';
import { useVenuePlayer } from '../contexts/VenuePlayerContext';
import { RadioPlayerStatus } from './RadioPlayerStatus';
import { PromoLogo, promoLogo } from '@/app/components/promo-logo';

interface VenueSimplePlayerProps {
  venueId: string;
  className?: string;
}

export function VenueSimplePlayer({ venueId, className = '' }: VenueSimplePlayerProps) {
  const player = useVenuePlayer();
  
  const [currentTrack, setCurrentTrack] = useState({
    title: 'ПРОМО.МУЗЫКА Радио',
    artist: 'Ожидание подключения...',
    cover: promoLogo,
    hasCover: false,
  });

  // Загружаем демо-трек при первом рендере
  useEffect(() => {
    if (!player.currentTrack) {
      // Создаём демо-трек с логотипом ПРОМО.МУЗЫКА
      const demoTrack = {
        id: 'demo-1',
        title: 'ПРОМО.МУЗЫКА Радио',
        artist: 'Демо-эфир',
        coverUrl: '', // Без обложки - PromoLogo компонент отобразит иконку
        duration: 180,
        albumId: 'demo-album',
        artistId: 'demo-artist',
        playlistId: 'demo-playlist',
        position: 1,
        createdAt: new Date().toISOString()
      };
      
      player.loadTrack(demoTrack);
      console.log('🎵 [VenueSimplePlayer] Загружен демо-трек с логотипом ПРОМО.МУЗЫКА');
    }
  }, [player]);

  useEffect(() => {
    if (player.currentTrack) {
      setCurrentTrack({
        title: player.currentTrack.title,
        artist: player.currentTrack.artist,
        cover: player.currentTrack.coverUrl || promoLogo,
        hasCover: !!player.currentTrack.coverUrl,
      });
    }
  }, [player.currentTrack]);

  const handlePlayPause = useCallback(() => {
    player.togglePlayPause();
  }, [player]);

  const handleStop = useCallback(() => {
    player.pause();
    // TODO: Опционально - сброс на начало трека
    // player.seek(0);
  }, [player]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    player.setVolume(newVolume);
  }, [player]);

  const handleToggleMute = useCallback(() => {
    player.toggleMute();
  }, [player]);

  const getVolumeIcon = () => {
    if (player.isMuted || player.volume === 0) return VolumeX;
    if (player.volume < 0.5) return Volume1;
    return Volume2;
  };

  const VolumeIcon = getVolumeIcon();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`${className}`}>
      {/* Статус подключения */}
      <div className="mb-3 sm:mb-4">
        <RadioPlayerStatus venueId={venueId} />
      </div>

      {/* Основной плеер */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#0a0a14] via-purple-900/20 to-[#0a0a14] border border-white/10 shadow-2xl overflow-hidden"
      >
        {/* Фоновый градиент с обложкой */}
        <div className="absolute inset-0 opacity-20">
          <img
            src={currentTrack.cover}
            alt=""
            className="w-full h-full object-cover blur-3xl"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a14] via-purple-900/50 to-transparent" />
        </div>

        {/* Контент */}
        <div className="relative p-3 sm:p-4 md:p-6">
          {/* Обложка и информация */}
          <div className="flex flex-col items-center gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6">
            {/* Обложка */}
            <div className="relative flex-shrink-0">
              <motion.div
                animate={player.isPlaying ? {
                  scale: [1, 1.02, 1],
                } : {}}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-pink-500/20"
              >
                {currentTrack.hasCover ? (
                  <img
                    src={currentTrack.cover}
                    alt={currentTrack.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <PromoLogo
                    showText={false}
                    size="xl"
                    animated={false}
                    glowOnHover
                    glowColor="#a855f7"
                    customClasses={{ logo: 'w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36' }}
                  />
                )}
                {player.isPlaying && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                    <div className="flex gap-1">
                      <div className="w-1 h-6 sm:h-8 bg-white animate-pulse" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-1 h-6 sm:h-8 bg-white animate-pulse" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-1 h-6 sm:h-8 bg-white animate-pulse" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Индикатор "В ЭФИРЕ" */}
              {player.isPlaying && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 sm:px-3 py-1 rounded-full bg-red-500 text-white text-xs font-bold shadow-lg flex items-center gap-1.5"
                >
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  В ЭФИРЕ
                </motion.div>
              )}
            </div>

            {/* Информация о треке */}
            <div className="w-full text-center min-w-0">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1 sm:mb-2 truncate px-2">
                {currentTrack.title}
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-slate-400 truncate mb-2 sm:mb-3 px-2">
                {currentTrack.artist}
              </p>
              
              {/* Время */}
              <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-slate-400">
                <span>{formatTime(player.currentTime)}</span>
                <span>/</span>
                <span>{formatTime(player.duration)}</span>
              </div>
            </div>
          </div>

          {/* Прогресс бар */}
          <div className="mb-4 sm:mb-6">
            <div className="w-full h-1.5 sm:h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ 
                  width: `${player.duration > 0 ? (player.currentTime / player.duration) * 100 : 0}%` 
                }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Управление */}
          <div className="space-y-4 sm:space-y-6">
            {/* Кнопки Play/Pause/Stop */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4">
              {/* Stop */}
              <motion.button
                onClick={handleStop}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-all"
              >
                <Square className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
              </motion.button>

              {/* Play/Pause */}
              <motion.button
                onClick={handlePlayPause}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 shadow-2xl shadow-purple-500/50 flex items-center justify-center text-white transition-all"
              >
                {player.isPlaying ? (
                  <Pause className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" />
                ) : (
                  <Play className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 ml-1" />
                )}
              </motion.button>

              {/* Placeholder для симметрии */}
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16" />
            </div>

            {/* Регулятор громкости */}
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 px-1 sm:px-2 md:px-4">
              {/* Иконка */}
              <motion.button
                onClick={handleToggleMute}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all flex-shrink-0"
              >
                <VolumeIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
              </motion.button>

              {/* Слайдер */}
              <div className="flex-1 relative">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={player.isMuted ? 0 : player.volume}
                  onChange={handleVolumeChange}
                  className="w-full h-1.5 sm:h-2 bg-white/10 rounded-full appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none 
                    [&::-webkit-slider-thumb]:w-3 
                    [&::-webkit-slider-thumb]:h-3 
                    sm:[&::-webkit-slider-thumb]:w-4 
                    sm:[&::-webkit-slider-thumb]:h-4 
                    [&::-webkit-slider-thumb]:rounded-full 
                    [&::-webkit-slider-thumb]:bg-white 
                    [&::-webkit-slider-thumb]:shadow-lg
                    [&::-webkit-slider-thumb]:cursor-pointer
                    [&::-webkit-slider-thumb]:hover:scale-110
                    [&::-webkit-slider-thumb]:transition-transform
                    [&::-moz-range-thumb]:w-3 
                    [&::-moz-range-thumb]:h-3 
                    sm:[&::-moz-range-thumb]:w-4 
                    sm:[&::-moz-range-thumb]:h-4 
                    [&::-moz-range-thumb]:rounded-full 
                    [&::-moz-range-thumb]:bg-white 
                    [&::-moz-range-thumb]:border-0
                    [&::-moz-range-thumb]:shadow-lg
                    [&::-moz-range-thumb]:cursor-pointer"
                />
                {/* Прогресс */}
                <div 
                  className="absolute top-1/2 left-0 h-1.5 sm:h-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full pointer-events-none -translate-y-1/2"
                  style={{ width: `${((player.isMuted ? 0 : player.volume) || 0) * 100}%` }}
                />
              </div>

              {/* Значение громкости */}
              <div className="w-10 sm:w-12 text-center text-white font-medium text-xs sm:text-sm flex-shrink-0">
                {Math.round(((player.isMuted ? 0 : player.volume) || 0) * 100)}%
              </div>
            </div>
          </div>

          {/* Информационное сообщение */}
          <div className="mt-4 sm:mt-6 p-2.5 sm:p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <div className="flex items-start gap-2 text-xs sm:text-sm text-blue-300">
              <RadioIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5" />
              <p>
                Управление контентом происходит автоматически через платформу ПРОМО.МУЗЫКА. 
                Здесь доступно только базовое управление воспроизведением.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Дополнительная информация */}
      <div className="mt-3 sm:mt-4 grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
        <div className="p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
            <Music className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />
            <span className="text-xs text-slate-400">Статус</span>
          </div>
          <div className="text-xs sm:text-sm md:text-base font-medium text-white">
            {player.isPlaying ? 'Воспроизведение' : 'Пауза'}
          </div>
        </div>

        <div className="p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
            <RadioIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />
            <span className="text-xs text-slate-400">Режим</span>
          </div>
          <div className="text-xs sm:text-sm md:text-base font-medium text-white">
            Авто-эфир
          </div>
        </div>
      </div>
    </div>
  );
}