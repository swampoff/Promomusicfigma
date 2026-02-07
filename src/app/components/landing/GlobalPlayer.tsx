/**
 * GLOBAL PLAYER - Плеер внизу экрана для preview треков
 * Появляется при клике на трек в любой секции
 */

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, X, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Track {
  id: string;
  title: string;
  artist: string;
  cover?: string;
  audioUrl?: string;
}

interface GlobalPlayerProps {
  track: Track | null;
  onClose: () => void;
}

export function GlobalPlayer({ track, onClose }: GlobalPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current && track?.audioUrl) {
      audioRef.current.src = track.audioUrl;
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play();
      }
    }
  }, [track]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  };

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!track) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50"
      >
        {/* Glassmorphism backdrop with gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/98 to-slate-900/95 backdrop-blur-2xl" />
        
        {/* Animated glow line */}
        <motion.div
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent"
        />
        
        {/* Border */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        
        <div className="relative max-w-screen-2xl mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-3 sm:gap-4 md:gap-6">
            {/* Enhanced Track Info */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              {/* Enhanced Cover with glow */}
              <div className="relative flex-shrink-0 group">
                <div className="absolute -inset-1 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl opacity-50 blur-lg group-hover:opacity-75 transition-opacity" />
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl overflow-hidden bg-slate-800 shadow-2xl border border-white/10">
                  {track.cover ? (
                    <img src={track.cover} alt={track.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600/30 via-pink-600/30 to-purple-600/30">
                      <motion.div
                        animate={{ rotate: isPlaying ? 360 : 0 }}
                        transition={{ duration: 3, repeat: isPlaying ? Infinity : 0, ease: "linear" }}
                        className="text-xl sm:text-2xl"
                      >
                        🎵
                      </motion.div>
                    </div>
                  )}
                  
                  {/* Playing indicator */}
                  {isPlaying && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <div className="flex items-center gap-0.5">
                        {[...Array(3)].map((_, i) => (
                          <motion.div
                            key={i}
                            animate={{ height: ['4px', '16px', '4px'] }}
                            transition={{
                              duration: 0.8,
                              repeat: Infinity,
                              delay: i * 0.1,
                            }}
                            className="w-0.5 bg-white rounded-full"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Enhanced Info */}
              <div className="min-w-0 flex-1">
                <motion.h3
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="text-white font-bold text-sm sm:text-base truncate"
                >
                  {track.title}
                </motion.h3>
                <motion.p
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-slate-400 text-xs sm:text-sm truncate font-medium"
                >
                  {track.artist}
                </motion.p>
              </div>
            </div>

            {/* Enhanced Controls - Center */}
            <div className="hidden sm:flex flex-col items-center gap-2 flex-1 max-w-2xl">
              {/* Buttons */}
              <div className="flex items-center gap-2 md:gap-4">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-white/10"
                >
                  <SkipBack className="w-4 h-4" />
                </motion.button>

                <motion.button
                  onClick={togglePlay}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white shadow-2xl shadow-purple-500/40 hover:shadow-purple-500/60 transition-all overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 opacity-0 group-hover:opacity-30 transition-opacity" />
                  {isPlaying ? (
                    <Pause className="w-5 h-5 relative z-10" fill="white" />
                  ) : (
                    <Play className="w-5 h-5 ml-0.5 relative z-10" fill="white" />
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-white/10"
                >
                  <SkipForward className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Enhanced Progress Bar */}
              <div className="w-full flex items-center gap-2 md:gap-3">
                <span className="text-xs text-slate-500 font-mono font-medium tabular-nums">
                  {formatTime(currentTime)}
                </span>
                <div className="relative flex-1 h-1.5 sm:h-2 group">
                  <div className="absolute inset-0 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 relative"
                      style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
                    >
                      <motion.div
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      />
                    </motion.div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  {/* Hover indicator */}
                  <div className="absolute -top-1 left-0 w-full h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <span className="text-xs text-slate-500 font-mono font-medium tabular-nums">
                  {formatTime(duration)}
                </span>
              </div>
            </div>

            {/* Mobile Play Button */}
            <motion.button
              onClick={togglePlay}
              whileTap={{ scale: 0.95 }}
              className="sm:hidden relative w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white shadow-2xl shadow-purple-500/40"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" fill="white" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" fill="white" />
              )}
            </motion.button>

            {/* Enhanced Right Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Volume Control - hidden on mobile */}
              <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 backdrop-blur-xl border border-white/10">
                <Volume2 className="w-4 h-4 text-slate-400" />
                <div className="relative w-16 lg:w-20 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
                    style={{ width: `${volume * 100}%` }}
                  />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              {/* Maximize button - hidden on mobile */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="hidden sm:flex w-9 h-9 rounded-lg bg-white/5 items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-white/10"
              >
                <Maximize2 className="w-4 h-4" />
              </motion.button>

              {/* Close button */}
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all border border-white/10"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Hidden audio element */}
        <audio
          ref={audioRef}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
        />
      </motion.div>
    </AnimatePresence>
  );
}