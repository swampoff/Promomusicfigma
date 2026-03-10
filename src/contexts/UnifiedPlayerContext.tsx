/**
 * UNIFIED PLAYER CONTEXT
 * Глобальное состояние аудиоплеера для всего приложения.
 * Управляет HTML5 Audio элементом, очередью треков, прогрессом воспроизведения.
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
}

type UnifiedPlayerContextType = UnifiedPlayerState & UnifiedPlayerActions;

const UnifiedPlayerContext = createContext<UnifiedPlayerContextType | null>(null);

export function UnifiedPlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTrack, setCurrentTrack] = useState<UnifiedTrack | null>(null);
  const [playlist, setPlaylistState] = useState<UnifiedTrack[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.75);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasAudio, setHasAudio] = useState(false);

  // Инициализация Audio элемента
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.volume = 0.75;
    audioRef.current = audio;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDurationChange = () => setDuration(audio.duration || 0);
    const onEnded = () => {
      setIsPlaying(false);
      // Автоматически переход к следующему треку
      playNextInternal();
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

  // Ref для playlist чтобы использовать в колбэке onEnded
  const playlistRef = useRef<UnifiedTrack[]>([]);
  const currentTrackRef = useRef<UnifiedTrack | null>(null);
  useEffect(() => { playlistRef.current = playlist; }, [playlist]);
  useEffect(() => { currentTrackRef.current = currentTrack; }, [currentTrack]);

  const playNextInternal = useCallback(() => {
    const pl = playlistRef.current;
    const ct = currentTrackRef.current;
    if (!ct || pl.length === 0) return;
    const idx = pl.findIndex(t => t.id === ct.id);
    const next = pl[(idx + 1) % pl.length];
    if (next && next.id !== ct.id) {
      playTrackInternal(next);
    }
  }, []);

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
        // Autoplay может быть заблокировано
        setIsPlaying(false);
      });
    } else {
      // Нет аудио URL - если есть originalUrl, откроем его
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

  const playTrack = useCallback((track: UnifiedTrack, newPlaylist?: UnifiedTrack[]) => {
    if (newPlaylist) {
      setPlaylistState(newPlaylist);
      playlistRef.current = newPlaylist;
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
    const idx = playlist.findIndex(t => t.id === currentTrack.id);
    const prev = playlist[(idx - 1 + playlist.length) % playlist.length];
    if (prev) playTrackInternal(prev);
  }, [currentTrack, playlist, playTrackInternal]);

  const setPlaylist = useCallback((tracks: UnifiedTrack[]) => {
    setPlaylistState(tracks);
    playlistRef.current = tracks;
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
