/**
 * VENUE PLAYER CONTEXT - Контекст управления музыкальным плеером заведения
 * Enterprise-система воспроизведения музыки с полным управлением
 */

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import type { Playlist, PlaylistTrack } from '../types/venue-types';

// =====================================================
// TYPES
// =====================================================

type RepeatMode = 'off' | 'all' | 'one';

interface PlayerState {
  // Current playback
  currentTrack: PlaylistTrack | null;
  currentPlaylist: Playlist | null;
  isPlaying: boolean;
  
  // Progress
  currentTime: number;
  duration: number;
  
  // Controls
  volume: number;
  isMuted: boolean;
  repeatMode: RepeatMode;
  isShuffle: boolean;
  
  // Queue
  queue: PlaylistTrack[];
  currentIndex: number;
}

interface PlayerControls {
  // Playback
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
  stop: () => void;
  
  // Navigation
  next: () => void;
  previous: () => void;
  seekTo: (time: number) => void;
  
  // Volume
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  
  // Modes
  setRepeatMode: (mode: RepeatMode) => void;
  toggleShuffle: () => void;
  
  // Playlist
  loadPlaylist: (playlist: Playlist) => void;
  loadTrack: (track: PlaylistTrack, playlist?: Playlist) => void;
  addToQueue: (track: PlaylistTrack) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
}

type VenuePlayerContextType = PlayerState & PlayerControls;

// =====================================================
// CONTEXT
// =====================================================

const VenuePlayerContext = createContext<VenuePlayerContextType | null>(null);

export function useVenuePlayer() {
  const context = useContext(VenuePlayerContext);
  if (!context) {
    throw new Error('useVenuePlayer must be used within VenuePlayerProvider');
  }
  return context;
}

// =====================================================
// PROVIDER
// =====================================================

interface VenuePlayerProviderProps {
  children: ReactNode;
}

