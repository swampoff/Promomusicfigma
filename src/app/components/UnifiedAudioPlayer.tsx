/**
 * UNIFIED AUDIO PLAYER - Единый аудиоплеер (как на promofm.ru)
 *
 * Фиксированная панель внизу экрана:
 * - Обложка трека + название + артист
 * - Реальное воспроизведение через HTML5 Audio
 * - Прогресс-бар с возможностью перемотки
 * - Кнопки: предыдущий, play/pause, следующий
 * - Shuffle (Fisher-Yates), Repeat (off/one/all)
 * - Громкость с сохранением
 * - Playlist drawer с удалением треков
 * - Полноэкранный мобильный режим (свайп вверх)
 * - Если нет аудио - кнопка "Слушать на оригинале"
 */

import { useState, useCallback, useEffect } from 'react';
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  X, Heart, Music, Repeat, Repeat1, Shuffle, ChevronDown,
  ListMusic, MoreHorizontal, ExternalLink, Loader2, Gift, Trash2
} from 'lucide-react';
import { motion, AnimatePresence, useMotionValue } from 'motion/react';
import { useUnifiedPlayer } from '@/contexts/UnifiedPlayerContext';
import type { UnifiedTrack } from '@/contexts/UnifiedPlayerContext';
import { DonateModal } from '@/app/components/DonateModal';

