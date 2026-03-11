/**
 * UNIFIED PLAYER CONTEXT
 * Глобальное состояние аудиоплеера для всего приложения.
 * Управляет HTML5 Audio элементом, очередью треков, прогрессом воспроизведения.
 *
 * Features: shuffle (Fisher-Yates), repeat (off/one/all), volume persistence,
 * remove/clear playlist, MediaSession API
 */

import { createContext, useContext, useState, useRef, useCallback, useEffect, ReactNode } from 'react';

export interface UnifiedTrack {
  id: string;
  title: string;
  artist: string;
  cover?: string;
  audioUrl?: string;
  duration?: string;
  originalUrl?: string; // ссылка на оригинал если нет аудио
}

export type RepeatMode = 'off' | 'one' | 'all';

interface UnifiedPlayerState {
  currentTrack: UnifiedTrack | null;
  playlist: UnifiedTrack[];
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isLoading: boolean;
  hasAudio: boolean; // true если трек имеет реальное аудио
  isShuffle: boolean;
  repeatMode: RepeatMode;
}

interface UnifiedPlayerActions {
  playTrack: (track: UnifiedTrack, playlist?: UnifiedTrack[]) => void;
  togglePlay: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  seekTo: (time: number) => void;
  seekToPercent: (pct: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  playNext: () => void;
  playPrev: () => void;
  setPlaylist: (tracks: UnifiedTrack[]) => void;
  closePlayer: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  removeTrack: (trackId: string) => void;
  clearPlaylist: () => void;
}

type UnifiedPlayerContextType = UnifiedPlayerState & UnifiedPlayerActions;

const UnifiedPlayerContext = createContext<UnifiedPlayerContextType | null>(null);

// ── Volume persistence ──
const VOLUME_KEY = 'promo_player_volume';
function loadSavedVolume(): number {
  try {
    const saved = localStorage.getItem(VOLUME_KEY);
    if (saved !== null) {
      const v = parseFloat(saved);
      if (!isNaN(v) && v >= 0 && v <= 1) return v;
    }
  } catch { /* ignore */ }
  return 0.75;
}

// ── Fisher-Yates shuffle ──
function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function UnifiedPlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTrack, setCurrentTrack] = useState<UnifiedTrack | null>(null);
  const [playlist, setPlaylistState] = useState<UnifiedTrack[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(loadSavedVolume);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasAudio, setHasAudio] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');

  // Original playlist order (for restoring after shuffle off)
  const originalPlaylistRef = useRef<UnifiedTrack[]>([]);

  // Инициализация Audio элемента
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.volume = loadSavedVolume();
    audioRef.current = audio;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDurationChange = () => setDuration(audio.duration || 0);
    const onEnded = () => {
      setIsPlaying(false);
      // Repeat / next logic
      handleTrackEnded();
    };
    const onLoadStart = () => setIsLoading(true);
    const onCanPlay = () => setIsLoading(false);
    const onError = () => {
      setIsLoading(false);
      setHasAudio(false);
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('loadstart', onLoadStart);
    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('error', onError);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('loadstart', onLoadStart);
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('error', onError);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Refs для использования в колбэках (closure-safe)
  const playlistRef = useRef<UnifiedTrack[]>([]);
  const currentTrackRef = useRef<UnifiedTrack | null>(null);
  const repeatModeRef = useRef<RepeatMode>('off');
  const isShuffleRef = useRef(false);

  useEffect(() => { playlistRef.current = playlist; }, [playlist]);
  useEffect(() => { currentTrackRef.current = currentTrack; }, [currentTrack]);
  useEffect(() => { repeatModeRef.current = repeatMode; }, [repeatMode]);
  useEffect(() => { isShuffleRef.current = isShuffle; }, [isShuffle]);

  const playTrackInternal = useCallback((track: UnifiedTrack) => {
    const audio = audioRef.current;
    if (!audio) return;

    setCurrentTrack(track);
    currentTrackRef.current = track;

    if (track.audioUrl) {
      setHasAudio(true);
      audio.src = track.audioUrl;
      audio.load();
      audio.play().catch(() => {
        setIsPlaying(false);
      });
    } else {
      setHasAudio(false);
      audio.pause();
      audio.src = '';
      setDuration(0);
      setCurrentTime(0);
      if (track.originalUrl) {
        window.open(track.originalUrl, '_blank', 'noopener,noreferrer');
      }
    }
  }, []);

  // ── Track ended handler (repeat logic) ──
  const handleTrackEnded = useCallback(() => {
    const mode = repeatModeRef.current;
    const ct = currentTrackRef.current;
    const pl = playlistRef.current;

    if (mode === 'one' && ct) {
      // Repeat current track
      playTrackInternal(ct);
      return;
    }

    if (!ct || pl.length === 0) return;
    const idx = pl.findIndex(t => t.id === ct.id);
    const isLast = idx === pl.length - 1;

    if (isLast && mode === 'off') {
      // Stop at end of playlist
      setIsPlaying(false);
      return;
    }

    // mode === 'all' or not last track — play next (wraps around)
    const next = pl[(idx + 1) % pl.length];
    if (next) playTrackInternal(next);
  }, [playTrackInternal]);

  const playTrack = useCallback((track: UnifiedTrack, newPlaylist?: UnifiedTrack[]) => {
    if (newPlaylist) {
      originalPlaylistRef.current = newPlaylist;
      const pl = isShuffleRef.current ? shuffleArray(newPlaylist) : newPlaylist;
      setPlaylistState(pl);
      playlistRef.current = pl;
    }
    playTrackInternal(track);
  }, [playTrackInternal]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !hasAudio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
  }, [isPlaying, hasAudio]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const resume = useCallback(() => {
    if (hasAudio) audioRef.current?.play().catch(() => {});
  }, [hasAudio]);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  const seekTo = useCallback((time: number) => {
    const audio = audioRef.current;
    if (audio && hasAudio) {
      audio.currentTime = Math.max(0, Math.min(time, audio.duration || 0));
    }
  }, [hasAudio]);

  const seekToPercent = useCallback((pct: number) => {
    const audio = audioRef.current;
    if (audio && hasAudio && audio.duration) {
      audio.currentTime = (pct / 100) * audio.duration;
    }
  }, [hasAudio]);

  const setVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setVolumeState(clamped);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
    if (clamped > 0) setIsMuted(false);
    // Persist
    try { localStorage.setItem(VOLUME_KEY, String(clamped)); } catch { /* ignore */ }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      if (audioRef.current) {
        audioRef.current.muted = next;
      }
      return next;
    });
  }, []);

  const playNext = useCallback(() => {
    if (!currentTrack || playlist.length === 0) return;
    const idx = playlist.findIndex(t => t.id === currentTrack.id);
    const next = playlist[(idx + 1) % playlist.length];
    if (next) playTrackInternal(next);
  }, [currentTrack, playlist, playTrackInternal]);

  const playPrev = useCallback(() => {
    if (!currentTrack || playlist.length === 0) return;
    // If more than 3 seconds in, restart current track
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }
    const idx = playlist.findIndex(t => t.id === currentTrack.id);
    const prev = playlist[(idx - 1 + playlist.length) % playlist.length];
    if (prev) playTrackInternal(prev);
  }, [currentTrack, playlist, playTrackInternal]);

  const setPlaylist = useCallback((tracks: UnifiedTrack[]) => {
    originalPlaylistRef.current = tracks;
    const pl = isShuffleRef.current ? shuffleArray(tracks) : tracks;
    setPlaylistState(pl);
    playlistRef.current = pl;
  }, []);

  const closePlayer = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.src = '';
    }
    setCurrentTrack(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setHasAudio(false);
  }, []);

  // ── Shuffle toggle ──
  const toggleShuffle = useCallback(() => {
    setIsShuffle(prev => {
      const next = !prev;
      isShuffleRef.current = next;
      const original = originalPlaylistRef.current;
      if (next) {
        // Shuffle, but keep current track at the top
        const ct = currentTrackRef.current;
        const rest = original.filter(t => t.id !== ct?.id);
        const shuffled = ct ? [ct, ...shuffleArray(rest)] : shuffleArray(original);
        setPlaylistState(shuffled);
        playlistRef.current = shuffled;
      } else {
        // Restore original order
        setPlaylistState(original);
        playlistRef.current = original;
      }
      return next;
    });
  }, []);

  // ── Repeat cycle: off → all → one → off ──
  const cycleRepeat = useCallback(() => {
    setRepeatMode(prev => {
      const next = prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off';
      repeatModeRef.current = next;
      return next;
    });
  }, []);

  // ── Remove track from playlist ──
  const removeTrack = useCallback((trackId: string) => {
    setPlaylistState(prev => {
      const updated = prev.filter(t => t.id !== trackId);
      playlistRef.current = updated;
      return updated;
    });
    originalPlaylistRef.current = originalPlaylistRef.current.filter(t => t.id !== trackId);
    // If removing current track, play next
    if (currentTrackRef.current?.id === trackId) {
      const pl = playlistRef.current;
      if (pl.length > 0) {
        playTrackInternal(pl[0]);
      } else {
        closePlayer();
      }
    }
  }, [playTrackInternal, closePlayer]);

  // ── Clear playlist ──
  const clearPlaylist = useCallback(() => {
    closePlayer();
    setPlaylistState([]);
    playlistRef.current = [];
    originalPlaylistRef.current = [];
  }, [closePlayer]);

  // MediaSession API для системных уведомлений
  useEffect(() => {
    if (!currentTrack || !('mediaSession' in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.title,
      artist: currentTrack.artist,
      artwork: currentTrack.cover ? [{ src: currentTrack.cover, sizes: '256x256', type: 'image/png' }] : [],
    });
    navigator.mediaSession.setActionHandler('play', () => resume());
    navigator.mediaSession.setActionHandler('pause', () => pause());
    navigator.mediaSession.setActionHandler('previoustrack', () => playPrev());
    navigator.mediaSession.setActionHandler('nexttrack', () => playNext());
  }, [currentTrack, resume, pause, playPrev, playNext]);

  const value: UnifiedPlayerContextType = {
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
    playTrack,
    togglePlay,
    pause,
    resume,
    stop,
    seekTo,
    seekToPercent,
    setVolume,
    toggleMute,
    playNext,
    playPrev,
    setPlaylist,
    closePlayer,
    toggleShuffle,
    cycleRepeat,
    removeTrack,
    clearPlaylist,
  };

  return (
    <UnifiedPlayerContext.Provider value={value}>
      {children}
    </UnifiedPlayerContext.Provider>
  );
}

export function useUnifiedPlayer() {
  const ctx = useContext(UnifiedPlayerContext);
  if (!ctx) {
    throw new Error('useUnifiedPlayer must be used within UnifiedPlayerProvider');
  }
  return ctx;
}

export function useUnifiedPlayerSafe() {
  return useContext(UnifiedPlayerContext);
}