export function VenuePlayerProvider({ children }: VenuePlayerProviderProps) {
  // Audio element ref
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<number | null>(null);

  // State
  const [state, setState] = useState<PlayerState>({
    currentTrack: null,
    currentPlaylist: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.7,
    isMuted: false,
    repeatMode: 'off',
    isShuffle: false,
    queue: [],
    currentIndex: -1,
  });

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = state.volume;

      // Event listeners
      audioRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
      audioRef.current.addEventListener('ended', handleEnded);
      audioRef.current.addEventListener('error', handleError);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audioRef.current.removeEventListener('ended', handleEnded);
        audioRef.current.removeEventListener('error', handleError);
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  // Update progress
  useEffect(() => {
    if (state.isPlaying) {
      progressIntervalRef.current = window.setInterval(() => {
        if (audioRef.current) {
          setState(prev => ({
            ...prev,
            currentTime: audioRef.current!.currentTime,
          }));
        }
      }, 100);
    } else {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [state.isPlaying]);

  // Audio event handlers
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setState(prev => ({
        ...prev,
        duration: audioRef.current!.duration,
      }));
    }
  };

  const handleEnded = () => {
    if (state.repeatMode === 'one') {
      play();
    } else {
      next();
    }
  };

  const handleError = (e: Event) => {
    console.error('Audio playback error:', e);
    setState(prev => ({ ...prev, isPlaying: false }));
  };

  // =====================================================
  // CONTROLS
  // =====================================================

  const play = () => {
    if (audioRef.current && state.currentTrack) {
      // Симуляция аудио - в реальном проекте здесь будет URL трека
      // audioRef.current.src = state.currentTrack.audioUrl;
      
      audioRef.current.play().catch(err => {
        console.error('Play error:', err);
      });
      
      setState(prev => ({ ...prev, isPlaying: true }));
      
      if (import.meta.env.DEV) {
        console.log('🎵 Playing:', state.currentTrack?.title);
      }
    }
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setState(prev => ({ ...prev, isPlaying: false }));
      
      if (import.meta.env.DEV) {
        console.log('⏸️ Paused');
      }
    }
  };

  const togglePlayPause = () => {
    if (state.isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setState(prev => ({
        ...prev,
        isPlaying: false,
        currentTime: 0,
      }));
    }
  };

  const next = () => {
    if (state.queue.length === 0) return;

    let nextIndex: number;

    if (state.isShuffle) {
      // Random track
      nextIndex = Math.floor(Math.random() * state.queue.length);
    } else {
      // Next track
      nextIndex = state.currentIndex + 1;
      if (nextIndex >= state.queue.length) {
        if (state.repeatMode === 'all') {
          nextIndex = 0;
        } else {
          stop();
          return;
        }
      }
    }

    const nextTrack = state.queue[nextIndex];
    setState(prev => ({
      ...prev,
      currentTrack: nextTrack,
      currentIndex: nextIndex,
      currentTime: 0,
    }));

    // Auto-play next track
    if (state.isPlaying) {
      setTimeout(() => play(), 100);
    }
  };

  const previous = () => {
    // If more than 3 seconds played, restart current track
    if (state.currentTime > 3) {
      seekTo(0);
      return;
    }

    if (state.queue.length === 0) return;

    let prevIndex = state.currentIndex - 1;
    if (prevIndex < 0) {
      if (state.repeatMode === 'all') {
        prevIndex = state.queue.length - 1;
      } else {
        seekTo(0);
        return;
      }
    }

    const prevTrack = state.queue[prevIndex];
    setState(prev => ({
      ...prev,
      currentTrack: prevTrack,
      currentIndex: prevIndex,
      currentTime: 0,
    }));

    // Auto-play previous track
    if (state.isPlaying) {
      setTimeout(() => play(), 100);
    }
  };

  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setState(prev => ({ ...prev, currentTime: time }));
    }
  };

  const setVolume = (volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume;
    }
    setState(prev => ({
      ...prev,
      volume: clampedVolume,
      isMuted: clampedVolume === 0,
    }));
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (state.isMuted) {
        audioRef.current.volume = state.volume;
        setState(prev => ({ ...prev, isMuted: false }));
      } else {
        audioRef.current.volume = 0;
        setState(prev => ({ ...prev, isMuted: true }));
      }
    }
  };

  const setRepeatMode = (mode: RepeatMode) => {
    setState(prev => ({ ...prev, repeatMode: mode }));
  };

  const toggleShuffle = () => {
    setState(prev => ({ ...prev, isShuffle: !prev.isShuffle }));
  };

  const loadPlaylist = (playlist: Playlist) => {
    const tracks = playlist.contentItems || [];
    
    setState(prev => ({
      ...prev,
      currentPlaylist: playlist,
      queue: tracks,
      currentTrack: tracks[0] || null,
      currentIndex: 0,
      currentTime: 0,
    }));

    if (import.meta.env.DEV) {
      console.log('🎵 Loaded playlist:', playlist.title, '- Tracks:', tracks.length);
    }
  };

  const loadTrack = (track: PlaylistTrack, playlist?: Playlist) => {
    setState(prev => ({
      ...prev,
      currentTrack: track,
      currentPlaylist: playlist || prev.currentPlaylist,
      currentTime: 0,
    }));

    if (import.meta.env.DEV) {
      console.log('🎵 Loaded track:', track.title);
    }
  };

  const addToQueue = (track: PlaylistTrack) => {
    setState(prev => ({
      ...prev,
      queue: [...prev.queue, track],
    }));
  };

  const removeFromQueue = (index: number) => {
    setState(prev => {
      const newQueue = [...prev.queue];
      newQueue.splice(index, 1);
      
      let newIndex = prev.currentIndex;
      if (index < prev.currentIndex) {
        newIndex--;
      } else if (index === prev.currentIndex) {
        newIndex = Math.min(newIndex, newQueue.length - 1);
      }

      return {
        ...prev,
        queue: newQueue,
        currentIndex: newIndex,
        currentTrack: newQueue[newIndex] || null,
      };
    });
  };

  const clearQueue = () => {
    stop();
    setState(prev => ({
      ...prev,
      queue: [],
      currentTrack: null,
      currentPlaylist: null,
      currentIndex: -1,
    }));
  };

  // =====================================================
  // CONTEXT VALUE
  // =====================================================

  const value: VenuePlayerContextType = {
    // State
    ...state,
    
    // Controls
    play,
    pause,
    togglePlayPause,
    stop,
    next,
    previous,
    seekTo,
    setVolume,
    toggleMute,
    setRepeatMode,
    toggleShuffle,
    loadPlaylist,
    loadTrack,
    addToQueue,
    removeFromQueue,
    clearQueue,
  };

  return (
    <VenuePlayerContext.Provider value={value}>
      {children}
    </VenuePlayerContext.Provider>
  );
}
