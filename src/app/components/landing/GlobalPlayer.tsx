/**
 * GLOBAL PLAYER - Glassmorphism плеер с Playlist Drawer и Full-screen Mobile
 * 
 * Функции:
 * - Mini-bar (desktop/mobile) - фиксированный внизу
 * - Playlist Drawer - при клике на soundwave открывается очередь
 * - Fullscreen Mobile - свайп вверх раскрывает полноэкранный плеер
 * - Демо-режим с симулированным прогрессом
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  X, Heart, Share2, Music, Repeat, Shuffle, ChevronDown,
  ChevronUp, ListMusic, MoreHorizontal, Clock
} from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';

export interface PlayerTrack {
  id: string;
  title: string;
  artist: string;
  cover?: string;
  duration?: string;
  audioUrl?: string;
}

interface GlobalPlayerProps {
  track: PlayerTrack | null;
  playlist?: PlayerTrack[];
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  onPlayTrack?: (track: PlayerTrack) => void;
  onArtistClick?: (artistName: string) => void;
}

export function GlobalPlayer({ track, playlist = [], onClose, onNext, onPrev, onPlayTrack, onArtistClick }: GlobalPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration] = useState(210);
  const [volume, setVolume] = useState(0.75);
  const [isMuted, setIsMuted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dragY = useMotionValue(0);
  const fullscreenOpacity = useTransform(dragY, [-150, 0], [1, 0]);

  // Simulate playback
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 0.5;
        });
      }, 500);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, duration]);

  useEffect(() => {
    if (track) { setCurrentTime(0); setIsPlaying(true); }
  }, [track?.id]);

  // Close fullscreen on escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (fullscreenOpen) setFullscreenOpen(false);
        else if (drawerOpen) setDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [fullscreenOpen, drawerOpen]);

  const togglePlay = useCallback(() => setIsPlaying(p => !p), []);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setCurrentTime(pct * duration);
  }, [duration]);

  const formatTime = (t: number) => {
    if (!t || isNaN(t)) return '0:00';
    return `${Math.floor(t / 60)}:${Math.floor(t % 60).toString().padStart(2, '0')}`;
  };

  // Swipe handler for mobile
  const handleDragEnd = (_: any, info: { offset: { x: number; y: number }; velocity: { x: number; y: number } }) => {
    if (info.offset.y < -80) {
      setFullscreenOpen(true);
    }
  };

  const handleFullscreenDragEnd = (_: any, info: { offset: { x: number; y: number }; velocity: { x: number; y: number } }) => {
    if (info.offset.y > 80) {
      setFullscreenOpen(false);
    }
  };

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!track) return null;

  const currentIdx = playlist.findIndex(t => t.id === track.id);

  return (
    <div className="contents">
      {/* === PLAYLIST DRAWER (Desktop) === */}
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
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <ListMusic className="w-4 h-4 text-[#FF577F]" />
                  <h3 className="text-sm font-bold">Очередь воспроизведения</h3>
                  <span className="text-[10px] text-slate-500 bg-white/5 px-1.5 py-0.5 rounded-md font-mono">{playlist.length}</span>
                </div>
                <button onClick={() => setDrawerOpen(false)} className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                  <X className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>

              {/* Now Playing */}
              <div className="px-4 py-3 bg-[#FF577F]/5 border-b border-white/5">
                <div className="text-[10px] text-[#FF577F] font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-[#FF577F] rounded-full animate-pulse" />
                  Сейчас играет
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FF577F]/30 to-purple-500/30 border border-[#FF577F]/20 flex items-center justify-center flex-shrink-0">
                    <Music className="w-4 h-4 text-[#FF577F]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white truncate">{track.title}</p>
                    <button onClick={(e) => { e.stopPropagation(); onArtistClick?.(track.artist); }} className="text-xs text-slate-400 truncate hover:text-[#FF577F] transition-colors text-left w-full block">{track.artist}</button>
                  </div>
                  <div className="flex items-end gap-[2px] h-4">
                    {[0, 1, 2].map(i => (
                      <motion.div
                        key={i}
                        animate={isPlaying ? { height: ['3px', '14px', '3px'] } : { height: '3px' }}
                        transition={{ duration: 0.7, repeat: isPlaying ? Infinity : 0, delay: i * 0.15 }}
                        className="w-[2px] bg-[#FF577F] rounded-full"
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Playlist Items */}
              <div className="flex-1 overflow-y-auto scrollbar-hide">
                <div className="px-2 py-2">
                  <div className="text-[10px] text-slate-600 font-bold uppercase tracking-wider px-2 mb-2">Далее</div>
                  {playlist.length > 0 ? playlist.map((item, idx) => (
                    <motion.button
                      key={`${item.id}-${idx}`}
                      whileHover={{ x: 3, backgroundColor: 'rgba(255,255,255,0.05)' }}
                      onClick={() => onPlayTrack?.(item)}
                      className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg transition-all group ${
                        item.id === track.id ? 'bg-[#FF577F]/10' : ''
                      }`}
                    >
                      <span className="w-5 text-center text-[10px] text-slate-600 font-mono">
                        {item.id === track.id ? (
                          <div className="flex items-end justify-center gap-[1px] h-3">
                            {[0, 1, 2].map(i => (
                              <motion.div
                                key={i}
                                animate={isPlaying ? { height: ['2px', '10px', '2px'] } : { height: '2px' }}
                                transition={{ duration: 0.6, repeat: isPlaying ? Infinity : 0, delay: i * 0.12 }}
                                className="w-[1.5px] bg-[#FF577F] rounded-full"
                              />
                            ))}
                          </div>
                        ) : idx + 1}
                      </span>
                      <div className="w-8 h-8 rounded-md bg-white/5 flex items-center justify-center flex-shrink-0 border border-white/5">
                        <Music className={`w-3.5 h-3.5 ${item.id === track.id ? 'text-[#FF577F]' : 'text-slate-600'}`} />
                      </div>
                      <div className="min-w-0 flex-1 text-left">
                        <p className={`text-xs font-bold truncate ${item.id === track.id ? 'text-[#FF577F]' : 'text-white'}`}>{item.title}</p>
                        <p className="text-[10px] text-slate-500 truncate">{item.artist}</p>
                      </div>
                      <span className="text-[10px] text-slate-600 font-mono opacity-0 group-hover:opacity-100 transition-opacity">{item.duration || '3:20'}</span>
                    </motion.button>
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
                  <button
                    onClick={() => setIsShuffle(!isShuffle)}
                    className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${isShuffle ? 'bg-[#FF577F]/20 text-[#FF577F]' : 'bg-white/5 text-slate-500 hover:text-white'}`}
                  >
                    <Shuffle className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setIsRepeat(!isRepeat)}
                    className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${isRepeat ? 'bg-[#FF577F]/20 text-[#FF577F]' : 'bg-white/5 text-slate-500 hover:text-white'}`}
                  >
                    <Repeat className="w-3 h-3" />
                  </button>
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
            {/* Background art */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gradient-to-br from-[#FF577F]/20 to-purple-500/20 rounded-full blur-[120px]" />
              <div className="absolute bottom-1/3 left-1/4 w-[300px] h-[300px] bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full blur-[80px]" />
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
                <p className="text-xs text-slate-400 mt-0.5">из очереди</p>
              </div>
              <button className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center">
                <MoreHorizontal className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Cover Art */}
            <div className="relative flex-1 flex items-center justify-center px-10">
              <motion.div
                animate={isPlaying ? { scale: [1, 1.02, 1] } : { scale: 1 }}
                transition={{ duration: 3, repeat: isPlaying ? Infinity : 0, ease: "easeInOut" }}
                className="relative w-full max-w-[320px] aspect-square"
              >
                <div className="absolute -inset-4 bg-gradient-to-br from-[#FF577F]/30 to-purple-500/30 rounded-3xl blur-2xl" />
                <div className="relative w-full h-full rounded-3xl bg-gradient-to-br from-[#FF577F]/20 to-purple-500/20 border border-white/10 flex items-center justify-center overflow-hidden">
                  {/* Animated rings */}
                  {isPlaying && (
                    <div className="contents">
                      <motion.div
                        animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.3, 0.1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute w-32 h-32 rounded-full border border-[#FF577F]/20"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.5, 1], opacity: [0.05, 0.2, 0.05] }}
                        transition={{ duration: 2.5, repeat: Infinity, delay: 0.3 }}
                        className="absolute w-48 h-48 rounded-full border border-purple-500/15"
                      />
                    </div>
                  )}
                  <motion.div
                    animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
                    transition={{ duration: 8, repeat: isPlaying ? Infinity : 0, ease: "linear" }}
                  >
                    <Music className="w-16 h-16 text-[#FF577F]/60" />
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Track Info */}
            <div className="relative px-8 pt-6 pb-2">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-black text-white truncate">{track.title}</h2>
                  <button onClick={() => onArtistClick?.(track.artist)} className="text-sm text-slate-400 mt-0.5 hover:text-[#FF577F] transition-colors text-left truncate">
                    {track.artist}
                  </button>
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

            {/* Progress Bar */}
            <div className="relative px-8 py-3">
              <div className="h-1.5 rounded-full bg-white/5 cursor-pointer" onClick={handleSeek}>
                <div className="h-full rounded-full bg-gradient-to-r from-[#FF577F] to-purple-500 relative" style={{ width: `${pct}%` }}>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-lg shadow-[#FF577F]/30 -mr-2" />
                </div>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[10px] text-slate-600 font-mono">{formatTime(currentTime)}</span>
                <span className="text-[10px] text-slate-600 font-mono">{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="relative flex items-center justify-center gap-6 px-8 py-4">
              <button onClick={() => setIsShuffle(!isShuffle)} className={`transition-colors ${isShuffle ? 'text-[#FF577F]' : 'text-slate-600'}`}>
                <Shuffle className="w-5 h-5" />
              </button>
              <motion.button whileTap={{ scale: 0.9 }} onClick={onPrev} className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                <SkipBack className="w-5 h-5 text-white" />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={togglePlay}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF577F] to-purple-500 flex items-center justify-center shadow-xl shadow-[#FF577F]/30"
              >
                {isPlaying ? <Pause className="w-7 h-7 text-white" fill="white" /> : <Play className="w-7 h-7 text-white ml-1" fill="white" />}
              </motion.button>
              <motion.button whileTap={{ scale: 0.9 }} onClick={onNext} className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                <SkipForward className="w-5 h-5 text-white" />
              </motion.button>
              <button onClick={() => setIsRepeat(!isRepeat)} className={`transition-colors ${isRepeat ? 'text-[#FF577F]' : 'text-slate-600'}`}>
                <Repeat className="w-5 h-5" />
              </button>
            </div>

            {/* Bottom actions */}
            <div className="relative flex items-center justify-center gap-8 px-8 pt-2 pb-10">
              <button className="text-slate-600 hover:text-white transition-colors">
                <Share2 className="w-5 h-5" />
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
          className="fixed bottom-0 left-0 right-0 z-[90] lg:left-60 xl:left-64 2xl:left-72"
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-2xl" />
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/5">
            <div className="h-full bg-gradient-to-r from-[#FF577F] via-purple-500 to-[#FF577F]" style={{ width: `${pct}%` }} />
          </div>
          {isPlaying && (
            <motion.div animate={{ x: ['-100%', '100%'] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="absolute top-0 left-0 w-1/3 h-[2px] bg-gradient-to-r from-transparent via-[#FF577F] to-transparent" />
          )}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {/* MOBILE mini-bar with swipe */}
          <motion.div
            className="relative sm:hidden"
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.3}
            onDragEnd={handleDragEnd}
          >
            <div className="px-3 py-2.5">
              {/* Swipe hint */}
              <div className="flex justify-center mb-1">
                <div className="w-8 h-0.5 rounded-full bg-white/10" />
              </div>
              <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0">
                  <div className="w-11 h-11 rounded-lg overflow-hidden bg-gradient-to-br from-[#FF577F]/30 to-purple-500/30 border border-white/10 flex items-center justify-center">
                    {isPlaying && (
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-10">
                        <div className="flex items-end gap-[2px] h-4">
                          {[0, 1, 2].map(i => (
                            <motion.div key={i} animate={{ height: ['3px', '14px', '3px'] }}
                              transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
                              className="w-[2px] bg-white rounded-full" />
                          ))}
                        </div>
                      </div>
                    )}
                    <Music className="w-5 h-5 text-[#FF577F]" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{track.title}</p>
                  <button onClick={(e) => { e.stopPropagation(); onArtistClick?.(track.artist); }} className="text-[10px] text-slate-500 truncate hover:text-[#FF577F] transition-colors text-left w-full block">{track.artist}</button>
                </div>
                <div className="flex items-center gap-1.5">
                  <motion.button onClick={() => setIsLiked(!isLiked)} whileTap={{ scale: 0.85 }} className="w-8 h-8 rounded-full flex items-center justify-center">
                    <Heart className={`w-4 h-4 transition-colors ${isLiked ? 'text-[#FF577F] fill-[#FF577F]' : 'text-slate-500'}`} />
                  </motion.button>
                  <motion.button onClick={togglePlay} whileTap={{ scale: 0.9 }}
                    className="w-9 h-9 rounded-full bg-gradient-to-br from-[#FF577F] to-purple-500 flex items-center justify-center shadow-lg shadow-[#FF577F]/20">
                    {isPlaying ? <Pause className="w-4 h-4 text-white" fill="white" /> : <Play className="w-4 h-4 text-white ml-0.5" fill="white" />}
                  </motion.button>
                  <motion.button onClick={onClose} whileTap={{ scale: 0.85 }} className="w-8 h-8 rounded-full flex items-center justify-center">
                    <X className="w-4 h-4 text-slate-500" />
                  </motion.button>
                </div>
              </div>
              <div className="mt-2 h-1 rounded-full bg-white/5 cursor-pointer" onClick={handleSeek}>
                <div className="h-full rounded-full bg-gradient-to-r from-[#FF577F] to-purple-500 transition-all duration-300" style={{ width: `${pct}%` }} />
              </div>
            </div>
          </motion.div>

          {/* DESKTOP mini-bar */}
          <div className="relative hidden sm:block">
            <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-3">
              <div className="flex items-center gap-4 md:gap-6">
                {/* Left: Track Info */}
                <div className="flex items-center gap-3 min-w-0 w-[200px] md:w-[280px] flex-shrink-0">
                  <div className="relative flex-shrink-0 group">
                    <div className="absolute -inset-1 bg-gradient-to-br from-[#FF577F] to-purple-500 rounded-xl opacity-30 blur-lg group-hover:opacity-50 transition-opacity" />
                    <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden bg-gradient-to-br from-[#FF577F]/30 to-purple-500/30 border border-white/10 flex items-center justify-center shadow-2xl">
                      {isPlaying && (
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-10">
                          <div className="flex items-end gap-[2px] h-5">
                            {[0, 1, 2, 3].map(i => (
                              <motion.div key={i} animate={{ height: ['3px', '16px', '3px'] }}
                                transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.12, ease: "easeInOut" }}
                                className="w-[2px] bg-white rounded-full" />
                            ))}
                          </div>
                        </div>
                      )}
                      <motion.div
                        animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
                        transition={{ duration: 3, repeat: isPlaying ? Infinity : 0, ease: "linear" }}
                      >
                        <Music className="w-6 h-6 text-[#FF577F]" />
                      </motion.div>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white truncate">{track.title}</p>
                    <button onClick={(e) => { e.stopPropagation(); onArtistClick?.(track.artist); }} className="text-xs text-slate-400 truncate hover:text-[#FF577F] transition-colors text-left w-full block">{track.artist}</button>
                  </div>
                  <motion.button onClick={() => setIsLiked(!isLiked)} whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.85 }} className="flex-shrink-0 hidden md:block">
                    <Heart className={`w-4 h-4 transition-colors ${isLiked ? 'text-[#FF577F] fill-[#FF577F]' : 'text-slate-600 hover:text-slate-400'}`} />
                  </motion.button>
                </div>

                {/* Center: Controls + Progress */}
                <div className="flex flex-col items-center gap-1.5 flex-1 max-w-2xl">
                  <div className="flex items-center gap-3 md:gap-4">
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setIsShuffle(!isShuffle)}
                      className={`hidden md:flex w-8 h-8 rounded-full items-center justify-center transition-all ${isShuffle ? 'text-[#FF577F]' : 'text-slate-500 hover:text-white'}`}>
                      <Shuffle className="w-3.5 h-3.5" />
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onPrev}
                      className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-white/5">
                      <SkipBack className="w-4 h-4" />
                    </motion.button>
                    <motion.button onClick={togglePlay} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
                      className="relative w-10 h-10 md:w-11 md:h-11 rounded-full bg-gradient-to-br from-[#FF577F] to-purple-500 flex items-center justify-center text-white shadow-xl shadow-[#FF577F]/25 hover:shadow-[#FF577F]/40 transition-all">
                      {isPlaying ? <Pause className="w-5 h-5" fill="white" /> : <Play className="w-5 h-5 ml-0.5" fill="white" />}
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onNext}
                      className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-white/5">
                      <SkipForward className="w-4 h-4" />
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setIsRepeat(!isRepeat)}
                      className={`hidden md:flex w-8 h-8 rounded-full items-center justify-center transition-all ${isRepeat ? 'text-[#FF577F]' : 'text-slate-500 hover:text-white'}`}>
                      <Repeat className="w-3.5 h-3.5" />
                    </motion.button>
                  </div>
                  <div className="w-full flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 font-mono tabular-nums w-8 text-right">{formatTime(currentTime)}</span>
                    <div className="relative flex-1 h-1 group cursor-pointer rounded-full" onClick={handleSeek}>
                      <div className="absolute inset-0 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#FF577F] to-purple-500 rounded-full relative" style={{ width: `${pct}%` }}>
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
                </div>

                {/* Right: Volume + Soundwave (clickable) + Actions */}
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
                        animate={isPlaying ? { height: [`${h * 0.3}%`, `${h}%`, `${h * 0.5}%`] } : { height: `${h * 0.3}%` }}
                        transition={{ duration: 0.8 + i * 0.05, repeat: isPlaying ? Infinity : 0, ease: "easeInOut" }}
                        className="w-[2px] rounded-full bg-gradient-to-t from-[#FF577F]/40 to-[#FF577F]/80"
                        style={{ minHeight: '2px' }} />
                    ))}
                  </motion.button>

                  {/* Playlist button (small screens) */}
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={() => setDrawerOpen(!drawerOpen)}
                    className="lg:hidden flex w-8 h-8 rounded-lg bg-white/5 items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-all border border-white/5">
                    <ListMusic className="w-3.5 h-3.5" />
                  </motion.button>

                  <div className="hidden md:flex items-center gap-1.5">
                    <button onClick={() => setIsMuted(!isMuted)} className="text-slate-500 hover:text-white transition-colors">
                      {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <div className="relative w-16 lg:w-20 h-1 bg-white/5 rounded-full overflow-hidden group cursor-pointer">
                      <div className="h-full bg-white/30 rounded-full" style={{ width: `${(isMuted ? 0 : volume) * 100}%` }} />
                      <input type="range" min="0" max="1" step="0.01" value={isMuted ? 0 : volume}
                        onChange={e => { setVolume(parseFloat(e.target.value)); setIsMuted(false); }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    </div>
                  </div>

                  <motion.button onClick={onClose} whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}
                    className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all border border-white/5">
                    <X className="w-3.5 h-3.5" />
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}