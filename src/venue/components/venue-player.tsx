/**
 * VENUE PLAYER - Полноценный музыкальный плеер для заведения
 * Enterprise UI компонент с полным управлением воспроизведением
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play, Pause, SkipForward, SkipBack, Volume2, VolumeX,
  Repeat, Repeat1, Shuffle, Music, ChevronUp, ChevronDown,
  List, X, MoreVertical, Radio, Square
} from 'lucide-react';
import { useVenuePlayer } from '../contexts/VenuePlayerContext';
import promoLogo from 'figma:asset/133ca188b414f1c29705efbbe02f340cc1bfd098.png';

interface VenuePlayerProps {
  onPlayerClick?: () => void;
}

export function VenuePlayer({ onPlayerClick }: VenuePlayerProps) {
  const player = useVenuePlayer();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showQueue, setShowQueue] = useState(false);

  // Format time (seconds to MM:SS)
  const formatTime = (seconds: number): string => {
    if (!isFinite(seconds) || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const progressPercent = player.duration > 0 
    ? (player.currentTime / player.duration) * 100 
    : 0;

  // Hide player if no track loaded (but still render to avoid context errors)
  if (!player.currentTrack) {
    return (
      <div className="hidden" aria-hidden="true">
        {/* Player hidden - no track loaded */}
      </div>
    );
  }

  return (
    <>
      {/* Compact Player (Bottom Bar) */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-xl border-t border-white/10 shadow-2xl"
      >
        {/* Progress Bar (Top of player) */}
        <div className="relative h-1 bg-white/10 cursor-pointer group"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percent = x / rect.width;
            player.seekTo(percent * player.duration);
          }}
        >
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 to-purple-600"
            style={{ width: `${progressPercent}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: `${progressPercent}%`, marginLeft: '-6px' }}
          />
        </div>

        {/* Main Player Content */}
        <div className="px-2 py-2 sm:px-4 sm:py-3">
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Track Info */}
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              {/* Album Art */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-purple-500 to-pink-500">
                <img
                  src={player.currentTrack.coverUrl || promoLogo}
                  alt={player.currentTrack.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Track Details */}
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-semibold truncate text-xs sm:text-sm md:text-base">
                  {player.currentTrack.title}
                </h4>
                <p className="text-slate-400 text-xs sm:text-sm truncate">
                  {player.currentTrack.artist}
                </p>
                {player.currentPlaylist && (
                  <p className="text-slate-500 text-xs truncate hidden sm:block">
                    {player.currentPlaylist.title}
                  </p>
                )}
              </div>

              {/* Status Badge - Hidden on mobile */}
              <div className="hidden md:flex items-center gap-2 text-xs">
                {player.isPlaying && (
                  <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 text-green-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    Playing
                  </span>
                )}
              </div>
            </div>

            {/* Controls - Center */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Shuffle - Hidden on mobile */}
              <button
                onClick={player.toggleShuffle}
                className={`hidden md:block p-2 rounded-lg transition-all ${
                  player.isShuffle
                    ? 'bg-indigo-500 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
                title="Shuffle"
              >
                <Shuffle className="w-4 h-4" />
              </button>

              {/* Previous */}
              <button
                onClick={player.previous}
                disabled={player.queue.length === 0}
                className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                title="Previous"
              >
                <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Stop - Hidden on smallest screens */}
              <button
                onClick={player.stop}
                disabled={!player.currentTrack}
                className="hidden xs:block p-1.5 sm:p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed border border-red-500/30"
                title="Stop"
              >
                <Square className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              {/* Play/Pause */}
              <button
                onClick={player.togglePlayPause}
                className="p-2 sm:p-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                title={player.isPlaying ? 'Pause' : 'Play'}
              >
                {player.isPlaying ? (
                  <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5" />
                )}
              </button>

              {/* Next */}
              <button
                onClick={player.next}
                disabled={player.queue.length === 0}
                className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                title="Next"
              >
                <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Repeat - Hidden on mobile */}
              <button
                onClick={() => {
                  const modes: Array<'off' | 'all' | 'one'> = ['off', 'all', 'one'];
                  const currentIndex = modes.indexOf(player.repeatMode);
                  const nextMode = modes[(currentIndex + 1) % modes.length];
                  player.setRepeatMode(nextMode);
                }}
                className={`hidden md:block p-2 rounded-lg transition-all ${
                  player.repeatMode !== 'off'
                    ? 'bg-indigo-500 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
                title={`Repeat: ${player.repeatMode}`}
              >
                {player.repeatMode === 'one' ? (
                  <Repeat1 className="w-4 h-4" />
                ) : (
                  <Repeat className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Time & Volume - Right - Hidden on small screens */}
            <div className="hidden lg:flex items-center gap-4">
              {/* Time */}
              <div className="text-sm text-slate-400 font-mono whitespace-nowrap">
                {formatTime(player.currentTime)} / {formatTime(player.duration)}
              </div>

              {/* Volume */}
              <div className="flex items-center gap-2">
                <button
                  onClick={player.toggleMute}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                  title={player.isMuted ? 'Unmute' : 'Mute'}
                >
                  {player.isMuted || player.volume === 0 ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>

                <div className="w-24 h-1 bg-white/10 rounded-full cursor-pointer group"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const percent = x / rect.width;
                    player.setVolume(percent);
                  }}
                >
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full relative"
                    style={{ width: `${player.volume * 100}%` }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </div>

              {/* Queue Button */}
              <button
                onClick={() => setShowQueue(!showQueue)}
                className={`p-2 rounded-lg transition-all relative ${
                  showQueue
                    ? 'bg-indigo-500 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
                title="Queue"
              >
                <List className="w-5 h-5" />
                {player.queue.length > 0 && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs font-bold bg-indigo-500 text-white rounded-full">
                    {player.queue.length}
                  </span>
                )}
              </button>

              {/* Radio Brand Button */}
              {onPlayerClick && (
                <button
                  onClick={onPlayerClick}
                  className="p-2 rounded-lg text-purple-400 hover:text-purple-300 hover:bg-purple-500/20 transition-all border border-purple-500/30"
                  title="Открыть Радиобренд"
                >
                  <Radio className="w-5 h-5" />
                </button>
              )}

              {/* Expand/Collapse */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                title={isExpanded ? 'Collapse' : 'Expand'}
              >
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5" />
                ) : (
                  <ChevronUp className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Mobile Actions - Show on medium and smaller screens */}
            <div className="flex lg:hidden items-center gap-1">
              {/* Radio Brand Button - Mobile */}
              {onPlayerClick && (
                <button
                  onClick={onPlayerClick}
                  className="p-1.5 sm:p-2 rounded-lg text-purple-400 hover:text-purple-300 hover:bg-purple-500/20 transition-all border border-purple-500/30"
                  title="Открыть Радиобренд"
                >
                  <Radio className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}

              {/* Volume/More - Mobile */}
              <button
                onClick={player.toggleMute}
                className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                title={player.isMuted ? 'Unmute' : 'Mute'}
              >
                {player.isMuted || player.volume === 0 ? (
                  <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Time Display */}
          <div className="lg:hidden mt-2 flex items-center justify-between text-xs text-slate-400 font-mono px-1">
            <span>{formatTime(player.currentTime)}</span>
            <span>{formatTime(player.duration)}</span>
          </div>
        </div>
      </motion.div>

      {/* Expanded Player Modal */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={() => setIsExpanded(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl"
            >
              <ExpandedPlayer
                player={player}
                onClose={() => setIsExpanded(false)}
                formatTime={formatTime}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Queue Sidebar */}
      <AnimatePresence>
        {showQueue && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            className="fixed right-0 top-0 bottom-0 w-96 bg-slate-900 border-l border-white/10 shadow-2xl z-50 p-6 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Queue ({player.queue.length})</h3>
              <button
                onClick={() => setShowQueue(false)}
                className="p-2 rounded-lg hover:bg-white/10 transition-all"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-2">
              {player.queue.map((track, index) => (
                <div
                  key={`${track.id}-${index}`}
                  className={`p-3 rounded-xl transition-all cursor-pointer ${
                    index === player.currentIndex
                      ? 'bg-indigo-500/20 border border-indigo-500/50'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                  onClick={() => {
                    player.loadTrack(track);
                    player.play();
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 text-sm font-mono w-6">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        {track.title}
                      </p>
                      <p className="text-slate-400 text-xs truncate">
                        {track.artist}
                      </p>
                    </div>
                    <span className="text-slate-500 text-xs">
                      {formatTime(track.duration)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {player.queue.length === 0 && (
              <div className="py-12 text-center">
                <Music className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">Queue is empty</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// =====================================================
// EXPANDED PLAYER
// =====================================================

interface ExpandedPlayerProps {
  player: ReturnType<typeof useVenuePlayer>;
  onClose: () => void;
  formatTime: (seconds: number) => string;
}

function ExpandedPlayer({ player, onClose, formatTime }: ExpandedPlayerProps) {
  const progressPercent = player.duration > 0 
    ? (player.currentTime / player.duration) * 100 
    : 0;

  return (
    <div className="relative">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-0 right-0 p-2 rounded-lg hover:bg-white/10 transition-all"
      >
        <X className="w-6 h-6 text-slate-400" />
      </button>

      {/* Album Art */}
      <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-purple-500 to-pink-500">
        <img
          src={player.currentTrack?.coverUrl || promoLogo}
          alt={player.currentTrack?.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Track Info */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          {player.currentTrack?.title}
        </h2>
        <p className="text-xl text-slate-400 mb-2">
          {player.currentTrack?.artist}
        </p>
        {player.currentPlaylist && (
          <p className="text-sm text-slate-500">
            from {player.currentPlaylist.title}
          </p>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-2">
        <div
          className="h-2 bg-white/10 rounded-full cursor-pointer group"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percent = x / rect.width;
            player.seekTo(percent * player.duration);
          }}
        >
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full relative"
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
        <div className="flex justify-between text-sm text-slate-400 font-mono mt-2">
          <span>{formatTime(player.currentTime)}</span>
          <span>{formatTime(player.duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6 mt-8">
        <button
          onClick={player.toggleShuffle}
          className={`p-3 rounded-lg transition-all ${
            player.isShuffle
              ? 'bg-indigo-500 text-white'
              : 'text-slate-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <Shuffle className="w-5 h-5" />
        </button>

        <button
          onClick={player.previous}
          className="p-4 rounded-lg text-white hover:bg-white/10 transition-all"
        >
          <SkipBack className="w-7 h-7" />
        </button>

        <button
          onClick={player.stop}
          className="p-3 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all border border-red-500/30"
        >
          <Square className="w-6 h-6" />
        </button>

        <button
          onClick={player.togglePlayPause}
          className="p-6 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 transition-all shadow-2xl hover:shadow-3xl hover:scale-105"
        >
          {player.isPlaying ? (
            <Pause className="w-8 h-8" />
          ) : (
            <Play className="w-8 h-8 ml-1" />
          )}
        </button>

        <button
          onClick={player.next}
          className="p-4 rounded-lg text-white hover:bg-white/10 transition-all"
        >
          <SkipForward className="w-7 h-7" />
        </button>

        <button
          onClick={() => {
            const modes: Array<'off' | 'all' | 'one'> = ['off', 'all', 'one'];
            const currentIndex = modes.indexOf(player.repeatMode);
            const nextMode = modes[(currentIndex + 1) % modes.length];
            player.setRepeatMode(nextMode);
          }}
          className={`p-3 rounded-lg transition-all ${
            player.repeatMode !== 'off'
              ? 'bg-indigo-500 text-white'
              : 'text-slate-400 hover:text-white hover:bg-white/10'
          }`}
        >
          {player.repeatMode === 'one' ? (
            <Repeat1 className="w-5 h-5" />
          ) : (
            <Repeat className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Volume */}
      <div className="flex items-center gap-4 mt-8">
        <button
          onClick={player.toggleMute}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
        >
          {player.isMuted || player.volume === 0 ? (
            <VolumeX className="w-5 h-5" />
          ) : (
            <Volume2 className="w-5 h-5" />
          )}
        </button>

        <div
          className="flex-1 h-2 bg-white/10 rounded-full cursor-pointer group"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percent = x / rect.width;
            player.setVolume(percent);
          }}
        >
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full relative"
            style={{ width: `${player.volume * 100}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        <span className="text-slate-400 text-sm font-mono w-12 text-right">
          {Math.round(player.volume * 100)}%
        </span>
      </div>
    </div>
  );
}