export function UnifiedAudioPlayer() {
  const {
    currentTrack,
    playlist,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isLoading,
    hasAudio,
    isShuffle,
    repeatMode,
    togglePlay,
    playNext,
    playPrev,
    seekToPercent,
    setVolume,
    toggleMute,
    closePlayer,
    playTrack,
    toggleShuffle,
    cycleRepeat,
    removeTrack,
    clearPlaylist,
  } = useUnifiedPlayer();

  const [isLiked, setIsLiked] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [donateOpen, setDonateOpen] = useState(false);
  const dragY = useMotionValue(0);

  // Close fullscreen on escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (fullscreenOpen) setFullscreenOpen(false);
        else if (drawerOpen) setDrawerOpen(false);
      }
      // Пробел для play/pause (если не в input)
      if (e.key === ' ' && currentTrack && hasAudio) {
        const tag = (e.target as HTMLElement).tagName;
        if (tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT' && !(e.target as HTMLElement).isContentEditable) {
          e.preventDefault();
          togglePlay();
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [fullscreenOpen, drawerOpen, currentTrack, hasAudio, togglePlay]);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!hasAudio) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    seekToPercent(pct);
  }, [hasAudio, seekToPercent]);

  const formatTime = (t: number) => {
    if (!t || isNaN(t) || !isFinite(t)) return '0:00';
    return `${Math.floor(t / 60)}:${Math.floor(t % 60).toString().padStart(2, '0')}`;
  };

  const handleDragEnd = (_: any, info: { offset: { y: number } }) => {
    if (info.offset.y < -80) setFullscreenOpen(true);
  };

  const handleFullscreenDragEnd = (_: any, info: { offset: { y: number } }) => {
    if (info.offset.y > 80) setFullscreenOpen(false);
  };

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!currentTrack) return null;

  // ── Repeat button rendering ──
  const RepeatButton = ({ size = 'sm', className = '' }: { size?: 'sm' | 'md'; className?: string }) => {
    const iconSize = size === 'md' ? 'w-5 h-5' : 'w-3.5 h-3.5';
    const isActive = repeatMode !== 'off';
    return (
      <button
        onClick={cycleRepeat}
        className={`transition-colors relative ${isActive ? 'text-[#FF577F]' : 'text-slate-500 hover:text-white'} ${className}`}
        title={repeatMode === 'off' ? 'Повтор выкл' : repeatMode === 'all' ? 'Повтор всех' : 'Повтор одного'}
      >
        {repeatMode === 'one' ? (
          <Repeat1 className={iconSize} />
        ) : (
          <Repeat className={iconSize} />
        )}
        {repeatMode === 'all' && (
          <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-[#FF577F]" />
        )}
      </button>
    );
  };

  // ── Shuffle button ──
  const ShuffleButton = ({ size = 'sm', className = '' }: { size?: 'sm' | 'md'; className?: string }) => {
    const iconSize = size === 'md' ? 'w-5 h-5' : 'w-3.5 h-3.5';
    return (
      <button
        onClick={toggleShuffle}
        className={`transition-colors ${isShuffle ? 'text-[#FF577F]' : 'text-slate-500 hover:text-white'} ${className}`}
        title={isShuffle ? 'Выкл. перемешивание' : 'Перемешать'}
      >
        <Shuffle className={iconSize} />
      </button>
    );
  };

  const CoverImage = ({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) => {
    const sizeClasses = {
      sm: 'w-10 h-10',
      md: 'w-12 h-12 md:w-14 md:h-14',
      lg: 'w-full h-full',
    };
    if (currentTrack.cover) {
      return (
        <img
          src={currentTrack.cover}
          alt={currentTrack.title}
          className={`${sizeClasses[size]} object-cover ${className || ''}`}
        />
      );
    }
    return (
      <div className={`${sizeClasses[size]} bg-gradient-to-br from-[#FF577F]/30 to-purple-500/30 flex items-center justify-center ${className || ''}`}>
        <Music className={size === 'lg' ? 'w-16 h-16 text-[#FF577F]/60' : 'w-5 h-5 text-[#FF577F]'} />
      </div>
    );
  };

  return (
    <div className="contents">
      {/* === PLAYLIST DRAWER === */}
      <AnimatePresence>
        {drawerOpen && (
          <div className="contents">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[88]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-[68px] w-[340px] lg:w-[380px] z-[89] bg-black/95 backdrop-blur-2xl border-l border-white/10 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <ListMusic className="w-4 h-4 text-[#FF577F]" />
                  <h3 className="text-sm font-bold">Очередь воспроизведения</h3>
                  <span className="text-[10px] text-slate-500 bg-white/5 px-1.5 py-0.5 rounded-md font-mono">{playlist.length}</span>
                </div>
                <div className="flex items-center gap-1">
                  {playlist.length > 0 && (
                    <button
                      onClick={clearPlaylist}
                      className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center hover:bg-red-500/10 hover:text-red-400 transition-colors text-slate-500"
                      title="Очистить очередь"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                  <button onClick={() => setDrawerOpen(false)} className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                    <X className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* Now Playing */}
              <div className="px-4 py-3 bg-[#FF577F]/5 border-b border-white/5">
                <div className="text-[10px] text-[#FF577F] font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-[#FF577F] rounded-full animate-pulse" />
                  Сейчас играет
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                    <CoverImage size="sm" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white truncate">{currentTrack.title}</p>
                    <p className="text-xs text-slate-400 truncate">{currentTrack.artist}</p>
                  </div>
                  {isPlaying && hasAudio && (
                    <div className="flex items-end gap-[2px] h-4">
                      {[0, 1, 2].map(i => (
                        <motion.div
                          key={i}
                          animate={{ height: ['3px', '14px', '3px'] }}
                          transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
                          className="w-[2px] bg-[#FF577F] rounded-full"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Playlist Items */}
              <div className="flex-1 overflow-y-auto scrollbar-hide">
                <div className="px-2 py-2">
                  <div className="text-[10px] text-slate-600 font-bold uppercase tracking-wider px-2 mb-2">Далее</div>
                  {playlist.length > 0 ? playlist.map((item, idx) => (
                    <motion.div
                      key={`${item.id}-${idx}`}
                      whileHover={{ x: 3, backgroundColor: 'rgba(255,255,255,0.05)' }}
                      className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg transition-all group ${
                        item.id === currentTrack.id ? 'bg-[#FF577F]/10' : ''
                      }`}
                    >
                      <button
                        onClick={() => playTrack(item)}
                        className="flex items-center gap-3 flex-1 min-w-0"
                      >
                        <span className="w-5 text-center text-[10px] text-slate-600 font-mono">
                          {item.id === currentTrack.id ? (
                            <div className="flex items-end justify-center gap-[1px] h-3">
                              {[0, 1, 2].map(i => (
                                <motion.div
                                  key={i}
                                  animate={isPlaying && hasAudio ? { height: ['2px', '10px', '2px'] } : { height: '2px' }}
                                  transition={{ duration: 0.6, repeat: isPlaying ? Infinity : 0, delay: i * 0.12 }}
                                  className="w-[1.5px] bg-[#FF577F] rounded-full"
                                />
                              ))}
                            </div>
                          ) : idx + 1}
                        </span>
                        <div className="w-8 h-8 rounded-md overflow-hidden flex-shrink-0 border border-white/5">
                          {item.cover ? (
                            <img src={item.cover} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-white/5 flex items-center justify-center">
                              <Music className={`w-3.5 h-3.5 ${item.id === currentTrack.id ? 'text-[#FF577F]' : 'text-slate-600'}`} />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1 text-left">
                          <p className={`text-xs font-bold truncate ${item.id === currentTrack.id ? 'text-[#FF577F]' : 'text-white'}`}>{item.title}</p>
                          <p className="text-[10px] text-slate-500 truncate">{item.artist}</p>
                        </div>
                      </button>
                      {!item.audioUrl && (
                        <ExternalLink className="w-3 h-3 text-slate-600 shrink-0" />
                      )}
                      <span className="text-[10px] text-slate-600 font-mono opacity-0 group-hover:opacity-100 transition-opacity shrink-0">{item.duration || '—'}</span>
                      {item.id !== currentTrack.id && (
                        <button
                          onClick={() => removeTrack(item.id)}
                          className="w-6 h-6 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-slate-600 hover:text-red-400 hover:bg-red-500/10 shrink-0"
                          title="Убрать из очереди"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </motion.div>
                  )) : (
                    <div className="text-center py-8 text-xs text-slate-600">
                      <ListMusic className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      Очередь пуста
                    </div>
                  )}
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] text-slate-600">{playlist.length} треков</span>
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${isShuffle ? 'bg-[#FF577F]/20' : 'bg-white/5'}`}>
                    <ShuffleButton size="sm" />
                  </div>
                  <div className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${repeatMode !== 'off' ? 'bg-[#FF577F]/20' : 'bg-white/5'}`}>
                    <RepeatButton size="sm" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* === FULLSCREEN MOBILE PLAYER === */}
      <AnimatePresence>
        {fullscreenOpen && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={handleFullscreenDragEnd}
            className="fixed inset-0 z-[95] bg-black flex flex-col"
          >
            {/* Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {currentTrack.cover && (
                <img src={currentTrack.cover} alt="" className="absolute inset-0 w-full h-full object-cover opacity-10 blur-3xl scale-110" />
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black" />
            </div>

            {/* Drag handle */}
            <div className="relative flex-shrink-0 pt-3 pb-2 flex justify-center">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            {/* Header */}
            <div className="relative flex items-center justify-between px-5 pb-4">
              <button onClick={() => setFullscreenOpen(false)} className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center">
                <ChevronDown className="w-5 h-5 text-slate-400" />
              </button>
              <div className="text-center">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Сейчас играет</p>
              </div>
              <button className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center">
                <MoreHorizontal className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Cover Art */}
            <div className="relative flex-1 flex items-center justify-center px-10">
              <motion.div
                animate={isPlaying && hasAudio ? { scale: [1, 1.02, 1] } : { scale: 1 }}
                transition={{ duration: 3, repeat: isPlaying ? Infinity : 0, ease: "easeInOut" }}
                className="relative w-full max-w-[320px] aspect-square"
              >
                <div className="absolute -inset-4 bg-gradient-to-br from-[#FF577F]/30 to-purple-500/30 rounded-3xl blur-2xl" />
                <div className="relative w-full h-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                  {currentTrack.cover ? (
                    <img src={currentTrack.cover} alt={currentTrack.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#FF577F]/20 to-purple-500/20 flex items-center justify-center">
                      <Music className="w-16 h-16 text-[#FF577F]/60" />
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Track Info */}
            <div className="relative px-8 pt-6 pb-2">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-black text-white truncate">{currentTrack.title}</h2>
                  <p className="text-sm text-slate-400 mt-0.5 truncate">{currentTrack.artist}</p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => setIsLiked(!isLiked)}
                  className="ml-4 flex-shrink-0"
                >
                  <Heart className={`w-6 h-6 transition-colors ${isLiked ? 'text-[#FF577F] fill-[#FF577F]' : 'text-slate-600'}`} />
                </motion.button>
              </div>
            </div>

            {/* No audio fallback */}
            {!hasAudio && currentTrack.originalUrl && (
              <div className="relative px-8 py-3">
                <a
                  href={currentTrack.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#FF577F] to-purple-500 text-white font-semibold text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  Слушать на оригинальной странице
                </a>
              </div>
            )}

            {/* Progress Bar */}
            {hasAudio && (
              <div className="relative px-8 py-3">
                <div className="h-1.5 rounded-full bg-white/5 cursor-pointer" onClick={handleSeek}>
                  <div className="h-full rounded-full bg-gradient-to-r from-[#FF577F] to-purple-500 relative transition-all" style={{ width: `${pct}%` }}>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-lg shadow-[#FF577F]/30 -mr-2" />
                  </div>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-[10px] text-slate-600 font-mono">{formatTime(currentTime)}</span>
                  <span className="text-[10px] text-slate-600 font-mono">{formatTime(duration)}</span>
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="relative flex items-center justify-center gap-6 px-8 py-4">
              <ShuffleButton size="md" />
              <motion.button whileTap={{ scale: 0.9 }} onClick={playPrev} className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                <SkipBack className="w-5 h-5 text-white" />
              </motion.button>
              {hasAudio ? (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={togglePlay}
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF577F] to-purple-500 flex items-center justify-center shadow-xl shadow-[#FF577F]/30"
                >
                  {isLoading ? (
                    <Loader2 className="w-7 h-7 text-white animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="w-7 h-7 text-white" fill="white" />
                  ) : (
                    <Play className="w-7 h-7 text-white ml-1" fill="white" />
                  )}
                </motion.button>
              ) : currentTrack.originalUrl ? (
                <a
                  href={currentTrack.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF577F] to-purple-500 flex items-center justify-center shadow-xl shadow-[#FF577F]/30"
                >
                  <ExternalLink className="w-7 h-7 text-white" />
                </a>
              ) : (
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                  <Music className="w-7 h-7 text-slate-500" />
                </div>
              )}
              <motion.button whileTap={{ scale: 0.9 }} onClick={playNext} className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                <SkipForward className="w-5 h-5 text-white" />
              </motion.button>
              <RepeatButton size="md" />
            </div>

            {/* Bottom actions */}
            <div className="relative flex items-center justify-center gap-8 px-8 pt-2 pb-10">
              <button
                onClick={() => setDonateOpen(true)}
                className="text-yellow-500 hover:text-yellow-400 transition-colors"
              >
                <Gift className="w-5 h-5" />
              </button>
              <button
                onClick={() => { setFullscreenOpen(false); setTimeout(() => setDrawerOpen(true), 300); }}
                className="text-slate-600 hover:text-white transition-colors"
              >
                <ListMusic className="w-5 h-5" />
              </button>
              <button className="text-slate-600 hover:text-white transition-colors flex items-center gap-1">
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* === MINI BAR === */}
      {!fullscreenOpen && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-[90]"
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-2xl" />
          {/* Progress line at top */}
          {hasAudio && (
            <>
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/5">
                <div className="h-full bg-gradient-to-r from-[#FF577F] via-purple-500 to-[#FF577F] transition-all" style={{ width: `${pct}%` }} />
              </div>
              {isPlaying && (
                <motion.div animate={{ x: ['-100%', '100%'] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute top-0 left-0 w-1/3 h-[2px] bg-gradient-to-r from-transparent via-[#FF577F] to-transparent" />
              )}
            </>
          )}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {/* MOBILE mini-bar */}
          <motion.div
            className="relative sm:hidden"
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.3}
            onDragEnd={handleDragEnd}
          >
            <div className="px-3 py-2.5">
              <div className="flex justify-center mb-1">
                <div className="w-8 h-0.5 rounded-full bg-white/10" />
              </div>
              <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0 w-11 h-11 rounded-lg overflow-hidden">
                  {currentTrack.cover ? (
                    <img src={currentTrack.cover} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#FF577F]/30 to-purple-500/30 flex items-center justify-center border border-white/10">
                      <Music className="w-5 h-5 text-[#FF577F]" />
                    </div>
                  )}
                  {isPlaying && hasAudio && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <div className="flex items-end gap-[2px] h-4">
                        {[0, 1, 2].map(i => (
                          <motion.div key={i} animate={{ height: ['3px', '14px', '3px'] }}
                            transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
                            className="w-[2px] bg-white rounded-full" />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{currentTrack.title}</p>
                  <p className="text-[10px] text-slate-500 truncate">{currentTrack.artist}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <motion.button onClick={() => setIsLiked(!isLiked)} whileTap={{ scale: 0.85 }} className="w-8 h-8 rounded-full flex items-center justify-center">
                    <Heart className={`w-4 h-4 transition-colors ${isLiked ? 'text-[#FF577F] fill-[#FF577F]' : 'text-slate-500'}`} />
                  </motion.button>
                  {hasAudio ? (
                    <motion.button onClick={togglePlay} whileTap={{ scale: 0.9 }}
                      className="w-9 h-9 rounded-full bg-gradient-to-br from-[#FF577F] to-purple-500 flex items-center justify-center shadow-lg shadow-[#FF577F]/20">
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 text-white animate-spin" />
                      ) : isPlaying ? (
                        <Pause className="w-4 h-4 text-white" fill="white" />
                      ) : (
                        <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
                      )}
                    </motion.button>
                  ) : currentTrack.originalUrl ? (
                    <a
                      href={currentTrack.originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-full bg-gradient-to-br from-[#FF577F] to-purple-500 flex items-center justify-center shadow-lg shadow-[#FF577F]/20"
                    >
                      <ExternalLink className="w-4 h-4 text-white" />
                    </a>
                  ) : null}
                  <motion.button onClick={closePlayer} whileTap={{ scale: 0.85 }} className="w-8 h-8 rounded-full flex items-center justify-center">
                    <X className="w-4 h-4 text-slate-500" />
                  </motion.button>
                </div>
              </div>
              {hasAudio && (
                <div className="mt-2 h-1 rounded-full bg-white/5 cursor-pointer" onClick={handleSeek}>
                  <div className="h-full rounded-full bg-gradient-to-r from-[#FF577F] to-purple-500 transition-all duration-300" style={{ width: `${pct}%` }} />
                </div>
              )}
            </div>
          </motion.div>

          {/* DESKTOP mini-bar */}
          <div className="relative hidden sm:block">
            <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-3">
              <div className="flex items-center gap-4 md:gap-6">
                {/* Left: Track Info with Cover */}
                <div className="flex items-center gap-3 min-w-0 w-[200px] md:w-[280px] flex-shrink-0">
                  <div className="relative flex-shrink-0 group">
                    <div className="absolute -inset-1 bg-gradient-to-br from-[#FF577F] to-purple-500 rounded-xl opacity-30 blur-lg group-hover:opacity-50 transition-opacity" />
                    <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                      {currentTrack.cover ? (
                        <img src={currentTrack.cover} alt={currentTrack.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#FF577F]/30 to-purple-500/30 flex items-center justify-center">
                          <Music className="w-6 h-6 text-[#FF577F]" />
                        </div>
                      )}
                      {isPlaying && hasAudio && (
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <div className="flex items-end gap-[2px] h-5">
                            {[0, 1, 2, 3].map(i => (
                              <motion.div key={i} animate={{ height: ['3px', '16px', '3px'] }}
                                transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.12, ease: "easeInOut" }}
                                className="w-[2px] bg-white rounded-full" />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white truncate">{currentTrack.title}</p>
                    <p className="text-xs text-slate-400 truncate">{currentTrack.artist}</p>
                  </div>
                  <motion.button onClick={() => setIsLiked(!isLiked)} whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.85 }} className="flex-shrink-0 hidden md:block">
                    <Heart className={`w-4 h-4 transition-colors ${isLiked ? 'text-[#FF577F] fill-[#FF577F]' : 'text-slate-600 hover:text-slate-400'}`} />
                  </motion.button>
                  <motion.button
                    onClick={() => setDonateOpen(true)}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.85 }}
                    title="Поддержать артиста"
                    className="flex-shrink-0 hidden md:block"
                  >
                    <Gift className="w-4 h-4 text-yellow-500 hover:text-yellow-400 transition-colors" />
                  </motion.button>
                </div>

                {/* Center: Controls + Progress */}
                <div className="flex flex-col items-center gap-1.5 flex-1 max-w-2xl">
                  <div className="flex items-center gap-3 md:gap-4">
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      className="hidden md:flex w-8 h-8 rounded-full items-center justify-center">
                      <ShuffleButton />
                    </motion.div>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={playPrev}
                      className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-white/5">
                      <SkipBack className="w-4 h-4" />
                    </motion.button>
                    {hasAudio ? (
                      <motion.button onClick={togglePlay} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
                        className="relative w-10 h-10 md:w-11 md:h-11 rounded-full bg-gradient-to-br from-[#FF577F] to-purple-500 flex items-center justify-center text-white shadow-xl shadow-[#FF577F]/25 hover:shadow-[#FF577F]/40 transition-all">
                        {isLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : isPlaying ? (
                          <Pause className="w-5 h-5" fill="white" />
                        ) : (
                          <Play className="w-5 h-5 ml-0.5" fill="white" />
                        )}
                      </motion.button>
                    ) : currentTrack.originalUrl ? (
                      <a
                        href={currentTrack.originalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative w-10 h-10 md:w-11 md:h-11 rounded-full bg-gradient-to-br from-[#FF577F] to-purple-500 flex items-center justify-center text-white shadow-xl shadow-[#FF577F]/25 hover:shadow-[#FF577F]/40 transition-all"
                        title="Слушать на оригинальной странице"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    ) : (
                      <div className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-white/10 flex items-center justify-center">
                        <Music className="w-5 h-5 text-slate-500" />
                      </div>
                    )}
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={playNext}
                      className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-white/5">
                      <SkipForward className="w-4 h-4" />
                    </motion.button>
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      className="hidden md:flex w-8 h-8 rounded-full items-center justify-center">
                      <RepeatButton />
                    </motion.div>
                  </div>
                  {hasAudio && (
                    <div className="w-full flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 font-mono tabular-nums w-8 text-right">{formatTime(currentTime)}</span>
                      <div className="relative flex-1 h-1 group cursor-pointer rounded-full" onClick={handleSeek}>
                        <div className="absolute inset-0 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-[#FF577F] to-purple-500 rounded-full relative transition-all" style={{ width: `${pct}%` }}>
                            {isPlaying && (
                              <motion.div animate={{ x: ['-100%', '100%'] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                            )}
                          </div>
                        </div>
                        <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ left: `calc(${pct}% - 6px)` }} />
                        <div className="absolute -top-2 -bottom-2 left-0 right-0" />
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono tabular-nums w-8">{formatTime(duration)}</span>
                    </div>
                  )}
                  {!hasAudio && currentTrack.originalUrl && (
                    <a
                      href={currentTrack.originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-[10px] text-[#FF577F] hover:text-[#FF577F]/80 font-semibold transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Слушать на оригинальной странице
                    </a>
                  )}
                </div>

                {/* Right: Volume + Queue */}
                <div className="flex items-center gap-2 md:gap-3 w-[160px] md:w-[220px] justify-end flex-shrink-0">
                  {/* Soundwave - click opens drawer */}
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setDrawerOpen(!drawerOpen)}
                    title="Очередь воспроизведения"
                    className="hidden lg:flex items-end gap-[2px] h-6 mr-1 cursor-pointer px-1.5 py-1 rounded-md hover:bg-white/5 transition-colors"
                  >
                    {[35, 55, 30, 65, 40, 70, 35, 50, 45].map((h, i) => (
                      <motion.div key={i}
                        animate={isPlaying && hasAudio ? { height: [`${h * 0.3}%`, `${h}%`, `${h * 0.5}%`] } : { height: `${h * 0.3}%` }}
                        transition={{ duration: 0.8 + i * 0.05, repeat: isPlaying && hasAudio ? Infinity : 0, ease: "easeInOut" }}
                        className="w-[2px] rounded-full bg-gradient-to-t from-[#FF577F]/40 to-[#FF577F]/80"
                        style={{ minHeight: '2px' }} />
                    ))}
                  </motion.button>

                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={() => setDrawerOpen(!drawerOpen)}
                    className="lg:hidden flex w-8 h-8 rounded-lg bg-white/5 items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-all border border-white/5">
                    <ListMusic className="w-3.5 h-3.5" />
                  </motion.button>

                  <div className="hidden md:flex items-center gap-1.5">
                    <button onClick={toggleMute} className="text-slate-500 hover:text-white transition-colors">
                      {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <div className="relative w-16 lg:w-20 h-1 bg-white/5 rounded-full overflow-hidden group cursor-pointer">
                      <div className="h-full bg-white/30 rounded-full" style={{ width: `${(isMuted ? 0 : volume) * 100}%` }} />
                      <input type="range" min="0" max="1" step="0.01" value={isMuted ? 0 : volume}
                        onChange={e => setVolume(parseFloat(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    </div>
                  </div>

                  <motion.button onClick={closePlayer} whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}
                    className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all border border-white/5">
                    <X className="w-3.5 h-3.5" />
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Donate Modal */}
      <DonateModal
        isOpen={donateOpen}
        onClose={() => setDonateOpen(false)}
        artistName={currentTrack.artist}
        trackTitle={currentTrack.title}
        trackCover={currentTrack.cover}
      />
    </div>
  );
}
